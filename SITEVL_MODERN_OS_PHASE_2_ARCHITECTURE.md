# SITEVL Modern OS Phase 2 — архитектура

## Границы модуля

Phase 2 расширяет существующий маршрут `/lab/modern-os`. Основной экран, модель состояния и CSS остаются в `src/features/lab/modernOs/`; новая копия ОС и новый storage layer не создавались.

## Состояние и миграция

- `modernOsModel.ts` остаётся единственным источником типов и pure-функций Modern OS.
- Ключ `sitevl-lab-modern-os-v1` сохранён для совместимости с Phase 1.
- `normalizeModernOsState` добавляет безопасные defaults для `recentApps`, `lowPowerMode` и игровых результатов.
- Неизвестные app IDs, окна и опасные значения отбрасываются при чтении.
- Игровые рекорды, число завершённых сессий и лучшее время сохраняются вместе с текущим OS state.

## Приложения

- `ModernGames.tsx`: lazy chunk с CORE SHOOTER, BLOCKS и NOVA CIRCUIT. Canvas loops и keyboard listeners удаляются при unmount.
- `ModernMedia.tsx`: lazy chunk для локальных audio/video файлов. Используются Object URLs, которые освобождаются при закрытии приложения.
- `ModernAi.tsx`: lazy UI поверх существующего `CloudflareAIProvider`. Локальный site-plan generator не выдаётся за conversational AI.
- `ModernTouchButton.tsx`: общая touch-кнопка с минимальной интерактивной областью, press feedback и опциональной Vibration API.

## Fullscreen

- Fullscreen всей ОС сначала использует стандартный Fullscreen API.
- Если API недоступен или отклонён, включается CSS immersive mode с `100dvh`, скрытым LAB shell и без внешних полей.
- Fullscreen приложения является отдельным состоянием: окно занимает всю доступную область ОС, Dock и Menu Bar скрываются.
- `Esc` закрывает popover, overview и immersive app; нативный Fullscreen API обрабатывает системный `Esc` браузера.

## Browser

- Разрешены только `http:`, `https:` и allowlist внутренних `sitevl://` страниц.
- `javascript:`, `data:`, `file:` и неизвестные схемы блокируются до создания iframe.
- Добавлены back, forward, home, duplicate tab и reopen closed tab.
- Внешний iframe остаётся sandboxed. CSP и `X-Frame-Options` не обходятся; пользователю всегда доступна безопасная внешняя вкладка с `noopener,noreferrer`.

## AI и безопасность

- Cloud availability определяется существующей переменной `VITE_SITEVL_AI_ENDPOINT`.
- Без endpoint поле ввода и Send отключены, отображается «AI-провайдер не настроен».
- В system context передаются только названия виртуальных файлов и metadata, содержимое пользовательских документов автоматически не отправляется.
- Системные действия проходят через `normalizeModernAiAction`: произвольный JavaScript, shell и неизвестные команды отклоняются.

## Media и приватность

- Файлы выбираются только явным действием пользователя или drag-and-drop.
- Нет автоматической загрузки, сетевого запроса или доступа к системной медиатеке.
- Поддержка codec определяется браузером; UI не обещает воспроизведение неподдерживаемого формата.

## Производительность

- Games, Media и AI загружаются отдельными Vite chunks через `React.lazy`.
- Canvas ограничен `devicePixelRatio <= 2`.
- Low Power Mode уменьшает blur, saturation и динамический background layer.
- RAF, interval, keyboard listeners, AbortController и Object URLs имеют cleanup.

## Responsive model

- До 767 px приложение открывается почти на весь экран; Dock прокручивается горизонтально.
- Swipe вверх от нижней зоны открывает App Switcher, не перехватывая системный edge gesture.
- На iPad сохраняются floating windows. Их ширина и координата совместно ограничиваются текущим viewport.
- Text selection отключён только у controls; textarea и редакторы остаются selectable.

