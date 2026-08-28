# SITEVL Studio: итоговый отчёт

Дата: 2026-08-28

## Реализовано

- **PASS** — новый Studio встроен в существующий React/Vite/TypeScript проект без замены публичной архитектуры.
- **PASS** — маршруты `/studio`, `/studio/projects`, `/studio/project/:projectId`, `/studio/preview/:projectId` работают без публичных Header/Footer/CTA.
- **PASS** — legacy-конструктор сохранён на `/lab/builder-legacy`; старый URL перенаправляет в Studio.
- **PASS** — Puck `0.23.0` используется как ядро canvas, outline, inspector, DnD, selection, history, viewport и zoom.
- **PASS** — versioned schema, migration guard и явная legacy-конвертация.
- **PASS** — IndexedDB repositories для проектов и Blob assets, debounce autosave и восстановление после reload.
- **PASS** — шесть шаблонов: специалист, студия разработки, ресторан, магазин техники, портфолио, локальный бизнес.
- **PASS** — 37 типизированных компонентов по трём категориям.
- **PASS** — Pages, Theme и Assets managers, включая social image, alt, focal point и replace.
- **PASS** — responsive inheritance и безопасный CSS resolver.
- **PASS** — единый renderer для editor, preview и static export.
- **PASS** — JSON import/export, ZIP сайта и честный owner bundle.
- **PASS** — robots/SEO scripts исключают Studio и legacy из индексируемых URL.

## Зависимости

- `@puckeditor/core@0.23.0` — стабильное ядро редактора;
- `jszip@3.10.1` — ZIP статического сайта и handoff bundle;
- `tsx@4.20.6` — лёгкий запуск Node tests без тяжёлого test stack.

React, TypeScript, Vite, React Router, Framer Motion, Lucide и `html-to-image` не обновлялись без необходимости.

## Новые файлы

```text
src/features/site-builder/
├── assets/AssetContext.tsx
├── assets/imageProcessing.ts
├── assets/useProjectAssets.ts
├── components/StudioPanels.tsx
├── editor/ResponsiveField.tsx
├── editor/componentCatalog.ts
├── editor/studioConfig.tsx
├── export/projectExport.tsx
├── pages/StudioEditorPage.tsx
├── pages/StudioPreviewPage.tsx
├── pages/StudioProjectsPage.tsx
├── persistence/projectRepository.ts
├── preview/StudioRenderer.tsx
├── responsive/styleResolver.ts
├── schema/defaults.ts
├── schema/migrations.ts
├── schema/studioModel.test.ts
├── schema/types.ts
├── styles/renderer.css
├── styles/studio.css
├── templates/templates.ts
└── utils/id.ts / utils/url.ts
```

## Проверки

- **PASS** — `npm install`: зависимости согласованы, audit сообщает 0 vulnerabilities.
- **PASS** — `npm run lint`: без ошибок и предупреждений.
- **PASS** — `npm test`: schema, templates, migrations, catalogue, image paths, responsive resolver и slug tests.
- **PASS** — `npm run build`: TypeScript, Vite, sitemap generation и SEO audit.
- **PASS** — production build сохранил Studio отдельным lazy chunk; основной публичный маршрут не импортирует Puck синхронно.
- **PASS** — browser: проект создан из шаблона, три страницы сохранены и восстановлены после reload.
- **PASS** — browser: preview использует реальное изображение 1800 px и переключает внутреннюю страницу через `?page=services`.
- **PASS** — browser: custom canvas widths 320, 375, 390, 768, 1024 и 1440 приняты; Fit не создаёт document overflow.
- **PASS** — browser: 390 px preview применяет мобильную компоновку без horizontal overflow.
- **PASS** — browser: legacy route и публичная главная открываются, публичный layout не появляется внутри Studio.
- **NOT RUN** — реальный touch DnD и long press на физическом телефоне.
- **NOT RUN** — resize самого host workspace до 320/375/390: браузерный контроллер не предоставляет изменение размера окна; проверены точные canvas widths и CSS mobile workspace.
- **NOT RUN** — browser file chooser для upload/replace: контроллер не предоставляет `setInputFiles`; реализация прошла TypeScript/lint/build, но ручной выбор файла нужен отдельно.
- **NOT RUN** — полный pointer DnD каждого из 37 drawer items через iframe: контроллер не предоставляет drag API; каталог и конфиги покрыты тестом, representative templates отрисованы.

## Ограничения

- **BLOCKED** — облачное сохранение и постоянная share-ссылка: backend проекта не подключён. Локальная preview-ссылка работает в текущем браузере.
- **BLOCKED** — автоматическая серверная отправка Александру: endpoint отсутствует. Studio скачивает полный bundle и открывает Telegram без ложного сообщения об отправке.
- **BLOCKED** — серверная публикация: Publish сохраняет проект локально и объясняет использовать Export.
- **BLOCKED** — lock/hide/rename/search поверх полного nested Layers tree: Puck Outline даёт реальное дерево, selection, expand/collapse, DnD, duplicate и delete; дополнительные команды требуют отдельного extension layer.
- **BLOCKED** — отправка LeadForm в статическом ZIP без выбранного backend; форма визуальна, ограничение записано в README.

## Команды

```bash
cd /Users/aleksandrasineckij/Documents/ay-digital.ru
npm install
npm run dev
npm test
npm run lint
npm run build
```

Открыть Studio: `http://localhost:5173/studio`.

Git push и production deploy не выполнялись.
