# SITEVL LAB Phase 2 — аудит до реализации

Дата аудита: 2026-08-28

## Область проверки

Проверены `src/features/lab/`, LAB-ветка в `src/App.tsx`, lazy imports,
localStorage, achievements, WebAudio, vibration/orientation, Canvas 2D,
Three.js, requestAnimationFrame lifecycle, ResizeObserver и адаптивные стили.

## Существующие эксперименты

1. `/lab/builder`: рабочий SITEVL Studio в LAB-оболочке.
2. `/lab/2d`: короткая Canvas 2D-сцена с прыжком, разрушением и двумя switches.
3. `/lab/3d`: одна процедурная Three.js-комната с четырьмя интерактивными объектами.
4. `/lab/physics`: Canvas 2D-песочница с шестью типами тел и gravity presets.
5. `/lab/os`: вымышленный desktop с Files, Terminal, Notes, Browser, Settings и About.
6. `/lab/retro`: две стилизации ранних desktop OS с несколькими мини-приложениями.
7. `/lab/canvas`: Canvas 2D-доска с pan, zoom, фигурами и связями.

## Пользовательские строки на английском

Английские строки находились во всех LAB-модулях: hero и каталог (`EXPERIMENTAL
WEB ENVIRONMENT`, `SURPRISE ME`, `ENTER`, `EXPLORED`), achievements, системная
панель, HUD 2D/3D, названия controls, completion overlays, physics controls,
boot screen и приложения SITEVL OS, Retro OS, Canvas toolbar и inspector.
Технические идентификаторы `FPS`, `WebGL`, `CPU`, `GPU`, `RAM`, `URL`, `HTML`,
`CSS`, `JSON`, `PNG`, `WebP` не требуют перевода.

## Общие ограничения и UX-проблемы

- State v1 не различает посещённый и завершённый эксперимент.
- Нет XP, level, secrets, activity statistics и resumable experiment state.
- Random выбирает любой модуль, включая уже исследованный.
- Достижений только семь; нет категорий и reward weight.
- Нет единого словаря, поэтому перевод через глобальный replace был бы хрупким.
- Sound представлен независимыми AudioContext в модулях, без master/effects/ambient.
- Mobile controls есть в играх, но часть подсказок остаётся desktop-oriented.
- Состояние OS, Physics и Canvas хранится отдельными несогласованными ключами.
- Completion и achievement feedback недостаточно заметны.

## Gameplay и слабые места

### Break the Website

Одна длинная зона, базовый jump, два switches и CORE. Нет checkpoints, dash,
двойного прыжка, collectibles, secrets, stage progression и итоговой статистики.
Управление и loop очищаются корректно, но game state не продолжается после reload.

### The Room

Процедурная WebGL-сцена производительна и корректно dispose-ится. Ограничения:
одно пространство, четыре независимых raycast targets, нет puzzle sequencing,
pause/settings/FOV/sensitivity и data fragments. Pointer lock не используется,
поэтому риск застрявшего lock отсутствует; текущий drag-look проще для mobile.

### Physics Lab

Есть гравитация, столкновения, drag/throw и шесть объектов. Нет режимов/presets,
time scale, pause, freeze/duplicate, scene slots и soft-limit messaging. Парные
столкновения имеют квадратичную сложность, поэтому object cap обязателен.

### SITEVL OS

Окна перемещаются, фокусируются, сворачиваются и закрываются. Нет maximize/snap,
виртуальной файловой системы, нескольких notes, calculator/gallery/task manager/
paint. Memory indicators должны явно оставаться оценкой самого web-приложения.

### Retro Computing

Сильная визуальная стилизация, но playground короткий: нет boot sequence, floppy
directory и игры. Calculator/paint/notes работают локально. Нельзя копировать
официальные бренды и assets; текущие собственные названия следует сохранить.

### Infinite Canvas

Canvas renderer не создаёт бесконечный DOM и поддерживает pinch. Не хватает
undo/redo, документов, шаблонов, minimap, ordering, lock/hide, export и image
workflow. Base64-изображения нельзя бесконтрольно сохранять в общий LAB state.

## Mobile/touch

CSS содержит responsive breakpoints, 2D/3D имеют touch controls, Canvas имеет
pinch. Требуется улучшить touch targets при 320 px, не перекрывать HUD, добавить
pause/settings, safe-area offsets и убрать обязательность hover. Device sensors
должны оставаться permission-based progressive enhancement.

## Lifecycle и потенциальные утечки

Текущие realtime-модули уже снимают keyboard/pointer/visibility listeners,
отключают observers и cancel RAF. Three.js dispose-ит geometries/materials/textures
и renderer. Риски Phase 2: дополнительные timers, AudioContext, object URLs,
document listeners и autosave debounce. Для каждого нового ресурса нужен cleanup.

## Производительность

- Все LAB pages уже lazy-loaded.
- Three.js находится в отдельном chunk и загружается только для `/lab/3d`.
- 3D имеет capped DPR, quality presets, FPS guard и hidden-tab pause.
- Physics pair solver требует soft cap (ориентир 120 тел, lower cap на mobile).
- Infinite Canvas должен сохранить один renderer и viewport culling.
- Не нужны новые тяжёлые зависимости или внешние модели/аудио.

## Что расширять

Общие progression/storage/i18n/audio, каталог и статистику; staged objectives в
2D/3D; presets и scene slots в Physics; реальные локальные apps в OS/Retro;
documents/history/templates/export в Canvas; touch/pause/accessibility везде.

## Что оставить простым

SITEVL Studio нельзя переписывать. 3D должна остаться процедурной и компактной.
Physics не должна становиться инженерным solver. SITEVL OS не выполняет реальные
system commands. Retro не копирует Windows/macOS. Canvas не хранит тяжёлые base64
assets и не превращается в полноценный Figma-клон.
