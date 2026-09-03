# SITEVL LAB Visitor Counter — итоговый отчёт

Дата: 4 сентября 2026 года.

## Реализовано

- единый serverless endpoint `/api/lab-stats` для чтения агрегатов и приёма двух строго разрешённых событий;
- server-side хранение в существующем Production Redis/Upstash;
- атомарный глобальный счётчик посещений;
- анонимные уникальные посетители;
- счётчики запусков пяти публичных экспериментов;
- TOP-3 экспериментов из фактических агрегатов;
- client session marker и server-side dedup посещений;
- event dedup запусков экспериментов;
- ограничение размера, allowlist и rate limit;
- безопасный fallback при недоступном Redis;
- обновлённое уведомление localStorage и политика конфиденциальности;
- responsive UI в существующей стилистике SITEVL LAB.

## Локальная приёмка

| Проверка | Результат |
| --- | --- |
| `npm test` | PASS — 119/119 |
| `npm run lint` | PASS |
| `npx tsc -b --pretty false` | PASS |
| `npm run build` | PASS |
| SEO generation | PASS — 64 URL |
| Prerender | PASS — 78 HTML-файлов |
| SEO audit | PASS — 64/64 URL |
| `git diff --check` | PASS |
| Browser QA | PASS |
| Responsive 320–1920 px | PASS |
| Redis credentials во frontend bundle | не обнаружены |

Локально подтверждено, что повторный refresh `/lab` после принятого события не отправляет новый POST посещения. Повторная доставка одного experiment event безопасна: сервер отклоняет повторный инкремент по тому же `eventId`.

## Production

Проверка выполнена после Git deployment через уже связанный Vercel project `ay-digital-ru`.

- Code commit: `279006f` (`Add anonymous SITEVL LAB analytics`)
- Vercel deployment ID: `dpl_4GRbrpBXAB7cm1NkY9tZhHVVfhJ6`
- Deployment URL: `https://ay-digital-ra2ob9pd6-vgeniy.vercel.app`
- Production alias: `https://sitevl-ru.vercel.app`
- Vercel state: `READY`
- Serverless function: `api/lab-stats`, Node.js 24.x

### Исходные значения Production Redis

Первый свежий GET после публикации вернул:

- посещения: `0`;
- уникальные посетители: `0`;
- `builder`: `0`;
- `canvas`: `0`;
- `physics`: `0`;
- `modern-os`: `0`;
- `retro`: `0`.

### Контрольные события

Два одновременных события посещения с разными session ID и одним visitor ID дали `visits +2` и `uniqueVisitors +1`. Это подтвердило атомарный `INCR` и независимый анонимный unique counter. Повтор первого session ID получил HTTP 202 с `deduplicated: true` и не увеличил посещения.

Первый запуск `modern-os` увеличил его счётчик на единицу. Повтор того же `eventId` получил `deduplicated: true` и не изменил HASH. Для проверки реального TOP дополнительно записаны два запуска `builder` и три запуска `retro`; все пять ответов были HTTP 202 и не были дедуплицированы как новые события.

Первое открытие `/lab` в отдельном production browser добавило одну новую анонимную сессию и одного нового visitor. Последующие desktop/mobile reload отправляли только GET `/api/lab-stats`, без повторного POST посещения.

### Итоговый snapshot после QA

- посещения: `3`;
- уникальные посетители: `2`;
- `retro`: `3`;
- `builder`: `2`;
- `modern-os`: `1`;
- `canvas`: `0`;
- `physics`: `0`.

Production UI показал TOP-3 в правильном порядке: `РЕТРО-КОМПЬЮТЕР` — 3, `SITEVL STUDIO` — 2, `СОВРЕМЕННАЯ ОС` — 1. После reload те же значения были прочитаны обратно из Redis.

### Production browser и security QA

- desktop 1440 px: PASS, HTTP 200, overflow отсутствует;
- mobile 390 px: PASS, overflow отсутствует;
- минимальная ширина 320 px: PASS, `scrollWidth = 320`;
- browser errors: не обнаружены;
- reload desktop/mobile: только GET статистики, повторного POST посещения нет;
- production entry assets: Redis credentials, Redis env names и Upstash endpoint не обнаружены;
- попытка передать клиентский `redisKey`: HTTP 400;
- свежий GET после всех reload: значения не изменились (`3` посещения, `2` уникальных).

Архитектура, privacy-модель и остаточный риск подробно описаны в `SITEVL_LAB_ANALYTICS_AUDIT.md`.
