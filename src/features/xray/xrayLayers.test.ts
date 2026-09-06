import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { analyzeXRayFile, buildXRayManifest, redactSourceLine, XRAY_SOURCE_ALLOWLIST } from '../../../scripts/xray-source-plugin.mjs';
import { safeResourcePath, sourceLines } from './dom';
import { sanitizeXRayText } from './sanitize';
import { isPrivateXRayRoute } from './routeRegistry';

test('private route exclusions use the same trailing-slash normalization as X-RAY routing', () => {
  for (const route of ['/ai-website', '/brief', '/contacts']) {
    assert.equal(isPrivateXRayRoute(route), true);
    assert.equal(isPrivateXRayRoute(route + '/'), true);
    assert.equal(isPrivateXRayRoute(route + '///'), true);
  }
  assert.equal(isPrivateXRayRoute('/services'), false);
});

test('X-RAY build source allowlist never includes backend, config or interactive private routes', () => {
  for (const file of XRAY_SOURCE_ALLOWLIST) {
    assert.match(file, /^src\/(?:components|pages)\/.+\.tsx$/);
    assert.doesNotMatch(file, /(?:\.env|config|\/api\/|\/hooks\/|AiWebsite|BriefPage|ContactsPage|\/studio\/|auth)/i);
  }
  assert.throws(() => analyzeXRayFile('private', 'api/ai.mjs'), /allowlist/);
  assert.throws(() => analyzeXRayFile('private', 'src/pages/../../.env'), /allowlist/);
});

test('source registry extracts actual JSX, never imports, hooks, server logic or arbitrary constants', () => {
  const fixture = `import { something } from './internal';
const PRIVATE_FIXTURE = 'DO_NOT_SHIP_THIS_LITERAL';
export function HomePage() {
  const neverExpose = PRIVATE_FIXTURE;
  return <section><h1 className="hero-title">Real title</h1></section>;
}`;
  const result = analyzeXRayFile(fixture, 'src/pages/HomePage.tsx');
  const serialized = JSON.stringify(result.source);
  assert.doesNotMatch(serialized, /DO_NOT_SHIP_THIS_LITERAL|PRIVATE_FIXTURE|neverExpose|import /);
  assert.match(serialized, /Real title/);
  const heading = result.nodes.find(node => node.tag === 'h1');
  assert.ok(heading);
  assert.equal(heading.component, 'HomePage');
  assert.equal(heading.start, 5);
  assert.match(result.code, new RegExp(`data-xray-node="${heading.id}"`));
  const inline = analyzeXRayFile(`export function HomePage(){const before='PRIVATE_BEFORE';return <h1>Public</h1>;const after='PRIVATE_AFTER';}`, 'src/pages/HomePage.tsx');
  assert.doesNotMatch(JSON.stringify(inline.source), /PRIVATE_BEFORE|PRIVATE_AFTER|const before|const after/);
  assert.match(JSON.stringify(inline.source), /<h1>Public<\/h1>/);
});

test('build sanitizer removes secret-bearing JSX lines without copying the original value', () => {
  for (const line of ['<div>{import.meta.env.VITE_EXAMPLE}</div>', '<img src="https://private.example/image?signature=DO_NOT_SHIP" />', '<p>apiKey=DO_NOT_SHIP</p>', '<p>Bearer DO_NOT_SHIP</p>']) {
    assert.equal(redactSourceLine(line).includes('DO_NOT_SHIP'), false);
    assert.match(redactSourceLine(line), /исключена/);
  }
});

test('real repository manifest is bounded and every mapped node has a real JSX line', () => {
  const manifest = buildXRayManifest(process.cwd());
  assert.equal(manifest.files.length, XRAY_SOURCE_ALLOWLIST.length);
  assert.ok(Object.keys(manifest.nodes).length > 200);
  assert.ok(JSON.stringify(manifest).length < 850000);
  for (const node of Object.values(manifest.nodes)) {
    const file = manifest.files.find(item => item.id === node.file);
    assert.ok(file?.lines.some(line => line.number === node.start));
    assert.ok(node.end >= node.start);
  }
  const source = manifest.files.flatMap(file => file.lines.map(line => line.text)).join('\n');
  assert.doesNotMatch(source, /(?:import\.meta\.env|process\.env|service_role|Bearer\s|\/api\/)/);
  assert.match(source, /home-cinematic-hero/);
});

test('hover source window uses actual source IDs and highlights the exact heading range', () => {
  const manifest = buildXRayManifest(process.cwd());
  const heading = Object.values(manifest.nodes).find(node => node.file === 'pages/HomePage' && node.tag === 'h1');
  assert.ok(heading);
  const lines = sourceLines(manifest, heading, heading);
  assert.ok(lines.length > 0);
  assert.ok(lines[0].highlighted);
  assert.match(lines[0].text, /<h1>/);
  assert.equal(lines[0].number, heading.start);
});

test('resource paths discard queries, credentials, private routes and non-http schemes', () => {
  assert.equal(safeResourcePath('/cases/school/image.webp?token=hidden'), '/cases/school/image.webp');
  for (const url of ['/api/ai', '/admin/config', 'data:text/plain,secret', 'javascript:alert(1)', 'https://external.example/private?key=1']) assert.ok(safeResourcePath(url).startsWith('['));
});

test('runtime sanitizer strips identifiers and secret-like literals', () => {
  const result = sanitizeXRayText('token=QA_PRIVATE_VALUE SV-A7F21C 7ad3c5a4-2222-4444-aaaa-123456789abc');
  assert.doesNotMatch(result, /QA_PRIVATE_VALUE|SV-A7F21C|7ad3c5a4/);
});

test('X-RAY stays lazy, uses physical layers and does not read React internals or form values', () => {
  const controller = readFileSync('src/features/xray/XRayController.tsx', 'utf8');
  assert.match(controller, /lazy\(\(\) => import\('\.\/XRayExperience'\)/);
  assert.doesNotMatch(controller, /virtual:sitevl-xray-sources/);
  const dom = readFileSync('src/features/xray/dom.ts', 'utf8');
  assert.doesNotMatch(dom, /\.innerHTML|\.value\b|__reactFiber|localStorage|sessionStorage|document\.cookie/);
  const css = readFileSync('src/features/xray/xray.css', 'utf8');
  assert.match(css, /xray-code-layer[^}]*z-index: 0/);
  assert.match(css, /xray-active[^}]*z-index: 1[^}]*opacity:/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(css, /\.xray-panel\s*\{/);
});
