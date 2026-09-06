import type { ReactNode } from 'react';
import type { XRayLanguage } from './types';
const KEYWORDS = new Set(['as', 'async', 'await', 'const', 'default', 'else', 'export', 'false', 'from', 'function', 'if', 'import', 'let', 'null', 'return', 'true', 'type', 'undefined', 'new']);
// React escapes every token. No HTML injection or heavyweight editor.
export function highlightXRayLine(line: string, language: XRayLanguage): ReactNode[] {
  if (language === 'structure') return [line];
  const pattern = /(\/\/.*$|\/\*.*?\*\/|<!--.*?-->|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|#[\da-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|%)?|[A-Za-z_$][\w$.-]*(?=\s*=)|[A-Za-z_$][\w$.-]*(?=\s*:)|<\/?[\w.:-]+|\b[A-Za-z_$][\w$]*\b)/g;
  const output: ReactNode[] = [];
  let cursor = 0;
  for (const match of line.matchAll(pattern)) {
    const index = match.index!; const token = match[0];
    if (index > cursor) output.push(line.slice(cursor, index));
    const type = /^(\/\/|\/\*|<!--)/.test(token) ? 'comment' : /^['"]/.test(token) ? 'string' : /^[\d#]/.test(token) ? 'number' : token.startsWith('<') ? 'tag' : KEYWORDS.has(token) ? 'keyword' : /^\s*[:=]/.test(line.slice(index + token.length)) ? 'property' : /^[A-Z]/.test(token) ? 'component' : /^\s*\(/.test(line.slice(index + token.length)) ? 'function' : '';
    output.push(type ? <span key={index} className={`xray-token--${type}`}>{token}</span> : token);
    cursor = index + token.length;
  }
  if (cursor < line.length) output.push(line.slice(cursor));
  return output;
}
