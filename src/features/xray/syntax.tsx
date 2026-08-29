import type { ReactNode } from 'react';
import type { XRayLanguage } from './types';

const JS_KEYWORDS = new Set([
  'as', 'async', 'await', 'const', 'default', 'else', 'export', 'false', 'from', 'function', 'if', 'import', 'in', 'interface', 'let', 'null', 'return', 'true', 'type', 'undefined',
]);

const TOKEN_PATTERN = /(\/\/.*$|\/\*.*?\*\/|`[^`]*`|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b|<\/?[A-Za-z][^>]*>)/g;

function tokenClass(token: string, language: XRayLanguage) {
  if (token.startsWith('//') || token.startsWith('/*')) return 'comment';
  if (/^['"`]/.test(token)) return 'string';
  if (/^#(?:[0-9a-fA-F]{3,8})$/.test(token)) return 'number';
  if (/^\d/.test(token)) return 'number';
  if (token.startsWith('<')) return 'tag';
  if (JS_KEYWORDS.has(token)) return 'keyword';
  if (language === 'css' && token.startsWith('--')) return 'property';
  if (/^[A-Z]/.test(token)) return 'component';
  return '';
}

export function highlightXRayLine(line: string, language: XRayLanguage): ReactNode[] {
  if (language === 'structure') return [line];
  const output: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  TOKEN_PATTERN.lastIndex = 0;
  while ((match = TOKEN_PATTERN.exec(line))) {
    if (match.index > cursor) output.push(line.slice(cursor, match.index));
    const token = match[0];
    const className = tokenClass(token, language);
    output.push(className ? <span className={`xray-token xray-token--${className}`} key={`${match.index}-${token}`}>{token}</span> : token);
    cursor = match.index + token.length;
  }
  if (cursor < line.length) output.push(line.slice(cursor));
  return output;
}
