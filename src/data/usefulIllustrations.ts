export type UsefulIllustrationSlot = {
  id: string;
  label: string;
  width: number;
  height: number;
  loading: 'eager' | 'lazy';
  decoding: 'async';
  fetchPriority?: 'high' | 'auto';
};

export type UsefulArticleIllustrationConfig = {
  heroImage: string;
  heroImageAlt: string;
  width: number;
  height: number;
  loading: 'eager';
  decoding: 'async';
  fetchPriority: 'high';
  slots: UsefulIllustrationSlot[];
};

const defaultConfig: UsefulArticleIllustrationConfig = {
  heroImage: 'device-workspace',
  heroImageAlt: 'Светлая технологичная иллюстрация с ноутбуком, смартфоном и чек-листом',
  width: 560,
  height: 420,
  loading: 'eager',
  decoding: 'async',
  fetchPriority: 'high',
  slots: [
    {
      id: 'checklist',
      label: 'Смысловой чек-лист по теме материала',
      width: 520,
      height: 320,
      loading: 'lazy',
      decoding: 'async',
    },
  ],
};

export const usefulIllustrations: Record<string, UsefulArticleIllustrationConfig> = {
  'speed-up-windows': {
    ...defaultConfig,
    heroImage: 'windows-performance',
    heroImageAlt: 'Ноутбук с Windows, графиком нагрузки, SSD и списком автозагрузки',
  },
  'new-laptop-setup': {
    ...defaultConfig,
    heroImage: 'new-laptop-checklist',
    heroImageAlt: 'Новый ноутбук с чек-листом первичной настройки и защитой аккаунта',
  },
  'how-to-choose-ssd': {
    ...defaultConfig,
    heroImage: 'ssd-compatibility',
    heroImageAlt: 'SSD накопитель, ноутбук и схема совместимости SATA и NVMe',
  },
  'safe-data-transfer': {
    ...defaultConfig,
    heroImage: 'safe-data-transfer',
    heroImageAlt: 'Два устройства, облачная копия и защищённый перенос файлов',
  },
  'how-to-choose-laptop': {
    ...defaultConfig,
    heroImage: 'laptop-choice',
    heroImageAlt: 'Несколько ноутбуков с параметрами экрана, памяти, батареи и задач',
  },
  'macbook-or-windows': {
    ...defaultConfig,
    heroImage: 'macbook-windows-choice',
    heroImageAlt: 'MacBook и Windows-ноутбук рядом с карточками выбора под задачи',
  },
  'how-to-choose-computer': {
    ...defaultConfig,
    heroImage: 'desktop-pc-config',
    heroImageAlt: 'Системный блок, монитор и карточки комплектующих компьютера',
  },
  'how-to-protect-computer': {
    ...defaultConfig,
    heroImage: 'computer-security',
    heroImageAlt: 'Компьютер с замком, резервной копией и настройками безопасности',
  },
  'how-to-choose-wifi-router': {
    ...defaultConfig,
    heroImage: 'wifi-router-coverage',
    heroImageAlt: 'Wi-Fi роутер с зонами покрытия квартиры и подключёнными устройствами',
  },
  'slow-internet': {
    ...defaultConfig,
    heroImage: 'internet-diagnostics',
    heroImageAlt: 'Схема проверки медленного интернета по кабелю, Wi-Fi и роутеру',
  },
  'how-to-choose-smartphone': {
    ...defaultConfig,
    heroImage: 'smartphone-choice',
    heroImageAlt: 'Смартфоны с параметрами камеры, памяти, батареи и экрана',
  },
  'what-is-business-card-website': {
    ...defaultConfig,
    heroImage: 'business-card-website',
    heroImageAlt: 'Макет сайта-визитки с услугами, ценами и контактами',
  },
  'what-is-landing-page': {
    ...defaultConfig,
    heroImage: 'landing-page-flow',
    heroImageAlt: 'Структура лендинга с первым экраном, преимуществами и кнопкой заявки',
  },
  'what-is-admin-website': {
    ...defaultConfig,
    heroImage: 'admin-website-cms',
    heroImageAlt: 'Сайт с админкой, таблицей услуг, ценами и отзывами',
  },
  'what-is-mvp': {
    ...defaultConfig,
    heroImage: 'mvp-prototype',
    heroImageAlt: 'Прототип приложения с минимальным набором функций и тестовой версией',
  },
  'when-business-needs-website': {
    ...defaultConfig,
    heroImage: 'business-website-decision',
    heroImageAlt: 'Бизнес-сайт с услугами, отзывами, FAQ и кнопками связи',
  },
  'when-business-needs-automation': {
    ...defaultConfig,
    heroImage: 'business-automation',
    heroImageAlt: 'Автоматизация бизнеса с заявками, отчётами, таблицей и статусами',
  },
  'how-to-choose-hosting': {
    ...defaultConfig,
    heroImage: 'hosting-infrastructure',
    heroImageAlt: 'Хостинг сайта, домен, SSL, резервная копия и серверная панель',
  },
  'prepare-photos-for-website': {
    ...defaultConfig,
    heroImage: 'website-photo-preparation',
    heroImageAlt: 'Подготовка фотографий для сайта: отбор, кадрирование и сжатие',
  },
  'how-to-choose-website-developer': {
    ...defaultConfig,
    heroImage: 'developer-selection',
    heroImageAlt: 'Выбор разработчика сайта по структуре работ, срокам и передаче доступов',
  },
  'data-transfer': {
    ...defaultConfig,
    heroImage: 'phone-data-transfer',
    heroImageAlt: 'Два смартфона iPhone и Android со схемой переноса фото и контактов',
  },
  'digital-hygiene': {
    ...defaultConfig,
    heroImage: 'digital-hygiene',
    heroImageAlt: 'Смартфон и ноутбук с настройками приватности, замком и щитом',
  },
  scams: {
    ...defaultConfig,
    heroImage: 'scam-warning',
    heroImageAlt: 'Смартфон с подозрительным сообщением, предупреждением и защитным щитом',
  },
  'apps-checklists': {
    ...defaultConfig,
    heroImage: 'apps-and-checklists',
    heroImageAlt: 'Планшет с чек-листом приложений, телефона и ноутбука',
  },
};

export function getUsefulIllustrationConfig(slug: string) {
  return usefulIllustrations[slug] || defaultConfig;
}
