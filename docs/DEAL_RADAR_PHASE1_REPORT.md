# PHASE 1 REPORT — Hidden Deal Radar

Дата: 10 сентября 2026. Репозиторий: `/Users/aleksandrasineckij/Documents/ay-digital.ru`.

**Итог: локальная foundation реализована и проверена. Подключение к удалённому Supabase и реальный вход владельца остаются BLOCKED до подтверждения целевого проекта. Production не изменён, push/deploy не выполнялись.**

## 1. EXISTING PROJECT AUDIT

- Framework/frontend: React 18, Vite 6, TypeScript, React Router, lazy routes, hooks/context; Tailwind/CSS/lucide.
- Backend: Vercel Node handlers, существующие AI/LAB/site/Visitor Intelligence APIs, scoped middleware.
- Database: Redis/Upstash для аналитики и leads; CMS через Google Apps Script и локальные fallback данные. Действующая Supabase-интеграция SITEVL не найдена.
- Auth: существующий server bearer owner API аналитики; нет пригодной браузерной owner-auth. Studio хранит локальные проекты, а не выдаёт права владельца сервера.
- Deployment: Vercel config в репозитории; `.vercel/project.json` в текущей копии отсутствует. Привязка и production secrets не менялись.
- Telegram: найден существующий provider/config в `api/_visitorIntelligenceCore.mjs`, без вывода token/chat ID.
- Background: нет активируемого этим изменением cron/scanner/daemon.
- Подробный аудит и rationale: `DEAL_RADAR_ARCHITECTURE.md`, разделы 2–4.

## 2. WHAT WAS IMPLEMENTED

- Скрытый `/radar` с login gate, отдельным noindex/nofollow HTML shell, status dashboard, пустыми состояниями и карточкой будущей ленты.
- Защищённый `/api/radar`: session/login/logout/dashboard/feedback, без открытого search/collector/admin endpoint.
- Supabase Auth: серверная проверка пользователя и owner allowlist; HttpOnly Secure cookie; короткая серверная сессия в существующем Redis.
- Реальная owner-only схема данных и транзакционная функция identity upsert/price history.
- Типы collectors/normalizer/risk/market/deals/notifications/search; безопасные inactive implementations.
- Изолированный standalone worker health runtime, без постоянного сканирования.
- Общая операция feedback для будущих UI/Telegram вызовов; bounded config, sanitized logging и ошибки.
- Никаких новых зависимостей npm, нового бота или новой Redis database.

## 3. FILES CHANGED

Основные новые файлы/группы:

- `api/radar.ts`
- `radar/{types,config,engines}.ts`
- `radar/server/`, `radar/database/`, `radar/collectors/`, `radar/normalization/`, `radar/notifications/`, `radar/services/`
- `radar/tests/` — HTTP/domain/Redis тесты и SQL assertions
- `radar-worker/runtime.ts`
- `src/features/radar/` — отдельный UI и API client
- `supabase/migrations/20260909162435_radar_foundation.sql`
- `scripts/generate-radar-shell.mjs`, `scripts/radar/`, `tsconfig.radar.json`
- `docs/DEAL_RADAR_ARCHITECTURE.md`, этот отчёт

Точечные изменения существующих файлов: `src/App.tsx`, `SiteAnalyticsProvider.tsx`, `package.json`, `eslint.config.js`, `vercel.json`, `.env.example`, `.gitignore`.

Ни один из 22 файлов прежнего незакоммиченного WebStudio/globe редизайна не изменён относительно checkpoint. Они не входят в Radar commit.

## 4. DATABASE

Подготовлены и применены **только к изолированному локальному PostgreSQL**:

`radar_owners`, `radar_listings`, `radar_listing_price_history`, `radar_market_stats`, `radar_deals`, `radar_feedback`, `radar_runtime_status`, `radar_notifications`.

Миграция аддитивная, транзакционная, без изменений существующих таблиц. Деньги — integer RUB. Есть source identity unique, price-history unique, market snapshot uniqueness, feedback idempotency, notification HOT/ULTRA dedup, FK/query indexes, RLS и grants на всех восьми таблицах. Функция `radar_ingest_listing` закрыта для anon/authenticated.

Удалённая база: **NOT APPLIED**. Доступ к одному Supabase project с общим названием не признан доказательством, что это база SITEVL. Пользователю отправлен вопрос о принадлежности проекта; чужая схема не изменялась.

## 5. SECURITY

- Анонимный API → 401; при выключенном feature flag → 404 до внешних запросов.
- Проверенный Supabase пользователь без radar_owners → 403.
- Обход через localStorage, frontend flag, email или user_metadata не реализован.
- Пароль используется только для server-side Supabase login; не сохраняется в Radar. Token не возвращается клиентскому JS.
- Сессии: 900 секунд server TTL, активный marker по SHA-256, немедленная серверная отмена при logout. Raw token в Redis не хранится.
- Redis namespaces: только `sitevl:radar:rate:*` (60 секунд) и `sitevl:radar:session:*` (900 секунд). Существующие `sitevl:lab:*`, site analytics и AI leads не затрагиваются.
- POST same-origin enforcement; JSON allowlist/8 KiB; URL/price/UUID validation; rate limit; no-store; no-referrer; DENY framing; bounded upstream JSON/timeout.
- Database: anon без grants; non-owner с RLS видит 0 строк; owner имеет только нужные read/feedback permissions.
- Pattern-scan 292 tracked source/API/script files: возможных literal Google/Telegram/Supabase secret/private-key строк по проверенным шаблонам не найдено. Это ограниченная проверка, не гарантия отсутствия всех возможных секретов в истории Git.
- В скомпилированных JS assets не найдены server Radar env names, Telegram token variable, IP-secret variable или тестовые bearer значения.

## 6. AVITO FEASIBILITY

**CONFIRMED:** GET developer portal → HTTP 200, HTML документации. Следующий запрос → HTTP 429; обращения остановлены. Web extraction tool отдельно не смог открыть страницу; проверка выполнена обычным curl.

**NOT CONFIRMED:** доступ к общей ленте новых объявлений, разрешённость такого use case, стабильная скорость/свежесть, API credentials. Реальные объявления не получены и не сохранены.

**ASSUMPTION:** возможен согласованный API/partner feed; требуется подтверждение доступа и прав. Рекомендуется сначала договориться об этом, а не обходить ограничения публичных страниц. [Официальный портал](https://developers.avito.ru/api-catalog).

## 7. FARPOST FEASIBILITY

**CONFIRMED:** правила требуют отдельного разрешения на автоматический сбор. Документ «Поиск Фарпост» упоминает REST, но не подтверждает открытый third-party API. Поэтому listing PoC не запускался. Никаких real listing records.

**NOT TESTED:** специальный лицензированный API/feed, свежесть результатов, лимиты, credentials.

Рекомендация: получить разрешённый доступ у FarPost. [Правила](https://www.farpost.ru/help/site_rules), [документация поиска](https://www.farpost.ru/help/farpost-search), [лицензия](https://www.farpost.ru/help/license_agreement).

Оба collector adapter возвращают явный PERMISSION_REQUIRED/NOT_CONFIGURED. Нет stealth, CAPTCHA обхода, перебора внутренних endpoints или агрессивного polling.

## 8. TELEGRAM

Переиспользуется конфигурация существующего SITEVL бота. Его реальные secrets не запрашивались и не выводились. Provider различает отсутствие конфигурации и конфигурацию без проверки; никогда не показывает ONLINE только по наличию переменных.

Доставка в PHASE 1 жёстко не активна, в том числе в non-development configuration. Подготовлены formatter, NotificationProvider, outbox/dedup, domain feedback. **Отправлено сообщений: 0.** Реальная доставка: NOT TESTED, webhook/callback endpoint не создан.

## 9. WORKER

`npm run radar:worker` действительно запущен, вернул `DISABLED`, `scheduler: NOT_ACTIVE`, `sources: []` и завершился. При explicit enabled умеет проверять adapter contracts, но не выполняет scans.

Переносимая основа Node/TypeScript; frontend не является планировщиком. Launchd/cron/systemd/VPS/autostart не создавались. Инструкция и будущие incremental intervals — в архитектурном документе.

## 10. TEST RESULTS

| Проверка | Результат | Граница доказательства |
|---|---|---|
| npm ls --depth=0 | PASS | Установленные зависимости без missing/extraneous; packages не обновлялись |
| npm test | PASS | 234/234, 0 skipped; включает 26 Radar tests |
| npm run test:radar | PASS | 26/26, 0 skipped |
| npm run lint | PASS | Нет ошибок |
| npx tsc -b --pretty false | PASS | Frontend/существующий проект |
| npx tsc -p tsconfig.radar.json --pretty false | PASS | Radar backend/worker/tests/local tooling |
| npm run build | PASS | Vite + typecheck + private shell + SEO generation/prerender + audit |
| SEO generation/prerender | PASS | 73 sitemap URLs, 87 public/technical prerendered HTML; Radar shell отдельно |
| SEO audit | PASS | 73 indexable / 14 existing noindex URL; Radar исключён из sitemap |
| Private shell assertion | PASS | 468-byte shell, noindex/nofollow, без JSON-LD/public page copy |
| npm run radar:db-test | PASS | Реальный локальный PostgreSQL, migration/RLS/identity/price history/outbox assertions |
| Redis rate/session | PASS | Реальный изолированный Redis: 10 concurrent attempts → 5 accepted, TTL, session open/close, LAB key unchanged |
| Radar HTTP auth | PASS local integration | Anonymous, non-owner, owner, CSRF, expiry/replay, rate, size, feedback и sanitized upstream failures |
| Radar browser | PASS local fixture | Login → dashboard → logout; real handler, fixture Supabase responses; явно подписан QA FIXTURE |
| Mobile | PASS Chromium viewport | 375/430/768/1440; scrollWidth == viewport, touch targets ≥44px; физический iPhone не проверялся |
| Public smoke | PASS local | Главная, services, prices, cases, brief selection, LAB, Studio; навигация работает |
| Public Radar isolation | PASS local | 0 Radar requests / links на главной и services; нет ссылок в LAB |
| git diff --check | PASS | Whitespace проверка |
| Hosted Supabase/Auth | BLOCKED / NOT TESTED | Нет подтверждения целевого проекта и owner enrollment |
| Live Avito/FarPost listings | NOT TESTED | Правомерный доступ не подтверждён; нет фиктивных real-data результатов |
| Telegram delivery | NOT TESTED | Сознательно не включалась |
| Production deployment/QA | NOT RUN | В данной фазе не публиковали сайт |

Во время одновременного запуска локальных серверов обнаружен конфликт стандартного Vite HMR порта. Локальные Radar tooling теперь используют отдельные HMR порты 24885/24886; после перезапуска connected. Старые сообщения о разрыве dev websocket при остановке/перезапуске не являются production-ошибкой. Public API запросы на QA сервере намеренно возвращают 503 и не проксируются в production. Uncaught JS/React ошибок на проверенных экранах не обнаружено.

Существующая Vite build warning о крупных общих/Studio chunks остаётся; она не является ошибкой сборки. Публичные данные не отправлялись тестовыми формами, реальный Gemini/lead delivery не повторялись в этой задаче.

Локальные скриншоты: `/tmp/sitevl-radar-login-final.png`, `/tmp/sitevl-radar-375.png`, `/tmp/sitevl-radar-1440.png`, `/tmp/sitevl-radar-disabled.png`. Изолированная SQL-проверка: временный каталог `sitevl-radar-pg-kACxb6` внутри macOS temporary directory; PostgreSQL остановлен.

## 11. KNOWN LIMITATIONS

Это не 24/7 мониторинг. Нет источника реальных объявлений, полного нормализатора, рыночного калькулятора, risk/deal scoring, scheduler/retention job, active Telegram delivery, полноценного поиска или realtime subscription. Изображения источников не загружаются и не кешируются; только подготовлен renderer/контракт.

Remote migration, реальные Supabase credentials/env и enrollment владельца ещё не применены. Поэтому все критерии production-ready PHASE 1 не объявляются PASS. Локально foundation готова к подключению, но по адресу production `/radar` ещё не опубликована.

## 12. RISKS FOR PHASE 2

Основной риск — правомерный и стабильный доступ к данным, а не UI. Нельзя гарантировать «за несколько минут», не имея разрешённого incremental feed. Далее: pagination/freshness, rate limits и Retry-After, дубли и смена идентичности, несопоставимые конфигурации, размер market sample, incomplete/scam listings, запоздалые цены, неоднозначность Telegram delivery, ограничение роста истории.

## 13. RECOMMENDED PHASE 2

После настройки настоящей owner-auth и разрешения источника: один licensed collector → incremental cursor → safe normalization → atomic DB upsert/price history → runtime health. Затем второй источник. Перед включением alerts — накопить сопоставимый рынок, откалибровать пороги и добавить bounded retention/outbox delivery. Эта фаза не реализовывалась заранее.

## 14. GIT

Checkpoint не включал незавершённую пользовательскую работу в новый commit: создан локальный recovery bundle + patch + копии файлов.

- Base HEAD: `f5ca23c68485028fc3dfa3ef569b73ccbc6e8907`.
- Checkpoint: `/Users/aleksandrasineckij/Documents/sitevl-radar-checkpoint.6LQRh4`.
- Отдельный Radar commit: `feat(radar): add hidden deal radar foundation`; точный hash показывается в итоговом сообщении и находится через `git log -1 --format=%H --grep='feat(radar): add hidden deal radar foundation'`.
- Рабочая копия после Radar commit не должна называться clean: в ней сохранены прежние незакоммиченные изменения WebStudio/globe/X-RAY.
- Push/deploy/remote migration: не выполнялись.
