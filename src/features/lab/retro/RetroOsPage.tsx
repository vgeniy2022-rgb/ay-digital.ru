import { Calculator, Code2, Expand, FileText, Folder, Gamepad2, Globe2, HardDriveDownload, Info, Mail, Maximize2, MessageSquare, Minimize2, MonitorCog, Network, Package, Palette, Terminal, X } from 'lucide-react';
import { useEffect, useRef, useState, type ComponentType, type PointerEvent, type SVGProps } from 'react';
import { LabShell } from '../core/LabShell';
import { unlockLabAchievement } from '../core/storage';
import { useLabState } from '../core/useLabState';
import { RetroCalculator, RetroControlPanel, RetroNotepad, RetroPaint, RetroSnake, RetroTerminal } from './RetroApps';
import { RetroBrowser } from './RetroBrowser';
import { RetroFileManager } from './RetroFileManager';
import { RetroBackupApp, RetroBasic, RetroChat, RetroMail, RetroNetwork, RetroSoftware, RetroWebLab } from './RetroPhase4Apps';
import { readRetroState, writeRetroState, type RetroState, type RetroSystem } from './retroState';
import './retroOs.css';

type RetroAppId = 'files' | 'notes' | 'paint' | 'calculator' | 'terminal' | 'snake' | 'browser' | 'about' | 'control' | 'network' | 'mail' | 'chat' | 'basic' | 'weblab' | 'software' | 'backup';
type IconType = ComponentType<SVGProps<SVGSVGElement>>;
type RetroWindow = { id: RetroAppId; x: number; y: number; z: number; width: number; height: number; minimized: boolean; maximized: boolean };

const appDefinitions: Record<RetroAppId, { label: string; icon: IconType }> = {
  files: { label: 'Файлы', icon: Folder }, notes: { label: 'Текстовый редактор', icon: FileText }, paint: { label: 'Пиксельная краска', icon: Palette }, calculator: { label: 'Калькулятор', icon: Calculator }, terminal: { label: 'Терминал', icon: Terminal }, snake: { label: 'Змейка', icon: Gamepad2 }, browser: { label: 'Retro Browser', icon: Globe2 }, network: { label: 'Сетевое окружение', icon: Network }, mail: { label: 'Почта', icon: Mail }, chat: { label: 'LAB IRC', icon: MessageSquare }, basic: { label: 'SITEVL BASIC', icon: Code2 }, weblab: { label: 'HTML LAB', icon: Globe2 }, software: { label: 'Каталог программ', icon: Package }, backup: { label: 'Backup', icon: HardDriveDownload }, about: { label: 'О системе', icon: Info }, control: { label: 'Панель управления', icon: MonitorCog },
};

const publicRetroSystem: RetroSystem = 'desk95';
const defaultRetroWindows: RetroWindow[] = [{ id: 'files', x: 74, y: 62, z: 6, width: 620, height: 430, minimized: false, maximized: false }];

function RetroWindowFrame({ item, system, children, onClose, onFocus, onMove, onMinimize, onMaximize }: { item: RetroWindow; system: RetroSystem; children: React.ReactNode; onClose: () => void; onFocus: () => void; onMove: (x: number, y: number) => void; onMinimize: () => void; onMaximize: () => void }) {
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
  if (item.minimized) return null;
  return <section className={`retro-window retro-window--${system} ${item.maximized ? 'is-maximized' : ''}`} style={{ left: item.x, top: item.y, zIndex: item.z, width: item.width, height: item.height }} onPointerDown={onFocus}><header onPointerDown={start} onPointerMove={move} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}><span><AppIcon />{appDefinitions[item.id].label}</span><div><button type="button" onClick={onMinimize} aria-label={`Свернуть ${appDefinitions[item.id].label}`}><Minimize2 /></button><button type="button" onClick={onMaximize} aria-label={`Развернуть ${appDefinitions[item.id].label}`}><Maximize2 /></button><button type="button" onClick={onClose} aria-label={`Закрыть ${appDefinitions[item.id].label}`}><X /></button></div></header><div className="retro-window__content">{children}</div><footer><span /></footer></section>;
}

export function RetroOsPage() {
  const [retroState, setRetroState] = useState<RetroState>(readRetroState);
  const system = publicRetroSystem;
  const [crt, setCrt] = useState(true);
  const [monochrome, setMonochrome] = useState(false);
  const [booting, setBooting] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [windows, setWindows] = useState<RetroWindow[]>(() => {
    const saved = (retroState.windows[publicRetroSystem] || []).filter((item) => item.id !== 'browser').map((item, index) => ({ ...item, id: item.id as RetroAppId, z: index + 5 }));
    return saved.length ? saved : defaultRetroWindows;
  });
  const [clock, setClock] = useState(() => new Date());
  const [zIndex, setZIndex] = useState(5);
  const bootTimerRef = useRef<number>();
  useLabState('retro');

  const updateRetroState = (next: RetroState) => { setRetroState(next); writeRetroState(next); };
  const toggleFullscreen = () => { if (document.fullscreenElement) void document.exitFullscreen(); else void document.querySelector('.retro-host')?.requestFullscreen?.(); };

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 30000);
    setRetroState((current) => {
      const visitedSystems = current.visitedSystems.includes(publicRetroSystem) ? current.visitedSystems : [...current.visitedSystems, publicRetroSystem];
      const next = { ...current, selectedSystem: publicRetroSystem, visitedSystems };
      writeRetroState(next);
      return next;
    });
    unlockLabAchievement('RETRO_USER');
    bootTimerRef.current = window.setTimeout(() => setBooting(false), 1100);
    return () => {
      window.clearInterval(timer);
      if (bootTimerRef.current) window.clearTimeout(bootTimerRef.current);
    };
  }, []);

  useEffect(() => { if (booting) return; const saved = windows.map(({ id, x, y, width, height, minimized, maximized }) => ({ id, x, y, width, height, minimized, maximized })); setRetroState((current) => { const next = { ...current, windows: { ...current.windows, [system]: saved } }; writeRetroState(next); return next; }); }, [windows, system, booting]);

  const openApp = (id: RetroAppId) => {
    const nextZ = zIndex + 1;
    setZIndex(nextZ);
    setMenuOpen(false);
    setWindows((items) => items.some((item) => item.id === id) ? items.map((item) => item.id === id ? { ...item, z: nextZ, minimized: false } : item) : [...items, { id, x: 48 + items.length * 24, y: 42 + items.length * 20, z: nextZ, width: 620, height: 430, minimized: false, maximized: false }]);
  };
  const renderApp = (id: RetroAppId) => {
    if (id === 'files') return <RetroFileManager state={retroState} onChange={updateRetroState} onOpenBrowser={() => openApp('browser')} />;
    if (id === 'notes') return <RetroNotepad />;
    if (id === 'paint') return <RetroPaint />;
    if (id === 'calculator') return <RetroCalculator />;
    if (id === 'terminal') return <RetroTerminal />;
    if (id === 'snake') return <RetroSnake />;
    if (id === 'browser') return <RetroBrowser state={retroState} onChange={updateRetroState} />;
    if (id === 'network') return <RetroNetwork state={retroState} onChange={updateRetroState} />;
    if (id === 'mail') return <RetroMail state={retroState} onChange={updateRetroState} />;
    if (id === 'chat') return <RetroChat state={retroState} onChange={updateRetroState} />;
    if (id === 'basic') return <RetroBasic state={retroState} onChange={updateRetroState} />;
    if (id === 'weblab') return <RetroWebLab state={retroState} onChange={updateRetroState} />;
    if (id === 'software') return <RetroSoftware state={retroState} onChange={updateRetroState} />;
    if (id === 'backup') return <RetroBackupApp state={retroState} onChange={updateRetroState} />;
    if (id === 'about') return <div className="retro-about"><strong>SITEVL Retro Computer</strong><p>Виртуальный интерактивный музей. Параметры не являются характеристиками вашего устройства.</p><dl><dt>CPU</dt><dd>SV-486</dd><dt>RAM</dt><dd>16 MB</dd><dt>Графика</dt><dd>SITEVL VGA</dd><dt>Диск</dt><dd>512 MB</dd><dt>Система</dt><dd>DESK 95</dd></dl></div>;
    return <RetroControlPanel crt={crt} onCrtChange={setCrt} monochrome={monochrome} onMonochromeChange={setMonochrome} />;
  };

  return <LabShell experimentId="retro" title="Ретро-компьютер" description="Интерактивный компьютер середины 90-х с приложениями, интернетом, играми, дискетой, сетью и CRT-режимом." canonicalPath="/lab/retro" status="ИНТЕРАКТИВНО · DESK 95" immersive className={`retro-host ${crt ? 'is-crt' : ''} ${monochrome ? 'is-monochrome' : ''}`}>
    <section className={`retro-desktop retro-desktop--${system}`}>
      {booting ? <div className="retro-boot"><strong>SITEVL RETRO BIOS 2.0</strong><p>ПРОВЕРКА RAM... 640 KB OK<br />ДИСК A: ГОТОВ<br />ЗАПУСК ГРАФИЧЕСКОЙ СРЕДЫ...</p><i /></div> : null}
      <div className="retro-desktop__icons">{(Object.keys(appDefinitions) as RetroAppId[]).slice(0, 5).map((id) => { const AppIcon = appDefinitions[id].icon; return <button type="button" onClick={() => openApp(id)} key={id}><AppIcon /><span>{appDefinitions[id].label}</span></button>; })}</div>
      {windows.map((item) => <RetroWindowFrame item={item} system={system} key={item.id} onFocus={() => { const next = zIndex + 1; setZIndex(next); setWindows((items) => items.map((candidate) => candidate.id === item.id ? { ...candidate, z: next } : candidate)); }} onMove={(x, y) => setWindows((items) => items.map((candidate) => candidate.id === item.id ? { ...candidate, x: Math.min(x, Math.max(0, window.innerWidth - 260)), y: Math.min(y, Math.max(0, window.innerHeight - 160)) } : candidate))} onMinimize={() => setWindows((items) => items.map((candidate) => candidate.id === item.id ? { ...candidate, minimized: true } : candidate))} onMaximize={() => setWindows((items) => items.map((candidate) => candidate.id === item.id ? { ...candidate, maximized: !candidate.maximized, x: candidate.maximized ? candidate.x : 4, y: candidate.maximized ? candidate.y : system === 'desk95' ? 4 : 30 } : candidate))} onClose={() => setWindows((items) => items.filter((candidate) => candidate.id !== item.id))}>{renderApp(item.id)}</RetroWindowFrame>)}
      {menuOpen ? <div className={`retro-start-menu retro-start-menu--${system}`}><strong>SITEVL 95</strong>{(Object.keys(appDefinitions) as RetroAppId[]).map((id) => { const AppIcon = appDefinitions[id].icon; return <button type="button" onClick={() => openApp(id)} key={id}><AppIcon />{appDefinitions[id].label}</button>; })}</div> : null}
      <footer className="retro-taskbar"><button type="button" onClick={() => setMenuOpen((value) => !value)}><span>SV</span><strong>ПУСК</strong></button><div>{windows.map((item) => <button type="button" onClick={() => openApp(item.id)} key={item.id}>{appDefinitions[item.id].label}</button>)}</div><time>{clock.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</time></footer>
      <aside className="retro-session-controls"><button type="button" onClick={toggleFullscreen}><Expand /> НА ВЕСЬ ЭКРАН</button><button type="button" onClick={() => setCrt((value) => !value)}>CRT {crt ? 'ВКЛ' : 'ВЫКЛ'}</button><button type="button" onClick={() => setMonochrome((value) => !value)}>МОНО {monochrome ? 'ВКЛ' : 'ВЫКЛ'}</button></aside>
    </section>
  </LabShell>;
}
