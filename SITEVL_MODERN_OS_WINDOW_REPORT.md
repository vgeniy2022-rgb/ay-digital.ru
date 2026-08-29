# SITEVL Modern OS Window Manager Report

Дата: 29 августа 2026 года.

## Итог

PASS — существующий `/lab/modern-os` переведён на единый детерминированный Window Manager без новой ОС, маршрута или storage key. Исправлена подтверждённая production-ошибка, при которой клик по видимой части фонового окна не менял порядок слоёв.

## Реализовано

- PASS — явный `activeWindowId` и совместимая migration состояния с version 1 на version 2.
- PASS — focus поднимает выбранное окно; `z-index` компактно ограничен количеством окон.
- PASS — red traffic light удаляет окно и running indicator.
- PASS — yellow traffic light сворачивает; Dock показывает статус и восстанавливает окно активным.
- PASS — green traffic light сохраняет и точно восстанавливает previous bounds.
- PASS — click по интерактивному содержимому фонового окна не отменяется stale state обработчика приложения.
- PASS — управляемые drag и resize сохраняются в существующий persistence layer.
- PASS — временный mobile clamp не перезаписывает desktop bounds.
- PASS — Dock и App Switcher используют те же open/focus/restore/close функции.
- PASS — App Switcher показывает active/minimized status и умеет закрывать окно.
- PASS — app fullscreen, system fullscreen и maximize являются независимыми режимами.
- PASS — window controls имеют семантические русские labels и mobile hit area 44 x 44 px.
- PASS — системные overlays и brightness layer не блокируют pointer interaction с окнами.

## Browser QA

Проверка выполнена в реальном локальном UI `http://localhost:5173/lab/modern-os` через in-app browser.

- PASS — одновременно открыты Файлы, Браузер, Медиа, SITEVL AI и Настройки.
- PASS — реальный pointer click по видимой части фонового окна поднял его наверх.
- PASS — 20 последовательных переключений через Dock; во всех 20 случаях выбранное окно получило active state и максимальный компактный `z`.
- PASS — minimize удалил Браузер из visible DOM; Dock сообщил «Браузер, свёрнуто»; повторный click восстановил окно верхним.
- PASS — maximize/restore вернул точные `left`, `top`, `width`, `height`.
- PASS — close удалил окно и running status Dock.
- PASS — drag изменил координаты, resize изменил размер; после reload геометрия сохранилась.
- PASS — App Switcher восстановил SITEVL AI и сделал его активным.
- PASS — app fullscreen не включал maximize и корректно завершался через `Esc`.
- PASS — system fullscreen работал через Fullscreen API; CSS fallback также доступен, явная кнопка выхода работает.
- PASS — viewport: 1440x900, 1024x768, 768x1024, 430x800, 390x844, 375x812, 320x700.
- PASS — на всех проверенных ширинах отсутствовал document horizontal overflow.
- PASS — на 430/390/375/320 px window controls имели 44 x 44 px hit area.
- PASS — mobile clamp менял только rendered bounds; после возврата к desktop исходные 900 x 522 px восстановились.

## Автоматические проверки

- PASS — `npm test`: 63/63.
- PASS — `npm run lint`.
- PASS — `npx tsc -b --pretty false`.
- PASS — `npm run build`; Vite production build, 61 sitemap URL, 75 prerendered HTML, SEO audit для 61 indexable URL.
- PASS — `git diff --check`.

## Изменённые файлы

- `src/features/lab/modernOs/modernOsModel.ts`
- `src/features/lab/modernOs/ModernOsPage.tsx`
- `src/features/lab/modernOs/modernOs.css`
- `src/features/lab/modernOs/modernOsModel.test.ts`
- `SITEVL_MODERN_OS_WINDOW_AUDIT.md`
- `SITEVL_MODERN_OS_WINDOW_ARCHITECTURE.md`
- `SITEVL_MODERN_OS_WINDOW_REPORT.md`

## Ограничения

- PASS — Fullscreen API не подменяется и не обходится. Когда браузер не разрешает native fullscreen, используется существующий CSS immersive fallback.
- PASS — production build завершён; Vite сохранил существующее предупреждение о нескольких chunks крупнее 500 kB. Изменённый `ModernOsPage` остаётся отдельным lazy chunk размером около 60 kB и не является источником этого предупреждения.
- NOT RUN — отдельная проверка на физическом iPhone/iPad; размеры Safari-like viewport и touch-targets проверены в браузерном responsive QA.
- NOT RUN — commit, push и deploy запрещены заданием и не выполнялись.
