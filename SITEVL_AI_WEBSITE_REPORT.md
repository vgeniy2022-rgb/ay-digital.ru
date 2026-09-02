# Отчёт о реализации SITEVL AI Website Generator

Дата: 2026-09-03

## Матрица

| Функция | Статус | Доказательство / ограничение |
|---|---|---|
| Публичный `/ai-website` | PASS | Lazy route, навигация, CTA на главной, SEO, sitemap, breadcrumb, X-RAY |
| Три режима генерации | PASS | Быстрый, подробный, existing-site с безопасным ручным fallback |
| Существующий Gemini `/api/ai` | PASS | Production Gemini вернул schema 1 без repair и fallback |
| Strict JSON schema | PASS | Server и client validation, allowlists, length limits, repair-once и fallback |
| Safe renderer | PASS | Только React-компоненты; нет arbitrary HTML/JS, eval, Function или unsafe innerHTML |
| Три визуальных варианта | PASS | Balanced, minimal, expressive без дополнительного AI-вызова |
| Desktop/tablet/mobile preview | PASS | Переключатели, bounded viewport, fullscreen |
| Интерактивность preview | PASS | Якоря, FAQ, карточки, demo-only form без side effects |
| Редактирование | PASS | Заголовок, подзаголовок, CTA, accent, visibility, reorder, one-level undo |
| Лимит 3 генерации | PASS | Session UI + server limit; durable через Redis после его подключения |
| Rule-based pricing | PASS | Детерминированное правило + существующий `priceDirections` |
| Lead form after value | PASS | Контакты и consent доступны только после готовой концепции |
| Server-side lead API | PASS (код) | Strict POST validation, private Redis TTL, no public listing, Telegram summary optional |
| Production lead storage | PASS | `configured:true`; UI-запись прочитана владельцем из private Redis, TTL около 90 дней |
| Privacy | PASS (код) | Описаны Gemini, локальный draft, server storage, retention, удаление, no fingerprinting |
| Production deploy | PASS | `sitevl-ru.vercel.app`, deployment `dpl_7bF3q95EYeCyGLYFzkm9b8XxjSWw`, implementation commit `8449e9b` |
| Production Gemini concept request | PASS | Реальные API- и UI-запросы, модель `gemini-3.5-flash-lite`, `fallback:false` |
| Production safe lead | PASS | API и UI submit вернули `201/stored:true`; Telegram не настроен и не вызывался |

## Проверки

- `npm run lint` — PASS, 0 ошибок.
- `npm test` — PASS, 107/107.
- `npm run build` — PASS; Vite production build, sitemap generation и SEO audit успешны.
- Browser desktop smoke — PASS: title, H1, режимы, поля и отсутствие горизонтального overflow проверены на локальной сборке.
- Проверки нового модуля охватывают schema/allowlist, очистку markup, неизвестные секции, актуальные цены, rule recommendation, consent/contact, validate-only lead path, invalid Gemini JSON, server generation limit, secret isolation и отсутствие unsafe rendering.

## Production QA

Проверено 2026-09-03:

- `GET /api/ai` → `200`, `configured:true`, provider Gemini, model `gemini-3.5-flash-lite`.
- `GET /api/ai-leads` → `200`, `configured:true`, storage `private-redis`.
- `/ai-website`, `/privacy`, `/`, `/sitemap.xml` → `HTTP 200`.
- Canonical `/ai-website` и sitemap entry присутствуют.
- Реальный Gemini API-запрос → `200`, schema 1, landing/warm, 6 секций, `repaired:false`, `fallback:false`.
- Production UI создал концепцию, показал lead form и rule-based цену `от 24 900 ₽`.
- Minimal variant и встроенный mobile preview переключились без горизонтального overflow.
- Demo form явно сообщает, что данные никуда не отправляются.
- Безопасная UI-заявка сохранилась с reference `SV-AI-0RQT4I`.
- Закрытая Redis-проверка подтвердила original prompt, contact, selected variant, schema 1 и TTL около 90 дней без вывода полных данных.
- Telegram notification: `not-configured`; внешнее сообщение не отправлялось.

Production: https://sitevl-ru.vercel.app/ai-website
