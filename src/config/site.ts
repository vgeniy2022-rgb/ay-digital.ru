const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim();
const runtimeSiteUrl = typeof window !== 'undefined' ? window.location.origin : '';

export const siteConfig = {
  siteName: 'SITEVL',
  specialistName: 'Александр',
  siteUrl: (configuredSiteUrl || runtimeSiteUrl).replace(/\/$/, ''),
  defaultTitle: 'SITEVL — создание сайтов и цифровых решений во Владивостоке',
  defaultDescription:
    'SITEVL — создание сайтов и цифровых решений во Владивостоке: сайты для бизнеса, компьютерная помощь, настройка техники и удалённая работа.',
  defaultOgImage: '/og-image.svg',
  phone: '+79241308626',
  phoneDisplay: '+7 924 130-86-26',
  telegramUrl: 'https://t.me/AYDigitaLRu',
  whatsappUrl: 'https://wa.me/79241308626',
  city: 'Владивосток',
  areaServed: 'Владивосток и удалённо',
};

export function absoluteUrl(path = '/') {
  if (path.startsWith('http')) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteConfig.siteUrl.replace(/\/$/, '')}${normalizedPath}`;
}

export function absoluteAssetUrl(path: string) {
  return absoluteUrl(path);
}
