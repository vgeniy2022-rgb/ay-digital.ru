import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

// Run after Vite and before public prerender. Private shell contains no dashboard data or SEO copy.
const template = readFileSync('dist/index.html', 'utf8');
if (!template.includes('<div id="root"></div>')) throw new Error('Radar shell must be generated before public prerender');
const scripts = [...template.matchAll(/<script[^>]*type="module"[^>]*><\/script>/g)].map(m => m[0]).join('\n');
const assets = [...template.matchAll(/<link[^>]*rel="(?:stylesheet|modulepreload)"[^>]*>/g)].map(m => m[0]).join('\n');
if (!scripts) throw new Error('Missing Vite entry');
mkdirSync('dist/radar', { recursive: true });
writeFileSync('dist/radar/index.html', `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>Deal Radar — закрытый доступ</title>${assets}${scripts}</head><body><div id="root"></div></body></html>`);
console.log('Private Radar shell generated; excluded from sitemap.');
