# SITEVL X-RAY — архитектура

## Граница модуля

X-RAY находится в `src/features/xray/` и подключается один раз в `AppLayout`. Ветки `/lab` и `/studio/*` возвращаются из `App.tsx` до публичного layout, поэтому X-RAY там не монтируется. Дополнительно `matchXRayRoute()` возвращает данные только для явного allowlist.

## Поток загрузки

1. В обычной публичной загрузке присутствуют только `XRayController` и компактный route registry.
2. На неподдерживаемом маршруте controller возвращает `null`.
3. После нажатия на компактный `X-RAY` React лениво загружает `XRayExperience` и его CSS.
4. `loadXRayDefinition()` выбирает category loader по текущему route.
5. Данные услуги, статьи, цен, кейса или локальной страницы импортируются только для открытого вида X-RAY.
6. При SPA-переходе controller закрывается, reveal сбрасывается в 0%, а старый payload не показывается.

## Allowlist

Registry содержит только:

- явные статические публичные пути;
- точные slug-массивы услуг, статей, цен, кейсов и локальных страниц;
- отдельный тип для cinematic Web Studio.

Неизвестный путь, дополнительный сегмент, redirect, 404, `/lab` и `/studio` не проходят matcher. Unit-тест читает фактические data source-файлы и проверяет, что slug registry услуг, статей, цен и локальных страниц не устарел.

## Page-specific definitions

- `HomePage`: собственные TSX, `home.css` и structure.
- Обычная статическая страница: собственный component name, canonical route и набор секций; отдельный CSS не показывается, если его нет.
- Услуга: reusable `SeoLandingPage.tsx` плюс конкретный `<slug>.config.ts`.
- Статья: reusable `UsefulArticlePage.tsx` плюс компактный `<slug>.article.ts` без полного дампа текста.
- Web Studio: собственный `WebStudioPage.tsx` и конфигурация.
- Цены, кейс, локальная страница: свой renderer, конкретные безопасные данные и structure.

Таким образом Home, Service A, Service B и Article имеют разные filenames, structure и payload. Общая бизнес-логика шаблонов не копируется по одному разу на каждый slug.

## Viewer

- fixed split-overlay раскрывается справа по CSS-переменной `--xray-reveal`;
- сайт слева не меняет ширину и не теряет исходный layout;
- native range сохраняет scroll и keyboard semantics;
- TSX/CSS/DATA/STRUCTURE tabs доступны только при наличии соответствующего файла;
- code area имеет line numbers, лёгкую встроенную подсветку, отдельный scroll и monospace;
- кнопка возврата устанавливает 0%, кнопка «Код» — 100%;
- Clipboard API имеет локальный `execCommand` fallback для старых/встроенных браузеров;
- `data-nosnippet` и загрузка только после действия не создают индексируемый дубль основного контента.

## Безопасность

X-RAY не читает `.tsx` или filesystem в production. Он не импортирует `.env`, server functions, auth code и deployment config. В safe representation используются только публичные поля страницы.

`sanitizeXRayText()` скрывает:

- email;
- российские телефонные номера;
- bearer-значения.

`safeXRayJson()` дополнительно редактирует ключи, похожие на API key, authorization, credentials, password, secret, token, private config, Gemini и Cloudflare.

## Accessibility и mobile

- controller и range имеют явные `aria-label`;
- tabs используют `tablist`/`tab` и `aria-selected`;
- code area доступна с клавиатуры;
- focus-visible контрастный;
- основные control targets не меньше 44 px;
- mobile control учитывает `safe-area-inset-bottom` и расположен выше sticky CTA;
- `prefers-reduced-motion` сводит reveal transition почти к нулю;
- глобальные touch handlers и `preventDefault` не используются.

## Производительность

Baseline entry: 437.47 kB / 134.59 kB gzip.

После X-RAY: entry 443.95 kB / 136.58 kB gzip. Прирост entry: 6.48 kB raw / 1.99 kB gzip. Общий CSS вырос на 1.63 kB raw / 0.25 kB gzip из-за compact controller classes.

Ленивые ресурсы:

- XRay viewer JS: 10.10 kB / 3.75 kB gzip;
- XRay viewer CSS: 7.27 kB / 2.26 kB gzip;
- definition builders: 5.59 kB / 1.93 kB gzip;
- большие page data остаются route/category chunks и не загружаются ради закрытого X-RAY.
