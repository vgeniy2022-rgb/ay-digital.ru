export type BreadcrumbItem = {
  label: string;
  href: string;
};

const staticRouteLabels: Record<string, string> = {
  '/': 'Главная',
  '/services': 'Услуги',
  '/prices': 'Цены',
  '/cases': 'Кейсы',
  '/about': 'Обо мне',
  '/contacts': 'Контакты',
  '/useful': 'Полезное',
  '/process': 'Порядок работы',
  '/privacy': 'Политика обработки данных',
  '/terms': 'Условия обращения',
  '/cart': 'Корзина',
  '/checkout': 'Выбранные услуги',
  '/lab': 'SITEVL LAB',
  '/lab/builder': 'Website Builder',
  '/lab/2d': 'Break the Website',
  '/lab/3d': 'The Room',
  '/lab/physics': 'Physics Lab',
  '/lab/os': 'OS Simulator',
  '/lab/retro': 'Retro Computing',
  '/lab/modern-os': 'SITEVL Modern OS',
  '/lab/canvas': 'Infinite Canvas',
  '/lab/builder-legacy': 'Legacy Website Builder',
  '/brief': 'Мини-бриф',
  '/changelog': 'Changelog',
  '/primorsky-krai': 'Приморский край',
  '/computer-help-artem': 'Компьютерная помощь в Артёме',
  '/computer-help-ussuriysk': 'Компьютерная помощь в Уссурийске',
  '/computer-help-nakhodka': 'Компьютерная помощь в Находке',
  '/website-development-artem': 'Создание сайтов в Артёме',
  '/website-development-ussuriysk': 'Создание сайтов в Уссурийске',
  '/website-development-nakhodka': 'Создание сайтов в Находке',
  '/cases/ay-digital-personal-website': 'Сайт-портфолио SITEVL',
  '/cases/marine-equipment-catalog': 'Каталог морского оборудования',
  '/prices/websites': 'Сайты и админки',
  '/prices/programs': 'Установка программ',
  '/prices/devices': 'Настройка ноутбуков и компьютеров',
  '/prices/phones': 'Телефоны и перенос данных',
  '/prices/pc': 'Сборка ПК и комплектующие',
  '/computer-help-vladivostok': 'Компьютерная помощь во Владивостоке',
  '/program-installation-vladivostok': 'Установка программ во Владивостоке',
  '/windows-setup-vladivostok': 'Настройка Windows во Владивостоке',
  '/macbook-setup-vladivostok': 'Настройка MacBook во Владивостоке',
  '/pc-build-vladivostok': 'Сборка ПК во Владивостоке',
  '/data-transfer-vladivostok': 'Перенос данных во Владивостоке',
  '/phone-setup-vladivostok': 'Настройка телефона во Владивостоке',
  '/website-development-vladivostok': 'Создание сайтов во Владивостоке',
  '/website-admin-vladivostok': 'Сайт с админкой во Владивостоке',
  '/useful/speed-up-windows': 'Как ускорить Windows',
  '/useful/new-laptop-setup': 'Что делать после покупки ноутбука',
  '/useful/how-to-choose-ssd': 'Как выбрать SSD',
  '/useful/safe-data-transfer': 'Как безопасно перенести данные',
  '/useful/how-to-choose-laptop': 'Как выбрать ноутбук',
  '/useful/macbook-or-windows': 'MacBook или Windows',
  '/useful/how-to-choose-computer': 'Как выбрать компьютер',
  '/useful/how-to-protect-computer': 'Как защитить компьютер',
  '/useful/how-to-choose-wifi-router': 'Как выбрать Wi-Fi роутер',
  '/useful/slow-internet': 'Почему медленно работает интернет',
  '/useful/how-to-choose-smartphone': 'Как выбрать смартфон',
  '/useful/what-is-business-card-website': 'Что такое сайт-визитка',
  '/useful/what-is-landing-page': 'Что такое лендинг',
  '/useful/what-is-admin-website': 'Что такое сайт с админкой',
  '/useful/what-is-mvp': 'Что такое MVP',
  '/useful/when-business-needs-website': 'Когда бизнесу нужен сайт',
  '/useful/when-business-needs-automation': 'Когда нужна автоматизация бизнеса',
  '/useful/how-to-choose-hosting': 'Как выбрать хостинг',
  '/useful/prepare-photos-for-website': 'Как подготовить фотографии для сайта',
  '/useful/how-to-choose-website-developer': 'Как выбрать разработчика сайта',
  '/useful/website-development-cost': 'Сколько стоит создание сайта',
  '/useful/website-for-small-business': 'Какой сайт нужен малому бизнесу',
  '/useful/company-website-structure': 'Что должно быть на сайте компании',
  '/useful/diy-or-developer-website': 'Сайт самому или заказать разработчику',
  '/useful/data-transfer': 'Перенос данных между телефонами',
  '/useful/digital-hygiene': 'Цифровая гигиена',
  '/useful/scams': 'Защита от мошенников',
  '/useful/apps-checklists': 'Приложения и чек-листы',
};

export const routeLabels: Record<string, string> = staticRouteLabels;

function humanizeSegment(segment: string) {
  return segment
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getRouteLabel(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  return routeLabels[pathname] || humanizeSegment(segments[segments.length - 1] || 'Страница');
}

export function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  if (normalizedPath === '/') {
    return [{ label: 'Главная', href: '/' }];
  }

  const segments = normalizedPath.split('/').filter(Boolean);
  const crumbs: BreadcrumbItem[] = [{ label: 'Главная', href: '/' }];

  segments.forEach((_, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    crumbs.push({
      label: getRouteLabel(href),
      href,
    });
  });

  return crumbs;
}
