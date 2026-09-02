const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
const ALLOWED_KINDS = new Set(['site-plan', 'rewrite', 'site-action']);
const MAX_PROMPT_LENGTH = 12000;

const json = (response, status, payload) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(payload));
};

const compactContext = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const safe = {};
  for (const [key, item] of Object.entries(value).slice(0, 30)) {
    if (typeof item === 'string') safe[key] = item.slice(0, 1200);
    else if (typeof item === 'number' || typeof item === 'boolean') safe[key] = item;
    else if (Array.isArray(item)) safe[key] = item.slice(0, 50);
  }
  return safe;
};

const extractText = (payload) => payload?.candidates?.[0]?.content?.parts
  ?.map((part) => typeof part?.text === 'string' ? part.text : '')
  .join('\n')
  .trim() || '';

const parseJsonAnswer = (text) => {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
};

const systemInstruction = (kind) => {
  if (kind === 'site-plan') return 'Ты помощник SITEVL Studio. Верни только корректный JSON плана сайта без Markdown и комментариев. Не добавляй JavaScript и небезопасные URL.';
  if (kind === 'rewrite') return 'Перепиши пользовательский текст ясно и естественно. Верни только готовый текст без служебных пояснений.';
  return 'Ты помощник виртуальной системы SITEVL NOVA. Отвечай по-русски, кратко и в Markdown. Не выдавай себя за управляющего реальным устройством, не предлагай shell, eval, выполнение JavaScript или доступ к личным данным.';
};

export default async function handler(request, response) {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  if (request.method === 'GET') return json(response, 200, { configured: Boolean(key), provider: 'gemini', model });
  if (request.method !== 'POST') return json(response, 405, { error: 'Метод не поддерживается.' });
  if (!key) return json(response, 503, { error: 'Gemini не настроен на сервере. Добавьте GEMINI_API_KEY в переменные окружения Vercel.' });

  const kind = typeof request.body?.kind === 'string' ? request.body.kind : '';
  const prompt = typeof request.body?.prompt === 'string' ? request.body.prompt.trim() : '';
  if (!ALLOWED_KINDS.has(kind)) return json(response, 400, { error: 'Неизвестный тип AI-запроса.' });
  if (!prompt || prompt.length > MAX_PROMPT_LENGTH) return json(response, 400, { error: `Запрос должен содержать от 1 до ${MAX_PROMPT_LENGTH} символов.` });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 40000);
  try {
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction(kind) }] },
        contents: [{ role: 'user', parts: [{ text: `${prompt}\n\nКонтекст интерфейса: ${JSON.stringify(compactContext(request.body?.context))}` }] }],
        generationConfig: { temperature: kind === 'site-plan' ? 0.25 : 0.65, maxOutputTokens: kind === 'site-plan' ? 8192 : 2048, responseMimeType: kind === 'site-plan' ? 'application/json' : 'text/plain' },
      }),
      signal: controller.signal,
    });
    const payload = await geminiResponse.json().catch(() => ({}));
    if (!geminiResponse.ok) return json(response, geminiResponse.status, { error: payload?.error?.message || 'Gemini API не смог обработать запрос.' });
    const text = extractText(payload);
    if (!text) return json(response, 502, { error: 'Gemini вернул пустой ответ.' });
    if (kind === 'site-plan') {
      try { return json(response, 200, parseJsonAnswer(text)); }
      catch { return json(response, 502, { error: 'Gemini вернул план в неподдерживаемом формате.' }); }
    }
    return json(response, 200, { text, provider: 'gemini', model });
  } catch (error) {
    return json(response, error?.name === 'AbortError' ? 504 : 502, { error: error?.name === 'AbortError' ? 'Gemini не ответил вовремя.' : 'Не удалось связаться с Gemini API.' });
  } finally {
    clearTimeout(timeout);
  }
}
