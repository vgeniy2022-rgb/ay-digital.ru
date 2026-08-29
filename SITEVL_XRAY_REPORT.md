# SITEVL X-RAY — итоговый отчёт

Дата: 2026-08-30

## Результат

- PASS — на поддерживаемых публичных страницах появился компактный X-RAY control.
- PASS — native slider раскрывает страницу и Code View через вертикальный split от 0 до 100%.
- PASS — 50/50 проверено на 390×844 и 1440×900: граница находится ровно в центре.
- PASS — Home, услуги, статьи, цены, кейсы, local pages и Web Studio используют разные definitions.
- PASS — доступны TSX, DATA, CSS и STRUCTURE только там, где соответствующий вид существует.
- PASS — код имеет line numbers, лёгкую syntax highlighting, filename, language/status и независимый scroll.
- PASS — копирование работает; при запрете Clipboard API предусмотрено выделяемое ручное поле.
- PASS — при SPA-переходе viewer закрывается, reveal сбрасывается, старая definition исчезает.
- PASS — дизайн существующих страниц, CMS, SEO, LAB и Studio не менялись.

## Поддерживаемые routes

Статические:

`/`, `/services`, `/useful`, `/prices`, `/process`, `/cases`, `/about`, `/contacts`, `/privacy`, `/terms`, `/brief`, `/changelog`, `/primorsky-krai`.

Коммерческие услуги:

`/computer-help-vladivostok`, `/program-installation-vladivostok`, `/windows-setup-vladivostok`, `/macbook-setup-vladivostok`, `/pc-build-vladivostok`, `/data-transfer-vladivostok`, `/phone-setup-vladivostok`, `/website-admin-vladivostok`, `/website-development-vladivostok`.

Цены:

`/prices/websites`, `/prices/programs`, `/prices/devices`, `/prices/phones`, `/prices/pc`.

Кейсы:

`/cases/ay-digital-personal-website`, `/cases/marine-equipment-catalog`.

Локальные страницы:

`/computer-help-artem`, `/computer-help-ussuriysk`, `/computer-help-nakhodka`, `/website-development-artem`, `/website-development-ussuriysk`, `/website-development-nakhodka`.

Полезные статьи:

Все 28 slug из `src/data/useful.ts`, включая `/useful/speed-up-windows`, `/useful/data-transfer`, `/useful/digital-hygiene`, `/useful/scams`, `/useful/apps-checklists` и материалы о сайтах. Registry автоматически проверяется тестом против source data.

## Исключённые routes

- PASS — `/lab`.
- PASS — `/lab/modern-os`, `/lab/retro`, `/lab/physics`, `/lab/canvas`.
- PASS — `/lab/2d`, `/lab/3d`, `/lab/builder` и другие LAB routes.
- PASS — `/studio`, `/studio/projects`, `/studio/project/*`, `/studio/preview/*`.
- PASS — redirects `/cart`, `/checkout`, `/order-success`.
- PASS — неизвестные, nested-invalid, error, auth, admin и 404 routes.

Browser QA подтвердил для перечисленных LAB/Studio страниц: `control=0`, `.xray-root=0`, `.xray-panel=0`. То есть там нет скрытого X-RAY DOM и он не может перехватывать touch, keyboard, pointer lock или fullscreen.

## Page-specific code

- Home показывает `HomePage.tsx`, реальный `home.css` и дерево главной.
- Service показывает reusable `SeoLandingPage.tsx` и отдельный `<slug>.config.ts`.
- Две проверенные услуги дали разные filenames и разный content.
- Article показывает `UsefulArticlePage.tsx` и компактный `<slug>.article.ts`, а не полный CMS dump.
- Web Studio показывает собственный `WebStudioPage.tsx`.
- Price, case и local route показывают собственный renderer и данные текущей страницы.

## Security

- PASS — runtime не читает локальные source files.
- PASS — `.env`, backend, auth, deployment и server code не импортируются.
- PASS — email, телефоны, bearer-значения и sensitive object keys редактируются.
- PASS — browser QA двух service payload не обнаружил email/телефонов.
- PASS — X-RAY payload создаётся только после user action и имеет `data-nosnippet`.

## Responsive и accessibility

- PASS — проверены 320×720, 375×812, 390×844, 430×932, 768×1024, 1024×768, 1440×900, 1920×1080.
- PASS — на всех размерах document horizontal overflow равен 0.
- PASS — code panel при 100% равен ширине viewport.
- PASS — range, close, back и copy controls имеют touch height не меньше 44 px.
- PASS — mobile control учитывает safe area и расположен выше sticky CTA.
- PASS — slider, tabs, code area и кнопки имеют labels/focus-visible.
- PASS — `prefers-reduced-motion` уменьшает reveal animation.

## Performance

- PASS — viewer и CSS выделены в lazy chunks.
- PASS — page data загружаются после открытия и по типу текущего route.
- PASS — entry вырос с 134.59 до 136.58 kB gzip: +1.99 kB gzip.
- PASS — viewer: 3.75 kB gzip; viewer CSS: 2.26 kB gzip; definitions: 1.93 kB gzip.
- PASS — SEO generator по-прежнему создаёт 61 sitemap URL и 75 prerendered HTML-файлов.
- PASS — SEO audit проверяет 61 indexable URL без ошибок.

## Проверки

- PASS — `npm test`: 97/97.
- PASS — `npm run lint`.
- PASS — `npx tsc -b --pretty false`.
- PASS — `npm run build`.
- PASS — `git diff --check`.
- PASS — representative browser QA всех definition kinds.
- PASS — copy action показал `Скопировано` в локальном браузере.
- PASS — SPA navigation сбрасывает X-RAY до compact state.

## Изменённые области

- `src/features/xray/` — новый изолированный feature-модуль.
- `src/layouts/AppLayout.tsx` — одно подключение контроллера в публичном layout.
- `package.json` — X-RAY tests добавлены в существующую команду `npm test`.
- `SITEVL_XRAY_AUDIT.md`, `SITEVL_XRAY_ARCHITECTURE.md`, `SITEVL_XRAY_REPORT.md`.

## Ограничения

- X-RAY показывает безопасную архитектурную representation, а не побайтный production source bundle. Это намеренно: исходник не читается на runtime, секреты и server code не раскрываются.
- Автоматическая синхронизация активной секции при scroll не добавлялась: это optional требование и потребовало бы маркировать все старые страницы, увеличивая риск несвязанных изменений.
- Monaco и тяжёлая IDE не подключались; viewer остаётся лёгким и только для чтения.

## Release

- NOT RUN — commit.
- NOT RUN — push.
- NOT RUN — deploy.

Это соответствует явному запрету в задаче.
