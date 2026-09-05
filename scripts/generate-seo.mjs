import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { resolveSiteUrl } from './site-env.mjs';
import { siteConfig } from '../src/config/site.ts';
import { publishedCases } from '../src/data/cases.ts';
import { localSeoPages } from '../src/data/localSeo.ts';
import { pageMeta } from '../src/data/pageMeta.ts';
import { priceDirections } from '../src/data/priceDirections.ts';
import { routeSeo } from '../src/data/routeSeo.ts';
import { seoLandingPages } from '../src/data/seoLandingPages.ts';
import { usefulArticles, usefulIndexMeta } from '../src/data/useful.ts';
import { structuredPrice } from '../src/utils/structuredPrice.ts';

const rootDir = process.cwd();
const distDir = join(rootDir, 'dist');
const publicDir = join(rootDir, 'public');
const siteUrl = resolveSiteUrl(rootDir);
const defaultImage = `${siteUrl}/og-image.jpg`;
const phone = siteConfig.phone;
const specialistName = siteConfig.specialistName;
const siteName = siteConfig.siteName;
const telegramUrl = siteConfig.telegramUrl;

const baseRoutes = [
  {
    path: '/',
    title: 'SITEVL — сайты и мобильные приложения для бизнеса',
    description: 'SITEVL создаёт сайты и мобильные приложения для бизнеса во Владивостоке и удалённо: от первой версии до запуска и дальнейшего развития.',
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
    path: '/mobile-apps',
    title: 'Разработка мобильных приложений для iOS и Android — SITEVL',
    description: 'Разработка мобильных приложений для бизнеса и цифровых сервисов: iOS, Android, MVP и продукты с серверной частью. Стоимость от 49 900 ₽.',
    priority: 0.92,
    changefreq: 'weekly',
    schemaType: 'Service',
  },
  {
    path: '/ai-website',
    title: 'AI-конструктор концепции сайта — SITEVL',
    description: 'Опишите бизнес и получите безопасную концепцию сайта: структуру, тексты, адаптивный интерактивный прототип и оценку по действующему прайсу SITEVL.',
    priority: 0.9,
    changefreq: 'weekly',
    schemaType: 'Service',
  },
  {
    path: '/prices',
    title: 'Цены на IT-услуги во Владивостоке — SITEVL',
    description: 'Актуальные стартовые цены на сайты, мобильные приложения, SITEVL Care, настройку техники и другие IT-услуги во Владивостоке.',
    priority: 0.9,
    changefreq: 'weekly',
    schemaType: 'OfferCatalog',
  },
  {
    path: '/cases',
    title: 'Кейсы и примеры задач — SITEVL',
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
    title: 'IT-услуги во Владивостоке и Приморском крае — SITEVL',
    description: 'Локальный хаб SITEVL: услуги во Владивостоке, удалённая помощь по Приморскому краю, сайты, компьютерная помощь, Windows, MacBook и консультации.',
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
    title: 'Политика обработки персональных данных — SITEVL',
    description: 'Политика обработки персональных данных на сайте SITEVL.',
    priority: 0.2,
    changefreq: 'yearly',
    schemaType: 'WebPage',
  },
  {
    path: '/terms',
    title: 'Условия обращения и оказания услуг — SITEVL',
    description: 'Условия обращения, ориентировочные цены, порядок согласования задач и ограничения услуг SITEVL.',
    priority: 0.2,
    changefreq: 'yearly',
    schemaType: 'WebPage',
  },
];

const priceRoutes = [
  ['/prices/websites', 'Цены на разработку сайтов — SITEVL', 'Семь пакетов разработки сайтов: от сайта для старта до интернет-магазина и веб-сервиса. Стоимость от 19 900 ₽.'],
  ['/prices/mobile-apps', 'Цены на мобильные приложения — SITEVL', 'Пять пакетов разработки мобильных приложений для iOS и Android: от первой версии до сложного сервиса. Стоимость от 49 900 ₽.'],
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
  ['/useful/website-development-cost', 'Сколько стоит создание сайта', 'Как формируется стоимость создания сайта: лендинг, сайт-визитка, сайт с админкой, каталог, контент, сроки и ссылка на актуальный прайс SITEVL.'],
  ['/useful/website-for-small-business', 'Какой сайт нужен малому бизнесу', 'Как понять, какой сайт заказать малому бизнесу: сайт-визитка, лендинг, сайт с админкой, каталог, заявки, цены, отзывы и мобильная версия.'],
  ['/useful/company-website-structure', 'Что должно быть на сайте компании', 'Структура сайта компании: главный экран, услуги, цены, кейсы, отзывы, FAQ, контакты, формы заявок, legal-страницы и базовое SEO.'],
  ['/useful/diy-or-developer-website', 'Сайт самому или заказать разработчику', 'Нейтральное сравнение: сделать сайт самостоятельно на конструкторе или заказать разработку. Когда подходит каждый вариант и какие риски учесть.'],
  ['/useful/data-transfer', 'Перенос данных между iPhone и Android', 'Как перенести данные с iPhone на iPhone, Android на iPhone, iPhone на Android и Android на Android.'],
  ['/useful/digital-hygiene', 'Цифровая гигиена для iPhone, Android и MacBook', 'Простые настройки безопасности для телефона, компьютера, аккаунтов и паролей.'],
  ['/useful/scams', 'Защита от мошенников и безопасность аккаунтов', 'Как не передать Apple ID, Google-аккаунт, коды, доступ к экрану и банковские данные мошенникам.'],
  ['/useful/apps-checklists', 'Приложения и чек-листы для безопасной настройки устройств', 'Что проверить перед установкой приложений, продажей, покупкой или настройкой телефона и компьютера.'],
].map(([path, title, description]) => ({ path, title, description, priority: 0.64, changefreq: 'monthly', type: 'article', schemaType: 'Article' }));

const caseRoutes = [
  ['/cases/ay-digital-personal-website', 'Кейс: сайт-портфолио SITEVL на React и Vite', 'Кейс сайта-портфолио SITEVL: React, Vite, TypeScript, адаптивная структура, страницы услуг, цен, кейсов, контактов, sitemap, robots, structured data и prerender.'],
  ['/cases/marine-equipment-catalog', 'Кейс: каталог морского оборудования на React и Supabase', 'Кейс каталога морского оборудования: до примерно 1000 товаров, категории, поиск, фильтры, PDF-документы, формы связи, админка, Supabase Auth, CRUD, Storage и RLS.'],
].map(([path, title, description]) => ({ path, title, description, priority: 0.68, changefreq: 'monthly', type: 'article', schemaType: 'CreativeWork' }));

const localRoutes = [
  ['/computer-help-artem', 'Компьютерная помощь в Артёме — удалённая настройка и консультация', 'Удалённая компьютерная помощь для Артёма: Windows, MacBook, программы, перенос данных, телефоны и консультация. Личный формат определяется после обсуждения задачи.', 'Артём', 'Компьютерная помощь'],
  ['/computer-help-ussuriysk', 'Компьютерная помощь в Уссурийске — Windows, MacBook и программы', 'Помощь с компьютером для Уссурийска: удалённая диагностика, настройка Windows, MacBook, программ, перенос данных и консультации по технике.', 'Уссурийск', 'Компьютерная помощь'],
  ['/computer-help-nakhodka', 'Компьютерная помощь в Находке — удалённая диагностика и настройка', 'Удалённая помощь с компьютером в Находке: Windows, MacBook, установка программ, консультации, перенос данных, настройка телефонов и подбор техники.', 'Находка', 'Компьютерная помощь'],
  ['/website-development-artem', 'Создание и разработка сайтов в Артёме — удалённо для бизнеса', 'Разработка сайтов для Артёма удалённо: сайт для бизнеса, лендинг, система управления или каталог с адаптацией под телефон и базовым SEO.', 'Артём', 'Создание сайтов'],
  ['/website-development-ussuriysk', 'Создание и разработка сайтов в Уссурийске — для услуг и бизнеса', 'Разработка сайтов для Уссурийска удалённо: сайт-визитка, лендинг или сайт с системой управления для услуг и бизнеса.', 'Уссурийск', 'Создание сайтов'],
  ['/website-development-nakhodka', 'Создание сайтов в Находке — удалённая разработка под услугу', 'Создание сайта для Находки удалённо: лендинг, сайт для бизнеса, система управления или каталог с мобильной версией и базовым SEO.', 'Находка', 'Создание сайтов'],
].map(([path, title, description, city, serviceType]) => ({ path, title, description, city, serviceType, priority: 0.7, changefreq: 'monthly', schemaType: 'LocalService' }));

const landingRoutes = [
  ['/computer-help-vladivostok', 'Компьютерная помощь во Владивостоке — частный мастер', 'Компьютерная помощь во Владивостоке: настройка Windows и MacBook, установка программ, диагностика, перенос данных и подготовка нового компьютера. Выезд и удалённая помощь.'],
  ['/program-installation-vladivostok', 'Установка программ во Владивостоке — Windows и Mac', 'Установка и настройка программ на Windows и MacBook во Владивостоке: Office, браузеры, PDF, архиваторы, медиаплееры и программы для работы или учёбы.'],
  ['/windows-setup-vladivostok', 'Настройка Windows во Владивостоке — ноутбук и ПК под ключ', 'Установка и настройка Windows во Владивостоке: драйверы, обновления, Office, браузеры, программы и подготовка ноутбука или ПК к работе.'],
  ['/macbook-setup-vladivostok', 'Настройка MacBook во Владивостоке — macOS и программы', 'Настройка нового MacBook во Владивостоке: Apple ID, iCloud, программы, Office, браузеры, Dock, резервные копии и базовая безопасность.'],
  ['/pc-build-vladivostok', 'Сборка ПК во Владивостоке — компьютер под ключ', 'Сборка ПК во Владивостоке под задачи и бюджет: подбор комплектующих, покупка, сборка, кабель-менеджмент, тестирование, Windows и программы.'],
  ['/data-transfer-vladivostok', 'Перенос данных во Владивостоке — iPhone и Android', 'Перенос фото, контактов и файлов между iPhone и Android во Владивостоке. Настройка нового телефона и проверка данных после переноса.'],
  ['/phone-setup-vladivostok', 'Настройка iPhone и Android во Владивостоке', 'Настройка нового iPhone или Android во Владивостоке: аккаунт, мессенджеры, резервная копия, поиск устройства, перенос контактов и безопасность.'],
  ['/website-development-vladivostok', 'Создание сайтов во Владивостоке и Приморском крае — SITEVL', 'Создание сайтов во Владивостоке и удалённо по Приморскому краю: сайты для бизнеса, лендинги, системы управления, каталоги и базовая SEO-подготовка.'],
  ['/website-admin-vladivostok', 'Сайт с системой управления во Владивостоке — SITEVL', 'Разработка сайта с системой управления во Владивостоке. Самостоятельно обновляйте услуги, цены, отзывы, акции и фотографии.'],
].map(([path, title, description]) => ({ path, title, description, priority: 0.82, changefreq: 'weekly', schemaType: 'Service' }));

const technicalRoutes = [
  {
    path: '/studio',
    title: 'SITEVL Studio — визуальный конструктор сайтов',
    description: 'Техническое рабочее пространство SITEVL Studio для создания, редактирования и локального сохранения проектов.',
    noindex: true,
    schemaType: 'WebPage',
  },
  {
    path: '/studio/projects',
    title: 'Проекты SITEVL Studio',
    description: 'Локальное рабочее пространство проектов SITEVL Studio.',
    noindex: true,
    schemaType: 'WebPage',
  },
  {
    path: '/lab',
    title: 'SITEVL LAB — интерактивная лаборатория',
    description: 'SITEVL LAB — каталог сильных браузерных экспериментов: SITEVL Studio, Infinite Canvas, Physics Lab, Modern OS и Retro Computer.',
    noindex: true,
    schemaType: 'WebPage',
  },
  {
    path: '/lab/builder',
    title: 'Website Builder — SITEVL LAB',
    description: 'Полноценный визуальный конструктор SITEVL с секциями, responsive preview, drag and drop, undo, redo и экспортом проекта.',
    noindex: true,
    schemaType: 'WebPage',
  },
  {
    path: '/lab/2d',
    title: 'Break the Website — 2D Game — SITEVL LAB',
    description: 'Управляемая 2D-игра SITEVL LAB: используйте элементы интерфейса как платформы, двигайте карточки и найдите скрытый CORE.',
    noindex: true,
    schemaType: 'WebPage',
  },
  {
    path: '/lab/3d',
    title: 'The Room — 3D Game — SITEVL LAB',
    description: 'Процедурная WebGL-комната SITEVL LAB: найдите четыре интерактивных модуля и откройте сюрреалистический выход.',
    noindex: true,
    schemaType: 'WebPage',
  },
  {
    path: '/lab/physics',
    title: 'Physics Lab — SITEVL LAB',
    description: 'Физическая браузерная песочница с объектами, столкновениями, настройкой массы, gravity, friction и device feedback.',
    noindex: true,
    schemaType: 'WebPage',
  },
  {
    path: '/lab/os',
    title: 'OS Simulator — SITEVL LAB',
    description: 'Оригинальная браузерная SITEVL OS с окнами, Files, Terminal, Notes, Browser, Settings и локальными достижениями.',
    noindex: true,
    schemaType: 'WebPage',
  },
  {
    path: '/lab/retro',
    title: 'Retro Computing — SITEVL LAB',
    description: 'Интерактивный компьютер середины 90-х с файлами, терминалом, браузером, Paint, Notes, играми, сетью, секретами и CRT-режимом.',
    noindex: true,
    schemaType: 'WebPage',
  },
  {
    path: '/lab/modern-os',
    title: 'SITEVL Modern OS — SITEVL LAB',
    description: 'Современная виртуальная desktop-система SITEVL с окнами, файлами, браузером, приложениями и локальным сохранением.',
    noindex: true,
    schemaType: 'WebPage',
  },
  {
    path: '/lab/canvas',
    title: 'Infinite Canvas — SITEVL LAB',
    description: 'Бесконечный Canvas 2D для заметок, текста, фигур и связей с pan, zoom, touch, pinch и локальным сохранением.',
    noindex: true,
    schemaType: 'WebPage',
  },
  {
    path: '/lab/builder-legacy',
    title: 'Legacy Website Builder — SITEVL LAB',
    description: 'Предыдущая версия конструктора SITEVL сохранена для совместимости и переноса старых черновиков.',
    noindex: true,
    schemaType: 'WebPage',
  },
  {
    path: '/brief',
    title: 'Мини-бриф на создание сайта — SITEVL',
    description: 'Интерактивный мини-бриф SITEVL: задача, структура, функции и ориентировочная стоимость сайта.',
    noindex: true,
    schemaType: 'WebPage',
  },
  {
    path: '/changelog',
    title: 'Changelog — SITEVL',
    description: 'Фактические изменения интерактивного интерфейса SITEVL.',
    noindex: true,
    schemaType: 'WebPage',
  },
];

const baseH1 = {
  '/': pageMeta.home.title,
  '/services': pageMeta.services.title,
  '/mobile-apps': 'Разработка мобильных приложений для iOS и Android',
  '/ai-website': 'Соберите концепцию сайта за несколько минут',
  '/prices': 'Понятные стартовые цены',
  '/cases': pageMeta.cases.title,
  '/about': pageMeta.about.title,
  '/contacts': 'Свяжитесь удобным способом',
  '/useful': usefulIndexMeta.title,
  '/primorsky-krai': 'IT-услуги во Владивостоке и удалённо по Приморскому краю',
  '/process': 'Спокойный процесс с понятными шагами',
  '/privacy': 'Политика обработки персональных данных',
  '/terms': 'Условия оказания услуг',
};

const baseStaticContent = {
  '/': {
    intro: 'SITEVL проектирует и разрабатывает сайты и мобильные приложения для бизнеса во Владивостоке и удалённо. Работа идёт напрямую со специалистом: от структуры и первого прототипа до проверки, публикации и понятной передачи результата.',
    sections: [
      { title: 'Разработка сайтов под задачу', text: 'Можно начать с компактного сайта, лендинга или многостраничного сайта компании. Для большого ассортимента подойдёт каталог или интернет-магазин, а для регулярных изменений — система управления контентом.' },
      { title: 'Мобильные приложения iOS и Android', text: 'Первая версия мобильного продукта строится вокруг главного пользовательского сценария. Платформы, серверная часть, роли и интеграции выбираются после обсуждения задачи, а не добавляются формально.' },
      { title: 'Стоимость и следующий шаг', text: 'Стартовые пакеты опубликованы в едином разделе цен. До начала работы фиксируются состав проекта, материалы, сроки и ограничения. Для предварительного обсуждения можно получить AI-концепт или сразу описать задачу.' },
    ],
    links: [
      { label: 'Создание сайтов во Владивостоке', href: '/website-development-vladivostok' },
      { label: 'Цены на разработку сайтов', href: '/prices/websites' },
      { label: 'Разработка мобильного приложения', href: '/mobile-apps' },
      { label: 'Получить AI-концепт сайта', href: '/ai-website' },
      { label: 'Частный веб-разработчик', href: '/about' },
    ],
  },
  '/services': {
    intro: 'На одной странице собраны направления SITEVL: сайты, приложения, системы управления, компьютерная помощь и настройка техники. Для каждой самостоятельной задачи есть отдельная страница с составом работы, ограничениями и релевантной ценой.',
    sections: [
      { title: 'Сайты и цифровые продукты', text: 'Разработка сайта начинается с цели: представить бизнес, запустить рекламу, показать каталог, принимать заказы или автоматизировать процесс. Поэтому лендинг, сайт компании, магазин и веб-приложение не смешиваются в одно обещание.' },
      { title: 'Техника и данные', text: 'Сохраняются отдельные направления по настройке Windows и MacBook, установке программ, переносу данных, телефонам и сборке ПК во Владивостоке. Формат — очный или удалённый — определяется по реальной задаче.' },
    ],
    links: [
      { label: 'Разработка лендинга', href: '/landing-development' },
      { label: 'Сайт для бизнеса', href: '/business-website-development' },
      { label: 'Разработка сайта-каталога', href: '/catalog-website-development' },
      { label: 'Создание интернет-магазина', href: '/online-store-development' },
      { label: 'Разработка веб-приложения', href: '/web-application-development' },
    ],
  },
  '/mobile-apps': {
    intro: 'Разработка мобильного приложения для бизнеса начинается с пользовательского сценария и полезной первой версии. Проект может быть предназначен для iOS, Android или двух платформ; серверная часть, аккаунты и интеграции оцениваются по составу продукта.',
    sections: [
      { title: 'Что можно разработать', text: 'Информационное приложение, каталог, внутренний инструмент, сервис записи, кабинет клиента или MVP нового продукта. Количество экранов не заменяет проектирование состояний, ошибок и реального пути пользователя.' },
      { title: 'Как проходит работа', text: 'После обсуждения задачи определяются платформы, роли, данные и границы первой версии. Затем готовятся сценарии, интерфейс, рабочая сборка и план проверки. Публикация в магазинах и сторонние сервисы согласуются отдельно.' },
    ],
    links: [
      { label: 'Цены на мобильные приложения', href: '/prices/mobile-apps' },
      { label: 'Сайт или мобильное приложение', href: '/useful/website-or-mobile-app' },
      { label: 'Что такое MVP', href: '/useful/what-is-mvp' },
    ],
  },
  '/ai-website': {
    intro: 'AI-концепт помогает быстро сформулировать структуру будущего сайта, варианты подачи и предварительный объём проекта. Результат остаётся концепцией: его можно проверить, отредактировать и использовать как основу для разговора о разработке.',
    sections: [
      { title: 'Что получает пользователь', text: 'Концепция включает структуру, черновые тексты, адаптивный прототип и оценку по действующему прайсу SITEVL. Генератор не публикует сайт автоматически и не подменяет согласование фактов о бизнесе.' },
      { title: 'Приватность и заявка', text: 'Контакты передаются только при добровольной отправке формы. Сгенерированные пользовательские варианты не превращаются в массовые индексируемые страницы.' },
    ],
    links: [
      { label: 'Создание сайтов', href: '/website-development-vladivostok' },
      { label: 'Цены на сайты', href: '/prices/websites' },
      { label: 'Политика обработки данных', href: '/privacy' },
    ],
  },
  '/prices': {
    intro: 'Здесь собраны актуальные стартовые цены SITEVL по всем направлениям. Отдельные страницы раскрывают пакеты сайтов, мобильных приложений, установки программ, настройки устройств, переноса данных и сборки ПК.',
    sections: [
      { title: 'Как читать цены', text: 'Стартовая стоимость показывает базовый состав. Итоговая сумма зависит от страниц, функций, материалов, интеграций и срочности; точный объём подтверждается до начала работы.' },
      { title: 'Без скрытого второго прайса', text: 'Коммерческие страницы и AI-концепт используют эту же архитектуру цен. Если значения меняются, основной источник остаётся один.' },
    ],
    links: [
      { label: 'Цены на разработку сайтов', href: '/prices/websites' },
      { label: 'Цены на мобильные приложения', href: '/prices/mobile-apps' },
      { label: 'Сколько стоит создание сайта', href: '/useful/website-development-cost' },
    ],
  },
  '/about': {
    intro: 'Проекты выполняет Александр — частный веб-разработчик и IT-специалист во Владивостоке. Клиент общается напрямую с человеком, который разбирает задачу, проектирует структуру, пишет код, проверяет результат и отвечает за согласованный объём.',
    sections: [
      { title: 'Работа без цепочки менеджеров', text: 'Вопросы по структуре, срокам, правкам и техническим ограничениям обсуждаются напрямую. До старта фиксируется, что входит в проект, какие материалы нужны и кому принадлежат домен и доступы.' },
      { title: 'Технологии и ответственность', text: 'Для веб-проектов используются React, TypeScript, Vite, Supabase и API там, где они действительно нужны. После запуска передаются согласованные доступы и объясняется порядок поддержки и дальнейших изменений.' },
    ],
    links: [
      { label: 'Заказать разработку сайта', href: '/website-development-vladivostok' },
      { label: 'Посмотреть реальные кейсы', href: '/cases' },
      { label: 'Получить AI-концепт сайта', href: '/ai-website' },
    ],
  },
  '/useful': {
    intro: 'Библиотека SITEVL помогает разобраться в выборе сайта, приложения и техники до покупки или обращения. Материалы дают короткий ответ, затем чек-листы, ограничения и ссылки на релевантную услугу или актуальный прайс.',
    sections: [
      { title: 'Сайты и цифровые продукты', text: 'Материалы объясняют стоимость разработки, выбор исполнителя, структуру сайта компании, систему управления, MVP и разницу между сайтом и мобильным приложением.' },
      { title: 'Техника, данные и безопасность', text: 'Отдельные инструкции посвящены Windows, MacBook, SSD, Wi-Fi, переносу данных, смартфонам, цифровой гигиене и защите от мошенников.' },
    ],
    links: [
      { label: 'Сколько стоит сайт', href: '/useful/website-development-cost' },
      { label: 'Как выбрать разработчика сайта', href: '/useful/how-to-choose-website-developer' },
      { label: 'Как заказать сайт', href: '/useful/how-to-order-website' },
    ],
  },
};

const sourceRoutes = [
  ...priceDirections.map((source) => ({
    path: source.path,
    title: source.seoTitle,
    description: source.seoDescription,
    h1: source.title,
    priority: 0.72,
    changefreq: 'weekly',
    schemaType: 'OfferCatalog',
    sourceKind: 'price',
    source,
  })),
  ...usefulArticles.map((source) => ({
    path: source.path,
    title: source.seoTitle,
    description: source.seoDescription,
    h1: source.title,
    priority: 0.64,
    changefreq: 'monthly',
    type: 'article',
    schemaType: 'Article',
    lastmod: source.updatedAt,
    sourceKind: 'article',
    source,
  })),
  ...publishedCases.map((source) => ({
    path: source.path,
    title: source.seoTitle,
    description: source.seoDescription,
    h1: source.title,
    priority: 0.68,
    changefreq: 'monthly',
    type: 'article',
    schemaType: 'CreativeWork',
    lastmod: source.date,
    sourceKind: 'case',
    source,
  })),
  ...localSeoPages.map((source) => ({
    path: source.path,
    title: source.title,
    description: source.description,
    h1: source.h1,
    city: source.city,
    serviceType: source.serviceType === 'website-development' ? 'Создание сайтов' : 'Компьютерная помощь',
    priority: 0.7,
    changefreq: 'monthly',
    schemaType: 'LocalService',
    sourceKind: 'local',
    source,
  })),
  ...seoLandingPages.map((source) => ({
    path: source.path,
    title: source.seoTitle,
    description: source.seoDescription,
    h1: source.title,
    priority: source.path === '/website-development-vladivostok' ? 0.92 : 0.82,
    changefreq: 'weekly',
    schemaType: 'Service',
    sourceKind: 'landing',
    source,
  })),
];

function assertUniqueRoutePaths(label, routeList) {
  const paths = routeList.map((route) => route.path);
  const duplicates = [...new Set(paths.filter((path, index) => paths.indexOf(path) !== index))];
  if (duplicates.length) {
    throw new Error(`[seo] ${label} содержит дубли маршрутов: ${duplicates.join(', ')}`);
  }
}

assertUniqueRoutePaths('Исходные SEO-данные', sourceRoutes);

const sourceByPath = new Map(sourceRoutes.map((route) => [route.path, route]));
const legacyRoutes = [...baseRoutes, ...priceRoutes, ...usefulRoutes, ...caseRoutes, ...localRoutes, ...landingRoutes, ...technicalRoutes]
  .map((route) => {
    const routeSource = sourceByPath.get(route.path);
    const baseSource = routeSeo[route.path];
    if (route.path === '/useful') {
      return { ...route, title: usefulIndexMeta.title, description: usefulIndexMeta.description, h1: usefulIndexMeta.title };
    }
    if (routeSource) return { ...route, ...routeSource };
    if (baseSource) {
      return {
        ...route,
        title: baseSource.title,
        description: baseSource.description,
        noindex: Boolean(baseSource.noindex),
        h1: baseH1[route.path] || route.title,
      };
    }
    return { ...route, h1: baseH1[route.path] || route.title };
  });
const knownPaths = new Set(legacyRoutes.map((route) => route.path));
const routes = [...legacyRoutes, ...sourceRoutes.filter((route) => !knownPaths.has(route.path))];
assertUniqueRoutePaths('Итоговый route manifest', routes);
const sitemapRoutes = routes.filter((route) => !route.noindex && route.path !== '/admin');

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
    url: telegramUrl,
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
      sameAs: [telegramUrl],
      contactPoint,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: specialistName,
      jobTitle: 'Частный веб-разработчик и IT-специалист',
      url: siteUrl,
      telephone: phone,
      sameAs: [telegramUrl],
      worksFor: { '@id': `${siteUrl}/#identity` },
      areaServed: { '@type': 'City', name: siteConfig.city },
      knowsAbout: ['создание сайтов', 'веб-приложения', 'компьютерная помощь', 'Windows', 'MacBook', 'перенос данных', 'настройка телефонов', 'подбор техники Apple, Samsung и Xiaomi'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': `${siteUrl}/#local-business`,
      name: `${specialistName} / ${siteName}`,
      url: siteUrl,
      telephone: phone,
      image: defaultImage,
      priceRange: '₽₽',
      areaServed: [
        { '@type': 'City', name: siteConfig.city },
        { '@type': 'AdministrativeArea', name: 'Приморский край' },
        { '@type': 'City', name: 'Артём' },
        { '@type': 'City', name: 'Уссурийск' },
        { '@type': 'City', name: 'Находка' },
      ],
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

const websiteStudioFaq = [
  ['Сколько занимает создание сайта?', 'Срок зависит от количества страниц, готовности материалов и правок. Компактный сайт делается быстрее, каталог или система управления требуют больше подготовки.'],
  ['Что нужно подготовить для сайта?', 'Описание услуг, цены, контакты, фотографии, примеры работ и понимание, что должен сделать посетитель.'],
  ['Можно ли сделать сайт без готовых текстов?', 'Да, можно собрать структуру и помочь сформулировать тексты, но исходная информация о вашей услуге всё равно нужна.'],
  ['Сайт будет работать на телефоне?', 'Да, адаптация под телефон, планшет и компьютер входит в базовый подход.'],
  ['Можно ли подключить домен?', 'Да, подключение домена и публикация обсуждаются в составе проекта. Покупка и продление домена оплачиваются владельцем отдельно.'],
  ['Вы делаете SEO-подготовку?', 'Да, можно добавить метаданные, sitemap, robots, schema, структуру заголовков и понятные URL.'],
  ['Можно ли потом менять сайт?', 'Да. Можно заказывать доработки, а для самостоятельного обновления согласованного содержимого подойдёт сайт с системой управления.'],
  ['Можно ли сделать сайт срочно?', 'Иногда можно, если структура и материалы готовы. Срок и объём фиксируются до начала разработки.'],
  ['Как понять стоимость сайта?', 'Сначала определяем формат, страницы и функции. После этого можно назвать ориентир и зафиксировать состав проекта.'],
  ['Можно ли заказать сайт полностью удалённо?', 'Да. Обсуждение, материалы, правки, проверка и передача результата могут проходить онлайн.'],
  ['Можно ли добавить каталог?', 'Да. Каталог может включать категории, карточки, поиск, фильтры, документы, заявки и админ-панель.'],
  ['Можно ли подключить Telegram или WhatsApp?', 'Да, на сайте можно разместить кнопки связи, форму заявки и ссылки на Telegram, WhatsApp или телефон.'],
];

function routeStructuredData(route) {
  const url = absoluteUrl(route.path);

  if (route.path === '/') return null;

  if (route.sourceKind === 'landing') {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: route.source.title,
        serviceType: route.source.eyebrow,
        description: route.source.seoDescription,
        url,
        provider: { '@id': `${siteUrl}/#person` },
        areaServed: { '@type': 'City', name: 'Владивосток' },
      },
      ...(route.source.faq?.length ? [{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: route.source.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }] : []),
    ];
  }

  if (route.sourceKind === 'local') {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: route.source.h1,
        serviceType: route.serviceType,
        description: route.source.description,
        url,
        provider: { '@id': `${siteUrl}/#person` },
        areaServed: { '@type': 'City', name: route.source.city },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: route.source.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ];
  }

  if (route.sourceKind === 'price') {
    return {
      '@context': 'https://schema.org',
      '@type': 'OfferCatalog',
      name: `${route.source.title}: пакеты и цены`,
      url,
      itemListElement: route.source.packages.map((item) => ({
        '@type': 'Offer',
        name: item.name,
        description: item.fit,
        ...structuredPrice(item.price),
      })),
    };
  }

  if (route.sourceKind === 'article') {
    const minutes = Number(route.source.readingTime.match(/\d+/)?.[0]) || 10;
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: route.source.title,
        description: route.source.seoDescription,
        url,
        inLanguage: 'ru-RU',
        datePublished: route.source.publishedAt,
        dateModified: route.source.updatedAt,
        timeRequired: `PT${minutes}M`,
        image: defaultImage,
        author: { '@id': `${siteUrl}/#person` },
        publisher: { '@id': `${siteUrl}/#identity` },
        mainEntityOfPage: url,
      },
      ...(route.source.faq?.length ? [{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: route.source.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }] : []),
      ...(route.source.relatedServices?.length ? [{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Услуги по теме материала',
        itemListElement: route.source.relatedServices.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: { '@type': 'Service', name: item.label, url: absoluteUrl(item.href) },
        })),
      }] : []),
    ];
  }

  if (route.sourceKind === 'case') {
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      headline: route.source.title,
      name: route.source.title,
      description: route.source.seoDescription,
      url,
      inLanguage: 'ru-RU',
      datePublished: route.source.date,
      dateModified: route.source.date,
      image: defaultImage,
      author: { '@id': `${siteUrl}/#person` },
      publisher: { '@id': `${siteUrl}/#identity` },
      mainEntityOfPage: url,
    };
  }

  if (route.schemaType === 'Service') {
    const service = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: route.title.split(' — ')[0],
      serviceType: route.title.split(' — ')[0],
      description: route.description,
      url,
      provider: { '@id': `${siteUrl}/#person` },
      areaServed: { '@type': 'City', name: 'Владивосток' },
    };

    if (route.path === '/website-development-vladivostok') {
      return [
        service,
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: websiteStudioFaq.map(([question, answer]) => ({
            '@type': 'Question',
            name: question,
            acceptedAnswer: { '@type': 'Answer', text: answer },
          })),
        },
      ];
    }

    return service;
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
        ...(route.lastmod ? { dateModified: route.lastmod } : {}),
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
      ...(route.lastmod ? { dateModified: route.lastmod } : {}),
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
    .filter(Boolean)
    .map((item) => `<script type="application/ld+json" data-seo-json-ld="true">${JSON.stringify(item)}</script>`)
    .join('\n    ');
}

function routeHeading(route) {
  return route.title.split(' — ')[0].split(' | ')[0];
}

function renderWebsiteStudioFallback(route) {
  const crumbs = breadcrumbItems(route.path);
  const websiteTypes = priceDirections
    .find((direction) => direction.slug === 'websites')
    ?.packages.map((item) => [item.name, item.price, item.fit]) || [];
  const process = ['Разговор', 'Структура', 'Концепция', 'Разработка', 'Контент', 'Проверка', 'Публикация'];

  return `<!-- SEO_STATIC_FALLBACK_START --><main style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f4f7fb;background:#05080e;">
      <nav aria-label="Хлебные крошки" style="max-width:1180px;margin:0 auto;padding:24px 20px;color:#9aaabe;font-size:14px;">
        ${crumbs.map((item, index) => `${index > 0 ? '<span aria-hidden="true" style="margin:0 8px;color:#526174;">/</span>' : ''}<a href="${escapeHtml(item.href)}" style="color:#b8c8d9;text-decoration:none;">${escapeHtml(item.label)}</a>`).join('')}
      </nav>
      <section style="max-width:1180px;margin:0 auto;padding:96px 20px 110px;">
        <p style="margin:0 0 16px;color:#78b7f3;font-size:13px;font-weight:800;">SITEVL · ВЛАДИВОСТОК</p>
        <h1 style="max-width:820px;margin:0;font-size:52px;line-height:1;letter-spacing:0;">${escapeHtml(route.h1 || routeHeading(route))}</h1>
        <p style="max-width:720px;margin:24px 0 0;color:#c7dbef;font-size:22px;line-height:1.45;font-weight:650;">От компактного сайта до каталога, системы управления и индивидуального веб-сервиса.</p>
        <p style="max-width:720px;margin:18px 0 0;color:#a9b5c5;font-size:17px;line-height:1.7;">Работаю лично, без шаблонного подхода. Структура, дизайн и логика проекта подбираются под конкретную задачу бизнеса во Владивостоке или удалённо.</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:30px;">
          <a href="https://t.me/AYDigitaLRu" style="border-radius:999px;padding:14px 20px;color:#07101b;background:#edf6ff;text-decoration:none;font-weight:750;">Обсудить сайт</a>
          <a href="#projects" style="border:1px solid #2b4056;border-radius:999px;padding:14px 20px;color:#eef6ff;text-decoration:none;font-weight:750;">Посмотреть проекты</a>
        </div>
      </section>
      <section style="max-width:1180px;margin:0 auto;padding:72px 20px;">
        <p style="margin:0;color:#78b7f3;font-size:13px;font-weight:800;">ВЛАДИВОСТОК</p>
        <h2 style="margin:14px 0 0;font-size:38px;line-height:1.1;">Здесь я живу и работаю</h2>
        <p style="max-width:760px;margin:20px 0 0;color:#a9b5c5;line-height:1.7;">Владивосток формирует характер проектов: скорость, Азия рядом, порт, техника, автомобили и постоянное движение. Современному бизнесу нужна понятная цифровая точка присутствия, где собраны услуги, цены, документы, контакты и заявки.</p>
      </section>
      <section style="max-width:1180px;margin:0 auto;padding:72px 20px;">
        <p style="margin:0;color:#78b7f3;font-size:13px;font-weight:800;">ФОРМАТЫ И ЦЕНЫ</p>
        <h2 style="margin:14px 0 0;font-size:38px;line-height:1.1;">От визитки до индивидуального веб-сервиса</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-top:30px;">
          ${websiteTypes.map(([name, price, description]) => `<article style="border:1px solid #26394d;border-radius:8px;padding:22px;background:#0b1725;"><h3 style="margin:0;font-size:20px;">${name}</h3><strong style="display:block;margin-top:14px;color:#6bd3d0;">${price}</strong><p style="margin:12px 0 0;color:#a9b5c5;font-size:14px;line-height:1.6;">${description}</p></article>`).join('')}
        </div>
        <p style="margin:22px 0 0;color:#91a3b6;font-size:14px;line-height:1.6;">Точная стоимость зависит от задачи. До начала разработки обсуждаем объём проекта и фиксируем, что должно быть реализовано.</p>
      </section>
      <section id="projects" style="max-width:1180px;margin:0 auto;padding:72px 20px;">
        <p style="margin:0;color:#78b7f3;font-size:13px;font-weight:800;">ПРОЕКТ</p>
        <h2 style="margin:14px 0 0;font-size:38px;line-height:1.1;">Каталог морского оборудования</h2>
        <p style="max-width:780px;margin:20px 0 0;color:#a9b5c5;line-height:1.7;">Опубликованный кейс каталога с категориями, поиском, фильтрами, документами, адаптивной версией, административной частью и управлением контентом. Название клиента и стоимость не публикуются без отдельного подтверждения.</p>
      </section>
      <section style="max-width:1180px;margin:0 auto;padding:72px 20px;">
        <p style="margin:0;color:#78b7f3;font-size:13px;font-weight:800;">ПРОЦЕСС</p>
        <h2 style="margin:14px 0 0;font-size:38px;line-height:1.1;">Как проходит разработка</h2>
        <ol style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:28px 0 0;padding:0;list-style:none;">
          ${process.map((step, index) => `<li style="border-top:1px solid #2b3c50;padding:18px 0;color:#dbe7f3;"><span style="display:block;margin-bottom:9px;color:#6daff1;font-size:12px;font-weight:800;">${String(index + 1).padStart(2, '0')}</span>${step}</li>`).join('')}
        </ol>
      </section>
      <section style="max-width:1180px;margin:0 auto;padding:72px 20px;">
        <p style="margin:0;color:#78b7f3;font-size:13px;font-weight:800;">ПЕРЕД НАЧАЛОМ</p>
        <h2 style="margin:14px 0 0;font-size:38px;line-height:1.1;">Вопросы о создании сайта</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px;margin-top:28px;">
          ${websiteStudioFaq.map(([question, answer]) => `<details style="align-self:start;border:1px solid #26394d;border-radius:8px;padding:16px;background:#0b1725;"><summary style="cursor:pointer;color:#e6f0fa;font-weight:750;">${escapeHtml(question)}</summary><p style="margin:14px 0 0;color:#a9b5c5;font-size:14px;line-height:1.65;">${escapeHtml(answer)}</p></details>`).join('')}
        </div>
      </section>
      <section style="max-width:1180px;margin:0 auto;padding:72px 20px 120px;text-align:center;">
        <p style="margin:0;color:#78b7f3;font-size:13px;font-weight:800;">СДЕЛАНО ВО ВЛАДИВОСТОКЕ</p>
        <h2 style="margin:14px 0 0;font-size:42px;line-height:1.1;">Работает везде.</h2>
        <p style="max-width:620px;margin:20px auto 0;color:#a9b5c5;line-height:1.7;">Разработка сайта полностью может проходить удалённо. Поэтому география клиента почти не ограничивает проект.</p>
        <a href="https://t.me/AYDigitaLRu" style="display:inline-block;margin-top:28px;border-radius:999px;padding:14px 20px;color:#07101b;background:#edf6ff;text-decoration:none;font-weight:750;">Написать в Telegram</a>
      </section>
    </main><!-- SEO_STATIC_FALLBACK_END -->`;
}

function renderList(items = []) {
  if (!items.length) return '';
  return `<ul style="display:grid;gap:9px;margin:18px 0 0;padding-left:20px;color:#344054;line-height:1.65;">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function renderCards(items = []) {
  if (!items.length) return '';
  return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:24px;">${items.map((item) => `<article style="border:1px solid #e4e7ec;border-radius:18px;padding:20px;background:#fff;"><h3 style="margin:0;font-size:19px;line-height:1.25;">${escapeHtml(item.title || item.name)}</h3>${item.price ? `<strong style="display:block;margin-top:10px;color:#175cd3;">${escapeHtml(item.price)}</strong>` : ''}${item.description || item.fit ? `<p style="margin:12px 0 0;color:#475467;line-height:1.6;">${escapeHtml(item.description || item.fit)}</p>` : ''}${renderList(item.items || item.includes || [])}</article>`).join('')}</div>`;
}

function renderFaq(items = []) {
  if (!items.length) return '';
  return `<section style="padding-top:42px;"><h2 style="margin:0;font-size:32px;line-height:1.15;">Частые вопросы</h2><div style="display:grid;gap:10px;margin-top:22px;">${items.map((item) => `<details style="border:1px solid #e4e7ec;border-radius:16px;padding:16px 18px;background:#fff;"><summary style="cursor:pointer;font-weight:750;">${escapeHtml(item.question)}</summary><p style="margin:12px 0 0;color:#475467;line-height:1.65;">${escapeHtml(item.answer)}</p></details>`).join('')}</div></section>`;
}

function renderLinks(items = []) {
  const normalized = items.filter((item) => item?.href?.startsWith('/'));
  if (!normalized.length) return '';
  return `<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:22px;">${normalized.map((item) => `<a href="${escapeHtml(item.href)}" style="border:1px solid #d0d5dd;border-radius:999px;padding:11px 16px;color:#175cd3;text-decoration:none;font-weight:700;">${escapeHtml(item.label)}</a>`).join('')}</div>`;
}

function renderArticleContent(source) {
  return `${source.directAnswer ? `<section style="border-radius:20px;padding:24px;background:#eff8ff;"><p style="margin:0;color:#175cd3;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;">Короткий ответ</p><p style="margin:12px 0 0;font-size:21px;font-weight:750;line-height:1.5;">${escapeHtml(source.directAnswer)}</p></section>` : ''}
    ${source.sections.map((section) => `<section style="padding-top:42px;"><h2 style="margin:0;font-size:32px;line-height:1.15;">${escapeHtml(section.title)}</h2>${section.description ? `<p style="max-width:820px;margin:16px 0 0;color:#475467;line-height:1.7;">${escapeHtml(section.description)}</p>` : ''}${renderCards(section.cards || [])}${(section.checklist || []).map((list) => `<h3 style="margin:24px 0 0;font-size:21px;">${escapeHtml(list.title)}</h3>${renderList(list.items)}`).join('')}${renderList(section.tips || [])}</section>`).join('')}
    ${source.advice?.length ? `<section style="padding-top:42px;"><h2 style="margin:0;font-size:32px;">Практический чек-лист</h2>${renderList(source.advice)}</section>` : ''}
    ${source.mistakes?.length ? `<section style="padding-top:42px;"><h2 style="margin:0;font-size:32px;">Частые ошибки</h2>${renderCards(source.mistakes)}</section>` : ''}
    ${renderFaq(source.faq)}
    <section style="padding-top:42px;"><h2 style="margin:0;font-size:28px;">Продолжить по теме</h2>${renderLinks([...(source.relatedArticles || []), ...(source.relatedServices || [])])}</section>`;
}

function renderLandingContent(route) {
  const source = route.source;
  const packageIdByPath = {
    '/landing-development': 'landing',
    '/business-website-development': 'business',
    '/website-admin-vladivostok': 'managed',
    '/catalog-website-development': 'catalog',
    '/online-store-development': 'store',
    '/web-application-development': 'web-service',
  };
  const websitePricing = priceDirections.find((direction) => direction.slug === 'websites');
  const selectedPackageId = packageIdByPath[route.path];
  const selectedPackages = route.path === '/website-development-vladivostok'
    ? websitePricing?.packages || []
    : websitePricing?.packages.filter((item) => item.id === selectedPackageId) || [];

  return `<p style="max-width:820px;margin:20px 0 0;color:#344054;font-size:18px;line-height:1.7;">${escapeHtml(source.intro)}</p>
    ${source.serviceIncludes?.length ? `<section style="padding-top:42px;"><h2 style="margin:0;font-size:32px;">Что входит</h2>${renderCards(source.serviceIncludes)}</section>` : ''}
    ${source.sections.map((section) => `<section style="padding-top:42px;"><h2 style="margin:0;font-size:32px;line-height:1.15;">${escapeHtml(section.title)}</h2>${section.text ? `<p style="max-width:820px;margin:16px 0 0;color:#475467;line-height:1.7;">${escapeHtml(section.text)}</p>` : ''}${renderList(section.items || [])}</section>`).join('')}
    ${source.neededWhen?.length ? `<section style="padding-top:42px;"><h2 style="margin:0;font-size:32px;">Кому подходит</h2>${renderList(source.neededWhen)}</section>` : ''}
    ${source.processSteps?.length ? `<section style="padding-top:42px;"><h2 style="margin:0;font-size:32px;">Как проходит работа</h2>${renderList(source.processSteps)}</section>` : ''}
    ${selectedPackages.length ? `<section style="padding-top:42px;"><h2 style="margin:0;font-size:32px;">Ориентир по стоимости</h2>${renderCards(selectedPackages)}${renderLinks([{ label: 'Все цены на разработку сайтов', href: '/prices/websites' }])}</section>` : ''}
    ${renderFaq(source.faq)}
    <section style="padding-top:42px;"><h2 style="margin:0;font-size:28px;">Связанные услуги и материалы</h2>${renderLinks([...(source.relatedServices || []), ...(source.relatedArticles || []), ...(source.links || [])])}</section>`;
}

function renderLocalContent(source) {
  return `<p style="max-width:820px;margin:20px 0 0;color:#344054;font-size:18px;line-height:1.7;">${escapeHtml(source.intro)}</p>
    <section style="padding-top:42px;"><h2 style="margin:0;font-size:32px;">Формат работы</h2><p style="max-width:820px;margin:16px 0 0;color:#475467;line-height:1.7;">${escapeHtml(source.format)}</p></section>
    <section style="padding-top:42px;"><h2 style="margin:0;font-size:32px;">С какими задачами можно обратиться</h2>${renderList(source.taskExamples)}</section>
    <section style="padding-top:42px;"><h2 style="margin:0;font-size:32px;">Что можно решить удалённо</h2>${renderList(source.remoteTasks)}</section>
    ${renderFaq(source.faq)}
    <section style="padding-top:42px;"><h2 style="margin:0;font-size:28px;">Полезные ссылки</h2>${renderLinks([source.relatedMainPage, ...source.relatedServices, ...source.relatedArticles])}</section>`;
}

function renderPriceContent(source) {
  return `<p style="max-width:820px;margin:20px 0 0;color:#344054;font-size:18px;line-height:1.7;">${escapeHtml(source.description)}</p>
    <section style="padding-top:42px;"><h2 style="margin:0;font-size:32px;">Пакеты и стартовые цены</h2>${renderCards(source.packages)}</section>
    ${source.sections.map((section) => `<section style="padding-top:42px;"><h2 style="margin:0;font-size:28px;">${escapeHtml(section.title)}</h2>${renderList(section.items)}</section>`).join('')}
    ${source.disclaimer ? `<p style="margin:32px 0 0;border-radius:16px;padding:18px;background:#f2f4f7;color:#475467;line-height:1.6;">${escapeHtml(source.disclaimer)}</p>` : ''}`;
}

function renderCaseContent(source) {
  return `<p style="max-width:820px;margin:20px 0 0;color:#344054;font-size:18px;line-height:1.7;">${escapeHtml(source.shortDescription)}</p>
    <section style="padding-top:42px;"><h2 style="margin:0;font-size:32px;">Задача</h2><p style="max-width:820px;margin:16px 0 0;color:#475467;line-height:1.7;">${escapeHtml(source.task)}</p></section>
    <section style="padding-top:42px;"><h2 style="margin:0;font-size:32px;">Что реализовано</h2>${renderList(source.workCompleted)}</section>
    <section style="padding-top:42px;"><h2 style="margin:0;font-size:32px;">Результат</h2>${renderList(source.result)}</section>
    <section style="padding-top:42px;"><h2 style="margin:0;font-size:28px;">Связанные услуги</h2>${renderLinks([...(source.relatedServices || []), ...(source.relatedArticles || [])])}</section>`;
}

function renderSourceContent(route) {
  if (route.sourceKind === 'landing') return renderLandingContent(route);
  if (route.sourceKind === 'article') return renderArticleContent(route.source);
  if (route.sourceKind === 'local') return renderLocalContent(route.source);
  if (route.sourceKind === 'price') return renderPriceContent(route.source);
  if (route.sourceKind === 'case') return renderCaseContent(route.source);
  const baseContent = baseStaticContent[route.path];
  if (baseContent) {
    return `<p style="max-width:820px;margin:20px 0 0;color:#344054;font-size:18px;line-height:1.7;">${escapeHtml(baseContent.intro)}</p>
      ${baseContent.sections.map((section) => `<section style="padding-top:42px;"><h2 style="margin:0;font-size:32px;line-height:1.15;">${escapeHtml(section.title)}</h2><p style="max-width:820px;margin:16px 0 0;color:#475467;line-height:1.7;">${escapeHtml(section.text)}</p></section>`).join('')}
      <section style="padding-top:42px;"><h2 style="margin:0;font-size:28px;">Полезные ссылки</h2>${renderLinks(baseContent.links)}</section>`;
  }
  return '';
}

function renderStaticFallback(route) {
  if (route.path === '/website-development-vladivostok' && !route.sourceKind) {
    return renderWebsiteStudioFallback(route);
  }

  const crumbs = breadcrumbItems(route.path);
  const helpfulLinks = [
    { label: 'Услуги', href: '/services' },
    { label: 'Цены', href: '/prices' },
    { label: 'Полезное', href: '/useful' },
    { label: 'Контакты', href: '/contacts' },
  ].filter((link) => link.href !== route.path);

  const sourceContent = renderSourceContent(route);

  return `<!-- SEO_STATIC_FALLBACK_START --><main style="max-width:1120px;margin:0 auto;padding:48px 20px 96px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;background:#fff;">
      <nav aria-label="Хлебные крошки" style="font-size:14px;color:#667085;margin-bottom:32px;">
        ${crumbs.map((item, index) => `${index > 0 ? '<span aria-hidden="true" style="margin:0 8px;">/</span>' : ''}<a href="${escapeHtml(item.href)}" style="color:#475467;text-decoration:none;">${escapeHtml(item.label)}</a>`).join('')}
      </nav>
      <section>
        <p style="margin:0 0 12px;color:#2563eb;font-size:15px;font-weight:700;">SITEVL</p>
        <h1 style="max-width:880px;margin:0 0 18px;font-size:clamp(36px,7vw,72px);line-height:.95;letter-spacing:-.02em;">${escapeHtml(route.h1 || routeHeading(route))}</h1>
        <p style="max-width:760px;margin:0 0 28px;color:#475467;font-size:20px;line-height:1.55;">${escapeHtml(route.description)}</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;">
          ${helpfulLinks.map((link) => `<a href="${escapeHtml(link.href)}" style="border:1px solid #d0d5dd;border-radius:999px;padding:12px 18px;color:#111827;text-decoration:none;font-weight:700;">${escapeHtml(link.label)}</a>`).join('')}
        </div>
      </section>
      ${sourceContent}
    </main><!-- SEO_STATIC_FALLBACK_END -->`;
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
  const staticFallback = renderStaticFallback(route);
  if (html.includes('<!-- SEO_STATIC_FALLBACK_START -->')) {
    html = html.replace(
      /<!-- SEO_STATIC_FALLBACK_START -->[\s\S]*?<!-- SEO_STATIC_FALLBACK_END -->/,
      staticFallback,
    );
  } else {
    html = html.replace(/<div id="root"><\/div>/, `<div id="root">${staticFallback}</div>`);
  }

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
${route.lastmod ? `    <lastmod>${route.lastmod}</lastmod>\n` : ''}    <changefreq>${route.changefreq}</changefreq>
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
Disallow: /admin

Sitemap: ${siteUrl}/sitemap.xml
`;
}

const baseHtml = readFileSync(join(distDir, 'index.html'), 'utf8');
routes.forEach((route) => writeRouteHtml(baseHtml, route));

const notFoundHtml = renderHtml(baseHtml, {
  path: '/404',
  title: 'Страница не найдена — SITEVL',
  description: 'Такой страницы на SITEVL нет. Перейдите к услугам, ценам, кейсам или полезным материалам.',
  h1: 'Страница не найдена',
  noindex: true,
  schemaType: 'WebPage',
});
writeFileSync(join(distDir, '404.html'), notFoundHtml);

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
      h1: route.h1 || routeHeading(route),
      noindex: Boolean(route.noindex),
      schemaType: route.schemaType || 'WebPage',
      sourceKind: route.sourceKind || 'base',
      ...(route.lastmod ? { lastmod: route.lastmod } : {}),
    })),
    null,
    2,
  )}\n`,
);

console.log(`[seo] Generated ${sitemapRoutes.length} sitemap URLs and ${routes.length} prerendered HTML files.`);
