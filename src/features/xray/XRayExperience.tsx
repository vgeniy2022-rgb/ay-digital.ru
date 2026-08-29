import { Check, Clipboard, Code2, RotateCcw, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { loadXRayDefinition } from './loadXRayDefinition';
import { highlightXRayLine } from './syntax';
import type { XRayPageDefinition, XRayRouteMatch } from './types';
import './xray.css';

type XRayExperienceProps = {
  match: XRayRouteMatch;
  reveal: number;
  onRevealChange: (value: number) => void;
  onClose: () => void;
};

async function copyText(value: string) {
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (copied) return true;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

export function XRayExperience({ match, reveal, onRevealChange, onClose }: XRayExperienceProps) {
  const [definition, setDefinition] = useState<XRayPageDefinition | null>(null);
  const [error, setError] = useState('');
  const [activeFileId, setActiveFileId] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'manual'>('idle');
  const codeScrollRef = useRef<HTMLDivElement>(null);
  const copyFallbackRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    setDefinition(null);
    setError('');
    loadXRayDefinition(match)
      .then((nextDefinition) => {
        if (cancelled) return;
        setDefinition(nextDefinition);
        setActiveFileId(nextDefinition.files[0]?.id || '');
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setError(reason instanceof Error ? reason.message : 'Не удалось загрузить представление страницы.');
      });
    return () => { cancelled = true; };
  }, [match]);

  useEffect(() => {
    codeScrollRef.current?.scrollTo({ top: 0 });
    setCopyStatus('idle');
  }, [activeFileId, match.route]);

  useEffect(() => {
    if (copyStatus !== 'manual') return;
    copyFallbackRef.current?.focus();
    copyFallbackRef.current?.select();
  }, [copyStatus]);

  const activeFile = useMemo(
    () => definition?.files.find((item) => item.id === activeFileId) || definition?.files[0],
    [activeFileId, definition],
  );

  const lines = useMemo(() => activeFile?.content.split('\n') || [], [activeFile]);
  const panelStyle = { '--xray-reveal': `${reveal}%` } as CSSProperties;

  return (
    <div className="xray-root" style={panelStyle} data-nosnippet>
      {reveal > 0 ? (
        <>
          <aside className="xray-panel" aria-label={`Код страницы: ${definition?.title || match.title}`}>
            <div className="xray-panel__inner">
              <header className="xray-panel__header">
                <div className="xray-panel__identity">
                  <Code2 aria-hidden="true" />
                  <div>
                    <strong>{definition?.title || match.title}</strong>
                    <span>{activeFile?.filename || 'Загрузка представления...'}</span>
                  </div>
                </div>
                <button type="button" onClick={() => onRevealChange(0)} aria-label="Вернуться к сайту" title="Вернуться к сайту">
                  <RotateCcw aria-hidden="true" />
                </button>
              </header>

              {definition ? (
                <div className="xray-tabs" role="tablist" aria-label="Файлы страницы">
                  {definition.files.map((item) => (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={item.id === activeFile?.id}
                      className={item.id === activeFile?.id ? 'is-active' : ''}
                      onClick={() => setActiveFileId(item.id)}
                      key={item.id}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="xray-code" ref={codeScrollRef} tabIndex={0} aria-label="Исходный код страницы">
                {error ? (
                  <div className="xray-state xray-state--error"><strong>Представление недоступно</strong><span>{error}</span></div>
                ) : activeFile ? (
                  <ol className={`xray-code__lines xray-code__lines--${activeFile.language}`}>
                    {lines.map((line, index) => (
                      <li key={`${index}-${line.slice(0, 16)}`}><code>{highlightXRayLine(line, activeFile.language)}</code></li>
                    ))}
                  </ol>
                ) : (
                  <div className="xray-state"><span className="xray-loader" aria-hidden="true" />Загружаю код этой страницы...</div>
                )}
              </div>

              {copyStatus === 'manual' && activeFile ? (
                <div className="xray-copy-fallback" role="dialog" aria-label="Копирование кода вручную">
                  <strong>Браузер запретил автоматическое копирование</strong>
                  <p>Код уже выделен. Нажмите Cmd+C или Ctrl+C.</p>
                  <textarea ref={copyFallbackRef} readOnly value={activeFile.content} aria-label="Код для копирования" />
                  <button type="button" onClick={() => setCopyStatus('idle')}>Закрыть</button>
                </div>
              ) : null}

              {activeFile ? (
                <footer className="xray-panel__footer">
                  <span>{activeFile.language.toUpperCase()} · {lines.length} строк</span>
                  <button
                    type="button"
                    onClick={() => {
                      copyText(activeFile.content)
                        .then((wasCopied) => {
                          if (!wasCopied) {
                            setCopyStatus('manual');
                            return;
                          }
                          setCopyStatus('copied');
                          window.setTimeout(() => setCopyStatus('idle'), 1800);
                        });
                    }}
                  >
                    {copyStatus === 'copied' ? <Check aria-hidden="true" /> : <Clipboard aria-hidden="true" />}
                    {copyStatus === 'copied' ? 'Скопировано' : 'Копировать код'}
                  </button>
                </footer>
              ) : null}
            </div>
          </aside>
          <div className="xray-divider" aria-hidden="true"><span /></div>
        </>
      ) : null}

      <div className="xray-control" aria-label="Управление X-RAY">
        <button type="button" className="xray-control__edge" onClick={() => onRevealChange(0)}>Сайт</button>
        <label>
          <span className="sr-only">Показать код страницы</span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={reveal}
            onInput={(event) => onRevealChange(Number(event.currentTarget.value))}
            aria-label="Показать код страницы"
            aria-valuetext={`${reveal}% кода`}
          />
        </label>
        <button type="button" className="xray-control__edge" onClick={() => onRevealChange(100)}>Код</button>
        <output aria-live="polite">{reveal}%</output>
        <button type="button" className="xray-control__close" onClick={onClose} aria-label="Закрыть X-RAY" title="Закрыть X-RAY">
          <X aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
