# SITEVL Modern OS — аудит перед реализацией

## Существующая архитектура

- `App.tsx` отделяет `/lab/*` от публичного layout и загружает каждый эксперимент через `React.lazy`.
- `LabShell` централизует noindex SEO, переход назад, звук и учёт активности.
- LAB progression имеет versioned state v2, каталог экспериментов и typed achievement IDs.
- `/lab/os` — компактная существующая браузерная ОС. Она сохранена без изменений.
- `/lab/retro` — отдельный интерактивный музей с Retro state v4, виртуальным диском и игровым network layer. Он сохранён без изменений.
- Retro публикует логические имена `DESK95-PC`, `CLASSIC-DESK`, `MONO-STATION`; Modern OS может показать их как виртуальные сетевые компьютеры без доступа к реальной сети.

## Точки переиспользования

- LAB catalog, progression и достижения.
- `LabShell`, `SeoHead`, noindex route metadata.
- Framer Motion и Lucide, уже присутствующие в bundle.
- Общие принципы безопасной URL-валидации Retro Browser.

## Архитектурные решения

- Новый маршрут: `/lab/modern-os`.
- Название системы: `SITEVL NOVA`, пояснение: SITEVL Modern OS.
- Отдельный state `sitevl-lab-modern-os-v1`, чтобы не менять Retro v4 и SITEVL OS.
- Никаких Apple/Microsoft assets, названий приложений или pixel-perfect копирования.
- UI работает поверх тестируемой модели, а не хранит filesystem/window logic внутри компонентов.

## Риски

- Внешний iframe нельзя надёжно проверить из родительского окна при CSP/X-Frame-Options; нужен честный external-open fallback.
- Blob-медиа нельзя безопасно хранить в localStorage в больших объёмах; импорт фото/аудио не включён в v1.
- Полное восстановление внешних iframe после reload сознательно не выполняется.
- Большое число приложений требует lazy split в следующей фазе; текущая версия держит приложения компактными и не включает тяжёлые media API.
