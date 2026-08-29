import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createArticleDefinition, createHomeDefinition, createServiceDefinition } from './definitionBuilders';
import { isXRayEnabledRoute, matchXRayRoute, xrayArticleSlugs, xrayCaseSlugs, xrayLocalSlugs, xrayPriceSlugs, xrayServiceSlugs, xrayStaticRoutes } from './routeRegistry';
import { containsSensitiveXRayContent, safeXRayJson, sanitizeXRayText } from './sanitize';

function sourceSlugs(relativePath: string) {
  const source = readFileSync(resolve(process.cwd(), relativePath), 'utf8');
  return [...source.matchAll(/^ {4}slug: '([^']+)'/gm)].map((match) => match[1]);
}

test('X-RAY allowlist includes supported public routes', () => {
  const routes = [
    ...xrayStaticRoutes,
    ...xrayServiceSlugs.map((slug) => `/${slug}`),
    '/website-development-vladivostok',
    ...xrayArticleSlugs.map((slug) => `/useful/${slug}`),
    ...xrayPriceSlugs.map((slug) => `/prices/${slug}`),
    ...xrayCaseSlugs.map((slug) => `/cases/${slug}`),
    ...xrayLocalSlugs.map((slug) => `/${slug}`),
  ];

  routes.forEach((route) => assert.equal(isXRayEnabledRoute(route), true, route));
});

test('X-RAY is absent from LAB, Studio, redirects and unknown routes', () => {
  const blockedRoutes = [
    '/lab', '/lab/modern-os', '/lab/retro', '/lab/physics', '/lab/canvas', '/lab/2d', '/lab/3d', '/lab/builder',
    '/studio', '/studio/projects', '/studio/project/demo', '/studio/preview/demo',
    '/cart', '/checkout', '/order-success', '/admin', '/auth', '/error', '/404', '/unknown-page',
    '/useful/speed-up-windows/extra', '/computer-help-vladivostok/extra',
  ];

  blockedRoutes.forEach((route) => assert.equal(isXRayEnabledRoute(route), false, route));
});

test('X-RAY route metadata stays aligned with public data registries', () => {
  assert.deepEqual(
    [...xrayServiceSlugs, 'website-development-vladivostok'].sort(),
    sourceSlugs('src/data/seoLandingPages.ts').sort(),
  );
  assert.deepEqual([...xrayArticleSlugs].sort(), sourceSlugs('src/data/useful.ts').sort());
  assert.deepEqual([...xrayPriceSlugs].sort(), sourceSlugs('src/data/priceDirections.ts').sort());
  assert.deepEqual([...xrayLocalSlugs].sort(), sourceSlugs('src/data/localSeo.ts').sort());
});

test('route matcher normalizes only trailing slashes', () => {
  assert.equal(matchXRayRoute('/services/')?.route, '/services');
  assert.equal(matchXRayRoute('/lab/')?.route, undefined);
});

test('page definitions remain specific to home, services and articles', () => {
  const homeMatch = matchXRayRoute('/');
  const serviceAMatch = matchXRayRoute('/computer-help-vladivostok');
  const serviceBMatch = matchXRayRoute('/windows-setup-vladivostok');
  const articleMatch = matchXRayRoute('/useful/speed-up-windows');
  assert.ok(homeMatch && serviceAMatch && serviceBMatch && articleMatch);

  const home = createHomeDefinition(homeMatch);
  const serviceA = createServiceDefinition(serviceAMatch, {
    title: 'Компьютерная помощь во Владивостоке',
    eyebrow: 'Компьютерная помощь',
    description: 'Диагностика и настройка устройств.',
    priceGroupTitles: ['Настройка устройств'],
    sections: [{ title: 'С какими задачами можно обратиться', items: ['Компьютер тормозит'] }],
    faq: [{ question: 'Можно ли удалённо?' }],
  });
  const serviceB = createServiceDefinition(serviceBMatch, {
    title: 'Настройка Windows во Владивостоке',
    eyebrow: 'Windows',
    description: 'Подготовка Windows к работе.',
    priceGroupTitles: ['Программы'],
    sections: [{ title: 'Что входит', items: ['Драйверы и обновления'] }],
    faq: [{ question: 'Можно ли сохранить данные?' }],
  });
  const article = createArticleDefinition(articleMatch, {
    title: 'Как ускорить Windows',
    description: 'Практическое руководство.',
    author: 'Александр',
    updatedAt: '2026-08-05',
    readingTime: '12 минут',
    sections: [{ title: 'Проверка автозагрузки' }],
    faq: [{ question: 'С чего начать?' }],
  });

  assert.notEqual(home.files[0].content, serviceA.files[0].content);
  assert.notEqual(serviceA.files[1].content, serviceB.files[1].content);
  assert.notEqual(serviceA.files[1].filename, serviceB.files[1].filename);
  assert.match(article.files[1].content, /Как ускорить Windows/);
  assert.match(article.files[2].content, /ArticleSections/);
});

test('X-RAY sanitizer redacts contact and secret-like data', () => {
  const text = sanitizeXRayText('mail test@example.com phone +7 (999) 123-45-67 Bearer abc.def');
  assert.equal(text.includes('test@example.com'), false);
  assert.equal(text.includes('999'), false);
  assert.equal(text.includes('abc.def'), false);

  const json = safeXRayJson({ title: 'Публичная страница', apiKey: 'private-value', nested: { password: '1234' } });
  assert.equal(json.includes('private-value'), false);
  assert.equal(json.includes('1234'), false);
  assert.equal(containsSensitiveXRayContent('admin@example.com'), true);
  assert.equal(containsSensitiveXRayContent('Обычный публичный заголовок'), false);
});
