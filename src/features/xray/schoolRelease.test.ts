import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { navItems, priceGroups } from '../../data/site';
import { getPriceDirection } from '../../data/priceDirections';
import { publishedCases } from '../../data/cases';
import { seoLandingPages } from '../../data/seoLandingPages';
import { routeSeo } from '../../data/routeSeo';
import { matchXRayRoute } from './routeRegistry';

const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

test('AI-концепт доступен из LAB, но не продвигается в коммерческой навигации', () => {
  assert.ok(!navItems.some((item) => item.href === '/ai-website'));
  assert.match(source('src/features/lab/home/LabHomePage.tsx'), /to="\/ai-website"/);
  assert.match(source('src/pages/AiWebsitePage.tsx'), /to="\/lab"/);
  const commercialSources = ['src/pages/HomePage.tsx', 'src/pages/AboutPage.tsx', 'src/pages/SeoLandingPage.tsx', 'src/pages/PriceDirectionPage.tsx', 'src/components/web-studio/WebStudioHero.tsx', 'src/components/web-studio/StudioFaqAndLinks.tsx'];
  for (const path of commercialSources) assert.doesNotMatch(source(path), /\/ai-website/, path);
  assert.doesNotMatch(JSON.stringify(seoLandingPages), /\/ai-website/);
  assert.equal(routeSeo['/ai-website'].canonicalPath, '/ai-website');
  assert.notEqual(routeSeo['/ai-website'].noindex, true);
  assert.match(source('src/App.tsx'), /ai-website/);
  assert.ok(existsSync('api/ai.mjs') || existsSync('api/ai.js'));
});

test('новые цены программ берутся из единого источника, прежние пакеты сохранены', () => {
  const direction = getPriceDirection('programs');
  assert.ok(direction);
  assert.deepEqual(direction.packages.slice(0, 3).map((item) => item.price), ['от 500 ₽', '1 200 ₽', 'от 1 000 ₽']);
  assert.deepEqual(direction.packages.slice(3).map((item) => item.name), ['Студент', 'Офис', 'Полный комплект']);
  const group = priceGroups.find((item) => item.title === 'Программы');
  assert.deepEqual(group?.items.map((item) => [item.name, item.price]), direction.packages.map((item) => [item.name, item.price]));
  assert.match(direction.disclaimer || '', /лицензии и подписки.*отдельно/);
  assert.match(direction.packages[1].fit, /не включает профессиональное/);
  assert.match(direction.packages[2].fit, /За 1 программу/);
});

test('новый реальный кейс опубликован и известен X-RAY', () => {
  const item = publishedCases.find((value) => value.slug === 'inner-support-school');
  assert.ok(item?.gallery);
  assert.equal(item.path, '/cases/inner-support-school');
  assert.equal(matchXRayRoute(item.path)?.kind, 'case');
  assert.equal(new Set(publishedCases.map((value) => value.path)).size, publishedCases.length);
  assert.equal(item.gallery.websiteUrl, 'https://innersupport-school.vercel.app/');
  assert.equal(item.gallery.websiteScreens.length, 3);
  assert.equal(item.gallery.appScreens.length, 3);
  assert.match(item.gallery.evidenceNote, /операции записи.*не выполнялись/);
  assert.doesNotMatch(JSON.stringify(item), /Admin Key|AKfycb|рост на \d|конверс.*\d|1000 клиентов/);
});

test('все реальные скриншоты существуют, имеют alt, размеры и адаптивные WebP-версии', () => {
  const gallery = publishedCases.find((item) => item.slug === 'inner-support-school')!.gallery!;
  for (const image of [...gallery.websiteScreens, ...gallery.appScreens]) {
    assert.ok(image.alt.length > 35);
    assert.ok(image.width > 0 && image.height > 0);
    assert.match(image.src, /^\/cases\/inner-support-school\/[\w-]+\.webp$/);
    for (const candidate of image.srcSet.split(', ')) {
      const [path] = candidate.split(' ');
      const bytes = readFileSync(resolve('public', path.slice(1)));
      assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
      assert.ok(bytes.length < 120_000, `${path}: image budget`);
    }
  }
  const mediaFiles = readdirSync('public/cases/inner-support-school');
  assert.ok(mediaFiles.every((name) => name.endsWith('.webp') && !name.includes('settings')));
  assert.ok(mediaFiles.reduce((total, file) => total + statSync(`public/cases/inner-support-school/${file}`).size, 0) < 750_000);
});

test('для реального кейса не показывается концептуальная заглушка', () => {
  assert.match(source('src/pages/CasePage.tsx'), /item\.gallery \? <CaseGallery/);
  const css = source('src/styles/case-gallery.css');
  assert.match(css, /height:auto;object-fit:contain/);
  const gallery = source('src/components/CaseGallery.tsx');
  assert.match(gallery, /loading=\{eager \? 'eager' : 'lazy'\}/);
  assert.match(gallery, /aria-pressed/);
  assert.doesNotMatch(gallery, /dangerouslySetInnerHTML|iframe|window\.open/);
});
