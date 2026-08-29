# SITEVL Studio AI — отчёт

## Реализовано

- **PASS:** provider-neutral `AIProvider` и Local/Cloudflare adapters.
- **PASS:** Text → SitePlan → validated schema-v1 SiteProject.
- **PASS:** component allowlist и AI metadata для готовых секций.
- **PASS:** неизвестные компоненты и опасная разметка не попадают в Puck Data.
- **PASS:** создание 1/3/5 страниц, SEO title/description, CTA и ThemeTokens.
- **PASS:** цены без запроса пользователя обозначаются «По запросу».
- **PASS:** preview плана до записи в IndexedDB.
- **PASS:** AI creation и editor assistant загружаются лениво.
- **PASS:** локальный offline planner без передачи данных.
- **PASS:** cloud adapter без token во frontend, timeout и unavailable state.
- **PASS:** deterministic аудит структуры, SEO, CTA, alt и повторов заголовков.
- **PASS:** preview ThemeTokens перед применением AI design proposal.
- **PASS:** созданный проект остаётся обычным проектом Studio и работает с Preview/export.
- **PASS:** end-to-end browser QA: описание → план на 3 страницы → подтверждение → проект в IndexedDB → обычный Studio editor.
- **PASS:** editor assistant показывает аудит созданного проекта и безопасное предложение ThemeTokens.
- **PASS:** mobile QA на 390×844: AI доступен в нижней панели, диалог помещается в viewport, горизонтального overflow нет.
- **PASS:** при runtime QA ошибок в консоли не обнаружено.

## Ограничения

- **BLOCKED:** облачный generative AI не активен без собственного Worker endpoint и credentials.
- **NOT RUN:** browser LLM/model download; тяжёлая модель намеренно не добавлена без подтверждённого performance budget.
- **NOT RUN:** vision alt generation; бессмысленный alt по имени файла не создаётся.
- **PARTIAL:** AI editor v1 содержит deterministic audit и theme assistant; rewrite, section/page generator и command bar пока не подключены к UI.
- **PARTIAL:** project-level AI changes применяются одной React state operation, но не являются Puck Undo transaction.
- **PARTIAL:** browser QA выполнен на desktop viewport и 390×844; полный набор 320/375/430/768/1024/1440/1920 не прогонялся вручную.

## Проверки

- `npm test` — **PASS**, 45 тестов.
- `npm run lint` — **PASS**.
- `npx tsc -b --pretty false` — **PASS**.
- `npm run build` — **PASS**.
- `git diff --check` — **PASS**.
- Vite сохраняет существующее предупреждение о размере основного Studio chunk; оба AI-диалога вынесены в отдельные lazy chunks.

## Privacy и security

- **PASS:** локальный режим явно обозначен как обработка на устройстве.
- **PASS:** cloud mode недоступен, пока endpoint не настроен.
- **PASS:** provider не получает assets, контакты и IndexedDB contents.
- **PASS:** dev console получает только техническую ошибку без секретов.

Коммит, push и deploy не выполнялись.
