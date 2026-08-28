import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { studioComponentNames } from '../editor/componentCatalog';
import { createResponsiveCss, resolveResponsiveSettings } from '../responsive/styleResolver';
import { createProjectFromTemplate, studioTemplates } from '../templates/templates';
import { normalizeSlug } from '../utils/id';
import { defaultStudioTheme } from './defaults';
import { convertLegacyDraftToProject, migrateProject } from './migrations';
import { SITE_BUILDER_SCHEMA_VERSION } from './types';

test('six templates produce valid versioned projects', () => {
  assert.equal(studioTemplates.length, 6);
  studioTemplates.forEach((template) => {
    const project = createProjectFromTemplate(template.id);
    assert.equal(project.schemaVersion, SITE_BUILDER_SCHEMA_VERSION);
    assert.ok(project.pages.length >= 1);
    assert.equal(project.pages.filter((page) => page.isHome).length, 1);
    assert.ok(project.pages.every((page) => Array.isArray(page.data.content)));
  });
});

test('Studio exposes the complete typed component catalogue', () => {
  const expected = [
    'Section', 'Container', 'VerticalStack', 'HorizontalStack', 'Grid', 'Columns', 'Card', 'Spacer', 'Divider',
    'Heading', 'RichText', 'Button', 'Image', 'Icon', 'Video', 'Badge', 'List', 'Quote',
    'Header', 'Hero', 'Services', 'Features', 'Pricing', 'Portfolio', 'Gallery', 'Steps', 'Stats', 'Reviews',
    'Team', 'FAQ', 'Contact', 'LeadForm', 'MapPlaceholder', 'Footer',
  ];
  assert.deepEqual([...studioComponentNames].sort(), expected.sort());
});

test('all bundled template images exist in public assets', () => {
  const imagePaths = new Set<string>();
  const collect = (value: unknown) => {
    if (typeof value === 'string' && value.startsWith('/images/')) imagePaths.add(value);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === 'object') Object.values(value).forEach(collect);
  };
  studioTemplates.forEach((template) => collect(createProjectFromTemplate(template.id)));
  assert.ok(imagePaths.size > 0);
  imagePaths.forEach((path) => assert.ok(existsSync(join(process.cwd(), 'public', path)), `Missing template asset: ${path}`));
});

test('project migration rejects future schemas and preserves a valid project', () => {
  const project = createProjectFromTemplate('specialist');
  assert.equal(migrateProject(project).id, project.id);
  assert.throws(() => migrateProject({ ...project, schemaVersion: SITE_BUILDER_SCHEMA_VERSION + 1 }), /более новой версии/);
});

test('legacy draft becomes a non-destructive Studio project', () => {
  const project = convertLegacyDraftToProject(JSON.stringify({ draft: { brand: 'Legacy brand', title: 'Legacy title', description: 'Описание', services: [{ title: 'Услуга', text: 'Текст', price: '1 000 ₽' }] } }));
  assert.equal(project.templateId, 'legacy');
  assert.equal(project.name, 'Legacy brand');
  assert.ok(project.pages[0].data.content.some((block) => block.type === 'Services'));
});

test('responsive settings inherit from large to small breakpoints', () => {
  const resolved = resolveResponsiveSettings({ desktop: { display: 'grid', columns: 3 }, tablet: { columns: 2 }, mobile: { columns: 1 } }, 'mobile');
  assert.equal(resolved.display, 'grid');
  assert.equal(resolved.columns, 1);
});

test('responsive CSS strips unsafe free-form CSS fragments', () => {
  const css = createResponsiveCss('safe-id', { desktop: { background: 'red;}body{display:none' }, mobile: { columns: 1 } }, defaultStudioTheme);
  assert.ok(!css.includes('body'));
  assert.match(css, /repeat\(1,minmax\(0,1fr\)\)/);
});

test('Russian page names receive stable URL slugs', () => {
  assert.equal(normalizeSlug('Наши услуги во Владивостоке'), 'nashi-uslugi-vo-vladivostoke');
  assert.equal(normalizeSlug('  Контакты  '), 'kontakty');
});
