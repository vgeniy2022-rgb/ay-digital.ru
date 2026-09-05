// Public identity of SITEVL, shared by runtime, Vite and SEO generation.
// Serving an old advertising alias must never change canonical URLs.
export const PUBLIC_SITE_ORIGIN = 'https://sitevl.tech';

export function resolvePublicOrigin(configuredValue) {
  const value = configuredValue?.trim().replace(/\/$/, '');
  if (value && value !== PUBLIC_SITE_ORIGIN) {
    throw new Error('VITE_SITE_URL must match the SITEVL primary origin https://sitevl.tech.');
  }
  return PUBLIC_SITE_ORIGIN;
}
