import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Code2, Crosshair, Expand, Files, Focus, Minus, X } from 'lucide-react';
import manifest from 'virtual:sitevl-xray-sources';
import { CodeLayer } from './CodeLayer';
import { ElementOverlay } from './ElementOverlay';
import { FloatingInspector } from './FloatingInspector';
import { isPrivateElement, nodeFor } from './dom';
import { isPrivateXRayRoute } from './routeRegistry';
import { useXRayRuntime } from './useXRayRuntime';
import type { XRayMode, XRayRouteMatch } from './types';
import './xray.css';

export function XRayExperience({ match, closing, onClose }: { match: XRayRouteMatch; closing: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<XRayMode>('code');
  const [opacity, setOpacity] = useState(55);
  const [brightness, setBrightness] = useState(92);
  const [focus, setFocus] = useState(false);
  const [lens, setLens] = useState(false);
  const [selecting, setSelecting] = useState(true);
  const [html, setHtml] = useState(false);
  const [minimized, setMinimized] = useState(() => matchMedia('(max-width: 640px)').matches);
  const [showFiles, setShowFiles] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);
  const controllerButton = useRef<HTMLButtonElement>(null);
  const runtime = useXRayRuntime(manifest, match.route, selecting, lens);
  const lensSupported = CSS.supports('mask-image', 'radial-gradient(black, transparent)');
  const file = manifest.files.find(item => item.id === fileId) || null;
  const toggleController = () => {
    if (minimized) { runtime.clearSelection(); setFileId(null); }
    setMinimized(value => !value);
  };
  const visibleFiles = useMemo(() => {
    const ids = new Set(runtime.sections.flatMap(section => [section.element, ...section.element.querySelectorAll('[data-xray-node]')]).filter(element => !isPrivateElement(element)).map(element => nodeFor(element, manifest)?.file));
    return manifest.files.filter(item => ids.has(item.id));
  }, [runtime.sections]);

  useLayoutEffect(() => {
    const root = document.getElementById('xray-live-site');
    if (!root) return;
    const bodyAttribute = document.body.getAttribute('data-xray-open');
    const original = ['--xray-site-opacity', '--xray-lens-x', '--xray-lens-y'].map(key => [key, root.style.getPropertyValue(key), root.style.getPropertyPriority(key)]);
    document.body.setAttribute('data-xray-open', 'true');
    root.setAttribute('data-xray-active', 'true');
    controllerButton.current?.focus({ preventScroll: true });
    return () => {
      if (bodyAttribute === null) document.body.removeAttribute('data-xray-open'); else document.body.setAttribute('data-xray-open', bodyAttribute);
      root.removeAttribute('data-xray-active'); root.removeAttribute('data-xray-lens'); root.removeAttribute('data-xray-selecting');
      for (const [key, value, priority] of original) { if (value) root.style.setProperty(key, value, priority); else root.style.removeProperty(key); }
    };
  }, []);
  useLayoutEffect(() => {
    const root = document.getElementById('xray-live-site');
    if (!root) return;
    root.style.setProperty('--xray-site-opacity', String(closing ? 1 : focus || runtime.peek ? .2 : lens ? 1 : opacity / 100));
    root.toggleAttribute('data-xray-lens', lens && !focus && !runtime.peek && !closing);
    root.toggleAttribute('data-xray-selecting', selecting && !closing);
  }, [opacity, focus, lens, runtime.peek, selecting, closing]);
  useEffect(() => { setFileId(null); setShowFiles(false); }, [match.route]);
  useEffect(() => {
    if (runtime.selected) setMinimized(true);
  }, [runtime.selected]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      event.preventDefault();
      if (runtime.selected || fileId) { runtime.clearSelection(); setFileId(null); controllerButton.current?.focus({ preventScroll: true }); }
      else if (showFiles) setShowFiles(false);
      else onClose();
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [runtime, fileId, showFiles, onClose]);

  return createPortal(<>
    <CodeLayer sections={runtime.visibleSections} manifest={manifest} selection={runtime.selection} mode={mode} html={html} brightness={focus || runtime.peek ? 100 : brightness} closing={closing} />
    <div className={`xray-effects ${closing ? 'is-closing' : ''}`} aria-hidden="true"><div className="xray-scan" key={closing ? 'out' : 'in'} />{lens && !focus && !runtime.peek && <div className="xray-lens-ring" />}</div>
    {!closing && <ElementOverlay selection={runtime.selection} mode={mode} />}
    <div className={`xray-ui ${closing ? 'is-closing' : ''}`} data-xray-ui data-nosnippet>
      <aside className={`xray-controller xray-surface ${minimized ? 'is-minimized' : ''}`} aria-label="Управление X-RAY">
        <header><button ref={controllerButton} className="xray-controller__identity" onClick={toggleController} aria-expanded={!minimized} aria-label={minimized ? 'Развернуть управление X-RAY' : 'Свернуть управление X-RAY'}><Code2 size={18} /><strong>X-RAY</strong><span className="xray-on">ON</span></button><button onClick={toggleController} aria-label={minimized ? 'Развернуть настройки' : 'Свернуть настройки'}>{minimized ? <Expand size={16} /> : <Minus size={16} />}</button><button onClick={onClose} aria-label="Выключить X-RAY" title="Esc / X"><X size={18} /></button></header>
        {minimized ? <div className="xray-compact-modes" role="group" aria-label="Режим X-RAY">{(['code', 'structure', 'box'] as const).map(value => <button key={value} aria-pressed={mode === value} onClick={() => setMode(value)}>{value === 'code' ? 'Код' : value === 'structure' ? 'Структура' : 'Box'}</button>)}</div> : <div className="xray-controller__body">
          <p className="xray-eyebrow">РЕНТГЕН ТЕКУЩЕЙ СТРАНИЦЫ</p>
          <div className="xray-modes" role="group" aria-label="Режим X-RAY">{(['code', 'structure', 'box'] as const).map(value => <button key={value} aria-pressed={mode === value} onClick={() => setMode(value)}>{value === 'code' ? 'Код' : value === 'structure' ? 'Структура' : 'Box model'}</button>)}</div>
          <label className="xray-range"><span>Непрозрачность сайта <output>{focus || runtime.peek ? 20 : opacity}%</output></span><input aria-label="Непрозрачность сайта" type="range" min={25} max={85} value={opacity} onChange={event => setOpacity(Number(event.target.value))} /></label>
          <label className="xray-range"><span>Яркость кода <output>{brightness}%</output></span><input aria-label="Яркость кода" type="range" min={25} max={100} value={brightness} onChange={event => setBrightness(Number(event.target.value))} /></label>
          <label className="xray-toggle"><span><Crosshair size={14} /> Выбор элементов</span><input type="checkbox" checked={selecting} onChange={event => { setSelecting(event.target.checked); runtime.clearSelection(); }} /></label>
          <label className="xray-toggle"><span>HTML вместо JSX</span><input type="checkbox" checked={html} onChange={event => setHtml(event.target.checked)} /></label>
          <div className="xray-tools"><button aria-pressed={focus} onClick={() => setFocus(value => !value)}><Focus size={14} />Фокус кода</button><button aria-pressed={lens} disabled={!lensSupported} onClick={() => setLens(value => !value)}><Crosshair size={14} />Линза <small>EXP</small></button></div>
          {!lensSupported && <p className="xray-help">CSS-маска не поддерживается: линза недоступна, обычный рентген работает.</p>}
          <button className="xray-files-toggle" aria-expanded={showFiles} onClick={() => setShowFiles(value => !value)}><Files size={14} /> Файлы этой страницы <span>{visibleFiles.length}</span></button>
          {showFiles && <div className="xray-file-list" aria-label="Разрешённые frontend-файлы">{visibleFiles.map(item => <button key={item.id} onClick={() => { runtime.clearSelection(); setFileId(item.id); setMinimized(true); }}>{item.path.replace('src/', '')}</button>)}</div>}
          {isPrivateXRayRoute(match.route) && <p className="xray-help">Область форм и пользовательских результатов исключена. Исследовать можно шапку и подвал.</p>}
          <p className="xray-help">Наведение → строка кода. Клик → инспектор. Для обычных действий выключите выбор. Прокрутка синхронна.</p>
          <div className="xray-shortcuts"><span><kbd>X</kbd> вкл/выкл</span><span><kbd>⌥ Alt</kbd> просвет</span><span><kbd>Esc</kbd> назад</span></div>
        </div>}
      </aside>
      <FloatingInspector selection={runtime.selected} file={file} manifest={manifest} onClose={() => { runtime.clearSelection(); setFileId(null); controllerButton.current?.focus({ preventScroll: true }); }} />
      <div className="xray-live-status" role="status">{closing ? 'X-RAY выключается' : runtime.peek ? 'Просвет · отпустите Option / Alt' : mode === 'box' ? 'BOX MODEL · margin оранжевый · border фиолетовый · padding зелёный · content синий' : selecting ? 'X-RAY · выберите элемент · Esc — выход' : 'X-RAY · обычные действия сайта включены'}</div>
    </div>
  </>, document.body);
}
