# SITEVL Modern OS Window Audit

Дата аудита: 29 августа 2026 года.

## Область проверки

- `src/features/lab/modernOs/ModernOsPage.tsx`
- `src/features/lab/modernOs/modernOsModel.ts`
- `src/features/lab/modernOs/modernOs.css`
- `src/features/lab/modernOs/ModernTouchButton.tsx`
- production: `https://ay-digital-ru.vercel.app/lab/modern-os`

Проверка production выполнялась реальными кликами: одновременно открыты Файлы, Браузер, Медиа, SITEVL AI и Настройки; отдельно проверены minimize, Dock restore и maximize/restore.

## Корневая причина потери фокуса

`focusModernWindow()` увеличивал `z` выбранного окна, но каждый вызов проходил через общий `updateState()`. Сразу после обновления `updateState()` вызывал `normalizeModernOsState()`, где всем окнам безусловно назначался `z: index + 1`. Новый `z` выбранного окна мгновенно терялся. DOM действительно получал `pointerdown` на видимой части заднего окна, однако нормализатор возвращал прежний порядок слоёв.

Это же нарушало сценарии Dock: открытое фоновое приложение находилось, но его попытка выйти наверх отменялась нормализацией.

## Дополнительные проблемы

1. В состоянии отсутствовал явный `activeWindowId`; активность косвенно определялась по максимальному `z`.
2. `z` увеличивался без ограничений при каждом focus.
3. Minimize, close, focus и maximize были отдельными несвязанными patch-операциями без единого правила выбора следующего активного окна.
4. `pointerdown` на traffic lights всплывал в draggable-заголовок. Нажатие на close/minimize/maximize одновременно начинало drag и могло сдвинуть окно.
5. Maximize хранил только boolean и не фиксировал `previousBounds` явно.
6. `resize: both` менял только DOM-размер. Новые width/height не попадали в persistence.
7. После resize viewport/orientation координаты окон не нормализовались относительно новой рабочей области.
8. App Switcher не показывал active/minimized state и не позволял закрыть отдельное окно.
9. Traffic lights имели hit area 13 x 13 px на desktop и 22 x 22 px на mobile.
10. Декоративные glyph находились внутри кнопок, но из-за слишком маленькой hit area и запуска drag воспринимались как отдельные неработающие элементы.

## Stacking contexts и overlays

- `.nova-desktop` использует `isolation:isolate`, что корректно ограничивает внутреннюю систему слоёв.
- `backdrop-filter` создаёт stacking contexts у окон, Dock и панелей, поэтому их уровни должны задаваться на корневых элементах этих компонентов.
- `.nova-brightness-overlay` уже имеет `pointer-events:none` и не блокирует окна.
- Menu Bar, Dock, Control Center, Notifications, Search/Overview и boot/lock overlay используют отдельные системные уровни. Их сохраняем, но desktop windows получают компактный детерминированный диапазон.
- Невидимый capture layer над неактивными окнами отсутствует и добавляться не будет.

## Решение

- Сохранить единый массив окон и storage key.
- Добавить совместимую schema migration с `activeWindowId` и `previousBounds`.
- Централизовать open, focus, minimize, restore, maximize/restore, close, patch и viewport clamp в `modernOsModel.ts`.
- Компактно перенумеровывать `z` в диапазоне `1...windows.length`, не меняя DOM-порядок keyed-окон во время pointerdown.
- Остановить propagation у window controls и resize handle.
- Заменить неперсистентный нативный resize на управляемый pointer-resize.
- Использовать тот же Window Manager для Dock, App Switcher и keyboard shortcuts.

