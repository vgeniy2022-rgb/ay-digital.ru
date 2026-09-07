# SITEVL Visitor Intelligence V3

Дата реализации: 8 сентября 2026. Основной адрес: https://sitevl.tech.
Проект: существующий `ay-digital-ru`, `prj_REyqEPemqb3DbzgR2z7PMPJv0FsL`, Vite / Node 24, GitHub `main`.

## Аудит до изменений

- Исходный commit: `f221eb8e2d89a14eb1b9fd63c928626fc57041a5`; рабочая копия была чистой.
- Привязка подтверждена по `.vercel/repo.json` и Vercel API. Новый проект и новая Redis database не создавались.
- `sitevl.tech`, `sitevl-ru.vercel.app`, `ay-digital-ru.vercel.app` отвечали; старый рекламный домен отдавал HTML напрямую, без междоменного redirect.
- `www.sitevl.tech` уже перенаправлялся на основной домен (308). Эта настройка не менялась.
- `/api/visitor-events`: V2, Redis и Telegram настроены, IP-assist выключен. Существующие Telegram secrets не менялись.
- Используется существующая V2 атомарная Lua-транзакция, случайный ID браузера, visitorNumber / visitNumber и привязка lead через существующую сессию.

## Переход со старой рекламы

Для GET/HEAD публичных страниц routing middleware делает временный 307 со старого рекламного домена на `sitevl.tech`. Путь и значения query (включая повторяющиеся, `src`, UTM) сохраняются. На основном домене ещё один 307 устанавливает подписанную HttpOnly-cookie и удаляет только внутренний параметр `__sv_attribution` до загрузки приложения.

- `source = paid-ad`, `campaign = telegram-vl-old-ad`, `entryHost = sitevl-ru.vercel.app`.
- Подпись HMAC-SHA256, purpose separation, срок 30 минут; `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`, префикс `__Host-`.
- Случайный `VISITOR_ATTRIBUTION_SECRET` добавлен как Production Secret в существующий проект. Значение не записывается в файлы, frontend, Git и отчёт.
- Короткоживущая cookie передаёт источник, НЕ идентичность или авторизацию. После первого принятого события атрибуция остаётся в server-side session независимо от окончания cookie.
- Учитывается первый источник сессии. Новая прямая сессия после окна cookie не становится рекламной автоматически. Переход по рекламной ссылке в уже существующей сессии обогащает её без смены номера.
- Явные `src=vk`, `utm_source=google`, другой внешний referrer и некорректная явная source-метка не считаются этой рекламой. Без надёжной метки используется `attributionBasis=assumed-old-host`; это видно и в Telegram.
- **Предположение:** текущее основное назначение старого домена — оплаченная реклама пользователя. Прямой исторический bookmark того же домена отличить от рекламы нельзя. Даже Telegram-метка не доказывает клик по конкретному оплаченному посту; это атрибуция канала, не верификация оплаты.
- При отсутствии ключа старый сайт продолжает открываться напрямую (fail-open), чтобы не потерять рекламные переходы.
- Старые alias не удаляются. Статические файлы, API, admin и Studio исключены из middleware; существующие технические/устаревшие route redirects остаются. `ay-digital-ru.vercel.app` не перенаправляется принудительно.
- Канонические URL не зависят от текущего hostname: прежний общий источник `src/config/publicOrigin.mjs`, https://sitevl.tech.

### Ограничение идентичности между доменами

localStorage разных origins изолирован браузером. Существующий ID на `sitevl.tech` сохраняется. Если у браузера был ID только на старом домене, автоматического переноса этого ID нет: на основном домене используется его собственная идентичность. Старые Redis-записи/номера не удаляются; IP не применяется для склейки. Атрибуция источника переносится отдельно от идентичности.

## Human / bot

| Категория | Основание | Входит в human counters |
| --- | --- | --- |
| likely-human | Обычный browser UA без известных automation signatures, событие существующего JS-клиента | Да, даже без клика |
| human | Дополнительно категория trusted click либо 8 секунд видимого чтения, подтверждение эвристическое и client-reported | Да |
| likely-bot | Известная bot signature без сетевого подтверждения, headless/CLI или отсутствующий browser UA | Нет |
| known-bot | Google crawler signature и forward-confirmed reverse DNS | Нет |

Клиент не может передать категорию, географию, Redis key или Telegram message. Сервер хранит понятную `classificationReason`; последующие page views не понижают уже полученный поведенческий уровень.

Поддержаны Googlebot, Google-InspectionTool, GoogleOther, AdsBot-Google, Bingbot/BingPreview, Yandex, Applebot, DuckDuckBot, TelegramBot, Facebook/Facebot, Twitterbot, LinkedInBot, GPTBot/OAI/ChatGPT, Claude, Ahrefs/Semrush/MJ12/Dot/Petal и общие automation signatures.

Для Google: только доверенный IP-заголовок инфраструктуры, reverse DNS, допустимая маска имени Google, forward DNS с совпадением исходного IP. Клиентские `x-forwarded-for` не принимаются как доказательство. Обычные арендаторы GCP с `googleusercontent.com` не считаются подтверждёнными Google-краулерами. DNS: максимум 800 мс, до 3 имён, до 8 конкурентных проверок, кэш до 512 SHA-256 ключей в памяти; успешная проверка 1 час, отрицательная 5 минут. Ошибка/timeout оставляет likely-bot, а не human.

Обычная выдача HTML не обращается к Redis/DNS. Для известного crawler middleware использует отложенную обработку `waitUntil`; отказ аналитики не должен блокировать страницу. Если crawler исполняет JS, guards в `/api/site-stats`, `/api/lab-stats`, `/api/visitor-events` также отсекают его до выделения human number/счётчиков. Поисковый доступ и содержимое страниц не блокируются.

**Не гарантируется 100% распознавание:** автоматизация с обычным UA и подделанными сигналами может выглядеть как браузер; нестандартный реальный клиент может попасть в likely-bot. Числа описывают псевдонимные браузеры, не доказанное количество людей. CAPTCHA и fingerprinting не добавлялись.

## Приблизительная география

Только Vercel headers: `x-vercel-ip-country`, `x-vercel-ip-country-region`, `x-vercel-ip-city`, при `VERCEL=1`. Проверяются формат страны/региона, длина и безопасные символы города; percent-encoded город декодируется. Невалидные/отсутствующие поля не выдумываются.

`geoSource=network`, `geoPrecision=approximate`. Telegram может показывать `Владивосток · Приморский край · Россия (приблизительно, по сети)`. Неизвестный регион остаётся кодом, а не угаданным названием. VPN, прокси и мобильный оператор могут указывать другой город. GPS, browser Geolocation, координаты, postal code и сторонний geo-сервис не используются.

Существующий HMAC IP-assist сохранён без изменений и **не включался**. Raw IP нужен только в памяти для ограниченной проверки Google и не записывается в Redis/Telegram/owner response. IP не означает человека.

## Telegram

Существующий `@ay_digital_orders_bot`, server-side `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`.

- Новый обычный посетитель: прежний human-формат + классификация и приблизительная география.
- Возвращение: прежние visitorNumber, visitNumber, sessionNumber, первый/текущий source.
- Реклама: `📣 Посетитель пришёл с рекламы`, кампания, старый entryHost, финальная страница и явное предупреждение об assumed-old-host, когда применимо.
- Цены / LAB / experiment / AI concept: существующие значимые уведомления сохранены.
- Lead: прежний summary контактов, номера/история + атрибуция и coarse geo; нет полного JSON концепции.
- Боты: отдельное `🤖 Робот посетил SITEVL`; проверенный Google-InspectionTool — `🤖 Google проверяет SITEVL`. Без human ID, города человека или raw UA/IP.
- Бот cooldown: не чаще одного сообщения семейства за 30 минут. События family+page дедуплицируются по 30-минутным окнам; отдельный rate limit 120/min. Общий существующий Telegram limit 120/hour сохранён. Это cooldown, не отложенный агрегирующий Telegram job.

## Redis и миграция

Новые human metadata/funnel flags записываются **в той же транзакции V2**, что и история, не отдельной несогласованной dual-write.

| Namespace | Назначение / retention |
| --- | --- |
| `sitevl:visitor:v1:*` | Существующие profiles, history (100), pages, experiment sets, binding, event dedup, rates, index; по умолчанию 180 дней, как раньше |
| `sitevl:visitor:v2:*` | Существующие identities, session numbers, sequences, notifications, lead dedup, optional network assist; sequences не истекают и не сбрасываются |
| `sitevl:visitor:v3:stats` | Новый фиксированный hash с `since`, human/bot/ad/funnel агрегатами; без персональных значений, без TTL |
| `sitevl:visitor:v3:bots:recent` | До 100 записей, 7 дней |
| `sitevl:visitor:v3:bot-dedup:*` | Family+path+30-min bucket hash, TTL 30 минут |
| `sitevl:visitor:v3:bot-notify:*` | Family cooldown, TTL 30 минут |
| `sitevl:visitor:v3:bot-rate:*` | Технический rate counter, TTL 120 секунд |
| `sitevl:site:*`, `sitevl:lab:*`, AI leads | Прежние namespaces и данные сохранены |

V3 counters: humanVisits, uniqueHumanVisitors, knownBotVisits, likelyBotVisits, paidAdHumanVisits, paidAdUniqueVisitors. Human unique — за жизнь retained profile, не вечная уникальность человека. Bots — family/page observations после dedup, не количество физических роботов/всех запросов.

Исторические значения публичных SITE/LAB counters **не переписываются**: старую статистику нельзя достоверно очистить от ботов задним числом. Новые POST фильтруются. V3 начинает собственный период `since`; старые номера не перенумеровываются.

## Воронка и owner API

Агрегаты по одной атрибутированной сессии (каждый шаг максимум один раз):
`ad_visit → view_services / view_cases / view_prices / open_contacts → telegram_click / whatsapp_click / brief_start / brief_complete → lead_created`.

Отдельно сохранена последовательная история. `brief_start` — первый реальный выбор в существующем Brief; значения выбора не отправляются в аналитику. `brief_complete` не равен заявке. Нажатие messenger не означает отправку сообщения. `lead_created` возникает только после существующего server-side сохранения lead и подтверждённой session binding.

SPA: существующий navigation key + path, стабильные event IDs и серверная дедупликация; rerender/resize не являются page views. Для engagement/contact — один очищаемый listener, allowlist категории, никаких текстов/координат/клавиш.

Read-only: существующий `/api/visitor-owner?view=traffic`, только с корректным Bearer `VISITOR_OWNER_API_TOKEN`. Без секрета endpoint остаётся 404, без авторизации — 401. Публичная CRM/аналитическая страница не создавалась. На production owner secret до этой задачи отсутствовал; он не создавался автоматически. Для будущего приложения владелец может самостоятельно добавить этот server-side secret и использовать защищённый backend, не класть токен в публичный frontend.

## Privacy и безопасность

Обновлена существующая policy `src/data/legal.ts`: псевдонимность, coarse network geo, campaign transfer, эвристическая классификация и retention. Не собираются fingerprint, GPS, raw IP/UA в истории, cookies, введённые до отправки тексты/ответы, произвольные query, содержимое внешних messenger links. Механизм подписанной атрибуции не является защитой от воспроизведения рекламной ссылки и не доказывает личность.

Входные данные ограничены 4096 байт, event/detail allowlist, нормализация public path, session binding/dedup, существующие memory/Redis rate limits. Никакого публичного reset/QA endpoint. Тестовый браузерный сервер находится вне репозитория, только loopback, использует отдельный disposable Redis, без production secrets.

## Проверки до релиза

- `npm test`: **179 PASS, 0 fail, 0 skip** (включая 12 новых групп V3).
- `npm run lint`: PASS.
- `npx tsc -b --pretty false`: PASS.
- `npm run build`: PASS.
- SEO generation / prerender: **73 sitemap URLs, 87 HTML**.
- SEO audit: **73 indexable + 14 noindex PASS**.
- `git diff --check`: PASS.
- `npm audit`: **0 vulnerabilities** после узкого обновления существующего Browserslist 4.28.5 → 4.28.9 и его транзитивных данных; добавлен официальный `@vercel/functions@3.9.5` для middleware.
- Vite сообщает прежние предупреждения chunks >500 kB; не ошибка сборки и не предмет рефакторинга этой задачи.

Тесты используют настоящий изолированный Redis через Unix socket (без TCP/persistence). Telegram в unit/integration тестах перехватывается локально, это не доказательство доставки реального сообщения. Проверены signed redirect/path/query/cookie, explicit-other-source, поддельный/просроченный token, все crawler families, обычное чтение, reverse+forward DNS/timeout/cache/spoof, coarse geo/invalid/missing, отсутствие bot human numbers, публичные SITE/LAB guards, paid funnel dedup, возвращение/late attribution, lead linkage, owner auth, клиентские allowlists.

Браузерный локальный QA подтвердил: настоящий интерфейс открывается без page errors, SPA-переходы главная → услуги → кейсы → цены → контакты → LAB принадлежат одному visitorNumber / session, paid источник сохраняется; счётчики шагов не дублируются. Полная фиксация lead выполнялась только в изолированном тесте, не в production.

## Production release / QA

Заполняется фактическими результатами после Git release. Локальный PASS не считается подтверждением deployment или реальной Telegram-доставки.

## Первичные источники

- Google, проверка crawler requests: https://developers.google.com/crawling/docs/crawlers-fetchers/verify-google-requests
- Vercel, доверенные request headers / geo: https://vercel.com/docs/headers/request-headers
- Vercel, Routing Middleware API / Node runtime / waitUntil: https://vercel.com/docs/routing-middleware/api
