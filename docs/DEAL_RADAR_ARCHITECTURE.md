# Deal Radar — PHASE 1: архитектура и границы

Дата: 10 сентября 2026, Владивосток. Проект: существующий SITEVL, `ay-digital.ru`.

## 1. Цель и честный статус

Закрытый инструмент владельца для будущего поиска аномально дешёвой б/у потребительской техники. Рыночная база — сопоставимые объявления того же рынка, не MSRP и не новая розница.

PHASE 1 реализует закрытый UI/API, модель данных, миграцию, auth/authorization, контракты collectors/normalizer/market/deal/risk/notifications, безопасный worker health runtime и тесты. **Постоянный сбор, доступ к общей ленте источников, реальные рыночные оценки и Telegram-доставка не реализованы и не изображаются работающими.**

Удалённый Supabase не изменён: в SITEVL не найдена существующая привязка. Доступный в подключённом аккаунте проект имеет общее название, поэтому необходимо подтверждение владельца, что он предназначен для SITEVL. Локальная миграция и RLS проверены в изолированном PostgreSQL. Live Supabase Auth и production deployment не проверены.

## 2. Аудит существующего проекта

| Область | Фактически найдено | Решение Radar |
|---|---|---|
| Framework | React 18.3.1, Vite 6.4.3 в установленном дереве; TypeScript 5.7.3 | Использовать существующий стек |
| Frontend | SPA, React Router 7.18.2, lazy routes в `src/App.tsx` | Отдельная lazy-ветка `/radar`, вне `AppLayout` |
| Дизайн | Tailwind, собственные CSS, Framer Motion, lucide; изолированные стили LAB/Studio | Локальный `radar.css`, без правок публичных стилей |
| State | React hooks/context, локальные состояния LAB/Studio | Hooks для загрузки dashboard; без Redux/нового state manager |
| Backend | Node/Vercel handlers `api/*.mjs`; middleware для существующей аналитики | Один типизированный `api/radar.ts`, бизнес-логика вне API entry |
| Deploy | Vercel static build, cleanUrls, scoped rewrites/headers в `vercel.json` | Добавлены только правила Radar; deploy не запускался |
| Локальная Vercel-привязка | `.vercel/project.json` в этой рабочей копии не найден | Не делать `vercel link` и не выбирать проект автоматически |
| Env | `.env`, `.env.local`, `.env.example`; значения секретов не выводились | Только server-side Radar env, fail-closed defaults |
| Основное хранилище | Redis/Upstash: LAB, site counters, Visitor Intelligence, AI leads | Не менять namespaces/контракты; использовать существующий Redis для rate/session |
| Контент | Google Apps Script/Google Sheets, локальные fallback данные | Radar не связан с CMS |
| Supabase | Нет SDK, URL-конфигурации, схем и миграций действующего SITEVL | Добавлена отдельная аддитивная миграция `radar_*`; remote target требует подтверждения |
| Auth | `api/visitor-owner.mjs`: server bearer `VISITOR_OWNER_API_TOKEN`; браузерной owner-auth нет | Этот bearer НЕ отдаётся браузеру; новый вход через Supabase Auth |
| Внутренние страницы | `/studio` — локальные проекты/редактор, `/lab` — showcase; это не owner-auth инфраструктура | Не использовать локальный флаг Studio как авторизацию |
| Telegram | `telegramConfiguration()` в `api/_visitorIntelligenceCore.mjs`; существующий `sendMessage` для Visitor Intelligence/lead | Переиспользовать тот же bot/config, не менять действующий pipeline |
| Jobs | Постоянный crawler/worker отсутствует; `vercel.json` не содержит cron | Только одноразовая проверка worker, без launchd/cron/autostart |
| Логирование | Существующие серверные обработчики возвращают ограниченные ошибки | `radarLog()` — уровни и allowlisted поля, без raw error/environment |
| Ошибки | Graceful fallback API/CMS; разные local feature error states | Общий `RadarError`, статусы вместо fake data |
| Тесты | `tsx --test`, ESLint, tsc, Vite, generation/prerender, SEO audit | Тот же stack + отдельный локальный PostgreSQL тест |
| SEO/X-RAY | Явные public registries, whitelist публикуемых JSX; сгенерированный sitemap | Radar не добавлен ни в один public registry/allowlist |

Аудит определяет границы интеграции, но не является полным security-аудитом каждой существующей публичной функции SITEVL.

## 3. Модули и поток данных

```text
src/features/radar/      UI, login gate, cards, typed API client
api/radar.ts            Vercel entry; server environment only
radar/server/           auth, HTTP handler, security, bounded responses, legacy integration boundary
radar/database/         explicit DTO mappings, owner read/feedback repository
radar/collectors/        replaceable Avito/FarPost permission-gated adapters
radar/normalization/     validation/sanitization; unknown product remains unknown
radar/engines.ts         inactive market/deal/risk contracts
radar/notifications/     existing bot configuration, formatter, inactive provider
radar/services/          per-listing isolation, logging
radar/types.ts          strict domain contracts, search foundation
radar/config.ts         categories, regions, intervals, thresholds, retention plan
radar-worker/           portable one-shot health runtime
supabase/migrations/    additive SQL migration
radar/tests/            fixtures isolated from production; API, model and SQL tests
scripts/radar/          local dev/QA servers and isolated database verification
```

Future data path: collector → safe raw DTO → normalizer → atomic identity upsert/price history → comparable market snapshot → risk + deal analysis → outbox → notification provider. UI does not fetch or parse marketplace pages. Analyzer does not depend on Telegram. Source errors are isolated with `Promise.allSettled`; one malformed listing does not cancel a batch. Database errors are retryable; validation errors are not. Telegram failure must never roll back a stored listing.

## 4. Auth, API и security model

### Browser → server → verified user → owner registry → RLS data

1. `/radar` loads only its private shell and lazy module. Unauthenticated users see a login gate, not listings, statistics or credentials.
2. `RADAR_ENABLED` must equal the exact string `true`; otherwise every API action returns 404 before external calls.
3. `POST /api/radar?action=login` accepts only `email` and `password`. No signup route exists. Supabase Auth validates the password using its documented password grant; Radar does not store or hash passwords.
4. The server calls `/auth/v1/user` with the issued access token. It does NOT authorize by decoding JWT claims or trusting browser user metadata.
5. A user must also be in `public.radar_owners`. This table is writable only by the privileged service/admin workflow. Ordinary accounts cannot self-enroll.
6. Supabase access token is placed only in an HttpOnly, SameSite=Strict cookie. Production cookie is Secure and `__Host-` prefixed, Path=/, without Domain. No access/refresh token is returned as JSON or stored in localStorage. Refresh tokens from login are not retained.
7. Redis stores only a SHA-256 token index and a 15-minute activity marker, not the bearer token. Every protected request checks this marker, then verifies the upstream user and current owner enrollment. The 15-minute server TTL does not extend on reads. Login is required again after expiry.
8. Logout deletes the Redis marker immediately and clears the browser cookie, then attempts Supabase local-session logout. Replaying the old token through Radar is denied even if the upstream JWT has not expired.
9. Database reads use the owner's bearer token plus the project publishable/anon key, **not service_role**. RLS applies even if an owner calls PostgREST directly. `anon` has no grants to any Radar table; ordinary authenticated users see no rows. Feedback inserts must match `auth.uid()` and owner enrollment.

Supabase API shape is based on [Supabase Auth's documented endpoints](https://github.com/supabase/auth). PostgREST authorization follows [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

### Request boundary

| Action | Method | Protection/result |
|---|---|---|
| dashboard | GET | Active session + verified owner; latest 30 listings, component health, real count or unknown |
| session | GET | Active session + verified owner; boolean only |
| login | POST | Exact Origin, rate limit, strict bounded payload, Supabase login + owner registry |
| logout | POST | Exact Origin, rate limit, active session; immediate server revocation |
| feedback | POST | Exact Origin, active owner, action/UUID/field allowlist, RLS insert |

Only the `action` query parameter is supported, duplicate/unknown parameters rejected. No arbitrary Redis key, SQL table, URL-to-fetch or Telegram text accepted. Content-Type JSON required for body-bearing actions; maximum body 8 KiB. Upstream calls timeout after 8 seconds; upstream JSON is bounded. Redirect following is disabled on authenticated Supabase requests.

Only configured HTTPS Supabase project hosts are accepted. POST Origin must equal `RADAR_ORIGIN`, so production owner access is intended on `sitevl.tech`, not interchangeable advertising domains. This does not change old public domain behavior. Plain HTTP/cookie fallback is restricted to localhost outside Vercel/production.

Distributed Redis rate limit: 5 login requests/minute/IP and 60 other API requests/minute/IP. IP is HMAC-hashed using a server secret; no raw IP is persisted or logged by Radar. Production uses Vercel's platform IP header, local dev uses the socket address. Missing Redis/secret fails closed. [Vercel request header reference](https://vercel.com/docs/headers/request-headers).

All API responses: private/no-store, Vercel no-store, noindex/nofollow, nosniff, no-referrer, X-Frame-Options DENY. Auth/data errors return stable codes, not upstream URLs, cookies or credential-bearing exception text. Request failures emit a small structured error event.

No new third-party SDK, analytics script, tracking ID, arbitrary HID/system action or paid service introduced. No secrets were fetched from Vercel or committed.

## 5. Database schema and indexes

Migration: `supabase/migrations/20260909162435_radar_foundation.sql`. Created by the already cached Supabase CLI 2.109.1 using `migration new`, not an invented timestamp. Requires PostgreSQL 15+ (target accessible hosted version is 17, if that project is approved).

| Table | Purpose / important constraints |
|---|---|
| radar_owners | Supabase auth user UUID allowlist; owner can read only own enrollment, cannot edit it |
| radar_listings | Native UUID distinct from source ID; unique(source, source_listing_id); integer RUB 0..1bn; source/URL consistency; source status; first/last seen; typed product attributes; bounded raw/image columns |
| radar_listing_price_history | Per-listing price changes; unique(listing_id, observed_at) |
| radar_market_stats | Append-only time snapshots; product key, matching level, sample/confidence, quantiles, local/national/recent medians; same product/scope/version/time deduplicates, including NULL region |
| radar_deals | Analysis snapshots per listing+version; component scores 0..100 or NULL; explicit NOT_ANALYZED; timestamp and score consistency |
| radar_feedback | Append-only owner decisions; SAVE/NOT_INTERESTED/SUSPICIOUS/PURCHASED; same owner+operation UUID cannot duplicate |
| radar_runtime_status | Scan observations per source; successful/failed timestamps, counts, next scan, duration, version, safe error code |
| radar_notifications | Outbox + delivery history; one listing+classification+event; attempt/lease/time fields; UNKNOWN_DELIVERY for ambiguous outcomes |

All eight tables have ENABLE + FORCE RLS and explicit grants. No changes to existing Supabase tables, roles or schema-wide default privileges. Existing `auth.users` is referenced, not replaced. Local SQL tests create a minimal auth namespace only inside a disposable test cluster.

`radar_ingest_listing(jsonb)` is SECURITY INVOKER and service-role-only. It performs insert-or-lock-by-source-ID in one transaction. Repeated identical observations reuse the native ID. Price changes append a history row. An older observation cannot restore an older price or overwrite first_seen. Phase 1 does not expose this RPC to a browser/HTTP ingestion endpoint; it is a worker foundation, not an active collector.

Indexes support the actual first queries: newest feed; active product+region comparisons; active category+region+price; last_seen retention; price-history foreign key; market snapshot history; deal classification/time and snapshot FK; feedback listing/time; runtime source/time; pending outbox. Source identity unique index already covers source-prefix lookups. Separate indexes on every brand/model/price/status column would be premature; full-text/trigram index is deferred until actual search and EXPLAIN measurements.

### Currency, time, normalization, risk

- Money is integer RUB, never mixed with kopecks. Prices capped below JS safe integer limits. Percentages use PostgreSQL numeric; absolute profits may be negative.
- All database times are timestamptz; UI formats Asia/Vladivostok. Source publication time may be NULL.
- MISSING/REMOVED never implies SOLD. There is no fabricated sale detector.
- Product key is NULL until a sufficiently specific configuration is determined. Ambiguous MacBook variants must not share an EXACT bucket merely because the title has a common token.
- Types support EXACT/CLOSE/FAMILY/CATEGORY, confidence, sample size and rule version. Market code must lower confidence on fallback and retain the used matching level.
- FoundationNormalizer only cleans text, validates source ID/URL/money/timestamp and emits UNRESOLVED. Rule dictionaries, fuzzy match and local/external LLM can be added behind Normalizer.
- The initial persistence mapper stores only approved listing fields. It does not blindly spread raw input. Image links are deliberately withheld until a licensed adapter validates its image host list; source images are not downloaded to storage.
- Risk returns NOT_ANALYZED with score=null/reasons=[]; word presence alone never bans a listing. Context-sensitive rules and calibrated scoring belong to later phases.
- Feed card supports the future price quantiles, deviation, resale range, profit, score/risk, normalized product, source, timestamps and feedback. With no analysis these fields explicitly say not calculated. The initial repository does not synthesize analysis from database absence.

## 6. Retention / growth control

No scanner means no automatic listing growth in PHASE 1. Central policy defaults: last-seen listing retention 180 days, market snapshots 365 days, runtime history 30 days, notification history 90 days. Price history follows parent listing retention. Feedback belongs to the same parent; saved/purchased listings should be exempted from pruning in the future worker to avoid losing owner history.

Retention scheduler is intentionally **not active** in this phase. Before production scanning, add a bounded daily retention operation, preserve owner-saved records, and document storage limits. Do not apply a global DELETE or affect non-Radar data. Redis rate counters expire in 60 seconds; session markers expire in 900 seconds. No unbounded in-memory session map exists in production.

## 7. Avito feasibility — evidence, not promises

- **CONFIRMED:** the public developer portal exists at [developers.avito.ru/api-catalog](https://developers.avito.ru/api-catalog). One direct GET from the current environment returned HTTP 200 and the developer portal HTML. This is documentation, not a listing feed.
- **CONFIRMED:** the next direct request returned HTTP 429. Requests were stopped. No CAPTCHA solving, proxy rotation, stealth or retry storm was attempted.
- **NOT TESTED / NOT CONFIRMED:** access credentials, permissible market-wide fresh listings, exact API coverage/rate limits, stable fetchLatest results, freshness/order guarantees. No real listing was imported.
- **ASSUMPTION:** an approved API/partner feed might cover the use case, but this needs confirmation from the source. API availability does not by itself grant a license to collect all public listings.
- Recommended next step: establish a permitted data contract with Avito or a provider that can substantiate redistribution/access rights, then run one bounded, documented batch. Do not build against guessed private endpoints or use a seller-management API as evidence of whole-market search.

AvitoCollector currently returns PERMISSION_REQUIRED, non-retryable. Environment flags cannot bypass it.

## 8. FarPost feasibility — evidence, not promises

- **CONFIRMED:** [site rules](https://www.farpost.ru/help/site_rules) state that bots/automatic data collection require special permission. Therefore no listing scraping PoC was performed.
- **CONFIRMED:** [the “Поиск Фарпост” document](https://www.farpost.ru/help/farpost-search) mentions an HTTP REST interface. This is not evidence of an unrestricted public third-party API.
- **CONFIRMED:** [the licensing terms](https://www.farpost.ru/help/license_agreement) restrict third-party access methods. A browser login does not grant our own collector permission.
- **NOT TESTED:** licensed feed, external client credentials, market-wide listing results, limits, incremental pagination, freshness. Zero real FarPost records imported.
- Recommended next step: request specific written permission/API or feed access from FarPost. Keep the provider adapter replaceable. If permission is unavailable, report that source unavailable rather than implement evasion.

Official API / permitted feeds are preferred. No third-party provider has been vetted or purchased. Public HTML scrapers and browser automation for listing collection are rejected for now due to unconfirmed permission and maintainability. The small feasibility probe was limited to documentation access; it is not advertised as a working marketplace PoC.

## 9. Telegram and feedback

Existing bot configuration is reused through a narrow typed boundary to `api/_visitorIntelligenceCore.mjs`. Primary names: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID; the existing AI_LEADS_TELEGRAM_* aliases remain supported. No new bot/chat/database. Existing Visitor Intelligence delivery code is not refactored or changed.

TelegramNotificationProvider distinguishes NOT_CONFIGURED from CONFIGURED_NOT_TESTED. Presence of variables never means ONLINE. `send()` returns NOT_ACTIVE and contains no network send call. **Zero messages were sent during PHASE 1.** Formatter accepts a domain summary, not arbitrary browser text. It does not send seller contacts, raw JSON, internal errors or credentials.

Future dispatch claims an outbox row (lease/attempt metadata prepared), persists result, and uses classification-specific uniqueness. HOT→ULTRA is a distinct notification; repeated HOT is not. Telegram's sendMessage does not provide exactly-once delivery: an ambiguous timeout must become UNKNOWN_DELIVERY, not automatic endless resends.

Website feedback is implemented as `RadarRepository.feedback()`. Future verified Telegram callbacks must resolve a configured owner account and call the same operation with channel TELEGRAM. They must verify webhook secret and sender/chat identity; **no Telegram callback endpoint is open in PHASE 1**. Stable operation IDs make a repeated request idempotent; reusing the same ID for a different action conflicts.

## 10. Worker runtime and phase boundaries

`npm run radar:worker` runs TypeScript through the project's existing tsx dependency. With defaults it returns DISABLED and exits. With RADAR_ENABLED=true it reports collector health/foundation status and exits. No daemon, timers, source requests or DB writes start. Closing the browser has no influence on this standalone process.

Future Mac/VPS runtime: Node 24 + npm ci (including existing dev tool tsx for this source-run foundation), server-only env, separate OS process; no GUI/browser dependency. A production compiled worker/package and managed process supervisor should be selected when an actual permitted collector exists, not installed prematurely.

Planned scheduler separation: fresh scan ~180 seconds, existing refresh ~3600 seconds, market recalculation ~900 seconds, with configurable limits and source budgets. Implement cursor checkpoints, backoff/Retry-After, non-overlapping source leases, bounded concurrency and graceful shutdown in PHASE 2. Do not perform a full-market refresh each interval.

Manual search has strict query/result contracts and indexes but no production search endpoint. Categories cover broad consumer electronics; excluded large appliances and regions live in config, not core matching code. Current thresholds are safe inactive defaults, not calibrated predictions.

## 11. Environment configuration and owner enrollment

Everything below is server-only; placeholders in `.env.example` contain no real secrets. Existing `.env*` ignore remains; only `.env.example` is trackable.

| Variable | Required / meaning |
|---|---|
| RADAR_ENABLED | Default false; exact true enables the protected API, not scanning |
| RADAR_DEVELOPMENT_MODE | Default true; shows safety mode; phase1 delivery stays off even when false |
| RADAR_ORIGIN | Exact owner UI origin; production `https://sitevl.tech` |
| RADAR_SUPABASE_URL | Approved project's HTTPS URL |
| RADAR_SUPABASE_PUBLISHABLE_KEY | Approved publishable or legacy anon key; retained server-side in this design |
| RADAR_RATE_LIMIT_SECRET | At least 32 random characters; can omit if existing VISITOR_IP_HASH_SECRET is safely available |
| Existing Redis URL/token pair | Same AI_LEADS_REDIS_REST_*, UPSTASH_REDIS_REST_* or KV_REST_API_* configuration; no new Redis |
| TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID | Existing bot; optional for phase1 configuration status; delivery inactive |
| RADAR_SUPABASE_SERVICE_ROLE_KEY | Reserved for future worker only; not used by UI or owner read API in this phase |
| RADAR_SOURCES | Empty by default; future source selection, adapters still permission-gated |
| RADAR_CATEGORIES / RADAR_EXCLUDED_CATEGORIES | Comma-separated categories |
| RADAR_PRIORITY_REGIONS / RADAR_LOCAL_REGION / RADAR_NATIONAL_MODE | Region selection, no IP geolocation |
| RADAR_SCAN_INTERVAL_SECONDS / RADAR_REFRESH_INTERVAL_SECONDS / RADAR_MARKET_INTERVAL_SECONDS | Validated future intervals |
| RADAR_MIN_ANOMALY_PERCENT / RADAR_MIN_PROFIT_RUB | Inactive future thresholds |

Owner setup after confirming the correct Supabase project:

1. Review the migration against the target schema and take the appropriate project backup. Do not infer project identity from available access.
2. Apply only the Radar migration through the linked migration workflow. First inspect `supabase db push --linked --dry-run`; then execute the approved migration. Do not run include-all blindly against an existing foreign migration history. The connected Supabase migration API can apply the exact file when the target has been confirmed.
3. Use an existing permanent Supabase Auth account or provision the owner's account through the dashboard. Do not expose public signup as owner enrollment. Do not weaken global auth settings of another application.
4. Add exactly that account UUID to radar_owners through a privileged SQL/admin operation. Template (replace placeholder; not executed automatically):

```sql
insert into public.radar_owners(owner_id)
values ('REPLACE_WITH_VERIFIED_AUTH_USER_UUID')
on conflict do nothing;
```

5. Add server environment variables through the hosting settings or local ignored `.env.local`. Never send secrets in chat or use VITE_ variables. Do not put passwords/service keys on command lines or in documentation.
6. Keep RADAR_ENABLED=false until a real owner login + anon/non-owner rejection + RLS check is successful on a controlled environment.
7. Publishing to the existing Vercel project is a separate approval/action, not performed in this phase.

### Local commands

```sh
npm run test:radar
npm run radar:db-test
npx tsc -p tsconfig.radar.json --pretty false
npm run radar:worker
npm run radar:dev
```

`radar:dev` binds 127.0.0.1:4185, no production API proxy. Public API calls on this local server deliberately return 503; this protects real leads/counters. `scripts/radar/qa-server.ts` is a separate explicit fixture harness on 4186: no real credentials, refuses Vercel/production, uses the real handler but mocked upstream auth/DB. Its dashboard is visibly labeled QA FIXTURE. It is not evidence of real hosted authentication.

## 12. Verification / limitations

See `DEAL_RADAR_PHASE1_REPORT.md` for the final check matrix. Tests cover HTTP auth, non-owner denial, CSRF, fail-closed config/rate, session revocation/expiry, exact payloads, per-listing isolation, normalization/mapping, inactive engines/providers and private route boundaries.

`radar:db-test` uses installed PostgreSQL tools and a private temporary directory, Unix socket only. No hosted database URL or secret is consumed. It applies the real migration, verifies all eight anon denials, ordinary user denial, owner read/feedback, source dedup, price history/out-of-order protection and notification uniqueness. The temporary PostgreSQL server is stopped afterward; logs/data remain local for evidence. This does not simulate the full hosted Supabase Auth service.

Confirmed UI widths: 375, 430, 768, 1440. No overflow; buttons at least 44px. Auth cookie unreadable via document.cookie. Router navigation and public/lab/studio smoke completed without uncaught browser errors. Production submission of real forms was not performed. Existing regression tests cover the untouched public APIs.

Known limitations: no remote target enrollment, no actual source license/feed, no real listing dataset, no automatic scoring, no automatic retention job, no Telegram send/webhook, no MFA UI/refresh-token flow, no continuous worker, no full search, no realtime subscription. A temporary server/API outage fails closed and may require signing in again. The main build still reports pre-existing large Studio/shared chunk warnings; Radar's own initial build chunk is ~12.65 kB / ~5.06 kB gzip.

## 13. Rollback

- Local checkpoint before changes: `/Users/aleksandrasineckij/Documents/sitevl-radar-checkpoint.6LQRh4`, containing HEAD bundle, binary working-tree patch and 22 file copies with SHA-256 manifest.
- Base HEAD: `f5ca23c68485028fc3dfa3ef569b73ccbc6e8907`. Existing WebStudio/globe changes were never staged as Radar work; all 22 hashes remained identical at verification.
- Disable RADAR_ENABLED first. No worker or alerts need to be stopped in this phase because none were started continuously.
- Revert only the separate Radar commit after reviewing overlap with later edits. Do not use reset --hard or restore the entire repository from the checkpoint.
- No remote migration was applied, so no remote data rollback is currently necessary.
- If applied later, prefer leaving closed tables in place when disabling the feature. Before removing data: export needed Radar records, stop the future worker, revoke enrollment, and prepare a reviewed down-migration targeting only the explicitly named Radar tables/function, in dependency order. Never use DROP SCHEMA public or broad CASCADE cleanup.
- Public SEO, bot and visitor/LAB namespaces must remain intact. Existing dirty files belong to earlier user work.

## 14. Recommended PHASE 2

First close access prerequisites: confirm the Supabase target, apply/enroll/test real owner auth, obtain a permitted source feed with documented freshness/rate contract. Then implement **one** licensed source end-to-end: incremental bounded fetch → deterministic basic normalization → atomic ingest/price history → cursor checkpoint/runtime health. Add fixture regression cases from sanitized licensed examples. Only after successful real-data QA add the second source and market sample collection. Deal scoring and active Telegram alerts require a later calibrated, separately tested release gate.
