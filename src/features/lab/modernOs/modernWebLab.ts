const BLOCKED_TAGS = /<(script|iframe|object|embed|base|meta|link)[\s\S]*?>[\s\S]*?<\/\1\s*>|<(script|iframe|object|embed|base|meta|link)\b[^>]*\/?>/gi;
const INLINE_HANDLER = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const UNSAFE_URL = /\s+(href|src|action)\s*=\s*(["'])\s*(?:javascript|data:text\/html):[\s\S]*?\2/gi;

export function sanitizeModernHtml(input: string) {
  return input
    .slice(0, 50000)
    .replace(BLOCKED_TAGS, '')
    .replace(INLINE_HANDLER, '')
    .replace(UNSAFE_URL, ' $1="#"');
}

export function createModernWebLabDocument(html: string, css: string) {
  const safeHtml = sanitizeModernHtml(html);
  const safeCss = css.slice(0, 50000).replace(/@import\s+[^;]+;?/gi, '').replace(/url\s*\(\s*["']?javascript:[^)]+\)/gi, 'none');
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: https:; style-src 'unsafe-inline'; font-src data:"><style>${safeCss}</style></head><body>${safeHtml}</body></html>`;
}
