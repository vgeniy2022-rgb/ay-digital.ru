import { Eraser, ExternalLink, Save } from 'lucide-react';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';

const RETRO_NOTE_KEY = 'sitevl-retro-note-v1';

function readRetroNote() {
  try { return window.localStorage.getItem(RETRO_NOTE_KEY) || 'SITEVL LAB NOTES\n\nThe browser is the computer.\nSeven experiments are waiting.'; }
  catch { return 'SITEVL LAB NOTES\n\nThe browser is the computer.\nSeven experiments are waiting.'; }
}

function writeRetroNote(value: string) {
  try { window.localStorage.setItem(RETRO_NOTE_KEY, value); } catch { /* The editor still works for the active session. */ }
}

export function RetroNotepad() {
  const [text, setText] = useState(readRetroNote);
  return <div className="retro-notepad"><div className="retro-app-menu">FILE&nbsp;&nbsp; EDIT&nbsp;&nbsp; SEARCH&nbsp;&nbsp; HELP</div><textarea aria-label="Текстовый редактор Retro Computing" value={text} onChange={(event) => { setText(event.target.value); writeRetroNote(event.target.value); }} /><small><Save /> SAVED TO LOCAL DISK WHEN AVAILABLE</small></div>;
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
  return <div className="retro-files"><aside><strong>LOCAL DISK</strong><span>3 objects</span><span>1.4 MB free</span></aside><section><article><i>TXT</i><div><strong>README.TXT</strong><p>SITEVL LAB is an experimental web environment. Open the seven modules to reveal the complete system.</p></div></article><Link to="/lab/2d"><i>APP</i><span>BREAK.EXE</span><ExternalLink /></Link><Link to="/lab/canvas"><i>DOC</i><span>CANVAS.LNK</span><ExternalLink /></Link></section></div>;
}

export function RetroControlPanel({ crt, onCrtChange }: { crt: boolean; onCrtChange: (value: boolean) => void }) {
  const [contrast, setContrast] = useState(72);
  const [desktop, setDesktop] = useState<'teal' | 'blue' | 'gray'>('teal');
  return <div className="retro-control"><section><strong>DISPLAY</strong><label>Contrast<input type="range" min="35" max="100" value={contrast} onChange={(event) => setContrast(Number(event.target.value))} /></label><small>{contrast}%</small></section><section><strong>DESKTOP COLOR</strong><div>{(['teal', 'blue', 'gray'] as const).map((item) => <button className={desktop === item ? 'is-active' : ''} type="button" onClick={() => setDesktop(item)} key={item}>{item.toUpperCase()}</button>)}</div></section><section><strong>MONITOR EFFECT</strong><label><input type="checkbox" checked={crt} onChange={(event) => onCrtChange(event.target.checked)} /> CRT scanlines</label></section></div>;
}
