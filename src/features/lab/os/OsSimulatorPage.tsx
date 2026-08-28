import { Bot, File, Files, Globe2, Info, NotebookPen, Settings, Terminal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { LabShell } from '../core/LabShell';
import { useLabState } from '../core/useLabState';
import { AboutApp, BrowserApp, FilesApp, NotesApp, SettingsApp, TerminalApp } from './OsApps';
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
  files: { title: 'Files', icon: Files, width: 640, height: 430 },
  terminal: { title: 'Terminal', icon: Terminal, width: 590, height: 370 },
  notes: { title: 'Notes', icon: NotebookPen, width: 440, height: 440 },
  browser: { title: 'Browser', icon: Globe2, width: 680, height: 480 },
  settings: { title: 'Settings', icon: Settings, width: 470, height: 420 },
  about: { title: 'About LAB', icon: Info, width: 470, height: 420 },
};

export function OsSimulatorPage() {
  const [booted, setBooted] = useState(false);
  const [windows, setWindows] = useState<OsWindowState[]>([]);
  const [zIndex, setZIndex] = useState(10);
  const [preferences, setPreferences] = useState<OsPreferences>(readPreferences);
  const { state, toggleSound } = useLabState('os');

  useEffect(() => { const timer = window.setTimeout(() => setBooted(true), 1250); return () => window.clearTimeout(timer); }, []);
  const updatePreferences = (next: OsPreferences) => { setPreferences(next); try { window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next)); } catch { /* Preferences remain active for this session. */ } };
  const openApp = (id: OsAppId) => {
    const existing = windows.find((item) => item.id === id);
    const nextZ = zIndex + 1; setZIndex(nextZ);
    if (existing) { setWindows((items) => items.map((item) => item.id === id ? { ...item, minimized: false, z: nextZ } : item)); return; }
    const definition = appDefinitions[id];
    const offset = windows.length * 26;
    setWindows((items) => [...items, { id, title: definition.title, x: 60 + offset, y: 44 + offset, width: definition.width, height: definition.height, z: nextZ, minimized: false }]);
  };
  const focus = (id: OsAppId) => { const nextZ = zIndex + 1; setZIndex(nextZ); setWindows((items) => items.map((item) => item.id === id ? { ...item, z: nextZ } : item)); };
  const appContent = useMemo(() => ({
    files: <FilesApp labState={state} />,
    terminal: <TerminalApp />,
    notes: <NotesApp />,
    browser: <BrowserApp />,
    settings: <SettingsApp preferences={preferences} onChange={updatePreferences} soundEnabled={state.soundEnabled} onSoundChange={toggleSound} />,
    about: <AboutApp labState={state} />,
  }), [preferences, state, toggleSound]);

  return <LabShell experimentId="os" title="SITEVL OS Simulator" description="Вымышленная браузерная операционная система SITEVL OS с окнами, файлами, Terminal, Notes и Settings." canonicalPath="/lab/os" status="STABLE · BROWSER OS" immersive className={`sitevl-os-host is-${preferences.theme} wallpaper-${preferences.wallpaper} ${preferences.motion ? '' : 'reduce-os-motion'}`}>
    {!booted ? <div className="sitevl-os-boot"><div><Bot /><strong>SITEVL OS</strong><span><i /></span><small>INITIALIZING EXPERIMENTAL ENVIRONMENT</small><button type="button" onClick={() => setBooted(true)}>SKIP BOOT</button></div></div> : <section className="sitevl-os-desktop">
      <div className="sitevl-os-desktop__icons"><button type="button" onDoubleClick={() => openApp('files')} onClick={() => openApp('files')}><File /><span>Experiments</span></button><button type="button" onClick={() => openApp('about')}><Info /><span>About LAB</span></button></div>
      {windows.map((windowState) => <OsWindow key={windowState.id} windowState={windowState} onFocus={() => focus(windowState.id)} onMove={(x, y) => setWindows((items) => items.map((item) => item.id === windowState.id ? { ...item, x: Math.min(x, Math.max(0, window.innerWidth - 120)), y: Math.min(y, Math.max(0, window.innerHeight - 120)) } : item))} onClose={() => setWindows((items) => items.filter((item) => item.id !== windowState.id))} onMinimize={() => setWindows((items) => items.map((item) => item.id === windowState.id ? { ...item, minimized: true } : item))}>{appContent[windowState.id]}</OsWindow>)}
      <nav className="sitevl-os-dock" aria-label="Приложения SITEVL OS">{(Object.keys(appDefinitions) as OsAppId[]).map((id) => { const AppIcon = appDefinitions[id].icon; const active = windows.some((item) => item.id === id && !item.minimized); return <button className={active ? 'is-active' : ''} type="button" onClick={() => openApp(id)} aria-label={appDefinitions[id].title} key={id}><AppIcon /><span>{appDefinitions[id].title}</span></button>; })}</nav>
      <div className="sitevl-os-status"><span>SITEVL OS</span><span>{new Date().toLocaleDateString('ru-RU')}</span></div>
    </section>}
  </LabShell>;
}
