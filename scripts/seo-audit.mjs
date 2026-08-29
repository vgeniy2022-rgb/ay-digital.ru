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

function getMeta(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || '';
}

function getJsonLdTypes(html) {
  return [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)]
    .flatMap((match) => {
      try {
        const parsed = JSON.parse(match[1]);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        return items.flatMap((item) => Array.isArray(item['@type']) ? item['@type'] : [item['@type']]).filter(Boolean);
      } catch {
        errors.push('найден некорректный JSON-LD');
        return [];
      }
    });
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

sitemapPaths.forEach((pathname) => {
  const htmlPath = htmlPathForRoute(pathname);
  assert(existsSync(htmlPath), `для sitemap URL не найден prerender HTML: ${pathname}`);
  if (!existsSync(htmlPath)) return;

  const html = read(htmlPath);
  const title = getMeta(html, /<title>(.*?)<\/title>/s);
  const description = getMeta(html, /<meta\s+name="description"\s+content="([^"]*)"\s*\/?>/s);
  const robots = getMeta(html, /<meta\s+name="robots"\s+content="([^"]*)"\s*\/?>/s);
  const canonical = getMeta(html, /<link\s+rel="canonical"\s+href="([^"]*)"\s*\/?>/s);

  assert(title, `отсутствует title: ${pathname}`);
  assert(description, `отсутствует description: ${pathname}`);
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
  assert(/<h1\b/i.test(html), `в prerender HTML отсутствует H1: ${pathname}`);

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

console.log(`[seo-audit] OK: ${sitemapPaths.length} indexable URLs checked.`);
