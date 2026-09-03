# SITEVL — итоговый отчёт по layout polish

Дата: 3 сентября 2026 года  
Production: `https://sitevl-ru.vercel.app`  
Commit приложения: `9be4a58` (`Polish service layout and LAB typography`)  
Результат: **PASS**

## Что изменено

### Карточки услуг

- `ServiceCard` переведён в вертикальный flex-layout с `height: 100%`.
- Reveal-обёртка растягивается на полную высоту grid-ячейки.
- CTA прижат к нижней границе карточки через `margin-top: auto`, поэтому его baseline больше не зависит от длины текста, цены или результата.
- Desktop-сетка переведена на 6 технических колонок: обычная карточка занимает 2 колонки, пара в последнем ряду центрируется в колонках 2–5, одиночная карточка — в колонках 3–4.
- Количество визуальных колонок осталось прежним: 1 на телефоне, 2 на планшете, до 3 на desktop.
- Увеличен только вертикальный интервал между категориями; структура данных, тексты, изображения и маршруты не менялись.

### LAB typography

- H1 `ЭКСПЕРИМЕНТАЛЬНАЯ / ВЕБ-СРЕДА` получил безопасный responsive clamp: `25–38 px` на телефоне и `56–112 px` на более широких экранах.
- Внутрисловный перенос отключён; заданный `<br>` между двумя строками сохранён.
- Рабочая ширина H1 увеличена до 1280 px, чтобы текст не обрезался на 1600 и 1920 px.
- Hero сокращён с базовых 560 до 500 px и получил меньшие вертикальные отступы.
- Радар уменьшен, ослаблен до opacity `0.28` на desktop и `0.18` на mobile, смещён вниз и больше не пересекает H1.
- Существующие mobile-правила continue/level panels возвращены внутрь `@media (max-width: 600px)`, где они снова применяются браузером.

### Другие крупные заголовки

- На `/mobile-apps` добавлен `min-width: 0` для grid-элементов hero.
- Mobile clamp H1 снижен с `clamp(2.7rem, 14vw, 4.4rem)` до `clamp(2.5rem, 11vw, 4.4rem)`.
- На 390 px H1 теперь занимает ровно доступные 350 px: левая граница 20 px, правая 370 px, horizontal overflow отсутствует.
- Остальные проверенные публичные заголовки не потребовали изменений.

## Измерения до и после

### `/services`

| Viewport | До: максимальный разброс карточек/CTA | После | Horizontal overflow |
| --- | ---: | ---: | --- |
| 390×844 | 0 px, одна колонка | 0 px | нет |
| 768×1024 | 220 px | 0 px | нет |
| 1366×768 | 220 px | 0 px | нет |
| 1440×900 | 220 px | 0 px | нет |
| 1920×1080 | 220 px | 0 px | нет |

Дополнительно после исправления проверены 320, 375, 430, 820, 1024, 1180 и 1280 px. На всех ширинах: 20 карточек, разброс высоты 0 px, разброс CTA 0 px, horizontal overflow отсутствует.

### `/lab`

До исправления ширина текста превышала контейнер: 844/720 px при 768 px, 1126/976 px при 1024 px, 1501/1120 px при 1366 px и 1649/1120 px при 1920 px.

После исправления проверены 13 viewport: 320, 375, 390, 430, 768, 820, 1024, 1180, 1280, 1366, 1440, 1600 и 1920 px. Для каждого:

- `h1.scrollWidth <= h1.clientWidth`;
- перенос внутри слова отсутствует;
- horizontal overflow отсутствует;
- пересечение H1 и радара отсутствует.

Высота hero после исправления: 450 px на 320–430 px, 500 px на 768–1280 px, 502 px на 1366 px, 511 px на 1440 px и 525 px на 1600–1920 px. Следующий блок начинается с 536 px на mobile и с 592 px на 1366×768, поэтому часть следующего контента видна уже на laptop viewport.

## Публичные маршруты

В локальной production-сборке проверено 55 сочетаний маршрутов и viewport (390, 768, 1024, 1366 и 1920 px):

- `/services`;
- `/mobile-apps`;
- `/prices`;
- `/prices/websites`;
- `/prices/mobile-apps`;
- `/cases`;
- `/brief`;
- `/website-development-vladivostok`;
- `/website-admin-vladivostok`;
- `/computer-help-artem`;
- `/website-development-nakhodka`.

Результат: 0 выходов H1 за viewport, 0 скрытых переполнений текста, 0 horizontal overflow, 0 browser console errors.

## X-RAY и границы задачи

X-RAY не изменялся. В OFF-состоянии на `/services` подтверждено:

- launcher видим;
- `.xray-root`: 0;
- `.xray-panel`: 0;
- наложения кода на страницу нет.

SITEVL AI, Gemini endpoint, Redis, Modern OS, Games, Farm и Studio не изменялись. В diff нет файлов этих модулей.

## Проверки

| Проверка | Результат |
| --- | --- |
| `npm test` | PASS — 107/107 |
| `npm run lint` | PASS |
| `npx tsc -b --pretty false` | PASS |
| `npm run build` | PASS |
| SEO generation | PASS — 64 sitemap URL, 78 prerendered HTML |
| SEO audit | PASS — 64 indexable URL |
| `git diff --check` | PASS |
| Browser console | PASS — 0 ошибок на проверенных маршрутах |

Vite сохранил существующее информационное предупреждение о нескольких chunks больше 500 kB. Оно не связано с этой задачей и не блокирует сборку.

## Production deployment и QA

- Репозиторий: `vgeniy2022-rgb/ay-digital.ru`.
- Ветка: `main`.
- Vercel project: `ay-digital-ru` (`prj_REyqEPemqb3DbzgR2z7PMPJv0FsL`).
- Deployment был автоматически запущен существующей Vercel Git-интеграцией после push commit `9be4a58`.
- Production alias обновлён 3 сентября 2026 года в 06:58:04 UTC.
- `/services`, `/lab` и `/mobile-apps` отвечают через production; `/services` подтверждён как HTTP 200.
- Production browser QA выполнен на 390×844, 1366×768 и 1440×900.
- `/services`: 20 карточек, 0 px разброса высоты, 0 px разброса CTA, 0 overflow.
- `/lab`: H1 не обрезан, радар не пересекает H1, 0 overflow.
- `/mobile-apps` на 390×844: H1 находится в границах 20–370 px, 0 overflow.

## Скриншоты

Артефакты сохранены вне Git-репозитория:

`/Users/aleksandrasineckij/.codex/visualizations/2026/08/27/01a04273-3cb1-7da1-ab0f-24b4cdef5843/sitevl-layout-polish/`

Папки:

- `before/` — `/services` и `/lab` на 390×844, 768×1024, 1366×768, 1440×900 и 1920×1080;
- `after/` — те же viewport после исправлений, плюс наглядный кадр выровненных desktop-карточек;
- `production/` — финальные production-кадры на обязательных viewport.
