# SITEVL Studio AI — архитектура

## Pipeline

`User prompt → AIProvider → SitePlan → validateSitePlan → sitePlanToProject → migrateProject → IndexedDB → Puck`

AI никогда не создаёт SiteProject напрямую. `SitePlan` ограничен типами страниц и секций. Генератор назначает ID, schemaVersion, defaults, responsive props и ThemeTokens внутри доверенного кода SITEVL.

## Providers

- `AIProvider` задаёт `generateStructured`, `generateText`, `isAvailable`.
- `LocalAIProvider` — лёгкий локальный структурный планировщик без загрузки модели. Он работает офлайн, не выдаётся за LLM и не отправляет текст наружу.
- `CloudflareAIProvider` вызывает только `VITE_SITEVL_AI_ENDPOINT`, использует 30-секундный AbortController и не содержит токенов. Если endpoint отсутствует, UI честно показывает «не настроен».
- WebGPU только определяется как capability. Тяжёлая модель и Transformers.js не загружаются автоматически.

Ожидаемый контракт собственного Worker endpoint: POST JSON `{ kind, prompt, context }`, ответ — JSON SitePlan либо `{ text }`. Cloudflare credentials должны находиться только в Worker secrets.

## Validation и security

- allowlist фактически зарегистрированных компонентов;
- неизвестные секции удаляются;
- script/iframe/object/embed/style, inline handlers и `javascript:` удаляются;
- до 8 страниц, 18 секций на страницу, 12 items на секцию;
- slug нормализуется существующим SITEVL helper;
- generator не принимает ID и schemaVersion от provider;
- generated links заданы доверенным generator и проходят renderer URL safety;
- никаких `eval`, пользовательского JS, arbitrary CSS или HTML execution.

## UI и производительность

AI creation и editor assistant загружаются через `React.lazy`; public SITEVL bundle их не импортирует. Проект сначала показывает план, страницы и источник обработки, затем пользователь явно создаёт проект. AI-аудит сначала собирает deterministic metrics. Theme assistant показывает список tokens и palette до применения.

## Дальнейшее расширение

Текущая граница позволяет добавить browser model adapter, Worker AI, rewrite actions и `SiteAction[]` без изменения schema проекта. Для полной Undo/Redo интеграции project-level операций нужен единый history transaction слой над Puck и page/theme state.

