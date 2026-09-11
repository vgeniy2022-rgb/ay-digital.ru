# Telegram summary — диагностика 12 сентября 2026

**Обновление политики release:** владелец исключил Telegram из обязательных критериев. Ниже — историческая диагностика 401, не текущий blocker. Telegram остаётся OPTIONAL / DEGRADED; токен не меняется. Обязательный storage/owner E2E повторно PASS, см. TEMPLATE_CATALOG_FINAL_REPORT.md.

## Результат: RELEASE BLOCKED

Production metadata подтверждает наличие TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID. Значения не экспортировались из Vercel. Проверки выполнялись в двух временных production-target deployments без переключения sitevl.tech, через закрытый endpoint с отдельным случайным QA secret и сроком действия 3 часа.

Реальный минимальный sendMessage «✅ SITEVL template catalog QA»:

- HTTP 401;
- ok: false;
- error_code: 401;
- description: Unauthorized.

Независимая проверка getMe через стандартный URL Telegram (без percent-encoding токена) также вернула HTTP 401, ok:false, error_code:401, description:Unauthorized. Формат серверного токена синтаксически корректен, окружающих пробелов нет. Telegram отвергает credential; по одному ответу невозможно различить ошибочное значение и отозванный токен. Принадлежность боту не подтверждена, поскольку аутентификация не прошла.

Это не доказательство неправильного chat_id, блокировки бота пользователем, ошибки текста, Markdown, длины, 429 или timeout. getMe не использует chat_id и текст. Полный summary и повторный Blob/lead/owner E2E остановлены на обязательной границе минимального Telegram теста.

## Ограниченные изменения

- Каталог использует экспортированный существующий sendTelegram из Visitor Intelligence, отдельный Telegram fetch удалён.
- Общий helper проверяет HTTP и JSON ok, различает API/429/timeout/network/malformed response. Диагностика остаётся серверной, credential, URL и данные result не выводятся; публичный контракт уведомления сохранён.
- Summary остаётся plain text без parse_mode. Пользовательский текст не интерпретируется как HTML/Markdown.
- Заявка сохраняется до уведомления; Telegram failure не отменяет lead. Повторный finalize не отправляет сообщение повторно.
- Автоматический retry не добавлен: после неоднозначного timeout sendMessage не гарантирует отсутствие дублей.

## Проверки

Тесты покрывают 200 ok:true, 400, 401, 403, 429, timeout, network, malformed JSON, 200 ok:false, plain text, ограничение длины, редактирование секретных данных в диагностике, отсутствующую конфигурацию, сохранение заявки при отказе и отсутствие повторного уведомления.

64 целевых теста PASS; полный npm test: 250 PASS, 0 FAIL, 0 skipped. TypeScript, ESLint, production build, git diff --check, SEO generation/prerender/audit PASS (104 indexable, 14 noindex, 118 HTML). Build содержит существующее предупреждение о крупных chunks, не ошибку.

## Production и следующий шаг

Новых QA lead/blob/visitor records в этом ходе не создавалось: проверка остановилась на Telegram. Сообщение не принято Telegram, message_id отсутствует, удалять сообщение не требуется. Cleanup endpoint подтвердил отсутствие QA message artifact. Отдельный одноразовый Redis QA run-lock не содержит контактов и удалится по TTL (3 часа); аналитические namespaces и реальные данные не затронуты.

Основной production сохраняется на dpl_Anhgm68XAGQmMakTipLLyvzD15Bp, sitevl.tech HTTP 200. Vercel подтвердил удаление обоих временных диагностических deployments. Вспомогательный alias восстановлен на прежний READY. Временный endpoint удалён и из рабочей release-копии. Финальные commit/push/deploy не выполнялись: запрещены до live Telegram PASS.

Владелец должен самостоятельно заменить TELEGRAM_BOT_TOKEN в Vercel → ay-digital-ru → Settings → Environment Variables → Production на действующий токен существующего @ay_digital_orders_bot из BotFather. Не создавать нового бота, не присылать токен в чат, не копировать в локальный .env. После замены повторить минимальный Telegram тест и затем полный E2E.
