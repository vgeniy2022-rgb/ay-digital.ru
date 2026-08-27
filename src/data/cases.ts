export type CaseImage = {
  id: string;
  label: string;
  alt: string;
  width: number;
  height: number;
  loading: 'eager' | 'lazy';
  decoding: 'async';
  fetchPriority?: 'high' | 'auto';
};

export type ProjectCase = {
  slug: string;
  path: string;
  title: string;
  shortDescription: string;
  category: string;
  serviceSlug: string;
  date: string;
  clientType: string;
  task: string;
  initialSituation: string;
  workCompleted: string[];
  technologies: string[];
  challenges: { title: string; description: string }[];
  result: string[];
  images: CaseImage[];
  imageAlt: string;
  relatedServices: { label: string; href: string }[];
  relatedArticles: { label: string; href: string }[];
  published: boolean;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  draftNote?: string;
  projectPrice?: string;
  developmentTime?: string;
};

export const projectCases: ProjectCase[] = [
  {
    slug: 'ay-digital-personal-website',
    path: '/cases/ay-digital-personal-website',
    title: 'Сайт-портфолио SITEVL',
    shortDescription:
      'Сайт услуг частного IT-специалиста: страницы услуг, цен, кейсов, контактов и полезных материалов с SEO-структурой и prerender.',
    category: 'Сайт услуг',
    serviceSlug: 'website-development',
    date: '2026-08-05',
    clientType: 'Личный проект',
    task:
      'Собрать многостраничный сайт для услуг Александра с понятной навигацией, ценами, контактами, полезными материалами и технической SEO-подготовкой.',
    initialSituation:
      'Нужен был собственный сайт, который аккуратно объясняет направления работы: сайты, веб-приложения, компьютерная помощь, настройка техники и перенос данных.',
    workCompleted: [
      'реализована многостраничная структура на React, Vite и TypeScript',
      'добавлены страницы услуг, цен, кейсов, контактов, о специалисте и полезных материалов',
      'подготовлена адаптивная вёрстка под телефон, планшет и компьютер',
      'настроены sitemap, robots, canonical, Open Graph, Twitter Card и structured data',
      'добавлен prerender HTML для ключевых SEO-страниц',
      'подготовлено размещение на Vercel',
    ],
    technologies: ['React', 'Vite', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'React Router', 'Vercel'],
    challenges: [
      {
        title: 'SEO для SPA',
        description:
          'React-сайт должен оставаться удобным для пользователя и при этом отдавать поисковым системам понятные title, description, canonical, sitemap и JSON-LD.',
      },
      {
        title: 'Много направлений без перегруза',
        description:
          'Услуги, цены, полезные материалы и кейсы нужно было связать внутренними ссылками, не превращая страницы в тяжёлые списки.',
      },
    ],
    result: [
      'подготовлен сайт услуг с отдельными разделами и SEO-страницами',
      'созданы технические SEO-файлы и структурированные данные',
      'сайт адаптирован под мобильные устройства',
      'контент можно развивать дальше через полезные материалы и кейсы',
    ],
    images: [
      {
        id: 'website-desktop',
        label: 'Главная страница',
        alt: 'Реальный экран главной страницы сайта SITEVL',
        width: 1200,
        height: 760,
        loading: 'eager',
        decoding: 'async',
        fetchPriority: 'high',
      },
      {
        id: 'website-mobile',
        label: 'Мобильная версия',
        alt: 'Реальный экран адаптивной страницы сайта SITEVL',
        width: 720,
        height: 960,
        loading: 'lazy',
        decoding: 'async',
      },
    ],
    imageAlt: 'Светлый макет сайта SITEVL с десктопной и мобильной версией',
    relatedServices: [
      { label: 'Создание сайтов', href: '/website-development-vladivostok' },
      { label: 'Сайт с админкой', href: '/website-admin-vladivostok' },
      { label: 'Цены на сайты', href: '/prices/websites' },
    ],
    relatedArticles: [
      { label: 'Когда бизнесу нужен сайт', href: '/useful/when-business-needs-website' },
      { label: 'Как выбрать разработчика сайта', href: '/useful/how-to-choose-website-developer' },
      { label: 'Что такое сайт с админкой', href: '/useful/what-is-admin-website' },
    ],
    published: true,
    featured: true,
    seoTitle: 'Кейс: сайт-портфолио SITEVL на React и Vite',
    seoDescription:
      'Кейс сайта-портфолио SITEVL: React, Vite, TypeScript, адаптивная структура, страницы услуг, цен, кейсов, контактов, sitemap, robots, structured data и prerender.',
  },
  {
    slug: 'marine-equipment-catalog',
    path: '/cases/marine-equipment-catalog',
    title: 'Каталог морского оборудования',
    shortDescription:
      'Проект каталога товаров с категориями, поиском, фильтрами, карточками, PDF-документами, формами связи и админкой на Supabase.',
    category: 'Каталог товаров',
    serviceSlug: 'web-application',
    date: '2026-08-05',
    clientType: 'Небольшой проект без публичного названия клиента',
    task:
      'Разработать каталог морского оборудования с большим количеством товаров, поиском, фильтрами, карточками товаров, документами и управлением через админку.',
    initialSituation:
      'Для проекта требовалась система, где можно структурировать до примерно 1000 товаров, разделить их по категориям и подкатегориям, хранить изображения и PDF-документы.',
    workCompleted: [
      'реализована структура каталога с категориями и подкатегориями',
      'добавлен поиск по названию, артикулу и производителю',
      'подготовлены фильтры и карточки товаров',
      'заложена поддержка нескольких изображений и PDF-документов',
      'реализованы формы связи',
      'подготовлен адаптивный интерфейс',
      'создана админка с Supabase Auth, CRUD, Storage и RLS',
    ],
    technologies: ['React', 'Vite', 'TypeScript', 'Supabase Auth', 'Supabase Storage', 'RLS', 'CRUD'],
    challenges: [
      {
        title: 'Структура большого каталога',
        description:
          'Каталог должен поддерживать категории, подкатегории и поиск по нескольким полям, чтобы товары было проще находить и администрировать.',
      },
      {
        title: 'Админка и права доступа',
        description:
          'Для управления товарами подготовлена админка с авторизацией, CRUD-операциями, файловым хранилищем и правилами RLS.',
      },
    ],
    result: [
      'разработан проект каталога товаров с адаптивным интерфейсом',
      'реализована система управления товарами и файлами',
      'подготовлена архитектура для наполнения и тестирования каталога',
      'название клиента не публикуется',
    ],
    images: [
      {
        id: 'catalog-grid',
        label: 'Каталог товаров',
        alt: 'Рабочий процесс подготовки интерфейса каталога морского оборудования',
        width: 1200,
        height: 760,
        loading: 'eager',
        decoding: 'async',
        fetchPriority: 'high',
      },
      {
        id: 'catalog-admin',
        label: 'Панель управления',
        alt: 'Рабочий процесс настройки панели управления каталогом и документами',
        width: 1200,
        height: 760,
        loading: 'lazy',
        decoding: 'async',
      },
    ],
    imageAlt: 'Интерфейс каталога морского оборудования с поиском, фильтрами и админкой',
    relatedServices: [
      { label: 'Веб-приложения', href: '/services' },
      { label: 'Создание сайтов', href: '/website-development-vladivostok' },
      { label: 'Сайт с админкой', href: '/website-admin-vladivostok' },
    ],
    relatedArticles: [
      { label: 'Что такое сайт с админкой', href: '/useful/what-is-admin-website' },
      { label: 'Когда нужна автоматизация бизнеса', href: '/useful/when-business-needs-automation' },
      { label: 'Что такое MVP', href: '/useful/what-is-mvp' },
    ],
    published: true,
    featured: true,
    seoTitle: 'Кейс: каталог морского оборудования на React и Supabase',
    seoDescription:
      'Кейс каталога морского оборудования: до примерно 1000 товаров, категории, поиск, фильтры, PDF-документы, формы связи, админка, Supabase Auth, CRUD, Storage и RLS.',
  },
];

export const publishedCases = projectCases.filter((item) => item.published);
export const featuredCases = publishedCases.filter((item) => item.featured);
