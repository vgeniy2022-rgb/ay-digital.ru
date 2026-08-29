# SITEVL LAB NEXT — Phase 1 Audit

Дата: 2026-08-30  
Проект: `/Users/aleksandrasineckij/Documents/ay-digital.ru`  
Этап: Cleanup & Restructure

## Границы аудита

Проверены `src/`, `src/features/lab/`, `src/features/site-builder/`, маршруты приложения, публичная навигация, LAB persistence и пользовательская корзина. Проект остаётся React + Vite + TypeScript; Studio, CMS, SEO и отдельные LAB-приложения уже разделены через lazy routes.

## Текущее состояние LAB

До Phase 1 публичный каталог содержит восемь карточек:

1. `/lab/builder` — оболочка SITEVL LAB над существующим SITEVL Studio.
2. `/lab/2d` — Break SITEVL, Canvas 2D-платформер с физикой, прогрессом и достижениями.
3. `/lab/3d` — THE ROOM, Three.js/WebGL-сцена с четырьмя модулями.
4. `/lab/physics` — Physics Lab.
5. `/lab/os` — старая SITEVL OS.
6. `/lab/retro` — Retro Computer.
7. `/lab/canvas` — Infinite Canvas.
8. `/lab/modern-os` — Modern OS / SITEVL NOVA.

Каталог хранится в `src/features/lab/core/catalog.ts`. Главная LAB, системная панель LAB и старая OS используют длину этого массива для счётчиков. В локализации также осталась строка про восемь экспериментов, а достижение `LAB_COMPLETE` всё ещё описывает семь экспериментов.

## LAB progression и persistence

- Основной ключ: `sitevl-lab-state-v2`.
- Legacy-ключ: `sitevl-lab-state-v1`.
- `LabPersistentState.version` равен `2`.
- Сохраняются explored/completed ID, достижения, XP, секреты, статистика, настройки звука и локальные состояния экспериментов.
- Текущая нормализация считает допустимыми только ID из публичного каталога. Простое удаление карточек из массива поэтому удалило бы старые `game2d`, `game3d` и `os` из сохранений.
- `LAB_COMPLETE` сейчас выдаётся через сравнение количества завершённых модулей с длиной массива. Это зависит от состава каталога и не подходит для динамической структуры.

Решение Phase 1: разделить полный набор известных ID и актуальный публичный каталог. Legacy-прогресс и достижения сохраняются, а счётчики и условие завершения учитывают только текущие публичные модули.

## Публичная корзина

Корзина подключена глобально через `CartProvider`, Header, `AddToCartButton`, `/cart` и `/checkout`. Она хранит список в `ay-digital-cart-v1`.

Checkout не вызывает `createOrder`, CMS API, платёжный API или реальную e-commerce систему. Он только формирует текст и открывает Telegram/WhatsApp. Следовательно, это дублирующий пользовательский слой поверх уже существующих прямых CTA.

Решение Phase 1: удалить публичные кнопки корзины, provider, context, hook, типы, storage и страницы. Старые `/cart` и `/checkout` оставить как redirects, чтобы сохранённые ссылки не возвращали 404. Корзины виртуальных OS не затрагиваются.

## Старая SITEVL OS и Modern OS

`/lab/os` и `/lab/modern-os` решают одну задачу. Modern OS существенно глубже: полноценный window manager, Dock, App Switcher, Files, Browser, Media, AI, Settings и три игры.

Решение Phase 1: убрать старую OS из каталога. Маршрут `/lab/os` перенаправить на `/lab/modern-os`; код старой OS пока сохранить для безопасной миграции и возможного архивного использования.

## Retro Computer

Retro хранит одну общую файловую систему, browser, mail/chat, network, installer, BASIC, WEB LAB, backup, quest и достижения, но предлагает три оболочки: `desk95`, `classic`, `mono`.

Оценка:

- `desk95` лучше всего соответствует целевой эпохе середины 90-х, имеет наиболее узнаваемую и целостную навигацию: Пуск, taskbar, desktop icons и оконный интерфейс.
- `classic` и `mono` визуально отличаются, но используют тот же набор приложений и в текущем scope создают лишний выбор вместо отдельного продуктового сценария.
- Общая логика приложений и storage не требует удаления legacy-оболочек из schema.

Решение Phase 1: оставить публичной только DESK 95. Убрать экран выбора и переключение оболочек из UI, но сохранить типы, persisted windows, visited systems и achievements для совместимости старых сохранений.

## Break SITEVL

Игра технически функциональна: Canvas 2D, пять зон, checkpoints, dash, fragments, haptics, persistence и завершение через CORE. Однако по визуальной и продуктовой глубине она уступает Modern OS, Retro, Physics, Infinite Canvas и Studio, а её платформенный сценарий требует отдельной качественной переработки.

Решение Phase 1: не удалять код и маршрут `/lab/2d`, сохранить достижения и сохранённый прогресс, но убрать игру из основного каталога до следующей фазы.

## 3D Room

THE ROOM содержит рабочий Three.js renderer, adaptive quality, touch joystick, interaction и cleanup. Развивать модуль дальше в Phase 1 не требуется.

Решение Phase 1: убрать карточку из каталога, сохранить `/lab/3d` как legacy route и не менять renderer.

## Целевая структура публичного каталога

### Создавать

- SITEVL Studio — `/lab/builder`.
- Infinite Canvas — `/lab/canvas`.

### Экспериментировать

- Physics Lab — `/lab/physics`.

### Системы

- Modern OS — `/lab/modern-os`.
- Retro Computer / DESK 95 — `/lab/retro`.

Break SITEVL, THE ROOM и старая SITEVL OS остаются совместимыми legacy-модулями, но не участвуют в публичных счётчиках каталога.

## Риски и защита

- Нельзя валидировать persisted experiment ID только по публичному массиву: старый прогресс будет потерян.
- Нельзя удалять Retro `classic`/`mono` из schema без отдельной migration: старые окна и достижения станут несовместимыми.
- Нельзя удалять legacy routes: старые закладки дадут 404.
- Удаление CartProvider требует сначала убрать все `useCart` и `AddToCartButton` imports.
- SEO-маршруты корзины нужно убрать из генерации, а redirects оставить техническими.

## Решение аудита

`PASS` Архитектура позволяет выполнить Phase 1 точечно без переписывания LAB.  
`PASS` Modern OS, Studio, Physics, Infinite Canvas, CMS и SEO не требуют структурных изменений.  
`PASS` Cart не является реальной e-commerce системой и может быть удалён.  
`PASS` DESK 95 выбрана единственной публичной Retro OS.  
`PASS` Break SITEVL и THE ROOM переводятся в legacy без удаления кода.  
`PASS` Совместимость progression обеспечивается разделением известных и публичных experiment ID.
