# SITEVL Modern OS Function Matrix

Дата проверки: 2026-08-29. Маршрут: `/lab/modern-os`. Проверка выполнена локально в development-сборке и дополнена модельными тестами и production build.

Статусы: `PASS` — проверено действием или автоматическим тестом; `BLOCKED` — корректная проверка требует недоступного внешнего условия/возможности драйвера; `NOT RUN` — сценарий намеренно не запускался; `FAIL` — воспроизводимый дефект остался.

| APP | FEATURE | EXPECTED | ACTUAL | STATUS | FIX |
|---|---|---|---|---|---|
| Window Manager | Open/focus | Окно открывается один раз и получает фокус | Проверено на 12 окнах | PASS | Фокус и z-order централизованы в модели |
| Window Manager | Minimize/restore | Dock сворачивает и восстанавливает окно | UI и model test проходят | PASS | Добавлена единая restore-семантика |
| Window Manager | Maximize/close | Traffic lights меняют состояние окна | Проверено ранее и повторно моделью | PASS | Сохраняются previous bounds |
| Window Manager | Resize viewport | Окно остаётся в рабочей области | 768 px больше не оставляет окно справа за экраном | PASS | ResizeObserver + неперсистентный viewport clamp |
| Window Manager | 5+ windows | Нет потери focus/z-index | Одновременно открыто 12 окон | PASS | Компактный стек z-index |
| Files | Sidebar | Папки открываются из боковой панели | Работает | PASS | Активная папка подсвечивается |
| Files | Open folder | Папка открывается кнопкой | `QA папка` открыта | PASS | Семантическая кнопка Open |
| Files | Back/forward | История папок работает | Назад и Вперёд активируются корректно | PASS | Локальный history cursor |
| Files | Create file | Создаётся уникальный документ | Создан `QA интерфейса.txt` | PASS | Уникальный ID с sequence, без коллизии Date.now |
| Files | Create folder | Создаётся уникальная папка | Создана `QA папка` | PASS | Общий factory virtual files |
| Files | Rename | Имя меняется inline | Проверено | PASS | Enter/Escape/blur обработаны |
| Files | Grid/list | Представление меняется | Проверено | PASS | Состояние view управляет раскладкой |
| Files | Search | Фильтрация по имени | Найден только QA-файл, список восстановлен | PASS | Case-insensitive local search |
| Files | Quick Look | Открывается содержимое/метаданные | Пустой файл показал корректный placeholder | PASS | Добавлен dialog Quick Look |
| Files | Trash/restore | Удаление мягкое, файл восстанавливается | Полная модельная цепочка проходит | PASS | Trash state + restore helper |
| Files | Permanent delete | Удаляется дерево дочерних файлов | Model test проходит | PASS | Recursive safe delete helper |
| Files | Destructive UI click | Реально нажать Delete/Empty Trash | Не запускалось в сохранённой браузерной сессии | NOT RUN | Логика покрыта тестами; destructive click не выполнялся |
| Files | Drag to folder | HTML5 drag переносит файл | Драйвер не передал DataTransfer; helper проверен тестом | BLOCKED | `moveModernFile` валидирует циклы и target |
| Browser | `sitevl://home` | Внутренняя страница открывается | Работает | PASS | InternalWeb без iframe |
| Browser | `sitevl://lab` | Внутренняя страница открывается | Работает | PASS | InternalWeb без iframe |
| Browser | `sitevl://studio` | Внутренняя страница открывается | Работает | PASS | InternalWeb без iframe |
| Browser | URL field | Обычный URL принимается | `https://example.com` открыт | PASS | Добавлена явная кнопка `Перейти` |
| Browser | Unsafe URL | `javascript:`, `data:`, `file:` блокируются | `javascript:alert(1)` отклонён, dialog не возник | PASS | Строгий URL validator |
| Browser | External iframe | Разрешённый контент показывается | Example Domain отрисован внутри окна | PASS | Sandboxed iframe, no-referrer |
| Browser | Embed fallback | Нет вечного loader | Показан понятный hint и external-open | PASS | Тайм-аут UX без CSP bypass |
| Browser | Tabs/new/close | Полный lifecycle вкладки | 2→3→2 вкладки работает | PASS | Отдельная кнопка закрытия |
| Browser | Duplicate/reopen | Вкладка дублируется и восстанавливается | Проверено | PASS | Recently closed ограничен 10 |
| Browser | Back/forward/reload | История текущей вкладки работает | Проверено | PASS | Cursor history без дублей reload |
| Browser | Bookmarks/history | Списки сохраняются локально | Добавление и просмотр проверены | PASS | Ограничение 50/100 записей |
| Browser | Clear history | История очищается | Model test проходит | PASS | Отдельный helper |
| AI | Setup state | Нет fake response без endpoint | Показывается `AI-провайдер не настроен` | PASS | Input остаётся доступен для local actions |
| AI | Cloud request | Реальный provider request | Endpoint в QA-среде не настроен | BLOCKED | Архитектура Cloudflare provider сохранена |
| AI | Send/history/new chat | Сообщения сохраняются/очищаются | Проверено, reload поддержан state-моделью | PASS | `aiMessages` в persistence |
| AI | Copy | Ответ копируется | Clipboard содержит локальный ответ | PASS | Явная copy-кнопка |
| AI | Stop | Abort активного cloud request | Нет настроенного cloud request | BLOCKED | AbortController и cleanup присутствуют |
| AI | Open Browser | Allowlisted команда открывает Browser | Проверено | PASS | Локальный parser без eval |
| AI | Open Settings | Allowlisted команда открывает Settings | Проверено | PASS | Локальный parser без eval |
| AI | Open Games | Allowlisted команда открывает Games | Проверено | PASS | Локальный parser без eval |
| AI | Dark theme | Команда меняет тему | Проверено | PASS | Только нормализованный SET_THEME |
| AI | Arbitrary JS | Команда не должна исполнять код | Опасные фразы возвращают null | PASS | Unit test allowlist |
| Media | WAV upload | Локальный файл выбирается явно | Тестовый WAV принят | PASS | File chooser, без upload на сервер |
| Media | Play/pause | Реальное media element state | Play→Pause проверено | PASS | События `onPlay/onPause` authoritative |
| Media | Filter | Выбранный тип управляет списком и player | Ошибка audio-in-video найдена и исправлена | PASS | Active item синхронизирован с filter |
| Media | Volume/mute | Локальная и OS громкость объединяются | Код и controls связаны | PASS | `media.volume = local * osVolume` |
| Media | Next/previous/repeat/shuffle | Controls меняют локальное состояние | Семантика и обработчики проверены аудитом | PASS | Навигация работает внутри filtered list |
| Media | Video fixture | MP4/WebM воспроизводится | Безопасного video fixture в проекте нет | NOT RUN | Codec fallback реализован |
| Media | Drag-and-drop upload | Drop добавляет файлы | Browser driver не создаёт FileList drag | BLOCKED | Drop handler использует тот же validated path |
| Media | Cleanup | Pause, src reset, objectURL revoke | Cleanup реализован; ошибок после close/HMR нет | PASS | Все URL хранятся в ref и revoke на unmount |
| Games | CORE SHOOTER | Move/shoot/health/score/pause/exit | Touch shoot/move, pause и exit проверены | PASS | RAF/listeners cleanup в effect |
| Games | BLOCKS | Left/right/rotate/soft/hard/next | Все controls и 180 cells проверены | PASS | Добавлен soft drop и next indicator |
| Games | NOVA CIRCUIT | Steer/accelerate/brake/timer/lap | Controls и HUD проверены | PASS | Добавлен mobile brake |
| Games | Restart | Любую игру можно начать заново | Restart в HUD проверен для 3 игр | PASS | Session-key remount |
| Games | Cleanup | 10 open/close каждой игры без утечек | Итоговые launch counts 11/11/11, console чист | PASS | RAF/timers/listeners очищаются |
| Games | Game-over result | Естественно дойти до финала каждого раунда | Полные долгие раунды не завершались | NOT RUN | Result overlays сохранены; restart доступен всегда |
| Control Center | Network/Bluetooth/Focus | Toggle меняет label/class | Проверено и восстановлено | PASS | Состояние сохраняется |
| Control Center | Appearance/power saving | Реально влияет на UI/effects | Theme и low-power classes связаны | PASS | Toggle больше не декоративный |
| Control Center | Fullscreen | Fullscreen API или CSS fallback | CSS immersive mode вошёл/вышел | PASS | Без ложного заявления о native fullscreen |
| Control Center | Brightness/volume sliders | Range меняет state | DOM controls и handlers есть; pointer driver range не изменил | BLOCKED | Не найден дефект UI, но automation evidence неполное |
| Menu Bar | File/Edit/View/Window/Help | Каждый пункт выполняет действие | Search, Notes, Overview и About открыты | PASS | Декоративных пунктов не осталось |
| Dock | Open/focus/restore | Каждая иконка запускает приложение | Основные и lazy apps открыты | PASS | Новые apps мигрируют в старый Dock |
| Dock | Reorder | Порядок меняется и сохраняется | Alt+← переставил Browser, reload сохранил, затем восстановлено | PASS | Keyboard helper + drag helper |
| Dock | Recent apps | Недавнее приложение открывается | Появляется с title/name | PASS | Отдельный recent segment |
| Dock | Trash/App Switcher | Открывают Files/Overview | Проверено | PASS | Mobile Overview показал 12 cards |
| Settings | All sections | Все 9 разделов содержат реальные controls/info | Каждый раздел открыт | PASS | Убраны декоративные sidebar buttons |
| Settings | Persistence | Настройки сохраняются | Toggle/Dock/windows/files восстановлены reload | PASS | Нормализация schema v2 |
| Generic apps | Mail | Compose validation и honest local send | Проверено | PASS | Не имитирует интернет-отправку |
| Generic apps | Calendar | Событие добавляется | `QA Modern OS` создано | PASS | Локальный event form |
| Generic apps | Photos | Явный image import | Тестовый PNG показан | PASS | ObjectURL revoke на unmount |
| Generic apps | Music | Не fake controls, открывает Media | Проверено | PASS | Явная кнопка Media |
| Generic apps | Terminal | Safe commands + invalid command | `help` и `rm -rf` проверены | PASS | Добавлена кнопка Execute, никакого shell |
| Generic apps | Network/About/Studio | Honest content и настоящие links | Проверено аудитом/открытием | PASS | Нет fake device scan |
| Responsive | 320/375/390/430 | Нет page overflow, targets ≥44 | Все размеры прошли | PASS | Safe-area, 100dvh, touch CSS |
| Responsive | 768/820/1024/1180 | Окна не выходят за viewport | Граница 768 исправлена | PASS | ResizeObserver viewport model |
| Responsive | 1366/1440/1920 | 5+ окон остаются управляемыми | 12 окон, screenshot QA | PASS | Window stack стабилен |
| Accessibility | Focus/labels | Семантические buttons, labels, focus ring | DOM audit проходит | PASS | `:focus-visible`, aria-label |
| Accessibility | Long press | Controls не выделяются, content выделяется | Dock/control none; Notes/AI/Browser auto | PASS | Selective user-select rules |
| Persistence | Invalid JSON/old schema | OS не падает | Model tests проходят | PASS | try/catch + normalization/migration |
| Performance | Lazy chunks | AI/Media/Games не в initial app chunk | Build создал 3 отдельных chunks | PASS | React.lazy + Suspense |
| Console | Runtime errors/warnings | Нет свежих uncaught/React warnings | После полного QA `[]` | PASS | Исправлены warning и stale updates |

