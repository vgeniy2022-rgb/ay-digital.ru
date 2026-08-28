import JSZip from 'jszip';
import { Render } from '@puckeditor/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { studioConfig, getStudioMetadata } from '../editor/studioConfig';
import { migrateProject } from '../schema/migrations';
import type { SiteBuilderProject, StoredStudioAsset } from '../schema/types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeFilename(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9а-яё._-]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'asset';
}

function collectStudioCss() {
  const chunks: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = Array.from(sheet.cssRules || []).map((rule) => rule.cssText).filter((rule) => rule.includes('.sv-') || rule.includes('--sv-'));
      chunks.push(...rules);
    } catch {
      // Cross-origin stylesheets are intentionally ignored.
    }
  }
  return chunks.join('\n');
}

export function exportProjectJson(project: SiteBuilderProject) {
  downloadBlob(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }), `${safeFilename(project.name)}.sitevl.json`);
}

export async function importProjectFile(file: File) {
  if (file.size > 10 * 1024 * 1024) throw new Error('JSON проекта не должен превышать 10 МБ.');
  const parsed = JSON.parse(await file.text()) as unknown;
  const project = migrateProject(parsed);
  return { ...project, id: crypto.randomUUID ? `project-${crypto.randomUUID()}` : project.id, name: `${project.name} — импорт` };
}

export async function createStaticSiteZip(project: SiteBuilderProject, assets: StoredStudioAsset[]) {
  const zip = new JSZip();
  const assetUrls: Record<string, string> = {};
  const usedNames = new Set<string>();

  for (const asset of assets) {
    const extension = asset.type === 'image/webp' ? 'webp' : asset.type === 'image/png' ? 'png' : 'jpg';
    let filename = `${safeFilename(asset.name.replace(/\.[^.]+$/, ''))}.${extension}`;
    let index = 2;
    while (usedNames.has(filename)) filename = `${safeFilename(asset.name.replace(/\.[^.]+$/, ''))}-${index++}.${extension}`;
    usedNames.add(filename);
    assetUrls[asset.id] = `assets/${filename}`;
    zip.file(`assets/${filename}`, asset.blob);
  }

  const stylesheet = collectStudioCss();
  zip.file('assets/site.css', stylesheet || 'body{margin:0;font-family:Arial,sans-serif}.sv-site{min-height:100vh}');

  project.pages.forEach((page) => {
    const body = renderToStaticMarkup(<Render config={studioConfig} data={page.data} metadata={getStudioMetadata(project.theme, assetUrls)} />);
    const filename = page.isHome ? 'index.html' : `${page.slug || page.id}.html`;
    const canonicalPath = page.isHome ? './' : `./${filename}`;
    const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(page.metaDescription)}">
  <meta name="robots" content="${page.noindex ? 'noindex, nofollow' : 'index, follow'}">
  <link rel="canonical" href="${canonicalPath}">
  <link rel="stylesheet" href="assets/site.css">
  <title>${escapeHtml(page.title)}</title>
</head>
<body>${body}</body>
</html>`;
    zip.file(filename, html);
  });

  zip.file('project.sitevl.json', JSON.stringify(project, null, 2));
  zip.file('README.txt', [
    `Проект: ${project.name}`,
    'Экспортирован из SITEVL Studio.',
    '',
    'Как открыть:',
    '1. Распакуйте ZIP.',
    '2. Откройте index.html в браузере.',
    '3. Для корректной навигации между страницами рекомендуется локальный HTTP-сервер.',
    '',
    'Интерактивные формы не отправляют данные без подключённого backend.',
    'Файл project.sitevl.json можно снова импортировать в SITEVL Studio.',
  ].join('\n'));

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  downloadBlob(blob, `${safeFilename(project.name)}-site.zip`);
}

export async function createOwnerBundle(project: SiteBuilderProject, assets: StoredStudioAsset[], contact: Record<string, string>, thumbnail?: Blob) {
  const zip = new JSZip();
  zip.file('project.sitevl.json', JSON.stringify(project, null, 2));
  zip.file('contact.json', JSON.stringify(contact, null, 2));
  zip.file('assets.json', JSON.stringify(project.assets, null, 2));
  assets.forEach((asset) => zip.file(`assets/${asset.id}-${safeFilename(asset.name)}`, asset.blob));
  if (thumbnail) zip.file('thumbnail.png', thumbnail);
  zip.file('README.txt', 'Полный bundle проекта SITEVL Studio для передачи Александру. Облачная отправка не выполнялась: передайте этот ZIP вручную или через согласованный мессенджер.');
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  downloadBlob(blob, `${safeFilename(project.name)}-for-sitevl.zip`);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character] || character));
}

