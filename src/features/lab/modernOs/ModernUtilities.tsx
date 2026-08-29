import { Archive, Camera, CirclePause, CirclePlay, Code2, Download, FileArchive, FileText, Gauge, Mic, RotateCcw, Save, Search, Square, Trash2, Upload, Video } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { createModernWebLabDocument } from './modernWebLab';
import { importModernFile, updateModernFileContent, type ModernAppId, type ModernFile, type ModernOsState } from './modernOsModel';

type Props = { appId: ModernAppId; state: ModernOsState; setState: Dispatch<SetStateAction<ModernOsState>> };

const readAsDataUrl = (file: Blob) => new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result || '')); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file); });
const saveVirtual = (setState: Props['setState'], input: Parameters<typeof importModernFile>[1]) => setState((current) => importModernFile(current, input));

function CodeEditor({ state, setState }: Omit<Props, 'appId'>) {
  const editable = state.files.filter((item) => !item.deletedAt && (item.kind === 'text' || item.kind === 'json'));
  const [selectedId, setSelectedId] = useState(editable[0]?.id || '');
  const selected = editable.find((item) => item.id === selectedId);
  const [value, setValue] = useState(selected?.content || '');
  const [query, setQuery] = useState('');
  const visible = editable.filter((item) => item.name.toLocaleLowerCase('ru').includes(query.toLocaleLowerCase('ru')));
  useEffect(() => { setValue(selected?.content || ''); }, [selected?.content, selectedId]);
  const create = () => { saveVirtual(setState, { parentId: 'documents', name: `script-${Date.now().toString().slice(-4)}.txt`, kind: 'text', content: '', mimeType: 'text/plain' }); };
  return <div className="nova-code-editor"><aside><header><strong>Файлы</strong><button type="button" onClick={create} aria-label="Новый текстовый файл"><FileText /></button></header><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти файл" /></label>{visible.map((item) => <button className={selectedId === item.id ? 'is-active' : ''} type="button" onClick={() => setSelectedId(item.id)} key={item.id}><Code2 /><span>{item.name}</span></button>)}</aside><main><header><span><Code2 /><strong>{selected?.name || 'Выберите файл'}</strong></span><button type="button" disabled={!selected} onClick={() => selected && setState((current) => updateModernFileContent(current, selected.id, value))}><Save />Сохранить</button></header><textarea spellCheck={false} value={value} disabled={!selected} onChange={(event) => setValue(event.target.value)} aria-label="Содержимое виртуального файла" /><footer>{selected ? `${value.length} символов · файл хранится в SITEVL Drive` : 'Создайте или выберите текстовый файл.'}</footer></main></div>;
}

function WebLab({ setState }: Pick<Props, 'setState'>) {
  const [html, setHtml] = useState('<main>\n  <h1>Моя первая страница</h1>\n  <p>Собрано в WEB LAB.</p>\n  <button>Подробнее</button>\n</main>');
  const [css, setCss] = useState('body { margin: 0; padding: 48px; font: 16px/1.5 system-ui; color: #142033; background: #eef5ff; }\nmain { max-width: 620px; margin: auto; }\nbutton { border: 0; border-radius: 8px; padding: 12px 18px; color: white; background: #276cff; }');
  const [tab, setTab] = useState<'html' | 'css'>('html');
  const preview = useMemo(() => createModernWebLabDocument(html, css), [html, css]);
  const save = () => saveVirtual(setState, { parentId: 'documents', name: `web-lab-${Date.now().toString().slice(-6)}.html`, kind: 'text', content: `<!-- HTML -->\n${html}\n\n/* CSS */\n${css}`, mimeType: 'text/html' });
  return <div className="nova-web-lab"><header><div><button className={tab === 'html' ? 'is-active' : ''} type="button" onClick={() => setTab('html')}>HTML</button><button className={tab === 'css' ? 'is-active' : ''} type="button" onClick={() => setTab('css')}>CSS</button></div><span>JavaScript отключён</span><button type="button" onClick={save}><Save />Сохранить проект</button></header><section><textarea spellCheck={false} value={tab === 'html' ? html : css} onChange={(event) => tab === 'html' ? setHtml(event.target.value) : setCss(event.target.value)} aria-label={tab === 'html' ? 'HTML' : 'CSS'} /><iframe title="Предпросмотр WEB LAB" sandbox="" srcDoc={preview} /></section><footer>Предпросмотр работает в изолированном iframe: скрипты, обработчики событий и опасные URL удаляются.</footer></div>;
}

function DocumentViewer({ state }: Pick<Props, 'state'>) {
  const inputRef = useRef<HTMLInputElement>(null); const objectUrlRef = useRef('');
  const [document, setDocument] = useState<{ name: string; url?: string; text?: string; type: string } | null>(null);
  const virtual = state.files.filter((item) => !item.deletedAt && (item.kind === 'text' || item.kind === 'json'));
  useEffect(() => () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); }, []);
  const openLocal = async (file?: File) => { if (!file) return; if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) { const url = URL.createObjectURL(file); objectUrlRef.current = url; setDocument({ name: file.name, url, type: 'PDF' }); } else setDocument({ name: file.name, text: await file.text(), type: 'Текст' }); };
  return <div className="nova-document-viewer"><aside><button type="button" onClick={() => inputRef.current?.click()}><Upload />Открыть файл</button><input ref={inputRef} hidden type="file" accept="application/pdf,text/plain,text/markdown,.txt,.md,.json" onChange={(event) => { void openLocal(event.target.files?.[0]); event.target.value = ''; }} /><strong>SITEVL Drive</strong>{virtual.map((item) => <button type="button" onClick={() => setDocument({ name: item.name, text: item.content || '', type: fileKind(item) })} key={item.id}><FileText />{item.name}</button>)}</aside><main>{document ? <><header><strong>{document.name}</strong><small>{document.type}</small></header>{document.url ? <iframe title={document.name} src={document.url} /> : <pre>{document.text || 'Пустой документ'}</pre>}</> : <div className="nova-utility-empty"><FileText /><h2>Просмотр документов</h2><p>Откройте PDF, TXT, Markdown или JSON явным выбором. Файл не отправляется на сервер.</p></div>}</main></div>;
}

const fileKind = (file: ModernFile) => file.kind === 'json' ? 'JSON' : 'Текст';

function ArchiveManager({ state, setState }: Omit<Props, 'appId'>) {
  const inputRef = useRef<HTMLInputElement>(null); const [entries, setEntries] = useState<Array<{ name: string; dir: boolean; size: number }>>([]); const [status, setStatus] = useState('');
  const openZip = async (file?: File) => { if (!file) return; setStatus('Читаю архив…'); try { const JSZip = (await import('jszip')).default; const zip = await JSZip.loadAsync(file); const next = await Promise.all(Object.values(zip.files).slice(0, 200).map(async (entry) => ({ name: entry.name, dir: entry.dir, size: entry.dir ? 0 : (await entry.async('uint8array')).byteLength }))); setEntries(next); setStatus(`${next.length} объектов`); } catch { setStatus('Не удалось прочитать ZIP-архив.'); } };
  const exportZip = async () => { const files = state.files.filter((item) => !item.deletedAt && (item.kind === 'text' || item.kind === 'json')); const JSZip = (await import('jszip')).default; const zip = new JSZip(); files.forEach((item) => zip.file(item.name, item.content || '')); const blob = await zip.generateAsync({ type: 'blob' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'sitevl-documents.zip'; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); setStatus(`Экспортировано: ${files.length} файлов`); };
  const saveListing = () => saveVirtual(setState, { parentId: 'downloads', name: 'archive-contents.txt', kind: 'text', content: entries.map((item) => `${item.dir ? '[ПАПКА]' : item.size + ' B'} ${item.name}`).join('\n'), mimeType: 'text/plain' });
  return <div className="nova-archive"><header><button type="button" onClick={() => inputRef.current?.click()}><FileArchive />Открыть ZIP</button><input ref={inputRef} hidden type="file" accept=".zip,application/zip" onChange={(event) => { void openZip(event.target.files?.[0]); event.target.value = ''; }} /><button type="button" onClick={() => void exportZip()}><Download />Экспорт документов</button><button type="button" disabled={!entries.length} onClick={saveListing}><Save />Сохранить список</button><span>{status}</span></header><main>{entries.length ? entries.map((entry) => <article key={entry.name}><Archive /><span><strong>{entry.name}</strong><small>{entry.dir ? 'Папка' : `${entry.size} байт`}</small></span></article>) : <div className="nova-utility-empty"><FileArchive /><h2>Архиватор</h2><p>Открывает ZIP без загрузки на сервер и создаёт настоящий ZIP из текстовых файлов SITEVL Drive.</p></div>}</main></div>;
}

function SystemMonitor({ state }: Pick<Props, 'state'>) {
  const [fps, setFps] = useState(0);
  useEffect(() => { let frame = 0; let previous = performance.now(); let animation = 0; const tick = (now: number) => { frame += 1; if (now - previous >= 1000) { setFps(Math.round(frame * 1000 / (now - previous))); frame = 0; previous = now; } animation = requestAnimationFrame(tick); }; animation = requestAnimationFrame(tick); return () => cancelAnimationFrame(animation); }, []);
  const active = state.windows.filter((item) => !item.minimized);
  const metrics = [{ label: 'Нагрузка симуляции', value: `${Math.min(92, 8 + active.length * 9)}%` }, { label: 'Память среды', value: `${Math.min(88, 18 + state.files.length * 2)}%` }, { label: 'FPS интерфейса', value: String(fps) }, { label: 'Виртуальные файлы', value: String(state.files.length) }];
  return <div className="nova-monitor"><header><Gauge /><div><h2>Системный монитор</h2><p>Данные виртуальной системы SITEVL NOVA, не характеристики вашего устройства.</p></div></header><section>{metrics.map((metric) => <article key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong><i style={{ width: metric.value.endsWith('%') ? metric.value : `${Math.min(100, fps)}%` }} /></article>)}</section><aside><strong>Открытые приложения</strong>{active.map((window) => <span key={window.id}>{window.title}</span>)}</aside></div>;
}

function CameraApp({ setState }: Pick<Props, 'setState'>) {
  const videoRef = useRef<HTMLVideoElement>(null); const streamRef = useRef<MediaStream | null>(null); const [error, setError] = useState(''); const [active, setActive] = useState(false); const [preview, setPreview] = useState('');
  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);
  const start = async () => { setError(''); try { const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); streamRef.current = stream; if (videoRef.current) videoRef.current.srcObject = stream; setActive(true); } catch { setError('Не удалось открыть камеру. Проверьте разрешение браузера и доступность устройства.'); } };
  const capture = () => { const video = videoRef.current; if (!video?.videoWidth) return; const canvas = document.createElement('canvas'); canvas.width = Math.min(video.videoWidth, 1280); canvas.height = Math.round(canvas.width * video.videoHeight / video.videoWidth); canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height); const content = canvas.toDataURL('image/jpeg', .82); setPreview(content); saveVirtual(setState, { parentId: 'pictures', name: `camera-${Date.now()}.jpg`, kind: 'image', content, mimeType: 'image/jpeg', size: Math.round(content.length * .75) }); };
  return <div className="nova-capture"><header><Video /><div><h2>Камера</h2><p>Камера включается только после вашего нажатия.</p></div></header><main>{preview ? <img src={preview} alt="Последний снимок" /> : <video ref={videoRef} autoPlay playsInline muted />}</main>{error ? <p>{error}</p> : null}<footer>{!active ? <button type="button" onClick={() => void start()}><Camera />Разрешить доступ к камере</button> : <><button type="button" onClick={capture}><Camera />Сделать снимок</button><button type="button" onClick={() => setPreview('')} disabled={!preview}><RotateCcw />Вернуться к камере</button></>}</footer></div>;
}

function RecorderApp({ setState }: Pick<Props, 'setState'>) {
  const recorderRef = useRef<MediaRecorder | null>(null); const streamRef = useRef<MediaStream | null>(null); const chunksRef = useRef<Blob[]>([]); const urlRef = useRef('');
  const [status, setStatus] = useState<'idle' | 'recording' | 'paused' | 'ready'>('idle'); const [url, setUrl] = useState(''); const [error, setError] = useState('');
  useEffect(() => () => { streamRef.current?.getTracks().forEach((track) => track.stop()); if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);
  const start = async () => { setError(''); try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); const recorder = new MediaRecorder(stream); streamRef.current = stream; recorderRef.current = recorder; chunksRef.current = []; recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); }; recorder.onstop = () => { const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }); if (urlRef.current) URL.revokeObjectURL(urlRef.current); urlRef.current = URL.createObjectURL(blob); setUrl(urlRef.current); setStatus('ready'); stream.getTracks().forEach((track) => track.stop()); }; recorder.start(); setStatus('recording'); } catch { setError('Микрофон недоступен или разрешение было отклонено.'); } };
  const save = async () => { const blob = new Blob(chunksRef.current, { type: recorderRef.current?.mimeType || 'audio/webm' }); if (blob.size > 1_500_000) { setError('Запись слишком большая для локального хранилища NOVA. Сохраните более короткий фрагмент.'); return; } const content = await readAsDataUrl(blob); saveVirtual(setState, { parentId: 'music', name: `recording-${Date.now()}.webm`, kind: 'audio', content, mimeType: blob.type, size: blob.size }); };
  return <div className="nova-recorder"><header><Mic /><div><h2>Диктофон</h2><p>Запись остаётся в виртуальном хранилище этого браузера.</p></div></header><main><i className={`is-${status}`}><Mic /></i><strong>{status === 'recording' ? 'Идёт запись' : status === 'paused' ? 'Пауза' : status === 'ready' ? 'Запись готова' : 'Микрофон выключен'}</strong>{url ? <audio src={url} controls /> : null}</main>{error ? <p>{error}</p> : null}<footer>{status === 'idle' ? <button type="button" onClick={() => void start()}><CirclePlay />Начать запись</button> : null}{status === 'recording' ? <><button type="button" onClick={() => { recorderRef.current?.pause(); setStatus('paused'); }}><CirclePause />Пауза</button><button type="button" onClick={() => recorderRef.current?.stop()}><Square />Стоп</button></> : null}{status === 'paused' ? <><button type="button" onClick={() => { recorderRef.current?.resume(); setStatus('recording'); }}><CirclePlay />Продолжить</button><button type="button" onClick={() => recorderRef.current?.stop()}><Square />Стоп</button></> : null}{status === 'ready' ? <><button type="button" onClick={() => void save()}><Save />Сохранить в Музыку</button><button type="button" onClick={() => { setStatus('idle'); setUrl(''); }}><Trash2 />Новая запись</button></> : null}</footer></div>;
}

export function ModernUtilities({ appId, state, setState }: Props) {
  if (appId === 'code') return <CodeEditor state={state} setState={setState} />;
  if (appId === 'weblab') return <WebLab setState={setState} />;
  if (appId === 'documents') return <DocumentViewer state={state} />;
  if (appId === 'archive') return <ArchiveManager state={state} setState={setState} />;
  if (appId === 'monitor') return <SystemMonitor state={state} />;
  if (appId === 'camera') return <CameraApp setState={setState} />;
  if (appId === 'recorder') return <RecorderApp setState={setState} />;
  return <div className="nova-utility-empty"><Code2 /><h2>Приложение недоступно</h2></div>;
}
