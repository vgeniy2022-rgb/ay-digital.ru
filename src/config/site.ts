export const siteConfig = {
  siteName: 'AY Digital',
  specialistName: 'Александр',
  siteUrl: import.meta.env.VITE_SITE_URL?.trim() || 'https://ay-digital-ru.vercel.app',
  defaultTitle: 'Александр — IT-помощь, сайты и техника во Владивостоке',
  defaultDescription:
    'Частный IT-специалист во Владивостоке: компьютерная помощь, настройка Windows и MacBook, перенос данных, сборка ПК, создание сайтов и удалённая помощь.',
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
