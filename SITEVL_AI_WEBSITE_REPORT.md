# Отчёт о реализации SITEVL AI Website Generator

Дата: 2026-09-03

## Матрица

| Функция | Статус | Доказательство / ограничение |
|---|---|---|
| Публичный `/ai-website` | PASS | Lazy route, навигация, CTA на главной, SEO, sitemap, breadcrumb, X-RAY |
| Три режима генерации | PASS | Быстрый, подробный, existing-site с безопасным ручным fallback |
| Существующий Gemini `/api/ai` | PASS (код) | Добавлен только новый allowlisted kind; второй endpoint для AI не создавался |
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
| Production lead storage | READY FOR QA | Vercel KV REST подключён к Production/Preview; требуется проверка после deployment |
| Privacy | PASS (код) | Описаны Gemini, локальный draft, server storage, retention, удаление, no fingerprinting |
| Production deploy | READY | Release-gate и environment audit пройдены; далее commit/push/deploy |
| Production Gemini concept request | NOT TESTED | Новый kind ещё не опубликован из-за release-gate |
| Production safe lead | NOT TESTED | Нельзя подтверждать сохранение до подключения private Redis |

## Проверки

- `npm run lint` — PASS, 0 ошибок.
- `npm test` — PASS, 107/107.
- `npm run build` — PASS; Vite production build, sitemap generation и SEO audit успешны.
- Browser desktop smoke — PASS: title, H1, режимы, поля и отсутствие горизонтального overflow проверены на локальной сборке.
- Проверки нового модуля охватывают schema/allowlist, очистку markup, неизвестные секции, актуальные цены, rule recommendation, consent/contact, validate-only lead path, invalid Gemini JSON, server generation limit, secret isolation и отсутствие unsafe rendering.

## Что осталось до публикации

1. Выполнить commit, push и production deployment.
2. Проверить `GET /api/ai-leads` → `configured:true`.
3. Выполнить реальную генерацию через Gemini на `/ai-website`.
4. Отправить безопасную тестовую заявку и подтвердить запись в private storage без раскрытия персональных данных.
5. Повторить desktop/mobile production browser QA и HTTP/SEO проверки.

До выполнения этих шагов feature не помечается полностью завершённым.
