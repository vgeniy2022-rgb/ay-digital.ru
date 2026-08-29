# SITEVL Modern OS Phase 2 — аудит

## Фактическая реализация

- Маршрут: `/lab/modern-os`, lazy import в `App.tsx`, noindex через `LabShell`, `routeSeo` и SEO generator.
- UI: `src/features/lab/modernOs/ModernOsPage.tsx` и `modernOs.css`.
- Модель: `modernOsModel.ts`, storage key `sitevl-lab-modern-os-v1`.
- LAB: восьмой эксперимент, три достижения, общий progression v2 не менялся.
- Уже работают boot, lock/shutdown, menu bar, Dock, Control Center, notifications, search, overview/spaces, Files, Browser, Notes, Terminal, Settings и demo apps.
- Browser уже блокирует опасные URL schemes и использует sandboxed iframe.
- Mobile до 767 px открывает окна почти на весь доступный viewport.

## Что можно переиспользовать

- Window/state/filesystem/search model и defensive normalization.
- Framer Motion, Lucide, LAB sound/haptics settings.
- SITEVL Studio AI provider abstraction. Она предназначена для `SitePlan`, а не для chat completion, поэтому подделывать разговорный AI нельзя.
- Existing browser URL validator и `sitevl://` renderer.

## Недостатки Phase 1

- Нет Fullscreen API и CSS immersive fallback.
- Материалы функциональны, но геометрия и глубина требуют второго visual pass.
- Games, AI и Media не зарегистрированы как приложения.
- Music — честный placeholder без воспроизведения.
- Dock не разделяет pinned/recent/trash и не поддерживает reorder.
- Back/forward browser buttons визуальны, но не меняют tab history.
- Нет единого touch button primitive и mobile gesture для app switcher.
- External iframe block нельзя надёжно определить из parent document; нужен постоянно доступный честный fallback.

## Решение Phase 2

- Расширить существующую schema через migration внутри `normalizeModernOsState`, сохранив storage key и старые данные.
- Добавить lazy chunks Games, Media и AI.
- Реализовать настоящий Fullscreen API и CSS immersive fallback для iOS.
- Игры строить только из оригинальных Canvas/CSS primitives, без DOOM WAD, Tetris presentation и коммерческих assets.
- Media обрабатывать локально через user-selected files/Object URLs с обязательным revoke.
- AI UI подключать только к существующим проверяемым capabilities; при отсутствии conversational endpoint показывать unavailable state.
