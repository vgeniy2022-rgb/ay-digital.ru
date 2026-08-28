import { Pause, Play, RotateCcw, Zap } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LabExperimentIntro, LabShell } from '../core/LabShell';
import { completeLabExperiment, recordLabActivity, recordLabSecret, saveExperimentState, unlockLabAchievement } from '../core/storage';
import { useLabState } from '../core/useLabState';
import { createGameWorld, interactWithGameWorld, stepGameWorld, type GameWorld } from './gameModel';
import './breakWebsite.css';

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };
type GameSound = 'break' | 'switch' | 'grab' | 'complete';

function vibrate(pattern: number | number[], enabled: boolean) {
  if (enabled && 'vibrate' in navigator) navigator.vibrate(pattern);
}

function drawWorld(context: CanvasRenderingContext2D, world: GameWorld, width: number, height: number, cameraX: number, particles: Particle[], shake: number) {
  const scale = height / 720;
  context.save();
  context.clearRect(0, 0, width, height);
  context.fillStyle = '#101319';
  context.fillRect(0, 0, width, height);
  context.translate(Math.round((Math.random() - .5) * shake), Math.round((Math.random() - .5) * shake));
  context.scale(scale, scale);
  context.translate(-cameraX, 0);
  const zones = [
    { title: 'УРОВЕНЬ 1 · ИНТЕРФЕЙС', color: '#75a7ff' },
    { title: 'УРОВЕНЬ 2 · СТИЛИ', color: '#ff8dc7' },
    { title: 'УРОВЕНЬ 3 · КОМПОНЕНТЫ', color: '#63d6a2' },
    { title: 'УРОВЕНЬ 4 · СИСТЕМА', color: '#ffd66b' },
    { title: 'УРОВЕНЬ 5 · CORE', color: '#ff745f' },
  ];
  zones.forEach((zone, index) => {
    context.fillStyle = `${zone.color}0b`; context.fillRect(index * 1200, 0, 1200, 720);
    context.fillStyle = zone.color; context.globalAlpha = .42; context.font = '800 18px ui-monospace, monospace'; context.fillText(zone.title, index * 1200 + 44, 76); context.globalAlpha = 1;
  });
  const viewWidth = width / scale;
  context.strokeStyle = 'rgba(255,255,255,.035)';
  context.lineWidth = 1;
  for (let x = Math.floor(cameraX / 40) * 40; x < cameraX + viewWidth + 40; x += 40) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, 720); context.stroke(); }
  for (let y = 0; y < 720; y += 40) { context.beginPath(); context.moveTo(cameraX, y); context.lineTo(cameraX + viewWidth, y); context.stroke(); }

  context.fillStyle = '#f2f4f8';
  context.font = '700 78px Inter, sans-serif';
  context.globalAlpha = .055;
  context.fillText('СТРУКТУРА SITEVL', cameraX + 44, 150);
  context.globalAlpha = 1;

  world.bodies.forEach((body) => {
    if (body.kind === 'breakable' && (body.hp || 0) <= 0) return;
    context.save();
    context.fillStyle = body.kind === 'platform' ? '#252b35' : body.kind === 'crate' ? '#385a93' : body.kind === 'spring' ? '#5d4a91' : body.kind === 'moving' ? '#245b68' : '#9a4c46';
    context.strokeStyle = body.kind === 'breakable' ? '#ff8578' : 'rgba(255,255,255,.24)';
    context.lineWidth = 2;
    context.beginPath();
    context.roundRect(body.x, body.y, body.width, body.height, 6);
    context.fill();
    context.stroke();
    context.fillStyle = body.kind === 'breakable' ? '#ffd1cc' : '#dce4f1';
    context.font = `700 ${Math.min(11, Math.max(7, body.width / 18))}px ui-monospace, monospace`;
    context.fillText(body.label, body.x + 10, body.y + Math.min(body.height - 8, 21));
    if (body.kind === 'breakable') {
      context.fillStyle = '#ff8578';
      context.fillRect(body.x + 8, body.y + body.height - 12, (body.width - 16) * ((body.hp || 0) / 3), 4);
    }
    context.restore();
  });

  world.hazards.forEach((hazard) => { context.fillStyle = 'rgba(255,70,80,.2)'; context.fillRect(hazard.x, hazard.y, hazard.width, hazard.height); context.strokeStyle = '#ff5964'; context.setLineDash([6, 5]); context.strokeRect(hazard.x, hazard.y, hazard.width, hazard.height); context.setLineDash([]); context.fillStyle = '#ff9ba2'; context.font = '800 9px ui-monospace, monospace'; context.fillText(hazard.label, hazard.x + 8, hazard.y - 8); });
  world.fragments.filter((item) => !item.collected).forEach((fragment) => { context.save(); context.translate(fragment.x, fragment.y); context.rotate(world.elapsed); context.fillStyle = '#8eb3ff'; context.shadowColor = '#75a7ff'; context.shadowBlur = 18; context.fillRect(-7, -7, 14, 14); context.restore(); });
  world.secrets.filter((item) => !item.found).forEach((secret) => { context.fillStyle = 'rgba(255,214,107,.3)'; context.beginPath(); context.arc(secret.x, secret.y, 10, 0, Math.PI * 2); context.fill(); });
  world.checkpoints.forEach((checkpoint) => { context.fillStyle = checkpoint.active ? '#63d6a2' : '#3e4653'; context.fillRect(checkpoint.x, 610, 4, 54); });

  world.switches.forEach((item, index) => {
    context.fillStyle = item.active ? '#58dea0' : '#ffca68';
    context.beginPath(); context.arc(item.x, item.y, 15, 0, Math.PI * 2); context.fill();
    context.fillStyle = '#e8edf5'; context.font = '800 10px ui-monospace, monospace'; context.fillText(`ПЕРЕКЛЮЧАТЕЛЬ ${index + 1}`, item.x - 58, item.y - 25);
  });
  context.fillStyle = world.core.active ? '#7ca9ff' : '#434a56';
  context.shadowColor = world.core.active ? '#7ca9ff' : 'transparent'; context.shadowBlur = world.core.active ? 28 : 0;
  context.beginPath(); context.roundRect(world.core.x, world.core.y, 72, 36, 7); context.fill();
  context.shadowBlur = 0; context.fillStyle = '#fff'; context.font = '900 12px ui-monospace, monospace'; context.fillText('CORE', world.core.x + 20, world.core.y + 23);

  const player = world.player;
  context.save(); context.translate(player.x + player.width / 2, player.y + player.height / 2); context.scale(player.facing, 1);
  context.fillStyle = '#ff745f'; context.beginPath(); context.roundRect(-14, -21, 28, 42, 6); context.fill();
  context.fillStyle = '#0d1016'; context.fillRect(4, -10, 5, 5);
  context.fillStyle = '#fff'; context.fillRect(-10, -30, 20, 7);
  context.restore();

  particles.forEach((particle) => { context.globalAlpha = Math.max(0, particle.life); context.fillStyle = particle.color; context.fillRect(particle.x, particle.y, 5, 5); });
  context.globalAlpha = 1;
  context.restore();
}

export function BreakWebsitePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef(createGameWorld());
  const inputRef = useRef({ left: false, right: false, jump: false, dash: false });
  const particlesRef = useRef<Particle[]>([]);
  const shakeRef = useRef(0);
  const restoreTimerRef = useRef<number | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const restoredRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [version, setVersion] = useState(0);
  const [restoring, setRestoring] = useState(false);
  const { state } = useLabState('game2d');
  const world = worldRef.current;

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const saved = state.experimentState.game2d;
    if (saved && typeof saved.checkpointX === 'number') {
      const checkpointX = saved.checkpointX;
      worldRef.current.checkpointX = checkpointX;
      worldRef.current.player.x = checkpointX;
      worldRef.current.checkpoints.forEach((item) => { item.active = item.x <= checkpointX; });
    }
  }, [state.experimentState.game2d]);

  const playSound = useCallback((sound: GameSound) => {
    if (!state.soundEnabled) return;
    const context = audioRef.current || new AudioContext();
    audioRef.current = context;
    const settings: Record<GameSound, { start: number; end: number; duration: number; type: OscillatorType }> = {
      break: { start: 150, end: 72, duration: .12, type: 'square' },
      switch: { start: 360, end: 620, duration: .12, type: 'sine' },
      grab: { start: 220, end: 280, duration: .07, type: 'triangle' },
      complete: { start: 280, end: 880, duration: .32, type: 'sine' },
    };
    void context.resume().then(() => {
      const current = settings[sound];
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = current.type;
      oscillator.frequency.setValueAtTime(current.start, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(current.end, context.currentTime + current.duration);
      gain.gain.setValueAtTime(.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(.055, context.currentTime + .01);
      gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + current.duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + current.duration + .01);
    }).catch(() => undefined);
  }, [state.soundEnabled]);

  const reset = useCallback(() => {
    setRestoring(true);
    worldRef.current = createGameWorld();
    particlesRef.current = [];
    shakeRef.current = 12;
    setVersion((value) => value + 1);
    if (restoreTimerRef.current !== null) window.clearTimeout(restoreTimerRef.current);
    restoreTimerRef.current = window.setTimeout(() => setRestoring(false), 650);
  }, []);

  const interact = useCallback(() => {
    const result = interactWithGameWorld(worldRef.current);
    if (result.type === 'break') {
      for (let index = 0; index < 18; index += 1) particlesRef.current.push({ x: result.x || 0, y: result.y || 0, vx: (Math.random() - .5) * 300, vy: -Math.random() * 260, life: 1, color: index % 2 ? '#ff745f' : '#f2b2a8' });
      shakeRef.current = 12;
      vibrate([18, 18, 30], state.hapticsEnabled);
      playSound('break');
    } else if (result.type === 'switch') {
      shakeRef.current = 4;
      vibrate(16, state.hapticsEnabled);
      playSound('switch');
    } else if (result.type === 'grab' || result.type === 'drop') {
      vibrate(8, state.hapticsEnabled);
      playSound('grab');
    }
    setVersion((value) => value + 1);
  }, [playSound, state.hapticsEnabled]);

  useEffect(() => () => {
    if (restoreTimerRef.current !== null) window.clearTimeout(restoreTimerRef.current);
    void audioRef.current?.close();
    const current = worldRef.current;
    recordLabActivity({ playTimeSeconds: current.elapsed });
    saveExperimentState('game2d', { checkpointX: current.checkpointX, elapsed: current.elapsed, fragments: current.fragments.filter((item) => item.collected).map((item) => item.id) });
  }, []);

  useEffect(() => {
    const key = (event: KeyboardEvent, pressed: boolean) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'a', 'd', 'w', 'A', 'D', 'W', 'e', 'E', 'Shift', 'Escape'].includes(event.key)) event.preventDefault();
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') inputRef.current.left = pressed;
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') inputRef.current.right = pressed;
      if (event.key === 'ArrowUp' || event.key === ' ' || event.key.toLowerCase() === 'w') inputRef.current.jump = pressed;
      if (pressed && event.key.toLowerCase() === 'e' && !event.repeat) interact();
      if (pressed && event.key === 'Shift' && !event.repeat) inputRef.current.dash = true;
      if (pressed && event.key === 'Escape' && !event.repeat) setPaused((value) => !value);
    };
    const down = (event: KeyboardEvent) => key(event, true);
    const up = (event: KeyboardEvent) => key(event, false);
    window.addEventListener('keydown', down, { passive: false });
    window.addEventListener('keyup', up, { passive: false });
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [interact]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let frame = 0;
    let lastTime = performance.now();
    let hidden = document.hidden;
    let lastSwitchCount = -1;
    let lastDestroyed = worldRef.current.destroyed;
    let lastSecrets = worldRef.current.secrets.filter((item) => item.found).length;
    let winHandled = false;
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(bounds.width * dpr));
      canvas.height = Math.max(1, Math.floor(bounds.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    const visibility = () => { hidden = document.hidden; lastTime = performance.now(); };
    document.addEventListener('visibilitychange', visibility);
    const loop = (time: number) => {
      const delta = Math.max(0, Math.min(.05, (time - lastTime) / 1000));
      lastTime = time;
      const current = worldRef.current;
      if (!paused && !hidden) stepGameWorld(current, inputRef.current, delta);
      inputRef.current.jump = false;
      inputRef.current.dash = false;
      particlesRef.current.forEach((particle) => { particle.x += particle.vx * delta; particle.y += particle.vy * delta; particle.vy += 620 * delta; particle.life -= delta * 1.4; });
      particlesRef.current = particlesRef.current.filter((particle) => particle.life > 0);
      shakeRef.current *= .86;
      const bounds = canvas.getBoundingClientRect();
      const visibleWorldWidth = bounds.width / (bounds.height / 720);
      const camera = Math.max(0, Math.min(current.width - visibleWorldWidth, current.player.x - visibleWorldWidth * .32));
      drawWorld(context, current, bounds.width, bounds.height, camera, particlesRef.current, shakeRef.current);
      const switchCount = current.switches.filter((item) => item.active).length;
      if (switchCount !== lastSwitchCount) { lastSwitchCount = switchCount; setVersion((value) => value + 1); }
      if (current.destroyed > lastDestroyed) { recordLabActivity({ elementsBroken: current.destroyed - lastDestroyed }); lastDestroyed = current.destroyed; }
      const secretCount = current.secrets.filter((item) => item.found).length;
      if (secretCount > lastSecrets) { current.secrets.filter((item) => item.found).forEach((item) => recordLabSecret(`2d:${item.id}`)); lastSecrets = secretCount; }
      if (current.player.abilities.dash && Math.abs(current.player.vx) > 500) unlockLabAchievement('DASH_MASTER');
      if (current.won && !winHandled) {
        winHandled = true;
        unlockLabAchievement('BROKE_THE_WEBSITE');
        completeLabExperiment('game2d');
        if (current.fragments.every((item) => item.collected)) unlockLabAchievement('FRAGMENT_HUNTER');
        vibrate([35, 35, 70], state.hapticsEnabled);
        playSound('complete');
        setVersion((value) => value + 1);
      }
      if (!current.won) winHandled = false;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  }, [paused, playSound, state.hapticsEnabled]);

  const bindHold = (key: 'left' | 'right' | 'jump' | 'dash') => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => { event.currentTarget.setPointerCapture(event.pointerId); inputRef.current[key] = true; },
    onPointerUp: () => { inputRef.current[key] = false; },
    onPointerCancel: () => { inputRef.current[key] = false; },
  });

  return (
    <LabShell experimentId="game2d" title="Сломать сайт" description="Интерактивная 2D-игра SITEVL LAB с пятью зонами, способностями, фрагментами и ядром." canonicalPath="/lab/2d" status="ИНТЕРАКТИВНО · CANVAS 2D" immersive>
      <LabExperimentIntro number="02" eyebrow="УПРАВЛЯЕМАЯ ФИЗИКА ИНТЕРФЕЙСА" title="СЛОМАТЬ САЙТ" description="Пройдите пять уровней структуры SITEVL, активируйте переключатели, откройте способности и доберитесь до CORE." controls={<><button className="lab-control-button" type="button" onClick={() => setPaused((value) => !value)}>{paused ? <Play /> : <Pause />}{paused ? 'ПРОДОЛЖИТЬ' : 'ПАУЗА'}</button><button className="lab-control-button" type="button" onClick={reset}><RotateCcw />ЗАНОВО</button></>} />
      <section className={`lab-stage break-game-stage ${restoring ? 'is-restoring' : ''}`} data-version={version}>
        <canvas ref={canvasRef} aria-label="Игровая сцена Break the Website" />
        <div className="break-game-hud lab-overlay-panel"><span>УРОВЕНЬ <strong>{world.zone + 1}/5</strong></span><span>ПЕРЕКЛЮЧАТЕЛИ <strong>{world.switches.filter((item) => item.active).length}/{world.switches.length}</strong></span><span>ФРАГМЕНТЫ <strong>{world.fragments.filter((item) => item.collected).length}/{world.fragments.length}</strong></span><span>ВРЕМЯ <strong>{Math.floor(world.elapsed)} с</strong></span></div>
        <div className="break-game-help lab-overlay-panel"><span>ДВИЖЕНИЕ <b>A/D · СТРЕЛКИ</b></span><span>ПРЫЖОК <b>SPACE</b></span><span>РЫВОК <b>SHIFT</b></span><span>ДЕЙСТВИЕ <b>E</b></span></div>
        <div className="lab-mobile-controls"><div className="lab-mobile-controls__dpad"><button aria-label="Двигаться влево" {...bindHold('left')}>←</button><button aria-label="Прыжок" {...bindHold('jump')}>↑</button><button aria-label="Двигаться вправо" {...bindHold('right')}>→</button></div><button type="button" {...bindHold('dash')} aria-label="Рывок"><Zap /></button><button type="button" onPointerDown={interact} aria-label="Взаимодействовать">E</button></div>
        {paused ? <div className="break-game-pause"><small>ИГРА ПРИОСТАНОВЛЕНА</small><h2>ПАУЗА</h2><button type="button" onClick={() => setPaused(false)}><Play />ПРОДОЛЖИТЬ</button></div> : null}
        {world.won ? <div className="break-game-complete"><small>CORE ДОСТИГНУТ</small><h2>САЙТ<br />СЛОМАН</h2><p>Время: {Math.floor(world.elapsed)} с · Разбито: {world.destroyed} · Секреты: {world.secrets.filter((item) => item.found).length}/{world.secrets.length} · Исследование: {Math.round((world.fragments.filter((item) => item.collected).length / world.fragments.length) * 100)}%</p><button type="button" onClick={reset}><RotateCcw />ВОССТАНОВИТЬ САЙТ</button></div> : null}
      </section>
    </LabShell>
  );
}
