import type { WebsiteProjectTypeId } from './websiteCalculator';

export type BuilderBusinessId =
  | 'cafe'
  | 'restaurant'
  | 'salon'
  | 'master'
  | 'car-service'
  | 'shop'
  | 'construction'
  | 'photographer'
  | 'specialist'
  | 'supplier'
  | 'production'
  | 'other';

export type BuilderBusiness = {
  id: BuilderBusinessId;
  label: string;
  previewTitle: string;
  previewSubtitle: string;
};

export type BuilderPageOption = {
  id: string;
  label: string;
};

export type BuilderFeatureOption = {
  id: string;
  label: string;
  calculationId?: string;
};

export type BudgetRecommendation = {
  id: string;
  label: string;
  project: string;
  description: string;
  features: string[];
  limits: string;
};

export type BusinessStructure = {
  pages: string[];
  emphasis: string;
};

export const builderBusinesses: BuilderBusiness[] = [
  { id: 'cafe', label: 'Кафе', previewTitle: 'Маяк', previewSubtitle: 'Кофе, завтраки и встречи у моря' },
  { id: 'restaurant', label: 'Ресторан', previewTitle: 'Порт', previewSubtitle: 'Современная кухня Владивостока' },
  { id: 'salon', label: 'Салон', previewTitle: 'Forma', previewSubtitle: 'Уход, стиль и спокойный сервис' },
  { id: 'master', label: 'Мастер', previewTitle: 'Мастерская', previewSubtitle: 'Частная услуга с понятной записью' },
  { id: 'car-service', label: 'Автосервис', previewTitle: 'VL Garage', previewSubtitle: 'Диагностика и обслуживание автомобилей' },
  { id: 'shop', label: 'Магазин', previewTitle: 'Север', previewSubtitle: 'Товары с удобным выбором и заказом' },
  { id: 'construction', label: 'Строительная компания', previewTitle: 'Контур', previewSubtitle: 'Строительство и ремонт под ключ' },
  { id: 'photographer', label: 'Фотограф', previewTitle: 'Lightroom VL', previewSubtitle: 'Истории, портреты и события' },
  { id: 'specialist', label: 'Специалист', previewTitle: 'Александр', previewSubtitle: 'Личная услуга и прямой контакт' },
  { id: 'supplier', label: 'Поставщик', previewTitle: 'Pacific Supply', previewSubtitle: 'Оборудование, документы и поставки' },
  { id: 'production', label: 'Производство', previewTitle: 'Вектор', previewSubtitle: 'Производственные решения для бизнеса' },
  { id: 'other', label: 'Другое', previewTitle: 'Новый проект', previewSubtitle: 'Сайт под конкретную задачу' },
];

export const builderPages: BuilderPageOption[] = [
  { id: 'home', label: 'Главная' },
  { id: 'services', label: 'Услуги' },
  { id: 'about', label: 'О компании' },
  { id: 'prices', label: 'Цены' },
  { id: 'cases', label: 'Кейсы' },
  { id: 'catalog', label: 'Каталог' },
  { id: 'blog', label: 'Блог' },
  { id: 'contacts', label: 'Контакты' },
  { id: 'faq', label: 'FAQ' },
];

export const builderFeatures: BuilderFeatureOption[] = [
  { id: 'forms', label: 'Формы', calculationId: 'forms' },
  { id: 'telegram', label: 'Telegram', calculationId: 'messengers' },
  { id: 'whatsapp', label: 'WhatsApp', calculationId: 'messengers' },
  { id: 'search', label: 'Поиск', calculationId: 'search' },
  { id: 'filters', label: 'Фильтры', calculationId: 'filters' },
  { id: 'catalog', label: 'Каталог', calculationId: 'catalog' },
  { id: 'admin', label: 'Админка', calculationId: 'admin' },
  { id: 'database', label: 'База данных', calculationId: 'database' },
  { id: 'account', label: 'Личный кабинет', calculationId: 'account' },
  { id: 'api', label: 'API', calculationId: 'integrations' },
  { id: 'integrations', label: 'Интеграции', calculationId: 'integrations' },
  { id: 'animations', label: 'Анимации', calculationId: 'animations' },
  { id: 'seo', label: 'SEO-подготовка', calculationId: 'seo' },
];

export const defaultBuilderPages = ['home', 'services', 'prices', 'contacts'];
export const defaultBuilderFeatures = ['forms', 'telegram', 'seo'];

export const budgetRecommendations: BudgetRecommendation[] = [
  {
    id: '5000',
    label: 'до 5 000 ₽',
    project: 'Подготовительный этап или компактная визитка',
    description: 'Можно разобрать задачу, подготовить структуру, прототип или собрать очень компактную первую версию из готового контента.',
    features: ['структура', 'одна страница', 'контакты'],
    limits: 'Сложный дизайн, каталог, админка и интеграции в такой бюджет обычно не помещаются.',
  },
  {
    id: '15000',
    label: 'до 15 000 ₽',
    project: 'Сайт-визитка или базовый лендинг',
    description: 'Подходит для специалиста или одной услуги, когда нужно понятно показать предложение и дать быстрый способ связи.',
    features: ['адаптив', 'основные блоки', 'Telegram / WhatsApp'],
    limits: 'Контент готовит заказчик; сложная логика и самостоятельное управление не входят.',
  },
  {
    id: '30000',
    label: 'до 30 000 ₽',
    project: 'Лендинг или небольшой многостраничный сайт',
    description: 'Можно собрать более полную структуру, добавить услуги, цены, кейсы, FAQ и формы заявок.',
    features: ['несколько страниц', 'формы', 'базовая SEO-подготовка'],
    limits: 'Админка, большой каталог и личный кабинет оцениваются отдельно.',
  },
  {
    id: '50000',
    label: 'до 50 000 ₽',
    project: 'Сайт с админкой или первая версия каталога',
    description: 'Реалистичен сайт, где можно самостоятельно менять основные данные, либо компактный каталог без сложной бизнес-логики.',
    features: ['админка', 'структурированные данные', 'формы и интеграции'],
    limits: 'Объём каталога, роли, импорт данных и нестандартные интеграции требуют отдельной оценки.',
  },
  {
    id: '70000',
    label: '70 000 ₽+',
    project: 'Каталог или индивидуальная система',
    description: 'Бюджет позволяет обсуждать базу данных, поиск, фильтры, роли, API и специализированные рабочие сценарии.',
    features: ['архитектура', 'database', 'API / интеграции'],
    limits: 'Точная граница зависит от данных, ролей, интеграций и требований к админке.',
  },
];

export const businessStructures: Record<BuilderBusinessId, BusinessStructure> = {
  cafe: { pages: ['Главная', 'Меню', 'Атмосфера', 'Отзывы', 'Контакты'], emphasis: 'меню, адрес, часы работы и быстрый маршрут' },
  restaurant: { pages: ['Главная', 'Меню', 'О ресторане', 'События', 'Бронирование', 'Контакты'], emphasis: 'кухня, атмосфера и бронирование' },
  salon: { pages: ['Главная', 'Услуги', 'Цены', 'Мастера', 'Работы', 'Отзывы', 'Контакты'], emphasis: 'услуги, портфолио и запись' },
  master: { pages: ['Главная', 'Услуги', 'Цены', 'Работы', 'Отзывы', 'Контакты'], emphasis: 'личное доверие и прямой контакт' },
  'car-service': { pages: ['Главная', 'Услуги', 'Цены', 'Работы', 'Отзывы', 'Контакты'], emphasis: 'понятные работы, стоимость и запись' },
  shop: { pages: ['Главная', 'Каталог', 'Категории', 'Доставка', 'О магазине', 'Контакты'], emphasis: 'поиск товара и оформление обращения' },
  construction: { pages: ['Главная', 'Услуги', 'Проекты', 'Этапы', 'О компании', 'Контакты'], emphasis: 'проекты, процесс и доверие' },
  photographer: { pages: ['Главная', 'Портфолио', 'Форматы съёмки', 'Цены', 'Обо мне', 'Контакты'], emphasis: 'работы, стиль и свободные даты' },
  specialist: { pages: ['Главная', 'Услуги', 'Цены', 'О специалисте', 'Отзывы', 'Контакты'], emphasis: 'экспертность, цена и простой контакт' },
  supplier: { pages: ['Главная', 'Каталог', 'Категории', 'Карточка товара', 'Документы', 'О компании', 'Контакты'], emphasis: 'каталог, характеристики и документы' },
  production: { pages: ['Главная', 'Продукция', 'Возможности', 'Проекты', 'О компании', 'Контакты'], emphasis: 'мощности, продукция и условия работы' },
  other: { pages: ['Главная', 'Услуги', 'О проекте', 'Контакты'], emphasis: 'основное предложение и следующий шаг' },
};

export const complexityLevels: Array<{
  level: number;
  projectTypeId: WebsiteProjectTypeId;
  title: string;
  description: string;
  layers: string[];
}> = [
  { level: 1, projectTypeId: 'business-card', title: 'Визитка', description: 'Одна понятная точка входа: услуга, доверие и контакт.', layers: ['Frontend'] },
  { level: 2, projectTypeId: 'landing', title: 'Лендинг', description: 'Сценарий под одно предложение, формы и аналитика.', layers: ['Frontend', 'Forms'] },
  { level: 3, projectTypeId: 'multipage', title: 'Многостраничный', description: 'Разделы, навигация, материалы и внутренняя перелинковка.', layers: ['Frontend', 'Routing', 'SEO'] },
  { level: 4, projectTypeId: 'admin', title: 'Админка', description: 'Контент меняется через интерфейс управления.', layers: ['Frontend', 'API', 'Admin'] },
  { level: 5, projectTypeId: 'catalog', title: 'Каталог', description: 'Товары, поиск, фильтры, файлы и база данных.', layers: ['Frontend', 'Search', 'Database', 'Storage', 'Admin'] },
  { level: 6, projectTypeId: 'custom', title: 'Индивидуальная система', description: 'Роли, интеграции и логика под рабочий процесс.', layers: ['Frontend', 'API', 'Database', 'Integrations', 'Admin'] },
];

export const architectureNodes = [
  { id: 'user', label: 'Пользователь', simple: 'Человек открывает сайт и выполняет нужное действие.', technical: 'Browser отправляет запросы и отображает клиентский интерфейс.' },
  { id: 'frontend', label: 'Frontend', simple: 'То, что человек видит и чем управляет на экране.', technical: 'React UI, маршрутизация, состояние и клиентская валидация.' },
  { id: 'api', label: 'API', simple: 'Передаёт данные между интерфейсом и системой.', technical: 'Контракт запросов, авторизация, валидация и бизнес-логика.' },
  { id: 'database', label: 'Database', simple: 'Здесь могут храниться товары, цены, категории и другие данные.', technical: 'Структурированные сущности, связи, индексы и политики доступа.' },
  { id: 'storage', label: 'Storage', simple: 'Хранит фотографии, документы и другие файлы.', technical: 'Объектное хранилище, публичные URL и правила доступа.' },
  { id: 'admin', label: 'Admin', simple: 'Позволяет менять содержимое сайта без правки кода.', technical: 'Admin UI вызывает API, которое обновляет данные и публичный frontend.' },
];

export const optionalArchitectureNodes = [
  { id: 'search', label: 'Search', description: 'Поиск по товарам, услугам или материалам.' },
  { id: 'analytics', label: 'Analytics', description: 'События и данные для оценки поведения пользователей.' },
  { id: 'telegram', label: 'Telegram', description: 'Уведомления и быстрый канал связи.' },
  { id: 'crm', label: 'CRM', description: 'Передача обращений в систему работы с клиентами.' },
  { id: 'payments', label: 'Payments', description: 'Подключается только когда проекту действительно нужна онлайн-оплата.' },
];

export const projectRoadmap = ['Идея', 'Структура', 'Дизайн', 'Разработка', 'Тестирование', 'Публикация'];

export const projectAvailability = {
  isVisible: false,
  status: 'accepting' as 'accepting' | 'limited' | 'busy' | 'window',
  title: 'Принимаю новые проекты',
  text: 'Доступность задаётся вручную после проверки реальной загрузки.',
  windowDate: '',
  activeProjects: null as number | null,
};

export const projectQueue = {
  isVisible: false,
  title: 'Очередь проектов',
  items: [] as string[],
};

export const changelogEntries = [
  {
    date: '2026-08-27',
    status: 'Готово к публикации',
    title: 'SITEVL Experience 2026',
    items: ['SITEVL LAB', 'конструктор сайтов', 'демо админ-панели', 'исследователь архитектуры', 'интерактивный бриф и палитра команд'],
  },
];
