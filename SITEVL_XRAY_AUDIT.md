# SITEVL X-RAY — аудит до реализации

Дата аудита: 2026-08-30

## Статус исходного проекта

- PASS — рабочий проект подтверждён: `/Users/aleksandrasineckij/Documents/ay-digital.ru`.
- PASS — `main` находился на `9eb7c46`, рабочее дерево до начала изменений было чистым.
- PASS — baseline production build прошёл: TypeScript, Vite, SEO generator и SEO audit.
- PASS — baseline: 61 URL в sitemap, 75 prerendered HTML-файлов, 2559 Vite-модулей.
- PASS — baseline entry chunk: 437.47 kB / 134.59 kB gzip; общий CSS: 47.32 kB / 9.80 kB gzip.

## Фактическая маршрутизация

Публичные страницы рендерятся внутри `AppLayout`. `/lab` и `/studio/*` имеют отдельные ранние ветки в `App.tsx` и не используют публичный layout. Это позволяет физически не монтировать X-RAY в LAB, играх, Modern OS, Retro, Infinite Canvas и Studio.

Поддерживаемые типы публичных страниц:

- статические страницы: главная, услуги, цены, кейсы, контакты, about, process, legal, brief, changelog;
- коммерческие страницы на общем `SeoLandingPage` с индивидуальной конфигурацией;
- специальная cinematic-страница `WebStudioPage`;
- библиотека и статьи `UsefulArticlePage`;
- направления цен `PriceDirectionPage`;
- кейсы `CasePage`;
- локальные страницы `LocalSeoPage`.

Технические redirect routes `/cart`, `/checkout`, `/order-success` не являются содержательными страницами и не должны входить в allowlist.

## Переиспользуемая архитектура

- React Router даёт надёжный `location.pathname` для смены определения при SPA-переходе.
- Страницы уже lazy-loaded, поэтому X-RAY должен следовать тому же подходу.
- Контент услуг, статей, цен, кейсов и локальных страниц хранится в типизированных data-модулях. Их можно читать после явного открытия X-RAY и строить конкретное безопасное представление без runtime-доступа к `.tsx` на диске.
- Tailwind и общие CSS tokens позволяют встроить компактный control без редизайна сайта.

## Риски и решения

1. FAIL до реализации — отсутствовал route allowlist и механизм X-RAY.
2. Риск утечки — реальные source/data могут содержать контакты или конфигурацию. Решение: показывать ограниченную frontend-структуру, редактировать email, телефоны, bearer-значения и sensitive keys.
3. Риск bundle growth — полный код всех страниц нельзя импортировать в entry. Решение: малый registry в layout; viewer и page data загружаются динамически только после открытия.
4. Риск устаревшего универсального примера — шаблонные страницы должны показывать reusable renderer вместе с конфигурацией текущего route.
5. Риск LAB/input conflicts — allowlist вместо denylist плюс отсутствие `AppLayout` на `/lab` и `/studio`.
6. Риск SEO-дублирования — payload создаётся только после действия пользователя и помечается `data-nosnippet`.
7. Риск mobile scroll — native `input[type=range]`, без глобального `touchmove` и `preventDefault`.

## Решение аудита

Реализация возможна без изменения маршрутов, CMS, SEO и архитектуры LAB. Рекомендуемый модуль: `src/features/xray/` с route registry, безопасными definition builders, lazy viewer, отдельным CSS chunk и unit-тестами.
