import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { resolveSiteUrl } from './site-env.mjs';

const rootDir = process.cwd();
const distDir = join(rootDir, 'dist');
const srcDir = join(rootDir, 'src');
const siteUrl = resolveSiteUrl(rootDir);
const manifestPath = join(distDir, 'seo-route-manifest.json');
const sitemapPath = join(distDir, 'sitemap.xml');
const technicalPaths = new Set(['/admin', '/studio', '/studio/projects', '/lab', '/lab/builder', '/lab/2d', '/lab/3d', '/lab/physics', '/lab/os', '/lab/retro', '/lab/modern-os', '/lab/canvas', '/lab/builder-legacy', '/brief', '/changelog']);
const ignoredInternalTargets = [/^\/#/, /^\/assets\//, /\.(svg|png|jpe?g|webp|avif|ico|json|xml|txt|pdf)$/i];

function fail(message) {
  throw new Error(`[seo-audit] ${message}`);
}

function read(path) {
  return readFileSync(path, 'utf8');
}

function normalizePath(value) {
  if (value === '/') return '/';
  return value.replace(/\/$/, '');
}

function htmlPathForRoute(pathname) {
  return pathname === '/' ? join(distDir, 'index.html') : join(distDir, `${pathname.slice(1)}.html`);
}

function nestedHtmlPathForRoute(pathname) {
  return pathname === '/' ? join(distDir, 'index.html') : join(distDir, pathname.slice(1), 'index.html');
}

function getMeta(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || '';
}

function getJsonLdTypes(html) {
  return getJsonLdItems(html)
    .flatMap((item) => Array.isArray(item['@type']) ? item['@type'] : [item['@type']])
    .filter(Boolean);
}

function getJsonLdItems(html) {
  return [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)]
    .flatMap((match) => {
      try {
        const parsed = JSON.parse(match[1]);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        errors.push('найден некорректный JSON-LD');
        return [];
      }
    });
}

function visibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function walkFiles(dir, result = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walkFiles(path, result);
    } else if (['.ts', '.tsx'].includes(extname(path))) {
      result.push(path);
    }
  }
  return result;
}

if (!existsSync(manifestPath)) fail('seo-route-manifest.json отсутствует. Сначала запустите generate-seo.');
if (!existsSync(sitemapPath)) fail('dist/sitemap.xml отсутствует.');

const manifest = JSON.parse(read(manifestPath));
const manifestPaths = manifest.map((route) => normalizePath(route.path));
if (new Set(manifestPaths).size !== manifestPaths.length) fail('seo-route-manifest.json содержит дуби маршрутов.');
const routes = new Map(manifest.map((route) => [normalizePath(route.path), route]));
const indexableRoutes = manifest.filter((route) => !route.noindex).map((route) => normalizePath(route.path));
const sitemapUrls = [...read(sitemapPath).matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
const sitemapPaths = sitemapUrls.map((url) => normalizePath(new URL(url).pathname));
const errors = [];
const warnings = [];

function assert(condition, message) {
  if (!condition) errors.push(message);
}

sitemapUrls.forEach((url) => {
  const parsed = new URL(url);
  assert(parsed.origin === siteUrl, `sitemap URL использует неверный домен: ${url}`);
  assert(parsed.protocol === 'https:', `sitemap URL не HTTPS: ${url}`);
  assert(!parsed.pathname.endsWith('.html'), `sitemap URL содержит .html: ${url}`);
  assert(!parsed.search, `sitemap URL содержит query: ${url}`);
  assert(!technicalPaths.has(normalizePath(parsed.pathname)), `техническая страница попала в sitemap: ${url}`);
  assert(!parsed.pathname.includes('//'), `sitemap URL содержит двойной слэш в пути: ${url}`);
});

const sitemapSet = new Set(sitemapPaths);
assert(sitemapSet.size === sitemapPaths.length, 'sitemap содержит дубли URL');

sitemapPaths.forEach((pathname) => {
  assert(routes.has(pathname), `sitemap содержит маршрут, отсутствующий в SEO-конфигурации: ${pathname}`);
});

indexableRoutes.forEach((pathname) => {
  assert(sitemapSet.has(pathname), `индексируемая страница отсутствует в sitemap: ${pathname}`);
});

assert(!sitemapPaths.some((pathname) => pathname.includes('small-business-website-draft') || pathname.includes('draft')), 'unpublished кейс попал в sitemap');

const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();
const sitemapEntries = new Map(
  [...read(sitemapPath).matchAll(/<url>\s*<loc>(.*?)<\/loc>([\s\S]*?)<\/url>/g)]
    .map((match) => {
      const pathname = normalizePath(new URL(match[1]).pathname);
      const lastmod = match[2].match(/<lastmod>(.*?)<\/lastmod>/)?.[1] || '';
      return [pathname, { lastmod }];
    }),
);

sitemapPaths.forEach((pathname) => {
  const htmlPath = htmlPathForRoute(pathname);
  assert(existsSync(htmlPath), `для sitemap URL не найден prerender HTML: ${pathname}`);
  if (!existsSync(htmlPath)) return;

  const html = read(htmlPath);
  const nestedHtmlPath = nestedHtmlPathForRoute(pathname);
  assert(existsSync(nestedHtmlPath), `для sitemap URL не найден вложенный prerender HTML: ${pathname}`);
  if (existsSync(nestedHtmlPath)) {
    assert(read(nestedHtmlPath) === html, `два prerender HTML расходятся для clean URL: ${pathname}`);
  }
  const title = getMeta(html, /<title>(.*?)<\/title>/s);
  const description = getMeta(html, /<meta\s+name="description"\s+content="([^"]*)"\s*\/?>/s);
  const robots = getMeta(html, /<meta\s+name="robots"\s+content="([^"]*)"\s*\/?>/s);
  const canonical = getMeta(html, /<link\s+rel="canonical"\s+href="([^"]*)"\s*\/?>/s);
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  const bodyText = visibleText(body);
  const internalLinks = new Set(
    [...body.matchAll(/href="(\/[^"#?]*)/g)].map((match) => normalizePath(match[1])),
  );

  assert(title, `отсутствует title: ${pathname}`);
  assert(description, `отсутствует description: ${pathname}`);
  assert(title.length <= 75, `title длиннее 75 символов: ${pathname}`);
  assert(description.length >= 50 && description.length <= 200, `description вне диапазона 50–200 символов: ${pathname}`);
  assert(robots && !robots.includes('noindex'), `индексируемая страница имеет некорректный robots: ${pathname}`);
  assert(canonical, `отсутствует canonical: ${pathname}`);
  assert(canonical === `${siteUrl}${pathname === '/' ? '/' : pathname}`, `canonical не соответствует маршруту ${pathname}: ${canonical}`);
  assert(canonical.startsWith('https://'), `canonical не HTTPS: ${canonical}`);
  assert(!new URL(canonical).pathname.endsWith('.html'), `canonical содержит .html: ${canonical}`);
  assert(!new URL(canonical).search, `canonical содержит query: ${canonical}`);
  assert(!new URL(canonical).pathname.replace(/^\//, '').includes('//'), `canonical содержит двойной слэш: ${canonical}`);

  assert(/<meta\s+property="og:title"/.test(html), `отсутствует og:title: ${pathname}`);
  assert(/<meta\s+property="og:description"/.test(html), `отсутствует og:description: ${pathname}`);
  assert(/<meta\s+property="og:url"/.test(html), `отсутствует og:url: ${pathname}`);
  assert(/<meta\s+name="twitter:title"/.test(html), `отсутствует twitter:title: ${pathname}`);
  assert(/BreadcrumbList/.test(html), `отсутствует BreadcrumbList: ${pathname}`);

  const jsonLdTypes = getJsonLdTypes(html);
  assert(jsonLdTypes.includes('Organization'), `отсутствует Organization JSON-LD: ${pathname}`);
  assert(jsonLdTypes.includes('Person'), `отсутствует Person JSON-LD: ${pathname}`);
  assert(jsonLdTypes.includes('WebSite'), `отсутствует WebSite JSON-LD: ${pathname}`);
  assert(jsonLdTypes.includes('BreadcrumbList'), `отсутствует BreadcrumbList JSON-LD: ${pathname}`);

  const route = routes.get(pathname);
  if (pathname === '/') {
    assert(jsonLdTypes.includes('LocalBusiness') || jsonLdTypes.includes('ProfessionalService'), `отсутствует LocalBusiness/ProfessionalService JSON-LD: ${pathname}`);
  }
  if (route?.schemaType === 'Article') {
    assert(jsonLdTypes.includes('Article'), `отсутствует Article JSON-LD: ${pathname}`);
    assert(jsonLdTypes.includes('FAQPage'), `отсутствует FAQPage JSON-LD у статьи: ${pathname}`);
  }
  if (['Service', 'LocalService'].includes(route?.schemaType)) {
    assert(jsonLdTypes.includes('Service'), `отсутствует Service JSON-LD: ${pathname}`);
  }
  if (route?.schemaType === 'LocalService') {
    assert(jsonLdTypes.includes('FAQPage'), `отсутствует FAQPage JSON-LD у локальной страницы: ${pathname}`);
  }
  if (route?.schemaType === 'OfferCatalog') {
    assert(jsonLdTypes.includes('OfferCatalog'), `отсутствует OfferCatalog JSON-LD: ${pathname}`);
  }
  if (route?.schemaType === 'CreativeWork') {
    assert(jsonLdTypes.includes('CreativeWork'), `отсутствует CreativeWork JSON-LD: ${pathname}`);
  }

  assert(!/<div id="root"><\/div>/.test(html), `HTML содержит пустой #root без индексируемого контента: ${pathname}`);
  assert(h1Matches.length === 1, `в prerender HTML должен быть ровно один H1, найдено ${h1Matches.length}: ${pathname}`);
  const staticH1 = h1Matches.length ? visibleText(h1Matches[0][1]) : '';
  assert(!route?.h1 || staticH1 === route.h1, `H1 расходится с route manifest: ${pathname}: "${staticH1}"`);
  assert(internalLinks.size >= 3, `в initial HTML меньше трёх внутренних ссылок: ${pathname}`);

  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
  if (['landing', 'article', 'local', 'price', 'case'].includes(route?.sourceKind)) {
    assert(wordCount >= 140, `data-driven prerender слишком короткий (${wordCount} слов): ${pathname}`);
  }

  const jsonLdItems = getJsonLdItems(html);
  jsonLdItems
    .filter((item) => item['@type'] === 'FAQPage')
    .flatMap((item) => item.mainEntity || [])
    .forEach((question) => {
      assert(bodyText.includes(question.name), `FAQ schema содержит невидимый вопрос на ${pathname}: ${question.name}`);
      const answer = question.acceptedAnswer?.text;
      assert(!answer || bodyText.includes(answer), `FAQ schema содержит невидимый ответ на ${pathname}: ${question.name}`);
    });

  jsonLdItems
    .filter((item) => item['@type'] === 'Article')
    .forEach((article) => {
      assert(/^PT\d+M$/.test(article.timeRequired || ''), `Article timeRequired должен быть ISO 8601: ${pathname}`);
    });

  if (route?.lastmod) {
    assert(sitemapEntries.get(pathname)?.lastmod === route.lastmod, `lastmod расходится с датой контента: ${pathname}`);
  } else {
    assert(!sitemapEntries.get(pathname)?.lastmod, `lastmod указан без подтверждённой даты контента: ${pathname}`);
  }

  if (titles.has(title)) {
    errors.push(`дублирующийся title: "${title}" у ${titles.get(title)} и ${pathname}`);
  } else {
    titles.set(title, pathname);
  }

  if (descriptions.has(description)) {
    warnings.push(`дублирующийся description: "${description}" у ${descriptions.get(description)} и ${pathname}`);
  } else {
    descriptions.set(description, pathname);
  }

  if (canonicals.has(canonical)) {
    errors.push(`дублирующийся canonical: ${canonical} у ${canonicals.get(canonical)} и ${pathname}`);
  } else {
    canonicals.set(canonical, pathname);
  }
});

manifest
  .filter((route) => route.noindex)
  .forEach((route) => {
    const pathname = normalizePath(route.path);
    const htmlPath = htmlPathForRoute(pathname);
    assert(!sitemapSet.has(pathname), `noindex-маршрут попал в sitemap: ${pathname}`);
    assert(existsSync(htmlPath), `для noindex-маршрута нет prerender HTML: ${pathname}`);
    if (!existsSync(htmlPath)) return;

    const html = read(htmlPath);
    const nestedHtmlPath = nestedHtmlPathForRoute(pathname);
    const robots = getMeta(html, /<meta\s+name="robots"\s+content="([^"]*)"\s*\/?>/s);
    const canonical = getMeta(html, /<link\s+rel="canonical"\s+href="([^"]*)"\s*\/?>/s);
    const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
    const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
    const bodyText = visibleText(body);

    assert(robots.includes('noindex'), `noindex-маршрут не содержит noindex: ${pathname}`);
    assert(canonical === `${siteUrl}${pathname}`, `noindex canonical не совпадает с маршрутом ${pathname}: ${canonical}`);
    assert(h1Matches.length === 1, `в noindex prerender HTML должен быть ровно один H1: ${pathname}`);
    const staticH1 = h1Matches.length ? visibleText(h1Matches[0][1]) : '';
    assert(!route.h1 || staticH1 === route.h1, `H1 noindex-маршрута расходится с manifest: ${pathname}`);
    assert(bodyText.length >= 80, `noindex prerender не содержит понятного static content: ${pathname}`);
    assert(existsSync(nestedHtmlPath), `нет вложенной prerender-копии noindex-маршрута: ${pathname}`);
    if (existsSync(nestedHtmlPath)) {
      assert(read(nestedHtmlPath) === html, `prerender-копии noindex-маршрута расходятся: ${pathname}`);
    }
  });

const allowedInternalPaths = new Set([
  ...routes.keys(),
  '/services',
  '/prices',
  '/useful',
  '/cases',
  '/contacts',
  '/about',
  '/privacy',
  '/terms',
  '/process',
  '/lab',
  '/lab/builder',
  '/lab/2d',
  '/lab/3d',
  '/lab/physics',
  '/lab/os',
  '/lab/retro',
  '/lab/modern-os',
  '/lab/canvas',
  '/lab/builder-legacy',
  '/brief',
  '/changelog',
  '/studio',
  '/studio/projects',
]);

const sourceFiles = walkFiles(srcDir);
const linkPattern = /\b(?:href|to):\s*['"`](\/[^'"`#?]*)['"`]|\b(?:href|to)=["'](\/[^"'#?]*)["']/g;
const unknownLinks = [];

sourceFiles.forEach((file) => {
  const content = read(file);
  let match;
  while ((match = linkPattern.exec(content))) {
    const raw = match[1] || match[2];
    if (!raw || raw.includes('${')) continue;
    if (ignoredInternalTargets.some((pattern) => pattern.test(raw))) continue;
    const normalized = normalizePath(raw);
    if (!allowedInternalPaths.has(normalized)) {
      unknownLinks.push(`${file.replace(`${rootDir}/`, '')}: ${raw}`);
    }
  }
});

assert(!unknownLinks.length, `внутренние ссылки ведут на неизвестные маршруты:\n${unknownLinks.join('\n')}`);

const robots = read(join(distDir, 'robots.txt'));
assert(!/Disallow:\s*\/\s*$/m.test(robots), 'robots.txt содержит Disallow: /');
assert(/Disallow:\s*\/admin/.test(robots), 'robots.txt не закрывает /admin');
assert(robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`), 'robots.txt содержит неверный Sitemap');
assert(!routes.has('/admin'), 'несуществующий /admin не должен генерироваться как HTTP 200 route');

const indexHtml = read(join(distDir, 'index.html'));
assert(/<meta\s+name="google-site-verification"\s+content="[^"]+"/.test(indexHtml), 'Google Search Console verification отсутствует');

const notFoundPath = join(distDir, '404.html');
assert(existsSync(notFoundPath), 'отсутствует custom 404.html');
if (existsSync(notFoundPath)) {
  const notFoundHtml = read(notFoundPath);
  assert(/<meta\s+name="robots"\s+content="noindex, follow"/.test(notFoundHtml), '404.html должен быть noindex, follow');
  const notFoundCanonical = getMeta(notFoundHtml, /<link\s+rel="canonical"\s+href="([^"]*)"\s*\/?>/s);
  const notFoundH1 = [...notFoundHtml.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  assert(notFoundCanonical === `${siteUrl}/404`, `404.html содержит неверный canonical: ${notFoundCanonical}`);
  assert(notFoundH1.length === 1 && visibleText(notFoundH1[0][1]) === 'Страница не найдена', '404.html должен содержать ровно один понятный H1');
}

const vercelConfig = JSON.parse(read(join(rootDir, 'vercel.json')));
const broadRewrite = (vercelConfig.rewrites || []).find((rule) =>
  rule.source === '/(.*)'
  || /^\/:[^/]+\*$/.test(rule.source)
  || rule.source.includes('(.*)'),
);
assert(!broadRewrite, `Vercel catch-all rewrite создаёт soft 404: ${broadRewrite?.source || ''}`);

function hasHeader(source, key, value) {
  return (vercelConfig.headers || []).some((rule) =>
    rule.source === source
    && (rule.headers || []).some((header) => header.key.toLowerCase() === key.toLowerCase() && header.value === value),
  );
}

assert(hasHeader('/admin', 'X-Robots-Tag', 'noindex, nofollow'), 'для Admin отсутствует точный X-Robots-Tag');
assert(hasHeader('/studio', 'X-Robots-Tag', 'noindex, nofollow'), 'для корня Studio отсутствует точный X-Robots-Tag');
assert(hasHeader('/studio/:path*', 'X-Robots-Tag', 'noindex, nofollow'), 'для вложеных Studio routes отсутствует точный X-Robots-Tag');
assert(hasHeader('/lab', 'X-Robots-Tag', 'noindex, follow'), 'для корня LAB отсутствует точный X-Robots-Tag');
assert(hasHeader('/lab/:path*', 'X-Robots-Tag', 'noindex, follow'), 'для вложеных LAB routes отсутствует точный X-Robots-Tag');
assert(hasHeader('/brief', 'X-Robots-Tag', 'noindex, follow'), 'для Brief отсутствует точный X-Robots-Tag');
assert(hasHeader('/changelog', 'X-Robots-Tag', 'noindex, follow'), 'для Changelog отсутствует точный X-Robots-Tag');
assert((vercelConfig.rewrites || []).every((rule) => !rule.source.startsWith('/studio/') || rule.destination === '/studio'), 'dynamic Studio routes должны получать noindex Studio shell');

if (warnings.length) {
  console.warn(`[seo-audit] Warnings (${warnings.length}):`);
  warnings.slice(0, 20).forEach((warning) => console.warn(`- ${warning}`));
  if (warnings.length > 20) console.warn(`- ... ещё ${warnings.length - 20}`);
}

if (errors.length) {
  console.error(`[seo-audit] Errors (${errors.length}):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`[seo-audit] OK: ${sitemapPaths.length} indexable и ${manifest.filter((route) => route.noindex).length} noindex URLs checked.`);
