import type { ComponentData, Data } from '@puckeditor/core';
import { defaultStudioTheme } from '../schema/defaults';
import { SITE_BUILDER_SCHEMA_VERSION, type SiteBuilderProject, type StudioPage, type StudioThemeTokens } from '../schema/types';
import { createStudioId } from '../utils/id';

export type StudioTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  accent: string;
  create: (name?: string) => SiteBuilderProject;
};

function block(type: string, props: Record<string, unknown>): ComponentData {
  return { type, props: { id: createStudioId('block'), ...props } };
}

function page(name: string, slug: string, blocks: ComponentData[], isHome = false, order = 0): StudioPage {
  const title = name === 'Главная' ? 'Современный сайт для бизнеса' : name;
  return {
    id: createStudioId('page'),
    name,
    slug,
    title,
    metaDescription: `Страница «${name}», созданная в SITEVL Studio.`,
    noindex: false,
    isHome,
    order,
    data: { content: blocks, root: { props: { title } } } as Data,
  };
}

function theme(primary: string, accent: string, background = '#f5f7fa'): StudioThemeTokens {
  return {
    ...defaultStudioTheme,
    colors: { ...defaultStudioTheme.colors, primary, accent, background },
  };
}

function project(templateId: string, name: string, pages: StudioPage[], projectTheme: StudioThemeTokens): SiteBuilderProject {
  const now = new Date().toISOString();
  return {
    schemaVersion: SITE_BUILDER_SCHEMA_VERSION,
    id: createStudioId('project'),
    name,
    templateId,
    createdAt: now,
    updatedAt: now,
    activePageId: pages.find((item) => item.isHome)?.id || pages[0].id,
    theme: projectTheme,
    pages,
    assets: [],
    settings: { defaultBreakpoint: 'desktop', language: 'ru' },
  };
}

const header = (brand: string, variant = 'clean') => block('Header', {
  brand, variant, ctaLabel: 'Обсудить задачу', ctaHref: '#contact',
  links: [{ label: 'Услуги', href: '#services' }, { label: 'О проекте', href: '#about' }, { label: 'Контакты', href: '#contact' }],
});

const footer = (brand: string, variant = 'dark') => block('Footer', {
  brand, variant, text: 'Сделано внимательно к деталям и людям.',
  links: [{ label: 'Главная', href: '/' }, { label: 'Контакты', href: '#contact' }],
});

function specialistTemplate(name = 'Сайт специалиста') {
  const brand = 'Александр Волков';
  const pages = [page('Главная', '', [
    header(brand),
    block('Hero', { variant: 'image', align: 'left', eyebrow: 'Частный специалист', title: 'Решаю цифровые задачи без лишней сложности', text: 'Помогаю разобраться, выбрать спокойный путь и получить понятный результат.', buttonLabel: 'Обсудить задачу', buttonHref: '#contact', image: '/images/editorial/home-collaboration.webp' }),
    block('Services', { idAnchor: 'services', variant: 'cards', eyebrow: 'Услуги', title: 'С чем можно обратиться', items: [
      { title: 'Консультация', text: 'Разберём задачу и возможные решения.', price: 'от 1 500 ₽' },
      { title: 'Проект под ключ', text: 'От структуры до готового результата.', price: 'от 20 000 ₽' },
      { title: 'Поддержка', text: 'Помощь после запуска проекта.', price: 'по договорённости' },
    ] }),
    block('Steps', { eyebrow: 'Процесс', title: 'Пять понятных шагов', items: ['Знакомство', 'Задача', 'Предложение', 'Работа', 'Передача'].map((value) => ({ value })) }),
    block('Reviews', { variant: 'quotes', eyebrow: 'Отзывы', title: 'Что ценят клиенты', items: [{ author: 'Мария', text: 'Всё объяснили спокойно и помогли выбрать подходящий вариант.' }, { author: 'Илья', text: 'Результат получили вовремя, без непонятных технических слов.' }] }),
    block('Contact', { idAnchor: 'contact', variant: 'panel', title: 'Расскажите о задаче', text: 'Отвечу на вопросы и предложу следующий шаг.', buttonLabel: 'Написать', buttonHref: 'https://t.me/AYDigitaLRu' }),
    footer(brand),
  ], true)];
  return project('specialist', name, pages, theme('#1769ff', '#13a56f'));
}

function studioTemplate(name = 'Студия разработки') {
  const brand = 'NORTH CODE';
  const pages = [
    page('Главная', '', [
      header(brand, 'floating'),
      block('Hero', { variant: 'split', align: 'left', eyebrow: 'Студия цифровых продуктов', title: 'Проектируем цифровые продукты, которыми удобно пользоваться', text: 'Стратегия, интерфейс и разработка в одной команде.', buttonLabel: 'Начать проект', buttonHref: '/contacts', image: '/images/editorial/developer-workspace.webp' }),
      block('Stats', { title: 'Работа в цифрах', items: [{ value: '24', label: 'запуска' }, { value: '7 лет', label: 'в разработке' }, { value: '4.9', label: 'средняя оценка' }] }),
      block('Services', { idAnchor: 'services', variant: 'editorial', eyebrow: 'Направления', title: 'От идеи до работающей системы', items: [{ title: 'Сайты', text: 'Коммерческие страницы и каталоги.', price: 'от 80 000 ₽' }, { title: 'Приложения', text: 'Личные кабинеты и рабочие системы.', price: 'от 150 000 ₽' }, { title: 'Поддержка', text: 'Развитие после запуска.', price: 'от 25 000 ₽/мес' }] }),
      block('Portfolio', { variant: 'mosaic', eyebrow: 'Проекты', title: 'Выбранные работы', items: [{ title: 'Каталог оборудования', category: 'Веб-платформа' }, { title: 'Сервис бронирования', category: 'Дизайн продукта' }, { title: 'Сайт девелопера', category: 'Корпоративный сайт' }] }),
      block('Contact', { idAnchor: 'contact', variant: 'contrast', title: 'Есть идея продукта?', text: 'Соберём вводные и предложим рабочий формат.', buttonLabel: 'Написать студии', buttonHref: 'https://t.me/AYDigitaLRu' }),
      footer(brand),
    ], true),
    page('Услуги', 'services', [header(brand), block('Pricing', { variant: 'columns', eyebrow: 'Форматы', title: 'Выберите подходящий старт', items: [{ title: 'Исследование', price: 'от 40 000 ₽', features: 'Интервью, структура, прототип' }, { title: 'Запуск', price: 'от 120 000 ₽', features: 'Дизайн, разработка, публикация' }, { title: 'Развитие', price: 'от 25 000 ₽/мес', features: 'Поддержка и развитие' }] }), footer(brand)], false, 1),
  ];
  return project('development-studio', name, pages, theme('#5b5cf0', '#32d296', '#f4f3ff'));
}

function restaurantTemplate(name = 'Ресторан') {
  const brand = 'МОРЕ';
  const pages = [page('Главная', '', [
    header(brand, 'transparent'),
    block('Hero', { variant: 'cover', align: 'center', eyebrow: 'Ресторан во Владивостоке', title: 'Тихий вечер у моря', text: 'Локальные продукты, открытая кухня и вид на город.', buttonLabel: 'Забронировать стол', buttonHref: 'tel:+79241308626', image: '/images/editorial/presentation-work.avif' }),
    block('Features', { variant: 'split', eyebrow: 'О ресторане', title: 'Вкус региона в современной подаче', text: 'Меню меняется вместе с сезоном и доступными продуктами.', items: [{ title: 'Морепродукты', text: 'Ежедневные поставки.' }, { title: 'Открытая кухня', text: 'Можно видеть процесс.' }] }),
    block('Gallery', { variant: 'grid', eyebrow: 'Атмосфера', title: 'Пространство и блюда', images: ['/images/editorial/presentation-work.avif', '/images/editorial/home-collaboration.webp', '/images/editorial/developer-workspace.webp'].map((value) => ({ value })) }),
    block('FAQ', { title: 'Перед визитом', items: [{ question: 'Нужна бронь?', answer: 'В пятницу и выходные лучше забронировать стол заранее.' }, { question: 'Есть детское меню?', answer: 'Да, несколько простых блюд можно адаптировать.' }] }),
    block('Contact', { idAnchor: 'contact', variant: 'panel', title: 'Забронировать стол', text: 'Позвоните или напишите, чтобы выбрать время.', buttonLabel: 'Позвонить', buttonHref: 'tel:+79241308626' }),
    footer(brand),
  ], true)];
  return project('restaurant', name, pages, theme('#9a3f2c', '#d7a447', '#f7f2ea'));
}

function techStoreTemplate(name = 'Магазин техники') {
  const brand = 'DEVICE LAB';
  const pages = [page('Главная', '', [
    header(brand),
    block('Hero', { variant: 'split', align: 'left', eyebrow: 'Техника с проверкой', title: 'Устройства под ваши реальные задачи', text: 'Поможем выбрать конфигурацию и подготовим устройство к работе.', buttonLabel: 'Открыть каталог', buttonHref: '#catalog', image: '/images/editorial/phone-laptop.webp' }),
    block('Features', { variant: 'cards', eyebrow: 'Почему мы', title: 'Перед покупкой всё понятно', text: '', items: [{ title: 'Проверка', text: 'Состояние и основные функции.' }, { title: 'Подбор', text: 'Без переплаты за лишние характеристики.' }, { title: 'Настройка', text: 'Подготовка и перенос данных.' }] }),
    block('Pricing', { idAnchor: 'catalog', variant: 'cards', eyebrow: 'Популярное', title: 'Готовые варианты', items: [{ title: 'Рабочий ноутбук', price: 'от 59 000 ₽', features: '16 ГБ RAM, SSD 512 ГБ' }, { title: 'Смартфон на каждый день', price: 'от 29 000 ₽', features: '128 ГБ, хорошая камера' }, { title: 'Домашний ПК', price: 'от 75 000 ₽', features: 'Сборка и настройка' }] }),
    block('Contact', { idAnchor: 'contact', variant: 'contrast', title: 'Помочь с выбором?', text: 'Опишите бюджет и задачи.', buttonLabel: 'Получить подбор', buttonHref: 'https://t.me/AYDigitaLRu' }),
    footer(brand),
  ], true)];
  return project('tech-store', name, pages, theme('#0b70e0', '#11a67b'));
}

function portfolioTemplate(name = 'Портфолио') {
  const brand = 'ANNA / VISUAL';
  const pages = [page('Главная', '', [
    header(brand, 'minimal'),
    block('Hero', { variant: 'minimal', align: 'left', eyebrow: 'Дизайнер и фотограф', title: 'Визуальные истории для людей и брендов', text: 'Проекты, в которых форма помогает передать характер.', buttonLabel: 'Смотреть проекты', buttonHref: '#portfolio', image: '/images/editorial/presentation-work.avif' }),
    block('Portfolio', { idAnchor: 'portfolio', variant: 'editorial', eyebrow: 'Работы', title: 'Избранные проекты', items: [{ title: 'Дом у моря', category: 'Айдентика' }, { title: 'SLOW journal', category: 'Редакционный дизайн' }, { title: 'Local heroes', category: 'Фотография' }, { title: 'New shape', category: 'Цифровой проект' }] }),
    block('Quote', { text: 'Хорошая визуальная система помогает человеку быстрее понять идею.', author: 'Анна, арт-директор' }),
    block('Contact', { idAnchor: 'contact', variant: 'minimal', title: 'Обсудим проект', text: 'Пришлите короткое описание и желаемые сроки.', buttonLabel: 'Написать', buttonHref: 'mailto:hello@example.com' }),
    footer(brand, 'light'),
  ], true)];
  return project('portfolio', name, pages, theme('#111111', '#ec5b43', '#f4f1ec'));
}

function localBusinessTemplate(name = 'Локальный бизнес') {
  const brand = 'ТОЧКА СЕРВИСА';
  const pages = [page('Главная', '', [
    header(brand),
    block('Hero', { variant: 'split', align: 'left', eyebrow: 'Работаем во Владивостоке', title: 'Понятная помощь рядом с домом', text: 'Запишитесь на удобное время и заранее узнайте ориентир по стоимости.', buttonLabel: 'Записаться', buttonHref: '#contact', image: '/images/editorial/ssd-install.avif' }),
    block('Services', { idAnchor: 'services', variant: 'cards', eyebrow: 'Услуги', title: 'Чем можем помочь', items: [{ title: 'Диагностика', text: 'Найдём причину проблемы.', price: 'от 1 000 ₽' }, { title: 'Настройка', text: 'Подготовим устройство к работе.', price: 'от 2 000 ₽' }, { title: 'Выезд', text: 'Приедем в согласованное время.', price: 'от 500 ₽' }] }),
    block('Steps', { eyebrow: 'Как работаем', title: 'Без неожиданностей', items: ['Заявка', 'Уточнение', 'Стоимость', 'Работа', 'Проверка'].map((value) => ({ value })) }),
    block('MapPlaceholder', { title: 'Рядом с вами', address: 'Владивосток, адрес уточняется при записи', text: 'Выезд и удалённый формат согласуются заранее.' }),
    block('LeadForm', { idAnchor: 'contact', title: 'Записаться на консультацию', text: 'Оставьте обращение удобным способом.', buttonLabel: 'Написать в Telegram', actionHref: 'https://t.me/AYDigitaLRu' }),
    footer(brand),
  ], true)];
  return project('local-business', name, pages, theme('#1769ff', '#ff8a3d'));
}

export const studioTemplates: StudioTemplate[] = [
  { id: 'specialist', name: 'Услуги специалиста', description: 'Личная услуга, доверие, процесс, отзывы и контакт.', category: 'Услуги', accent: '#1769ff', create: specialistTemplate },
  { id: 'development-studio', name: 'Студия разработки', description: 'Проекты, направления, цифры и отдельная страница тарифов.', category: 'Цифровые продукты', accent: '#5b5cf0', create: studioTemplate },
  { id: 'restaurant', name: 'Ресторан', description: 'Атмосферный первый экран, галерея, история и бронирование.', category: 'Ресторан', accent: '#9a3f2c', create: restaurantTemplate },
  { id: 'tech-store', name: 'Магазин техники', description: 'Категории, преимущества, подбор и понятные предложения.', category: 'Магазин', accent: '#0b70e0', create: techStoreTemplate },
  { id: 'portfolio', name: 'Портфолио', description: 'Проекты, авторская подача, цитата и спокойный контакт.', category: 'Творчество', accent: '#ec5b43', create: portfolioTemplate },
  { id: 'local-business', name: 'Локальный бизнес', description: 'Услуги, этапы, локация и запись для компании в городе.', category: 'Локальный бизнес', accent: '#ff8a3d', create: localBusinessTemplate },
];

export function createProjectFromTemplate(templateId: string, name?: string) {
  const template = studioTemplates.find((item) => item.id === templateId) || studioTemplates[0];
  return template.create(name);
}
