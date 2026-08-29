# SITEVL Modern OS Window Manager Architecture

Дата: 29 августа 2026 года.

## Источник истины

Окна SITEVL Modern OS хранятся в едином `ModernOsState.windows`. Активное окно задаётся полем `activeWindowId`, активный рабочий стол — `activeSpace`. Dock, App Switcher, клавиатурные команды и сами окна используют одни и те же чистые функции из `modernOsModel.ts`.

Существующий storage key `sitevl-lab-modern-os-v1` сохранён. Версия данных повышена до `2`; `normalizeModernOsState()` мигрирует старые записи без `activeWindowId` и `previousBounds`, выбирая верхнее видимое окно текущего рабочего стола.

## Операции менеджера

- `openModernWindow()` восстанавливает уже открытое приложение и поднимает его наверх; дубликат окна не создаётся.
- `focusModernWindow()` снимает minimize, переключает рабочий стол при необходимости и делает окно активным.
- `minimizeModernWindow()` скрывает окно и выбирает следующее верхнее видимое окно.
- `restoreModernWindow()` использует тот же focus-путь, поэтому Dock и App Switcher ведут себя одинаково.
- `toggleMaximizeModernWindow()` сохраняет точные `x`, `y`, `width`, `height` в `previousBounds` и восстанавливает их повторным вызовом.
- `closeModernWindow()` удаляет окно и безопасно выбирает следующий active window.
- `patchModernWindow()` сохраняет управляемые drag/resize bounds.

## Порядок слоёв

`compactWindowStack()` ранжирует окна по текущему `z`, сохраняет DOM-порядок React-элементов и назначает компактный диапазон `1...N`. При focus выбранный id переносится в конец логического стека. Это исключает бесконечный рост `z-index` и не отменяет pointer event перестановкой keyed DOM-узлов.

Системные overlays остаются отдельными слоями: Menu Bar, Dock, Control Center, Notifications, Search, App Switcher, boot и lock. Декоративный brightness overlay не принимает pointer events.

## Pointer interactions

Корневое окно обрабатывает focus. Для интерактивного содержимого финальная focus-операция выполняется после собственного `click` элемента, поэтому stale render обработчика приложения не может вернуть старый стек. Window controls и resize handle останавливают всплытие.

Title Bar использует Pointer Events и `setPointerCapture()` для drag. Resize marker использует тот же механизм и записывает новые bounds через Window Manager. На компактном viewport drag/resize отключаются: окно занимает доступную мобильную область.

Viewport clamp применяется к отображаемым bounds без записи временного мобильного размера в persistence. После возврата к desktop исходная геометрия восстанавливается.

## Три режима размера

1. `windowed`: окно использует сохранённые bounds.
2. `maximized`: окно занимает рабочую область, а `previousBounds` остаются в модели.
3. `app fullscreen`: только выбранное приложение получает immersive presentation; `maximized` не меняется.

Системный fullscreen хранится отдельно на уровне страницы. Используется Fullscreen API, а при отказе браузера — CSS immersive fallback. `Esc` закрывает app fullscreen и системный fallback.

## Доступность и mobile

Traffic lights являются обычными `button` с русскими `aria-label` и `title`. Визуальный круг отделён через `::before`, а hit area составляет 28 px на desktop и 44 px на экранах уже 768 px. Активное окно получает программный focus без прокрутки, а App Switcher сообщает статусы «Активно» и «Свёрнуто».

## Тестовая граница

Чистые функции менеджера покрыты unit-тестами: миграция, focus, ограниченный z-stack, minimize/restore, maximize/restore, close и viewport clamp. Browser QA проверяет интеграцию реальными pointer interactions, поскольку DOM-hit testing и stacking contexts не доказываются unit-тестом.
