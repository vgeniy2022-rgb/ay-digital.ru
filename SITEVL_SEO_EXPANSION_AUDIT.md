# SITEVL SEO Expansion Audit

Дата baseline-аудита: 5 сентября 2026 года. Состояние до SEO-расширения: `64` индексируемых URL, `14` технических URL с `noindex`, ветка `main`, commit `6b59320d3a8de8adbf37cf219530a1a71db99b05`.

## Методика и границы

Проверены исходные реестры маршрутов, runtime-компоненты React, итоговый `dist`, sitemap, robots, canonical, H1, внутренние ссылки и JSON-LD. Production crawl подтвердил для всех 64 URL ответ `HTTP 200`, self-canonical, `index, follow`, наличие H1 и валидного JSON-LD. LAB, Studio, Brief и Changelog отсутствуют в sitemap и остаются `noindex`.

Под «schema» в таблицах ниже указана сущность конкретной страницы. На всех URL дополнительно присутствуют общие `Organization`, `Person`, `LocalBusiness`/`ProfessionalService`, `WebSite` и `BreadcrumbList`. «Links» — число уникальных внутренних путей в initial HTML до исполнения JavaScript и основные смысловые направления. Canonical `self` означает полный URL текущего маршрута на настроенном production origin.

Оценка следует рекомендациям Google: отдельные страницы создаются для самостоятельных намерений, а не для перестановки слов; keyword stuffing и doorway pages исключаются; canonical и внутренние ссылки должны последовательно указывать на основной URL; structured data должна соответствовать видимому содержимому. См. [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies), [Canonical URL](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [Structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) и [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

## Основные страницы

| URL | Title | H1 в initial HTML | Intent | Primary query cluster | Secondary queries | Content overlap | Canonical | Index | Links | Schema |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` | SITEVL — сайты и мобильные приложения для бизнеса | SITEVL | Бренд и коммерческий обзор | создание сайтов | мобильные приложения, Владивосток, работа удалённо | Пересекается с website hub, но остаётся брендовой входной страницей | self | index, follow | 8: услуги, цены, кейсы, AI | — |
| `/services` | Услуги IT-специалиста во Владивостоке — сайты, техника, помощь | Услуги IT-специалиста во Владивостоке | Навигационный hub услуг | IT-услуги Владивосток | сайты, приложения, компьютерная помощь | Не должна конкурировать с продуктовыми страницами | self | index, follow | 8: локальные хабы | `ItemList` |
| `/mobile-apps` | Разработка мобильных приложений для iOS и Android — SITEVL | Разработка мобильных приложений для iOS и Android | Коммерческий mobile | разработка мобильных приложений | iOS, Android, приложение для бизнеса | Цена отделена в `/prices/mobile-apps` | self | index, follow | 9: цены, brief, контакты | `Service` |
| `/ai-website` | AI-конструктор концепции сайта — SITEVL | AI-конструктор концепции сайта | Конверсионный инструмент | AI-концепт сайта | структура, прототип, оценка | Не является заменой коммерческой странице разработки | self | index, follow | 9: privacy, услуги | `Service` |
| `/prices` | Цены на IT-услуги во Владивостоке — SITEVL | Цены на IT-услуги во Владивостоке | Общий прайс | цены на IT-услуги | сайты, приложения, техника | Общий hub; подробный website intent у `/prices/websites` | self | index, follow | 8: направления цен | `OfferCatalog` |
| `/cases` | Кейсы и примеры задач — SITEVL | Кейсы и примеры задач | Доверие и proof | кейсы разработки | React, Supabase, сайты | Не подменяет продуктовые страницы | self | index, follow | 9: кейсы, услуги | `CollectionPage` |
| `/about` | О специалисте — Александр, частный IT-специалист во Владивостоке | О специалисте | Поиск исполнителя | частный веб-разработчик | разработчик сайтов, без менеджеров | Коммерческий developer intent; статьи остаются обучающими | self | index, follow | 9: сайт, кейсы, контакты | `AboutPage` |
| `/contacts` | Контакты IT-специалиста во Владивостоке — Александр | Контакты IT-специалиста во Владивостоке | Контактный | контакты SITEVL | Telegram, WhatsApp, телефон | Брендовый utility intent | self | index, follow | 8: основные разделы | `ContactPage` |
| `/useful` | Полезное о телефонах, компьютерах и цифровой безопасности | Полезное о телефонах, компьютерах и цифровой безопасности | Информационный hub | полезные материалы | сайты, техника, безопасность | Навигация к статьям, не коммерческий target | self | index, follow | 8 в fallback; статьи после JS | `CollectionPage` |
| `/primorsky-krai` | IT-услуги во Владивостоке и Приморском крае — SITEVL | IT-услуги во Владивостоке и Приморском крае | Региональный hub | IT-услуги Приморский край | Артём, Уссурийск, Находка | Разводит региональную навигацию и city intent | self | index, follow | 9: города и Владивосток | `CollectionPage` |
| `/process` | Порядок работы — как проходит IT-помощь и разработка сайта | Порядок работы | Доверие / процесс | этапы разработки сайта | сроки, правки, передача | Поддерживает коммерческие страницы | self | index, follow | 9: услуги, цены, контакты | `WebPage` |
| `/privacy` | Политика обработки персональных данных — SITEVL | Политика обработки персональных данных | Legal | политика конфиденциальности | обработка данных | Нет коммерческой конкуренции | self | index, follow | 9: общая навигация | `WebPage` |
| `/terms` | Условия обращения и оказания услуг — SITEVL | Условия обращения и оказания услуг | Legal | условия услуг | цена, согласование, ограничения | Нет коммерческой конкуренции | self | index, follow | 9: общая навигация | `WebPage` |

## Цены

| URL | Title | H1 | Intent | Primary query cluster | Secondary queries | Content overlap | Canonical | Index | Links | Schema |
|---|---|---|---|---|---|---|---|---|---|---|
| `/prices/websites` | Цены на разработку сайтов — SITEVL | Цены на разработку сайтов | Транзакционный price | создание сайта цена | сколько стоит сайт, цена под ключ | Главный price target; статья объясняет факторы | self | index, follow | 9: прайс, услуги | `OfferCatalog` |
| `/prices/mobile-apps` | Цены на мобильные приложения — SITEVL | Цены на мобильные приложения | Mobile price | стоимость мобильного приложения | iOS/Android цена | Product intent у `/mobile-apps` | self | index, follow | 9: прайс, mobile | `OfferCatalog` |
| `/prices/programs` | Установка программ \| Цены | Установка программ | Цена услуги | стоимость установки программ | Office, Windows, Mac | Связана с локальной услугой | self | index, follow | 9: услуги, цены | `OfferCatalog` |
| `/prices/devices` | Настройка ноутбуков и компьютеров \| Цены | Настройка ноутбуков и компьютеров | Цена настройки | настройка ноутбука цена | Windows, MacBook | Связана с двумя сервисными страницами | self | index, follow | 9: услуги, цены | `OfferCatalog` |
| `/prices/phones` | Телефоны и перенос данных \| Цены | Телефоны и перенос данных | Цена настройки/переноса | перенос данных цена | iPhone, Android | Связана с phone/transfer pages | self | index, follow | 9: услуги, цены | `OfferCatalog` |
| `/prices/pc` | Сборка ПК и комплектующие \| Цены | Сборка ПК и комплектующие | Цена сборки | сборка ПК цена | комплектующие, Windows | Связана с `/pc-build-vladivostok` | self | index, follow | 9: услуги, цены | `OfferCatalog` |

## Полезные материалы

| URL | Title | H1 | Intent | Primary query cluster | Secondary queries | Content overlap | Canonical | Index | Links | Schema |
|---|---|---|---|---|---|---|---|---|---|---|
| `/useful/speed-up-windows` | Как ускорить Windows, если компьютер тормозит | То же | Диагностика | как ускорить Windows | тормозит компьютер | Ведёт к Windows/computer help | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/new-laptop-setup` | Что делать после покупки нового ноутбука | То же | Инструкция | настройка нового ноутбука | Windows, MacBook | Инфо к device services | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/how-to-choose-ssd` | Как выбрать SSD для ноутбука или ПК | То же | Выбор | как выбрать SSD | NVMe, SATA, объём | Инфо к PC help | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/safe-data-transfer` | Как безопасно перенести данные | То же | Safety guide | безопасный перенос данных | резервная копия | Отличается от device-to-device guide | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/how-to-choose-laptop` | Как выбрать ноутбук под задачи и бюджет | То же | Выбор | как выбрать ноутбук | работа, учёба, бюджет | Инфо к консультации | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/macbook-or-windows` | MacBook или Windows — что выбрать | MacBook или Windows | Сравнение | MacBook или Windows | ноутбук для работы | Связана с обеими setup pages | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/how-to-choose-computer` | Как выбрать компьютер для дома и работы | То же | Выбор | как выбрать компьютер | ПК для игр/работы | Инфо к PC build | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/how-to-protect-computer` | Как защитить компьютер от вирусов и потери данных | То же | Safety | защита компьютера | вирусы, backup | Инфо к computer help | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/how-to-choose-wifi-router` | Как выбрать Wi-Fi роутер для квартиры или офиса | То же | Выбор | как выбрать Wi-Fi роутер | Wi-Fi 6, mesh | Смежно с slow internet | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/slow-internet` | Почему медленно работает интернет | То же | Диагностика | медленный интернет | Wi-Fi, провайдер | Смежно, но не дублирует выбор роутера | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/how-to-choose-smartphone` | Как выбрать смартфон без переплаты | То же | Выбор | как выбрать смартфон | iPhone, Android | Инфо к phone setup | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/what-is-business-card-website` | Что такое сайт-визитка | То же | Определение | сайт-визитка | структура, кому подходит | Инфо, не заказ разработки | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/what-is-landing-page` | Что такое лендинг | То же | Определение | что такое лендинг | одностраничный сайт | Инфо; commercial landing будет отдельным | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/what-is-admin-website` | Что такое сайт с админкой | То же | Определение | сайт с админкой | CMS, управление контентом | Инфо; услуга у admin landing | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/what-is-mvp` | Что такое MVP приложения или сервиса | То же | Определение | что такое MVP | первая версия продукта | Связывает mobile и web-service | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/when-business-needs-website` | Когда бизнесу нужен сайт | То же | Decision | нужен ли бизнесу сайт | сайт или соцсети | Инфо к business/hub | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/when-business-needs-automation` | Когда нужна автоматизация бизнеса | То же | Decision | автоматизация бизнеса | таблицы, отчёты, сервис | Инфо к web-service | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/how-to-choose-hosting` | Как выбрать хостинг для сайта | То же | Выбор | как выбрать хостинг | домен, SSL, backup | Поддерживает website pages | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/prepare-photos-for-website` | Как подготовить фотографии для сайта | То же | Подготовка | фото для сайта | форматы, сжатие, alt | Поддерживает buyer journey | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/how-to-choose-website-developer` | Как выбрать разработчика сайта | То же | Выбор исполнителя | как выбрать разработчика | портфолио, этапы, доступы | `/about` отвечает «кто», статья — «как выбрать» | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/website-development-cost` | Сколько стоит создание сайта | То же | Инфо-price | сколько стоит сайт | факторы стоимости | Не конкурировать: точные пакеты у `/prices/websites` | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/website-for-small-business` | Какой сайт нужен малому бизнесу | То же | Decision | сайт для малого бизнеса | лендинг, визитка, CMS | Инфо к business commercial page | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/company-website-structure` | Что должно быть на сайте компании | То же | Planning | структура сайта компании | услуги, цены, кейсы | Инфо к business page | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/diy-or-developer-website` | Сайт самому или заказать разработчику | То же | Comparison | сайт самому или заказать | конструктор, разработчик | Отличается от developer profile | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/data-transfer` | Перенос данных между iPhone и Android | То же | Device guide | перенос между телефонами | iPhone → Android | Конкретный сценарий против safety guide | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/digital-hygiene` | Цифровая гигиена для iPhone, Android и MacBook | То же | Safety | цифровая гигиена | пароли, разрешения, backup | Широкий safety hub | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/scams` | Защита от мошенников и безопасность аккаунтов | То же | Safety | защита от мошенников | коды, удалённый доступ | Узкий anti-scam intent | self | index, follow | 9 | `Article` + `FAQPage` |
| `/useful/apps-checklists` | Приложения и чек-листы для безопасной настройки устройств | То же | Checklist | безопасная установка приложений | продажа/покупка устройства | Checklist, не general hygiene | self | index, follow | 9 | `Article` + `FAQPage` |

## Кейсы и локальные страницы

| URL | Title | H1 | Intent | Primary query cluster | Secondary queries | Content overlap | Canonical | Index | Links | Schema |
|---|---|---|---|---|---|---|---|---|---|---|
| `/cases/ay-digital-personal-website` | Кейс: сайт-портфолио SITEVL на React и Vite | То же | Proof | кейс разработки сайта | React, Vite, SEO | Реальный результат, не service page | self | index, follow | 10: услуги, статьи | `CreativeWork` |
| `/cases/marine-equipment-catalog` | Кейс: каталог морского оборудования на React и Supabase | То же | Proof | кейс сайта-каталога | Supabase, админка, фильтры | Реальный кейс поддерживает catalog intent | self | index, follow | 10: услуги, статьи | `CreativeWork` |
| `/computer-help-artem` | Компьютерная помощь в Артёме — удалённая настройка и консультация | Компьютерная помощь в Артёме | Local service | компьютерная помощь Артём | Windows, MacBook, программы | Отличается remote-first форматом | self | index, follow | 9 | `Service` + `FAQPage` |
| `/computer-help-ussuriysk` | Компьютерная помощь в Уссурийске — Windows, MacBook и программы | Компьютерная помощь в Уссурийске | Local service | компьютерная помощь Уссурийск | программы, transfer | Самостоятельные сценарии и FAQ | self | index, follow | 9 | `Service` + `FAQPage` |
| `/computer-help-nakhodka` | Компьютерная помощь в Находке — удалённая диагностика и настройка | Компьютерная помощь в Находке | Local service | компьютерная помощь Находка | диагностика, phone setup | Самостоятельные сценарии и FAQ | self | index, follow | 9 | `Service` + `FAQPage` |
| `/website-development-artem` | Создание и разработка сайтов в Артёме — удалённо для бизнеса | Создание и разработка сайтов в Артёме | Local commercial | создание сайтов Артём | лендинг, малый бизнес | Уникальный remote-start сценарий | self | index, follow | 9 | `Service` + `FAQPage` |
| `/website-development-ussuriysk` | Создание и разработка сайтов в Уссурийске — для услуг и бизнеса | Создание и разработка сайтов в Уссурийске | Local commercial | создание сайтов Уссурийск | компания, управление | Отличается сценарием многостраничного сайта | self | index, follow | 9 | `Service` + `FAQPage` |
| `/website-development-nakhodka` | Создание сайтов в Находке — удалённая разработка под услугу | Создание сайтов в Находке | Local commercial | создание сайтов Находка | каталог, компания | Связать с реальным catalog case | self | index, follow | 9 | `Service` + `FAQPage` |
| `/computer-help-vladivostok` | Компьютерная помощь во Владивостоке — частный мастер | Компьютерная помощь во Владивостоке | Local service | компьютерная помощь Владивосток | Windows, MacBook, диагностика | Главный local help hub | self | index, follow | 9 | `Service` |
| `/program-installation-vladivostok` | Установка программ во Владивостоке — Windows и Mac | Установка программ во Владивостоке | Local service | установка программ Владивосток | Office, Windows, Mac | Самостоятельная услуга | self | index, follow | 9 | `Service` |
| `/windows-setup-vladivostok` | Настройка Windows во Владивостоке — ноутбук и ПК под ключ | Настройка Windows во Владивостоке | Local service | настройка Windows Владивосток | ноутбук, драйверы | Самостоятельная услуга | self | index, follow | 9 | `Service` |
| `/macbook-setup-vladivostok` | Настройка MacBook во Владивостоке — macOS и программы | Настройка MacBook во Владивостоке | Local service | настройка MacBook Владивосток | macOS, iCloud | Самостоятельная услуга | self | index, follow | 9 | `Service` |
| `/pc-build-vladivostok` | Сборка ПК во Владивостоке — компьютер под ключ | Сборка ПК во Владивостоке | Local service | сборка ПК Владивосток | комплектующие, Windows | Самостоятельная услуга | self | index, follow | 9 | `Service` |
| `/data-transfer-vladivostok` | Перенос данных во Владивостоке — iPhone и Android | Перенос данных во Владивостоке | Local service | перенос данных Владивосток | iPhone, Android | Самостоятельная услуга | self | index, follow | 9 | `Service` |
| `/phone-setup-vladivostok` | Настройка iPhone и Android во Владивостоке | Настройка iPhone и Android во Владивостоке | Local service | настройка телефона Владивосток | Apple ID, Google | Самостоятельная услуга | self | index, follow | 9 | `Service` |
| `/website-development-vladivostok` | Создание сайтов во Владивостоке и Приморском крае — SITEVL | Создаю самописные сайты для бизнеса | Главный website commercial | создание сайтов Владивосток | заказать сайт, сайт под ключ, удалённо | Единый общий/local hub; не создавать synonym routes | self | index, follow | 5: недостаточная static перелинковка | `Service` + `FAQPage` |
| `/website-admin-vladivostok` | Сайт с системой управления во Владивостоке — SITEVL | Сайт с системой управления во Владивостоке | Functional commercial | сайт с системой управления | сайт с админкой, CMS | Article объясняет термин, landing продаёт услугу | self | index, follow | 9 | `Service` |

## Технические страницы и индексирование

`/studio`, `/studio/projects`, `/lab`, `/lab/builder`, `/lab/2d`, `/lab/3d`, `/lab/physics`, `/lab/os`, `/lab/retro`, `/lab/modern-os`, `/lab/canvas`, `/lab/builder-legacy`, `/brief`, `/changelog` имеют `noindex, follow` и исключены из sitemap. Generated AI previews не имеют отдельной индексируемой URL-сети. Google Search Console verification в `index.html` сохранён.

## Findings и решения

### P1 — thin initial HTML

У 63 из 64 индексируемых URL в исходном HTML обычно только 22–40 видимых слов: H1, description и четыре общие ссылки. Полный React-контент появляется после JavaScript. Главная при этом имеет static H1 `SITEVL`, а реальный интерфейс — коммерческий H1. Требуется data-driven prerender с фактическими intro, H2/H3, FAQ, ценами и релевантными ссылками. Google исполняет JavaScript, но для устойчивого обнаружения контента рекомендует server-side/static rendering или hydration, когда это возможно.

### P1 — два источника metadata

`scripts/generate-seo.mjs` и runtime-данные расходятся как минимум на 26 URL по title и/или description. Нужен общий source: runtime route data должны формировать prerender manifest, sitemap и schema. В release gate нужна metadata parity-проверка.

### P1 — fabricated FAQ/schema

Generator создаёт универсальные FAQ для статей и городских страниц, но fallback их не показывает, а после hydration UI отображает другой набор. Автогенерация вопросов из поисковых фраз в `seoLandingPages.ts` раздувает коммерческий FAQ до десятков формулировок. Решение: только реальные видимые FAQ, один и тот же набор для UI и JSON-LD; поисковые фразы не выводить как chips.

### P1 — soft 404 и technical previews

Глобальный Vercel rewrite отдаёт неизвестным URL homepage с `HTTP 200`, `index, follow` и canonical `/` до запуска React. Dynamic Studio preview также полагается на client-side `noindex`. Нужны response headers `X-Robots-Tag` для technical prefixes, server redirects для legacy paths и настоящий 404 для неизвестных URL; менять routing следует отдельно и только после полного regression QA динамических LAB/Studio маршрутов.

### P2 — sitemap dates и canonical host

Каждая сборка ставит всем URL один новый `lastmod`, хотя контент не обязательно менялся. Для статей уже есть `updatedAt`; для остальных нужна честная дата либо отсутствие `lastmod`. Production canonical сейчас определяется Vercel environment. Локальный tracked artifact использует другой Vercel alias; нельзя менять production origin вслепую — сначала выбрать один основной host и настроить server-side redirect второго.

### P2 — внутренние ссылки и UX

Runtime-контент богаче initial HTML, но `/services` не использует `service.path` как явную видимую ссылку в карточке. Коммерческий hub должен вести на самостоятельные product pages, цены, developer profile, case и AI-концепт. SEO-контент не должен превращаться в отдельные длинные списки ключей: существующий визуальный язык, адаптивность и быстрый ответ о цене сохраняются.

## Архитектурное решение расширения

Не создавать `/zakazat-site`, `/sdelat-site`, `/sozdat-site`, `/site-pod-klyuch`, city-копии или отдельные price synonym pages. Общий кластер остаётся у `/website-development-vladivostok`; `/prices/websites` отвечает за транзакционную цену; `/about` — за выбор частного разработчика. Самостоятельную ценность имеют новые страницы для лендинга, сайта компании, каталога, интернет-магазина и веб-приложения. Итоговая карта зафиксирована в `SITEVL_SEO_QUERY_MAP.md`.

## Post-expansion delta

Ниже зафиксированы восемь новых индексируемых URL текущей локальной реализации. Значения Title, H1, description, canonical, robots и schema проверяются не по плану, а по сгенерированному production HTML.

| URL | Title | H1 | Meta description | Intent | Primary cluster | Secondary queries | Overlap boundary | Canonical / Index | Internal targets | Schema |
|---|---|---|---|---|---|---|---|---|---|---|
| `/business-website-development` | Сайт для бизнеса под ключ — разработка и запуск \| SITEVL | Разработка сайта для бизнеса и компании | Разработка сайта для бизнеса и компании: структура, дизайн, мобильная версия, формы заявок, базовая SEO-подготовка и запуск. Работа напрямую с разработчиком. | Заказать business website | сайт для бизнеса | сайт компании, малый бизнес, корпоративный сайт | Общий/local intent остаётся у website hub | self / index, follow | 21: hub, landing, CMS, магазин, цены, статьи, AI, кейсы | `Service` + visible `FAQPage` |
| `/landing-development` | Создание лендинга под ключ — разработка одностраничного сайта | Создание лендинга под ключ | Разработка лендинга под ключ: структура предложения, дизайн, мобильная версия, формы заявок, аналитика и запуск. Прямое общение с разработчиком. | Заказать одностраничный сайт | создание лендинга | landing page, лендинг под ключ | Определение формата остаётся у статьи | self / index, follow | 19: business, CMS, web app, цены, статьи, AI | `Service` + visible `FAQPage` |
| `/catalog-website-development` | Сайт-каталог для компании — разработка каталога товаров \| SITEVL | Разработка сайта-каталога для компании | Создание сайта-каталога для компании: категории, карточки товаров, фильтры, документы, заявки и управление контентом без обязательной корзины. | Заказать каталог без обязательной оплаты | сайт-каталог | каталог товаров, каталог компании | Отделён от интернет-магазина наличием корзины и оплаты | self / index, follow | 19: магазин, CMS, business, цены, кейс, AI | `Service` + visible `FAQPage` |
| `/online-store-development` | Создание интернет-магазина под ключ — разработка и запуск | Разработка интернет-магазина под ключ | Разработка интернет-магазина: каталог, карточки, корзина, оформление заказа, управление товарами и согласованные интеграции. Прямое общение с разработчиком. | Заказать ecommerce-разработку | создание интернет-магазина | магазин под ключ, корзина, оплата | Исследование цены остаётся у отдельной статьи | self / index, follow | 18: каталог, business, web app, цены, cost guide, AI | `Service` + visible `FAQPage` |
| `/web-application-development` | Разработка веб-приложений и онлайн-сервисов для бизнеса | Разработка веб-приложения и онлайн-сервиса | Разработка веб-приложения для бизнеса: личные кабинеты, роли, данные, формы, отчёты и интеграции. Проектирование MVP и поэтапный запуск. | Заказать функциональный онлайн-продукт | разработка веб-приложения | веб-сервис, личный кабинет, MVP | Отделён от контентного сайта наличием логики и данных | self / index, follow | 18: business, mobile, CMS, MVP, цены, AI | `Service` + visible `FAQPage` |
| `/useful/how-to-order-website` | Как заказать сайт и не переплатить — пошаговый план | Как заказать сайт и не переплатить | Как заказать сайт для бизнеса без лишних расходов: что подготовить, как сравнить сметы, проверить состав работ, доступы, сроки и поддержку после запуска. | Buyer guide | как заказать сайт | смета, этапы, доступы, поддержка | Обучает выбору; заказ остаётся у service hub | self / index, follow | 20: услуги, цены, business, developer guide, AI | `Article` + visible `FAQPage` |
| `/useful/website-or-mobile-app` | Сайт или мобильное приложение — что выбрать бизнесу | Сайт или мобильное приложение: что выбрать бизнесу | Когда бизнесу нужен сайт, мобильное приложение или веб-сервис. Сравнение по поиску клиентов, повторным действиям, функциям устройства, срокам и развитию продукта. | Сравнение форматов | сайт или мобильное приложение | PWA, web service, iOS, Android, MVP | Не подменяет product и price pages | self / index, follow | 17: сайты, web app, mobile, цены, MVP, AI | `Article` + visible `FAQPage` |
| `/useful/ecommerce-development-cost` | Сколько стоит интернет-магазин — состав и цена разработки | Сколько стоит разработка интернет-магазина | От чего зависит стоимость создания интернет-магазина: каталог, корзина, оплата, доставка, 1С или CRM, наполнение и поддержка. Чек-лист для точной оценки. | Ecommerce price research | сколько стоит интернет-магазин | каталог, корзина, доставка, интеграции | Заказ остаётся у product page; пакеты — в едином прайсе | self / index, follow | 18: магазин, каталог, CMS, website prices, AI | `Article` + visible `FAQPage` |

Для этих страниц автоматическая проверка подтверждает: `0` неизвестных внутренних ссылок, по `8` видимых FAQ, `0` точных дублей Title/H1/description и от `498` до `793` слов полезного static content. Эвристическая текстовая близость не показывает doorway-клонирования: максимум между новыми коммерческими страницами — `0.217`, максимум с ближайшей существующей страницей — `0.265`.

## Статус исходных findings

| Finding | Status | Реализация | Проверка |
|---|---|---|---|
| Thin initial HTML | FIXED | Data-driven prerender выводит реальный H1, intro, разделы, FAQ, цены и ссылки | SEO audit проверяет static content всех 72 indexable routes |
| Два источника metadata | FIXED | Генератор импортирует текущие route/data registries; общие H1 вынесены в `pageMeta` | 0 дублей Title, description и H1; runtime/prerender H1 синхронизированы |
| Fabricated FAQ/schema | FIXED | Search-phrase chips и универсальные синтетические FAQ удалены; JSON-LD строится из видимых FAQ | Аудит сравнивает вопросы и ответы schema с visible body |
| Глобальный soft 404 | FIXED LOCALLY | Catch-all rewrite удалён; создан самостоятельный `404.html`; несуществующий `/admin` больше не генерируется как 200 | Config/audit PASS; реальный production HTTP 404 проверяется только после отдельного deployment |
| Technical previews | FIXED LOCALLY | Точные `X-Robots-Tag` для Studio, LAB, Brief, Changelog и Admin; Studio rewrite получает Studio shell | Vercel-config audit PASS; response headers на production ожидают deployment |
| Недостоверный `lastmod` | FIXED | `lastmod` есть только там, где существует реальная дата статьи/кейса | SEO audit отклоняет build-date для всех URL |
| Canonical host | FIXED LOCALLY | Единый origin: `https://sitevl-ru.vercel.app` | 72 self-canonical URL, robots и sitemap используют один host |
| Слабая перелинковка `/services` | FIXED | Карточки стали ссылками; добавлен product hub и описательные anchors | Новые страницы имеют 17–21 уникальную внутреннюю цель; broken targets: 0 |
| Семантика цены | FIXED | Один `structuredPrice`: `от N` → min, `N–M` → min/max, `N` → exact | Unit tests и runtime/prerender schema используют общий parser |
| Неподтверждённый офис | FIXED | `ProfessionalService` без `PostalAddress`; физический офис не заявляется | Unit test запрещает `LocalBusiness`, `PostalAddress`, `addressLocality` |

## Entity и local consistency

- Название, специалист, основной телефон, Telegram, город и canonical origin берутся из `src/config/site.ts`; отдельные номера в SEO-контент не копируются.
- Service area: Владивосток, Приморский край, Артём, Уссурийск и Находка — без заявления физического офиса.
- Общие сущности: `Organization`, `Person`, `ProfessionalService`, `WebSite`; специализированная schema добавляется только к соответствующему видимому содержимому.
- Person job title: «Частный веб-разработчик и IT-специалист». SITEVL не позиционируется как крупная студия.
- Неподтверждённые рейтинги, лидерство, число клиентов и гарантированные поисковые позиции не используются.

## Финальная техническая матрица локального release candidate

| Проверка | Ожидание | Фактический результат | Итог |
|---|---|---|---|
| Sitemap | Только полезные indexable URL | 72 URL; LAB, Studio, Brief, Changelog, Admin и previews отсутствуют | PASS |
| Robots | Коммерческие URL разрешены; sitemap на canonical host | Важные public routes не заблокированы; sitemap указывает на `sitevl-ru.vercel.app` | PASS |
| Canonical | Один self-canonical на индексируемую страницу | 72/72, уникальные | PASS |
| Technical noindex | LAB/Studio/служебные интерфейсы исключены | 14 prerendered `noindex` routes; Admin остаётся несуществующим URL с noindex/nofollow response header | PASS LOCALLY |
| Breadcrumbs | Видимая и JSON-LD hierarchy согласованы | `BreadcrumbList` строится из того же route registry | PASS |
| FAQ | Только видимый полезный FAQ | Questions и accepted answers совпадают с HTML | PASS |
| Price schema | «от», диапазон и точная цена не смешиваются | Общий tested parser для runtime и prerender | PASS |
| Search Console | Verification не удалён | Verification meta сохранён и проверяется audit script | PASS |
| Duplicate metadata | 0 точных дублей | Title: 0; description: 0; H1: 0 | PASS |
| Unknown internal links | 0 | 0 | PASS |
| Production 404 и headers | Реальные HTTP 404 / `X-Robots-Tag` | Не проверено: текущая версия ещё не публиковалась | DEFERRED UNTIL DEPLOY |

## Release gate

На итоговом локальном release candidate выполнены:

- `npm test`: `138/138 PASS`;
- `npm run lint`: `PASS`;
- `npx tsc -b --pretty false`: `PASS`;
- `npm run build`: `PASS`, 2 586 модулей, 72 sitemap URL, 86 prerendered HTML (`72 indexable + 14 noindex`);
- `git diff --check`: `PASS`;
- повторный `generate-seo` + `seo-audit`: `PASS`, результат идемпотентен;
- уникальность manifest: `86/86` routes; дубли Title/description/H1: `0/0/0`;
- desktop SPA: переход `/services` → `/business-website-development` открывает страницу с `scrollY = 0`, корректными Title/H1/canonical, видимым FAQ и AI CTA;
- mobile `390×844`: overflow отсутствует (`scrollWidth = clientWidth = 390`), H1 один, ценовой summary находится до первого длинного раздела;
- runtime JSON-LD: `Organization`, `Person`, `ProfessionalService`, `WebSite`, `BreadcrumbList`, page-specific `Service`/`Article` и видимый `FAQPage`; `LocalBusiness`/`PostalAddress` отсутствуют;
- runtime прайс: 39 offers — 17 стартовых, 13 диапазонных и 8 точных; «от» не превращается в exact price;
- Web Vitals на representative commercial route: `CLS 0.0`; поздний сдвиг footer устранён полноэкранным lazy-route placeholder;
- axe WCAG 2 A/AA: `0` автоматических violations, `1` incomplete manual contrast review для полупрозрачных/hover-слоёв; визуальная desktop/mobile проверка выполнена;
- console errors и page errors на проверенных маршрутах: `0`.

Production остаётся без изменений: commit, push и deployment не выполнялись, потому что задача не содержала отдельного разрешения на публикацию. Поэтому HTTP-статус неизвестного production URL и live `X-Robots-Tag` корректно остаются в статусе `DEFERRED UNTIL DEPLOY`. Единственное предупреждение сборки — существующие крупные JavaScript chunks свыше 500 kB; оно не является compile error и требует отдельной performance-задачи, чтобы не смешивать SEO-архитектуру с широким рефакторингом LAB/Studio.
