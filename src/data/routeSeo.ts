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
    title: 'SITEVL — сайты для бизнеса и IT-помощь во Владивостоке',
    description: 'SITEVL создаёт сайты для бизнеса во Владивостоке и удалённо по Приморскому краю: лендинги, сайты-визитки, сайты с админкой, каталоги и базовая SEO-подготовка.',
    canonicalPath: '/',
    structuredData: homeStructuredData,
  },
  '/services': {
    title: 'Услуги IT-специалиста во Владивостоке — сайты, техника, помощь',
    description: 'Услуги Александра во Владивостоке и удалённо: сайты с системой управления, настройка компьютеров, перенос данных, сборка ПК, презентации и консультации по технике.',
    canonicalPath: '/services',
  },
  '/prices': {
    title: 'Цены на IT-услуги во Владивостоке — SITEVL',
    description: 'Ориентировочные цены на сайты, настройку Windows и MacBook, установку программ, перенос данных, сборку ПК и другие IT-услуги во Владивостоке.',
    canonicalPath: '/prices',
  },
  '/cases': {
    title: 'Кейсы и примеры задач — SITEVL',
    description: 'Примеры сайтов, систем управления, приложений, презентаций, настройки техники и цифровых задач, с которыми можно обратиться к Александру.',
    canonicalPath: '/cases',
  },
  '/about': {
    title: 'О специалисте — Александр, частный IT-специалист во Владивостоке',
    description: 'Александр — частный IT-специалист во Владивостоке: сайты, веб-приложения, компьютерная помощь, Windows, MacBook, перенос данных, телефоны и подбор техники.',
    canonicalPath: '/about',
  },
  '/contacts': {
    title: 'Контакты IT-специалиста во Владивостоке — Александр',
    description: 'Контакты Александра: телефон, Telegram и WhatsApp для связи по компьютерной помощи, сайтам, настройке техники и удалённой помощи.',
    canonicalPath: '/contacts',
  },
  '/useful': {
    title: 'Полезное по технике, данным и безопасности — SITEVL',
    description: 'Простые инструкции по переносу данных, цифровой безопасности, приложениям, iPhone, Android, MacBook и защите от мошенников.',
    canonicalPath: '/useful',
  },
  '/process': {
    title: 'Порядок работы — как проходит IT-помощь и разработка сайта',
    description: 'Как проходит работа с Александром: обсуждение задачи, согласование цены и сроков, выполнение, правки, передача результата и инструкция.',
    canonicalPath: '/process',
  },
  '/privacy': {
    title: 'Политика обработки персональных данных — SITEVL',
    description: 'Политика обработки персональных данных на сайте SITEVL.',
    canonicalPath: '/privacy',
  },
  '/terms': {
    title: 'Условия обращения и оказания услуг — SITEVL',
    description: 'Условия обращения, ориентировочные цены, порядок согласования задач и ограничения услуг SITEVL.',
    canonicalPath: '/terms',
  },
  '/lab': {
    title: 'SITEVL LAB — интерактивная лаборатория',
    description: 'SITEVL LAB — каталог сильных браузерных экспериментов: SITEVL Studio, бесконечный холст, лаборатория физики, Modern OS и ретро-компьютер.',
    canonicalPath: '/lab',
    noindex: true,
  },
  '/lab/builder': {
    title: 'Конструктор сайтов — SITEVL LAB',
    description: 'Полноценный визуальный конструктор SITEVL с секциями, адаптивным предпросмотром, перетаскиванием, отменой действий и экспортом проекта.',
    canonicalPath: '/lab/builder',
    noindex: true,
  },
  '/lab/2d': {
    title: 'Break the Website — 2D-игра — SITEVL LAB',
    description: 'Управляемая 2D-игра SITEVL LAB: используйте элементы интерфейса как платформы, двигайте карточки и найдите скрытый CORE.',
    canonicalPath: '/lab/2d',
    noindex: true,
  },
  '/lab/3d': {
    title: 'The Room — 3D-игра — SITEVL LAB',
    description: 'Процедурная WebGL-комната SITEVL LAB: найдите четыре интерактивных модуля и откройте сюрреалистический выход.',
    canonicalPath: '/lab/3d',
    noindex: true,
  },
  '/lab/physics': {
    title: 'Лаборатория физики — SITEVL LAB',
    description: 'Физическая браузерная песочница с объектами, столкновениями, настройкой массы, гравитации, трения и обратной связью устройства.',
    canonicalPath: '/lab/physics',
    noindex: true,
  },
  '/lab/os': {
    title: 'Симулятор ОС — SITEVL LAB',
    description: 'Оригинальная браузерная SITEVL OS с окнами, файлами, терминалом, заметками, браузером, настройками и локальными достижениями.',
    canonicalPath: '/lab/os',
    noindex: true,
  },
  '/lab/retro': {
    title: 'Ретро-компьютер — SITEVL LAB',
    description: 'Интерактивный компьютер середины 90-х с файлами, терминалом, браузером, графическим и текстовым редакторами, играми, сетью, секретами и CRT-режимом.',
    canonicalPath: '/lab/retro',
    noindex: true,
  },
  '/lab/modern-os': {
    title: 'SITEVL Modern OS — SITEVL LAB',
    description: 'Современная виртуальная настольная система SITEVL с окнами, файлами, браузером, приложениями и локальным сохранением.',
    canonicalPath: '/lab/modern-os',
    noindex: true,
  },
  '/lab/canvas': {
    title: 'Бесконечный холст — SITEVL LAB',
    description: 'Бесконечный 2D-холст для заметок, текста, фигур и связей с перемещением, масштабированием, сенсорными жестами и локальным сохранением.',
    canonicalPath: '/lab/canvas',
    noindex: true,
  },
  '/lab/builder-legacy': {
    title: 'Классический конструктор сайтов — SITEVL LAB',
    description: 'Предыдущая версия конструктора SITEVL сохранена для совместимости и переноса старых черновиков.',
    canonicalPath: '/lab/builder-legacy',
    noindex: true,
  },
  '/brief': {
    title: 'Мини-бриф на создание сайта — SITEVL',
    description: 'Интерактивный мини-бриф SITEVL: задача, структура, функции и ориентировочная стоимость сайта.',
    canonicalPath: '/brief',
    noindex: true,
  },
  '/changelog': {
    title: 'Журнал изменений — SITEVL',
    description: 'Фактические изменения интерактивного интерфейса SITEVL.',
    canonicalPath: '/changelog',
    noindex: true,
  },
  '/studio': {
    title: 'SITEVL Studio — визуальный конструктор сайтов',
    description: 'Техническое рабочее пространство SITEVL Studio для создания, редактирования и локального сохранения проектов.',
    canonicalPath: '/studio',
    noindex: true,
  },
  '/studio/projects': {
    title: 'Проекты SITEVL Studio',
    description: 'Локальное рабочее пространство проектов SITEVL Studio.',
    canonicalPath: '/studio/projects',
    noindex: true,
  },
};

export function createLandingSeo(path: string, title: string, description: string, h1: string) {
  return {
    title,
    description,
    canonicalPath: path,
    structuredData: serviceSchema(path, h1, description),
  } satisfies RouteSeo;
}

export function getRouteSeo(pathname: string) {
  return routeSeo[pathname];
}
