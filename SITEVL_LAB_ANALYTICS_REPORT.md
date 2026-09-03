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

Этот раздел заполняется фактическими значениями после code commit, Git push, завершения существующего Vercel production deployment и контрольных запросов к реальному Redis.

- Code commit: pending deployment
- Vercel deployment ID: pending deployment
- Начальные посещения: pending measurement
- Начальные уникальные посетители: pending measurement
- Начальные запуски экспериментов: pending measurement
- Проверка atomic increment: pending production QA
- Проверка anonymous unique visitor: pending production QA
- Проверка session dedup и reload: pending production QA
- Проверка experiment counters и TOP-3: pending production QA
- Production mobile/desktop: pending production QA

Архитектура, privacy-модель и остаточный риск подробно описаны в `SITEVL_LAB_ANALYTICS_AUDIT.md`.
