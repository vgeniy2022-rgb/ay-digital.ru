# Архитектура SITEVL AI Website Generator

## Публичный маршрут

`/ai-website` — самостоятельный публичный продуктовый сценарий. Он не зависит от LAB, `/studio` и старого ручного конструктора.

Страница лениво загружается через React Router. Для неё добавлены canonical SEO, sitemap, breadcrumb label, X-RAY definition, пункт основной навигации и заметный CTA на главной.

## Поток генерации

1. Пользователь выбирает быстрый, подробный или manual existing-site режим.
2. Черновик локально сохраняется в браузере, чтобы ответ не пропал при перезагрузке.
3. Frontend отправляет `kind: website-concept`, prompt, session id и небольшой context в существующий `POST /api/ai`.
4. Serverless function вызывает Gemini. `GEMINI_API_KEY` остаётся только в Vercel server environment.
5. Ответ разбирается как JSON, очищается и нормализуется по versioned schema 1.
6. Renderer получает только безопасный объект и собирает React UI из собственных allowlisted компонентов.
7. Пользователь переключает три варианта композиции и desktop/tablet/mobile preview, редактирует текст/цвет/видимость/порядок блоков и может отменить последнее изменение.

## JSON schema 1

Главные узлы: `business`, `site`, `theme`, `sections`, `services`, `features`, `faq`, `contacts`, `recommendedPackage`, `estimatedComplexity`, `notes`.

Allowlist section types: `hero`, `services`, `advantages`, `about`, `process`, `gallery`, `team`, `catalog`, `pricing`, `reviews`, `faq`, `contacts`, `cta`, `stats`, `features`, `delivery`, `booking`, `map`, `footer`.

Строки ограничены по длине и отображаются как text nodes. Цвета принимаются только как `#RRGGBB`. Неизвестные section types удаляются. Если после фильтрации осталось меньше трёх секций, применяется безопасный fallback.

## Ценообразование

Gemini не определяет стоимость. `recommendAiWebsitePackage` применяет детерминированные правила к типу проекта, функциям и набору секций, после чего берёт название и цену только из `src/data/priceDirections.ts`.

Текущие исходные пакеты: старт 19 900 ₽, лендинг 24 900 ₽, управление 34 900 ₽, бизнес-сайт 44 900 ₽, каталог 59 900 ₽, магазин 79 900 ₽, веб-сервис 139 900 ₽.

## Поток заявки

Форма появляется только после генерации ценного результата. Она принимает имя и минимум один канал связи, проверяет consent и отправляет исходный prompt, ответы, итоговый JSON, выбранный вариант, пакет, бюджет и срок в `POST /api/ai-leads`.

Endpoint:

- не публикует список и не имеет GET-доступа к lead records;
- `GET` сообщает только безопасный capability status;
- строго проверяет размер, session/concept id, контакт, consent и JSON version;
- сохраняет запись в private Redis/Upstash REST с TTL;
- хранит индекс не более 1000 последних ids;
- по умолчанию удаляет записи через 90 дней (допустимый server-only диапазон 7–365 дней);
- ограничивает попытки отправки по анонимной session id;
- опционально отправляет в Telegram только краткое уведомление, не полную концепцию;
- возвращает ошибку, если сохранение нельзя подтвердить.

Владелец просматривает записи только в защищённой панели провайдера хранилища. Неаутентифицированная админка SITEVL намеренно отсутствует.

## Переменные окружения

Обязательные production secrets/config:

- `GEMINI_API_KEY` — уже настроен;
- `AI_LEADS_REDIS_REST_URL`;
- `AI_LEADS_REDIS_REST_TOKEN`.

Если Vercel/Upstash integration создаёт стандартную пару `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` или `KV_REST_API_URL` / `KV_REST_API_TOKEN`, backend использует её напрямую. Достаточно одной полной пары; копировать token во frontend не нужно.

Дополнительные server-only variables:

- `GEMINI_MODEL`;
- `AI_LEADS_RETENTION_DAYS`;
- `AI_LEADS_TELEGRAM_BOT_TOKEN`;
- `AI_LEADS_TELEGRAM_CHAT_ID`.

Ни одна из этих переменных не должна иметь префикс `VITE_`, попадать во frontend bundle или Git.

## Отказоустойчивость

- Ошибка Gemini сохраняет ответы и допускает повтор в пределах лимита.
- Невалидный Gemini JSON не попадает напрямую в preview.
- Отказ Redis не подтверждает заявку: UI сохраняет концепцию в браузере и показывает прямые ссылки Telegram/WhatsApp.
- Демонстрационная форма внутри preview никогда не выполняет сетевой запрос.
- Автоматический анализ arbitrary URL отключён с честным объяснением.
