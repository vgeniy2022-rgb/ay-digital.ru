import {
  AppWindow,
  ClipboardCheck,
  Code2,
  Laptop,
  LucideIcon,
  MonitorCog,
  Presentation,
  Smartphone,
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
  category?: string;
  lead: string;
  description: string;
  bullets: string[];
  outcome: string;
  duration?: string;
  format?: string;
  badge?: string;
  buttonText?: string;
  priceText?: string;
  isPopular?: boolean;
  showOnHome?: boolean;
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
  category?: string;
  description: string;
  problem?: string;
  solution?: string;
  result?: string;
  date?: string;
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

export const homeHero = {
  title: 'Сайты, приложения и IT-помощь во Владивостоке',
  subtitle: 'Александр — частный специалист',
  description: site.description,
};

export const navItems: NavItem[] = [
  { label: 'Услуги', href: '/services' },
  { label: 'Полезное', href: '/useful' },
  { label: 'Цены', href: '/prices' },
  { label: 'Кейсы', href: '/cases' },
  { label: 'Обо мне', href: '/about' },
  { label: 'Контакты', href: '/contacts' },
];

export const services: Service[] = [
  {
    title: 'Сайт-визитка',
    shortTitle: 'Сайт-визитка',
    slug: 'site-vizitka',
    path: '/services/site-vizitka',
    category: 'Сайты',
    lead: 'Небольшой сайт для специалиста, услуги, личного бренда или небольшого проекта.',
    description:
      'Аккуратный сайт с описанием услуг, преимуществами, контактами и кнопками связи. Подходит мастеру, консультанту, небольшому бизнесу или личному портфолио.',
    bullets: ['сайт', 'визитка', 'услуги', 'лендинг'],
    outcome: 'На выходе: понятный сайт для первого контакта с клиентом.',
    duration: 'от 1 дня',
    format: 'Удалённо',
    buttonText: 'Обсудить сайт',
    isPopular: true,
    showOnHome: true,
    icon: Code2,
  },
  {
    title: 'Лендинг под услугу',
    shortTitle: 'Лендинг',
    slug: 'landing',
    path: '/services/landing',
    category: 'Сайты',
    lead: 'Одностраничный сайт для заявки, рекламы или продажи одной услуги.',
    description:
      'Лендинг с понятной структурой: первый экран, преимущества, услуги, кейсы, отзывы, FAQ и кнопки связи. Подходит для Авито, Telegram, рекламы и запуска услуги.',
    bullets: ['лендинг', 'сайт', 'заявки', 'реклама'],
    outcome: 'На выходе: страница, которую можно использовать для рекламы и заявок.',
    duration: 'от 2 дней',
    format: 'Удалённо',
    buttonText: 'Заказать лендинг',
    isPopular: true,
    showOnHome: true,
    icon: Code2,
  },
  {
    title: 'Многостраничный сайт',
    shortTitle: 'Многостраничный сайт',
    slug: 'multi-page-website',
    path: '/services/multi-page-website',
    category: 'Сайты',
    lead: 'Сайт с несколькими страницами для услуг, портфолио, цен и контактов.',
    description:
      'Сделаю сайт со структурой из нескольких страниц: главная, услуги, цены, кейсы, о проекте, контакты и дополнительные разделы под задачу.',
    bullets: ['сайт', 'многостраничный сайт', 'услуги', 'портфолио'],
    outcome: 'На выходе: полноценная структура сайта под несколько направлений.',
    duration: 'от 3 дней',
    format: 'Удалённо',
    buttonText: 'Обсудить проект',
    showOnHome: true,
    icon: Code2,
  },
  {
    title: 'Прототип приложения',
    shortTitle: 'Прототип',
    slug: 'app-prototype',
    path: '/services/app-prototype',
    category: 'Приложения',
    lead: 'Быстрый прототип iPhone-приложения для проверки идеи.',
    description:
      'Помогу собрать первый прототип приложения: экраны, логика переходов, базовые данные и понятный интерфейс. Подходит, чтобы проверить идею перед полноценной разработкой.',
    bullets: ['приложение', 'iOS', 'прототип', 'идея'],
    outcome: 'На выходе: первая версия, которую можно показать и обсудить.',
    duration: 'от 1 дня',
    format: 'Удалённо',
    buttonText: 'Обсудить приложение',
    showOnHome: true,
    icon: AppWindow,
  },
  {
    title: 'MVP приложения',
    shortTitle: 'MVP',
    slug: 'app-mvp',
    path: '/services/app-mvp',
    category: 'Приложения',
    lead: 'Первая рабочая версия приложения с основными функциями.',
    description:
      'Сделаю MVP приложения: базовая структура, экраны, логика, хранение данных и подготовка к дальнейшему развитию. Подходит для внутреннего инструмента, теста идеи или демонстрации клиенту.',
    bullets: ['MVP', 'приложение', 'iOS', 'SwiftUI'],
    outcome: 'На выходе: рабочая основа продукта для проверки и развития.',
    duration: 'от 5 дней',
    format: 'Удалённо',
    buttonText: 'Оценить MVP',
    isPopular: true,
    showOnHome: true,
    icon: AppWindow,
  },
  {
    title: 'Предварительный аудит сайта на риски штрафов',
    shortTitle: 'Аудит сайта',
    slug: 'audit',
    path: '/services/audit',
    category: 'Аудит',
    lead: 'Быстрая проверка заметных юридических и технических рисков на сайте.',
    description:
      'Проверка сайта на очевидные red flags: отсутствие важных страниц, спорные формулировки, проблемы с обработкой данных, контактами, офертой, ценами и пользовательскими формами. Это предварительная проверка, не юридическое заключение.',
    bullets: ['аудит', 'сайт', 'штрафы', 'риски', 'закон'],
    outcome: 'На выходе: список заметных рисков и понятных следующих действий.',
    duration: '1 день',
    format: 'Удалённо',
    buttonText: 'Проверить сайт',
    isPopular: true,
    showOnHome: true,
    icon: ClipboardCheck,
  },
  {
    title: 'Презентация до 12 слайдов',
    shortTitle: 'Презентация',
    slug: 'presentations',
    path: '/services/presentations',
    category: 'Презентации',
    lead: 'Аккуратная презентация для проекта, услуги, обучения или предложения.',
    description:
      'Оформлю презентацию с понятной структурой, заголовками, блоками, схемами и аккуратным визуальным стилем. Подойдёт для коммерческого предложения, обучения, защиты идеи или демонстрации проекта.',
    bullets: ['презентация', 'слайды', 'PDF', 'предложение'],
    outcome: 'На выходе: материал, который удобно показать клиенту или команде.',
    duration: 'от 1 дня',
    format: 'Удалённо',
    buttonText: 'Заказать презентацию',
    showOnHome: true,
    icon: Presentation,
  },
  {
    title: 'Консультация по выбору техники',
    shortTitle: 'Выбор техники',
    slug: 'tech',
    path: '/services/tech',
    category: 'Подбор техники',
    lead: 'Помогу выбрать смартфон, ноутбук, MacBook или другую технику под задачу.',
    description:
      'Подскажу, какую технику лучше взять под бюджет и задачи. Объясню простым языком, где можно сэкономить, за что не стоит переплачивать и какие модели лучше не брать.',
    bullets: ['техника', 'смартфон', 'ноутбук', 'MacBook', 'выбор'],
    outcome: 'На выходе: понятные варианты покупки без лишней переплаты.',
    duration: 'в день обращения',
    format: 'Онлайн / Владивосток',
    buttonText: 'Получить консультацию',
    showOnHome: true,
    icon: Laptop,
  },
  {
    title: 'Установка программ',
    shortTitle: 'Установка программ',
    slug: 'remote-help',
    path: '/services/remote-help',
    category: 'Удалённая помощь',
    lead: 'Помогу установить и настроить нужные программы на Windows или macOS.',
    description:
      'Установлю необходимые программы, помогу с базовой настройкой, объясню как пользоваться и проверю, что всё запускается. Возможна удалённая помощь через AnyDesk.',
    bullets: ['программы', 'Windows', 'macOS', 'AnyDesk', 'настройка'],
    outcome: 'На выходе: установленные программы и понятная настройка.',
    duration: 'от 30 минут',
    format: 'Удалённо',
    buttonText: 'Написать по установке',
    isPopular: true,
    showOnHome: true,
    icon: MonitorCog,
  },
  {
    title: 'Диагностика ПК/ноутбука',
    shortTitle: 'Диагностика',
    slug: 'computer-help',
    path: '/services/computer-help',
    category: 'Компьютерная помощь',
    lead: 'Проверю, почему компьютер тормозит, греется, не запускается или работает нестабильно.',
    description:
      'Проведу первичную диагностику компьютера или ноутбука: система, накопитель, память, температура, ошибки, автозагрузка и общее состояние. После проверки объясню, что лучше сделать дальше.',
    bullets: ['диагностика', 'ноутбук', 'ПК', 'ремонт', 'помощь'],
    outcome: 'На выходе: понятная причина проблемы и следующие шаги.',
    duration: 'от 30 минут',
    format: 'Владивосток / удалённо',
    buttonText: 'Заказать диагностику',
    showOnHome: true,
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
    title: 'Сайт услуг с мобильной админкой',
    category: 'Сайты и приложения',
    description:
      'Проект показывает опыт разработки не только обычного сайта, но и удобной системы управления контентом. Такой подход подходит специалистам, небольшим командам и сервисным проектам, которым нужно быстро менять информацию на сайте.',
    problem:
      'Нужно было сделать сайт услуг, который можно быстро обновлять без программиста: менять услуги, цены, кейсы, отзывы, FAQ и статус занятости.',
    solution:
      'Разработан сайт на React с подключением к CMS через Google Таблицу и Apps Script API. Дополнительно создано iPhone-приложение-админка на SwiftUI, через которое можно добавлять и редактировать данные прямо с телефона.',
    result:
      'Получилась связка “сайт + мобильная админка”: изменения в приложении попадают в Google Таблицу, затем обновляются на сайте. Это позволяет управлять контентом без ручного редактирования кода.',
    tags: ['React', 'SwiftUI', 'Apps Script', 'Google Sheets', 'CMS', 'админка'],
    date: '2026',
    icon: AppWindow,
  },
  {
    title: 'Лендинг для услуги',
    category: 'Сайты',
    description:
      'Аккуратный сайт, который можно использовать для рекламы, Авито и Telegram.',
    problem: 'Нужно быстро представить услугу и дать клиенту понятный путь к заявке.',
    solution: 'Создана структура лендинга: первый экран, преимущества, услуги, цены, FAQ и кнопки связи.',
    result: 'Получился аккуратный сайт, который можно использовать для рекламы, Авито и Telegram.',
    tags: ['лендинг', 'сайт', 'заявки'],
    date: '2026',
    icon: Code2,
  },
  {
    title: 'Презентация для проекта',
    category: 'Презентации',
    description:
      'Материал стал понятнее для клиента и удобнее для демонстрации.',
    problem: 'Нужно было упаковать идею в понятный визуальный формат.',
    solution: 'Собрана презентация с логикой, структурой, схемами и аккуратным оформлением.',
    result: 'Материал стал понятнее для клиента и удобнее для демонстрации.',
    tags: ['презентация', 'слайды', 'PDF'],
    date: '2026',
    icon: Presentation,
  },
  {
    title: 'Прототип iOS-приложения',
    category: 'Приложения',
    description:
      'Идею можно показать, протестировать и понять, что дорабатывать дальше.',
    problem: 'Нужно было быстро проверить идею приложения без долгой разработки.',
    solution: 'Собран прототип с основными экранами, переходами и базовой логикой.',
    result: 'Идею можно показать, протестировать и понять, что дорабатывать дальше.',
    tags: ['iOS', 'SwiftUI', 'прототип'],
    date: '2026',
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
  { value: '7 направлений', label: 'сайты, приложения, техника и помощь' },
  { value: 'Заявка в мессенджер', label: 'отвечаю по возможности' },
  { value: 'Владивосток + удалённо', label: 'очно и онлайн' },
];

export const workSteps = [
  'Вы описываете задачу',
  'Я уточняю детали',
  'Называю цену и сроки',
  'Выполняю работу',
  'Передаю результат и объясняю, что дальше',
];

export const commonRequests = [
  'Нужен сайт для услуги',
  'Есть идея приложения',
  'Нужно выбрать телефон или ноутбук',
  'Компьютер начал тормозить',
  'Нужна презентация',
  'Нужно проверить сайт на очевидные риски',
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
