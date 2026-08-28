import { useMemo, useRef, useState, type FormEvent, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { labAchievements, labExperiments } from '../core/catalog';
import { recordLabSecret, unlockLabAchievement } from '../core/storage';
import type { LabPersistentState } from '../core/types';
import type { OsAppId, OsPreferences } from './types';

type VirtualNode = { id: string; path: string; name: string; type: 'folder' | 'text'; content?: string };
const FILES_KEY = 'sitevl-os-files-v2';
const NOTES_KEY = 'sitevl-os-notes-v2';
const initialFiles: VirtualNode[] = [
  { id: 'home', path: '/', name: 'Home', type: 'folder' }, { id: 'documents', path: '/', name: 'Documents', type: 'folder' }, { id: 'pictures', path: '/', name: 'Pictures', type: 'folder' }, { id: 'lab', path: '/', name: 'LAB', type: 'folder' }, { id: 'system', path: '/', name: 'System', type: 'folder' },
  { id: 'readme', path: '/LAB', name: 'ПРОЧТИ.txt', type: 'text', content: 'SITEVL LAB хранит прогресс локально в этом браузере.' },
];

function readJson<T>(key: string, fallback: T): T { try { const value = window.localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } }
function writeJson(key: string, value: unknown) { try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* Session state still works. */ } }

export function FilesApp({ labState }: { labState: LabPersistentState }) {
  const [files, setFiles] = useState<VirtualNode[]>(() => readJson(FILES_KEY, initialFiles));
  const [path, setPath] = useState('/');
  const save = (next: VirtualNode[]) => { setFiles(next); writeJson(FILES_KEY, next); };
  const visible = files.filter((item) => item.path === path);
  const create = (type: VirtualNode['type']) => { const name = window.prompt(type === 'folder' ? 'Название папки' : 'Название файла'); if (!name?.trim()) return; save([...files, { id: crypto.randomUUID(), path, name: type === 'text' && !name.endsWith('.txt') ? `${name}.txt` : name, type, content: type === 'text' ? '' : undefined }]); };
  const open = (node: VirtualNode) => { if (node.type === 'folder') setPath(`${path === '/' ? '' : path}/${node.name}`); else window.alert(node.content || 'Пустой текстовый файл'); };
  const rename = (node: VirtualNode) => { const name = window.prompt('Новое название', node.name); if (name?.trim()) save(files.map((item) => item.id === node.id ? { ...item, name } : item)); };
  const unlocked = labAchievements.filter((achievement) => labState.achievements[achievement.id]);
  return <div className="os-files"><aside><button type="button" className={path === '/' ? 'is-active' : ''} onClick={() => setPath('/')}>/Home</button><button type="button" onClick={() => setPath('/Documents')}>/Documents</button><button type="button" onClick={() => setPath('/Pictures')}>/Pictures</button><button type="button" onClick={() => setPath('/LAB')}>/LAB</button><button type="button" onClick={() => setPath('/System')}>/System</button></aside><div><div className="os-files__path"><button type="button" onClick={() => setPath('/')}>SITEVL</button> {path} <span><button type="button" onClick={() => create('folder')}>+ ПАПКА</button><button type="button" onClick={() => create('text')}>+ ФАЙЛ</button></span></div>{path === '/System' ? <p>Сигналы достижений: {unlocked.length}/{labAchievements.length}</p> : null}{visible.length ? visible.map((node) => <article key={node.id} onDoubleClick={() => open(node)}><button type="button" onClick={() => open(node)}><i>{node.type === 'folder' ? 'DIR' : 'TXT'}</i><span><strong>{node.name}</strong><small>{node.type === 'folder' ? 'Локальная папка' : 'Текстовый файл'}</small></span></button><span><button type="button" onClick={() => rename(node)}>ПЕРЕИМ.</button><button type="button" onClick={() => save(files.filter((item) => item.id !== node.id))}>УДАЛИТЬ</button></span></article>) : <p>В этой папке пока ничего нет.</p>}</div></div>;
}

export function TerminalApp({ onOpen }: { onOpen: (id: OsAppId) => void }) {
  const [lines, setLines] = useState(['ТЕРМИНАЛ SITEVL OS 2.0', 'Введите «help», чтобы увидеть команды.']);
  const [command, setCommand] = useState('');
  const [cwd, setCwd] = useState('/Home');
  const [history, setHistory] = useState<string[]>([]);
  const run = (event: FormEvent) => {
    event.preventDefault(); const raw = command.trim(); const [name, ...args] = raw.split(' ');
    const replies: Record<string, string> = {
      help: 'help · ls · cd · pwd · clear · echo · cat · date · whoami · history · lab · open · theme · reboot',
      ls: 'Documents/  Pictures/  LAB/  System/  ПРОЧТИ.txt', pwd: cwd, whoami: 'visitor@sitevl-lab', date: new Date().toLocaleString('ru-RU'),
      lab: 'Доступно семь связанных экспериментов SITEVL LAB.', history: history.join(' · ') || 'История пуста.',
      cat: args[0] === 'ПРОЧТИ.txt' ? 'Система активна. Ищите скрытые сигналы.' : `Файл не найден: ${args[0] || ''}`,
      echo: args.join(' '), theme: 'Тема меняется в приложении «Настройки».', reboot: 'Перезагрузка интерфейса не требуется.',
    };
    if (name === 'clear') setLines([]);
    else if (name === 'cd') { setCwd(args[0]?.startsWith('/') ? args[0] : `/${args[0] || 'Home'}`); setLines((current) => [...current, `> ${raw}`]); }
    else if (name === 'open') { const app = args[0] as OsAppId; if (['files', 'notes', 'browser', 'settings', 'calculator', 'gallery', 'tasks', 'paint'].includes(app)) { onOpen(app); replies.open = `Открыто приложение: ${app}`; } else replies.open = 'Используйте: open files | notes | browser | settings | calculator | gallery | tasks | paint'; setLines((current) => [...current, `> ${raw}`, replies.open]); }
    else if (name === 'unlock' || name === 'signal-7') { unlockLabAchievement('TERMINAL_SECRET'); recordLabSecret('os:terminal'); setLines((current) => [...current, `> ${raw}`, 'СКРЫТЫЙ СИГНАЛ ПРИНЯТ. +100 XP']); }
    else if (raw) setLines((current) => [...current, `> ${raw}`, replies[name] || `Команда не найдена: ${name}`]);
    if (raw) setHistory((current) => [...current.slice(-19), raw]); setCommand('');
  };
  return <div className="os-terminal"><div>{lines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</div><form onSubmit={run}><span>sitevl@lab:{cwd}$</span><input autoFocus value={command} onChange={(event) => setCommand(event.target.value)} aria-label="Команда терминала" autoCapitalize="off" autoComplete="off" /></form></div>;
}

type Note = { id: string; title: string; body: string };
export function NotesApp() {
  const [notes, setNotes] = useState<Note[]>(() => readJson(NOTES_KEY, [{ id: 'start', title: 'Идеи LAB', body: 'Исследовать комнату\nПроверить нулевую гравитацию\nНайти порталы на холсте' }]));
  const [activeId, setActiveId] = useState(notes[0]?.id || ''); const active = notes.find((note) => note.id === activeId);
  const save = (next: Note[]) => { setNotes(next); writeJson(NOTES_KEY, next); };
  return <div className="os-notes os-notes--multi"><aside>{notes.map((note) => <button className={note.id === activeId ? 'is-active' : ''} type="button" onClick={() => setActiveId(note.id)} key={note.id}>{note.title}</button>)}<button type="button" onClick={() => { const note = { id: crypto.randomUUID(), title: `Заметка ${notes.length + 1}`, body: '' }; save([...notes, note]); setActiveId(note.id); }}>+ НОВАЯ</button></aside>{active ? <section><input value={active.title} aria-label="Название заметки" onChange={(event) => save(notes.map((note) => note.id === active.id ? { ...note, title: event.target.value } : note))} /><textarea aria-label="Текст заметки" value={active.body} onChange={(event) => save(notes.map((note) => note.id === active.id ? { ...note, body: event.target.value } : note))} /><button type="button" onClick={() => { save(notes.filter((note) => note.id !== active.id)); setActiveId(notes.find((note) => note.id !== active.id)?.id || ''); }}>УДАЛИТЬ</button><small>АВТОСОХРАНЕНИЕ В БРАУЗЕРЕ</small></section> : <p>Создайте первую заметку.</p>}</div>;
}

export function BrowserApp() {
  const [url, setUrl] = useState('sitevl://home');
  const pages: Record<string, { title: string; text: string }> = { 'sitevl://home': { title: 'SITEVL OS', text: 'Внутренняя сеть экспериментальной среды.' }, 'sitevl://lab': { title: 'Каталог LAB', text: 'Семь интерактивных систем работают прямо в браузере.' }, 'sitevl://about': { title: 'О системе', text: 'SITEVL OS является вымышленной локальной веб-средой.' }, 'sitevl://files': { title: 'Локальные файлы', text: 'Файлы находятся только в этом браузере.' }, 'sitevl://system': { title: 'Состояние', text: 'Web runtime активен. Серверные команды недоступны.' } };
  const page = pages[url] || { title: 'Адрес недоступен', text: 'SITEVL Browser открывает только внутренние адреса sitevl://.' };
  return <div className="os-browser"><header><select value={url} onChange={(event) => setUrl(event.target.value)} aria-label="Адрес SITEVL Browser">{Object.keys(pages).map((item) => <option key={item}>{item}</option>)}</select></header><div><small>ВНУТРЕННЯЯ СЕТЬ SITEVL</small><h2>{page.title}</h2><p>{page.text}</p>{url === 'sitevl://lab' ? labExperiments.map((experiment) => <Link to={experiment.href} key={experiment.id}><span>{experiment.number}</span><strong>{experiment.shortTitle}</strong><small>{experiment.category}</small></Link>) : null}</div></div>;
}

export function CalculatorApp() {
  const [display, setDisplay] = useState('0'); const append = (value: string) => setDisplay((current) => current === '0' ? value : `${current}${value}`);
  const solve = () => { if (!/^[0-9+\-*/().\s]+$/.test(display)) return; try { const tokens = display.match(/\d+(?:\.\d+)?|[()+\-*/]/g) || []; const values: number[] = []; const ops: string[] = []; const rank = (op: string) => op === '+' || op === '-' ? 1 : 2; const apply = () => { const b = values.pop() || 0; const a = values.pop() || 0; const op = ops.pop(); values.push(op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : b ? a / b : 0); }; for (const token of tokens) { if (!Number.isNaN(Number(token))) values.push(Number(token)); else if (token !== '(' && token !== ')') { while (ops.length && rank(ops[ops.length - 1]) >= rank(token)) apply(); ops.push(token); } } while (ops.length) apply(); setDisplay(String(Number((values[0] || 0).toFixed(8)))); } catch { setDisplay('Ошибка'); } };
  return <div className="os-calculator"><output>{display}</output><div>{['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map((key) => <button type="button" onClick={() => key === '=' ? solve() : append(key)} key={key}>{key}</button>)}</div><button type="button" onClick={() => setDisplay('0')}>ОЧИСТИТЬ</button></div>;
}

export function GalleryApp() { return <div className="os-gallery"><header><strong>ГАЛЕРЕЯ СИСТЕМЫ</strong><small>Процедурные изображения</small></header><div>{['Сигнал', 'Комната', 'Гравитация', 'Холст', 'Ретро', 'CORE'].map((title, index) => <article style={{ '--gallery-hue': `${200 + index * 24}` } as React.CSSProperties} key={title}><i /><strong>{title}</strong><small>SV-{String(index + 1).padStart(2, '0')}.WEBP</small></article>)}</div></div>; }

export function TaskManagerApp({ openApps, uptime }: { openApps: OsAppId[]; uptime: number }) { return <div className="os-tasks"><header><span>ПРИЛОЖЕНИЕ</span><span>СОСТОЯНИЕ</span></header>{openApps.map((app) => <p key={app}><strong>{app}</strong><span>активно</span></p>)}<footer><span>Uptime: {Math.floor(uptime / 60)} мин</span><span>Оценка нагрузки интерфейса: {openApps.length < 4 ? 'низкая' : openApps.length < 8 ? 'средняя' : 'высокая'}</span><small>Это показатели SITEVL OS, а не компьютера пользователя.</small></footer></div>; }

export function PaintApp() {
  const ref = useRef<HTMLCanvasElement>(null); const drawing = useRef(false); const [color, setColor] = useState('#75a7ff');
  const point = (event: PointerEvent<HTMLCanvasElement>) => { const rect = event.currentTarget.getBoundingClientRect(); return { x: (event.clientX - rect.left) * event.currentTarget.width / rect.width, y: (event.clientY - rect.top) * event.currentTarget.height / rect.height }; };
  const draw = (event: PointerEvent<HTMLCanvasElement>) => { if (!drawing.current) return; const context = ref.current?.getContext('2d'); if (!context) return; const p = point(event); context.fillStyle = color; context.beginPath(); context.arc(p.x, p.y, 5, 0, Math.PI * 2); context.fill(); };
  return <div className="os-paint"><header><input type="color" value={color} onChange={(event) => setColor(event.target.value)} aria-label="Цвет кисти" /><button type="button" onClick={() => ref.current?.getContext('2d')?.clearRect(0, 0, 900, 560)}>ОЧИСТИТЬ</button></header><canvas ref={ref} width="900" height="560" onPointerDown={(event) => { drawing.current = true; event.currentTarget.setPointerCapture(event.pointerId); draw(event); }} onPointerMove={draw} onPointerUp={() => { drawing.current = false; }} onPointerCancel={() => { drawing.current = false; }} /></div>;
}

export function SettingsApp({ preferences, onChange, soundEnabled, onSoundChange }: { preferences: OsPreferences; onChange: (preferences: OsPreferences) => void; soundEnabled: boolean; onSoundChange: () => void }) {
  return <div className="os-settings"><section><span>ОФОРМЛЕНИЕ</span><div><button className={preferences.theme === 'dark' ? 'is-active' : ''} type="button" onClick={() => onChange({ ...preferences, theme: 'dark' })}>ТЁМНОЕ</button><button className={preferences.theme === 'light' ? 'is-active' : ''} type="button" onClick={() => onChange({ ...preferences, theme: 'light' })}>СВЕТЛОЕ</button></div></section><section><span>ФОН</span><div>{(['aurora', 'grid', 'calm'] as const).map((wallpaper) => <button className={preferences.wallpaper === wallpaper ? 'is-active' : ''} type="button" onClick={() => onChange({ ...preferences, wallpaper })} key={wallpaper}>{wallpaper === 'aurora' ? 'СИЯНИЕ' : wallpaper === 'grid' ? 'СЕТКА' : 'СПОКОЙНЫЙ'}</button>)}</div></section><section><span>ОБРАТНАЯ СВЯЗЬ</span><label><input type="checkbox" checked={soundEnabled} onChange={onSoundChange} /> Звуки интерфейса</label><label><input type="checkbox" checked={preferences.motion} onChange={(event) => onChange({ ...preferences, motion: event.target.checked })} /> Анимация интерфейса</label></section></div>;
}

export function AboutApp({ labState }: { labState: LabPersistentState }) {
  const stats = useMemo(() => ({ experiments: labState.completed.length, achievements: Object.keys(labState.achievements).length }), [labState]);
  return <div className="os-about"><div>SV</div><small>ВЕРСИЯ 2.0 · БРАУЗЕРНОЕ ИЗДАНИЕ</small><h2>SITEVL OS</h2><p>Оригинальная экспериментальная рабочая среда, в которой веб-страница ведёт себя как компактная операционная система.</p><section><span><strong>{stats.experiments}/7</strong>Завершено</span><span><strong>{stats.achievements}/{labAchievements.length}</strong>Сигналы</span></section></div>;
}
