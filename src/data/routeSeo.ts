import { absoluteUrl, siteConfig } from '../config/site';

type RouteSeo = {
  title: string;
  description: string;
  canonicalPath: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  structuredData?: unknown | unknown[];
};

const provider = {
  '@type': 'Person',
  name: siteConfig.specialistName,
  url: siteConfig.siteUrl,
  telephone: siteConfig.phone,
  sameAs: [siteConfig.telegramUrl],
};

function breadcrumb(path: string, name: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: siteConfig.siteUrl },
      { '@type': 'ListItem', position: 2, name, item: absoluteUrl(path) },
    ],
  };
}

function serviceSchema(path: string, serviceType: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType,
    name: serviceType,
    description,
    provider,
    areaServed: {
      '@type': 'City',
      name: siteConfig.city,
    },
    url: absoluteUrl(path),
  };
}

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: `${siteConfig.specialistName} / ${siteConfig.siteName}`,
  url: siteConfig.siteUrl,
  telephone: siteConfig.phone,
  areaServed: {
    '@type': 'City',
    name: siteConfig.city,
  },
  sameAs: [siteConfig.telegramUrl],
  image: absoluteUrl(siteConfig.defaultOgImage),
};

export const routeSeo: Record<string, RouteSeo> = {
  '/': {
    title: 'Сайты, приложения и IT-помощь во Владивостоке — Александр',
    description: siteConfig.defaultDescription,
    canonicalPath: '/',
    structuredData: homeStructuredData,
  },
  '/services': {
    title: 'Услуги IT-специалиста во Владивостоке — сайты, техника, помощь',
    description: 'Услуги Александра во Владивостоке и удалённо: сайты, админки, настройка компьютеров, перенос данных, сборка ПК, презентации и консультации по технике.',
    canonicalPath: '/services',
  },
  '/prices': {
    title: 'Цены на IT-услуги во Владивостоке — AY Digital',
    description: 'Ориентировочные цены на сайты, настройку Windows и MacBook, установку программ, перенос данных, сборку ПК и другие IT-услуги во Владивостоке.',
    canonicalPath: '/prices',
  },
  '/cases': {
    title: 'Кейсы и примеры задач — AY Digital',
    description: 'Примеры сайтов, админок, приложений, презентаций, настройки техники и цифровых задач, с которыми можно обратиться к Александру.',
    canonicalPath: '/cases',
  },
  '/about': {
    title: 'О специалисте — Александр, частный IT-специалист',
    description: 'Александр помогает с сайтами, техникой, приложениями, презентациями, Windows, macOS, iPhone, Android и цифровыми задачами во Владивостоке и удалённо.',
    canonicalPath: '/about',
  },
  '/contacts': {
    title: 'Контакты IT-специалиста во Владивостоке — Александр',
    description: 'Контакты Александра: телефон, Telegram и WhatsApp для заявок на компьютерную помощь, сайты, настройку техники и удалённую помощь.',
    canonicalPath: '/contacts',
  },
  '/useful': {
    title: 'Полезное по технике, данным и безопасности — AY Digital',
    description: 'Простые инструкции по переносу данных, цифровой безопасности, приложениям, iPhone, Android, MacBook и защите от мошенников.',
    canonicalPath: '/useful',
  },
  '/process': {
    title: 'Порядок работы — как проходит IT-помощь и разработка сайта',
    description: 'Как проходит работа с Александром: обсуждение задачи, согласование цены и сроков, выполнение, правки, передача результата и инструкция.',
    canonicalPath: '/process',
  },
  '/privacy': {
    title: 'Политика обработки персональных данных — AY Digital',
    description: 'Политика обработки персональных данных на сайте AY Digital.',
    canonicalPath: '/privacy',
  },
  '/terms': {
    title: 'Условия обращения и оказания услуг — AY Digital',
    description: 'Условия обращения, ориентировочные цены, порядок согласования задач и ограничения услуг AY Digital.',
    canonicalPath: '/terms',
  },
  '/cart': {
    title: 'Корзина услуг — AY Digital',
    description: 'Корзина выбранных услуг AY Digital.',
    canonicalPath: '/cart',
    noindex: true,
  },
  '/checkout': {
    title: 'Оформление заказа — AY Digital',
    description: 'Оформление заявки на услуги AY Digital.',
    canonicalPath: '/checkout',
    noindex: true,
  },
  '/order-success': {
    title: 'Заявка отправлена — AY Digital',
    description: 'Заявка на услуги AY Digital отправлена.',
    canonicalPath: '/order-success',
    noindex: true,
  },
};

export function createLandingSeo(path: string, title: string, description: string, h1: string) {
  return {
    title,
    description,
    canonicalPath: path,
    structuredData: [serviceSchema(path, h1, description), breadcrumb(path, h1)],
  } satisfies RouteSeo;
}

export function getRouteSeo(pathname: string) {
  return routeSeo[pathname];
}
