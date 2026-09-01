# SITEVL Commercial Rebuild — Phase 1 Audit

Дата аудита: 1 сентября 2026 года.

## Проверенная архитектура

- Главная: `src/pages/HomePage.tsx`, `src/styles/home.css`.
- Услуги и CMS fallback: `src/data/site.ts`, `src/hooks/useSiteData.ts`, `src/pages/ServicesPage.tsx`.
- Цены: `src/data/priceDirections.ts`, `src/pages/PricesPage.tsx`, `src/pages/PriceDirectionPage.tsx`, `src/components/PriceVisuals.tsx`.
- Навигация и маршруты: `src/App.tsx`, `src/components/Header.tsx`, `src/data/site.ts`.
- Brief: `src/pages/BriefPage.tsx`, `src/data/websiteCalculator.ts`.
- SEO: `src/data/routeSeo.ts`, `src/data/seoLandingPages.ts`, `scripts/generate-seo.mjs`.
- X-RAY: `src/features/xray/routeRegistry.ts`, `src/features/xray/loadXRayDefinition.ts`.

## Исходное состояние

1. На главной было четыре равнозначные карточки веб-направлений. Мобильные приложения не были выделены как самостоятельный коммерческий продукт.
2. Публичного маршрута `/mobile-apps` не было. Прототип и онлайн-сервис вели на общий каталог услуг.
3. В навигации не было прямого перехода к мобильным приложениям.
4. В pricing architecture существовали сайты, программы, устройства, телефоны и ПК, но не было направления `/prices/mobile-apps`.
5. Текущий Brief рассчитывал только сайт и не поддерживал платформу, количество экранов и функции мобильного приложения.
6. В X-RAY allowlist отсутствовали `/mobile-apps` и `/prices/mobile-apps`.
7. Web pricing использовал старую линейку из четырёх пакетов и цены `20 000`, `25 000`, `35 000`, `45 000–65 000 ₽`.
8. В `PriceVisuals` оставалась публичная подпись «Админка».

## Решение

- Сохранить существующие AppLayout, cards, price routes, CMS providers, SEO и X-RAY architecture.
- Добавить одну содержательную страницу `/mobile-apps`, не создавая дублирующих страниц.
- На главной заменить сетку из четырёх веб-карточек на два крупных равноправных направления: сайты и мобильные приложения.
- Создать оригинальный code-native visual мобильного продукта с детализированными экранами SITEVL; не использовать чужие screenshots или рекламные mockup assets.
- Расширить существующий Brief режимами «Сайт» и «Мобильное приложение» без нового backend.
- Расширить `priceDirections` новым типом `mobile-apps`, обновить сайты и добавить SITEVL Care как общий компонент pricing pages.
- Сохранить технические термины только в технических и SEO-контекстах, а коммерческие карточки описывать через результат для клиента.

## Ограничения

- Не затрагивать LAB, Studio, Modern OS, Retro и CMS-протоколы.
- Не обещать публикацию в App Store / Google Play, серверную часть, оплату и интеграции в базовой цене.
- Не использовать фальшивые скидки и обязательную подписку.
- Deployment выполнять только после полного Phase 3 QA.
