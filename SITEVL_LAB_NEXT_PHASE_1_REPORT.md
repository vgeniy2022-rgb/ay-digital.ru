# SITEVL LAB NEXT — Phase 1 Report

Дата: 2026-08-30  
Проект: `/Users/aleksandrasineckij/Documents/ay-digital.ru`  
Этап: Cleanup & Restructure

## Итог

`PASS` SITEVL LAB переведён с фиксированного набора из восьми карточек на курируемый динамический каталог.  
`PASS` Публичная корзина, не связанная с e-commerce/API, удалена.  
`PASS` Modern OS, Studio, Physics, Infinite Canvas, CMS, SEO и виртуальные корзины OS не затронуты.

## Актуальный каталог

### Создавать

- SITEVL Studio.
- Infinite Canvas.

### Экспериментировать

- Physics Lab.

### Системы

- Modern OS / SITEVL NOVA.
- Retro Computer / DESK 95.

`PASS` На `/lab` фактически отрисованы 5 карточек в 3 смысловых группах.  
`PASS` Break SITEVL, THE ROOM и старая SITEVL OS не показываются в каталоге.

## Legacy-модули

- `/lab/os` без 404 перенаправляет в `/lab/modern-os`.
- `/lab/2d` сохранён как legacy route для Break SITEVL.
- `/lab/3d` сохранён как legacy route для THE ROOM.
- Код старой OS не удалялся агрессивно и больше не входит в активный route bundle.

## Retro

`PASS` Единственная публичная Retro OS — DESK 95, как наиболее цельный компьютер середины 90-х.  
`PASS` Экран выбора `classic`/`mono` и переключатель убраны из публичного UI.  
`PASS` Legacy schema, окна, `visitedSystems`, достижения и старые сохранения не удалены.  
`PASS` Files, floppy, CD, terminal, browser, Paint, Notes, games, network, Safe Mode data, secrets и quest остались в общей логике.  
`PASS` CLASSIC-DESK и MONO-STATION могут существовать в квесте как архивные сетевые узлы; переключать оболочку для прохождения не требуется.

## Break SITEVL

`PASS` Игра оценена отдельно. Механика работает: Canvas 2D, физика, пять зон, checkpoints, dash, fragments, persistence и CORE.  
`PASS` Игра убрана из основного каталога: её визуальная и продуктовая глубина ниже текущих системных экспериментов.  
`NOT RUN` Глубокая переработка Break SITEVL отложена до следующей Phase.

## Progression migration

`PASS` Актуальный публичный каталог отделён от полного списка известных historical ID.  
`PASS` Старые `game2d`, `game3d`, `os`, `classic` и `mono` не теряются при нормализации.  
`PASS` Счётчики `explored`/`completed` и `LAB_COMPLETE` учитывают только текущий каталог.  
`PASS` Фиксированные `0/7`, `5/7`, `7/7` и строки про семь/восемь экспериментов убраны из актуального UI.

## Публичная корзина

`PASS` Удалены Header icon/badge, AddToCart controls, provider, context, hook, типы, persistence, utility и страницы.  
`PASS` Карточки услуг, цен и акции сохранили прямые Telegram CTA.  
`PASS` `/cart` переводит в `/services`, `/checkout` — в `/contacts`; эти технические URL не попадают в sitemap и не рендерят корзину.  
`PASS` Trash/Корзина в Retro и Modern OS не затронуты.

## Navigation

`PASS` Desktop label: `LAB (Мои эксперименты)`.  
`PASS` Mobile menu label: `Мои эксперименты`.

## Route и visual QA

`PASS` `/`, `/lab`, `/lab/modern-os`, `/lab/retro`, `/lab/physics`, `/lab/canvas`, `/studio`.  
`PASS` Legacy `/lab/2d`, `/lab/3d`, redirect `/lab/os`.  
`PASS` В браузере не обнаружены 404, console errors и horizontal overflow.  
`PASS` `/lab` проверен на desktop viewport 1280×720 и mobile 390×844.  
`PASS` `/lab/retro` проверен на mobile 390×844; DESK 95 загружается без chooser, с окном Files и taskbar.

## Автоматические проверки

`PASS` `npm test` — 69/69 tests.  
`PASS` `npm run lint`.  
`PASS` `npx tsc -b --pretty false`.  
`PASS` `npm run build` — Vite production build, 61 sitemap URLs, 73 prerendered HTML, SEO audit 61/61.  
`PASS` `git diff --check`.  
`PASS` Поиск не нашёл остатков Cart context/hook/storage/components и фиксированных LAB счётчиков.

## Известные ограничения

`PASS` Vite по-прежнему показывает неблокирующее предупреждение о крупном `studio` chunk. Это существовавшая до Phase 1 зона оптимизации, не ошибка сборки.  
`NOT RUN` Break SITEVL не перерабатывался в этой Phase.  
`NOT RUN` Legacy code старой OS, THE ROOM и скрытых Retro shells не удалялся до отдельной migration/deprecation Phase.

## Git

`PASS` Commit не выполнялся.  
`PASS` Push не выполнялся.  
`PASS` Deploy не выполнялся.
