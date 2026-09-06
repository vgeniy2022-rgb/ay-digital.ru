import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { matchXRayRoute } from './routeRegistry';

const XRayExperience = lazy(() => import('./XRayExperience').then(module => ({ default: module.XRayExperience })));
const isEditing = (target: EventTarget | null) => target instanceof Element && Boolean(target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]'));
class XRayBoundary extends Component<{ children: ReactNode; close: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <button className="xray-recovery fixed bottom-5 right-5 z-[1200] rounded-xl bg-slate-950 px-4 py-3 text-white" onClick={this.props.close}>X-RAY недоступен. Вернуться к сайту</button> : this.props.children;
  }
}
export function XRayController() {
  const { pathname } = useLocation();
  const match = useMemo(() => matchXRayRoute(pathname), [pathname]);
  const [active, setActive] = useState(false);
  const [closing, setClosing] = useState(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const close = useCallback(() => {
    setClosing(true);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      setActive(false); setClosing(false);
      requestAnimationFrame(() => launcher.current?.focus({ preventScroll: true }));
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300);
  }, []);
  useEffect(() => () => clearTimeout(timeout.current), []);
  useEffect(() => {
    if (!match) { setActive(false); setClosing(false); clearTimeout(timeout.current); }
  }, [match]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!match || event.repeat || event.ctrlKey || event.metaKey || event.altKey || isEditing(event.target)) return;
      if (event.code === 'KeyX') { event.preventDefault(); if (active) close(); else setActive(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, close, match]);
  if (!match) return null;
  if (active) return <XRayBoundary close={close}><Suspense fallback={<button className="fixed bottom-5 right-5 z-[1200] rounded-xl bg-slate-950 px-4 py-3 text-white" onClick={close}>Загрузка X-RAY… · отменить</button>}>
    <XRayExperience match={match} closing={closing} onClose={close} />
  </Suspense></XRayBoundary>;
  return <button ref={launcher} type="button" data-xray-ui className="xray-launcher fixed bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] right-3 z-[1200] inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700/70 bg-slate-950 px-3 text-xs font-extrabold text-white shadow-xl transition hover:-translate-y-0.5 hover:shadow-[0_0_20px_#38bdf84d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:bottom-5 sm:right-5" onClick={() => setActive(true)} aria-label="Включить X-RAY — рентген страницы" aria-keyshortcuts="X" title="Рентген страницы · X">
    <span aria-hidden="true" className="font-mono text-sky-300">&lt;/&gt;</span><span>X-RAY</span>
  </button>;
}
