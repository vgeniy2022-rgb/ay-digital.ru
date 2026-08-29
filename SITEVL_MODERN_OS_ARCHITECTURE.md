# SITEVL NOVA — архитектура

## Route и LAB

`/lab/modern-os` lazy-загружает `ModernOsPage`. `LabShell` выставляет `noindex, follow`, canonical и отмечает эксперимент исследованным. Каталог LAB содержит восьмую карточку и три достижения NOVA.

## State

`ModernOsState` имеет `version: 1` и проходит через `normalizeModernOsState` перед записью. Сохраняются theme, wallpaper, brightness, sound, Dock, окна, пространства, файлы, заметки, browser tabs/history/bookmarks и notifications.

Повреждённые app IDs удаляются, числа ограничиваются безопасными диапазонами, вкладки ограничены 20, окна — 12, history — 100, notifications — 30.

## Window manager

Окна используют общий `ModernWindow`: app ID, geometry, z-index, minimized/maximized и space 1–3. Доступны open, focus, minimize, maximize, close и pointer drag. На ширине до 767 px окно автоматически занимает почти весь экран.

## Filesystem

`ModernFile` поддерживает folder/text/image/audio/video/json, metadata, tags, favorite и trash marker. V1 реализует каталог, поиск, создание папки/текста, перенос в корзину и восстановление. Операции существуют только в виртуальном state.

## Browser

Browser поддерживает до 20 вкладок, local history, recently closed state и внутренние `sitevl://home|lab|studio|about|help`. Валидатор разрешает только `http`, `https` и известные `sitevl` URL; `javascript`, `data`, `file` и другие схемы отклоняются.

Внешние страницы открываются в sandboxed iframe. Постоянно доступна безопасная кнопка внешнего открытия с `noopener,noreferrer`; CSP/X-Frame-Options не обходятся.

## Search

Lightweight search строится по зарегистрированным приложениям, именам виртуальных файлов и содержимому локальных заметок. Никаких системных индексов устройства не читается.

## Retro integration

Приложение «Сеть» отображает только логические Retro computers. Оно не сканирует LAN и не читает личные файлы. Общий storage adapter не включён, чтобы не менять Retro schema v4.

## Security и privacy

- нет shell, eval и произвольного JS;
- URL allowlist по protocol;
- iframe sandbox;
- local-only persistence;
- камера/микрофон не запрашиваются;
- виртуальные батарея, Bluetooth и сеть явно являются частью симуляции.
