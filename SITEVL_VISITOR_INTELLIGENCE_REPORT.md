# SITEVL Visitor Intelligence — отчёт о реализации

Дата: 5 сентября 2026 года

## Реализовано

- Единый совместимый visitor ID `SV-XXXXXX` для основного сайта, SITEVL LAB, AI-концепций и AI leads.
- Миграция старого browser ID: следующий визит получает новый `SV-XXXXXX`; существующие агрегированные Redis-счётчики не удаляются.
- История first/last visit, числа сессий, coarse device/browser, первого source/referrer host, первой/последней страницы, страниц и LAB experiments.
- Флаги посещения LAB, цен, мобильных приложений, AI Website, создания AI-концепции, завершения Brief и отправки AI lead.
- SPA navigation dedup без событий от rerender, resize и state update.
- Source tracking для `?src=...` без сохранения других query parameters.
- Серверные Telegram templates для нового visitor, значимых действий, LAB experiments, AI-концепта и расширенного lead.
- Связь AI lead с visitor profile/history и расчёт числа сессий и времени до заявки.
- Visitor ID в добровольно отправляемой Telegram-сводке Brief для ручной связи обращения с историей.
- Защищённая read-only owner API architecture без публичного доступа по умолчанию.
- Обновлённая политика конфиденциальности.

## Статус компонентов

| Компонент | Статус |
|---|---|
| Visitor ID `SV-XXXXXX` | PASS |
| SITE/LAB shared identity | PASS |
| SPA page history | PASS |
| LAB experiment history | PASS |
| Source/referrer tracking | PASS |
| AI concept event | PASS |
| AI lead linkage | PASS |
| Brief visitor reference | PASS |
| Redis retention/caps | PASS |
| Rate limit/allowlist/dedup | PASS |
| Privacy policy | PASS |
| Owner API deny-by-default | PASS |
| Telegram templates and mocked delivery tests | PASS |
| Telegram production configuration | BLOCKED — Vercel secrets отсутствуют |
| Telegram live delivery through `@ay_digital_orders_bot` | NOT TESTED — secrets отсутствуют |

## Server-only environment

Обязательны для Telegram:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Опциональны:

- `VISITOR_INTELLIGENCE_RETENTION_DAYS=180`
- `VISITOR_OWNER_API_TOKEN` — только когда будущее приложение будет готово использовать защищённый API.

Ни одна из этих переменных не должна иметь префикс `VITE_`, попадать во frontend bundle, Git или Telegram.

## QA evidence

- `npm test`: 132/132 PASS.
- `npm run lint`: PASS.
- `npx tsc -b --pretty false`: PASS.
- `npm run build`: PASS.
- `git diff --check`: PASS.
- SEO generation: PASS, 64 sitemap URL и 78 prerendered HTML.
- SEO audit: PASS, 64 indexable URL.
- Browser smoke: PASS для цепочки Главная → Приложения → Цены → LAB → Modern OS → AI Website, console errors/warnings: 0.

Production deployment и post-deploy API/browser evidence добавляются после публикации commit из этого отчёта.
