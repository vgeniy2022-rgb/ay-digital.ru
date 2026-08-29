const SENSITIVE_KEY = /(api.?key|authorization|credential|password|secret|token|private|gemini|cloudflare)/i;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE = /(?:\+?7|8)[\s(.-]*\d{3}[\s).-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/g;
const EMAIL_DETECT = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_DETECT = /(?:\+?7|8)[\s(.-]*\d{3}[\s).-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/;

export function sanitizeXRayText(value: string) {
  return value
    .replace(EMAIL, '[email скрыт]')
    .replace(PHONE, '[телефон скрыт]')
    .replace(/(Bearer\s+)[A-Za-z0-9._~-]+/gi, '$1[скрыто]');
}

export function safeXRayJson(value: unknown) {
  return JSON.stringify(
    value,
    (key, currentValue) => {
      if (SENSITIVE_KEY.test(key)) return '[скрыто]';
      return typeof currentValue === 'string' ? sanitizeXRayText(currentValue) : currentValue;
    },
    2,
  );
}

export function containsSensitiveXRayContent(value: string) {
  return SENSITIVE_KEY.test(value) || EMAIL_DETECT.test(value) || PHONE_DETECT.test(value);
}
