import { Bot, Copy, Expand, Gamepad2, Globe2, LoaderCircle, MessageSquarePlus, Send, Settings, Square, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CloudflareAIProvider, getAiCapabilities } from '../../site-builder/ai/providers';
import type { ModernAiAction, ModernOsState } from './modernOsModel';

type ChatMessage = { id: string; role: 'user' | 'assistant'; text: string };

const welcome: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Я могу помочь разобраться с SITEVL NOVA. Облачный диалог доступен только при настроенном AI-провайдере.',
};

export function ModernAi({ state, onAction, onFullscreen }: { state: ModernOsState; onAction: (action: ModernAiAction) => void; onFullscreen: () => void }) {
  const capabilities = useMemo(getAiCapabilities, []);
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const controllerRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => () => { controllerRef.current?.abort(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages, loading]);

  const context = useMemo(() => ({
    system: 'SITEVL NOVA',
    apps: ['Файлы', 'Браузер', 'Игры', 'Медиа', 'Заметки', 'Настройки', 'Терминал'],
    openWindows: state.windows.map((item) => item.title),
    virtualFiles: state.files.filter((item) => !item.deletedAt).map((item) => ({ name: item.name, kind: item.kind })),
    theme: state.theme,
    volume: state.sound,
    safety: 'Не предлагай shell, JavaScript или доступ к реальному устройству. Это виртуальная браузерная ОС.',
  }), [state.files, state.sound, state.theme, state.windows]);

  const send = async () => {
    const prompt = input.trim();
    if (!prompt || loading || !capabilities.cloud) return;
    const user: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text: prompt };
    setMessages((current) => [...current, user]);
    setInput(''); setLoading(true); setError('');
    const controller = new AbortController(); controllerRef.current = controller;
    try {
      const provider = new CloudflareAIProvider();
      const text = await provider.generateText({ kind: 'site-action', prompt, context, signal: controller.signal });
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', text: text.trim() || 'Провайдер вернул пустой ответ.' }]);
    } catch (caught) {
      if (!controller.signal.aborted) setError(caught instanceof Error ? caught.message : 'Не удалось получить ответ AI.');
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
      setLoading(false);
    }
  };

  const quickActions: Array<{ label: string; icon: typeof Globe2; action: ModernAiAction }> = [
    { label: 'Открыть браузер', icon: Globe2, action: { type: 'OPEN_APP', appId: 'browser' } },
    { label: 'Открыть игры', icon: Gamepad2, action: { type: 'OPEN_APP', appId: 'games' } },
    { label: 'Настройки', icon: Settings, action: { type: 'OPEN_SETTINGS' } },
  ];

  return <div className="nova-ai">
    <aside>
      <div className="nova-ai-brand"><Bot /><span><strong>SITEVL AI</strong><small>{capabilities.cloud ? 'Облачный провайдер подключён' : 'Провайдер не настроен'}</small></span></div>
      <button type="button" onClick={() => { setMessages([welcome]); setError(''); }}><MessageSquarePlus />Новый чат</button>
      <strong>Быстрые действия</strong>
      {quickActions.map(({ label, icon: Icon, action }) => <button type="button" onClick={() => onAction(action)} key={label}><Icon />{label}</button>)}
      <button type="button" onClick={() => setMessages([welcome])}><Trash2 />Очистить историю</button>
    </aside>
    <main>
      <header><div><Bot /><span><strong>SITEVL AI</strong><small>{capabilities.cloud ? 'Текст отправляется настроенному облачному провайдеру' : 'AI-провайдер не настроен'}</small></span></div><button type="button" onClick={onFullscreen} aria-label="Развернуть AI на весь экран"><Expand /></button></header>
      <section className="nova-ai-messages">
        {messages.map((message) => <article className={`is-${message.role}`} key={message.id}><b>{message.role === 'assistant' ? 'AI' : 'Вы'}</b><div><p>{message.text}</p>{message.role === 'assistant' ? <button type="button" onClick={() => navigator.clipboard?.writeText(message.text)} aria-label="Копировать ответ"><Copy /></button> : null}</div></article>)}
        {loading ? <article className="is-assistant is-loading"><b>AI</b><div><LoaderCircle /><span>Формирую ответ…</span></div></article> : null}
        <div ref={endRef} />
      </section>
      {!capabilities.cloud ? <div className="nova-ai-unavailable"><Bot /><span><strong>AI-провайдер не настроен.</strong><small>Укажите `VITE_SITEVL_AI_ENDPOINT`, чтобы включить настоящий облачный диалог. Быстрые системные действия работают локально.</small></span></div> : null}
      {error ? <p className="nova-ai-error">{error}</p> : null}
      <form onSubmit={(event) => { event.preventDefault(); void send(); }}><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder={capabilities.cloud ? 'Спросите о SITEVL NOVA…' : 'AI-провайдер не настроен'} disabled={!capabilities.cloud} /><button type={loading ? 'button' : 'submit'} disabled={!capabilities.cloud || (!loading && !input.trim())} onClick={loading ? () => controllerRef.current?.abort() : undefined} aria-label={loading ? 'Остановить генерацию' : 'Отправить'}>{loading ? <Square /> : <Send />}</button></form>
    </main>
  </div>;
}
