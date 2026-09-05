# SITEVL — миграция основного домена

Дата проверки: 5 сентября 2026, Asia/Vladivostok.

## Итог

Основной публичный и SEO origin: **https://sitevl.tech**. Миграция опубликована в существующем проекте `ay-digital-ru`; новый проект и Redis database не создавались. DNS Masterhost не изменялся.

Проверенный application release commit: `93fe2beb08c6495d38a161ba4aaf9be5cda78002`.

Проверенный production deployment: `dpl_8Q9SJSH8zjpcx65FeWbGy1U1gj6v`, **READY**, `ay-digital-ck41zdikx-vgeniy.vercel.app`. Он содержит миграцию домена и сохранённое коммерческое SEO-расширение предыдущего этапа. Этот отчёт фиксирует QA именно этого application release; отдельный последующий documentation commit не меняет приложение.

## Домены и перенаправления

| Адрес | Проверенный результат |
| --- | --- |
| `https://sitevl.tech` | 200, основной сайт |
| `https://www.sitevl.tech` | 308 → `https://sitevl.tech` |
| `http://sitevl.tech` | 308 → HTTPS на основном домене |
| `http://www.sitevl.tech` | 308 → HTTPS www → 308 на основной домен |
| `https://sitevl-ru.vercel.app` | 200, остаётся старым рекламным alias, без host redirect |
| `https://ay-digital-ru.vercel.app` | 200, остаётся старым рекламным alias, без host redirect |

Путь и query сохраняются: `https://www.sitevl.tech/ai-website?src=domain-test` → `https://sitevl.tech/ai-website?src=domain-test`. Старые `/services`, `/ai-website?src=legacy-test`, `/lab` и другие проверенные deep links открываются без переключения hostname.

Оба старых домена сохранены без даты автоматического отключения; код/автоматизация удаления через 30 дней не добавлялись.

Vercel API: все четыре domain `verified:true`; apex `configuredBy:A, misconfigured:false`, www `configuredBy:CNAME, misconfigured:false`. TLS для apex и www проверен без отключения certificate validation: `tlsAuthorized:true`, issuer **Let's Encrypt**, сертификаты действуют с 05.09.2026 до 04.12.2026. Собственные сертификаты не добавлялись.

**Никакие DNS записи применять для этой миграции больше не требуется.** Существующее DNS-направление подтверждено Vercel; локальный синтетический DNS-ответ из аудита не использовался как основание для изменений.

## Что изменено в коде и конфигурации

- `src/config/publicOrigin.mjs` — единый постоянный primary origin для runtime, Vite и SEO scripts.
- `src/config/site.ts` больше не выбирает canonical по `window.location.origin`.
- `scripts/site-env.mjs` и `vite.config.ts` проверяют `VITE_SITE_URL` через общий resolver. Сборка со старым alias, HTTP или www в этой переменной завершается явной ошибкой вместо выпуска неправильного canonical.
- Vercel **Production** `VITE_SITE_URL` обновлён на `https://sitevl.tech`. Обновлена только эта публичная переменная; остальные credentials не менялись.
- `.env.example`, локальная публичная переменная, отображаемое доменное имя, sitemap и robots согласованы с конфигурацией.
- Относительные SPA-ссылки и same-origin `/api/*` сохранены.
- Studio preview остаётся same-origin, потому что это локальный IndexedDB-проект, а не серверная публичная share page. Принудительная подмена origin сломала бы доступ к проекту в старом браузере.
- AI Website Generator экспортирует локальный JSON и использует относительный API; старых публичных SITEVL share links в нём не обнаружено. Telegram Visitor Intelligence отправляет названия страниц, а не абсолютные SITEVL URL, поэтому там нечего заменять.
- X-RAY route registry сохраняет относительные пути и получает SEO через общую конфигурацию.

## Production SEO QA — PASS

На **каждом** из трёх обслуживающих hostname выполнен HTTP GET всех 72 индексируемых страниц: **216/216 PASS**.

Проверены HTTP 200, соответствующий pathname canonical `https://sitevl.tech/...`, `og:url`, наличие и валидный JSON-LD без legacy hostname. Полный локальный SEO-аудит также проверяет уникальные title/description/H1, FAQ и видимый контент, BreadcrumbList, ссылки, meta robots и исключение технических страниц.

Sitemap: https://sitevl.tech/sitemap.xml — **72 URL**, только основной HTTPS-домен, без query и технических страниц. Sitemap на обоих старых aliases также содержит только `sitevl.tech`.

Robots: https://sitevl.tech/robots.txt — sitemap указывает на новый домен. Сохранены **14 noindex routes** и заголовки/метаданные LAB, Studio, Brief и технических разделов. Пользовательские AI-превью не стали индексируемыми страницами.

Повторно проверены обязательные `/`, `/services`, `/mobile-apps`, `/prices`, `/prices/websites`, `/prices/mobile-apps`, `/cases`, `/brief`, `/ai-website`, `/privacy`, `/lab`, `/lab/modern-os`. Дополнительная матрица old/primary deep links — **15/15 HTTP 200**.

Отдельный браузерный прогон после выполнения JavaScript на обоих legacy aliases подтвердил: `/ai-website?src=legacy-test` остаётся на исходном hostname, форма работает, `firstSource:legacy-test`, canonical остаётся `https://sitevl.tech/ai-website`. Оба origin получили разные корректные `SV-XXXXXX`; ошибок JavaScript нет.

## Gemini, Visitor Intelligence и Telegram — PASS

Реальные GET на `sitevl.tech`:

| Endpoint | Ответ |
| --- | --- |
| `/api/ai` | 200, `configured:true`, `provider:gemini` |
| `/api/visitor-events` | 200, `configured:true`, `telegramConfigured:true` |
| `/api/ai-leads` | 200, `configured:true`, `telegramConfigured:true` |
| `/api/site-stats` | 200, валидная текущая агрегированная статистика |
| `/api/lab-stats` | 200, валидная текущая агрегированная статистика |

Live browser flow:

`/?src=telegram-test` → `/mobile-apps` → `/prices` → `/lab` → `/lab/modern-os` → обратно через LAB/главную → `/ai-website` → генерация → заявка.

Серверный Redis read подтверждает одну QA identity и одну сессию, `firstSource:telegram-test`, `firstPage:/`, историю страниц, `modern-os` в запущенных экспериментах, `ai_concept_created`, `lead_created`, `generatedAiConcept:1`, `leadSubmitted:1` и связь с lead/Concept ID. Повторные реальные возвращения в LAB и на главную присутствуют в истории, но не создают повторных unique visitor уведомлений.

В Modern OS текстовый запрос выполнен через реальный `/api/ai`: **200, provider gemini**, ответ отобразился внутри окна SITEVL AI. Затем AI Website Generator создал и отрисовал реальную концепцию из **5 sections**, **200, provider gemini, fallback:false**. Fake response или замена Gemini не использовались. `503 high demand` в этом прогоне не возникал.

Тестовая заявка отправлена через видимую форму с явно тестовым именем и email в зарезервированной зоне `.invalid`. Ответ **201**, `stored:true`, `linked:true`, `notification:sent`; UI показал «Отправлено».

Telegram API подтвердил отправку всех семи значимых событий: новый посетитель, цены, вход в LAB, запуск Modern OS, открытие AI-концепта, создание AI-концепта, новая заявка. Это подтверждение успешного API send, а не утверждение, что владелец открыл сообщения в Telegram. Новый бот не создавался; действующая server-side конфигурация сохранена.

## QA cleanup и приватность

Визуальные тесты блокировали analytics POST только тестовым browser harness; production-код и ответы AI не подменялись. Для live visitor-теста POST общих SITE/LAB counters также был заблокирован в QA browser. Сами visitor events и lead отправлялись реально.

Перед live-тестом проверено отсутствие выбранной QA identity в Redis. После закрытия QA browser выполнены инвентаризация и точечное удаление **25 существовавших QA keys**: profile/history/pages/experiments, dedup/session/notify keys, тестовый lead и персональные rate keys. QA member удалён из visitor index, QA lead — из lead index. Fresh EXISTS/ZSCORE проверка подтвердила отсутствие этих записей. Общие anti-abuse rate buckets не сбрасывались и истекают по своему TTL.

Дополнительный независимый read-only запуск после cleanup подтвердил отсутствие QA profile и member в index; production public URL также повторно подтверждён как `https://sitevl.tech`.

**Реальных записей удалено: 0. Общие counters не сбрасывались.** Namespaces `sitevl:visitor:v1:*`, `sitevl:lab:*`, `sitevl:site:*`, `sitevl:ai-lead:*` сохранены. Базы и API архитектура не менялись. Тестовые сообщения в Telegram могут оставаться в истории чата; удаление Redis-записей не удаляет уже доставленные уведомления.

Ключи Gemini, Redis и Telegram, chat ID и cookies не добавлялись в отчёты, frontend или Git. `.env` и `.env.local` остаются gitignored; в Git входит лишь безопасный `.env.example`.

LocalStorage, sessionStorage и IndexedDB разделены по origin. На `sitevl.tech` создаётся корректный новый анонимный ID; перенос ID с Vercel aliases не выполняется. Никакого fingerprinting, точной геолокации, hidden iframe, извлечения cross-origin storage или определения личности.

## Browser и release gate

| Проверка | Результат |
| --- | --- |
| `npm test` | **141/141 PASS**, повторно после live QA |
| `npm run lint` | PASS |
| `npx tsc -b --pretty false` | PASS |
| `npm run build` | PASS |
| SEO generation | 72 sitemap URL |
| Prerender | 86 HTML routes |
| SEO audit | 72 indexable + 14 noindex PASS |
| `git diff --check` | PASS |
| Local responsive | 12 страниц × 4 viewport = **48/48 PASS** |
| Production responsive | 12 страниц × 4 viewport = **48/48 PASS** |
| Production JavaScript errors | 0 в проверенных браузерных сценариях |
| Vercel runtime error logs | 0 для проверенного deployment в окне QA |

Viewport: **390×844, 768×1024, 1366×768, 1440×900**. Проверены содержимое, интерактивные элементы, canonical, отсутствие error overlay и горизонтального переполнения. Modern OS проверялся как интерфейс с иконками/кнопками, а не по искусственному минимальному объёму текста.

## Google Search Console — действия владельца

1. В Google Search Console добавить **Domain Property `sitevl.tech`**, без `https://` и без www.
2. Получить **уникальное TXT-значение, которое покажет Google**, и самостоятельно добавить его в DNS Masterhost. Не заменять существующие A/CNAME и не удалять действующие TXT. В этой задаче DNS не менялся и verification-токен не придумывался.
3. После подтверждения отправить sitemap: **https://sitevl.tech/sitemap.xml**.
4. Через URL Inspection запросить индексацию главной, `/web-studio`, `/services`, `/prices/websites`, `/mobile-apps`, `/prices/mobile-apps` и новых специализированных коммерческих страниц.
5. **Старую property не удалять.** Существующий HTML verification token сохранён побайтово. Новый canonical не означает немедленную переиндексацию или гарантированную позицию в поиске.

Официальные инструкции: [Google: Domain Property](https://support.google.com/webmasters/answer/34592?hl=en), [Google: TXT verification](https://support.google.com/webmasters/answer/9008080?hl=en), [Vercel: domain redirects](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting).

Дополнительные secrets от владельца **не нужны**. Ручное действие осталось только в Google Search Console, если новая Domain Property ещё не подтверждена.
