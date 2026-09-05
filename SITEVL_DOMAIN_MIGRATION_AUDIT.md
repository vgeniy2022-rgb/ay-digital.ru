# SITEVL — аудит миграции домена

Дата: 2026-09-05. Целевой основной origin: `https://sitevl.tech`.

## Состояние до изменений

Проверены Git и Vercel CLI/API. `.vercel/project.json` отсутствует: действующая привязка находится в `.vercel/repo.json`, проект `ay-digital-ru`, ID `prj_REyqEPemqb3DbzgR2z7PMPJv0FsL`, production branch `main`, GitHub `vgeniy2022-rgb/ay-digital.ru`. Новый проект не требуется.

Vercel подтверждает четыре verified domain: `sitevl.tech`, `www.sitevl.tech`, `sitevl-ru.vercel.app`, `ay-digital-ru.vercel.app`. На момент аудита redirect у всех отсутствует. Реальный HTTPS GET `/services?src=domain-audit` на каждом адресе вернул 200, canonical везде `https://sitevl-ru.vercel.app/services`.

DNS не изменяется. Локальный DNS resolver возвращает для apex адрес из служебного диапазона 198.18.0.0/15, поэтому этот ответ нельзя выдавать за DNS-настройку Masterhost. HTTPS и Vercel verification проверяются отдельно. Для www наблюдался CNAME `5e005601f0c53b79.vercel-dns-017.com`; это наблюдение, не инструкция изменить DNS.

## Найденные источники и решение

| Место | Публичное использование | Действие |
| --- | --- | --- |
| `src/config/site.ts` | canonical, OG, JSON-LD через `absoluteUrl`; опасный fallback на `window.location.origin` | Убрать зависимость от текущего hostname; общий постоянный primary origin |
| `.env`, `.env.example` | `VITE_SITE_URL=https://sitevl-ru.vercel.app` | Обновить только публичную переменную; не читать/копировать секреты |
| Vercel Production `VITE_SITE_URL` | URL всех артефактов сборки | Обновить на основной HTTPS origin; новый deployment обязателен |
| `scripts/site-env.mjs`, `vite.config.ts` | Раздельная загрузка env для сборки и SEO | Общая проверка primary origin; запрет сборки с legacy canonical |
| `index.html` | `%VITE_SITE_URL%` в canonical, OG URL/image, Twitter image | Согласовать с единым source of truth |
| `scripts/generate-seo.mjs`, `scripts/seo-audit.mjs` | Пререндер, sitemap, robots, schema, метаданные | Перегенерировать и проверить все indexable routes |
| `public/sitemap.xml`, `public/robots.txt` | Старый публичный hostname | Заменить генерацией, сохранить правила исключения технических страниц |
| `src/data/site.ts` | Пользовательский `domain: ay-digital.ru` | Выводить hostname из общей конфигурации |
| `src/components/SeoHead.tsx`, `src/utils/seoStructuredData.ts` и route metadata | URL через конфигурацию | Сохранить архитектуру, проверить результат на трёх хостах |
| `src/features/site-builder/pages/StudioEditorPage.tsx` | Same-origin preview проекта из IndexedDB | Сохранить same-origin: перенос такой ссылки на другой origin потеряет локальный проект; это не публичный SEO URL |
| `src/pages/AiWebsitePage.tsx`, `api/ai.mjs`, `api/ai-leads.mjs` | Same-origin API, локальный JSON export, относительные ссылки | Сохранить provider/storage/lead linkage; публичных legacy share URL не найдено |
| `api/_visitorIntelligenceCore.mjs` | Telegram summary: страницы обозначены названиями, URL SITEVL отсутствуют | Нет ссылки для замены; не менять secrets или формат без необходимости |
| `src/features/site-analytics/*`, LAB analytics | `/api/*`, relative paths; referrer сравнивается с текущим hostname | Не подменять origin analytics canonical-доменом; сохранить source/session logic |
| `src/features/site-analytics/visitorIntelligence.test.ts` | Legacy hostname в unit fixture | Сохранить как backward-compatibility test и дополнить новым origin |
| `src/features/xray/*` | Route paths относительные | Сохранить; проверить canonical через общий SEO слой |
| Исторические `SITEVL_*REPORT.md`, `SITEVL_*AUDIT.md` | Отчёты о прежних production releases | Сохранить историю, не переписывать факты старых проверок |
| Старые Vercel aliases | Действующая реклама | Сохранить домены, не вводить host redirect, проверить deep links и query |

## Ограничения и безопасный план QA

Существующие незакоммиченные SEO-изменения предыдущего этапа сохранены и входят в release gate. Новая задача не отменяет их и не сбрасывает рабочую копию.

Новый origin получает собственные localStorage/IndexedDB и sessionStorage. Перенос visitor ID между origin не выполняется. Fingerprinting, hidden iframe и чтение чужого storage не используются.

Для визуального QA не создавать события общих SITEVL/LAB counters. Реальный Visitor Intelligence тест проводить отдельной явно QA identity с инвентаризацией точных Redis keys; удалить только созданные QA записи. Не сбрасывать `sitevl:visitor:v1:*`, `sitevl:lab:*`, `sitevl:ai-lead:*`, `sitevl:site:*`.

## Search Console

Существующие verification assets и property сохраняются. Новая Domain Property `sitevl.tech` требует TXT из Google Search Console; значение нельзя угадать. Сайт готовится к sitemap `https://sitevl.tech/sitemap.xml`. DNS в рамках этой задачи не изменяется.
