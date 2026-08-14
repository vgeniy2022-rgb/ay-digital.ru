import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const rootDir = process.cwd();
const distDir = join(rootDir, 'dist');
const publicDir = join(rootDir, 'public');
const siteUrl = (process.env.VITE_SITE_URL || 'https://ay-digital-ru.vercel.app').replace(/\/$/, '');
const lastmod = new Date().toISOString().slice(0, 10);
const defaultImage = `${siteUrl}/og-image.svg`;
const phone = '+79241308626';
const specialistName = 'Александр';
const siteName = 'AY Digital';

const baseRoutes = [
  {
    path: '/',
    title: 'AY Digital — сайты для бизнеса и IT-помощь во Владивостоке',
    description: 'AY Digital создаёт сайты для бизнеса во Владивостоке и удалённо по Приморскому краю: лендинги, сайты-визитки, сайты с админкой, каталоги и базовая SEO-подготовка.',
    priority: 1,
    changefreq: 'weekly',
    schemaType: 'ProfessionalService',
  },
  {
    path: '/services',
    title: 'Услуги IT-специалиста во Владивостоке — сайты, техника, помощь',
    description: 'Услуги Александра во Владивостоке и удалённо: сайты, админки, настройка компьютеров, перенос данных, сборка ПК, презентации и консультации по технике.',
    priority: 0.9,
    changefreq: 'weekly',
    schemaType: 'ItemList',
  },
  {
    path: '/prices',
    title: 'Цены на IT-услуги во Владивостоке — AY Digital',
    description: 'Ориентировочные цены на сайты, настройку Windows и MacBook, установку программ, перенос данных, сборку ПК и другие IT-услуги во Владивостоке.',
    priority: 0.9,
    changefreq: 'weekly',
    schemaType: 'OfferCatalog',
  },
  {
    path: '/cases',
    title: 'Кейсы и примеры задач — AY Digital',
    description: 'Примеры сайтов, админок, приложений, презентаций, настройки техники и цифровых задач, с которыми можно обратиться к Александру.',
    priority: 0.75,
    changefreq: 'monthly',
    schemaType: 'CollectionPage',
  },
  {
    path: '/about',
    title: 'О специалисте — Александр, частный IT-специалист во Владивостоке',
    description: 'Александр — частный IT-специалист во Владивостоке: сайты, веб-приложения, компьютерная помощь, Windows, MacBook, перенос данных, телефоны и подбор техники.',
    priority: 0.65,
    changefreq: 'monthly',
    schemaType: 'AboutPage',
  },
  {
    path: '/contacts',
    title: 'Контакты IT-специалиста во Владивостоке — Александр',
    description: 'Контакты Александра: телефон, Telegram и WhatsApp для связи по компьютерной помощи, сайтам, настройке техники и удалённой помощи.',
    priority: 0.8,
    changefreq: 'monthly',
    schemaType: 'ContactPage',
  },
  {
    path: '/useful',
    title: 'Полезное о телефонах, компьютерах и цифровой безопасности',
    description: 'Простые инструкции по переносу данных, цифровой гигиене, защите от мошенников и настройке устройств.',
    priority: 0.7,
    changefreq: 'weekly',
    schemaType: 'CollectionPage',
  },
  {
    path: '/primorsky-krai',
    title: 'IT-услуги во Владивостоке и Приморском крае — AY Digital',
    description: 'Локальный хаб AY Digital: услуги во Владивостоке, удалённая помощь по Приморскому краю, сайты, компьютерная помощь, Windows, MacBook и консультации.',
    priority: 0.74,
    changefreq: 'monthly',
    schemaType: 'CollectionPage',
  },
  {
    path: '/process',
    title: 'Порядок работы — как проходит IT-помощь и разработка сайта',
    description: 'Как проходит работа с Александром: обсуждение задачи, согласование цены и сроков, выполнение, правки, передача результата и инструкция.',
    priority: 0.55,
    changefreq: 'monthly',
    schemaType: 'WebPage',
  },
  {
    path: '/privacy',
    title: 'Политика обработки персональных данных — AY Digital',
    description: 'Политика обработки персональных данных на сайте AY Digital.',
    priority: 0.2,
    changefreq: 'yearly',
    schemaType: 'WebPage',
  },
  {
    path: '/terms',
    title: 'Условия обращения и оказания услуг — AY Digital',
    description: 'Условия обращения, ориентировочные цены, порядок согласования задач и ограничения услуг AY Digital.',
    priority: 0.2,
    changefreq: 'yearly',
    schemaType: 'WebPage',
  },
];

const priceRoutes = [
  ['/prices/websites', 'Сайты и админки | Цены', 'Пакеты сайтов: Старт, Лендинг, Сайт с админкой и Бизнес-сайт для специалистов и небольших проектов.'],
  ['/prices/programs', 'Установка программ | Цены', 'Пакеты установки программ: Студент, Офис и Полный комплект.'],
  ['/prices/devices', 'Настройка ноутбуков и компьютеров | Цены', 'Пакеты настройки Windows, MacBook и компьютера после покупки.'],
  ['/prices/phones', 'Телефоны и перенос данных | Цены', 'Настройка нового телефона, перенос данных, подготовка к продаже и цифровая безопасность.'],
  ['/prices/pc', 'Сборка ПК и комплектующие | Цены', 'Подбор комплектующих, сборка ПК, установка Windows и ПК под ключ во Владивостоке.'],
].map(([path, title, description]) => ({ path, title, description, priority: 0.72, changefreq: 'weekly', schemaType: 'OfferCatalog' }));

const usefulRoutes = [
  ['/useful/speed-up-windows', 'Как ускорить Windows, если компьютер тормозит', 'Что проверить, если Windows тормозит: автозагрузка, SSD, память, вирусы, обновления, место на диске и лишние программы.'],
  ['/useful/new-laptop-setup', 'Что делать после покупки нового ноутбука', 'Как настроить новый ноутбук после покупки: Windows или macOS, обновления, программы, безопасность, резервные копии и проверка.'],
  ['/useful/how-to-choose-ssd', 'Как выбрать SSD для ноутбука или ПК', 'Как выбрать SSD: SATA, NVMe, M.2, объём, ресурс, совместимость и когда SSD ускорит старый ноутбук или компьютер.'],
  ['/useful/safe-data-transfer', 'Как безопасно перенести данные', 'Как перенести данные между телефонами, ноутбуками и компьютерами без потери фото, документов, контактов и чатов.'],
  ['/useful/how-to-choose-laptop', 'Как выбрать ноутбук под задачи и бюджет', 'Как выбрать ноутбук для работы, учёбы, дома, поездок и бизнеса: процессор, память, экран, аккумулятор и запас на несколько лет.'],
  ['/useful/macbook-or-windows', 'MacBook или Windows — что выбрать', 'Как выбрать между MacBook и ноутбуком на Windows для работы, учёбы, бизнеса, дизайна, программирования и повседневных задач.'],
  ['/useful/how-to-choose-computer', 'Как выбрать компьютер для дома и работы', 'Как выбрать компьютер: готовый ПК или сборка, процессор, видеокарта, память, SSD, корпус, блок питания и апгрейд.'],
  ['/useful/how-to-protect-computer', 'Как защитить компьютер от вирусов и потери данных', 'Базовая защита компьютера: обновления, антивирус, пароли, резервные копии, браузер, расширения и безопасная установка программ.'],
  ['/useful/how-to-choose-wifi-router', 'Как выбрать Wi-Fi роутер для квартиры или офиса', 'Как выбрать роутер: площадь, диапазоны 2.4 и 5 ГГц, Wi-Fi 6, mesh-система, порты, провайдер и стабильность связи.'],
  ['/useful/slow-internet', 'Почему медленно работает интернет', 'Что проверить, если медленно работает интернет: Wi-Fi, роутер, провайдер, кабель, устройство, браузер и фоновые загрузки.'],
  ['/useful/how-to-choose-smartphone', 'Как выбрать смартфон без переплаты', 'Как выбрать смартфон: iPhone, Samsung, Xiaomi, камера, память, батарея, экран, состояние устройства и покупка с рук.'],
  ['/useful/what-is-business-card-website', 'Что такое сайт-визитка', 'Что входит в сайт-визитку, кому он подходит, какие страницы нужны и чем он отличается от лендинга и большого сайта.'],
  ['/useful/what-is-landing-page', 'Что такое лендинг', 'Что такое лендинг, когда он нужен, из каких блоков состоит и как помогает продвигать услугу, акцию или конкретное предложение.'],
  ['/useful/what-is-admin-website', 'Что такое сайт с админкой', 'Что такое сайт с админкой, какие данные можно менять самостоятельно и когда бизнесу удобно управлять контентом без программиста.'],
  ['/useful/what-is-mvp', 'Что такое MVP приложения или сервиса', 'Что такое MVP, зачем нужен минимальный продукт, какие функции включать в первую версию и как не потратить бюджет на лишнее.'],
  ['/useful/when-business-needs-website', 'Когда бизнесу нужен сайт', 'Когда бизнесу нужен сайт, а когда достаточно соцсетей: услуги, цены, доверие, заявки, поиск, реклама и самостоятельное обновление.'],
  ['/useful/when-business-needs-automation', 'Когда нужна автоматизация бизнеса', 'Когда бизнесу нужна автоматизация: заявки, таблицы, отчёты, склад, сотрудники, повторяющиеся действия и простые приложения.'],
  ['/useful/how-to-choose-hosting', 'Как выбрать хостинг для сайта', 'Как выбрать хостинг для сайта: домен, SSL, скорость, поддержка, резервные копии, почта, CMS, безопасность и рост проекта.'],
  ['/useful/prepare-photos-for-website', 'Как подготовить фотографии для сайта', 'Как подготовить фото для сайта: отбор, качество, формат, размер, фон, единый стиль, сжатие и понятные названия файлов.'],
  ['/useful/how-to-choose-website-developer', 'Как выбрать разработчика сайта', 'Как выбрать разработчика сайта: портфолио, состав работ, сроки, стоимость, админка, SEO, поддержка, договорённости и передача доступов.'],
  ['/useful/website-development-cost', 'Сколько стоит создание сайта', 'Как формируется стоимость создания сайта: лендинг, сайт-визитка, сайт с админкой, каталог, контент, сроки и ссылка на актуальный прайс AY Digital.'],
  ['/useful/website-for-small-business', 'Какой сайт нужен малому бизнесу', 'Как понять, какой сайт заказать малому бизнесу: сайт-визитка, лендинг, сайт с админкой, каталог, заявки, цены, отзывы и мобильная версия.'],
  ['/useful/company-website-structure', 'Что должно быть на сайте компании', 'Структура сайта компании: главный экран, услуги, цены, кейсы, отзывы, FAQ, контакты, формы заявок, legal-страницы и базовое SEO.'],
  ['/useful/diy-or-developer-website', 'Сайт самому или заказать разработчику', 'Нейтральное сравнение: сделать сайт самостоятельно на конструкторе или заказать разработку. Когда подходит каждый вариант и какие риски учесть.'],
  ['/useful/data-transfer', 'Перенос данных между iPhone и Android', 'Как перенести данные с iPhone на iPhone, Android на iPhone, iPhone на Android и Android на Android.'],
  ['/useful/digital-hygiene', 'Цифровая гигиена для iPhone, Android и MacBook', 'Простые настройки безопасности для телефона, компьютера, аккаунтов и паролей.'],
  ['/useful/scams', 'Защита от мошенников и безопасность аккаунтов', 'Как не передать Apple ID, Google-аккаунт, коды, доступ к экрану и банковские данные мошенникам.'],
  ['/useful/apps-checklists', 'Приложения и чек-листы для безопасной настройки устройств', 'Что проверить перед установкой приложений, продажей, покупкой или настройкой телефона и компьютера.'],
].map(([path, title, description]) => ({ path, title, description, priority: 0.64, changefreq: 'monthly', type: 'article', schemaType: 'Article' }));

const caseRoutes = [
  ['/cases/ay-digital-personal-website', 'Кейс: личный сайт AY Digital на React и Vite', 'Кейс личного сайта AY Digital: React, Vite, TypeScript, адаптивная структура, страницы услуг, цен, кейсов, контактов, sitemap, robots, structured data и prerender.'],
  ['/cases/marine-equipment-catalog', 'Кейс: каталог морского оборудования на React и Supabase', 'Кейс каталога морского оборудования: до примерно 1000 товаров, категории, поиск, фильтры, PDF-документы, формы связи, админка, Supabase Auth, CRUD, Storage и RLS.'],
].map(([path, title, description]) => ({ path, title, description, priority: 0.68, changefreq: 'monthly', type: 'article', schemaType: 'CreativeWork' }));

const localRoutes = [
  ['/computer-help-artem', 'Компьютерная помощь в Артёме — удалённая настройка и консультация', 'Удалённая компьютерная помощь для Артёма: Windows, MacBook, программы, перенос данных, телефоны и консультация. Личный формат определяется после обсуждения задачи.', 'Артём', 'Компьютерная помощь'],
  ['/computer-help-ussuriysk', 'Компьютерная помощь в Уссурийске — Windows, MacBook и программы', 'Помощь с компьютером для Уссурийска: удалённая диагностика, настройка Windows, MacBook, программ, перенос данных и консультации по технике.', 'Уссурийск', 'Компьютерная помощь'],
  ['/computer-help-nakhodka', 'Компьютерная помощь в Находке — удалённая диагностика и настройка', 'Удалённая помощь с компьютером в Находке: Windows, MacBook, установка программ, консультации, перенос данных, настройка телефонов и подбор техники.', 'Находка', 'Компьютерная помощь'],
  ['/website-development-artem', 'Создание и разработка сайтов в Артёме — удалённо для бизнеса', 'Разработка сайтов для Артёма удалённо: заказать сайт для бизнеса, лендинг, сайт-визитку или сайт с админкой с адаптацией под телефон и базовым SEO.', 'Артём', 'Создание сайтов'],
  ['/website-development-ussuriysk', 'Создание и разработка сайтов в Уссурийске — для услуг и бизнеса', 'Разработка сайтов для Уссурийска удалённо: заказать сайт-визитку, лендинг или сайт с админкой для услуг, компании или небольшого бизнеса.', 'Уссурийск', 'Создание сайтов'],
  ['/website-development-nakhodka', 'Создание сайтов в Находке — удалённая разработка под услугу', 'Создание сайта для Находки удалённо: заказать лендинг, сайт-визитку, сайт с админкой или каталог с мобильной версией, базовым SEO и кнопками связи.', 'Находка', 'Создание сайтов'],
].map(([path, title, description, city, serviceType]) => ({ path, title, description, city, serviceType, priority: 0.7, changefreq: 'monthly', schemaType: 'LocalService' }));

const landingRoutes = [
  ['/computer-help-vladivostok', 'Компьютерная помощь во Владивостоке — частный мастер', 'Компьютерная помощь во Владивостоке: настройка Windows и MacBook, установка программ, диагностика, перенос данных и подготовка нового компьютера. Выезд и удалённая помощь.'],
  ['/program-installation-vladivostok', 'Установка программ во Владивостоке — Windows и Mac', 'Установка и настройка программ на Windows и MacBook во Владивостоке: Office, браузеры, PDF, архиваторы, медиаплееры и программы для работы или учёбы.'],
  ['/windows-setup-vladivostok', 'Настройка Windows во Владивостоке — ноутбук и ПК под ключ', 'Установка и настройка Windows во Владивостоке: драйверы, обновления, Office, браузеры, программы и подготовка ноутбука или ПК к работе.'],
  ['/macbook-setup-vladivostok', 'Настройка MacBook во Владивостоке — macOS и программы', 'Настройка нового MacBook во Владивостоке: Apple ID, iCloud, программы, Office, браузеры, Dock, резервные копии и базовая безопасность.'],
  ['/pc-build-vladivostok', 'Сборка ПК во Владивостоке — компьютер под ключ', 'Сборка ПК во Владивостоке под задачи и бюджет: подбор комплектующих, покупка, сборка, кабель-менеджмент, тестирование, Windows и программы.'],
  ['/data-transfer-vladivostok', 'Перенос данных во Владивостоке — iPhone и Android', 'Перенос фото, контактов и файлов между iPhone и Android во Владивостоке. Настройка нового телефона и проверка данных после переноса.'],
  ['/phone-setup-vladivostok', 'Настройка iPhone и Android во Владивостоке', 'Настройка нового iPhone или Android во Владивостоке: аккаунт, мессенджеры, резервная копия, поиск устройства, перенос контактов и безопасность.'],
  ['/website-development-vladivostok', 'Создание сайтов во Владивостоке и Приморском крае — AY Digital', 'Создание сайтов во Владивостоке и удалённо по Приморскому краю: сайты для бизнеса, лендинги, сайты-визитки, сайты с админкой, каталоги и базовая SEO-подготовка.'],
  ['/website-admin-vladivostok', 'Сайт с админкой во Владивостоке — управление без программиста', 'Разработка сайта с простой админкой во Владивостоке. Самостоятельно меняйте услуги, цены, отзывы, акции и фотографии без правки кода.'],
].map(([path, title, description]) => ({ path, title, description, priority: 0.82, changefreq: 'weekly', schemaType: 'Service' }));

const technicalRoutes = [
  {
    path: '/cart',
    title: 'Корзина услуг — AY Digital',
    description: 'Корзина выбранных услуг AY Digital.',
    noindex: true,
    schemaType: 'WebPage',
  },
  {
    path: '/checkout',
    title: 'Обсудить выбранные услуги — AY Digital',
    description: 'Список выбранных услуг AY Digital для обсуждения в Telegram или WhatsApp.',
    noindex: true,
    schemaType: 'WebPage',
  },
];

const routes = [...baseRoutes, ...priceRoutes, ...usefulRoutes, ...caseRoutes, ...localRoutes, ...landingRoutes, ...technicalRoutes];
const sitemapRoutes = routes.filter((route) => !route.noindex && !['/cart', '/checkout', '/admin'].includes(route.path));

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function absoluteUrl(path) {
  return `${siteUrl}${path === '/' ? '/' : path}`;
}

function breadcrumbItems(path) {
  const labels = new Map(routes.map((route) => [route.path, route.title.split(' — ')[0].split(' | ')[0]]));
  const segments = path.split('/').filter(Boolean);
  const items = [{ label: 'Главная', href: '/' }];

  segments.forEach((_, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    items.push({ label: labels.get(href) || href.split('/').pop().replaceAll('-', ' '), href });
  });

  return items;
}

function baseStructuredData(route) {
  const contactPoint = {
    '@type': 'ContactPoint',
    telephone: phone,
    contactType: 'customer support',
    areaServed: 'RU-PRI',
    availableLanguage: ['ru'],
    url: 'https://t.me/AYDigitaLRu',
  };

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${siteUrl}/#identity`,
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/favicon.svg`,
      image: defaultImage,
      sameAs: ['https://t.me/AYDigitaLRu'],
      contactPoint,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: specialistName,
      jobTitle: 'Частный IT-специалист',
      url: siteUrl,
      telephone: phone,
      sameAs: ['https://t.me/AYDigitaLRu'],
      worksFor: { '@id': `${siteUrl}/#identity` },
      areaServed: { '@type': 'City', name: 'Владивосток' },
      knowsAbout: ['создание сайтов', 'веб-приложения', 'компьютерная помощь', 'Windows', 'MacBook', 'перенос данных', 'настройка телефонов', 'подбор техники Apple, Samsung и Xiaomi'],
    },
    {
      '@context': 'https://schema.org',
      '@type': ['LocalBusiness', 'ProfessionalService'],
      '@id': `${siteUrl}/#local-business`,
      name: `${specialistName} / ${siteName}`,
      url: siteUrl,
      telephone: phone,
      image: defaultImage,
      priceRange: '₽₽',
      areaServed: [
        { '@type': 'City', name: 'Владивосток' },
        { '@type': 'AdministrativeArea', name: 'Приморский край' },
        { '@type': 'City', name: 'Артём' },
        { '@type': 'City', name: 'Уссурийск' },
        { '@type': 'City', name: 'Находка' },
      ],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Владивосток',
        addressRegion: 'Приморский край',
        addressCountry: 'RU',
      },
      contactPoint,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: siteName,
      url: siteUrl,
      inLanguage: 'ru-RU',
      publisher: { '@id': `${siteUrl}/#identity` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems(route.path).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: absoluteUrl(item.href),
      })),
    },
  ];
}

function routeStructuredData(route) {
  const url = absoluteUrl(route.path);
  if (route.schemaType === 'Service') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: route.title.split(' — ')[0],
      serviceType: route.title.split(' — ')[0],
      description: route.description,
      url,
      provider: { '@id': `${siteUrl}/#person` },
      areaServed: { '@type': 'City', name: 'Владивосток' },
    };
  }

  if (route.schemaType === 'LocalService') {
    const topic = route.serviceType || route.title;
    const city = route.city || 'Приморский край';
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: route.title.split(' — ')[0],
        serviceType: topic,
        description: route.description,
        url,
        provider: { '@id': `${siteUrl}/#person` },
        areaServed: { '@type': 'City', name: city },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          [`Можно ли обратиться из города ${city}?`, `Да, можно начать с консультации. Формат работы по теме “${topic}” зависит от задачи и технических условий.`],
          ['Нужна ли личная встреча?', topic === 'Создание сайтов' ? 'Для создания сайта личная встреча обычно не требуется: обсуждение, материалы и правки можно вести удалённо.' : 'Для части компьютерных задач личная встреча не нужна. Если требуется физический доступ к устройству, это обсуждается отдельно.'],
          ['Обещается ли выезд?', 'Автоматический выезд за пределы Владивостока не обещается. Сначала проводится предварительное обсуждение задачи.'],
          ['Куда написать для консультации?', 'Можно написать в Telegram или WhatsApp и коротко описать задачу, город, устройство или тип проекта.'],
        ].map(([question, answer]) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        })),
      },
    ];
  }

  if (route.schemaType === 'OfferCatalog') {
    return {
      '@context': 'https://schema.org',
      '@type': 'OfferCatalog',
      name: route.title,
      url,
    };
  }

  if (route.schemaType === 'Article') {
    const topic = route.title.split(' — ')[0];
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: route.title,
        description: route.description,
        url,
        inLanguage: 'ru-RU',
        datePublished: '2026-08-05',
        dateModified: lastmod,
        timeRequired: 'PT10M',
        image: defaultImage,
        author: { '@id': `${siteUrl}/#person` },
        publisher: { '@id': `${siteUrl}/#identity` },
        mainEntityOfPage: url,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          [`Что проверить первым по теме “${topic}”?`, `Начните с диагностики задачи: что именно связано с темой “${topic}”, какие симптомы есть и какой результат нужен.`],
          [`В каких случаях с задачей “${topic}” можно справиться самостоятельно?`, 'Базовые шаги можно выполнить самостоятельно, если не удалять важные данные и не менять настройки, в которых вы не уверены.'],
          [`Какие признаки говорят, что с темой “${topic}” лучше не экспериментировать?`, 'Лучше обратиться за помощью, если есть риск потерять данные, сломать настройки, купить неподходящую технику или потратить бюджет на лишние функции.'],
          [`Сколько времени обычно занимает аккуратная проверка: ${topic}?`, 'Срок зависит от устройства, объёма данных, количества программ, сложности сайта или приложения и согласованного формата работы.'],
          [`Что подготовить заранее, чтобы быстрее разобраться с темой “${topic}”?`, 'Полезно подготовить описание задачи, доступы, файлы, фотографии, список программ или требования к сайту, если они уже есть.'],
          [`Можно ли обсудить или решить вопрос “${topic}” удалённо?`, 'Да, многие вопросы можно обсудить удалённо через Telegram или WhatsApp, а техническую помощь часто можно провести онлайн.'],
          [`Какая ошибка чаще всего мешает в теме “${topic}”?`, 'Чаще всего мешает поспешное решение без проверки причины: покупка лишних деталей, удаление данных или установка сомнительных программ.'],
          [`От чего зависит стоимость помощи по теме “${topic}”?`, 'Ориентир можно посмотреть на странице цен, а финальная стоимость подтверждается после уточнения задачи.'],
          [`Какой результат должен получиться после решения задачи “${topic}”?`, 'Результат должен быть понятным и проверяемым: устройство, сайт или процесс работает в согласованном формате, а дальнейшие шаги ясны.'],
          [`Как коротко описать задачу про “${topic}” в Telegram или WhatsApp?`, 'Напишите, что происходит, какая модель устройства или какой тип проекта, что уже пробовали и какой результат хотите получить.'],
        ].map(([question, answer]) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: answer,
          },
        })),
      },
    ];
  }

  if (route.schemaType === 'CreativeWork') {
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      headline: route.title,
      name: route.title,
      description: route.description,
      url,
      inLanguage: 'ru-RU',
      datePublished: '2026-08-05',
      dateModified: lastmod,
      image: defaultImage,
      author: { '@id': `${siteUrl}/#person` },
      publisher: { '@id': `${siteUrl}/#identity` },
      mainEntityOfPage: url,
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': route.schemaType || 'WebPage',
    name: route.title,
    description: route.description,
    url,
    inLanguage: 'ru-RU',
  };
}

function jsonLd(route) {
  return [...baseStructuredData(route), routeStructuredData(route)].flat()
    .map((item) => `<script type="application/ld+json" data-seo-json-ld="true">${JSON.stringify(item)}</script>`)
    .join('\n    ');
}

function routeHeading(route) {
  return route.title.split(' — ')[0].split(' | ')[0];
}

function renderStaticFallback(route) {
  const crumbs = breadcrumbItems(route.path);
  const helpfulLinks = [
    { label: 'Услуги', href: '/services' },
    { label: 'Цены', href: '/prices' },
    { label: 'Полезное', href: '/useful' },
    { label: 'Контакты', href: '/contacts' },
  ].filter((link) => link.href !== route.path);

  return `<div id="root"><main style="max-width:1120px;margin:0 auto;padding:48px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;background:#fff;">
      <nav aria-label="Хлебные крошки" style="font-size:14px;color:#667085;margin-bottom:32px;">
        ${crumbs.map((item, index) => `${index > 0 ? '<span aria-hidden="true" style="margin:0 8px;">/</span>' : ''}<a href="${escapeHtml(item.href)}" style="color:#475467;text-decoration:none;">${escapeHtml(item.label)}</a>`).join('')}
      </nav>
      <section>
        <p style="margin:0 0 12px;color:#2563eb;font-size:15px;font-weight:700;">AY Digital</p>
        <h1 style="max-width:880px;margin:0 0 18px;font-size:clamp(36px,7vw,72px);line-height:.95;letter-spacing:-.02em;">${escapeHtml(routeHeading(route))}</h1>
        <p style="max-width:760px;margin:0 0 28px;color:#475467;font-size:20px;line-height:1.55;">${escapeHtml(route.description)}</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;">
          ${helpfulLinks.map((link) => `<a href="${escapeHtml(link.href)}" style="border:1px solid #d0d5dd;border-radius:999px;padding:12px 18px;color:#111827;text-decoration:none;font-weight:700;">${escapeHtml(link.label)}</a>`).join('')}
        </div>
      </section>
    </main></div>`;
}

function replaceOrInsertMeta(html, selectorPattern, replacement, before = '<title>') {
  if (selectorPattern.test(html)) {
    return html.replace(selectorPattern, replacement);
  }

  return html.replace(before, `${replacement}\n    ${before}`);
}

function renderHtml(baseHtml, route) {
  const canonical = absoluteUrl(route.path);
  const robots = route.noindex ? 'noindex, follow' : 'index, follow';
  let html = baseHtml;

  html = html.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(route.title)}</title>`);
  html = replaceOrInsertMeta(html, /<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(route.description)}" />`);
  html = replaceOrInsertMeta(html, /<meta\s+name="robots"\s+content="[^"]*"\s*\/>/, `<meta name="robots" content="${robots}" />`);
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`);
  html = replaceOrInsertMeta(html, /<link\s+rel="alternate"\s+hreflang="ru-RU"\s+href="[^"]*"\s*\/>/, `<link rel="alternate" hreflang="ru-RU" href="${canonical}" />`);
  html = replaceOrInsertMeta(html, /<link\s+rel="alternate"\s+hreflang="x-default"\s+href="[^"]*"\s*\/>/, `<link rel="alternate" hreflang="x-default" href="${canonical}" />`);
  html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(route.title)}" />`);
  html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(route.description)}" />`);
  html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`);
  html = html.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/, `<meta property="og:image" content="${defaultImage}" />`);
  html = replaceOrInsertMeta(html, /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/>/, `<meta property="og:image:alt" content="${escapeHtml(route.title)}" />`);
  html = replaceOrInsertMeta(html, /<meta\s+property="og:image:width"\s+content="[^"]*"\s*\/>/, '<meta property="og:image:width" content="1200" />');
  html = replaceOrInsertMeta(html, /<meta\s+property="og:image:height"\s+content="[^"]*"\s*\/>/, '<meta property="og:image:height" content="630" />');
  html = html.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`);
  html = html.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${escapeHtml(route.description)}" />`);
  html = html.replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/, `<meta name="twitter:image" content="${defaultImage}" />`);
  html = replaceOrInsertMeta(html, /<meta\s+name="twitter:image:alt"\s+content="[^"]*"\s*\/>/, `<meta name="twitter:image:alt" content="${escapeHtml(route.title)}" />`);
  html = html.replace(/\n\s*<script type="application\/ld\+json" data-seo-json-ld="true">.*?<\/script>/gs, '');
  html = html.replace('</head>', `    ${jsonLd(route)}\n  </head>`);
  html = html.replace(/<div id="root"><\/div>/, renderStaticFallback(route));

  return html;
}

function writeRouteHtml(baseHtml, route) {
  const html = renderHtml(baseHtml, route);
  const targets = route.path === '/'
    ? [join(distDir, 'index.html')]
    : [join(distDir, route.path.slice(1), 'index.html'), join(distDir, `${route.path.slice(1)}.html`)];

  targets.forEach((target) => {
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, html);
  });
}

function renderSitemap() {
  const rows = sitemapRoutes
    .map((route) => `  <url>
    <loc>${absoluteUrl(route.path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(2)}</priority>
  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows}
</urlset>
`;
}

function renderRobots() {
  return `User-agent: *
Allow: /
Disallow: /cart
Disallow: /checkout
Disallow: /admin

Sitemap: ${siteUrl}/sitemap.xml
`;
}

const baseHtml = readFileSync(join(distDir, 'index.html'), 'utf8');
routes.forEach((route) => writeRouteHtml(baseHtml, route));

const sitemap = renderSitemap();
writeFileSync(join(publicDir, 'sitemap.xml'), sitemap);
writeFileSync(join(distDir, 'sitemap.xml'), sitemap);

const robots = renderRobots();
writeFileSync(join(publicDir, 'robots.txt'), robots);
writeFileSync(join(distDir, 'robots.txt'), robots);

writeFileSync(
  join(distDir, 'seo-route-manifest.json'),
  `${JSON.stringify(
    routes.map((route) => ({
      path: route.path,
      title: route.title,
      description: route.description,
      noindex: Boolean(route.noindex),
      schemaType: route.schemaType || 'WebPage',
    })),
    null,
    2,
  )}\n`,
);

console.log(`[seo] Generated ${sitemapRoutes.length} sitemap URLs and ${routes.length} prerendered HTML files.`);
