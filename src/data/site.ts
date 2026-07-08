import {
  AppWindow,
  ClipboardCheck,
  Code2,
  Computer,
  FileText,
  Laptop,
  LucideIcon,
  Map,
  MonitorCog,
  Presentation,
  Smartphone,
  UsersRound,
  Wrench,
} from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
};

export type Service = {
  title: string;
  shortTitle: string;
  slug: string;
  path: string;
  lead: string;
  description: string;
  bullets: string[];
  outcome: string;
  icon: LucideIcon;
};

export type PriceGroup = {
  title: string;
  note?: string;
  items: {
    name: string;
    price: string;
  }[];
};

export type CaseItem = {
  title: string;
  description: string;
  tags: string[];
  icon: LucideIcon;
};

export const site = {
  name: 'Александр',
  domain: 'ay-digital.ru',
  location: 'Владивосток и удалённо',
  tagline: 'Сайты, приложения, техника и IT-помощь',
  description:
    'Помогаю обычным людям и небольшим проектам решать цифровые задачи: сделать сайт, собрать приложение, оформить презентацию, выбрать технику или настроить компьютер. Работаю во Владивостоке и удалённо.',
  telegramUsername: 'AYDigitaLRu',
  telegramUrl: 'https://t.me/AYDigitaLRu',
  whatsappUrl: 'https://wa.me/79241308626',
  whatsappSecondaryUrl: 'https://wa.me/79532150050',
  phoneUrl: 'tel:+79241308626',
  smsUrl: 'sms:+79241308626',
  phones: ['+7 924 130-86-26', '+7 953 215-00-50'],
};

export const navItems: NavItem[] = [
  { label: 'Услуги', href: '/services' },
  { label: 'Цены', href: '/prices' },
  { label: 'Кейсы', href: '/cases' },
  { label: 'Обо мне', href: '/about' },
  { label: 'Контакты', href: '/contacts' },
];

export const services: Service[] = [
  {
    title: 'Сайты под ключ',
    shortTitle: 'Сайты',
    slug: 'websites',
    path: '/services/websites',
    lead: 'Аккуратные сайты для специалистов, услуг и небольших проектов.',
    description:
      'Соберу понятную структуру, современный внешний вид, адаптивную верстку и базовую подготовку к запуску.',
    bullets: ['Сайт-визитка', 'Лендинг', 'Многостраничный сайт', 'Подготовка к запуску'],
    outcome: 'На выходе: готовый сайт с чистым интерфейсом и понятной подачей услуг.',
    icon: Code2,
  },
  {
    title: 'Приложения',
    shortTitle: 'Приложения',
    slug: 'apps',
    path: '/services/apps',
    lead: 'Прототипы, простые приложения и MVP для проверки идеи.',
    description:
      'Помогу оформить идею в работающий интерфейс: от первого прототипа до простой версии продукта.',
    bullets: ['Прототип', 'Простое приложение', 'MVP', 'Проверка идеи'],
    outcome: 'На выходе: понятная первая версия, которую можно показать, протестировать и развивать.',
    icon: AppWindow,
  },
  {
    title: 'Предварительный аудит сайта на риски штрафов',
    shortTitle: 'Аудит сайта',
    slug: 'audit',
    path: '/services/audit',
    lead: 'Быстрая проверка заметных юридических и технических рисков.',
    description:
      'Посмотрю сайт глазами пользователя и владельца: формы, тексты, контакты, базовые элементы доверия и возможные зоны риска.',
    bullets: ['Проверка страниц', 'Риски по формам и контактам', 'Список замечаний', 'Приоритеты исправлений'],
    outcome: 'На выходе: короткий список рисков и понятных действий без сложной терминологии.',
    icon: ClipboardCheck,
  },
  {
    title: 'Презентации и коммерческие материалы',
    shortTitle: 'Презентации',
    slug: 'presentations',
    path: '/services/presentations',
    lead: 'Презентации, коммерческие предложения и PDF без визуального шума.',
    description:
      'Помогу собрать структуру, привести текст в порядок и оформить материал в современном деловом стиле.',
    bullets: ['Презентации до 5 слайдов', 'Презентации 6-12 слайдов', 'Большие презентации', 'Коммерческие предложения'],
    outcome: 'На выходе: материал, который проще отправить клиенту, партнеру или команде.',
    icon: Presentation,
  },
  {
    title: 'Консультация и подбор техники',
    shortTitle: 'Подбор техники',
    slug: 'tech',
    path: '/services/tech',
    lead: 'Помогу выбрать смартфон, ноутбук, MacBook или комплект техники под задачи.',
    description:
      'Разберу сценарии использования, бюджет, важные ограничения и предложу варианты без переплаты за лишнее.',
    bullets: ['Смартфоны', 'Ноутбуки и MacBook', 'Сравнение моделей', 'Сопровождение покупки'],
    outcome: 'На выходе: понятные варианты покупки и объяснение, почему они подходят.',
    icon: Laptop,
  },
  {
    title: 'Удалённая помощь Windows/macOS',
    shortTitle: 'Удалённая помощь',
    slug: 'remote-help',
    path: '/services/remote-help',
    lead: 'Быстро помогу с настройками, программами и повседневными цифровыми вопросами.',
    description:
      'Подключусь удаленно, помогу разобраться с системой, приложениями, аккаунтами и типовыми неполадками.',
    bullets: ['Настройка Windows', 'Настройка macOS', 'Установка программ', 'Помощь с аккаунтами'],
    outcome: 'На выходе: настроенное рабочее устройство и спокойное понимание, что было сделано.',
    icon: MonitorCog,
  },
  {
    title: 'Компьютерная помощь и настройка техники',
    shortTitle: 'Компьютерная помощь',
    slug: 'computer-help',
    path: '/services/computer-help',
    lead: 'Диагностика, настройка, перенос данных и помощь с техникой во Владивостоке.',
    description:
      'Помогу привести компьютер или ноутбук в порядок, перенести данные, заменить накопитель и настроить систему.',
    bullets: ['Диагностика', 'Настройка компьютера', 'Установка SSD', 'Выезд по Владивостоку'],
    outcome: 'На выходе: техника, которой снова удобно пользоваться каждый день.',
    icon: Wrench,
  },
];

export const priceGroups: PriceGroup[] = [
  {
    title: 'Сайты',
    items: [
      { name: 'Сайт-визитка', price: '3 000–30 000 ₽' },
      { name: 'Лендинг', price: '8 000–50 000 ₽' },
      { name: 'Многостраничный сайт', price: 'от 15 000 ₽' },
    ],
  },
  {
    title: 'Приложения',
    items: [
      { name: 'Прототип приложения', price: '1 000–5 000 ₽' },
      { name: 'Простое приложение', price: '5 000–10 000 ₽' },
      { name: 'MVP приложения', price: '15 000–50 000 ₽' },
    ],
  },
  {
    title: 'Аудит сайта',
    note: 'Предварительная проверка сайта на очевидные риски. Не является юридическим заключением.',
    items: [{ name: 'Предварительный аудит сайта на риски штрафов', price: '2 000 ₽' }],
  },
  {
    title: 'Презентации',
    items: [
      { name: 'Презентация до 5 слайдов', price: '500 ₽' },
      { name: 'Презентация до 12 слайдов', price: '2 000 ₽' },
      { name: 'Большая презентация', price: '2 000–7 000 ₽' },
    ],
  },
  {
    title: 'Консультация и подбор техники',
    items: [
      { name: 'Консультация по выбору и покупке техники', price: '500–1 000 ₽' },
      { name: 'Подбор смартфона', price: '300–1 000 ₽' },
      { name: 'Подбор ноутбука / MacBook', price: '500–1 500 ₽' },
      { name: 'Сопровождение покупки', price: '2 000–5 000 ₽' },
    ],
  },
  {
    title: 'Удалённая помощь',
    items: [
      { name: 'Установка программ', price: '900–3 000 ₽' },
      { name: 'Настройка Windows/macOS', price: '4 000–6 000 ₽' },
    ],
  },
  {
    title: 'Компьютерная помощь',
    items: [
      { name: 'Диагностика ПК/ноутбука', price: '1 000 ₽' },
      { name: 'Настройка компьютера', price: '2 000 ₽' },
      { name: 'Установка SSD / замена накопителя', price: '1 000 ₽ + стоимость SSD' },
      { name: 'Выезд по Владивостоку', price: '500 ₽' },
    ],
  },
];

export const cases: CaseItem[] = [
  {
    title: 'Внутреннее приложение для сменных отчётов',
    description:
      'Приложение для магазина техники: учёт продаж, товаров, расходов, списаний и итогов смены. Помогает быстрее собирать дневной отчёт и хранить историю.',
    tags: ['iOS', 'SwiftUI', 'Учёт', 'Автоматизация'],
    icon: ClipboardCheck,
  },
  {
    title: 'Приложение для проверки знаний сотрудников',
    description:
      'Прототип приложения для тестирования персонала: вход по номеру сотрудника, вопросы, ответы, отправка результатов и структура для проверки руководителем.',
    tags: ['iOS', 'Тесты', 'Google Sheets', 'Персонал'],
    icon: UsersRound,
  },
  {
    title: 'Прототип приложения с картой и AR-навигацией',
    description:
      'Демо-приложение с режимами Demo и Real Mode, пользователями рядом, картой и подготовкой архитектуры под будущий backend.',
    tags: ['iOS', 'AR', 'Карта', 'MVP'],
    icon: Map,
  },
  {
    title: 'Презентация для партнёрского проекта',
    description:
      'Структура презентации с логикой заработка, этапами подключения, объяснением модели выплат и понятной подачей для клиента.',
    tags: ['Презентация', 'Структура', 'Продажи', 'PDF'],
    icon: FileText,
  },
  {
    title: 'Подбор MacBook, iPhone и техники под бюджет',
    description:
      'Помощь в выборе техники без переплаты: разбор задач, моделей, памяти, состояния устройства, плюсов и ограничений перед покупкой.',
    tags: ['Apple', 'Samsung', 'Xiaomi', 'Консультация'],
    icon: Laptop,
  },
  {
    title: 'Удалённая настройка компьютера',
    description:
      'Помощь с установкой программ, настройкой системы, ошибками, подготовкой устройства к работе и объяснением простым языком.',
    tags: ['Windows', 'macOS', 'AnyDesk', 'Помощь'],
    icon: Computer,
  },
  {
    title: 'Сайт-визитка для личной услуги',
    description:
      'Многостраничный сайт с услугами, ценами, контактами, формой заявки, адаптацией под телефон и чистым современным дизайном.',
    tags: ['React', 'Vite', 'Сайт', 'Дизайн'],
    icon: Smartphone,
  },
];

export const aboutText =
  'Меня зовут Александр. Я помогаю людям разбираться с техникой, сайтами, приложениями и цифровыми задачами. Работаю с устройствами Apple, Samsung, Xiaomi, Windows и macOS, создаю сайты, презентации и простые приложения. Объясняю простым языком, без лишней сложности и навязывания.';

export const trustPoints = [
  'Объясняю простым языком',
  'Работаю лично и аккуратно',
  'Подбираю решение под задачу и бюджет',
  'Помогаю во Владивостоке и удаленно',
];

export const serviceOptions = services.map((service) => service.title);

export const quickStats = [
  { value: '7', label: 'направлений помощи' },
  { value: '24/7', label: 'заявка через мессенджер' },
  { value: 'ВЛ', label: 'Владивосток и удаленно' },
];

export const contacts = [
  { label: 'Основной номер', value: '+7 924 130-86-26', href: site.phoneUrl },
  { label: 'Дополнительный номер', value: '+7 953 215-00-50', href: 'tel:+79532150050' },
  { label: 'Telegram', value: `@${site.telegramUsername}`, href: site.telegramUrl },
  { label: 'WhatsApp основной', value: '+7 924 130-86-26', href: site.whatsappUrl },
  { label: 'WhatsApp дополнительный', value: '+7 953 215-00-50', href: site.whatsappSecondaryUrl },
];

export const contactActions = {
  telegram: {
    label: 'Telegram',
    href: site.telegramUrl,
  },
  whatsappPrimary: {
    label: 'WhatsApp основной',
    href: site.whatsappUrl,
  },
  whatsappSecondary: {
    label: 'WhatsApp дополнительный',
    href: site.whatsappSecondaryUrl,
  },
  call: {
    label: 'Позвонить',
    href: site.phoneUrl,
  },
  sms: {
    label: 'SMS',
    href: site.smsUrl,
  },
};

export function createRequestText(name: string, service: string, description: string) {
  const cleanName = name.trim() || 'не указано';
  const cleanDescription = description.trim() || 'не указано';

  return `Здравствуйте, Александр! Меня зовут ${cleanName}. Интересует услуга: ${service}. Задача: ${cleanDescription}.`;
}

export function createContactHref(channel: 'telegram' | 'whatsappPrimary' | 'whatsappSecondary' | 'sms', text: string) {
  const encodedText = encodeURIComponent(text);

  if (channel === 'telegram') {
    return `${site.telegramUrl}?text=${encodedText}`;
  }

  if (channel === 'sms') {
    return `${site.smsUrl}?body=${encodedText}`;
  }

  const whatsappUrl = channel === 'whatsappSecondary' ? site.whatsappSecondaryUrl : site.whatsappUrl;
  return `${whatsappUrl}?text=${encodedText}`;
}
