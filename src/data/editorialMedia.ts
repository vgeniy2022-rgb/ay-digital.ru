export type EditorialMedia = {
  src: string;
  alt: string;
  label: string;
  focus?: string;
};

export const editorialMedia = {
  homeCollaboration: {
    src: '/images/editorial/home-collaboration.webp',
    alt: 'Обсуждение структуры сайта за ноутбуком в светлом рабочем пространстве',
    label: 'Проектирование вместе с клиентом',
    focus: 'center',
  },
  presentationWork: {
    src: '/images/editorial/presentation-work.avif',
    alt: 'Работа с презентацией на ноутбуке и смартфоне',
    label: 'Презентации и цифровые материалы',
    focus: 'center',
  },
  developerWorkspace: {
    src: '/images/editorial/developer-workspace.webp',
    alt: 'Разработчик работает с кодом на ноутбуке в современной студии',
    label: 'Разработка интерфейсов SITEVL',
    focus: 'center',
  },
  phoneLaptop: {
    src: '/images/editorial/phone-laptop.webp',
    alt: 'Человек работает со смартфоном и ноутбуком за одним столом',
    label: 'Устройства работают вместе',
    focus: 'center',
  },
  macbookIphone: {
    src: '/images/editorial/macbook-iphone.avif',
    alt: 'Смартфон и ноутбук с согласованными экранами на рабочем столе',
    label: 'Экосистема смартфона и ноутбука',
    focus: 'center',
  },
  ssdInstall: {
    src: '/images/editorial/ssd-install.avif',
    alt: 'Специалист аккуратно устанавливает SSD в открытый ноутбук',
    label: 'Установка SSD и работа с комплектующими',
    focus: 'center',
  },
  wifiRouter: {
    src: '/images/editorial/wifi-router.webp',
    alt: 'Современный Wi-Fi роутер с антеннами и индикаторами подключения',
    label: 'Домашняя сеть и стабильный Wi-Fi',
    focus: 'center',
  },
  laptopOffice: {
    src: '/images/editorial/laptop-office.avif',
    alt: 'Специалист работает за ноутбуком в современном офисе',
    label: 'Спокойный рабочий процесс',
    focus: 'center',
  },
  securityWorkspace: {
    src: '/images/editorial/security-workspace.avif',
    alt: 'Рабочее место разработчика с ноутбуком и экранами кода',
    label: 'Настройка, проверка и безопасность',
    focus: 'center',
  },
  dataTransferIphones: {
    src: '/images/editorial/data-transfer-iphones.avif',
    alt: 'Перенос данных между двумя смартфонами в руках пользователя',
    label: 'Перенос с проверкой результата',
    focus: 'center',
  },
  twoSmartphones: {
    src: '/images/editorial/two-smartphones.avif',
    alt: 'Два человека держат разные смартфоны рядом перед переносом данных',
    label: 'Перенос между разными устройствами',
    focus: 'center',
  },
  sitevlHomeCapture: {
    src: '/images/editorial/sitevl-home-capture.avif',
    alt: 'Реальный экран главной страницы SITEVL на компьютере',
    label: 'Главная страница SITEVL',
    focus: 'top center',
  },
  webStudioCapture: {
    src: '/images/editorial/web-studio-capture.avif',
    alt: 'Реальный экран иммерсивной страницы Web Studio SITEVL',
    label: 'Иммерсивная Web Studio',
    focus: 'top center',
  },
} satisfies Record<string, EditorialMedia>;

const websiteArticleSlugs = new Set([
  'what-is-business-card-website',
  'what-is-landing-page',
  'what-is-admin-website',
  'what-is-mvp',
  'when-business-needs-website',
  'when-business-needs-automation',
  'how-to-choose-hosting',
  'prepare-photos-for-website',
  'how-to-choose-website-developer',
  'website-development-cost',
  'website-for-small-business',
  'company-website-structure',
  'diy-or-developer-website',
]);

export function getUsefulArticleMedia(slug: string): EditorialMedia {
  if (websiteArticleSlugs.has(slug)) return editorialMedia.homeCollaboration;
  if (slug.includes('ssd') || slug === 'speed-up-windows') return editorialMedia.ssdInstall;
  if (slug.includes('wifi') || slug === 'slow-internet') return editorialMedia.wifiRouter;
  if (slug.includes('data-transfer') || slug === 'data-transfer') return editorialMedia.dataTransferIphones;
  if (slug.includes('smartphone') || slug === 'apps-checklists') return editorialMedia.phoneLaptop;
  if (slug.includes('macbook') || slug === 'digital-hygiene') return editorialMedia.macbookIphone;
  if (slug.includes('protect') || slug === 'scams') return editorialMedia.securityWorkspace;
  if (slug.includes('laptop') || slug.includes('computer')) return editorialMedia.laptopOffice;
  return editorialMedia.developerWorkspace;
}

export function getUsefulSecondaryMedia(slug: string): EditorialMedia {
  if (websiteArticleSlugs.has(slug)) return editorialMedia.developerWorkspace;
  if (slug.includes('ssd') || slug.includes('windows') || slug.includes('computer')) return editorialMedia.ssdInstall;
  if (slug.includes('wifi') || slug === 'slow-internet') return editorialMedia.laptopOffice;
  if (slug.includes('data-transfer') || slug === 'data-transfer') return editorialMedia.twoSmartphones;
  if (slug.includes('smartphone') || slug === 'apps-checklists') return editorialMedia.macbookIphone;
  if (slug.includes('macbook') || slug === 'digital-hygiene') return editorialMedia.securityWorkspace;
  if (slug === 'scams') return editorialMedia.phoneLaptop;
  return editorialMedia.phoneLaptop;
}

export function getRouteHeroMedia(pathname: string): EditorialMedia | undefined {
  if (pathname === '/services') return editorialMedia.developerWorkspace;
  if (pathname === '/prices') return editorialMedia.homeCollaboration;
  if (pathname === '/cases') return editorialMedia.laptopOffice;
  if (pathname === '/contacts') return editorialMedia.phoneLaptop;
  if (pathname === '/process') return editorialMedia.homeCollaboration;
  if (pathname === '/cart' || pathname === '/checkout') return editorialMedia.phoneLaptop;
  if (pathname.startsWith('/prices/')) return editorialMedia.laptopOffice;
  return undefined;
}

export function getServiceCategoryMedia(category?: string): EditorialMedia {
  const normalized = (category || '').toLocaleLowerCase('ru-RU');

  if (normalized.includes('sitevl') || normalized.includes('портфолио')) return editorialMedia.sitevlHomeCapture;
  if (normalized.includes('web studio') || normalized.includes('иммерсив')) return editorialMedia.webStudioCapture;
  if (normalized.includes('сайт')) return editorialMedia.homeCollaboration;
  if (normalized.includes('прилож')) return editorialMedia.developerWorkspace;
  if (normalized.includes('презента')) return editorialMedia.presentationWork;
  if (normalized.includes('телефон') || normalized.includes('данн')) return editorialMedia.dataTransferIphones;
  if (normalized.includes('пк') || normalized.includes('техник')) return editorialMedia.ssdInstall;
  return editorialMedia.laptopOffice;
}

export function getUsefulVariantMedia(variant: string): EditorialMedia {
  if (variant === 'transfer') return editorialMedia.dataTransferIphones;
  if (variant === 'hygiene') return editorialMedia.macbookIphone;
  if (variant === 'scams') return editorialMedia.securityWorkspace;
  if (variant === 'apps') return editorialMedia.phoneLaptop;
  return editorialMedia.twoSmartphones;
}
