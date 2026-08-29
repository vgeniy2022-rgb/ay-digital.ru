# SITEVL Production Release Report

Дата релиза: 2026-08-29  
Ветка: `main`  
Проект Vercel: `ay-digital-ru`  
Production alias: `https://sitevl-ru.vercel.app`
Дополнительный рабочий alias: `https://ay-digital-ru.vercel.app`

Статусы: `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`.

## Git и безопасность

- `PASS` Проверены `git status`, `git diff` и `git diff --check`.
- `PASS` В релизе только код Modern OS, его тесты и документация аудита.
- `PASS` В diff нет временных screenshots, debug-кода, `localhost`/`127.0.0.1` или случайных файлов.
- `PASS` Поиск сигнатур API tokens, secret keys, Cloudflare credentials, Authorization headers и private keys не нашёл секретов в frontend/repository files.
- `PASS` `.env*`, `.vercel`, `dist`, `node_modules` и временные build-файлы исключены из Git.

## Modern OS QA

- `PASS` Одновременно открыто больше пяти окон.
- `PASS` Реальный pointer-click по видимой части заднего окна выводит его на передний план.
- `PASS` Красная кнопка закрывает окно, Dock повторно запускает приложение.
- `PASS` Жёлтая кнопка сворачивает окно, Dock восстанавливает его и возвращает фокус.
- `PASS` Зелёная кнопка разворачивает окно и возвращает точные предыдущие bounds.
- `PASS` App Switcher открывается и активирует выбранное окно.
- `PASS` Fullscreen использует честный CSS immersive fallback, выход работает через `Esc`.
- `PASS` Drag и resize проверены реальными pointer-действиями.
- `PASS` На viewport 390x844 нет horizontal overflow; game touch controls имеют высоту 60 px, window controls 44 px.

## Modern OS Apps

- `PASS` Files: окно, sidebar, search и основные файловые операции.
- `PASS` Browser: внутренние и внешние URL, tabs, history, bookmarks и блокировка опасных схем.
- `PASS` SITEVL AI: local actions и честное состояние ненастроенного cloud provider.
- `PASS` Media: file chooser, безопасная локальная обработка и рабочие controls.
- `PASS` Settings: девять разделов и связанные state controls.
- `PASS` Control Center: network, Bluetooth, focus, theme, power saving и fullscreen.
- `PASS` CORE SHOOTER начал canvas gameplay.
- `PASS` BLOCKS начал gameplay и отрисовал 180 игровых клеток.
- `PASS` NOVA CIRCUIT начал canvas gameplay.

## SITEVL Studio QA

- `PASS` `/studio` и `/studio/projects` открываются.
- `PASS` Создан локальный QA-проект из существующего шаблона.
- `PASS` Editor загрузил семь блоков проекта.
- `PASS` Autosave прошёл состояния `Сохранение` и `Сохранено`; reload восстановил имя из IndexedDB.
- `PASS` Preview route отрисовал проект без console errors.
- `PASS` JSON export создал настоящий `.sitevl.json` файл в Downloads.
- `PASS` Local SITEVL AI audit открылся и проанализировал проект.
- `BLOCKED` Cloud AI не проверялся: endpoint не настроен, UI показывает это честно.
- Известное неблокирующее ограничение: Puck выводит deprecation warning для `renderHeader`; runtime crash отсутствует.

## LAB и публичные маршруты

- `PASS` `/lab`, `/lab/builder`, `/lab/2d`, `/lab/3d`, `/lab/physics`, `/lab/os`, `/lab/retro`, `/lab/canvas`, `/lab/modern-os`.
- `PASS` `/`, `/services`, `/contacts`, `/useful`, `/brief`.
- `PASS` Все проверенные маршруты открываются без console errors и desktop horizontal overflow.
- `PASS` Индексируемые публичные страницы имеют один H1.
- Интерактивные технические LAB-экраны могут не иметь обычного H1, поскольку они закрыты `noindex` и используют application-like UI.

## SEO

- `PASS` `robots.txt` разрешает публичные страницы и закрывает `/cart`, `/checkout`, `/admin`.
- `PASS` Sitemap генерируется автоматически с `lastmod`, `changefreq` и `priority`.
- `PASS` Canonical и robots meta управляются маршрутом через `SeoHead`.
- `PASS` LAB, Studio/technical, brief, cart и checkout routes имеют `noindex` там, где это предусмотрено архитектурой.
- `PASS` Production build создал 61 sitemap URL и 75 prerendered HTML files.
- `PASS` SEO audit проверил 61 индексируемый URL.

## Tests и build

- `PASS` `npm test`: 69/69.
- `PASS` `npm run lint`.
- `PASS` `npx tsc -b --pretty false`.
- `PASS` `npm run build`.
- `PASS` `git diff --check`.

## Bundle

- `ModernOsPage`: 78.83 kB, gzip 22.17 kB.
- `ModernAi`: 7.29 kB, gzip 3.19 kB.
- `ModernMedia`: 10.27 kB, gzip 3.90 kB.
- `ModernGames`: 16.16 kB, gzip 5.60 kB.
- `PASS` AI, Media и Games остаются отдельными lazy chunks.
- Известное неблокирующее ограничение: существующий `studio` chunk 658.38 kB, gzip 187.22 kB.

## Deployment

- Release commit: `a3a457a9eee618b105df1f45f388b56aaed4eb99` (`Harden Modern OS and Studio release`).
- `PASS` `git push origin main`; локальный `main` и `origin/main` указывали на один release commit перед обновлением итогового отчёта.
- `PASS` Vercel production deployment: `https://ay-digital-bdhc3qbn0-vgeniy.vercel.app`.
- `PASS` Основной production alias назначен на `https://sitevl-ru.vercel.app`.
- `PASS` Дополнительный alias `https://ay-digital-ru.vercel.app` отвечает и отдаёт те же release assets.
- `PASS` HTTP 200: `/`, `/studio`, `/lab`, `/lab/retro`, `/lab/modern-os`, `/robots.txt`, `/sitemap.xml`.
- `PASS` Production Modern OS: шесть окон, rear-window focus, close, minimize, restore, maximize, Dock, App Switcher, Game Hub и начало CORE SHOOTER gameplay.
- `PASS` Production Files, Browser, Settings, SITEVL AI и Media открываются; девять Settings sections доступны; runtime console чистая.
- `PASS` Production Studio и Retro подтверждены после загрузки lazy chunks: Studio показывает список проектов, Retro показывает экран выбора системы.
- `PASS` Production `robots.txt` и `sitemap.xml` используют основной alias `sitevl-ru.vercel.app`.
