# SITEVL Visitor Intelligence V2

Дата: 6 сентября 2026. Проект: существующий `ay-digital-ru`, production `https://sitevl.tech`.

## Изменения

- Сохранены прежние внутренние visitor ID, профили, история, публичная статистика сайта и LAB, существующие AI-заявки и бот.
- Порядковый `visitorNumber` назначается лениво при следующем событии, `visitNumber` — при регистрации новой сессии. Lua EVAL выполняет binding, dedup, INCR, обновление профиля и историю атомарно.
- Миграция активной сессии V1 получает номер посещения, но не увеличивает прежнее количество сессий. Старым историческим сессиям номера задним числом не выдумываются.
- Перезагрузка и параллельные session_start не создают новое посещение. Открытая вкладка сохраняет sessionStorage; таймер неактивности не добавлен. Новая сессия означает новый существующий browser session ID, а не каждый React render или SPA-переход.
- Уведомления: новый посетитель, возвращение, цены, LAB, запуск allowlisted эксперимента, открытие и создание AI-концепта, заявка. Уведомления о действиях дедуплицируются по сессии. Основная идентичность Telegram — номер, не `SV-…`.
- Первый источник остаётся неизменным; текущий источник относится к сессии. Прямое возвращение больше не наследует старую рекламную метку.
- Заявка связывается только с существующим профилем и сессией, привязанной к тому же visitor ID. В сообщении — номера, источники, путь, время до заявки и добровольно переданные контакты. Полный AI JSON не отправляется.
- Private owner API возвращает дополненные профиль, последнюю/выбранную сессию, историю, страницы и эксперименты. Без `VISITOR_OWNER_API_TOKEN` endpoint скрыт (404), без корректного Bearer при включении — 401. Публичного поиска по номеру нет.

## Redis и retention

| Данные | Namespace/key | Срок |
|---|---|---|
| Прежние профили, история, страницы, эксперименты, event/session binding, rate limits, index | `sitevl:visitor:v1:*` | Прежние правила; профиль/история по умолчанию 180 дней, настройка 30–365 |
| Порядковый номер посетителя | `sitevl:visitor:v2:visitor-sequence` | Без TTL, не сбрасывать и не уменьшать |
| Порядковый номер посещения | `sitevl:visitor:v2:visit-sequence` | Без TTL, не сбрасывать и не уменьшать |
| Связь visitor ID → номер | `sitevl:visitor:v2:identity:<visitorId>` | Срок профиля, продлевается при событии |
| Сессия с visitNumber/sessionNumber/source | `sitevl:visitor:v2:session:<sessionId>` | Срок профиля |
| Dedup уведомлений | `sitevl:visitor:v2:notify:<sessionId>:<allowlisted-action>` | Срок профиля |
| Dedup привязки заявки | `sitevl:visitor:v2:lead:<leadId>` | Срок профиля |
| Необязательный хеш сети | `sitevl:visitor:v2:network:<visitorId>` | Не более 24 часов |
| Необязательный anti-abuse сети | `sitevl:visitor:v2:network-rate:<hmac>:<minute>` | 120 секунд |

История ограничена 100 событиями, индекс последними 5000 посетителями. Сводка старых записей восстанавливается только из сохранённой истории, её начало отмечено `summarySince`; это не заявляется полной статистикой за все годы. После удаления/истечения retention тому же browser ID может быть выдан новый номер. Глобальные последовательности сохраняются, пропуски после QA допустимы. `sitevl:lab:*`, `sitevl:site:*` и реальные `sitevl:ai-lead:*` не очищаются.

## Privacy и безопасность

- Не собираются реальная личность до формы, raw IP, raw user agent, cookies, полный referrer/URL query, fingerprint или точная геолокация. Геообогащение не добавлено.
- Device family — только грубая категория из UA; iPad в desktop UA может быть классифицирован как Mac, без fingerprinting исправлять это нельзя.
- Номер относится к анонимному браузеру, не доказывает число реальных людей. Приватный режим, очистка localStorage, другой браузер/домен создают отдельную идентичность. IP не объединяет людей за NAT/VPN.
- IP-assist использует только доверенный `x-vercel-forwarded-for` в runtime `VERCEL=1`, валидный одиночный IPv4/IPv6 и HMAC-SHA256 с серверным `VISITOR_IP_HASH_SECRET` (не менее 32 символов). На произвольный `x-forwarded-for` не полагаемся.
- Лимиты сохранены: 40 событий/сессию/мин, 600 глобально/мин, 120 Telegram-уведомлений/час. При включённом IP-assist дополнительный лимит — 240 событий/сеть/мин, без объединения профилей.
- Telegram — best effort с at-most-once claim: при ошибке/неопределённом сетевом исходе автоматической повторной отправки нет, чтобы не дублировать сообщение. История уже сохранена; ошибка не превращает её в повторный визит. Прочтение сообщения владельцем API Telegram подтвердить не позволяет.
- Обновлена видимая privacy policy; юридическое заключение о соответствии законодательству не заявляется.

## Конфигурация

При проверке метаданных Vercel: `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` присутствуют в Production. `VISITOR_IP_HASH_SECRET` отсутствует — IP-assist останется выключенным. Небезопасных переменных `VITE_*TOKEN/SECRET/KEY` не обнаружено. Значения секретов не выводились и не сохранялись в отчёте.

Для опционального включения IP-assist: Vercel → существующий проект `ay-digital-ru` → Settings → Environment Variables → `VISITOR_IP_HASH_SECRET`, Production. Самостоятельно создайте криптографически случайный секрет (рекомендовано 32 случайных байта, например 64 hex-символа), вставьте непосредственно в Vercel и выполните redeploy. Не отправляйте его в чат, не используйте `VITE_` и не коммитьте `.env`. Без этой настройки остальная V2 полностью работает.

## Проверки до выпуска

- Настоящий изолированный локальный Redis через Unix socket: параллельные INCR, повторные события, возвращение, legacy migration, session binding, lead binding, короткий hash TTL, отсутствие IP merge, отказ Redis/Telegram.
- Unit: source/referrer, coarse device, HMAC, отсутствие секрета, owner auth, frontend concurrent registration.
- Integration-тесты требуют `redis-server` и `redis-cli` на PATH (или `REDIS_SERVER_BIN`/`REDIS_CLI_BIN`). Без них помечаются SKIP, не подменяются mock-реализацией Lua. На этой машине запущены реально, без SKIP.
- Полный release gate: `npm test` — 149/149 PASS, 0 SKIP; `npm run lint`, `npx tsc -b --pretty false`, `npm run build`, `git diff --check` — PASS. SEO generation: 72 sitemap URL, 86 prerendered HTML; SEO audit: 72 indexable + 14 noindex — PASS. Существующее предупреждение Vite о крупных chunks не является ошибкой сборки; перепаковка LAB/Studio не входит в эту задачу.

## Production QA — фактический результат

Код опубликован через существующую Git-интеграцию `origin/main`, новый проект не создавался.

- Application commit: `b78900095828ac2d3be4e56ad0ab1e743d5e4fac`.
- Проверенный application deployment: `dpl_HCyUVBDd4RpkDpkvwrwq8WNUZg7m`, READY.
- `GET /api/visitor-events`: HTTP 200, `version: 2`, `configured: true`, `telegramConfigured: true`, `ipAssistEnabled: false`.
- `GET /api/visitor-owner`: HTTP 404 — данные не раскрываются публично.
- Недопустимое событие с произвольными `redisKey`/message: HTTP 400 до записи.

| Проверка в изолированных QA-браузерах | Наблюдение | Результат |
|---|---|---|
| A: первый вход через `src=telegram-v2-qa` | visitorNumber 1, visitNumber 1, sessions 1 | PASS |
| A: перезагрузка | те же номера и одна сессия; повтор page event дедуплицирован | PASS |
| SPA: Главная → Приложения → Цены → LAB → Modern OS | события сохранены у одного внутреннего visitor ID и посещения 1 | PASS |
| B: отдельный новый браузер | visitorNumber 2, visitNumber 2, sessions 1 | PASS |
| A: новая сессия с прежним browser ID | visitorNumber 1, visitNumber 4, sessions 2 | PASS |
| First/current source при возвращении | первый `telegram-v2-qa`, текущий `direct` | PASS |
| Цены в новой сессии | новое уведомление для того же посетителя; в прежней сессии повторы подавляются | PASS |
| Resize до 390×844 | число отправленных событий не изменилось, горизонтального переполнения нет | PASS |
| Gemini внутри Modern OS | HTTP 200, provider `gemini`, видимый содержательный ответ | PASS |
| Генерация AI-концепта | HTTP 200, provider `gemini`, `fallback: false`, 6 секций | PASS |
| Отправка QA-заявки через форму | HTTP 201, `stored: true`, `linked: true`, notification `sent` | PASS |
| Telegram | 10 успешных серверных отправок: 7 основных событий A, новый B, возвращение A и цены новой сессии | PASS на уровне Telegram API |
| Browser errors | ошибок JavaScript в трёх QA-сессиях не зарегистрировано | PASS |

Между QA-визитами возникло production-посещение №3, не созданное этой проверкой. Поэтому номер нового визита A — 4, а не 3. Это ожидаемая работа общей атомарной последовательности; чужие записи не читались для извлечения контактов и не удалялись.

Проверка использовала чистые изолированные браузерные контексты с заранее случайно созданными и проверенными как свободные QA visitor ID. При возвращении в отдельный контекст переносились только QA browser ID и первый источник. Публичные POST счётчиков `/api/site-stats` и `/api/lab-stats` подавлялись только во внешнем QA-harness, не в production-коде. Реальные `/api/visitor-events`, `/api/ai`, `/api/ai-leads` не подменялись. Секреты Telegram не извлекались из Vercel; использовались уже настроенные серверные переменные. Прочтение владельцем сообщений не проверено — `sent` означает успешный ответ Telegram API, а не read receipt. В этой проверке Gemini 503 high demand не наблюдался.

### Очистка

По точному manifest двух QA visitor ID, трёх session ID и одной проверенной по QA-имени/email заявке инвентаризированы 57 возможных ключей; 42 из них существовали и были удалены. Также удалены только соответствующие элементы visitor/lead index. Независимая повторная read-only проверка подтвердила отсутствие этих ключей и ссылки QA-заявки в индексе. Две глобальные последовательности НЕ уменьшались: после очистки visitorSequence = 3, visitSequence = 4. Чужие visitor/lead записи не удалены. Тестовые сообщения в Telegram оставлены как подтверждение отправок; доступа к чтению/удалению чата в этой проверке не использовалось.

### Сайт после публикации и очистки

- `sitevl.tech`, `sitevl-ru.vercel.app`, `ay-digital-ru.vercel.app`: `/`, `/prices`, `/lab/modern-os`, `/ai-website` — 12/12 HTTP 200; canonical везде `https://sitevl.tech` + путь.
- `www.sitevl.tech/prices?src=telegram-v2-qa` → HTTP 308 на `https://sitevl.tech/prices?src=telegram-v2-qa`; старые vercel.app адреса без принудительного host redirect.
- Sitemap и robots: HTTP 200, основной домен `sitevl.tech`.
- Redis-аналитика сайта/LAB, AI и AI leads health endpoints — HTTP 200. Публичная статистика LAB осталась 9/7; SITEVL изменилась 43/35 → 44/36 за счёт не-QA посещения. Сбросов/компенсирующих DECR не было.
- Vercel runtime logs проверенного application deployment, уровень error за последний час: 0 записей. Это разовая проверка, постоянный мониторинг не настраивался.
- Финальное документирующее изменение отчёта не меняет runtime-код. Его Git commit и последний deployment указаны в итоговом сообщении задачи.

## Первичные источники

- [Vercel request headers](https://vercel.com/docs/headers/request-headers): доверенные forwarding headers платформы.
- [Upstash: atomic Lua over HTTP](https://upstash.com/blog/lua-scripting-on-upstash-redis-atomic-operations-over-http): EVAL и атомарная обработка на сервере Redis.
