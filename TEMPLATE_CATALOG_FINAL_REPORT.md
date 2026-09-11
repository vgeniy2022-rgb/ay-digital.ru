# Каталог дизайнов SITEVL — финальный отчёт этапа 8/8

Дата: 11 сентября 2026. Репозиторий: `/Users/aleksandrasineckij/Documents/ay-digital.ru`.

## Итог

### Актуальное решение: Telegram OPTIONAL / DEGRADED

По последнему указанию владельца Telegram не является release gate. Обязательный production-target E2E повторён: Private Blob upload, Redis lead, snapshot, dedup, owner API (401 без/с неверным Bearer), изображение/SHA-256 — PASS. В сохранённой заявке `telegramNotification:false`; клиент получает успешное сохранение без ошибки Telegram.

В Chromium открыт настоящий сохранённый project snapshot через существующий owner renderer; изображение прочитано из Production Private Blob через защищённый временный QA bridge. Заголовок, тема, изображение, ширины 390/1440 и закрытие доступа — PASS, 0 browser exceptions. Frontend для этой проверки локальный, данные и owner API настоящие production; это не тест физического iPhone. QA lead/blob удаляются адресно, visitor records не создавались.

Release gate: 250 tests PASS в рабочей копии; точная изолированная release-копия — 239 tests PASS (11 тестов посторонней переделки Globe/X-RAY не включены). Lint, TypeScript, build, diff check, SEO generation/prerender/audit PASS (104 indexable, 14 noindex, 118 HTML). Каталог содержит 30 готовых дизайнов. В release не включена незавершённая переделка WebStudio/Globe/X-RAY из рабочей копии. QA lead/blob cleanup подтверждён; остался только временный одноразовый QA lock с TTL 3 часа, без пользовательских данных.

Исторические STOP/BLOCKED ниже описывают прежнее требование обязательного Telegram и больше не блокируют release. Токен, бот и Telegram configuration не изменялись. Финальные commit/deployment и live smoke фиксируются в итоговом ответе после публикации.

### Production QA 12 сентября — STOP: Telegram FAIL

Sensitive secrets не извлекались через env pull/env run и не копировались локально. Создан production-target deployment **без переключения основного домена**: `dpl_51G1RdUXM66KC2ppcspVKhRzBKAX` (временный QA, не финальный релиз).

| Проверка | Фактический результат |
|---|---|
| Production capability `/api/ai-leads` | configured:true; templateCatalog configured:true, blobConfigured:true, ownerConfigured:true |
| Настоящая загрузка QA PNG → private WebP Blob | PASS |
| Настоящий QA template lead в Redis | PASS |
| Повторная finalize → dedup | PASS |
| Snapshot: страницы и theme совпали | PASS |
| Owner API: без Bearer / неверный Bearer | 401 / 401, PASS |
| Owner API: серверный настоящий owner token | PASS, ключ не возвращался клиенту |
| Изображение через owner API, SHA-256 | PASS |
| Telegram summary | **FAIL**: результат отправки не `sent`; runtime вернул `failedPhase:telegram` |
| Визуальный owner renderer в этой production QA | NOT RUN: остановка после Telegram FAIL; ранее локально проверен |
| QA lead и Blob cleanup | PASS: SDK удаления завершился; точные Redis lead/pending keys отсутствуют после cleanup |
| QA visitor/event records | Не создавались; реальные Visitor Intelligence/LAB records не изменялись |
| Финальные commit/push/deploy | НЕ выполнялись |

Тест выполнял существующие production handlers с настоящими server-side Blob/Redis/Telegram integrations, без подмены этих провайдеров. Во временной копии отключался только opportunistic retention cleanup при QA, чтобы не удалить чужие истёкшие записи. При ошибке Telegram заявка осталась сохранённой до явного QA cleanup, то есть ложный успешный E2E не выставлялся. Причина отказа Telegram (transport/API/доставка) этим безопасным ответом не установлена; наличие конфигурации не доказывает отправку. Повторные уведомления не отправлялись.

Одноразовый QA flow был ограничен одной фиксированной QA-заявкой, отдельным случайным ключом (сервер хранил только hash), сроком 3 часа и rate/one-run gate. Произвольные lead ID, Redis keys и Blob paths клиент не выбирал. После cleanup доступ закрыт. Короткоживущие служебные QA gate keys имеют TTL 3 часа; их не следует путать с заявками/visitor records. Обычные server rate-limit counters не сбрасывались. QA endpoint отсутствует в основной рабочей копии и удалён из временной исходной копии перед завершением.

Полный локальный gate текущей рабочей копии: **242/242 PASS**. Отдельная точная релизная копия без посторонних Web Studio/globe/X-RAY изменений: **231/231 PASS**, lint/build/TypeScript/SEO PASS. Разница 11 тестов относится к исключённым посторонним тестам. 30 дизайнов готовы локально; 104 indexable / 14 noindex / 118 prerender HTML. Новая версия каталога не опубликована на основном домене.

Основной `sitevl.tech` сохранил предыдущий `dpl_Anhgm68XAGQmMakTipLLyvzD15Bp`, GET главной 200. Rollback вернул 422 «already current production deployment», подтверждая отсутствие переключения. Служебный alias `ay-digital-ru-vgeniy.vercel.app` явно возвращён к прежнему READY; DNS и два старых рекламных адреса не менялись. Затем Vercel подтвердил **Removed 1 deployment** для точного временного `dpl_51G1RdUXM66KC2ppcspVKhRzBKAX`: QA endpoint удалён вместе со сборкой. Локальный одноразовый QA secret также удалён; значения production secrets не извлекались и не раскрывались.

Последующие разделы сохраняют историю предыдущих шагов, а не актуальный статус отсутствия secrets.

### Повторная проверка Production secrets: 12 сентября 2026

Обе переменные теперь **присутствуют** в существующем Vercel project: `BLOB_READ_WRITE_TOKEN` — Production/Preview, `VISITOR_OWNER_API_TOKEN` — Production; обе имеют тип Sensitive. Значения не выводились. Read-only API подтвердил существующий deployment READY без изменений.

Предрелизный локальный запуск через `vercel env run -e production` показал `blobConfigured:false`, `ownerConfigured:false`: Sensitive-переменные недоступны этому локальному процессу. Проверены только булевы состояния; в локальном gitignored `.env.development.local` эти переменные также отсутствуют. Это **не отсутствие конфигурации в Vercel**, а недоступность credentials локальному E2E. Предыдущее предположение, что env run достаточно для Sensitive, исправлено в инструкции настройки.

Реальные upload/lead/owner/Telegram проверки не запускались, тестовых production records не создавалось. Cleanup не нужен. Release gate в этом ходе не повторялся, предыдущие 242 PASS остаются результатом локального прогона без production secrets. Commit/push/deploy не выполнялись. Подготовлены 30 дизайнов, новая версия каталога этим ходом не опубликована. Следующий шаг — безопасно предоставить значения только локальному серверному окружению либо отдельно согласовать закрытый тестовый deployment без переключения основного домена. Production E2E по-прежнему не подтверждён.

### Дополнение: подготовка без секретов, 11 сентября 2026

- Подготовлена простая инструкция `SITEVL_TEMPLATE_CATALOG_VERCEL_SETUP.md`; `.env.example` содержит пустые `BLOB_READ_WRITE_TOKEN=` и `VISITOR_OWNER_API_TOKEN=`. Значений секретов нет.
- Существующий GET `/api/ai-leads` сохраняет совместимость; в `templateCatalog` добавлен булев `blobConfigured` (старый `filesConfigured` сохранён). POST без настроек возвращает HTTP 503, `configured:false`, пояснение и никакого обращения к хранилищу. Наличие настроек не равно проверке credentials.
- Owner Bearer теперь обязателен: голое значение, Basic, добавленные слова и неверный ключ не авторизуют. Сравнение через `timingSafeEqual`; без owner-конфигурации API возвращает 404. Ключ вводится владельцем в password-поле только для текущего открытия, не встраивается в bundle и не сохраняется в URL/IndexedDB/localStorage.
- В read-only owner-preview добавлено раскрытие visitor ID и рекламной кампании/меток с указанием основания атрибуции. Визуальный renderer, версия, тексты, цвета, секции, фото, контакты, бюджет/срок и закрытый пакет сохранены.
- Адаптер Blob до вызова SDK проверяет свой узкий путь `template-leads/<uuid>/<safe-asset>.webp`. Удаление допускает только точный префикс одной отправки. Чужие пути, URL, traversal и широкое удаление запрещены. PUT private, без overwrite; изображения декодируются Sharp и перекодируются в WebP без исходных метаданных.
- Автотесты: **242/242 PASS, 0 skipped**. Покрыты отсутствие конфигурации, Blob mock, загрузка, MIME/размер/поддельный SVG, auth, сериализация, связи assets/lead/visitor, атомарная дедупликация, ошибки Redis/Blob/Telegram и ограниченный cleanup. Doubles остаются в test harness, production использует настоящий SDK. Обнаружено и исправлено отсутствие обязательного Bearer-префикса.
- Повторная browser QA: **150/150** (30 настройщиков × 320/390/768/1024/1440), все пять панелей, длинный текст, reload, отсутствие overflow/noindex; **30/30** полных циклов на 390 px с фото+логотипом, цветами/шрифтами, ценой услуги, перестановкой/скрытием секций, undo/redo, подтверждённым reset, reload и GC локальных orphan assets. Каждый полный цикл дополнительно проверяет реальные iframe widths 390/768/1440, не уменьшенную картинку.
- Повторены три браузерные заявки → существующие API handlers → изолированный Redis → owner renderer → ZIP. Blob/Telegram здесь **тестовые адаптеры**, не настоящие SaaS. Проверены ошибки с повтором, отсутствие дублей, соответствие проекта и SHA-256 фото. Реальное server-storage E2E остаётся **BLOCKED**.
- Повторены каталог на пяти ширинах, все 30 карточек/slug/обложек/детальных страниц и семь основных публичных маршрутов. В каталоге нет смонтированных iframe/30 проектов; выбранная страница загружает один data chunk, Studio editor подгружается отдельно. Все исходные изображения декодируются. Проверка bundle не нашла имён серверных credentials и строк test harness; реальные значения секретов не читались, поэтому сравнение с ними не заявляется.
- Эмуляция Chrome: 390 px, download 2 Мбит/с, upload 1 Мбит/с, latency 150 ms, cache disabled — каталог и фильтр работоспособны, 4.503 с до проверенного результата, JS errors 0. Это локальная эмуляция, не российская мобильная сеть и не физический iPhone. Первая ошибочная проверка ожидала один результат от общего слова «фотограф»; исправлена проверка сочетания поиска и фильтра, код каталога не менялся.
- Финальные `npm test`, lint, TypeScript, build, `git diff --check` — PASS. Генерация SEO/sitemap/prerender/audit — **104 indexable, 14 noindex, 118 HTML**. Существующее предупреждение крупных shared/Studio chunks (~542/~665 КБ) остаётся; все 30 проектов не попали в начальную загрузку главной.
- Репрезентативные реальные browser screenshots проверены: owner 320, настройщик фотографа 390, desktop 1440. Скриншоты не выдаются за аппаратную проверку iPhone. Результаты дополнительных прогонов: `/tmp/sitevl-presecrets-{matrix,full}/results.json`, `/tmp/sitevl-task8-lead-qa/results.json`, `/tmp/sitevl-presecrets-network.json`; итоговые логи `/tmp/sitevl-presecrets-*-final.log`.
- Production, DNS, реальные данные и secrets не изменялись. Commit/push/deploy не делались: в working tree есть посторонние незавершённые Web Studio изменения. Ни одной настоящей QA-записи/Blob-фотографии этим прогоном не создано, production cleanup не выполнялся. Далее — только добавление credentials владельцем, настоящая предрелизная проверка и затем публикация.

**Локальная реализация и QA — PASS. Финальная публикация — STOP: реальный Telegram E2E не прошёл. Blob и owner secrets присутствуют.**

Полный production PASS не выставлен. Commit, push и deployment НЕ выполнены: пользователь прямо потребовал остановить публикацию, если нельзя подтвердить сохранение заявки и просмотр владельцем. Локальная эмуляция внешнего хранилища не выдана за рабочий Vercel Blob.

## Подтверждённый production

Проверено настоящими GET-запросами, авторизованными Vercel CLI 59.16.0 / API (read-only):

- Хостинг: **Vercel**, существующий проект `vgeniy/ay-digital-ru`, ID `prj_REyqEPemqb3DbzgR2z7PMPJv0FsL`.
- Подключён GitHub `vgeniy2022-rgb/ay-digital.ru`, production branch **main**, Node **24.x**, framework **Vite**.
- Текущий, ранее опубликованный deployment: `dpl_Anhgm68XAGQmMakTipLLyvzD15Bp`, **READY**.
- Его URL: [ay-digital-m3ifinwg9-vgeniy.vercel.app](https://ay-digital-m3ifinwg9-vgeniy.vercel.app).
- Основной адрес: [sitevl.tech](https://sitevl.tech/), GET **200**.
- [ay-digital-ru.vercel.app](https://ay-digital-ru.vercel.app/) — GET **200**.
- [sitevl-ru.vercel.app](https://sitevl-ru.vercel.app/) — существующий **307** через подписанный перенос рекламной метки на основной домен; конечный GET **200**. Саму метку в отчёт не копируем.
- В действующих aliases также остаётся `www.sitevl.tech`. DNS/aliases/redirects не изменялись.
- Текущий локальный HEAD: `b4f6473`. Remote main при проверке: `f5ca23c68485028fc3dfa3ef569b73ccbc6e8907`. Два локальных более новых коммита добавления/удаления Radar дают **нулевой net diff** относительно remote main. Историю не переписывали.
- `.vercel/project.json` отсутствует; автоматического link/create не делали. Проект проверен по реальному CLI/API, не только по старым отчётам. Подключённый Vercel MCP не предоставил проект (403), но существующая CLI-авторизация позволила выполнить read-only проверки.
- GET главной, /services, /prices, /cases, /sitemap.xml, /robots.txt — успешны; canonical публичных страниц остаётся на `https://sitevl.tech`.
- GET /api/ai-leads в текущем production возвращает старую конфигурацию `configured:true`, `storage:private-redis`, `telegramConfigured:true`, **без templateCatalog**. Это не подтверждение готовности нового каталога. Anonymous-запрос закрытого template-owner варианта в текущем production дал 404.

**Нового commit/deployment этого этапа нет. Указанный deployment — существующий, не результат нынешней работы.**

## Почему публикация остановлена

Список Production-переменных сверён через Vercel API и CLI. Redis и Telegram уже подключены. Отсутствуют:

| Переменная | Для чего |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | Сохранение загруженных фото в закрытом Vercel Blob |
| `VISITOR_OWNER_API_TOKEN` | Авторизованное открытие полного проекта и изображений владельцем |

В Preview обе переменные также отсутствуют. Локальные env-файлы не содержат runtime-настроек этого потока. Незашифрованные значения существующих production-секретов не извлекались, env pull не выполнялся.

Что сделать владельцу **без передачи ключей в чат**:

1. Открыть [существующий проект в Vercel](https://vercel.com/vgeniy/ay-digital-ru).
2. В Storage подключить **Private** Blob store к этому проекту. Если подходящего store нет — создать именно Private, не Public. Новую Redis database создавать не нужно.
3. Убедиться, что `BLOB_READ_WRITE_TOKEN` доступен серверу в **Production**. Ключ Public store не подходит.
4. В Settings → Environment Variables добавить `VISITOR_OWNER_API_TOKEN` для **Production**: длинный случайный секрет, сохранить у себя. Никакого префикса VITE_.
5. Для изолированного live-предрелизного теста при необходимости подключить те же разрешённые настройки к Preview либо явно разрешённому локальному server runtime. Не перезаписывать локальные env целиком.
6. После сообщения о готовности повторить настоящую проверку prepare/upload/finalize и авторизованного скачивания файлов; только затем commit/push/main и существующий deployment.

Сначала необходимо доказать **реальную** работу Blob + Redis + owner API. Одного `configured:true` для снятия блокировки недостаточно.

## Исправления этого этапа

Новых пользовательских функций нет.

1. В `designs/compositions.css` исправлен конфликт специфичности мобильных правил: у одежды и базы отдыха текст hero имел отступ **0 px**, у логистики обнулялся отступ от линии. В 390 px теперь боковые отступы одежды/базы **23.39 px**, внутренний отступ логистики **18 px**. Композиции и данные не заменены.
2. В `styles/studio.css` устранено перекрытие кнопок Studio встроенным заголовком Puck. Существующая панель Puck занимает отдельную строку; «Предпросмотр» снова доступен настоящим кликом и открывает сохранённый проект.
3. Добавлен `scripts/qa-template-layout.mjs`: повторяемая браузерная регрессия этих дефектов. Работает только с loopback preview, блокирует API-запросы, не использует production данные и не устанавливает зависимостей.

SHA-256 сравнение с начальным снимком 205 изменённых/новых файлов подтвердило сохранность остальных файлов. Все исходные 30 проектов, изображения и обложки сохранены; чужие Web Studio/глобус/X-RAY изменения не откатывались и не включались в публикацию. Новая отдельная правка Studio CSS относится к обнаруженной регрессии.

## Браузерная матрица

Проверка — автоматизированный **Chrome / Playwright на Mac**, с реальной шириной страницы/iframe. **Не физический iPhone, не Safari.**

| Проверка | Результат |
|---|---|
| 30 демонстраций × 390 / 1440 px | **60/60 PASS**; повторены после CSS-исправлений |
| Настройщики всех 30 × 320 / 768 / 1024 px | **90/90 PASS**; все пять вкладок, длинный заголовок, reload, noindex, геометрия |
| Каталог 320 / 390 / 768 / 1024 / 1440 px | **5/5 PASS**; 30 карточек, поиск, фильтры, сброс, декодирование обложек |
| 30 деталей → персональная копия | **30/30 PASS**; ID/дизайн/H1 соответствуют, одна data chunk |
| Расширенная настройка трёх ниш × 320/768/1024 | **9/9 PASS** |
| Полный путь заявки с owner replay | **3/3 PASS локально**, см. границу ниже |
| Регрессия отступов на пяти ширинах + реальный Studio popup | **16/16 PASS** |
| Главная, услуги, цены, кейсы, LAB, AI Website, Studio | HTTP 200, основной контент, нет JS page errors |
| Studio | создание проекта → название → reload → реальный preview → возврат к тому же проекту |
| Загрузка каждого изображения в демонстрациях | decode успешно, отсутствующих файлов не обнаружено |
| Меню / якоря / FAQ / фильтры / демо-формы | работают; демо не отправляет заказ или запись |
| Горизонтальное переполнение | не обнаружено в проверенных оболочках, панелях и содержимом iframe |

Рассмотрены реальные кадры всех 30 первых экранов в desktop/mobile и дополнительные кадры форм/настройщиков/владельца. Автоматическая проверка контраста CTA, фильтров и дисклеймеров на однотонных фонах не нашла контраста ниже 4.45:1; области поверх фотографий проверялись визуально, не считаются полным WCAG-аудитом.

Расширенный настройщик: текст, палитра, светлая/тёмная тема, акцент, шрифты, кнопки, скругления, цена услуги, скрытие/перестановка, фото + логотип, undo/redo, сохранение отдельных Blob в IndexedDB, reload, отмена сброса, подтверждённый сброс и его undo, повторный вход в ту же копию. Переключения размеров меняют настоящий iframe, а не масштабируют картинку.

## Три сквозных сценария и граница доказательств

| Дизайн | Ширина | Результат |
|---|---|---|
| Салон красоты | 320 | PASS локально |
| Логистическая компания | 768 | PASS локально |
| Аренда катера | 1024 | PASS локально |

В каждом: каталог → выбор сферы + поиск → карточка → изменение заголовка/компании/палитры/акцента → фото → перестановка → reload → согласие и заявка → ошибка файлового адаптера → reload с сохранёнными полями и черновиком → успешный повтор → ещё одна отправка без дубля → неверный owner key отклонён → верный owner key → визуальный replay → ZIP → закрытие доступа.

Подтверждено:

- Одинаковые template ID, название, версия **1.0.0**, выбранный пакет и его текущая цена из единого прайса.
- Все страницы/блоки, порядок, тексты и ссылки на asset IDs в сохранённом проекте совпали с JSON-снимком клиента; theme совпала полностью.
- Пользовательское изображение отобразилось после reload и у владельца. Размеры совпали; файл в owner ZIP имеет тот же SHA-256, что фактически сохранённые серверным адаптером байты.
- После сбоя загрузки нет ложного успеха и потерянного черновика.
- После повторной отправки в изолированном Redis ровно **одна** заявка, тот же reference, одно уведомление в тестовом адаптере.
- Неверная/отсутствующая авторизация не открывает контакт/проект/файл. Ключ не сохраняется в localStorage/sessionStorage или ZIP.

Использованы **настоящие обработчики существующих API + отдельный настоящий Redis через Unix socket**, но **тестовые адаптеры приватных файлов и Telegram**. Browser routing связывал эти локальные обработчики с UI. Это не живой Upstash/Vercel Blob, не production serverless HTTP и не получение Telegram на устройстве. Production заявки, статистика и файлы не читались и не удалялись. Временный Redis закрыт механизмом test teardown.

## 30 готовых дизайнов

Все строки ниже — **локально проверенные демонстрации**, не клиентские работы. Ссылки ведут на локальный preview текущей сборки. Все версии **1.0.0**. Публичные будущие адреса имеют тот же path на sitevl.tech; этим отчётом они не объявляются опубликованными.

| № | Ниша | Локальная страница | Стабильный ID | 390 / 1440 |
|---|---|---|---|---|
| 1 | Салон красоты | [beauty-salon](http://127.0.0.1:4193/templates/beauty-salon) | `sitevl-design-salon` | PASS |
| 2 | Автосервис | [auto-service](http://127.0.0.1:4193/templates/auto-service) | `sitevl-design-garage` | PASS |
| 3 | Кофейня | [coffee-shop](http://127.0.0.1:4193/templates/coffee-shop) | `sitevl-design-coffee` | PASS |
| 4 | Психологическая школа | [psychology-school](http://127.0.0.1:4193/templates/psychology-school) | `sitevl-design-school` | PASS |
| 5 | Магазин техники | [electronics-store](http://127.0.0.1:4193/templates/electronics-store) | `sitevl-design-tech` | PASS |
| 6 | Судовое оборудование | [marine-supplier](http://127.0.0.1:4193/templates/marine-supplier) | `sitevl-design-marine` | PASS |
| 7 | Барбершоп | [barbershop](http://127.0.0.1:4193/templates/barbershop) | `sitevl-design-barber` | PASS |
| 8 | Ногтевая студия | [nail-studio](http://127.0.0.1:4193/templates/nail-studio) | `sitevl-design-nails` | PASS |
| 9 | Детейлинг | [car-detailing](http://127.0.0.1:4193/templates/car-detailing) | `sitevl-design-detailing` | PASS |
| 10 | Шиномонтаж | [tire-service](http://127.0.0.1:4193/templates/tire-service) | `sitevl-design-tires` | PASS |
| 11 | Ресторан | [restaurant](http://127.0.0.1:4193/templates/restaurant) | `sitevl-design-restaurant` | PASS |
| 12 | Пекарня | [bakery](http://127.0.0.1:4193/templates/bakery) | `sitevl-design-bakery` | PASS |
| 13 | Языковая школа | [language-school](http://127.0.0.1:4193/templates/language-school) | `sitevl-design-language` | PASS |
| 14 | Учебный центр | [training-center](http://127.0.0.1:4193/templates/training-center) | `sitevl-design-training` | PASS |
| 15 | Фотограф | [photographer](http://127.0.0.1:4193/templates/photographer) | `sitevl-design-photographer` | PASS |
| 16 | Частный психолог | [private-psychologist](http://127.0.0.1:4193/templates/private-psychologist) | `sitevl-design-psychologist` | PASS |
| 17 | Репетитор | [private-tutor](http://127.0.0.1:4193/templates/private-tutor) | `sitevl-design-tutor` | PASS |
| 18 | Магазин одежды | [clothing-store](http://127.0.0.1:4193/templates/clothing-store) | `sitevl-design-clothing` | PASS |
| 19 | Цветочный магазин | [flower-shop](http://127.0.0.1:4193/templates/flower-shop) | `sitevl-design-florist` | PASS |
| 20 | Логистическая компания | [logistics-company](http://127.0.0.1:4193/templates/logistics-company) | `sitevl-design-logistics` | PASS |
| 21 | Оптовый поставщик | [wholesale-supplier](http://127.0.0.1:4193/templates/wholesale-supplier) | `sitevl-design-wholesale` | PASS |
| 22 | База отдыха | [holiday-lodge](http://127.0.0.1:4193/templates/holiday-lodge) | `sitevl-design-lodge` | PASS |
| 23 | Экскурсии | [excursions](http://127.0.0.1:4193/templates/excursions) | `sitevl-design-tours` | PASS |
| 24 | Аренда катера | [boat-rental](http://127.0.0.1:4193/templates/boat-rental) | `sitevl-design-boat` | PASS |
| 25 | Ремонт квартир | [apartment-renovation](http://127.0.0.1:4193/templates/apartment-renovation) | `sitevl-design-renovation` | PASS |
| 26 | Мебель на заказ | [custom-furniture](http://127.0.0.1:4193/templates/custom-furniture) | `sitevl-design-furniture` | PASS |
| 27 | Клининг | [cleaning-service](http://127.0.0.1:4193/templates/cleaning-service) | `sitevl-design-cleaning` | PASS |
| 28 | Груминг | [pet-grooming](http://127.0.0.1:4193/templates/pet-grooming) | `sitevl-design-grooming` | PASS |
| 29 | Зоогостиница | [pet-hotel](http://127.0.0.1:4193/templates/pet-hotel) | `sitevl-design-pethotel` | PASS |
| 30 | Кинолог | [dog-trainer](http://127.0.0.1:4193/templates/dog-trainer) | `sitevl-design-dogtrainer` | PASS |

## SEO, данные и права

- /templates + 30 содержательных /templates/:slug индексируемы. Уникальные метаданные и логичные breadcrumbs, canonical неизменно на **https://sitevl.tech**.
- Фильтры хранятся в состоянии UI, не создают маршрутов/комбинаций в sitemap. ?view=preview имеет canonical чистой страницы дизайна.
- /templates/customize/:id и /templates/owner/:id — **noindex**, owner также **nofollow / no-store**. Отсутствуют в sitemap. Vercel rewrites направляют технические URL в noindex HTML Studio. Результат браузерной проверки метаданных не заменяет будущую HTTP-проверку заголовков после deployment.
- Единый origin: `src/config/publicOrigin.mjs`. VITE_SITE_URL проверяется на соответствие sitevl.tech; текущий hostname посетителя canonical не определяет.
- Цены разработки и package snapshot берутся из `priceDirections.ts` через генерируемый серверный contract. Цены внутри демонстрационного бизнеса обозначены как примеры, не второй прайс SITEVL. Итоговая стоимость согласуется отдельно.
- На каталоге нет 30 iframe или загруженных проектов. На странице дизайна — один модуль выбранной ниши, Puck editor не загружается в настройщик. Главная и остальные публичные разделы не загружают новые фото/data chunks.
- Не обнаружено Gemini-запросов в проверенных потоках каталога/настройщика. Фото остаются локальными до добровольной отправки. JSON не содержит base64/blob URL вместо серверных файлов.
- Публичный GET ai-leads предоставляет конфигурацию, не список заявок. Проект/контакт/фото доступны только через защищённый owner API. Серверные Blob/Redis/Telegram библиотеки не импортируются клиентским потоком.
- Проверены сигнатуры серверных credential names и ключей в frontend dist — совпадений не найдено. Локальные env игнорируются Git. Значения настоящих секретов не извлекались для побайтового сравнения.
- Все **52** файла в photos учтены в `TEMPLATE_CATALOG_ASSETS.md`: 50 лицензированных фото и 2 собственные схемы «до/после». Все 30 обложек — реальные кадры renderer. Новые фото/обложки в этапе 8 не добавлялись.
- Официальные [Unsplash License](https://unsplash.com/license) и [Pexels License](https://www.pexels.com/license/) повторно проверены. Разрешено использование фотографий в сайтах с оговорёнными ограничениями; нет заявления об endorsement. Индивидуальные model/property releases независимо не проверялись. Авторство и оригиналы перечислены в asset-отчёте.
- Нет вымышленных отзывов, достижений, медицинских обещаний, сертификатов или реальных контактов в 30 публичных демо. Фотографии обозначены как иллюстрации, не выполненные проекты и не персонал условных брендов.

## Проверки команд

| Команда | Итог |
|---|---|
| npm test | **238/238 PASS**, без пропусков |
| npm run lint | **PASS** |
| npx tsc -b --pretty false | **PASS** |
| npm run build | **PASS**, включая генерацию template contract, SEO и prerender |
| git diff --check | **PASS** |
| node scripts/seo-audit.mjs | **PASS: 104 indexable / 14 noindex**, 118 HTML |
| Браузерная регрессия scripts/qa-template-layout.mjs | **PASS: 15 отступов + Studio preview** |

Build предупреждает о существующих chunks больше 500 kB: общий JS около 542 kB и studioConfig около 665 kB (до gzip). Это не ошибка сборки; неподконтрольный задаче рефакторинг бандлов не выполнялся.

Повторить точечный тест с уже установленным Playwright:
```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/qa-template-layout.mjs
```
Сначала запустить существующий `npm run preview -- --host 127.0.0.1 --port 4193 --strictPort`. Скрипт также поддерживает обычный установленный модуль playwright без переменной. Он проверяет только локальные адреса и не отправляет заявки.

## Артефакты текущего QA

Временные результаты (без production секретов/контактов):

- /tmp/sitevl-task8-preview/recheck-results.json — 60 демонстраций, изображения и поведение.
- /tmp/sitevl-task8-sizes/results.json — 90 настройщиков.
- /tmp/sitevl-task8-preview/built-results.json — каталог, 30 деталей и семь публичных маршрутов.
- /tmp/sitevl-task8-customizer-full/results.json — девять расширенных циклов настройки.
- /tmp/sitevl-task8-lead-qa/results.json — три изолированных сквозных заявки и owner ZIP.
- /tmp/sitevl-task8-studio.json — регрессия Studio.
- /tmp/sitevl-task8-layout-regression.log — повторяемый тест исправленных CSS-дефектов.
- /tmp/sitevl-task8-final-tests.log, /tmp/sitevl-task8-lint.log, /tmp/sitevl-task8-final-build.log.
- Скриншоты: /tmp/sitevl-task8-preview, /tmp/sitevl-task8-sizes, /tmp/sitevl-task8-lead-qa.

## Короткий маршрут ручной проверки

1. Открыть [локальный каталог](http://127.0.0.1:4193/templates).
2. Выбрать «Красота и уход», найти салон → «Настроить под себя».
3. Изменить название/заголовок/цвет; загрузить своё фото; в «Секции» переместить блок.
4. Дождаться «Сохранено в браузере», перезагрузить. Проверить изменения и картинку.
5. Повторить с логистикой и катером на других размерах.
6. **Реальную заявку пока не отправлять из обычного Vite preview:** он не исполняет serverless API. После подключения private Blob и owner key проверить её через настоящий server runtime.
7. После успешного live сохранения открыть защищённую ссылку владельца, ввести owner key, сверить сайт и скачать пакет.
8. Только после снятия блокировки — commit, push main, existing production deploy, затем повторные GET/browser проверки sitevl.tech, каталога, дизайнов и настройщика.

Итог: каталог локально проверен и подготовлен. **К публикации с обещанием рабочего приёма заявок пока не готов из-за двух отсутствующих серверных настроек.**
