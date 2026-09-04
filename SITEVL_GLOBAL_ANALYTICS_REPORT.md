# SITEVL Global Analytics — отчёт о реализации

## Объём задачи

SITEVL считает анонимные агрегированные посещения всего публичного сайта независимо от существующих счётчиков SITEVL LAB. Сбор просмотров отдельных страниц, fingerprinting, геолокация, рекламные идентификаторы и второй идентификатор посетителя не добавлялись.

## Namespace Redis

Глобальная статистика использует только новый namespace:

- `sitevl:site:visits` — атомарный счётчик посещений;
- `sitevl:site:visitors` — множество анонимных visitor ID, публично отдаётся только его размер через `SCARD`;
- `sitevl:site:visit-session:<sessionId>` — временный серверный ключ идемпотентности;
- `sitevl:site:rate:<sessionId>` — краткоживущий ключ ограничения частоты запросов.

Существующие `sitevl:lab:*`, AI leads и другие Redis-ключи не переименовываются, не мигрируют и не сбрасываются.

## Переиспользование visitor ID и session dedup

Глобальная аналитика намеренно вызывает существующий helper `ensureLabIdentity`. Поэтому SITE и LAB используют один случайный `visitor-*`, уже сохранённый в `localStorage` под ключом `sitevl-lab-visitor-id`. Второй visitor ID не создаётся.

После принятия события сервером браузер сохраняет `sitevl-site-visit-tracked` в `sessionStorage`. Provider смонтирован один раз выше router, поэтому обычные SPA-переходы не пересоздают его. Сервер дополнительно создаёт `sitevl:site:visit-session:<sessionId>` через `SET NX EX` до атомарного `INCR`, поэтому повторы запросов и двойной effect React в development остаются идемпотентными.

При прямом входе на `/lab` создаётся одно глобальное SITE-посещение, а существующий LAB provider создаёт отдельное LAB-посещение. Оба события используют общую анонимную identity, но разные счётчики и dedup-ключи.

## API и отказоустойчивость

`GET /api/site-stats` возвращает только агрегаты:

```json
{
  "visits": 0,
  "uniqueVisitors": 0
}
```

`POST /api/site-stats` принимает только строгую схему с `site_visit`, `visitorId` и `sessionId`. Redis credentials остаются только на сервере и переиспользуют те же поддерживаемые пары environment variables, что LAB. Если Redis недоступен, endpoint возвращает общий `503`, tracking не выбрасывает ошибку в приложение, а публичный счётчик скрывается.

## Публичный UI и privacy

Агрегированные значения показаны одной компактной строкой в существующем Footer и форматируются через `Intl.NumberFormat('ru-RU')`. UI говорит о посещениях и посетителях за всё время, а не о пользователях онлайн.

Политика конфиденциальности и существующее cookie-уведомление поясняют, что один анонимный локальный идентификатор используется для агрегированной статистики SITEVL и LAB. Новый banner или отдельный consent-механизм не создавались.

## Проверка

Автоматические тесты покрывают атомарный increment, dedup повторов сессии, переиспользование visitor ID, прямой `/lab` с независимым двойным учётом, SPA navigation/reload, исключение технических путей, безопасный Redis fallback, публичную response schema и аудит frontend на credentials/fingerprinting.

Release gate на финальном коде:

- `npm test` — PASS, 127/127;
- `npm run lint` — PASS без предупреждений;
- `npx tsc -b --pretty false` — PASS;
- `npm run build` — PASS;
- SEO generation — 64 URL в sitemap и 78 prerendered HTML;
- SEO audit — PASS, 64 индексируемых URL;
- `git diff --check` — PASS.

Production QA выполнялся после Vercel READY на `https://sitevl-ru.vercel.app`:

1. начальное состояние нового namespace — `0` посещений и `0` посетителей;
2. первый чистый вход на `/` — `1 / 1`;
3. SPA-переходы `/ → /services → /mobile-apps` — осталось `1 / 1`;
4. reload в той же сессии — осталось `1 / 1`;
5. отдельный чистый origin — `2 / 2`;
6. прямой вход на `/lab` увеличил SITE отдельно, а LAB изменился с `5 / 5` до `6 / 6`;
7. мобильный viewport `390 × 844` — ширина документа `390`, horizontal overflow отсутствует, строка счётчика имеет высоту `20px`; API был перехвачен локальным mock, поэтому после очистки production POST не отправлялся;
8. созданные QA-значения удалены только из `sitevl:site:*`; итоговый SITE — `0 / 0`, LAB остался `6 / 6`;
9. одноразовый защищённый reset-route удалён из финального исходного кода и production deployment.

Финальная production-проверка выполнялась только GET-запросами: `/`, `/lab`, `/privacy` и `/api/site-stats` отвечают HTTP 200. После reset новые тестовые POST-события в production не отправлялись.
