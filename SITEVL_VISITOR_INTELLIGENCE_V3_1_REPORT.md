# SITEVL Visitor Intelligence V3.1

Дата: 8 сентября 2026. Проект: существующий `ay-digital-ru`, основной домен `https://sitevl.tech`.

## Статус и границы доказательств

Реализация и локальная проверка **PASS**. Публикация **BLOCKED: исходящее HTTPS/TLS-соединение с GitHub/Vercel перестало работать во время push**. Production QA **NOT TESTED**. Это не заявление о завершённом production PASS.

ZIP с реальными Telegram-уведомлениями не был приложен к доступным материалам: доступны два текстовых ТЗ. Поэтому анализ реальной выгрузки **BLOCKED — нужен ZIP**. Числа из ТЗ не выдаются за результаты самостоятельного анализа. Regression fixtures синтетические, без копирования реальных visitor records. Посетитель №69 из предыдущего отчёта V3 — контролируемая QA-запись, а не подтверждённый клиент; в калибровку реальных клиентов он не включался.

## 1. Причины завышения V3

- `_trafficPolicyV3.mjs` назначал обычному browser User-Agent `likely-human` сразу.
- Встроенный V3 Lua увеличивал human/unique counters для каждого принятого браузерного визита; единственный `engagement` повышал статус до `human`.
- V2 создавал visitNumber при появлении нового технического sessionId. Проверки 30-минутной неактивности не было.

Номер анонимного visitor отражает последовательность регистрации браузерных ID, **не число доказанных людей**. Смена устройства, очистка localStorage и другой origin могут дать другой ID. Объединение по IP, fingerprint или реальной личности не используется.

## 2. Аналитические сессии и совместимость

Существующие visitor IDs и V2 sequence keys сохранены. Технический sessionId вкладки остаётся валидным для старых клиентов и AI lead linkage.

- `v31ActiveVisit` и `v31LastActivityMs` в существующем профиле определяют активную аналитическую сессию.
- Перерыв **не более 1 800 000 ms**, включая ровно 30 минут: тот же visitNumber. Более 30 минут: следующий visitNumber и sessionNumber.
- Сервер использует собственное время; клиент не может передать timestamp, номер визита или score.
- Новая вкладка того же visitor разрешается на ту же активную сессию внутри существующего атомарного EVAL. Одновременные запросы не удваивают номера.
- V2 technical-session hash сохраняет исторические visitNumber/sessionNumber. В него добавляется только `v31AnalyticsKey`; readVisitor и lead linker разрешают этот alias с проверкой visitor binding.
- Старый профиль с недавним `lastVisitNumber` лениво присоединяется к тому же номеру; старый source/подписанная атрибуция берутся из связанной сессии. Массовой миграции нет.
- Повтор eventId/start одной вкладки и неизменившийся агрегат поведения не продлевают окно активности. Старые V3 engagement совместимы, но не повышают human score и не продлевают активность.
- Исторический счётчик sessions не переписывается. Старые записи без score показываются через owner reader как `legacy-unknown`, пока не поступит новый сигнал.

## 3. Human confidence: централизованные правила

Источник весов: `api/_visitorConfidenceV31.mjs`, `CONFIDENCE_RULES`. Баллы — объяснимая эвристика, **не статистическая вероятность**.

| Признак | Баллы / условие |
|---|---|
| Новый browser | 35, `unknown` |
| Видимое время: <10s / 10–30s / 30–120s / 2–5m / 5m+ | 0 / +3 / +10 / +15 / +18 |
| Две / три и более разные страницы | +7 / +15, без дальнейшего роста |
| Любая категория pointer/touch/keyboard | +8 суммарно |
| Переход по внутренней ссылке | +7 |
| Фокус в форме | +5, без содержимого поля |
| Ступень прокрутки | +3 максимум |
| Возврат после перерыва не менее часа | +8 |
| Обычный похожий burst | −5 |
| Похожий Linux burst без independent behavior | −25 |
| Burst по включённому network HMAC без independent behavior | −30 |
| Регулярный/быстрый обход многих страниц без independent behavior | −45 |
| Не менее 6 сессий/24h вместе с 8+ страницами и регулярным обходом | −15 |
| 100+ исторических сессий вместе с текущим обходом | −5 |

Пороги: 0–24 `likely-bot`, 25–59 `unknown`, 60–79 `likely-human`, 80–100 `human`. До 30 секунд наблюдения score ограничен сверху 59. Dwell bucket ограничен также временем, реально прошедшим на сервере с начала V3.1-наблюдения. Только видимость и клики не являются доказательством: автоматизация умеет воспроизводить такие сигналы.

`independent behavior`: категория взаимодействия + внутренняя ссылка + видимость 30s+ + минимум 3 страницы + серверное наблюдение 30s+. Это снимает burst-понижение, но не устанавливает личность. Само число возвращений, город, VPN, Google referrer и рекламная метка не объявляют visitor ботом или человеком.

Reason codes: `insufficient-evidence`, `visible-dwell`, `multiple-pages`, `interaction-category`, `visible-link-navigation`, `form-focus`, `scroll-milestone`, `return-after-gap`, `cohort-burst`, `linux-burst`, `network-burst`, `independent-behavior-after-burst`, `sequential-traversal`, `high-session-velocity`, `legacy-volume-with-traversal`, `short-observation`. Для непросчитанной истории — `legacy-no-score`. Подписи известных crawlers сохраняют существующие коды V3.

## 4. Burst, traversal и рекламные всплески

Скользящее серверное окно — 10 секунд, порог — 6 новых ID. Краткоживущая группа использует укрупнённые platform/browser из request UA, entry path, страну/регион и source/campaign. Это общая группа событий, не fingerprint и не identity. Сам raw UA не сохраняется. Если уже включён IP-assist, отдельная группа использует существующий HMAC; raw IP не записывается.

Первые ID не получают human counters автоматически. При появлении шестого формируется один burst alert с cooldown 30 минут; предыдущие участники учитывают burst при следующем событии. Первое unknown-уведомление ограничено одним на entry cohort/10-секундный bucket. Шесть рекламных iPhone без поведения остаются unknown, а независимое последующее поведение может квалифицировать каждый ID отдельно. Никакого merge по NAT или общей сети.

Traversal: минимум 12 разных страниц вместе с 10 быстрыми переходами (интервал ≤10s) либо 8 похожими интервалами (допуск max(250ms, 10%)). Сохраняются только агрегаты/последний интервал, не траектории мыши. Частые настоящие возвращения без текущего регулярного обхода не понижаются сами по себе.

Надёжного server-side ASN/datacenter источника в существующей архитектуре нет: он **не выдуман**. Council Bluffs, Ashburn, Colorado или VPN не являются bot rules.

## 5. Known crawlers

Сохранены сигнатуры Googlebot, Google-InspectionTool, Bing, Yandex, SEO/AI crawlers и прочей автоматизации. Проверенный Google crawler требует reverse **и** совпадающего forward DNS для доверенного Vercel request IP; score 0, `known-bot`. Простая подделка UA остаётся `likely-bot`, а не проверенным Google. Положительное подтверждение Bing/других семейств по одному UA не заявляется.

Crawler observations не получают visitorNumber и не входят в human/paid-human counters. Сохранены rate limit, family/page dedup 30 минут и family notification cooldown. Bot observations — не точное число отдельных роботов или всех HTTP requests.

Проверено по первичным источникам: [Google crawler verification](https://developers.google.com/crawling/docs/crawlers-fetchers/verify-google-requests), [Vercel request headers](https://vercel.com/docs/headers/request-headers), [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API).

## 6. Commercial interest

Отдельные `INTEREST_WEIGHTS`: услуги +5, кейс +10, цены +15, повтор цен +10 (не раньше 10 секунд между просмотрами), контакты +15, Telegram +20, WhatsApp +20, brief start +15, brief complete +30, сохранённая заявка +40, возврат после часа +10. Сумма ограничена 100; каждый вклад — не более одного раза на аналитическую сессию. Повторный просмотр цен — отдельный, тоже однократный вклад.

Категории: 0–19 normal, 20–39 interested, 40–59 warm, 60+ hot. Просмотр цены и CTA не дают human points сами по себе. Полная добровольная заявка связывается через прежний lead pipeline, visitorId и проверенную technical-session binding; новый endpoint или публичный CRM не создавались.

## 7. Telegram

- Новый/повторный неопределённый визит: `❔`, «недостаточно данных», пояснение про номер ID.
- Первое достижение human threshold в аналитической сессии: одно уведомление `👤`.
- Warm/hot: по одному уведомлению при достижении порога, только после достаточной human confidence; не на каждое изменение баллов.
- Ключевые события: цены, контакты, Telegram/WhatsApp, бриф, LAB/эксперимент, AI-концепт, реальная заявка. Вероятная автоматизация не получает коммерческие event notices.
- Burst: агрегированное предупреждение; known-bot notices сохраняются отдельно.
- Source/campaign, приблизительная сетевая география, устройство, номер аналитической сессии и компактный путь; время Asia/Vladivostok.
- Score не показывается как «вероятность человека N%». Interest отображается как баллы действий, не вероятность покупки.

Доставка использует существующие server-side `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`. В этой реализации новые secrets не нужны. Уведомления ограничены существующим лимитом 120/час. Семантика at-most-once: неуспешная отправка после claim автоматически не переотправляется, чтобы не создавать дубли; записи аналитики при этом сохраняются.

## 8. Счётчики, namespaces и retention

Используется тот же Redis и REST-клиент, без новой БД.

| Namespace / поле | Назначение / retention |
|---|---|
| `sitevl:visitor:v1:*` | Прежние профили, history/event/binding/index; 180 дней по умолчанию, история 100 событий; page set ограничен 200 для новых добавлений |
| `sitevl:visitor:v2:identity:*`, `*:session:*` | Прежние номера и совместимые technical aliases; прежний retention |
| `sitevl:visitor:v2:*sequence` | Прежние монотонные номера, без TTL/отката |
| `sitevl:visitor:v3:stats` | Неизменяемые V3 legacy totals, без ложного пересчёта |
| `sitevl:visitor:v31:session:<visitNumber>` | Состояние аналитической сессии, score/reasons, interest/reasons, geo/source; 180 дней |
| `v31:session:<visitNumber>:pages` | До 100 разных страниц сессии, тот же TTL |
| `v31:session-starts:<visitorId>` | Времена начала сессий за 24h; TTL 24h |
| `v31:burst:<coarse digest>` / `v31:network-burst:<HMAC>` | Короткое 10s окно новых ID, TTL 60s; HMAC не копируется в session/history |
| `v31:*:initial:<bucket>` / `v31:*:alert` | Unknown suppression 10s / burst cooldown 30m |
| `v31:notify:<visitNumber>:<action>` | Дедуп уведомлений по аналитической сессии |
| `v31:stats` | Новый epoch aggregate без TTL; `since` — первое наблюдение V3.1 |
| `v31:bot-rate:*`, `v31:bot-dedup:*`, `v31:bots:recent` | 120s / 30m / 7 дней, recent ≤100 |

V3.1 counters: `technicalVisits`, `humanVisits`, `uniqueHumanVisitors`, `unknownVisits`, `likelyBotVisits`, `knownBotVisits`, `paidAdTechnicalVisits`, `paidAdHumanVisits`, `paidAdUniqueHumans`. При изменении класса старая категория уменьшается, новая увеличивается в том же EVAL. Unique-human учитывает наличие хотя бы одной квалифицированной сессии сохранённого ID; при последующем понижении последней такой сессии вклад убирается. Dedup имеет границу retention, не обещает пожизненную уникальность.

Paid-human counters растут только при score ≥60. Рекламный funnel действий отдельно включает и unknown-визиты, что явно описано в owner summary. Legacy публичные SITE/LAB browser counters сохранены; это техническая активность, не доказанные люди. Исторические V3 totals возвращаются отдельно как `legacyV3Totals`.

Owner API прежний, read-only, deny-by-default при отсутствии токена. Публичный GET отдаёт только configuration/version, не visitor history, scores или внутренние причины. Служебные cohort/network ключи скрыты из owner visitor response. Доступная авторизованному владельцу агрегатная диагностика не требует просмотра raw visitor records.

## 9. Privacy, security, performance

Нет raw IP в Redis history/Telegram, fingerprinting, GPS, Canvas/WebGL/Audio/fonts идентификации, raw UA, текстов клавиш, содержимого незавершённых форм, координат, внешней истории браузера. Reserved source `paid-ad` нельзя установить клиентским payload: только подписанная server attribution.

Поведение собирается клиентом в allowlisted boolean categories и dwell/scroll buckets. PageVisibility исключает скрытое время. Проверка изменений раз в 5 секунд, отправка не чаще раза в 10 секунд и только при новом агрегате. Scroll listener только выставляет флаг; mousemove listener отсутствует. Timer/listeners удаляются при unmount. SPA events привязаны к navigation key, не к rerender/resize. Память клиентского наблюдения сбрасывается после неактивности; server остаётся источником session boundary.

Строгий event allowlist, JSON payload ≤4096 bytes, запрещены client scores/geo/timestamps/numbers/Redis keys. Rate limit 40/session/min, 600 global/min, optional 240/network/min. Для Redis session rate исправлен фиксированный минутный bucket, чтобы непрерывный нормальный поток не блокировался навсегда после первых 40 событий. Публичные страницы работают независимо от недоступности аналитики; frontend errors проглатываются, API даёт безопасный generic fallback.

Privacy policy обновлена только под реализованные данные. Секреты не добавлялись в код, Git, frontend или VITE-переменные.

## 10. Проверки

- Финальный release gate: **196/196 тестов, 0 skipped**, `npm run lint`, `npx tsc -b --pretty false`, `npm run build`, `git diff --check` — PASS. Реальный disposable Redis, включая 16 групп V3.1; не mock всей системы. Тесты повторно завершились 196/196 после commit.
- Подтверждены 29/30/31-minute границы, concurrency/new tabs, legacy fallback/номера, immutable V2 historical number, duplicate inactivity, behavior elapsed cap, score spoof rejection, Linux/network burst, рекламные iPhone, переходы counters/Telegram, paid attribution, Google DNS и timeout, organic Google, geo weak signal, 50-page traversal, capped interest, lead alias/дедуп, visibility/batching/cleanup, Redis failure.
- Дополнительный изолированный тест production-QA cleanup: неверный owner guard останавливает удаление; правильный cleanup удаляет только свой вклад и сохраняет чужой профиль/sequence.
- Живой локальный браузер: Главная → Кейсы → Цены, один visitor/одна сессия; unknown → likely-human; score 75, interest 25, paid-human flag. Никакие production записи не использованы; Telegram перехвачен локально.
- На viewport 390px: content width 390px, overflow отсутствует, console errors/overlay отсутствуют.
- Сборка/SEO: 73 sitemap URLs, 87 prerendered HTML, 73 indexable +14 noindex. Известное предупреждение Vite про тяжёлые существующие chunks не скрывалось.

## 11. Production QA / release

Кодовый commit: `c2a7558a4ccac9d142d78d95ff769f1e95adb69b`.

Перед push подтверждены `.vercel/repo.json` и Vercel API: существующий проект `ay-digital-ru`, ID `prj_REyqEPemqb3DbzgR2z7PMPJv0FsL`, Node 24.x, Vite, Git integration `ay-digital.ru`. CLI авторизация работала. Никакой новый проект не создавался.

`git push origin main` завершился exit 128: `LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to github.com:443`. Отдельные ограниченные по времени HTTPS-проверки GitHub API, Vercel API и `sitevl.tech` вернули timeout/HTTP 000; повтор по IPv4 также не установил SSL. Подключённый Vercel reader не дал результата в ограниченный интервал. Изменения VPN/DNS/прокси или системных защит не выполнялись.

Последнее подтверждённое перед потерей связи production deployment: `dpl_T7Q5YX4n8abgSeDZRDqptk7JySb2`, старый V3 commit `8fb650d56a8c4f8c34043d2e274b3aea3ee62be9`. Это **не deployment V3.1**. Новый deployment ID отсутствует. Локальный `origin/main` остаётся на указанном старом SHA; актуальное удалённое состояние после сетевого сбоя проверить не удалось.

Production V3.1, Telegram delivery, Redis confidence transitions и новая cleanup-проверка в production **NOT TESTED**. Никакие production QA visitors/leads в этом ходе не создавались. Реальные visitor/lead данные, LAB counters, старые totals и последовательности не удалялись и не пересчитывались.

Подготовлен отдельный QA-сценарий вне Git: `/tmp/sitevl-v31-production-qa.mjs`. Он создаёт 7 собственных UUID visitors (обычный рекламный +6 burst), проверяет API/Redis и реальные Telegram send statuses, затем атомарно удаляет только подтверждённые собственные записи и их вклад. Перед cleanup проверяются ownership/binding, полнота списка сессий и отсутствие leads; sequence keys не меняются. Локальный тест этого cleanup прошёл. Для границ 29/31 минут скрипт сдвигает только серверное поле неактивности своего QA-профиля: это seeded boundary test, **не заявление о реальном 31-минутном ожидании**. Реальные лиды не отправляются; положительный Google DNS сценарий проверен изолированно без подделки production IP.

После восстановления соединения: повторно проверить remote main → push существующих локальных commits → дождаться READY того же проекта → выполнить контролируемый QA и cleanup → проверить `/`, `/services`, `/prices`, `/cases`, `/lab`, старую рекламную ссылку, API конфигурацию, canonical/sitemap/robots → дополнить этот отчёт фактическими production результатами. Telegram secrets уже были настроены на сервере; их повторная передача в чат не нужна.

## Остаточные ограничения

Без реального ZIP веса ещё не сверены с приложенной историей. Правила различают наблюдаемые паттерны, но не гарантируют распознавание сложной автоматизации: она способна имитировать обычный браузер и meaningful behavior. Burst первых участников пересчитывается по следующему событию, а не массовым обновлением всех профилей. Общее NAT/geo не устанавливает личность. Надёжный ASN risk отсутствует. Наличие отправки Telegram API не подтверждает прочтение сообщения владельцем. Cookie рекламной атрибуции имеет прежний срок 30 минут; старые origin localStorage автоматически не объединяются.
