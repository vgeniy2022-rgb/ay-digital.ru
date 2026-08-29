# SITEVL FARM — архитектура

## Границы модуля

- `modernFarmModel.ts`: чистая модель, конфигурации, миграция, экономика, timestamps, backup.
- `modernFarmRenderer.ts`: единый Canvas 2D renderer карты, полей, животных, декораций, погоды и освещения.
- `ModernFarmGame.tsx`: input, HUD, панели, pause, export/import, screenshot и связь с Games Hub.
- `ModernGames.tsx`: lazy load, активное игровое время, карточка статуса и lifecycle игровой сессии.
- `ModernOsPage.tsx`: debounced persistence, grouped notifications, LAB achievements, AI actions.

## Сохранение и миграция

Farm остаётся полем `ModernOsState.farm`; ключ хранения Modern OS не менялся. `normalizeFarmState` принимает старые объекты, фильтрует неизвестные ID, ограничивает числа/массивы и восстанавливает безопасные стартовые поля. Повреждённый общий JSON по-прежнему восстанавливается штатной нормализацией Modern OS; сброс в UI затрагивает только Farm.

Autosave отложен на 260 мс. Синхронный flush выполняется на `pagehide` и `visibilitychange`. Экспорт использует `{ kind, schemaVersion, exportedAt, farm }`; импорт только разбирает JSON, проверяет marker/version и не исполняет код.

## Игровой цикл

- Посадка расходует 1 единицу культуры, сбор возвращает 3.
- Crop, production, animal и fishing используют абсолютные timestamps, поэтому offline progress не требует фонового таймера.
- Один RAF рисует Canvas. Он отключается при паузе, скрытой вкладке и размонтировании.
- React timer с частотой 500 мс обновляет текстовые таймеры и переносит завершённое производство в амбар.

## Производительность

- Farm загружается через `React.lazy` только после запуска из Games Hub.
- Procedural Canvas исключает raster preload и смешение asset packs.
- Device pixel ratio ограничен 2; state нормализует максимум 60 полей, 24 процессов и 12 животных.
- Rain: 14/26/40 линий по quality; при reduced effects и low power не рисуется.
- WebAudio создаётся только после важного действия и закрывается после короткого UI-сигнала.

## Безопасность и доступность

- Нет HTML injection, `eval`, пользовательского JavaScript, backend, trackers и сетевой отправки данных.
- Импорт ограничен JSON-схемой; screenshot строится из собственного Canvas.
- Keyboard: Esc, `+`, `-`, стрелки/WASD; input/select не перехватываются.
- Touch: pointer capture, pan, pinch, кнопки 44 px на mobile, safe-area и selectable описания.

