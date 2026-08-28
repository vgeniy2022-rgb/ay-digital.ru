import { Calculator, FileText, Folder, Gamepad2, MonitorCog, Palette, Power, Terminal, X } from 'lucide-react';
import { useEffect, useRef, useState, type ComponentType, type PointerEvent, type SVGProps } from 'react';
import { LabShell } from '../core/LabShell';
import { unlockLabAchievement } from '../core/storage';
import { useLabState } from '../core/useLabState';
import { RetroCalculator, RetroControlPanel, RetroFiles, RetroNotepad, RetroPaint, RetroSnake, RetroTerminal } from './RetroApps';
import './retroOs.css';

type RetroSystem = 'desk95' | 'classic';
type RetroAppId = 'files' | 'notes' | 'paint' | 'calculator' | 'terminal' | 'snake' | 'control';
type IconType = ComponentType<SVGProps<SVGSVGElement>>;
type RetroWindow = { id: RetroAppId; x: number; y: number; z: number };

const appDefinitions: Record<RetroAppId, { label: string; icon: IconType }> = {
  files: { label: 'Файлы', icon: Folder }, notes: { label: 'Текстовый редактор', icon: FileText }, paint: { label: 'Пиксельная краска', icon: Palette }, calculator: { label: 'Калькулятор', icon: Calculator }, terminal: { label: 'Терминал', icon: Terminal }, snake: { label: 'Змейка', icon: Gamepad2 }, control: { label: 'Панель управления', icon: MonitorCog },
};

function RetroWindowFrame({ item, system, children, onClose, onFocus, onMove }: { item: RetroWindow; system: RetroSystem; children: React.ReactNode; onClose: () => void; onFocus: () => void; onMove: (x: number, y: number) => void }) {
  const drag = useRef<{ id: number; clientX: number; clientY: number; x: number; y: number } | null>(null);
  const start = (event: PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, clientX: event.clientX, clientY: event.clientY, x: item.x, y: item.y };
    onFocus();
  };
  const move = (event: PointerEvent<HTMLElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    onMove(Math.max(0, drag.current.x + event.clientX - drag.current.clientX), Math.max(0, drag.current.y + event.clientY - drag.current.clientY));
  };
  const AppIcon = appDefinitions[item.id].icon;
  return <section className={`retro-window retro-window--${system}`} style={{ left: item.x, top: item.y, zIndex: item.z }} onPointerDown={onFocus}><header onPointerDown={start} onPointerMove={move} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}><span><AppIcon />{appDefinitions[item.id].label}</span><button type="button" onClick={onClose} aria-label={`Закрыть ${appDefinitions[item.id].label}`}><X /></button></header><div className="retro-window__content">{children}</div><footer><span /></footer></section>;
}

export function RetroOsPage() {
  const [system, setSystem] = useState<RetroSystem | null>(null);
  const [crt, setCrt] = useState(true);
  const [monochrome, setMonochrome] = useState(false);
  const [booting, setBooting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [windows, setWindows] = useState<RetroWindow[]>([]);
  const [clock, setClock] = useState(() => new Date());
  const [zIndex, setZIndex] = useState(5);
  const audioRef = useRef<AudioContext | null>(null);
  const bootTimerRef = useRef<number>();
  const { state } = useLabState('retro');

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 30000);
    return () => {
      window.clearInterval(timer);
      if (bootTimerRef.current) window.clearTimeout(bootTimerRef.current);
      void audioRef.current?.close();
    };
  }, []);

  const playBootSound = () => {
    if (!state.soundEnabled) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = audioRef.current || new AudioContextClass();
    audioRef.current = context;
    void context.resume().then(() => {
      [0, .1, .22].forEach((delay, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = index === 2 ? 'sine' : 'square';
        oscillator.frequency.value = [160, 240, 440][index];
        gain.gain.setValueAtTime(.0001, context.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(.04, context.currentTime + delay + .01);
        gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + delay + .08);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(context.currentTime + delay);
        oscillator.stop(context.currentTime + delay + .09);
      });
    }).catch(() => undefined);
  };
  const chooseSystem = (next: RetroSystem) => {
    setSystem(next);
    setBooting(true);
    setWindows([]);
    bootTimerRef.current = window.setTimeout(() => { setBooting(false); setWindows([{ id: 'files', x: 74, y: 62, z: 6 }]); }, 1200);
    unlockLabAchievement('RETRO_USER');
    playBootSound();
  };
  const openApp = (id: RetroAppId) => {
    const nextZ = zIndex + 1;
    setZIndex(nextZ);
    setMenuOpen(false);
    setWindows((items) => items.some((item) => item.id === id) ? items.map((item) => item.id === id ? { ...item, z: nextZ } : item) : [...items, { id, x: 48 + items.length * 24, y: 42 + items.length * 20, z: nextZ }]);
  };
  const renderApp = (id: RetroAppId) => {
    if (id === 'files') return <RetroFiles />;
    if (id === 'notes') return <RetroNotepad />;
    if (id === 'paint') return <RetroPaint />;
    if (id === 'calculator') return <RetroCalculator />;
    if (id === 'terminal') return <RetroTerminal />;
    if (id === 'snake') return <RetroSnake />;
    return <RetroControlPanel crt={crt} onCrtChange={setCrt} monochrome={monochrome} onMonochromeChange={setMonochrome} />;
  };

  return <LabShell experimentId="retro" title="Ретро-компьютер" description="Две оригинальные браузерные ретро-системы с приложениями, игрой, дискетой и CRT-режимом." canonicalPath="/lab/retro" status="ИНТЕРАКТИВНО · РЕТРО-СИСТЕМА" immersive className={`retro-host ${crt ? 'is-crt' : ''} ${monochrome ? 'is-monochrome' : ''}`}>
    {!system ? <section className="retro-chooser"><div className="retro-chooser__screen"><span>SITEVL LAB / 06</span><h1>ВЫБЕРИТЕ<br />СИСТЕМУ</h1><p>Два оригинальных интерфейса, вдохновлённых практичными и тактильными компьютерами ранней графической эпохи.</p><div><button type="button" onClick={() => chooseSystem('desk95')}><i className="retro-choice-preview retro-choice-preview--desk"><b /><b /><b /></i><span><strong>СТИЛЬ DESK 95</strong><small>РАБОЧИЙ СТОЛ · МЕНЮ · ПИКСЕЛЬНЫЕ ПРИЛОЖЕНИЯ</small></span></button><button type="button" onClick={() => chooseSystem('classic')}><i className="retro-choice-preview retro-choice-preview--classic"><b /><b /><b /></i><span><strong>СТИЛЬ CLASSIC DESK</strong><small>СТРОКА МЕНЮ · ФАЙЛЫ · ПАНЕЛЬ УПРАВЛЕНИЯ</small></span></button></div><footer><button className="retro-crt-toggle" type="button" onClick={() => setCrt((value) => !value)}>CRT {crt ? 'ВКЛ' : 'ВЫКЛ'}</button><small>ОФИЦИАЛЬНЫЕ СИСТЕМНЫЕ ASSETS НЕ ИСПОЛЬЗУЮТСЯ</small></footer></div></section> : <section className={`retro-desktop retro-desktop--${system}`}>
      {booting ? <div className="retro-boot"><strong>SITEVL RETRO BIOS 2.0</strong><p>ПРОВЕРКА RAM... 640 KB OK<br />ДИСК A: ГОТОВ<br />ЗАПУСК ГРАФИЧЕСКОЙ СРЕДЫ...</p><i /></div> : null}
      {system === 'classic' ? <nav className="retro-classic-menu" aria-label="Меню Classic Desk"><button type="button" onClick={() => setMenuOpen((value) => !value)}>SV</button><strong>Файл</strong><span>Правка</span><span>Вид</span><span>Особое</span><time>{clock.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</time></nav> : null}
      <div className="retro-desktop__icons">{(Object.keys(appDefinitions) as RetroAppId[]).slice(0, system === 'classic' ? 4 : 5).map((id) => { const AppIcon = appDefinitions[id].icon; return <button type="button" onClick={() => openApp(id)} key={id}><AppIcon /><span>{appDefinitions[id].label}</span></button>; })}</div>
      {windows.map((item) => <RetroWindowFrame item={item} system={system} key={item.id} onFocus={() => { const next = zIndex + 1; setZIndex(next); setWindows((items) => items.map((candidate) => candidate.id === item.id ? { ...candidate, z: next } : candidate)); }} onMove={(x, y) => setWindows((items) => items.map((candidate) => candidate.id === item.id ? { ...candidate, x: Math.min(x, Math.max(0, window.innerWidth - 260)), y: Math.min(y, Math.max(0, window.innerHeight - 160)) } : candidate))} onClose={() => setWindows((items) => items.filter((candidate) => candidate.id !== item.id))}>{renderApp(item.id)}</RetroWindowFrame>)}
      {menuOpen ? <div className={`retro-start-menu retro-start-menu--${system}`}><strong>SITEVL {system === 'desk95' ? '95' : 'DESK'}</strong>{(Object.keys(appDefinitions) as RetroAppId[]).map((id) => { const AppIcon = appDefinitions[id].icon; return <button type="button" onClick={() => openApp(id)} key={id}><AppIcon />{appDefinitions[id].label}</button>; })}<button type="button" onClick={() => setSystem(null)}><Power />Выбрать систему</button></div> : null}
      {system === 'desk95' ? <footer className="retro-taskbar"><button type="button" onClick={() => setMenuOpen((value) => !value)}><span>SV</span><strong>ПУСК</strong></button><div>{windows.map((item) => <button type="button" onClick={() => openApp(item.id)} key={item.id}>{appDefinitions[item.id].label}</button>)}</div><time>{clock.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</time></footer> : <button className="retro-trash" type="button" onClick={() => setWindows([])} aria-label="Закрыть все окна"><X /><span>Корзина</span></button>}
      <aside className="retro-session-controls"><button type="button" onClick={() => setCrt((value) => !value)}>CRT {crt ? 'ВКЛ' : 'ВЫКЛ'}</button><button type="button" onClick={() => setMonochrome((value) => !value)}>МОНО {monochrome ? 'ВКЛ' : 'ВЫКЛ'}</button><button type="button" onClick={() => setSystem(null)}>СМЕНИТЬ ОС</button></aside>
    </section>}
  </LabShell>;
}

declare global {
  interface Window { webkitAudioContext?: typeof AudioContext }
}
