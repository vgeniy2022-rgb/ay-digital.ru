# SITEVL LAB NEXT — Phase 3/5: Games Rebuild

Дата проверки: 30 августа 2026 года.

## Итог

**PASS** — Modern OS Games Hub переработан из трёх коротких технических сцен в библиотеку из четырёх самостоятельных игр с локальным прогрессом, адаптивным управлением и игровым immersive-режимом.

## Games Hub

- **PASS** — четыре игры: CORE SHOOTER, BLOCKS, NOVA CIRCUIT, SITEVL MATCH.
- **PASS** — у каждой карточки есть собственная cover-композиция, жанр, описание и управление.
- **PASS** — показаны рекорд, проведённое время или лучший круг, достижения и действие «Продолжить» для MATCH.
- **PASS** — игры загружаются отдельными lazy chunks и не увеличивают initial bundle Modern OS своей полной логикой.
- **PASS** — незавершённые сессии сохраняют игровое время, но не выдают achievement за завершение.

## CORE SHOOTER

- **PASS** — оригинальная raycast-сцена без сторонних WAD, звуков и ресурсов DOOM.
- **PASS** — связанные помещения, двери доступа и выход из сектора.
- **PASS** — три класса противников: дрон, бегун и страж.
- **PASS** — два оружия: импульсное и «Вектор»; боезапас и перезарядка.
- **PASS** — health, ammo, score, damage feedback, pause, restart, game over и finish.
- **PASS** — pickups здоровья, боезапаса и второго оружия.
- **PASS** — WASD, стрелки обзора, Space, R, E, Shift и mouse/pointer-lock обзор.
- **PASS** — мобильный thumbpad, обзор, огонь, взаимодействие и перезарядка.
- **PASS** — противники активируются после первого действия игрока, поэтому чтение HUD не приводит к преждевременной смерти.

## BLOCKS

- **PASS** — поле 10×20, очередь из трёх фигур, hold и ghost-проекция.
- **PASS** — hard drop, soft drop, rotation с простыми wall kicks.
- **PASS** — score, level, lines, combo, high score, pause и restart.
- **PASS** — управление клавиатурой и крупные touch controls.

## NOVA CIRCUIT

- **PASS** — pseudo-3D arcade racing canvas со своей машиной и окружением.
- **PASS** — две трассы: PACIFIC LOOP и NEON PORT.
- **PASS** — три круга, четыре checkpoint-сегмента, столкновения и замедление вне трассы.
- **PASS** — ускорение, тормоз, руление, timer, best lap, restart и fullscreen.
- **PASS** — landscape touch controls используют удержание pointer-событий.

## SITEVL MATCH

- **PASS** — поле 8×8 без готовых совпадений при старте.
- **PASS** — только соседние swap; недопустимый ход возвращается обратно.
- **PASS** — match 3, серии 4/5, каскады и combo scoring.
- **PASS** — серии 4/5 создают row, column или burst special pieces.
- **PASS** — score, moves, objective и последовательность из 12 уровней.
- **PASS** — частицы, короткий WebAudio feedback и haptics после пользовательского действия.

## Fullscreen, Touch, Accessibility

- **PASS** — игровой immersive скрывает LAB bar, Modern OS Menu Bar, Dock и window chrome.
- **PASS** — игровой HUD остаётся доступным; выход возвращает в Games Hub и снимает immersive.
- **PASS** — основные touch targets CORE измерены как 48×48 px на ширине 320 px.
- **PASS** — `user-select: none`, `-webkit-touch-callout: none` и контекстный `touch-action`.
- **PASS** — добавлены aria-label для игровых действий; соблюдены focus states Modern OS.
- **PASS** — reduced motion отключает декоративные игровые переходы.

## Persistence и миграция

- **PASS** — старый storage key не изменён.
- **PASS** — старые записи трёх игр мигрируют с сохранением launches/highScore/bestTime.
- **PASS** — добавлена безопасная запись MATCH.
- **PASS** — сохраняются launches, highScore, bestTime, playTime, achievements, progress и lastPlayedAt.

## Cleanup и производительность

- **PASS** — RAF отменяется при закрытии CORE SHOOTER и NOVA CIRCUIT.
- **PASS** — intervals и keyboard/mouse listeners удаляются в BLOCKS и canvas-играх.
- **PASS** — AudioContext MATCH закрывается при размонтировании.
- **PASS** — CORE, BLOCKS, CIRCUIT и MATCH открыты и закрыты по 10 раз; ошибок консоли нет.
- **PASS** — каждая игра вынесена в отдельный динамический production chunk.

## QA

- **PASS** — representative CORE: выстрел, попадание, перезарядка, HUD и raycast frame.
- **PASS** — representative BLOCKS: hold, hard drop, ghost и изменение игрового поля.
- **PASS** — representative MATCH: найден и выполнен реальный валидный swap; ход уменьшен, начислены очки.
- **PASS** — NOVA CIRCUIT: canvas loop, HUD, выбор трассы, pause/restart и touch/keyboard bindings.
- **PASS** — responsive widths: 320, 375, 390, 430, 768 и 1024 px; horizontal overflow отсутствует.
- **PASS** — desktop visual QA на 1440×900.
- **PASS** — iPad layout QA на 768×1024 и 1024×768.
- **NOT RUN** — физическое длительное удержание педали и полный заезд на реальном iPhone/iPad; browser automation не моделирует продолжительное касание идентично устройству.

## Автоматические проверки

- **PASS** — `npm test`: 78/78.
- **PASS** — `npm run lint`.
- **PASS** — `npx tsc -b --pretty false`.
- **PASS** — `npm run build`.
- **PASS** — SEO generation: 61 sitemap URL и 73 prerendered HTML.
- **PASS** — SEO audit: 61 indexable URL.
- **PASS** — `git diff --check`.
- **PASS WITH WARNING** — Vite сообщает о ранее существующем общем chunk Studio больше 500 kB; игровые модули разбиты на отдельные chunks размером примерно 4–12 kB до gzip.

## Ограничения Phase 3

- SITEVL FARM намеренно не добавлялась: она относится к Phase 4/5.
- Snake, Mines и Breakout не добавлялись: приоритет отдан качеству четырёх основных игр.
- NOVA CIRCUIT использует лёгкий Canvas 2D pseudo-3D renderer, а не тяжёлый WebGL/physics stack.
- Полное прохождение всех трёх кругов и всех 12 уровней MATCH вручную не выполнялось в автоматизированном QA.

Commit, push и deploy не выполнялись.
