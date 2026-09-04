# SITEVL Visitor Intelligence — технический аудит

Дата аудита: 5 сентября 2026 года  
Проект: SITEVL  
Production: <https://sitevl-ru.vercel.app>

## Цель и границы

Visitor Intelligence добавлен как отдельный first-party слой поверх существующих публичных счётчиков SITEVL и SITEVL LAB. Существующие пространства `sitevl:site:*`, `sitevl:lab:*` и хранилище `sitevl:ai-lead:*` не переименовываются и не очищаются.

Система предназначена только для анализа анонимного пути до обращения. Она не определяет реальную личность, не использует fingerprinting, не запрашивает геолокацию и не получает контакты до добровольной отправки формы или сообщения Brief в Telegram.

## Поток данных

1. Новый браузер создаёт криптографически случайный ID формата `SV-XXXXXX` и сохраняет его в `localStorage`.
2. Отдельный случайный `session-*` хранится в `sessionStorage`.
3. React Router provider регистрирует один `page_view` на один navigation key. Rerender, resize и обновления состояния не создают новые события.
4. Клиент отправляет только тип события и ограниченный набор очищенных полей в same-origin `/api/visitor-events`.
5. Endpoint проверяет event allowlist, формат ID, маршрут, тип устройства, браузер, experiment ID и размер запроса.
6. Сервер выполняет event/session dedup, rate limit и записывает историю в существующий Redis/Upstash.
7. Telegram-текст собирается только сервером. Произвольный Redis key или Telegram message от клиента не принимается.
8. После добровольной AI-заявки `/api/ai-leads` добавляет в visitor history событие `lead_created`, сохраняет ссылку на lead ID и формирует краткую цепочку до обращения.

## Разрешённые события

| Событие | Назначение | Telegram |
|---|---|---|
| `session_start` | Первый маршрут сессии, source, referrer host, coarse device/browser | Только новый visitor |
| `page_view` | Нормализованный публичный маршрут | `/prices*`, `/ai-website`, `/lab` |
| `experiment_start` | Запуск allowlisted LAB-эксперимента | Да, один раз на experiment для visitor |
| `ai_concept_created` | Факт успешного создания концепции и её короткий ID | Да, один раз для visitor |
| `brief_completed` | Завершение интерактивного Brief | Нет |
| `lead_created` | Только внутреннее server-side событие после сохранения lead | Расширенное lead-сообщение |

## Redis namespaces

Новые ключи находятся только под `sitevl:visitor:v1:*`:

- `sitevl:visitor:v1:<visitorId>` — hash профиля;
- `sitevl:visitor:v1:<visitorId>:history` — последние 100 событий;
- `sitevl:visitor:v1:<visitorId>:pages` — уникальные публичные маршруты;
- `sitevl:visitor:v1:<visitorId>:experiments` — запущенные LAB-эксперименты;
- `sitevl:visitor:v1:session:<sessionId>` — дедупликация сессии;
- `sitevl:visitor:v1:event:<eventId>` — дедупликация события;
- `sitevl:visitor:v1:notify:<visitorId>:<action>` — защита от повторных Telegram-уведомлений;
- `sitevl:visitor:v1:rate:<sessionId>` — серверный rate limit;
- `sitevl:visitor:v1:index` — ограниченный индекс для будущего owner API.

Retention по умолчанию составляет 180 дней, регулируется server-only переменной `VISITOR_INTELLIGENCE_RETENTION_DAYS` в пределах 30–365 дней. История ограничена 100 событиями, индекс — 5000 visitor ID. TTL продлевается только при новой активности соответствующего visitor.

## Source tracking

- Поддерживается `?src=telegram-vl-1` и совместимые значения по шаблону `[a-z0-9_-]`, максимум 64 символа.
- Сохраняются первый source visitor и source каждой начальной записи сессии.
- Referrer сокращается до hostname; same-origin referrer игнорируется.
- Query string не входит в `path`; прочие параметры URL не передаются и не сохраняются.

## Защита и приватность

- JSON body не более 4 KiB.
- Строгий allowlist событий, полей, LAB experiment IDs, типов устройства и браузеров.
- Нормализация маршрута и запрет `/api/*`, `/assets/*`, файлов и traversal.
- До 40 visitor-событий в минуту на session ID и до 600 событий в минуту глобально, плюс dedup по event ID.
- До 120 автоматических Telegram-уведомлений в час; AI leads дополнительно защищены отдельным лимитом формы.
- Telegram dedup по visitor/action.
- Redis credentials, bot token и chat ID используются только в serverless functions.
- В Telegram не попадают cookie, raw user agent, Redis/Gemini credentials, внутренние ошибки или полный JSON концепции.
- UI и сервер не собирают точную геолокацию, fingerprint, IP-адрес, имя, телефон, Telegram или email до добровольной заявки.
- Privacy policy описывает visitor ID, техническую историю, Telegram summary и retention.

## Owner API

Подготовлен read-only endpoint `/api/visitor-owner?visitorId=SV-XXXXXX`. Он deny-by-default:

- если `VISITOR_OWNER_API_TOKEN` отсутствует, endpoint отвечает `404`;
- при неверном Bearer token отвечает `401`;
- при корректном token возвращает только профиль, историю, страницы и experiments указанного visitor;
- сравнение token выполняется constant-time;
- list/search API публично не предоставлен.

## Проверки

- Unit/integration: visitor ID, source/referrer, device/browser classification, route/event allowlist, dedup, Redis namespace, TTL, Telegram summary, lead timeline и deny-by-default owner auth.
- Общий test suite: 132/132 PASS.
- ESLint: PASS.
- TypeScript project build: PASS.
- Vite production build: PASS.
- SEO generation: 64 URL и 78 prerendered HTML.
- SEO audit: 64/64 PASS.
- Локальный browser smoke: Главная → Приложения → Цены → LAB → Modern OS → AI Website; ошибок console не обнаружено.

## Ограничение live Telegram QA

До релиза production возвращал `telegramConfigured:false`. Код поддерживает новые `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` и обратную совместимость со старыми AI-lead именами, но live-сообщение существующего `@ay_digital_orders_bot` нельзя считать проверенным до добавления обоих secrets в Vercel Production.
