# SITEVL Studio: аудит текущего конструктора

Дата аудита: 2026-08-28

## Область проверки

Проверены текущий React/Vite/TypeScript проект, маршрутизация, общий layout, страница конструктора, стили, локальное состояние, экспорт, зависимости и SEO-генерация.

## Текущее устройство

- Публичное приложение запускается из `src/main.tsx` через `BrowserRouter` и `CartProvider`.
- Все маршруты объявлены в `src/App.tsx` и лениво загружают страницы.
- `AppLayout` безусловно выводит `SeoHead`, Header, Breadcrumbs, Footer, mobile CTA, cookie banner, command palette и developer overlay.
- Текущий конструктор находится в `src/pages/WebsiteBuilderPage.tsx`, стили — в `src/styles/websiteBuilder.css`.
- Конструктор доступен по `/lab/website-builder` и рендерится внутри обычного публичного layout.
- Модель `LandingDraft` содержит одну страницу, четыре текстовых поля, одно hero-изображение, до нескольких услуг, четыре цветовые темы и три флага видимости.
- Состояние хранится в ключе `sitevl-landing-builder-v2` в `localStorage`.
- Сессия принудительно очищается через 30 минут.
- Изображение уменьшается в canvas и записывается как base64 прямо в JSON состояния.
- PNG создаётся из DOM через `html-to-image`.
- JSON экспортируется напрямую из `LandingDraft` без версии схемы и валидации.
- Передача Александру формирует текст и открывает Telegram; backend для проектов отсутствует.

## Используемые компоненты и зависимости

- React `18.3.1`, React DOM `18.3.1`.
- TypeScript `5.7.x`, Vite `6.x`.
- React Router `7.x`.
- Framer Motion, Lucide React.
- `html-to-image` для PNG.
- В проекте нет Puck, IndexedDB repository, ZIP exporter, dnd-kit application layer или test runner.

## Проблемы текущей реализации

1. Данные, UI редактора и renderer находятся в одном файле и связаны напрямую.
2. Источником истины фактически является локальный React state одной страницы, versioned schema отсутствует.
3. Нет миграций, поэтому изменение структуры может повредить старый черновик.
4. Нет списка проектов, страниц, slug, SEO-настроек, дерева слоёв и глобальных design tokens.
5. Нет Undo/Redo и группировки текстовых операций.
6. Большие base64-изображения увеличивают JSON и `localStorage`.
7. Жёсткий 30-минутный срок приводит к потере работы.
8. Preview является DOM-блоком той же страницы, а не независимым renderer маршрутом.
9. Экспорт не создаёт самостоятельный статический сайт.
10. Публичные Header/Footer/CTA уменьшают рабочую область редактора.
11. Desktop-форма просто перестраивается на мобильном, отдельного mobile workspace нет.
12. Визуальное редактирование и безопасные правила вложенности отсутствуют.

## Что переиспользуется

- Существующий React/Vite/TypeScript runtime и lazy routing.
- Контакт SITEVL и Telegram-ссылка из текущей конфигурации сайта.
- `html-to-image` как дополнительный thumbnail/screenshot механизм.
- Оптимизация изображений через canvas, перенесённая в media repository.
- Смысловые поля legacy-черновика и ключ `sitevl-landing-builder-v2` только для явной миграции.
- Визуальный язык LAB как исходная точка, но не публичный layout.

## Что заменяется

- `LandingDraft` заменяется versioned `SiteBuilderProject` schema.
- `localStorage` и 30-минутная сессия заменяются IndexedDB repository и debounce autosave.
- Base64 assets в JSON заменяются Blob-записями и metadata.
- Монолитная страница заменяется модулем `src/features/site-builder`.
- Встроенный DOM preview заменяется единым renderer, используемым editor canvas, `/studio/preview/:projectId` и экспортом.
- Ручная длинная форма заменяется Puck-based визуальным canvas и собственным SITEVL workspace.

## Ограничения первой локальной версии

- Облачное сохранение не заявляется: backend endpoint проекта отсутствует.
- Отправка проекта на сервер не имитируется: доступно скачивание bundle и явный Telegram handoff.
- Произвольный JavaScript и непроверенный HTML запрещены.
- Same-origin iframe остаётся изолированным от публичного layout; проектные данные передаются только через типизированный renderer.

## Решение

Новый Studio создаётся отдельным lazy chunk на `/studio`, `/studio/projects`, `/studio/project/:projectId` и `/studio/preview/:projectId`. Старый конструктор остаётся доступен на `/lab/builder-legacy`, а прежний `/lab/website-builder` перенаправляет в новый Studio.
