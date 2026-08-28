import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { labAchievements, labExperiments } from '../core/catalog';
import type { LabPersistentState } from '../core/types';
import type { OsPreferences } from './types';

const NOTES_KEY = 'sitevl-os-notes-v1';

function readNote() {
  try { return window.localStorage.getItem(NOTES_KEY) || 'Ideas for SITEVL LAB:\n\n- Explore the room\n- Test zero gravity\n- Find canvas portals'; }
  catch { return 'Ideas for SITEVL LAB:\n\n- Explore the room\n- Test zero gravity\n- Find canvas portals'; }
}

function writeNote(value: string) {
  try { window.localStorage.setItem(NOTES_KEY, value); } catch { /* Editing remains available without persistence. */ }
}

export function FilesApp({ labState }: { labState: LabPersistentState }) {
  const unlocked = labAchievements.filter((achievement) => labState.achievements[achievement.id]);
  return <div className="os-files"><aside><button type="button" className="is-active">Documents</button><button type="button">Experiments</button><button type="button">System</button><button type="button">Achievements</button></aside><div><div className="os-files__path">SYSTEM / ACHIEVEMENTS</div>{unlocked.length ? unlocked.map((achievement) => <article key={achievement.id}><i>SV</i><span><strong>{achievement.title}.signal</strong><small>{achievement.description}</small></span></article>) : <p>No achievement signals yet. Open a LAB experiment.</p>}<article><i>TXT</i><span><strong>README.txt</strong><small>SITEVL LAB is stored locally in this browser.</small></span></article></div></div>;
}

export function TerminalApp() {
  const [lines, setLines] = useState(['SITEVL OS TERMINAL 1.0', 'Type “help” to list commands.']);
  const [command, setCommand] = useState('');
  const run = (event: FormEvent) => {
    event.preventDefault();
    const raw = command.trim();
    const [name, ...args] = raw.split(' ');
    const replies: Record<string, string> = {
      help: 'help · clear · ls · about · lab · experiments · system · date · echo · unlock',
      ls: 'Documents/  Experiments/  System/  Achievements/',
      about: 'SITEVL OS — an original browser operating environment.',
      lab: 'Seven experiments connected through local achievement signals.',
      experiments: '01 Builder · 02 Break · 03 Room · 04 Physics · 05 OS · 06 Retro · 07 Canvas',
      system: `Browser runtime · ${navigator.platform || 'unknown platform'} · local session`,
      date: new Date().toLocaleString('ru-RU'),
      unlock: 'ACCESS GRANTED. Hidden command acknowledged.',
      echo: args.join(' '),
    };
    if (name === 'clear') setLines([]);
    else if (raw) setLines((current) => [...current, `> ${raw}`, replies[name] || `Command not found: ${name}`]);
    setCommand('');
  };
  return <div className="os-terminal"><div>{lines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</div><form onSubmit={run}><span>sitevl@lab:~$</span><input autoFocus value={command} onChange={(event) => setCommand(event.target.value)} aria-label="Команда Terminal" autoCapitalize="off" autoComplete="off" /></form></div>;
}

export function NotesApp() {
  const [note, setNote] = useState(readNote);
  return <div className="os-notes"><textarea aria-label="Заметка SITEVL OS" value={note} onChange={(event) => { setNote(event.target.value); writeNote(event.target.value); }} /><small>SAVED LOCALLY WHEN AVAILABLE</small></div>;
}

export function BrowserApp() {
  return <div className="os-browser"><header><span>lab://experiments</span></header><div><small>SITEVL INTERNAL NETWORK</small><h2>EXPERIMENT DIRECTORY</h2>{labExperiments.map((experiment) => <Link to={experiment.href} key={experiment.id}><span>{experiment.number}</span><strong>{experiment.shortTitle}</strong><small>{experiment.status}</small></Link>)}</div></div>;
}

export function SettingsApp({ preferences, onChange, soundEnabled, onSoundChange }: { preferences: OsPreferences; onChange: (preferences: OsPreferences) => void; soundEnabled: boolean; onSoundChange: () => void }) {
  return <div className="os-settings"><section><span>APPEARANCE</span><div><button className={preferences.theme === 'dark' ? 'is-active' : ''} type="button" onClick={() => onChange({ ...preferences, theme: 'dark' })}>DARK</button><button className={preferences.theme === 'light' ? 'is-active' : ''} type="button" onClick={() => onChange({ ...preferences, theme: 'light' })}>LIGHT</button></div></section><section><span>WALLPAPER</span><div>{(['aurora', 'grid', 'calm'] as const).map((wallpaper) => <button className={preferences.wallpaper === wallpaper ? 'is-active' : ''} type="button" onClick={() => onChange({ ...preferences, wallpaper })} key={wallpaper}>{wallpaper.toUpperCase()}</button>)}</div></section><section><span>FEEDBACK</span><label><input type="checkbox" checked={soundEnabled} onChange={onSoundChange} /> Interface sound</label><label><input type="checkbox" checked={preferences.motion} onChange={(event) => onChange({ ...preferences, motion: event.target.checked })} /> Interface motion</label></section></div>;
}

export function AboutApp({ labState }: { labState: LabPersistentState }) {
  const stats = useMemo(() => ({ experiments: labState.explored.length, achievements: Object.keys(labState.achievements).length }), [labState]);
  return <div className="os-about"><div>SV</div><small>VERSION 1.0 · BROWSER EDITION</small><h2>SITEVL OS</h2><p>An original experimental desktop designed to show that a webpage can behave like a compact operating environment.</p><section><span><strong>{stats.experiments}/7</strong>Experiments</span><span><strong>{stats.achievements}/7</strong>Signals</span></section></div>;
}
