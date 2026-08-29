import { Eraser, ExternalLink, Save } from 'lucide-react';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { completeLabExperiment, recordLabSecret, unlockLabAchievement } from '../core/storage';

const RETRO_NOTE_KEY = 'sitevl-retro-note-v1';

function readRetroNote() {
  try { return window.localStorage.getItem(RETRO_NOTE_KEY) || 'ЗАМЕТКИ SITEVL LAB\n\nБраузер и есть компьютер.\nКаталог LAB обновляется и не привязан к фиксированному числу экспериментов.'; }
  catch { return 'ЗАМЕТКИ SITEVL LAB\n\nБраузер и есть компьютер.\nКаталог LAB обновляется и не привязан к фиксированному числу экспериментов.'; }
}

function writeRetroNote(value: string) {
  try { window.localStorage.setItem(RETRO_NOTE_KEY, value); } catch { /* The editor still works for the active session. */ }
}

export function RetroNotepad() {
  const [text, setText] = useState(readRetroNote);
  return <div className="retro-notepad"><div className="retro-app-menu">ФАЙЛ&nbsp;&nbsp; ПРАВКА&nbsp;&nbsp; ПОИСК&nbsp;&nbsp; ПОМОЩЬ</div><textarea aria-label="Текстовый редактор Retro Computing" value={text} onChange={(event) => { setText(event.target.value); writeRetroNote(event.target.value); }} /><small><Save /> СОХРАНЕНО НА ЛОКАЛЬНЫЙ ДИСК</small></div>;
}

function evaluateExpression(value: string) {
  const tokens = value.match(/\d+(?:\.\d+)?|[+\-*/]/g);
  if (!tokens || tokens.join('') !== value || tokens.length > 31) return 'ERROR';
  const values: number[] = [];
  const operators: string[] = [];
  const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };
  const apply = () => {
    const operator = operators.pop();
    const right = values.pop();
    const left = values.pop();
    if (!operator || left === undefined || right === undefined) throw new Error('Invalid expression');
    if (operator === '+') values.push(left + right);
    if (operator === '-') values.push(left - right);
    if (operator === '*') values.push(left * right);
    if (operator === '/') values.push(right === 0 ? Number.NaN : left / right);
  };
  try {
    tokens.forEach((token, index) => {
      if (/^\d/.test(token)) values.push(Number(token));
      else {
        if (index === 0 || index === tokens.length - 1 || !/^\d/.test(tokens[index - 1])) throw new Error('Invalid expression');
        while (operators.length && precedence[operators[operators.length - 1] || ''] >= precedence[token]) apply();
        operators.push(token);
      }
    });
    while (operators.length) apply();
    const result = values[0];
    return Number.isFinite(result) ? String(Math.round(result * 100000) / 100000) : 'ERROR';
  } catch {
    return 'ERROR';
  }
}

export function RetroCalculator() {
  const [value, setValue] = useState('0');
  const press = (key: string) => {
    if (key === 'C') return setValue('0');
    if (key === '=') return setValue(evaluateExpression(value));
    setValue((current) => current === '0' || current === 'ERROR' ? key : `${current}${key}`);
  };
  return <div className="retro-calculator"><output aria-live="polite">{value}</output><div>{['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', 'C', '+', '='].map((key) => <button className={key === '=' ? 'is-equals' : ''} type="button" onClick={() => press(key)} key={key}>{key}</button>)}</div></div>;
}

export function RetroPaint() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState('#101010');
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.fillStyle = '#fffdf4';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);
  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
  };
  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    const context = canvasRef.current?.getContext('2d');
    const position = point(event);
    context?.beginPath();
    context?.moveTo(position.x, position.y);
  };
  const draw = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    const position = point(event);
    context.strokeStyle = color;
    context.lineWidth = 5;
    context.lineCap = 'round';
    context.lineTo(position.x, position.y);
    context.stroke();
  };
  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.fillStyle = '#fffdf4';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };
  return <div className="retro-paint"><aside>{['#101010', '#254cdd', '#e7473d', '#eab72c', '#168c5c'].map((item) => <button type="button" aria-label={`Цвет ${item}`} className={color === item ? 'is-active' : ''} style={{ background: item }} onClick={() => setColor(item)} key={item} />)}<button type="button" aria-label="Очистить рисунок" onClick={clear}><Eraser /></button></aside><canvas ref={canvasRef} width={520} height={310} aria-label="Холст Retro Paint" onPointerDown={start} onPointerMove={draw} onPointerUp={() => { drawing.current = false; }} onPointerCancel={() => { drawing.current = false; }} /></div>;
}

export function RetroFiles() {
  const [drive, setDrive] = useState<'C' | 'A'>('C');
  const openSecret = () => { unlockLabAchievement('FLOPPY_SECRET'); recordLabSecret('retro:floppy'); completeLabExperiment('retro'); window.alert('СЕКРЕТНЫЙ СИГНАЛ: БРАУЗЕР ПОМНИТ БОЛЬШЕ, ЧЕМ КАЖЕТСЯ.'); };
  return <div className="retro-files"><aside><strong>{drive === 'C' ? 'ЛОКАЛЬНЫЙ ДИСК C:\\' : 'ДИСКЕТА A:\\'}</strong><span>{drive === 'C' ? '3 объекта' : '2 объекта'}</span><span>{drive === 'C' ? '1.4 MB свободно' : '720 KB свободно'}</span><button type="button" onClick={() => setDrive(drive === 'C' ? 'A' : 'C')}>{drive === 'C' ? 'ОТКРЫТЬ A:\\' : 'НАЗАД В C:\\'}</button></aside><section>{drive === 'C' ? <><article><i>TXT</i><div><strong>ПРОЧТИ.TXT</strong><p>SITEVL LAB — экспериментальная веб-среда. Откройте семь модулей, чтобы собрать всю систему.</p></div></article><Link to="/lab/2d"><i>APP</i><span>СЛОМАТЬ.EXE</span><ExternalLink /></Link><Link to="/lab/canvas"><i>DOC</i><span>ХОЛСТ.LNK</span><ExternalLink /></Link></> : <><button type="button" onClick={openSecret}><i>SYS</i><span>СИГНАЛ_07.DAT</span></button><article><i>TXT</i><div><strong>SECRET.TXT</strong><p>Откройте SIGNAL_07.DAT, чтобы прочитать скрытый сектор.</p></div></article></>}</section></div>;
}

export function RetroControlPanel({ crt, onCrtChange, monochrome, onMonochromeChange }: { crt: boolean; onCrtChange: (value: boolean) => void; monochrome: boolean; onMonochromeChange: (value: boolean) => void }) {
  const [contrast, setContrast] = useState(72);
  const [desktop, setDesktop] = useState<'teal' | 'blue' | 'gray'>('teal');
  return <div className="retro-control"><section><strong>ЭКРАН</strong><label>Контраст<input type="range" min="35" max="100" value={contrast} onChange={(event) => setContrast(Number(event.target.value))} /></label><small>{contrast}%</small></section><section><strong>ЦВЕТ РАБОЧЕГО СТОЛА</strong><div>{(['teal', 'blue', 'gray'] as const).map((item) => <button className={desktop === item ? 'is-active' : ''} type="button" onClick={() => setDesktop(item)} key={item}>{item === 'teal' ? 'БИРЮЗА' : item === 'blue' ? 'СИНИЙ' : 'СЕРЫЙ'}</button>)}</div></section><section><strong>ЭФФЕКТ МОНИТОРА</strong><label><input type="checkbox" checked={crt} onChange={(event) => onCrtChange(event.target.checked)} /> CRT-развёртка</label><label><input type="checkbox" checked={monochrome} onChange={(event) => onMonochromeChange(event.target.checked)} /> Монохром</label></section></div>;
}

export function RetroTerminal() {
  const [lines, setLines] = useState(['SITEVL RETRO SHELL', 'Введите HELP для списка команд.']);
  const [value, setValue] = useState('');
  const run = (event: React.FormEvent) => { event.preventDefault(); const command = value.trim().toUpperCase(); const reply = command === 'HELP' ? 'DIR · VER · DATE · LAB · CLS · SECRET' : command === 'DIR' ? 'A:\\  C:\\  ПРОЧТИ.TXT  SNAKE.COM' : command === 'VER' ? 'SITEVL RETRO 2.0' : command === 'DATE' ? new Date().toLocaleString('ru-RU') : command === 'LAB' ? '7 ЭКСПЕРИМЕНТОВ В ЛОКАЛЬНОЙ СЕТИ' : command === 'SECRET' ? 'ПРОВЕРЬТЕ ДИСКЕТУ A:\\' : `НЕИЗВЕСТНАЯ КОМАНДА: ${command}`; if (command === 'CLS') setLines([]); else if (command) setLines((items) => [...items, `C:\\>${command}`, reply]); setValue(''); };
  return <div className="retro-terminal"><div>{lines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</div><form onSubmit={run}><span>C:\\&gt;</span><input value={value} onChange={(event) => setValue(event.target.value)} aria-label="Команда Retro Terminal" autoFocus /></form></div>;
}

export function RetroSnake() {
  const [snake, setSnake] = useState([{ x: 7, y: 6 }, { x: 6, y: 6 }, { x: 5, y: 6 }]);
  const [food, setFood] = useState({ x: 14, y: 8 });
  const direction = useRef({ x: 1, y: 0 });
  const [running, setRunning] = useState(true);
  useEffect(() => {
    unlockLabAchievement('RETRO_GAMER');
    const key = (event: KeyboardEvent) => { const map: Record<string, { x: number; y: number }> = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } }; if (map[event.key]) { event.preventDefault(); direction.current = map[event.key]; } };
    window.addEventListener('keydown', key, { passive: false });
    const timer = window.setInterval(() => setSnake((current) => { if (!running) return current; const head = { x: (current[0].x + direction.current.x + 20) % 20, y: (current[0].y + direction.current.y + 14) % 14 }; if (current.some((item) => item.x === head.x && item.y === head.y)) { setRunning(false); return current; } const next = [head, ...current]; if (head.x === food.x && head.y === food.y) setFood({ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 14) }); else next.pop(); return next; }), 145);
    return () => { window.clearInterval(timer); window.removeEventListener('keydown', key); };
  }, [food.x, food.y, running]);
  const turn = (x: number, y: number) => { direction.current = { x, y }; if (!running) { setSnake([{ x: 7, y: 6 }, { x: 6, y: 6 }, { x: 5, y: 6 }]); setRunning(true); } };
  return <div className="retro-snake"><header><strong>SNAKE.COM</strong><span>СЧЁТ {snake.length - 3}</span></header><div className="retro-snake__board">{snake.map((item, index) => <i className={index === 0 ? 'is-head' : ''} style={{ left: `${item.x * 5}%`, top: `${item.y * (100 / 14)}%` }} key={`${item.x}-${item.y}-${index}`} />)}<b style={{ left: `${food.x * 5}%`, top: `${food.y * (100 / 14)}%` }} /></div><footer><button type="button" onClick={() => turn(-1, 0)}>←</button><button type="button" onClick={() => turn(0, -1)}>↑</button><button type="button" onClick={() => turn(0, 1)}>↓</button><button type="button" onClick={() => turn(1, 0)}>→</button></footer>{!running ? <button type="button" onClick={() => turn(1, 0)}>ИГРАТЬ СНОВА</button> : null}</div>;
}
