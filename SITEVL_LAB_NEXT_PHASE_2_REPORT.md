# SITEVL LAB NEXT — Phase 2/5 Report

Дата: 2026-08-30  
Проект: `/Users/aleksandrasineckij/Documents/ay-digital.ru`

## Результат

Phase 2 расширяет существующую SITEVL NOVA и общий AI-слой. Новая ОС, второй AI-стек и отдельное хранилище не создавались. Ключ Modern OS storage сохранён, миграция добавляет недостающие системные папки без удаления пользовательских файлов.

## Browser

- **PASS** — адресная строка, Назад, Вперёд, Обновить/Стоп, Домой, вкладки, дублирование и восстановление вкладок.
- **PASS** — локальная история и закладки; история ограничена 100 записями.
- **PASS** — панель загрузок и сохранение внутренних справочных файлов в `SITEVL Drive / Загрузки`.
- **PASS** — безопасное открытие внешней страницы в новой вкладке через `noopener,noreferrer`.
- **PASS** — URL allowlist допускает только `http:`, `https:` и известные `sitevl://` страницы.
- **PASS** — `sitevl://home`, `lab`, `studio`, `ai`, `games`, `farm`, `about`, `help` в Modern Browser.
- **PASS** — страницы `studio`, `ai`, `games`, `farm` добавлены и в Retro Browser.
- **PASS** — iframe остаётся sandboxed; CSP/X-Frame-Options не обходятся.
- **BLOCKED** — браузер не может достоверно прочитать cross-origin X-Frame-Options/CSP. Вместо бесконечной загрузки показано честное пояснение и кнопка внешней вкладки.

## AI и Gemini

- **PASS** — существующий интерфейс `AIProvider` переиспользован; `GeminiAIProvider` заменяет прежнее облачное имя без второго клиентского стека.
- **PASS** — добавлена Vercel Function `api/ai.mjs`; `GEMINI_API_KEY` читается только на сервере.
- **PASS** — модель настраивается через `GEMINI_MODEL`, значение по умолчанию: `gemini-3.7-flash`.
- **PASS** — endpoint ограничивает типы запросов, длину prompt/context, timeout и не возвращает секреты.
- **PASS** — без ключа endpoint возвращает честный `503` с инструкцией настройки.
- **PASS** — SITEVL AI: новый чат, история, безопасный Markdown, code blocks, копирование, повтор ответа, остановка, loading/error states.
- **PASS** — локальные OS-действия проходят строгую allowlist: приложения, настройки, тема, громкость, игры, fullscreen.
- **NOT RUN** — живой ответ Gemini не проверялся: в локальном окружении отсутствует `GEMINI_API_KEY`.
- **NOT ADDED** — дополнительный cloud fallback не добавлялся: локальный планировщик уже является штатным fallback, новая зависимость не оправдана.

## Files и Photos

- **PASS** — обязательные папки: Рабочий стол, Документы, Загрузки, Фото, Видео, Музыка, Игры, Приложения, Корзина.
- **PASS** — виды Значки, Список, Колонки; поиск, rename, delete/restore, drag-and-drop, Quick Look и свойства.
- **PASS** — миграция сохраняет старые файлы и дозаполняет отсутствующие папки.
- **PASS** — Фото использует явный file picker, сохраняет выбранные изображения локально, показывает сетку, Все/Избранное, viewer, zoom, rotate, slideshow и metadata.
- **PASS** — лимит 1,5 МБ на импортируемое фото защищает localStorage от крупных Blob.

## Приложения

- **PASS** — Редактор кода открывает и сохраняет текстовые/JSON-файлы SITEVL Drive.
- **PASS** — WEB LAB: HTML/CSS preview в iframe с пустым `sandbox`, CSP и санитизацией scripts, handlers, unsafe URLs и CSS imports.
- **PASS** — Просмотр документов: виртуальные TXT/JSON и явно выбранные PDF/TXT/Markdown.
- **PASS** — Архиватор реально читает ZIP через lazy-loaded JSZip и экспортирует текстовые документы в настоящий ZIP.
- **PASS** — Системный монитор показывает только показатели виртуальной SITEVL NOVA и измеренный FPS UI.
- **PASS** — Камера запрашивает MediaDevices только после кнопки и сохраняет снимок в Фото.
- **PASS** — Диктофон запрашивает микрофон только после кнопки, поддерживает pause/resume/stop/playback и локальное сохранение.
- **NOT RUN** — физические camera/microphone permissions не принимались при автоматическом QA.
- **NOT ADDED** — 3D Viewer отложен: приоритет отдан полностью работающим Files, Browser, AI, WEB LAB и media-permission приложениям.

## Оформление и производительность

- **PASS** — добавлены 5 оригинальных атмосферных фонов и собственный фон через явный file picker.
- **PASS** — новые приложения собраны отдельным lazy chunk; JSZip остаётся отдельным динамическим chunk.
- **PASS** — MediaDevices, MediaRecorder, Audio/Video object URLs и RAF создаются только при необходимости и очищаются.
- **PASS** — существующий Media Player сохранён: MP3/AAC/WAV/FLAC и MP4/WebM/MOV поддерживаются в пределах возможностей браузера.

## QA

- **PASS** — automated UI: 1920×1080, 1440×900, 768×1024, 390×844, 320×800.
- **PASS** — page/document/desktop width совпадает с viewport; horizontal page overflow не найден.
- **PASS** — окна не выходят за viewport; мобильные controls имеют минимум 44×44 px.
- **PASS** — через поиск открывается новый Редактор кода.
- **PASS** — `sitevl://farm` открывается; внутренняя загрузка появляется в Browser Downloads.
- **PASS** — `npm test`: 73/73.
- **PASS** — `npm run lint`.
- **PASS** — `npx tsc -b --pretty false`.
- **PASS** — `npm run build`; 61 sitemap URL, 73 prerендера, SEO audit OK.
- **PASS** — `git diff --check` (финальный результат фиксируется после отчёта).

## Известные ограничения

- Внешний сайт сам решает, разрешать ли iframe. SITEVL не обходит CSP/X-Frame-Options.
- Поддержка конкретных media-кодеков зависит от Safari/Chrome и ОС пользователя.
- Local Vite dev server не исполняет Vercel Functions; для живого Gemini нужен Vercel runtime или `vercel dev` и серверный ключ.
- Большие фото/записи ограничены, чтобы не переполнять браузерное локальное хранилище.
- Git commit, push и deploy не выполнялись.
