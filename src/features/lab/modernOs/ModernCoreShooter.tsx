import { Crosshair, DoorOpen, Expand, Heart, Pause, Play, RotateCcw, Shield, Trophy, X, Zap } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ModernGameProps } from './modernGameTypes';
import { ModernTouchButton } from './ModernTouchButton';

type Enemy = { x: number; y: number; kind: 'drone' | 'warden' | 'runner'; hp: number; alive: boolean; cooldown: number };
type Pickup = { x: number; y: number; kind: 'health' | 'ammo' | 'rifle'; taken: boolean };
type ShooterState = { x: number; y: number; angle: number; health: number; ammo: number; reserve: number; score: number; weapon: 'pulse' | 'rifle'; enemies: Enemy[]; pickups: Pickup[]; doors: Set<string>; running: boolean; won: boolean; engaged: boolean; started: number };

const map = [
  '111111111111111',
  '1000001000000E1',
  '100000D00000001',
  '100000100011101',
  '101110100010001',
  '100000000D00001',
  '100000100010001',
  '111D11100111001',
  '100000000000001',
  '100011100111101',
  '100010000000001',
  '100000011100001',
  '100000000000001',
  '111111111111111',
];
const initialEnemies: Enemy[] = [
  { x: 4.5, y: 2.5, kind: 'drone', hp: 45, alive: true, cooldown: 2 }, { x: 10.5, y: 2.5, kind: 'runner', hp: 30, alive: true, cooldown: 2 },
  { x: 4.5, y: 6.5, kind: 'warden', hp: 90, alive: true, cooldown: 2 }, { x: 9.5, y: 6.5, kind: 'drone', hp: 45, alive: true, cooldown: 2 },
  { x: 3.5, y: 10.5, kind: 'runner', hp: 30, alive: true, cooldown: 2 }, { x: 11.5, y: 11.5, kind: 'warden', hp: 90, alive: true, cooldown: 2 },
];
const createState = (): ShooterState => ({ x: 2.5, y: 2.5, angle: 0, health: 100, ammo: 12, reserve: 48, score: 0, weapon: 'pulse', enemies: initialEnemies.map((enemy) => ({ ...enemy })), pickups: [{ x: 3.5, y: 6.5, kind: 'health', taken: false }, { x: 7.5, y: 9.5, kind: 'ammo', taken: false }, { x: 11.5, y: 5.5, kind: 'rifle', taken: false }], doors: new Set(), running: true, won: false, engaged: false, started: performance.now() });
const tileAt = (x: number, y: number) => map[Math.floor(y)]?.[Math.floor(x)] || '1';
const doorKey = (x: number, y: number) => `${Math.floor(x)}:${Math.floor(y)}`;
const isSolid = (state: ShooterState, x: number, y: number) => { const tile = tileAt(x, y); return tile === '1' || (tile === 'D' && !state.doors.has(doorKey(x, y))); };
const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
const normalizeAngle = (value: number) => Math.atan2(Math.sin(value), Math.cos(value));
const hasLineOfSight = (state: ShooterState, target: { x: number; y: number }) => { const length = distance(state, target); for (let d = .15; d < length; d += .12) if (isSolid(state, state.x + (target.x - state.x) * d / length, state.y + (target.y - state.y) * d / length)) return false; return true; };

export function ModernCoreShooter({ haptics, onExit, onRestart, onResult, onFullscreen }: ModernGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<ShooterState>(createState());
  const keysRef = useRef(new Set<string>());
  const lookRef = useRef(0);
  const moveRef = useRef({ x: 0, y: 0 });
  const [hud, setHud] = useState({ health: 100, ammo: 12, reserve: 48, score: 0, weapon: 'Импульс', enemies: 6 });
  const [paused, setPaused] = useState(false);
  const [damage, setDamage] = useState(false);
  const [message, setMessage] = useState('Найдите выход и очистите сектор');

  const report = useCallback((state: ShooterState) => onResult('core-shooter', { score: state.score + Math.max(0, state.health) * 8, completed: true, playTime: (performance.now() - state.started) / 1000, achievement: state.won ? 'CORE очищен' : undefined, progress: state.won ? 100 : Math.round((1 - state.enemies.filter((enemy) => enemy.alive).length / initialEnemies.length) * 90) }), [onResult]);
  const updateHud = useCallback((state: ShooterState) => setHud({ health: Math.max(0, Math.round(state.health)), ammo: state.ammo, reserve: state.reserve, score: state.score, weapon: state.weapon === 'rifle' ? 'Вектор' : 'Импульс', enemies: state.enemies.filter((enemy) => enemy.alive).length }), []);

  const shoot = useCallback(() => {
    const state = gameRef.current; if (!state.running || paused || state.ammo <= 0) { if (state.ammo <= 0) setMessage('Магазин пуст. Нажмите R'); return; } state.engaged = true;
    state.ammo -= 1; const spread = state.weapon === 'rifle' ? .11 : .075;
    const target = state.enemies.filter((enemy) => enemy.alive && hasLineOfSight(state, enemy)).map((enemy) => ({ enemy, d: distance(state, enemy), angle: Math.abs(normalizeAngle(Math.atan2(enemy.y - state.y, enemy.x - state.x) - state.angle)) })).filter(({ angle }) => angle < spread).sort((a, b) => a.angle - b.angle || a.d - b.d)[0]?.enemy;
    if (target) { target.hp -= state.weapon === 'rifle' ? 34 : 24; if (target.hp <= 0) { target.alive = false; state.score += target.kind === 'warden' ? 350 : target.kind === 'runner' ? 180 : 240; setMessage(`${target.kind === 'warden' ? 'Страж' : target.kind === 'runner' ? 'Бегун' : 'Дрон'} нейтрализован`); } if (haptics && navigator.vibrate) navigator.vibrate(10); }
    updateHud(state);
  }, [haptics, paused, updateHud]);
  const reload = useCallback(() => { const state = gameRef.current; const capacity = state.weapon === 'rifle' ? 24 : 12; const needed = capacity - state.ammo; const amount = Math.min(needed, state.reserve); state.ammo += amount; state.reserve -= amount; updateHud(state); setMessage(amount ? 'Оружие перезаряжено' : 'Нет запасных зарядов'); }, [updateHud]);
  const interact = useCallback(() => { const state = gameRef.current; const x = state.x + Math.cos(state.angle) * .75; const y = state.y + Math.sin(state.angle) * .75; if (tileAt(x, y) === 'D') { state.doors.add(doorKey(x, y)); setMessage('Дверь разблокирована'); } else setMessage('Рядом нет панели доступа'); }, []);

  useEffect(() => {
    const canvas = canvasRef.current; const context = canvas?.getContext('2d'); if (!canvas || !context) return;
    let raf = 0; let last = performance.now(); let hudTimer = 0;
    const down = (event: KeyboardEvent) => { if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) event.preventDefault(); keysRef.current.add(event.key.toLowerCase()); if (event.code === 'Space') shoot(); if (event.key.toLowerCase() === 'r') reload(); if (event.key.toLowerCase() === 'e') interact(); };
    const up = (event: KeyboardEvent) => keysRef.current.delete(event.key.toLowerCase());
    const mouse = (event: MouseEvent) => { if (document.pointerLockElement === canvas) gameRef.current.angle += event.movementX * .0024; };
    const pointer = () => { if (document.pointerLockElement !== canvas) void canvas.requestPointerLock?.(); };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('mousemove', mouse); canvas.addEventListener('dblclick', pointer);
    const loop = (now: number) => {
      const dt = Math.min(.04, (now - last) / 1000); last = now; const state = gameRef.current;
      if (!paused && state.running) {
        const keys = keysRef.current; const forward = (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0) + moveRef.current.y; const strafe = (keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0) + moveRef.current.x; const turn = (keys.has('arrowright') ? 1 : 0) - (keys.has('arrowleft') ? 1 : 0) + lookRef.current; if (forward || strafe || turn) state.engaged = true; const speed = keys.has('shift') ? 3.35 : 2.15; state.angle += turn * dt * 1.85;
        const dx = (Math.cos(state.angle) * forward + Math.cos(state.angle + Math.PI / 2) * strafe) * speed * dt; const dy = (Math.sin(state.angle) * forward + Math.sin(state.angle + Math.PI / 2) * strafe) * speed * dt; if (!isSolid(state, state.x + dx, state.y)) state.x += dx; if (!isSolid(state, state.x, state.y + dy)) state.y += dy;
        state.enemies.forEach((enemy) => { if (!enemy.alive || !state.engaged) return; const d = distance(state, enemy); enemy.cooldown -= dt; if (d < 4.6 && hasLineOfSight(state, enemy)) { const enemySpeed = enemy.kind === 'runner' ? .55 : enemy.kind === 'warden' ? .22 : .34; if (d > 1.05) { const vx = (state.x - enemy.x) / d * enemySpeed * dt; const vy = (state.y - enemy.y) / d * enemySpeed * dt; if (!isSolid(state, enemy.x + vx, enemy.y)) enemy.x += vx; if (!isSolid(state, enemy.x, enemy.y + vy)) enemy.y += vy; } else if (enemy.cooldown <= 0) { const hit = enemy.kind === 'warden' ? 10 : enemy.kind === 'runner' ? 6 : 8; state.health -= hit; enemy.cooldown = enemy.kind === 'runner' ? 1.05 : 1.45; setDamage(true); window.setTimeout(() => setDamage(false), 130); } } });
        state.pickups.forEach((pickup) => { if (pickup.taken || distance(state, pickup) > .55) return; pickup.taken = true; if (pickup.kind === 'health') state.health = Math.min(100, state.health + 40); if (pickup.kind === 'ammo') state.reserve += 36; if (pickup.kind === 'rifle') { state.weapon = 'rifle'; state.ammo = 24; state.reserve += 48; } setMessage(pickup.kind === 'rifle' ? 'Оружие «Вектор» получено' : pickup.kind === 'health' ? 'Здоровье восстановлено' : 'Боезапас пополнен'); });
        if (state.health <= 0) { state.running = false; report(state); }
        if (tileAt(state.x, state.y) === 'E' && state.enemies.every((enemy) => !enemy.alive)) { state.running = false; state.won = true; state.score += 1000; report(state); }
        if (now - hudTimer > 100) { updateHud(state); hudTimer = now; }
      }
      drawShooter(context, canvas, state); raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('mousemove', mouse); canvas.removeEventListener('dblclick', pointer); if (document.pointerLockElement === canvas) document.exitPointerLock?.(); };
  }, [interact, paused, reload, report, shoot, updateHud]);

  return <div className={`nova-game nova-core-shooter ${damage ? 'is-damaged' : ''}`}><canvas ref={canvasRef} onPointerDown={(event) => { if (event.pointerType === 'mouse') shoot(); }} aria-label="Игровая сцена CORE SHOOTER" /><header><span><Heart />{hud.health}</span><span><Crosshair />{hud.ammo}/{hud.reserve}</span><strong>CORE SHOOTER</strong><span>{hud.weapon}</span><span>{hud.enemies} целей</span><span>{hud.score}</span><button type="button" onClick={() => setPaused(!paused)} aria-label="Пауза">{paused ? <Play /> : <Pause />}</button><button type="button" onClick={onRestart} aria-label="Начать заново"><RotateCcw /></button><button type="button" onClick={onFullscreen} aria-label="Играть на весь экран"><Expand /></button><button type="button" onClick={onExit} aria-label="Выйти в библиотеку"><X /></button></header><p className="nova-game-message">{message}</p><div className="nova-shooter-controls"><div className="nova-thumbpad" onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)} onPointerMove={(event) => { if (!event.currentTarget.hasPointerCapture(event.pointerId)) return; const rect = event.currentTarget.getBoundingClientRect(); moveRef.current = { x: Math.max(-1, Math.min(1, (event.clientX - rect.left - rect.width / 2) / (rect.width / 2))), y: Math.max(-1, Math.min(1, -(event.clientY - rect.top - rect.height / 2) / (rect.height / 2))) }; }} onPointerUp={() => { moveRef.current = { x: 0, y: 0 }; }}><i /></div><div className="nova-game-touch"><ModernTouchButton onPointerDown={() => { lookRef.current = -1; }} onPointerUp={() => { lookRef.current = 0; }} aria-label="Смотреть влево">◀</ModernTouchButton><ModernTouchButton onPointerDown={interact} aria-label="Открыть дверь"><DoorOpen /></ModernTouchButton><ModernTouchButton className="is-fire" haptics={haptics} onPointerDown={shoot} aria-label="Стрелять"><Crosshair /></ModernTouchButton><ModernTouchButton onPointerDown={reload} aria-label="Перезарядить"><Zap /></ModernTouchButton><ModernTouchButton onPointerDown={() => { lookRef.current = 1; }} onPointerUp={() => { lookRef.current = 0; }} aria-label="Смотреть вправо">▶</ModernTouchButton></div></div>{paused ? <div className="nova-game-result"><Pause /><h2>Сектор приостановлен</h2><p>WASD — движение, мышь — обзор, Space — огонь, R — перезарядка, E — дверь.</p><button type="button" onClick={() => setPaused(false)}>Продолжить</button></div> : null}{!gameRef.current.running ? <div className="nova-game-result">{gameRef.current.won ? <Trophy /> : <Shield />}<h2>{gameRef.current.won ? 'CORE очищен' : 'Сигнал потерян'}</h2><strong>{hud.score} очков</strong><div><button type="button" onClick={onRestart}>Снова в сектор</button><button type="button" onClick={onExit}>В библиотеку</button></div></div> : null}</div>;
}

function drawShooter(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: ShooterState) {
  const ratio = Math.min(devicePixelRatio, 2); const width = canvas.clientWidth; const height = canvas.clientHeight;
  if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) { canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio); context.setTransform(ratio, 0, 0, ratio, 0, 0); }
  context.fillStyle = '#07101e'; context.fillRect(0, 0, width, height / 2); context.fillStyle = '#11131a'; context.fillRect(0, height / 2, width, height / 2);
  const rays = Math.max(160, Math.floor(width / 3)); const fov = Math.PI / 3; const depthBuffer: number[] = [];
  for (let ray = 0; ray < rays; ray += 1) { const angle = state.angle - fov / 2 + ray / rays * fov; let d = .02; let tile = '1'; while (d < 18) { const x = state.x + Math.cos(angle) * d; const y = state.y + Math.sin(angle) * d; tile = tileAt(x, y); if (isSolid(state, x, y)) break; d += .035; } const corrected = d * Math.cos(angle - state.angle); depthBuffer[ray] = corrected; const wallHeight = Math.min(height * 1.45, height / Math.max(.14, corrected)); const light = Math.max(22, 78 - corrected * 6); context.fillStyle = tile === 'D' ? `hsl(190 56% ${light}%)` : `hsl(216 25% ${light}%)`; context.fillRect(ray / rays * width, (height - wallHeight) / 2, width / rays + 1, wallHeight); }
  const objects = [...state.pickups.filter((item) => !item.taken).map((item) => ({ ...item, type: 'pickup' as const })), ...state.enemies.filter((item) => item.alive).map((item) => ({ ...item, type: 'enemy' as const }))].map((item) => ({ item, d: distance(state, item), angle: normalizeAngle(Math.atan2(item.y - state.y, item.x - state.x) - state.angle) })).filter(({ angle, d }) => Math.abs(angle) < fov * .7 && d > .2).sort((a, b) => b.d - a.d);
  objects.forEach(({ item, d, angle }) => { const screenX = width / 2 + Math.tan(angle) / Math.tan(fov / 2) * width / 2; const size = Math.min(height * .7, height / d * (item.type === 'enemy' ? .8 : .38)); const rayIndex = Math.max(0, Math.min(rays - 1, Math.floor(screenX / width * rays))); if (d > depthBuffer[rayIndex] + .3) return; const y = height / 2 + size * .18; context.save(); context.translate(screenX, y); if (item.type === 'enemy') { context.fillStyle = item.kind === 'warden' ? '#9f76ff' : item.kind === 'runner' ? '#ffb14d' : '#ff4f75'; context.fillRect(-size * .32, -size, size * .64, size); context.fillStyle = '#dfffff'; context.fillRect(-size * .18, -size * .72, size * .12, size * .1); context.fillRect(size * .06, -size * .72, size * .12, size * .1); } else { context.fillStyle = item.kind === 'health' ? '#61e3a4' : item.kind === 'ammo' ? '#ffe273' : '#72eaff'; context.beginPath(); context.arc(0, -size / 2, size / 3, 0, Math.PI * 2); context.fill(); } context.restore(); });
  context.strokeStyle = '#9ff4ff'; context.lineWidth = 2; context.beginPath(); context.moveTo(width / 2 - 12, height / 2); context.lineTo(width / 2 + 12, height / 2); context.moveTo(width / 2, height / 2 - 12); context.lineTo(width / 2, height / 2 + 12); context.stroke();
  context.fillStyle = state.weapon === 'rifle' ? '#6fe8ff' : '#c4d1e8'; context.fillRect(width / 2 - 50, height - 70, 100, 70); context.fillStyle = '#17233a'; context.fillRect(width / 2 - 22, height - 74, 44, 50);
}
