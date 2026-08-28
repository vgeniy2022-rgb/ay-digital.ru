import { Bot, Calculator, File, Files, GalleryHorizontal, Globe2, Info, NotebookPen, Paintbrush, Settings, Terminal, Workflow } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { LabShell } from '../core/LabShell';
import { completeLabExperiment, unlockLabAchievement } from '../core/storage';
import { useLabState } from '../core/useLabState';
import { AboutApp, BrowserApp, CalculatorApp, FilesApp, GalleryApp, NotesApp, PaintApp, SettingsApp, TaskManagerApp, TerminalApp } from './OsApps';
import { OsWindow } from './OsWindow';
import type { OsAppId, OsPreferences, OsWindowState } from './types';
import './osSimulator.css';

const PREFERENCES_KEY = 'sitevl-os-preferences-v1';
const defaultPreferences: OsPreferences = { theme: 'dark', wallpaper: 'aurora', motion: true };

function readPreferences(): OsPreferences {
  try {
    const stored = JSON.parse(window.localStorage.getItem(PREFERENCES_KEY) || '{}') as Partial<OsPreferences>;
    return {
      theme: stored.theme === 'light' ? 'light' : defaultPreferences.theme,
      wallpaper: stored.wallpaper === 'grid' || stored.wallpaper === 'calm' ? stored.wallpaper : defaultPreferences.wallpaper,
      motion: typeof stored.motion === 'boolean' ? stored.motion : defaultPreferences.motion,
    };
  } catch {
    return defaultPreferences;
  }
}

const appDefinitions: Record<OsAppId, { title: string; icon: typeof Files; width: number; height: number }> = {
  files: { title: 'Файлы', icon: Files, width: 680, height: 460 }, terminal: { title: 'Терминал', icon: Terminal, width: 620, height: 390 }, notes: { title: 'Заметки', icon: NotebookPen, width: 520, height: 470 }, browser: { title: 'Браузер', icon: Globe2, width: 720, height: 500 }, settings: { title: 'Настройки', icon: Settings, width: 480, height: 430 }, about: { title: 'О SITEVL LAB', icon: Info, width: 480, height: 430 }, calculator: { title: 'Калькулятор', icon: Calculator, width: 360, height: 470 }, gallery: { title: 'Галерея', icon: GalleryHorizontal, width: 650, height: 460 }, tasks: { title: 'Диспетчер задач', icon: Workflow, width: 560, height: 430 }, paint: { title: 'Paint Lite', icon: Paintbrush, width: 680, height: 500 },
};

export function OsSimulatorPage() {
  const [booted, setBooted] = useState(false);
  const [windows, setWindows] = useState<OsWindowState[]>([]);
  const [zIndex, setZIndex] = useState(10);
  const [preferences, setPreferences] = useState<OsPreferences>(readPreferences);
  const [uptime, setUptime] = useState(0);
  const [clock, setClock] = useState(() => new Date());
  const { state, toggleSound } = useLabState('os');

  useEffect(() => { const timer = window.setTimeout(() => setBooted(true), 1250); return () => window.clearTimeout(timer); }, []);
  useEffect(() => { const timer = window.setInterval(() => { setUptime((value) => value + 1); setClock(new Date()); }, 1000); return () => window.clearInterval(timer); }, []);
  const updatePreferences = (next: OsPreferences) => { setPreferences(next); try { window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next)); } catch { /* Preferences remain active for this session. */ } };
  const openApp = (id: OsAppId) => {
    const existing = windows.find((item) => item.id === id);
    const nextZ = zIndex + 1; setZIndex(nextZ);
    if (existing) { setWindows((items) => items.map((item) => item.id === id ? { ...item, minimized: false, z: nextZ } : item)); return; }
    const definition = appDefinitions[id];
    const offset = windows.length * 26;
    setWindows((items) => [...items, { id, title: definition.title, x: 60 + offset, y: 44 + offset, width: definition.width, height: definition.height, z: nextZ, minimized: false }]);
    const opened = new Set([...windows.map((item) => item.id), id]);
    if (opened.size >= 6) unlockLabAchievement('SYSTEM_ADMIN');
    if (opened.size >= 8) completeLabExperiment('os');
  };
  const focus = (id: OsAppId) => { const nextZ = zIndex + 1; setZIndex(nextZ); setWindows((items) => items.map((item) => item.id === id ? { ...item, z: nextZ } : item)); };
  const appContent: Record<OsAppId, ReactNode> = {
    files: <FilesApp labState={state} />,
    terminal: <TerminalApp onOpen={openApp} />,
    notes: <NotesApp />,
    browser: <BrowserApp />,
    settings: <SettingsApp preferences={preferences} onChange={updatePreferences} soundEnabled={state.soundEnabled} onSoundChange={toggleSound} />,
    about: <AboutApp labState={state} />,
    calculator: <CalculatorApp />,
    gallery: <GalleryApp />,
    tasks: <TaskManagerApp openApps={windows.filter((item) => !item.minimized).map((item) => item.id)} uptime={uptime} />,
    paint: <PaintApp />,
  };

  return <LabShell experimentId="os" title="SITEVL OS" description="Вымышленная браузерная операционная система SITEVL OS с рабочими окнами, файлами, терминалом и приложениями." canonicalPath="/lab/os" status="СТАБИЛЬНО · БРАУЗЕРНАЯ ОС" immersive className={`sitevl-os-host is-${preferences.theme} wallpaper-${preferences.wallpaper} ${preferences.motion ? '' : 'reduce-os-motion'}`}>
    {!booted ? <div className="sitevl-os-boot"><div><Bot /><strong>SITEVL OS</strong><span><i /></span><small>ЗАПУСК ЭКСПЕРИМЕНТАЛЬНОЙ СРЕДЫ</small><button type="button" onClick={() => setBooted(true)}>ПРОПУСТИТЬ ЗАГРУЗКУ</button></div></div> : <section className="sitevl-os-desktop">
      <div className="sitevl-os-desktop__icons"><button type="button" onDoubleClick={() => openApp('files')} onClick={() => openApp('files')}><File /><span>Эксперименты</span></button><button type="button" onClick={() => openApp('about')}><Info /><span>О LAB</span></button></div>
      {windows.map((windowState) => <OsWindow key={windowState.id} windowState={windowState} onFocus={() => focus(windowState.id)} onMove={(x, y) => setWindows((items) => items.map((item) => item.id === windowState.id ? { ...item, x: Math.min(x, Math.max(0, window.innerWidth - 120)), y: Math.min(y, Math.max(0, window.innerHeight - 120)) } : item))} onClose={() => setWindows((items) => items.filter((item) => item.id !== windowState.id))} onMinimize={() => setWindows((items) => items.map((item) => item.id === windowState.id ? { ...item, minimized: true } : item))} onMaximize={() => setWindows((items) => items.map((item) => item.id === windowState.id ? { ...item, maximized: !item.maximized } : item))}>{appContent[windowState.id]}</OsWindow>)}
      <nav className="sitevl-os-dock" aria-label="Приложения SITEVL OS">{(Object.keys(appDefinitions) as OsAppId[]).map((id) => { const AppIcon = appDefinitions[id].icon; const active = windows.some((item) => item.id === id && !item.minimized); return <button className={active ? 'is-active' : ''} type="button" onClick={() => openApp(id)} aria-label={appDefinitions[id].title} key={id}><AppIcon /><span>{appDefinitions[id].title}</span></button>; })}</nav>
      <div className="sitevl-os-status"><span>SITEVL OS · {windows.filter((item) => !item.minimized).length} ПРИЛОЖ.</span><span>{clock.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} · {clock.toLocaleDateString('ru-RU')}</span></div>
    </section>}
  </LabShell>;
}
