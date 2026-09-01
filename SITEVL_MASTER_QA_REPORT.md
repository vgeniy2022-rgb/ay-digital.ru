# SITEVL — Master QA Report

Дата: 1 сентября 2026 года  
Базовый коммит: `6fb528002c0bddb75d858e3bf697b7f23028b66e`  
Статусы: `PASS`, `FIXED`, `FAIL`, `BLOCKED`, `NOT RUN`.

## 1. Что проверено

Проведён визуальный, адаптивный, текстовый, функциональный, accessibility, console/network, SEO, performance и lifecycle-аудит production-версии и localhost. Проверены viewport 320×720, 360×800, 375×812, 390×844, 393×852, 430×932, 768×1024, 820×1180, 1024×768, 1180×820, 1366×768, 1440×900 и 1920×1080.

Проверены главная, коммерческие страницы, услуги, цены, кейсы, контакты, brief, полезные материалы, локальная SEO-страница, LAB, Modern OS, Retro, Physics, Infinite Canvas, Studio и X-RAY. После исправлений выполнены 54 мобильные и 63 tablet/desktop комбинации ключевых маршрутов. На локальной итоговой версии не найдено горизонтального переполнения документа или видимых сломанных изображений.

Обязательный release gate локально:

| Проверка | Результат |
|---|---|
| `npm test` | PASS — 97/97 |
| `npm run lint` | PASS |
| `npx tsc -b --pretty false` | PASS |
| `npm run build` | PASS |
| SEO generator | PASS — 61 URL sitemap, 75 prerendered HTML |
| SEO audit | PASS — 61/61 indexable URL |
| `git diff --check` | PASS |

## 2. Что пользователь уже подозревал

Задание отдельно указывало на типовые риски: обрезанный русский текст, horizontal overflow, слишком маленькие touch targets, конфликты fixed/sticky UI, ошибки Window Manager/fullscreen, неполную локализацию, dead UI, console/network ошибки, потерю lazy loading и утечки ресурсов. Эти области проверялись не формально по наличию DOM, а через реальные клики, ввод, смену viewport, открытие окон, запуск игр и изменение состояния.

Подтверждены реальные проблемы из этих классов: мобильные цели меньше 44 px, выход окна Retro за viewport, несогласованный fullscreen Games, отсутствие Escape-паузы CORE, наложение мобильных подсказок и несколько групп английского пользовательского текста.

## 3. Что дополнительно нашёл ты сам

Помимо общих рисков из задания самостоятельно обнаружены конкретные дефекты: избыточные dev-логи CMS, прямой вывод enum-значений локального AI, 9 px overflow шапки Studio только на 320 px, отсутствующие доступные имена Retro-кнопок, несинхронный fullscreen Games, отсутствие Escape-паузы CORE и набор точечных непереведённых подписей/SEO-текстов. Детальная карточка каждого факта приведена в обязательном разделе «Дополнительные проблемы, найденные в ходе полного аудита».

## 4. Какие визуальные ошибки найдены

- FIXED — окно Retro OS на 320–430 px выходило вправо и скрывало оконные кнопки.
- FIXED — игровое сообщение CORE и подсказка о повороте устройства находились почти на одной координате.
- FIXED — шапка списка проектов Studio была шире 320 px на 9 px.
- FIXED — ряд мобильных контролов выглядел заметно меньше соседних элементов.
- PASS — после исправлений не воспроизводятся document-level overflow, broken image, растяжение видимых изображений или потеря основных шрифтов на проверенной матрице.

## 5. Какие mobile ошибки найдены

- FIXED — Modern OS: menu bar, файловая toolbar и действие скачивания имели цели 21–42 px.
- FIXED — Physics: toolbar и controls имели высоту 36–42 px.
- FIXED — Infinite Canvas: дополнительная панель и inspector имели цели 34–40 px.
- FIXED — Retro: оконные кнопки и taskbar имели цели 20–28 px.
- FIXED — Studio 320 px: wordmark и две текстовые кнопки не умещались в header.
- PASS — после регрессии mobile document width совпадает с client width; внутренние управляемые scroll-панели не выдавались за дефект страницы.

## 6. Какие desktop ошибки найдены

- FIXED — дублирующее локальное состояние fullscreen в Games расходилось с состоянием immersive-окна Modern OS после Escape.
- FIXED — CORE не ставился на паузу по Escape, хотя системный сценарий игры и fullscreen предполагал это действие.
- PASS — Window Manager прошёл последовательность Files → Browser → смена фокуса → minimize → Dock restore → maximize → restore → close.
- PASS — системный, оконный и игровой fullscreen после выхода восстанавливают прежние размеры и слои desktop.

## 7. Какие текстовые ошибки найдены

FIXED: `LANDING BUILDER`, `Retro Computer`, `VL Night`, `Visual Website Builder`, `Brutalist`, `Device preview`, `Case replay`, `LIVE PREVIEW`, `PUBLIC PREVIEW`, `LIVE LANDING`, `Changelog`, `Developer Mode`, подписи Physics и внутренние enum-значения результата AI заменены понятными русскими подписями. Бренды и общепринятые технические обозначения SITEVL, SITEVL Studio, SITEVL LAB, Modern OS, AI, API, SEO, URL, JSON, GitHub и Vercel намеренно сохранены.

## 8. Какие функциональные ошибки найдены

- FIXED — Escape-пауза CORE.
- FIXED — повторный вход/выход Games fullscreen после Escape.
- FIXED — избыточное логирование полного CMS URL/ответа/нормализованных данных в dev-среде.
- PASS — Studio создаёт локальный проект, сохраняет в IndexedDB, открывает editor/preview и запускает оба экспорта.
- PASS — чистая браузерная вкладка на 11 ключевых маршрутах и отдельный чистый экспорт Studio не зафиксировали `console.error`/`console.warn`.
- BLOCKED — реальные формы production намеренно не отправлялись, чтобы не создавать нежелательные заявки; проверены labels, controls и безопасные локальные состояния.

## 9. Какие проблемы Modern OS найдены

FIXED: touch targets, fullscreen source of truth и пересечение мобильных подсказок CORE. PASS: окна Files, Browser и другие приложения открываются; фокус, z-index, minimize, Dock restore, maximize, restore и close работают. X-RAY внутри Modern OS отсутствует. Статический lifecycle-аудит подтвердил очистку таймеров, глобальных listeners, ResizeObserver, RAF, media tracks и object URL в проверенных модулях.

## 10. Какие проблемы игр найдены

- CORE: FIXED Escape-пауза и mobile overlay; PASS — движение, выстрел, перезарядка и взаимодействие.
- BLOCKS: PASS — движение, rotate, hold, hard drop и изменение состояния/счёта.
- NOVA CIRCUIT: PASS — управление и прохождение контрольной точки.
- SITEVL MATCH: PASS — неверная перестановка отклоняется, валидная уменьшает ходы и начисляет очки.
- SITEVL FARM: PASS — посадка, ожидание, сбор, изменение XP и инвентаря.
- NOT RUN — game over/restart каждого режима, полный круг Circuit, special piece/level completion Match и все расширенные подсистемы Farm не проходились end-to-end второй раз; соответствующая логика покрыта существующими unit tests, но это не заменяется пометкой браузерного PASS.

## 11. Какие проблемы Studio найдены

FIXED: 320 px header overflow, `Brutalist` и прямой вывод `services`, `minimal`, `Header`, `Hero` и других enum-ключей. PASS: создание проекта, открытие editor, mobile bottom sheets, локальный AI при `configured:false`, autosave в IndexedDB, прямой preview, переключение desktop/tablet/mobile preview, JSON export и static ZIP export. X-RAY в Studio отсутствует.

NOT RUN: сам факт открытия новой popup-вкладки кнопкой «Предпросмотр» не подтверждён браузерной автоматизацией — прямой preview route и его функции проверены отдельно.

## 12. Какие проблемы X-RAY найдены

Новых функциональных дефектов X-RAY не обнаружено. PASS: 50% и 100%, вкладки, независимая прокрутка, копирование, данные статьи, отсутствие document overflow. PASS: X-RAY отсутствует в Modern OS и Studio. Положения 25% и 75% также проверялись на первичном прогоне.

## 13. Какие performance проблемы найдены

- PASS — маршруты, Studio, Modern OS, Games, Farm, AI и X-RAY сохраняют lazy loading; Games и каждую из пяти игр сборка выпускает отдельными chunks.
- PASS — найденные RAF, timers, observers, listeners, media streams и object URL имеют cleanup; AudioContext короткого звука Farm закрывается по событию `ended`.
- FIXED — убран вывод крупных CMS payload и нормализованных данных в dev console.
- Наблюдение — Vite сообщает, что ленивый `studio` chunk после minification равен 657,92 kB. Он не входит в начальный public route, но остаётся кандидатом на отдельную будущую оптимизацию.
- NOT RUN — долговременный heap profile, throttled Lighthouse и измерение на реальном слабом телефоне; статический lifecycle-аудит не выдаётся за эти тесты.

## 14. Что исправлено

Исправлены 19 подтверждённых строк master audit: 3 HIGH, 11 MEDIUM и 5 LOW. Изменения ограничены локализацией, доступностью, мобильными размерами, responsive layout, fullscreen state и безопасной диагностикой. Новые продуктовые функции не добавлялись.

## 15. Что намеренно не менялось

- Не менялись продуктовая концепция, данные, маршруты, schema IndexedDB и ключи persistence.
- Не переводились бренды и технические аббревиатуры.
- Не отключалась web security и не выполнялись реальные нежелательные заявки.
- Не выполнялся широкий рефакторинг Studio chunk: он ленивый, а изменение границ vendor chunks вне подтверждённого дефекта увеличило бы регрессионный риск.
- Не добавлялись тестовые media-файлы в production-репозиторий.

## 16. Что осталось BLOCKED

- BLOCKED — безопасная production-отправка реальной формы без получения заявки реальным адресатом.
- BLOCKED — AI provider request: UI честно сообщает `Облачный ИИ: не настроен`; локальный deterministic provider проверен, fake cloud response не использовался.
- NOT RUN — MP3/WAV/MP4/WebM browser media matrix: безопасных fixture-файлов в репозитории нет, а пользовательские файлы без явного выбора не подставлялись.
- NOT RUN — длительный memory/heap profile и реальные iOS Safari/Android Chrome устройства.
- NOT RUN — popup-механика открытия preview, хотя сам preview route проверен.

## 17. Production QA

PASS — deployment коммита `a599f54` проверен через `https://sitevl-ru.vercel.app` на 390×844, 768×1024 и 1440×900.

- PASS — 27 комбинаций из девяти representative routes и трёх обязательных viewport без document-level overflow и console warnings/errors.
- PASS — production fonts имеют статус `loaded`; девять offscreen lazy images, которые ещё не имели `naturalWidth` до прокрутки, отдельно проверены прямыми HTTP-запросами и все отвечают 200.
- PASS — Modern OS: шесть одновременно открытых окон; focus, minimize, Dock restore, maximize (1420×702), restore (900×610) и close. После close осталось пять окон.
- PASS — production chunks CORE SHOOTER, BLOCKS, NOVA CIRCUIT, SITEVL MATCH и SITEVL FARM реально загрузили игровой UI.
- PASS — X-RAY на публичной странице работает при 50% и 100%, не создаёт overflow и отсутствует в DOM Modern OS/Studio.
- PASS — Studio на 390 px не создаёт overflow, шрифт загружен, X-RAY отсутствует.

## 18. Commit

PASS — основной кодовый commit: `a599f54c91f127e9d8cdf1d8bbf28022c7d31b9e` (`Polish SITEVL UI and responsive QA fixes`). Локальный `HEAD` и `origin/main` совпали после push.

## 19. Deployment

PASS — существующий Vercel project `ay-digital-ru`, deployment `dpl_89hbXDFDi8p7xxZ7mjvh5gT9x1if`, URL `https://ay-digital-ri316gooi-vgeniy.vercel.app`, статус `READY`. Build logs подтверждают: branch `main`, commit `a599f54`, 2567 modules, SEO 61/61.

## 20. Production URL

PASS — основной production alias: `https://sitevl-ru.vercel.app`. Дополнительный существующий alias того же READY deployment: `https://ay-digital-ru.vercel.app`.

## Дополнительные проблемы, найденные в ходе полного аудита

### 1. Избыточная CMS-диагностика

**Где:** слой получения CMS-данных  
**Маршрут:** глобально  
**Viewport:** все  
**Проблема:** dev-console выводила полный URL, payload и нормализованные данные.  
**Причина:** диагностические сообщения были добавлены вокруг всего pipeline ответа.  
**Что исправлено:** оставлено только безопасное сообщение о переходе на резервные данные без URL и payload.

### 2. CORE не реагировал на Escape

**Где:** Modern OS → Games → CORE SHOOTER  
**Маршрут:** `/lab/modern-os`  
**Viewport:** 390×844, 1440×900  
**Проблема:** Escape не включал паузу.  
**Причина:** ветка отсутствовала в keydown handler.  
**Что исправлено:** добавлено переключение паузы с защитой от key repeat и русская подсказка.

### 3. Малые mobile controls Modern OS

**Где:** menu bar, Files toolbar и Browser action  
**Маршрут:** `/lab/modern-os`  
**Viewport:** 390×844  
**Проблема:** цели имели высоту 21–42 px.  
**Причина:** mobile selector не покрывал прямую кнопку menu bar, а базовые toolbar styles перекрывали минимум.  
**Что исправлено:** расширены точечные mobile selectors и установлен минимум 44 px.

### 4. Рассинхронизация Games fullscreen

**Где:** Modern OS → Games  
**Маршрут:** `/lab/modern-os`  
**Viewport:** 1440×900  
**Проблема:** после Escape локальный флаг Games мог остаться включённым и инвертировать следующий вход/выход.  
**Причина:** родитель и дочерний компонент хранили два источника истины.  
**Что исправлено:** fullscreen передаётся из единого родительского `immersive` state.

### 5. Перекрытие сообщений CORE

**Где:** Modern OS → Games → CORE SHOOTER  
**Маршрут:** `/lab/modern-os`  
**Viewport:** 390×844  
**Проблема:** game message и rotation hint перекрывались.  
**Причина:** оба overlay находились у `top: 116–118px`.  
**Что исправлено:** мобильные слои разнесены; в маленьком landscape rotation hint скрывается.

### 6. Английские подписи Physics

**Где:** presets, shape, platform и haptics  
**Маршрут:** `/lab/physics`  
**Viewport:** все  
**Проблема:** отображались `ZERO`, `MOON`, `MARS`, `EARTH`, `JUPITER`, `HAPTICS`, `COLLISION PLATFORM`, `device tilt`.  
**Причина:** UI напрямую показывал внутренние ключи и старый смешанный текст.  
**Что исправлено:** введены русские display labels при сохранении стабильных внутренних значений.

### 7. Малые mobile controls Physics

**Где:** toolbar и inspector  
**Маршрут:** `/lab/physics`  
**Viewport:** 320–430 px  
**Проблема:** интерактивные цели имели высоту 36–42 px.  
**Причина:** mobile layout не задавал минимальный touch target.  
**Что исправлено:** кнопки и selects доведены до 44 px без скрытия внутреннего scroll.

### 8. Малые mobile controls Infinite Canvas

**Где:** subbar, inspector, color и portal controls  
**Маршрут:** `/lab/canvas`  
**Viewport:** 320–430 px  
**Проблема:** цели имели высоту 34–40 px.  
**Причина:** минимум был задан только основной toolbar.  
**Что исправлено:** точечные мобильные размеры доведены до 44 px.

### 9. Малые controls Retro

**Где:** title bar, taskbar, session/browser controls  
**Маршрут:** `/lab/retro`  
**Viewport:** 320–430 px  
**Проблема:** цели имели размер 20–28 px.  
**Причина:** desktop-retro размеры использовались на touch viewport без адаптации.  
**Что исправлено:** на mobile фактические цели увеличены до 44–50 px при сохранении визуального стиля.

### 10. Окно Retro выходило за viewport

**Где:** открытое приложение Retro OS  
**Маршрут:** `/lab/retro`  
**Viewport:** 320–430 px  
**Проблема:** правая часть окна и controls были вне экрана.  
**Причина:** inline width побеждала mobile width, а classic override возвращал неверный bottom inset.  
**Что исправлено:** mobile width/height ограничены явными inset и `auto !important`.

### 11. Retro icon-buttons без доступного имени

**Где:** Retro → Файлы  
**Маршрут:** `/lab/retro`  
**Viewport:** 390×844, 1440×900  
**Проблема:** действия «выше», «создать», «восстановить», «дублировать» и «удалить» имели только SVG.  
**Причина:** отсутствовали `aria-label`.  
**Что исправлено:** добавлены русские доступные имена, включая имя целевого файла.

### 12. Английские подписи на главной

**Где:** LAB/продуктовые карточки главной  
**Маршрут:** `/`  
**Viewport:** все  
**Проблема:** оставались `LANDING BUILDER` и `Retro Computer`.  
**Причина:** неполная редакционная локализация.  
**Что исправлено:** пользовательские подписи переведены без изменения маршрутов.

### 13. `VL Night`

**Где:** experience controls  
**Маршрут:** `/website-development-vladivostok`  
**Viewport:** все  
**Проблема:** режим имел непонятную смешанную подпись.  
**Причина:** внутреннее название попало в visible UI.  
**Что исправлено:** отображается «Ночной режим».

### 14. Английская подсказка палитры команд

**Где:** глобальная command palette  
**Маршрут:** глобально  
**Viewport:** все  
**Проблема:** SITEVL Studio описывался как `Visual Website Builder`.  
**Причина:** старая подпись не была локализована.  
**Что исправлено:** используется «Визуальный конструктор сайтов».

### 15. `Brutalist` в Studio

**Где:** Studio → создание с AI  
**Маршрут:** `/studio`  
**Viewport:** все  
**Проблема:** один стиль отображался по английскому enum label.  
**Причина:** value и display label не были разделены.  
**Что исправлено:** значение `brutalist` сохранено, пользователю показывается «Брутализм».

### 16. Внутренние enum в AI preview

**Где:** Studio → результат локального AI  
**Маршрут:** `/studio`  
**Viewport:** 390×844  
**Проблема:** показывались `services`, `minimal`, `Header`, `Hero` и типы секций.  
**Причина:** сериализуемые ключи выводились напрямую.  
**Что исправлено:** добавлены русские display-словари для типа проекта, стиля и секций.

### 17. Overflow Studio на 320 px

**Где:** header списка проектов  
**Маршрут:** `/studio/projects`  
**Viewport:** 320×720  
**Проблема:** document был шире viewport на 9 px.  
**Причина:** wordmark, gap и две текстовые кнопки не могли сжаться.  
**Что исправлено:** до 340 px wordmark и кнопки переходят в компактный icon-only вид с явными `aria-label`; цели остаются 44×44 px.

### 18. Английский Physics в SEO

**Где:** route metadata и breadcrumbs  
**Маршрут:** `/lab`, `/lab/physics`  
**Viewport:** все  
**Проблема:** в русском title/description встречался `Physics Lab`.  
**Причина:** SEO-справочники локализованы не полностью.  
**Что исправлено:** обычная подпись заменена на «Лаборатория физики»; noindex LAB сохранён.

### 19. Английские редакционные подписи вспомогательных экранов

**Где:** кейсы, demo admin, конструктор, changelog и developer overlay  
**Маршрут:** несколько public/utility routes  
**Viewport:** все  
**Проблема:** оставались `Device preview`, `Case replay`, `LIVE PREVIEW`, `PUBLIC PREVIEW`, `LIVE LANDING`, `Changelog`, `Developer Mode`.  
**Причина:** отдельные старые экраны не прошли единый русский QA.  
**Что исправлено:** обычные user-facing подписи локализованы; технические identifiers не менялись.

## Что проверить вручную

Эта проверка занимает примерно 10–15 минут:

1. Откройте production на телефоне или в responsive mode 390×844. На главной прокрутите от Hero до Footer и убедитесь, что нет горизонтального движения страницы.
2. Перейдите в SITEVL LAB → Modern OS. Откройте Files и Browser, нажимайте видимые части обоих окон и проверьте смену фокуса.
3. Сверните Browser, восстановите через Dock, разверните, восстановите прежний размер и закройте.
4. Откройте Games → CORE SHOOTER. Начните игру, нажмите Escape два раза: пауза должна включиться и выключиться; мобильные сообщения не должны перекрываться.
5. Последовательно запустите BLOCKS, NOVA CIRCUIT, SITEVL MATCH и SITEVL FARM — должна открыться сама игра, а не пустое окно или ошибка chunk.
6. Откройте `/lab/retro` на 390 px, запустите «Файлы»: окно и три оконные кнопки должны целиком оставаться на экране.
7. Откройте `/lab/physics` и `/lab/canvas` на телефоне: управляющие кнопки должны быть удобными для касания, а подписи Physics — русскими.
8. Откройте Studio на ширине 320 px: шапка не должна создавать horizontal scroll. Создайте тестовый проект локальным AI и проверьте русские тип проекта, стиль и список секций.
9. В editor переключите «Блоки», «Структура», «Изменить», «Стиль», затем откройте preview и переключите desktop/tablet/mobile.
10. На публичной странице откройте X-RAY, поставьте 50%, затем 100%, попробуйте вкладки и копирование. В Modern OS и Studio X-RAY отсутствует.
