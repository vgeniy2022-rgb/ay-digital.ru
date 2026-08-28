# SITEVL Retro Phase 4 — отчёт

## Реализовано

- **PASS:** schema v4 с миграцией v3 и старой заметки.
- **PASS:** metadata/readonly/trash для общей файловой системы.
- **PASS:** сохранение окон по ОС; minimize, maximize, close, focus и drag.
- **PASS:** виртуальная сеть из четырёх компьютеров без доступа к реальной LAN.
- **PASS:** игровой LAB-SERVER с авторизацией и readonly storage.
- **PASS:** Retro Mail, read state и сохранение attachments в Documents.
- **PASS:** LAB IRC, каналы, команды и секретный #core.
- **PASS:** SITEVL BASIC с собственным parser, без eval.
- **PASS:** HTML LAB с sandboxed preview, HTML/CSS sanitizer и сохранением SVW.
- **PASS:** SOFTWARE ARCHIVE и безопасный installedApps state.
- **PASS:** JSON backup export/import с schema validation и confirmation.
- **PASS:** sitevl://directory, network и server.
- **PASS:** 14 Retro Phase 3/4 achievements в общем LAB progression.
- **PASS:** 40 автоматических тестов в финальном полном прогоне.

## Частично

- **PARTIAL:** quest имеет связанные этапы OLD_LOG → Mail → attachment → installer → #core → NULL → LAB-SERVER, но финальная audiovisual CORE-сцена и отдельный Journal UI не завершены.
- **PARTIAL:** общая filesystem logic используется тремя ОС; полностью отдельные визуальные File Manager adapters пока не созданы.
- **PARTIAL:** window manager сохраняет положение/размер и состояния, но pointer-resize handle не добавлен.
- **PARTIAL:** installer меняет реальный persisted app whitelist, но пошаговый wizard UI и uninstall control panel требуют следующего прохода.
- **PARTIAL:** floppy/CD существуют; несколько сменных floppy images и capacity enforcement не завершены.

## Не реализовано вместо фальшивых функций

- **NOT RUN:** Camera, Recorder и Media Player — нужен IndexedDB Blob layer и permission QA.
- **NOT RUN:** Music Tracker, screensaver collection, Registry, virtual users, printer, calendar и archive UI.
- **NOT RUN:** System Failure/Safe Mode UI и Diagnostic Tool.
- **BLOCKED:** точное client-side определение X-Frame-Options/CSP внешнего сайта; используется timeout fallback.
- **NOT RUN:** ручной QA всех desktop/mobile/iPad viewport до доступного browser-control окна.

## Security

- **PASS:** no eval, no shell, no arbitrary JS, no CSP/X-Frame/CORS bypass.
- **PASS:** Browser schemes whitelist.
- **PASS:** empty-sandbox HTML LAB iframe.
- **PASS:** backup schema validation and explicit import confirmation.
- **PASS:** реальные camera/microphone permissions не запрашиваются.

## Финальная проверка

- **PASS:** `npm test` — 40/40 тестов.
- **PASS:** `npm run lint` — ошибок и предупреждений нет.
- **PASS:** `npx tsc -b --pretty false` — ошибок типов нет.
- **PASS:** `npm run build` — production build, sitemap и prerender завершены.
- **PASS:** SEO-аудит сборки — 61 индексируемый URL без ошибок.
- **PASS:** `git diff --check` — проблем с whitespace нет.
- **PASS:** локальный runtime `/lab/retro` — HTTP 200.
- **NOT RUN:** полноценный визуальный QA матрицы viewport и ручные сценарии с touch/pointer.

Существующее предупреждение Vite о размере чанка SITEVL Studio осталось без изменений; Retro загружается отдельным чанком и не стал частью initial bundle.

Коммит, push и deploy не выполнялись.
