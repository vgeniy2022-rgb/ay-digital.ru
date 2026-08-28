export function safeStudioHref(value: string | undefined, fallback = '#') {
  const href = value?.trim() || fallback;
  if (href.startsWith('/') || href.startsWith('#')) return href;
  try {
    const parsed = new URL(href);
    return ['https:', 'http:', 'mailto:', 'tel:'].includes(parsed.protocol) ? href : fallback;
  } catch {
    return fallback;
  }
}
