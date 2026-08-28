# SITEVL Retro Phase 4 — архитектура

## Shared filesystem

`retroState.ts` содержит schema v4 и читает старый `sitevl-lab-retro-v3`. Файлы имеют parent, type, content, created/updated timestamps, approximate size, mimeType, hidden, readonly и trash metadata. Readonly-файлы нельзя переименовать, переместить или отправить в корзину.

## OS adapters и окна

Три ОС используют общие app models, но разные launchers/chrome: DESK 95 — taskbar/start menu, CLASSIC DESK — верхнее меню и desktop trash, CLASSIC MONO — монохромная верхняя панель и double-line windows. Позиции, размеры, minimized/maximized и набор окон сохраняются отдельно для каждой системы. Внешняя Browser URL после reload не восстанавливается.

## Application system

Системные приложения перечислены в `installedApps`. SVP installer меняет только этот whitelist и не исполняет код. Системные app IDs защищены от удаления. Новые приложения подключаются к единому state через `state/onChange`.

## Virtual network

`retroAdventure.ts` описывает DESK95-PC, CLASSIC-DESK, MONO-STATION и LAB-SERVER. Это локальная игровая модель без сетевого сканирования. LAB-SERVER принимает только игровые credentials и открывает readonly server storage.

## Browser и security

Разрешены `http:`, `https:` и фиксированные `sitevl://` URL. Опасные схемы отклоняются. Внешний iframe sandboxed; CSP/X-Frame bypass и proxy отсутствуют. HTML LAB удаляет script/iframe/object/embed, event handlers, javascript URLs, CSS imports и external url(). Пользовательский JavaScript не исполняется.

## Mail, Chat и Quest

Почта хранит read/attachment state; вложения создают обычные виртуальные файлы. IRC является локальным deterministic responder. Quest хранит monotonically advancing step и bounded event journal; подсказки распределены между OLD_LOG, mail, #core и LAB-SERVER.

## BASIC

Parser принимает только PRINT, CLEAR, COLOR, BEEP, WAIT, LET и ADD. `eval` не используется. WAIT валидируется и ограничивается. Программа может сохраняться как `PROGRAM.BAS`.

## Persistence и backup

Schema v4 хранит filesystem, network, mail, chat, quest, installed apps, desktop/window settings, browser и scores. Backup имеет kind/schemaVersion, валидируется до импорта и исключает camera/audio personal media MIME types.
