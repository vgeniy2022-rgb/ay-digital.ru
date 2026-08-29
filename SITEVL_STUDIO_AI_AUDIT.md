# SITEVL Studio AI — аудит

## Текущее устройство Studio

- **Schema:** `SiteBuilderProject`, версия `1`. Проект содержит `theme`, `pages`, `assets`, `settings` и активную страницу. Версия не изменялась.
- **Страница:** SEO-поля и Puck `Data` (`content` + `root`). ID страниц и компонентов создаются через `createStudioId`.
- **Компоненты:** 33 зарегистрированных Puck-компонента. AI разрешены готовые секции Header, Hero, Services, Features, Pricing, Portfolio, Gallery, Steps, Stats, Reviews, Team, FAQ, Contact, LeadForm, MapPlaceholder и Footer.
- **Props:** определены в `studioConfig.tsx`; ссылки проходят `safeStudioHref`, responsive-поля — через `ResponsiveSettings`.
- **Layout:** вложенные компоненты управляются Puck slots и allowlist. AI v1 создаёт только верхнеуровневые готовые секции, поэтому не может сломать slot nesting.
- **Theme:** централизованные `StudioThemeTokens`: colors, typography, widths, spacing, radii, shadows и buttonPreset.
- **Responsive:** четыре breakpoint — desktop, laptop, tablet, mobile; AI-компоненты получают пустые overrides и наследуют валидные defaults.
- **Templates:** шесть функций создают обычный schema-v1 проект с Puck Data.
- **Persistence:** IndexedDB `sitevl-studio`, stores `projects` и `assets`; запись всегда проходит `migrateProject`.
- **Preview/export:** общий `studioConfig` используется Puck, Preview и static ZIP export, поэтому AI-проект не получает отдельный renderer.
- **Undo:** Puck управляет историей Data текущей страницы. Изменения project-level (theme/pages) находятся выше Puck history.

## Разрешённые AI-поля

AI может предложить название и описание проекта, страницы, slug, SEO title/description, allowlisted секции, текстовые props, безопасные CTA, theme tokens и пустые responsive overrides. AI не может создавать React, JavaScript, CSS, component IDs, schemaVersion, storage keys, произвольные Puck types или исполняемый HTML.

## Риски до реализации

- Недоверенный JSON мог содержать неизвестный компонент, script, URL-схему или чрезмерный объём данных.
- Cloud token нельзя хранить во frontend.
- Browser model не должен автоматически скачиваться на слабое устройство.
- Project-level AI operation нельзя честно объявлять частью Puck Undo без отдельной общей transaction history.

Эти риски закрыты allowlist, нормализацией, лимитами, sanitizer, отсутствием client token и preview-before-apply. Общая Undo transaction оставлена как ограничение, а не имитирована.

