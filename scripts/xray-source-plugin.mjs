import { readFileSync, realpathSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import ts from 'typescript';

// Deliberately explicit. Never glob src, import dependencies, read env or publish source maps.
export const XRAY_SOURCE_ALLOWLIST = [
  'src/components/Header.tsx', 'src/components/Footer.tsx', 'src/components/PageHero.tsx',
  'src/components/ServiceCard.tsx', 'src/components/TrustBlocks.tsx', 'src/components/CallToAction.tsx',
  'src/components/CaseGallery.tsx', 'src/components/EditorialPhoto.tsx',
  'src/components/web-studio/WebStudioHero.tsx',
  'src/pages/HomePage.tsx', 'src/pages/ServicesPage.tsx', 'src/pages/PricesPage.tsx',
  'src/pages/PriceDirectionPage.tsx', 'src/pages/CasesPage.tsx', 'src/pages/CasePage.tsx',
  'src/pages/MobileAppsPage.tsx', 'src/pages/SeoLandingPage.tsx', 'src/pages/UsefulIndexPage.tsx',
  'src/pages/UsefulArticlePage.tsx', 'src/pages/LocalSeoPage.tsx', 'src/pages/AboutPage.tsx',
  'src/pages/ProcessPage.tsx', 'src/pages/LegalPage.tsx', 'src/pages/ChangelogPage.tsx',
];
const PUBLIC_ID = 'virtual:sitevl-xray-sources';
const RESOLVED_ID = '\0' + PUBLIC_ID;
const BLOCKED_LINE = /(?:import\.meta\.env|process\.env|\.env\b|\/api\/|authorization|bearer\s|service[_-]?role|api[_-]?key|access[_-]?token|password|credential|secret|https?:\/\/[^\s"'<>]*[?]|eyJ[A-Za-z0-9_-]{15,})/i;
export function redactSourceLine(line) {
  if (BLOCKED_LINE.test(line)) return '/* Закрытая строка исключена из X-RAY. */';
  return line.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[email скрыт]')
    .replace(/(?:\+7|8)[\s(.-]*\d{3}[\s).-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/g, '[телефон скрыт]');
}

export function analyzeXRayFile(text, file) {
  if (!XRAY_SOURCE_ALLOWLIST.includes(file)) throw new Error('X-RAY source is outside the allowlist');
  if (text.length > 180000) throw new Error('X-RAY source size limit');
  const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const fileId = file.replace(/^src\//, '').replace(/\.tsx$/, '');
  const nodes = [];
  const fragments = [];
  const insertions = [];
  const safeLines = new Map();
  const sourceLines = text.split('\n');
  const lineStarts = ast.getLineStarts();
  function visit(node, inJsx = false, component = '') {
    if (ts.isFunctionDeclaration(node)) component = node.name?.text || component;
    const isJsx = ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node);
    if (isJsx && component) {
      const start = ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
      const end = ast.getLineAndCharacterOfPosition(node.end).line + 1;
      if (!inJsx) {
        fragments.push({ start, end, component });
        // Mask everything outside this AST range, including constants/handlers on the same line.
        for (let n = start; n <= end; n++) {
          const row = safeLines.get(n) || Array(sourceLines[n - 1].length).fill(' ');
          const from = Math.max(node.getStart(ast), lineStarts[n - 1]);
          const to = Math.min(node.end, lineStarts[n - 1] + sourceLines[n - 1].length);
          for (let position = from; position < to; position++) row[position - lineStarts[n - 1]] = text[position];
          safeLines.set(n, row);
        }
      }
      if (!ts.isJsxFragment(node)) {
        const opening = ts.isJsxElement(node) ? node.openingElement : node;
        const tag = opening.tagName.getText(ast);
        const domTag = tag === 'Link' || tag === 'NavLink' ? 'a' : tag.startsWith('motion.') ? tag.slice(7) : tag;
        if (/^[a-z][a-z0-9]*$/.test(domTag) && !['script', 'style', 'input', 'textarea', 'select', 'option'].includes(domTag)) {
          const column = ast.getLineAndCharacterOfPosition(node.getStart(ast)).character;
          const id = `${fileId}:${start}:${column}`;
          nodes.push({ id, file: fileId, component, tag: domTag, start, end });
          if (!opening.attributes.properties.some(p => ts.isJsxAttribute(p) && p.name.getText(ast) === 'data-xray-node')) {
            insertions.push({ at: opening.tagName.end, text: ` data-xray-node="${id}"` });
          }
        }
      }
    }
    ts.forEachChild(node, child => visit(child, inJsx || isJsx, component));
  }
  visit(ast);
  // Only actual JSX fragments. Imports, hooks and handlers outside JSX are never included.
  const lines = [...safeLines].sort(([a], [b]) => a - b).map(([number, row]) => ({ number, text: redactSourceLine(row.join('').trimEnd()) }));
  let code = text;
  for (const insertion of insertions.sort((a, b) => b.at - a.at)) code = code.slice(0, insertion.at) + insertion.text + code.slice(insertion.at);
  return { code, source: { id: fileId, path: file, lines, fragments }, nodes };
}

export function buildXRayManifest(root) {
  const files = [];
  const nodes = {};
  const trustedRoot = realpathSync(root);
  for (const file of XRAY_SOURCE_ALLOWLIST) {
    const absolute = realpathSync(resolve(root, file));
    if (relative(trustedRoot, absolute) !== file) throw new Error('X-RAY source symlinks are not allowed');
    const result = analyzeXRayFile(readFileSync(absolute, 'utf8'), file);
    files.push(result.source);
    for (const node of result.nodes) nodes[node.id] = node;
  }
  const manifest = { version: 1, files, nodes };
  if (JSON.stringify(manifest).length > 850000) throw new Error('X-RAY manifest size limit');
  return manifest;
}

export function xraySourcePlugin() {
  let root = process.cwd();
  return {
    name: 'sitevl-xray-safe-sources', enforce: 'pre',
    configResolved(config) { root = config.root; },
    resolveId(id) { if (id === PUBLIC_ID) return RESOLVED_ID; },
    load(id) {
      if (id !== RESOLVED_ID) return;
      XRAY_SOURCE_ALLOWLIST.forEach(file => this.addWatchFile(resolve(root, file)));
      return `export default ${JSON.stringify(buildXRayManifest(root))};`;
    },
    transform(code, id) {
      const file = relative(root, id.split('?')[0]);
      if (!XRAY_SOURCE_ALLOWLIST.includes(file)) return;
      return { code: analyzeXRayFile(code, file).code, map: null };
    },
    handleHotUpdate({ file, server, modules }) {
      if (!XRAY_SOURCE_ALLOWLIST.includes(relative(root, file))) return;
      const module = server.moduleGraph.getModuleById(RESOLVED_ID);
      if (module) { server.moduleGraph.invalidateModule(module); return [...modules, module]; }
    },
  };
}
