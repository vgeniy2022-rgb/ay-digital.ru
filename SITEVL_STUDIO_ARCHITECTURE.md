# SITEVL Studio: архитектура

Дата: 2026-08-28

## Границы модуля

SITEVL Studio расположен в `src/features/site-builder` и загружается отдельными lazy chunks. Публичный `AppLayout`, Header, Footer, cookie banner и фиксированные CTA не монтируются на `/studio`.

Маршруты:

- `/studio` и `/studio/projects` — локальные проекты и шаблоны;
- `/studio/project/:projectId` — визуальный редактор;
- `/studio/preview/:projectId` — независимый preview;
- `/lab/builder-legacy` — неизменённое legacy-демо;
- `/lab/website-builder` — переход в новый Studio.

## Источник истины

Источником истины является `SiteBuilderProject`, а не DOM или HTML-строка. Проект имеет `schemaVersion`, стабильные id, theme tokens, массив страниц и metadata ассетов. Каждая страница хранит Puck `Data` и SEO-поля.

```text
SiteBuilderProject
├── schemaVersion
├── id / name / templateId
├── theme
│   ├── colors
│   ├── typography
│   ├── contentWidths
│   ├── spacing / radii / shadows
│   └── buttonPreset
├── pages[]
│   ├── slug / title / metaDescription
│   ├── socialImageAssetId / noindex / isHome
│   └── data: Puck Data
├── assets[]: metadata only
└── settings
```

Версия схемы находится в `schema/types.ts`; чтение проекта всегда проходит через `migrateProject`. Неизвестная будущая версия отклоняется с понятной ошибкой. Legacy JSON преобразуется только по явной команде и не удаляется из `localStorage`.

## Хранение

`ProjectRepository` определяет `create`, `get`, `list`, `update`, `delete`, `duplicate`. Текущая реализация использует IndexedDB `sitevl-studio`:

- `projects` хранит versioned JSON;
- `assets` хранит Blob отдельно от metadata и индексируется по `projectId`;
- autosave выполняется с debounce 700 мс;
- индикатор отображает Loading, Saving, Saved или Error;
- 30-минутного срока жизни нет.

`RemoteProjectRepository` подготовлен как интерфейс, но удалённый backend не имитируется.

## Визуальное ядро

`@puckeditor/core` отвечает за canvas, iframe, component drawer, outline, selection, поля, drag-and-drop, историю, Undo/Redo, viewport и zoom. SITEVL добавляет:

- полноэкранную оболочку и собственный top/status/mobile UI;
- Pages, Assets и Theme plugins;
- project repository и autosave;
- проектный renderer, preview и export;
- responsive field и предсказуемый style resolver;
- handoff flow владельцу.

Каталог содержит 37 типизированных блоков.

- Layout: Section, Container, VerticalStack, HorizontalStack, Grid, Columns, Card, Spacer, Divider.
- Basic: Heading, RichText, Button, Image, Icon, Video, Badge, List, Quote.
- Business: Header, Hero, Services, Features, Pricing, Portfolio, Gallery, Steps, Stats, Reviews, Team, FAQ, Contact, LeadForm, MapPlaceholder, Footer.

Puck slots ограничивают допустимую вложенность. Текстовые поля используют Puck `RichText`/content editing без сохранения произвольного HTML или JavaScript.

## Responsive

Breakpoints: `desktop`, `laptop`, `tablet`, `mobile`. Значения наследуются от большого экрана к меньшему. Resolver поддерживает display, direction, alignment, justify, gap, columns, dimensions, spacing, typography, background, border, radius, shadow, visibility и order.

Свободные CSS-фрагменты не исполняются: resolver отбрасывает опасные `url(`, `expression`, `;`, `{` и `}`. Конкретный override можно сбросить. Preview с ограниченной шириной использует container queries; iframe и статический export используют media queries.

## Страницы и медиа

Pages plugin поддерживает создание, выбор, переименование, slug, title, description, social image, noindex, дублирование, изменение порядка, домашнюю страницу и удаление с подтверждением. Последнюю страницу удалить нельзя.

Assets manager поддерживает multi-upload, drag-and-drop, поиск, preview, alt, focal point, замену с сохранением asset id, удаление и копирование `asset://` id. JPEG, PNG, WebP и AVIF ограничены 12 МБ; изображения уменьшаются до 2200 px и сохраняются как WebP Blob.

## Renderer, preview и export

`StudioRenderer` использует тот же `studioConfig`, что editor и static export. `/studio/preview/:projectId` не содержит selection controls, умеет переключать страницы и режимы 1440/768/390.

Export:

- versioned project JSON;
- проверяемый JSON import с новым project id;
- ZIP статического сайта с HTML каждой страницы, CSS, assets, исходным project JSON и README;
- owner bundle с contact metadata, project JSON, asset list, Blob-файлами и доступным thumbnail.

Статические формы намеренно не обещают отправку без backend, это указано в README экспорта.

## Безопасность

- произвольный пользовательский JavaScript отсутствует;
- URL проходят через безопасный helper;
- большие файлы не попадают в JSON/base64;
- секреты во frontend не добавлены;
- iframe остаётся same-origin для редактора и screenshot, но отделён от публичного layout;
- пользовательские данные не передаются на сервер без существующего endpoint.

## Следующий этап

1. Подключить реальный `RemoteProjectRepository`, авторизацию и object storage.
2. Добавить серверный publish pipeline и постоянные публичные URL.
3. Расширить Puck Outline отдельными lock/hide/rename/search командами.
4. Добавить E2E-набор с pointer/touch DnD и реальной загрузкой файлов.
5. Добавить runtime для отправки статических LeadForm после выбора backend.
