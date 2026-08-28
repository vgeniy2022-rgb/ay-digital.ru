import { Check, Expand, Gamepad2, RotateCcw, ScanLine, X } from 'lucide-react';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { LabShell } from '../core/LabShell';
import { unlockLabAchievement } from '../core/storage';
import { useLabState } from '../core/useLabState';
import { mountTheRoom, type ResolvedRoomQuality, type RoomModuleId, type RoomQuality, type RoomSceneController } from './roomScene';
import './theRoom.css';

const moduleNames: Record<RoomModuleId, string> = { modern: 'MODERN SYSTEM', physics: 'PHYSICS OBJECT', retro: 'RETRO TERMINAL', gravity: 'GRAVITY CONTROL' };

function RoomJoystick({ onMove }: { onMove: (forward: number, right: number) => void }) {
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const active = useRef<number | null>(null);
  const update = (event: PointerEvent<HTMLDivElement>) => {
    if (active.current !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(x, y);
    const limit = 34;
    const ratio = distance > limit ? limit / distance : 1;
    const next = { x: x * ratio, y: y * ratio };
    setKnob(next);
    onMove(-next.y / limit, next.x / limit);
  };
  const stop = () => { active.current = null; setKnob({ x: 0, y: 0 }); onMove(0, 0); };
  return <div className="room-joystick" aria-label="Виртуальный джойстик движения" onPointerDown={(event) => { active.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); update(event); }} onPointerMove={update} onPointerUp={stop} onPointerCancel={stop}><span style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} /></div>;
}

export function TheRoomPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<RoomSceneController | null>(null);
  const lookRef = useRef<{ id: number; x: number; y: number; moved: number } | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);
  const [modules, setModules] = useState<RoomModuleId[]>([]);
  const [doorUnlocked, setDoorUnlocked] = useState(false);
  const [ending, setEnding] = useState(false);
  const [quality, setQuality] = useState<RoomQuality>('auto');
  const [resolvedQuality, setResolvedQuality] = useState<ResolvedRoomQuality>('medium');
  const [guardFps, setGuardFps] = useState<number | null>(null);
  const { state } = useLabState('game3d');
  const feedbackStateRef = useRef(state);
  feedbackStateRef.current = state;

  const signal = () => {
    if (feedbackStateRef.current.hapticsEnabled && 'vibrate' in navigator) navigator.vibrate?.([18, 35, 28]);
    if (!feedbackStateRef.current.soundEnabled) return;
    const context = audioRef.current || new AudioContext();
    audioRef.current = context;
    void context.resume().then(() => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(320, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(740, context.currentTime + .18);
      gain.gain.setValueAtTime(.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(.06, context.currentTime + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .22);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(); oscillator.stop(context.currentTime + .23);
    }).catch(() => undefined);
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    try {
      controllerRef.current = mountTheRoom(mount, {
        quality,
        onReady: () => setReady(true),
        onFocus: setFocus,
        onModule: (id) => { setModules((current) => current.includes(id) ? current : [...current, id]); signal(); },
        onDoorUnlocked: () => { setDoorUnlocked(true); unlockLabAchievement('ENTERED_THE_ROOM'); signal(); },
        onExit: () => setEnding(true),
        onQualityResolved: (next, fps) => { setResolvedQuality(next); setGuardFps(fps || null); },
      });
    } catch (cause) {
      console.error('[SITEVL LAB] THE ROOM initialization failed:', cause);
      setError(true);
    }
    return () => {
      controllerRef.current?.dispose();
      controllerRef.current = null;
      void audioRef.current?.close();
    };
  // The renderer owns its lifecycle; quality updates through its controller.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    controllerRef.current?.setQuality(quality);
  }, [quality]);

  useEffect(() => {
    const keyMap: Partial<Record<string, 'forward' | 'back' | 'left' | 'right'>> = { KeyW: 'forward', ArrowUp: 'forward', KeyS: 'back', ArrowDown: 'back', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right' };
    const key = (event: KeyboardEvent, pressed: boolean) => {
      if (!started || ending) return;
      const mapped = keyMap[event.code];
      if (mapped) { event.preventDefault(); controllerRef.current?.setKey(mapped, pressed); }
      if (pressed && event.code === 'KeyE') controllerRef.current?.interact();
    };
    const down = (event: KeyboardEvent) => key(event, true);
    const up = (event: KeyboardEvent) => key(event, false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      (['forward', 'back', 'left', 'right'] as const).forEach((item) => controllerRef.current?.setKey(item, false));
    };
  }, [ending, started]);

  const startLook = (event: PointerEvent<HTMLDivElement>) => {
    if (!started || ending) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    lookRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: 0 };
  };
  const moveLook = (event: PointerEvent<HTMLDivElement>) => {
    const look = lookRef.current;
    if (!look || look.id !== event.pointerId) return;
    const deltaX = event.clientX - look.x;
    const deltaY = event.clientY - look.y;
    look.x = event.clientX; look.y = event.clientY; look.moved += Math.abs(deltaX) + Math.abs(deltaY);
    controllerRef.current?.look(deltaX, deltaY);
  };
  const endLook = (event: PointerEvent<HTMLDivElement>) => {
    if (lookRef.current?.id !== event.pointerId) return;
    if (lookRef.current.moved < 7) controllerRef.current?.interact();
    lookRef.current = null;
  };
  const fullscreen = () => { const element = mountRef.current?.closest('.the-room-app') as HTMLElement | null; void element?.requestFullscreen?.().catch(() => undefined); };

  return <LabShell experimentId="game3d" title="The Room" description="Компактная интерактивная 3D-комната SITEVL LAB с четырьмя модулями, адаптивным WebGL и сюрреалистическим выходом." canonicalPath="/lab/3d" status="3D · WEBGL SHOWCASE" immersive actions={<select value={quality} onChange={(event) => setQuality(event.target.value as RoomQuality)} aria-label="Качество 3D"><option value="auto">AUTO</option><option value="low">LOW</option><option value="medium">MEDIUM</option><option value="high">HIGH</option></select>} className="the-room-host">
    <section className="the-room-app">
      <div ref={mountRef} className="the-room-renderer" onPointerDown={startLook} onPointerMove={moveLook} onPointerUp={endLook} onPointerCancel={() => { lookRef.current = null; }} />
      {error ? <div className="room-error"><X /><h1>WEBGL NOT AVAILABLE ON THIS DEVICE</h1><p>THE ROOM needs a browser with WebGL support. The rest of SITEVL LAB remains available.</p><Link to="/lab">BACK TO LAB</Link></div> : null}
      {!error && !started ? <div className="room-entry"><span>EXPERIMENT 03 / MAIN SHOWCASE</span><h1>THE<br />ROOM</h1><p>Find four experimental modules. Look around by dragging, move with WASD or the joystick, press E to interact.</p><div><button type="button" disabled={!ready} onClick={() => setStarted(true)}><Gamepad2 /> {ready ? 'ENTER ROOM' : 'LOADING ROOM'}</button><button type="button" onClick={fullscreen}><Expand /> FULLSCREEN</button></div><small>NO WEAPONS · EXPLORATION / INTERACTION / TECHNOLOGY</small></div> : null}
      {!error && started ? <><div className="room-crosshair" aria-hidden="true"><i /><i /></div><aside className="room-objective"><header><span>MODULES</span><strong>{modules.length}/4</strong></header>{(Object.keys(moduleNames) as RoomModuleId[]).map((id) => <div className={modules.includes(id) ? 'is-complete' : ''} key={id}>{modules.includes(id) ? <Check /> : <i />}{moduleNames[id]}</div>)}<footer className={doorUnlocked ? 'is-open' : ''}>{doorUnlocked ? 'EXIT OPEN · WALK THROUGH' : 'EXIT LOCKED'}</footer></aside><div className="room-quality"><ScanLine /><span>AUTO GUARD</span><strong>{resolvedQuality.toUpperCase()}</strong>{guardFps ? <small>{guardFps} FPS · QUALITY REDUCED</small> : null}</div>{focus ? <button className="room-interact" type="button" onClick={() => controllerRef.current?.interact()}>{focus}</button> : null}<button className="room-reset" type="button" onClick={() => controllerRef.current?.reset()} aria-label="Вернуться в начало комнаты"><RotateCcw /></button><div className="room-mobile-controls"><RoomJoystick onMove={(forward, right) => controllerRef.current?.setMovement(forward, right)} /><button type="button" onClick={() => controllerRef.current?.interact()}>E<small>INTERACT</small></button></div><div className="room-landscape-prompt">BEST EXPERIENCED IN LANDSCAPE</div></> : null}
      {ending ? <div className="room-ending"><span>BOUNDARY / 07</span><h2>YOU ARE INSIDE<br />THE WEBSITE</h2><p>The interface is no longer a page. It is the architecture around you.</p><Link to="/lab">EXIT LAB</Link></div> : null}
    </section>
  </LabShell>;
}
