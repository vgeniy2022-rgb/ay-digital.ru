import { useEffect, useRef, useState } from 'react';
import { Copy, X } from 'lucide-react';
import { CodeLines } from './CodeLayer';
import { domLines, sourceLines } from './dom';
import { safeXRayJson } from './sanitize';
import type { XRayLanguage, XRayManifest, XRaySelection, XRaySourceFile } from './types';

export function FloatingInspector({ selection, file, manifest, onClose }: { selection: XRaySelection | null; file: XRaySourceFile | null; manifest: XRayManifest; onClose: () => void }) {
  const [tab, setTab] = useState<'source' | 'css' | 'data'>('source');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { setTab('source'); setCopyState('idle'); closeButton.current?.focus({ preventScroll: true }); }, [selection?.element, file?.id]);
  useEffect(() => { setCopyState('idle'); }, [tab]);
  if (!selection && !file) return null;
  const sourceFile = file || manifest.files.find(item => item.id === selection?.node?.file);
  let language: XRayLanguage = selection?.node || file ? 'tsx' : 'html';
  let lines = file ? file.lines.slice(0, 160) : selection?.node ? sourceLines(manifest, selection.node, selection.node, 90) : domLines(selection!.element, selection!.element);
  if (tab === 'css' && selection) {
    language = 'css';
    lines = [`/* Вычисленные стили, не исходный CSS */`, `${selection.data.element} {`, ...Object.entries(selection.styles).map(([key, value]) => `  ${key}: ${value};`), '}'].map((text, index) => ({ number: index + 1, text }));
  }
  if (tab === 'data' && selection) {
    language = 'json';
    lines = safeXRayJson(selection.data).split('\n').map((text, index) => ({ number: index + 1, text }));
  }
  return <aside className="xray-inspector xray-surface" data-xray-ui data-nosnippet aria-label="Инспектор элемента X-RAY">
    <header><div><strong>{file ? file.path.split('/').slice(-1)[0] : selection?.data.element.toUpperCase()}</strong><span>{sourceFile?.path || 'Безопасный DOM · исходник не опубликован'}</span></div><button ref={closeButton} onClick={onClose} aria-label="Закрыть инспектор"><X size={17} /></button></header>
    {selection && <><p className="xray-inspector__explanation">{selection.explanation}</p><div className="xray-inspector__tabs" role="group" aria-label="Представление элемента">
      <button aria-pressed={tab === 'source'} onClick={() => setTab('source')}>{selection.node ? 'JSX' : 'HTML'}</button><button aria-pressed={tab === 'css'} onClick={() => setTab('css')}>CSS</button><button aria-pressed={tab === 'data'} onClick={() => setTab('data')}>DATA</button>
    </div></>}
    <div className="xray-inspector__code" tabIndex={0} aria-label="Код выбранного элемента"><CodeLines lines={lines} language={language} /></div>
    <footer><span>{tab === 'data' ? 'DOM-атрибуты; props, значения форм и state не читаются.' : tab === 'css' ? 'getComputedStyle · только разрешённые свойства' : file || selection?.node ? 'Фрагменты реального JSX · закрытые строки исключены' : 'HTML текущего элемента, без приватных потомков'}</span><button onClick={async () => {
      try { await navigator.clipboard.writeText(lines.map(line => line.text).join('\n')); setCopyState('copied'); } catch { setCopyState('error'); }
    }} aria-label={copyState === 'copied' ? 'Код скопирован' : copyState === 'error' ? 'Буфер недоступен. Повторить копирование' : 'Копировать безопасный фрагмент'}><Copy size={14} /><span role="status">{copyState === 'copied' ? 'Готово' : copyState === 'error' ? 'Повторить' : 'Копировать'}</span></button></footer>
  </aside>;
}
