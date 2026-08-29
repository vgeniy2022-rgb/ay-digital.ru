# SITEVL Modern OS — Functional Hardening Report

Дата: 2026-08-29  
Проверяемый маршрут: `/lab/modern-os`  
Production reference использовался только как ориентир; production не изменялся и не деплоился.

## Итог

`PASS` — Modern OS прошла глубокий локальный hardening: реальные UI-сценарии, responsive QA, persistence, broken-state tests, build и console audit. Найденные ошибки исправлялись сразу, а не маскировались snapshot-проверками.

## Window Manager — PASS

- Сохранены предыдущие незакоммиченные исправления focus, z-order, minimize/restore, maximize/close, drag/resize и App Switcher.
- Одновременно восстановлено и показано 12 окон; активное приложение корректно отражается в menu bar.
- Исправлен планшетный дефект: при переходе с 1920 px на 768 px окно сжималось, но сохраняло старый `left` и уходило вправо. `ResizeObserver` теперь передаёт фактическую рабочую область, не разрушая desktop bounds в persistence.

## Files — PASS / BLOCKED

- `PASS`: sidebar, folder open, back, forward, create folder/file, rename, grid/list, search, Quick Look, persistence.
- Исправлена коллизия ID при двух созданиях в одну миллисекунду: `Date.now()` дополнен monotonic sequence.
- `PASS` model: trash, restore, permanent recursive delete, empty trash, move и защита от циклов.
- `BLOCKED`: browser driver не сформировал HTML5 `DataTransfer` для end-to-end drag. Перенос и его ограничения покрыты model test.
- `NOT RUN`: destructive UI click в сохранённой браузерной сессии; модельная логика проверена полностью.

## Browser — PASS

- Проверены `sitevl://home`, `sitevl://lab`, `sitevl://studio`, `sitevl://help`, `https://example.com`.
- Добавлена явная кнопка `Перейти`; Enter остаётся рабочим form submit.
- Проверены tabs, new, close, duplicate, reopen, back, forward, reload, bookmarks и history.
- `javascript:alert(1)` заблокирован; dialog не возник. Разрешены только `http`, `https`, `sitevl`.
- Внешний iframe sandboxed; ограничения CSP/X-Frame не обходятся. Показывается честный hint и кнопка безопасного открытия во внешнем браузере.

## AI — PASS / BLOCKED

- `PASS`: setup-state без fake response, New Chat, local history, Copy, clear, persistence.
- `PASS`: команды `Открой браузер`, `Открой настройки`, `Открой игры`, `Включи тёмную тему` выполняются через allowlist.
- Arbitrary JS, shell и неизвестные действия не исполняются.
- `BLOCKED`: cloud request и Stop не могли быть проверены без настроенного `VITE_SITEVL_AI_ENDPOINT`; AbortController и cleanup сохранены.

## Media — PASS / BLOCKED / NOT RUN

- Безопасный тестовый WAV выбран через реальный file chooser; play/pause подтверждены событиями media element.
- Исправлена ошибка фильтра: при выборе `Видео` аудиофайл исчезал из списка, но оставался активным player. Теперь filter синхронизирует list и active item.
- OS volume умножается на локальную громкость; mute/repeat/shuffle/next/previous имеют реальные handlers.
- Object URL, media src и playback очищаются на unmount.
- `NOT RUN`: video codec scenario, потому что в проекте нет безопасного MP4/WebM fixture.
- `BLOCKED`: drag-file upload не воспроизведён browser driver; обычный explicit upload прошёл.

## Games — PASS

- CORE SHOOTER: canvas, move, shoot, health/ammo/score, pause, touch, fullscreen control, exit.
- BLOCKS: 180 cells, left/right/rotate/soft drop/hard drop, next indicator, pause, touch.
- NOVA CIRCUIT: steer, accelerate, brake, lap/timer, pause, touch.
- Добавлен доступный Restart в HUD каждой игры; все три restart-сценария проверены.
- Каждая игра открыта/закрыта минимум 10 раз; сохранённые счётчики достигли `11/11/11`, свежих console warnings/errors нет.
- `NOT RUN`: естественное полное прохождение до game-over/finish всех трёх длинных раундов.

## Control Center, Dock, Settings — PASS / BLOCKED

- Network, Bluetooth, Focus, theme, power saving и notifications меняют реальные state/class/labels.
- Fullscreen API корректно перешёл в CSS immersive fallback и вышел по Esc.
- Все 9 Settings sections открыты; декоративные controls удалены или подключены.
- Dock открывает, фокусирует и восстанавливает apps. Новые Games/Media/AI автоматически добавляются в legacy Dock без потери порядка остальных иконок.
- Dock reorder доступен drag и клавиатурой `Alt/Option + ←/→`; перестановка Browser→Files пережила reload и была восстановлена обратно.
- `BLOCKED`: range pointer automation не смогла изменить brightness/volume, хотя controls, accessible roles и state handlers присутствуют.

## Generic Apps — PASS

- Mail: обязательные тема/текст, локальное сохранение с честным сообщением без интернет-отправки.
- Calendar: добавлено локальное событие.
- Photos: явно выбран PNG, изображение отрисовано, URL очищается на unmount.
- Music: нет fake-player, открывает Media.
- Terminal: `help` и неизвестная `rm -rf` проверены; добавлена кнопка `Выполнить команду` для mobile/virtual keyboard. Терминал не выполняет shell.
- Network/About/Studio показывают честную виртуальную информацию и реальные внутренние ссылки.

## Mobile, iPad, Desktop — PASS

- Проверены viewport: `320×700`, `375×812`, `390×844`, `430×900`, `768×1024`, `820×1180`, `1024×768`, `1180×820`, `1366×768`, `1440×900`, `1920×1080`.
- На 320–430 и 768–1024 нет горизонтального page overflow; активные controls имеют минимум 44×44 px.
- Browser toolbar прокручивается внутри окна, не расширяя страницу.
- Mobile App Switcher показал 12 карточек при ширине 390 px без overflow.
- Используются `100dvh` и `env(safe-area-inset-*)`; старый `100vh` не является основой layout.
- Физические iPhone/iPad не подключались: hardware Safari permission/keyboard behavior остаётся `NOT RUN`.

## Persistence и Broken State — PASS

- Reload восстановил virtual file, окна, браузерные данные, game counters, settings и Dock order.
- Tests покрывают invalid JSON, old schema, missing fields, unknown app, invalid bounds, legacy Dock и unsafe AI state.
- Старые данные не удаляются; schema остаётся v2, storage key не менялся.

## Performance и Memory — PASS

- Production build создал отдельные lazy chunks: `ModernAi`, `ModernMedia`, `ModernGames`.
- Games используют RAF/timer/listener cleanup; Media удаляет src и revoke objectURL; AI aborts controller; ResizeObserver disconnects; browser iframe удаляется вместе с окном.
- Общий build предупреждает о существующем chunk `studio` >500 kB; это вне Modern OS и не создано этой итерацией.

## Accessibility и русский UI — PASS

- Проверены button semantics, aria-label, focus-visible, reduced-motion и selective text selection.
- Dock/window/game/control-center используют `user-select:none`; Notes, AI messages и Browser text остаются selectable.
- Переведены неоправданные `lightweight`, `assets`, `browser-native`, `Renderer`, `online`, `SITEVL GAME SYSTEM`, `VERSION/BROWSER EDITION`.
- Сохранены оправданные SITEVL, AI, FPS, URL, JSON, WebGL, WebGPU и названия игр.

## Проверки

- `PASS` `npm test`: 69/69 на финальном прогоне после реализации и документации.
- `PASS` `npm run lint`.
- `PASS` `npx tsc -b --pretty false`.
- `PASS` `npm run build`; сгенерированы 61 URL в sitemap и 75 prerendered HTML, SEO audit подтвердил 61 индексируемый URL.
- `PASS` `git diff --check`.
- `PASS` Browser console: нет свежих warning/error после полного UI-прогона.
- `NOT RUN` commit, push, deploy — запрещены заданием.
