# SITEVL LAB NEXT — Phase 5/5

Статус: **RELEASED**  
Дата: 30 августа 2026 года.

## Release gates

- **PASS:** Phase 1 — очищен каталог LAB, progression динамический, legacy routes имеют redirect/working fallback.
- **PASS:** Phase 2 — Modern OS Browser, AI provider architecture, Media и Utilities связаны с существующей системой.
- **PASS:** Phase 3 — CORE SHOOTER, BLOCKS, NOVA CIRCUIT и SITEVL MATCH доступны из Games Hub.
- **PASS:** Phase 4 — SITEVL FARM имеет рабочий цикл plant → grow → harvest → produce → order → Coins/XP.
- **PASS:** публичная корзина удалена; виртуальные корзины ОС не затронуты.
- **PASS:** CMS, Apps Script, production data и SITEVL Studio persistence не изменялись.

## Modern OS

- **PASS:** Files, Browser, AI, Media, Games, Farm, Settings и Utilities открываются как реальные окна.
- **PASS:** background focus/z-order, close, minimize, Dock restore, maximize/restore, drag, resize и App Switcher проверены interaction-тестами.
- **PASS:** fullscreen использует Fullscreen API, а при недоступности — CSS immersive fallback.
- **PASS:** Browser открывает `sitevl://home`, `lab`, `studio`, `games`, `farm` и HTTPS iframe; `javascript:`, `data:` и `file:` блокируются.
- **PASS:** iframe fallback объясняет внешние X-Frame/CSP ограничения и не пытается их обходить.
- **PASS:** AI выполняет только allowlisted локальные действия; prompt injection с JavaScript не исполняется.
- **NOT CONFIGURED:** live Gemini локально не проверялся, потому что server-side key отсутствует; UI показывает честное состояние.

## Games и Farm

- **PASS:** все пять игровых карточек запускают полноценные lazy-loaded модули, а не placeholders.
- **PASS:** representative interaction выполнен для CORE SHOOTER, BLOCKS, NOVA CIRCUIT и MATCH.
- **PASS:** тяжёлые игры открыты/закрыты по 10 раз; uncaught console errors не обнаружены.
- **PASS:** Farm: пшеница посажена, после 20 секунд собрана, начислены урожай/XP, затем произведена мука.
- **PASS:** Farm timestamps являются источником готовности после reload; таймер не является единственным источником истины.
- **PASS:** release timings: 20 с / 60 с / 100 с / 300 с для пшеницы, кукурузы, моркови и клубники.
- **NOT RUN:** полный длительный путь уровней Farm, все заказы текущего browser save и все 12 уровней MATCH вручную не проходились; core rules покрыты unit-тестами.

## Retro, Physics, Canvas, Studio

- **PASS:** Retro представлен одной пользовательской системой; browser URL validator и migration покрыты тестами.
- **PASS:** Physics очищает RAF/observer/listener при unmount; основной smoke UI доступен.
- **PASS:** Infinite Canvas и Studio остались на существующих маршрутах и проходят TypeScript/build.
- **PASS:** Studio routes имеют runtime `noindex`; `/studio` и `/studio/projects` исключены из sitemap.
- **PASS:** Studio переведён с deprecated `renderHeader` на `overrides.header` и selector-based Puck hook; чистая вкладка редактора не пишет warnings/errors.
- **PASS:** WEB LAB удаляет `<script>`, inline handlers и `javascript:` и использует sandbox/CSP preview.

## Public, SEO и privacy

- **PASS:** public routes, LAB, Brief, Полезное и контакты сохраняются; cart/checkout redirects не дают broken UI.
- **PASS:** SEO pipeline генерирует metadata, canonical, robots и sitemap; LAB/Studio technical routes `noindex`.
- **PASS:** frontend и diff не содержат hardcoded API keys, Bearer tokens или private secrets.
- **PASS:** user files Photos/Media/Camera/Recorder/custom wallpaper обрабатываются локально; silent upload отсутствует.
- **PASS:** camera/microphone запрашиваются только после явного действия и корректно обрабатывают отказ.
- **PASS:** Farm progress остаётся в локальном Modern OS storage.

## Performance, mobile, accessibility

- **PASS:** Modern OS, Farm и отдельные игры разбиты на lazy chunks; публичный initial route не импортирует LAB eager.
- **PASS:** RAF, MediaStream, objectURL и AudioContext имеют cleanup в тяжёлых приложениях.
- **PASS:** на 320, 375, 390, 393, 430, 768, 820, 1024, 1180, 1366, 1440 и 1920 px document overflow не обнаружен.
- **PASS:** критические mobile touch targets не меньше 44 px; safe-area и `100dvh` используются в immersive UI.
- **PASS:** reduced-motion и low-power стили уменьшают некритичные эффекты.
- **NOT RUN:** физический iPhone/iPad Safari, реальные camera/microphone permissions и полный набор WAV/MP3/MP4/WebM codecs.

## Browser QA evidence

- **PASS:** Window Manager critical scenario.
- **PASS:** Modern Browser internal/external/security flow.
- **PASS:** AI allowlist and injection rejection.
- **PASS:** WEB LAB sanitizer runtime check.
- **PASS:** Games representative interactions and 10× open/close stress.
- **PASS:** Farm real 20-second grow/harvest and 15-second production.
- **PASS:** console contains no project uncaught errors after representative QA.

## Automated checks

- `npm test` — **PASS**, 91/91.
- `npm run lint` — **PASS**.
- `npx tsc -b --pretty false` — **PASS**.
- `npm run build` — **PASS**, 2559 modules, 61 sitemap URLs, 75 prerendered HTML, SEO audit 61/61.
- `git diff --check` — **PASS**.
- **PASS WITH WARNING:** isolated Puck/Studio chunk — 657.92 kB minified / 186.85 kB gzip. Modern OS — 111.43/31.91 kB; Farm — 42.04/14.16 kB. Игры остаются отдельными chunks 4.54–12.04 kB до gzip.

## Production

- Release commit: `5cf718d64a0acb0fb220a8ee68434b3e2bf035c8` (`Release SITEVL LAB NEXT`).
- Branch: `main`.
- Push: **PASS**, local release commit и `origin/main` совпали перед deploy.
- Deployment ID: `dpl_Ab8yHAzJiJoef8JtWUJjvwJBNWoz`.
- Deployment URL: `https://ay-digital-hfeeq73v3-vgeniy.vercel.app`.
- Основной production alias: `https://sitevl-ru.vercel.app`.
- Дополнительные aliases: `https://ay-digital-ru.vercel.app`, `https://ay-digital-ru-vgeniy.vercel.app`.
- Vercel target/state: `production` / `READY`.

## Production QA

- **PASS:** `/`, `/lab`, `/lab/modern-os`, `/lab/retro`, `/lab/physics`, `/lab/canvas`, `/studio`, `/sitemap.xml` и `/robots.txt` отвечают HTTP 200.
- **PASS:** основной alias содержит Google verification meta, production canonical и актуальный SITEVL title.
- **PASS:** Modern OS Window Manager: focus, minimize, Dock restore, maximize 1420×702, restore 900×610, close и повторный запуск.
- **PASS:** production Browser открыл `sitevl://farm`; URL validator и executable-scheme rejection дополнительно покрыты unit/runtime local QA.
- **PASS:** Games Hub содержит пять игр; Farm загрузила процедурный Canvas, показала release timings и приняла посадку пшеницы.
- **PASS:** production 390×844 не имеет document overflow; Farm primary CTA имеет высоту 46 px и `100dvh` вычисляется как 844 px.
- **PASS:** Retro Browser открыл `sitevl://home` и страницу `SITEVL Web Directory`.
- **PASS:** Studio загрузил проекты, сохранил `noindex`/canonical и не записал warnings/errors в console.
- **PASS:** representative production console не содержит project errors/warnings.
- **NOT CONFIGURED:** `GET /api/ai` возвращает `{ configured: false, provider: "gemini", model: "gemini-3.7-flash" }`; live cloud request не выполнялся.
- **RECOVERED:** первая CLI-загрузка оборвалась сетевой ошибкой `fetch failed`; повтор с `--archive=tgz` успешно создал READY deployment.
- **NOT RUN:** физический iPhone/iPad Safari, camera/microphone permissions и полный codec matrix.
