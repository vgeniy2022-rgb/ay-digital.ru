import { ArrowLeft, ArrowRight, Bookmark, ExternalLink, Home, RefreshCw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { unlockLabAchievement } from '../core/storage';
import { internalRetroPage, normalizeRetroUrl } from './retroBrowserModel';
import { addRetroVisit, type RetroState } from './retroState';

export function RetroBrowser({ state, onChange }: { state: RetroState; onChange: (state: RetroState) => void }) {
  const [stack, setStack] = useState(['sitevl://home']);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState(stack[0]);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const current = stack[index];
  const parsed = normalizeRetroUrl(current);
  const internal = parsed.ok && parsed.internal ? internalRetroPage(parsed.url) : null;

  const navigate = (raw: string) => {
    const result = normalizeRetroUrl(raw);
    if (!result.ok) { window.alert(result.reason); return; }
    const next = [...stack.slice(0, index + 1), result.url];
    setStack(next); setIndex(next.length - 1); setInput(result.url); setBlocked(false); setLoading(!result.internal);
    onChange(addRetroVisit(state, { url: result.url, title: result.internal ? internalRetroPage(result.url).title : new URL(result.url).hostname }));
    unlockLabAchievement('RETRO_WEB_PIONEER');
  };

  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => { setLoading(false); setBlocked(true); }, 6000);
    return () => window.clearTimeout(timer);
  }, [current, loading]);

  const move = (next: number) => {
    if (next < 0 || next >= stack.length) return;
    setIndex(next); setInput(stack[next]); setBlocked(false); setLoading(!stack[next].startsWith('sitevl://'));
  };
  const openExternal = () => { if (parsed.ok && !parsed.internal) window.open(parsed.url, '_blank', 'noopener,noreferrer'); };

  return <div className="retro-browser">
    <nav>
      <button type="button" disabled={!index} onClick={() => move(index - 1)} aria-label="Назад"><ArrowLeft /></button>
      <button type="button" disabled={index >= stack.length - 1} onClick={() => move(index + 1)} aria-label="Вперёд"><ArrowRight /></button>
      <button type="button" onClick={() => navigate(current)} aria-label="Обновить"><RefreshCw /></button>
      <button type="button" onClick={() => navigate('sitevl://home')} aria-label="Домой"><Home /></button>
      <form onSubmit={(event) => { event.preventDefault(); navigate(input); }}><input value={input} onChange={(event) => setInput(event.target.value)} aria-label="Адрес" /><button type="submit">ПЕРЕЙТИ</button></form>
      <button type="button" onClick={() => setLoading(false)} aria-label="Стоп"><X /></button>
    </nav>
    <div className="retro-browser__bookmarks"><Bookmark />{state.browser.bookmarks.map((item) => <button type="button" onClick={() => navigate(item.url)} key={item.id}>{item.title}</button>)}<details><summary>ИСТОРИЯ</summary><button type="button" onClick={() => onChange({ ...state, browser: { ...state.browser, history: [] } })}>Очистить историю</button>{state.browser.history.slice(-10).reverse().map((item) => <button type="button" onClick={() => navigate(item.url)} key={`${item.url}-${item.visitedAt}`}>{item.title}</button>)}</details></div>
    <main>{internal ? <article className="retro-web-page"><small>{internal.eyebrow}</small><h2>{internal.title}</h2><p>{internal.body}</p><div>{internal.links.map((link) => link.url.startsWith('/') ? <a href={link.url} key={link.url}>{link.label}</a> : <button type="button" onClick={() => navigate(link.url)} key={link.url}>{link.label}</button>)}</div></article> : blocked ? <div className="retro-browser__blocked"><strong>Этот сайт запрещает открытие внутри встроенного браузера.</strong><p>Ограничение может быть задано через X-Frame-Options или Content-Security-Policy. SITEVL не пытается обходить защиту сайта.</p><button type="button" onClick={openExternal}><ExternalLink /> Открыть в новой вкладке</button><button type="button" onClick={() => move(index - 1)}>Вернуться назад</button></div> : parsed.ok ? <iframe title="Внешняя страница Retro Browser" src={parsed.url} onLoad={() => setLoading(false)} sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts" referrerPolicy="strict-origin-when-cross-origin" /> : null}{loading ? <div className="retro-browser__loading">ЗАГРУЗКА…</div> : null}</main>
    <footer>{loading ? 'ПОЛУЧЕНИЕ ДАННЫХ…' : blocked ? 'ВСТРАИВАНИЕ ОГРАНИЧЕНО' : 'ГОТОВО'}<span>{current}</span></footer>
  </div>;
}
