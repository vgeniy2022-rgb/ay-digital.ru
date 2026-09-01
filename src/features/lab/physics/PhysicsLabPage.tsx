import { Bomb, Circle, Copy, Cuboid, FolderOpen, Pause, Play, RotateCcw, Save, Smartphone, Snowflake, Trash2, Vibrate } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LabExperimentIntro, LabShell } from '../core/LabShell';
import { completeLabExperiment, recordLabActivity, saveExperimentState, unlockLabAchievement } from '../core/storage';
import { useLabState } from '../core/useLabState';
import { createPhysicsBody, createPhysicsPreset, createPhysicsWorld, stepPhysicsWorld, type PhysicsPresetId, type PhysicsShape, type PhysicsWorld } from './physicsModel';
import './physicsLab.css';

const gravityPresets = { ZERO: 0, MOON: 1.62, MARS: 3.71, EARTH: 9.81, JUPITER: 24.79 } as const;
type GravityPreset = keyof typeof gravityPresets;
type DragState = { id: string; pointerId: number; lastX: number; lastY: number; lastTime: number } | null;
const gravityLabels: Record<GravityPreset, string> = { ZERO: 'НЕВЕСОМОСТЬ', MOON: 'ЛУНА', MARS: 'МАРС', EARTH: 'ЗЕМЛЯ', JUPITER: 'ЮПИТЕР' };
const shapeLabels: Record<PhysicsShape, string> = { cube: 'КУБ', ball: 'ШАР', cylinder: 'ЦИЛИНДР', platform: 'ПЛАТФОРМА', domino: 'ДОМИНО', spring: 'ПРУЖИНА', pendulum: 'МАЯТНИК', ragdoll: 'ФИГУРА' };
const presetLabels: Record<PhysicsPresetId, string> = { free: 'Свободная лаборатория', domino: '100 домино', tower: 'Башня', pendulum: 'Маятники', springs: 'Пружины', zero: 'Нулевая гравитация', moon: 'Лунная гравитация', super: 'Сверхгравитация', explosion: 'Взрыв', rube: 'Машина Руба Голдберга' };

function drawPhysicsWorld(context: CanvasRenderingContext2D, world: PhysicsWorld, width: number, height: number, selectedId?: string) {
  const scale = Math.min(width / world.width, height / world.height);
  const offsetX = (width - world.width * scale) / 2;
  const offsetY = (height - world.height * scale) / 2;
  context.clearRect(0, 0, width, height);
  context.fillStyle = '#10141a'; context.fillRect(0, 0, width, height);
  context.save(); context.translate(offsetX, offsetY); context.scale(scale, scale);
  context.strokeStyle = 'rgba(255,255,255,.045)'; context.lineWidth = 1;
  for (let x = 0; x <= world.width; x += 50) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, world.height); context.stroke(); }
  for (let y = 0; y <= world.height; y += 50) { context.beginPath(); context.moveTo(0, y); context.lineTo(world.width, y); context.stroke(); }
  context.fillStyle = '#222a35'; context.fillRect(0, world.height - 36, world.width, 36);
  context.fillStyle = '#748093'; context.font = '800 10px ui-monospace, monospace'; context.fillText('ПЛАТФОРМА СТОЛКНОВЕНИЙ', 20, world.height - 14);

  world.bodies.forEach((body) => {
    if (body.anchor) {
      context.strokeStyle = body.shape === 'spring' ? '#8caef0' : '#8b94a3';
      context.lineWidth = body.shape === 'spring' ? 3 : 2;
      context.beginPath(); context.moveTo(body.anchor.x, body.anchor.y);
      if (body.shape === 'spring') {
        const segments = 12;
        for (let index = 1; index < segments; index += 1) {
          const ratio = index / segments;
          const x = body.anchor.x + (body.x - body.anchor.x) * ratio + (index % 2 ? -10 : 10);
          const y = body.anchor.y + (body.y - body.anchor.y) * ratio;
          context.lineTo(x, y);
        }
      }
      context.lineTo(body.x, body.y); context.stroke();
      context.fillStyle = '#d9e3f4'; context.beginPath(); context.arc(body.anchor.x, body.anchor.y, 5, 0, Math.PI * 2); context.fill();
    }
    context.save(); context.translate(body.x, body.y); context.rotate(body.rotation);
    context.fillStyle = body.color; context.strokeStyle = body.frozen ? '#8fe7ff' : selectedId === body.id ? '#fff' : 'rgba(255,255,255,.28)'; context.lineWidth = selectedId === body.id ? 4 : 2;
    if (body.shape === 'ball' || body.shape === 'spring' || body.shape === 'pendulum') {
      context.beginPath(); context.arc(0, 0, body.shape === 'ball' ? body.radius : 26, 0, Math.PI * 2); context.fill(); context.stroke();
    } else if (body.shape === 'ragdoll') {
      context.beginPath(); context.arc(0, -30, 14, 0, Math.PI * 2); context.fill(); context.stroke();
      context.lineWidth = 8; context.lineCap = 'round'; context.beginPath(); context.moveTo(0, -15); context.lineTo(0, 26); context.moveTo(0, -3); context.lineTo(-22, 14); context.moveTo(0, -3); context.lineTo(22, 14); context.moveTo(0, 25); context.lineTo(-18, 46); context.moveTo(0, 25); context.lineTo(18, 46); context.stroke();
    } else {
      context.beginPath(); context.roundRect(-body.width / 2, -body.height / 2, body.width, body.height, body.shape === 'domino' ? 4 : 8); context.fill(); context.stroke();
      if (body.shape === 'domino') { context.fillStyle = 'rgba(0,0,0,.35)'; context.beginPath(); context.arc(0, -20, 3, 0, Math.PI * 2); context.arc(0, 20, 3, 0, Math.PI * 2); context.fill(); }
    }
    context.restore();
  });
  context.restore();
  return { scale, offsetX, offsetY };
}

export function PhysicsLabPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef(createPhysicsWorld());
  const transformRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 });
  const dragRef = useRef<DragState>(null);
  const lastHapticRef = useRef(0);
  const [selectedId, setSelectedId] = useState<string>();
  const [gravityPreset, setGravityPreset] = useState<GravityPreset>('EARTH');
  const [mass, setMass] = useState(1);
  const [restitution, setRestitution] = useState(.55);
  const [friction, setFriction] = useState(.25);
  const [sensorState, setSensorState] = useState<'idle' | 'active' | 'unavailable'>('idle');
  const [paused, setPaused] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const [activePreset, setActivePreset] = useState<PhysicsPresetId>('free');
  const [limitNotice, setLimitNotice] = useState(false);
  const [modesTried, setModesTried] = useState<string[]>(() => {
    const value = stateSafeRead('modesTried');
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  });
  const [version, setVersion] = useState(0);
  const { state, toggleHaptics } = useLabState('physics');

  function stateSafeRead(key: string) {
    try {
      const raw = window.localStorage.getItem('sitevl-lab-state-v2');
      const parsed = raw ? JSON.parse(raw) as { experimentState?: { physics?: Record<string, unknown> } } : null;
      return parsed?.experimentState?.physics?.[key];
    } catch { return undefined; }
  }

  const addBody = useCallback((shape: PhysicsShape) => {
    const world = worldRef.current;
    const limit = window.innerWidth < 768 ? 80 : 120;
    if (world.bodies.length >= limit) { setLimitNotice(true); window.setTimeout(() => setLimitNotice(false), 2200); return; }
    const body = createPhysicsBody(shape, 180 + Math.random() * 640, 80, { mass, restitution, friction });
    world.bodies.push(body);
    setSelectedId(body.id);
    setVersion((value) => value + 1);
    unlockLabAchievement('PHYSICS_ENTHUSIAST');
    recordLabActivity({ objectsCreated: 1 });
    if (state.stats.objectsCreated + 1 >= 100) unlockLabAchievement('OBJECT_HUNDRED');
  }, [friction, mass, restitution, state.stats.objectsCreated]);

  const reset = useCallback(() => { worldRef.current = createPhysicsWorld(); setSelectedId(undefined); setGravityPreset('EARTH'); setVersion((value) => value + 1); }, []);
  const removeSelected = () => {
    if (!selectedId) return;
    worldRef.current.bodies = worldRef.current.bodies.filter((body) => body.id !== selectedId);
    setSelectedId(undefined);
    setVersion((value) => value + 1);
  };
  const setGravity = (preset: GravityPreset) => {
    setGravityPreset(preset);
    worldRef.current.gravity = { x: 0, y: gravityPresets[preset] * 70 };
    unlockLabAchievement('PHYSICS_ENTHUSIAST');
    if (preset === 'ZERO') unlockLabAchievement('ZERO_GRAVITY');
  };

  const loadPreset = (preset: PhysicsPresetId) => {
    const world = createPhysicsPreset(preset);
    world.timeScale = timeScale;
    worldRef.current = world;
    setActivePreset(preset);
    setGravityPreset(preset === 'zero' ? 'ZERO' : preset === 'moon' ? 'MOON' : preset === 'super' ? 'JUPITER' : 'EARTH');
    setSelectedId(undefined);
    const nextModes = modesTried.includes(preset) ? modesTried : [...modesTried, preset];
    setModesTried(nextModes);
    saveExperimentState('physics', { ...(state.experimentState.physics || {}), modesTried: nextModes });
    if (preset === 'zero') unlockLabAchievement('ZERO_GRAVITY');
    if (preset === 'rube' || preset === 'explosion') unlockLabAchievement('CHAIN_REACTION');
    if (nextModes.length >= 3) completeLabExperiment('physics');
    recordLabActivity({ objectsCreated: world.bodies.length });
    setVersion((value) => value + 1);
  };

  const updateTimeScale = (value: number) => { setTimeScale(value); worldRef.current.timeScale = value; };
  const freezeSelected = () => { const body = worldRef.current.bodies.find((item) => item.id === selectedId); if (body) { body.frozen = !body.frozen; body.vx = 0; body.vy = 0; setVersion((value) => value + 1); } };
  const duplicateSelected = () => { const body = worldRef.current.bodies.find((item) => item.id === selectedId); if (!body || worldRef.current.bodies.length >= 120) return; const copy = createPhysicsBody(body.shape, body.x + 40, body.y - 40, body); worldRef.current.bodies.push(copy); setSelectedId(copy.id); recordLabActivity({ objectsCreated: 1 }); setVersion((value) => value + 1); };
  const explode = () => { const origin = worldRef.current.bodies.find((item) => item.id === selectedId) || { x: 500, y: 320 }; worldRef.current.bodies.forEach((body) => { if (body.frozen) return; const dx = body.x - origin.x; const dy = body.y - origin.y; const distance = Math.max(45, Math.hypot(dx, dy)); body.vx += dx / distance * (28000 / distance); body.vy += dy / distance * (28000 / distance); }); unlockLabAchievement('CHAIN_REACTION'); };

  const saveScene = (slot: number) => {
    const existing = Array.isArray(state.experimentState.physics?.scenes) ? state.experimentState.physics.scenes : [];
    const scenes = [...existing] as unknown[];
    scenes[slot] = JSON.parse(JSON.stringify(worldRef.current));
    saveExperimentState('physics', { ...(state.experimentState.physics || {}), modesTried, scenes });
  };
  const loadScene = (slot: number) => {
    const scenes = state.experimentState.physics?.scenes;
    if (!Array.isArray(scenes) || !scenes[slot] || typeof scenes[slot] !== 'object') return;
    worldRef.current = scenes[slot] as PhysicsWorld;
    worldRef.current.timeScale = timeScale;
    setVersion((value) => value + 1);
  };

  useEffect(() => {
    if (sensorState !== 'active') return;
    const orientation = (event: DeviceOrientationEvent) => {
      const gamma = Math.max(-45, Math.min(45, event.gamma || 0));
      const beta = Math.max(-45, Math.min(45, (event.beta || 0) - 25));
      worldRef.current.gravity = { x: gamma * 15, y: beta * 12 + 300 };
    };
    window.addEventListener('deviceorientation', orientation);
    return () => window.removeEventListener('deviceorientation', orientation);
  }, [sensorState]);

  const enableTilt = async () => {
    if (!('DeviceOrientationEvent' in window)) { setSensorState('unavailable'); return; }
    try {
      const orientationApi = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<'granted' | 'denied'> };
      const permission = orientationApi.requestPermission ? await orientationApi.requestPermission() : 'granted';
      setSensorState(permission === 'granted' ? 'active' : 'unavailable');
    } catch { setSensorState('unavailable'); }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let frame = 0;
    let last = performance.now();
    let hidden = document.hidden;
    const resize = () => { const bounds = canvas.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.floor(bounds.width * dpr); canvas.height = Math.floor(bounds.height * dpr); context.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
    const visibility = () => { hidden = document.hidden; last = performance.now(); };
    document.addEventListener('visibilitychange', visibility);
    const loop = (time: number) => {
      const delta = (time - last) / 1000; last = time;
      const impact = hidden || paused ? 0 : stepPhysicsWorld(worldRef.current, delta, dragRef.current?.id);
      if (impact > 290 && state.hapticsEnabled && time - lastHapticRef.current > 240 && 'vibrate' in navigator) { navigator.vibrate(Math.min(40, Math.round(impact / 18))); lastHapticRef.current = time; }
      const bounds = canvas.getBoundingClientRect();
      transformRef.current = drawPhysicsWorld(context, worldRef.current, bounds.width, bounds.height, selectedId);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  }, [paused, selectedId, state.hapticsEnabled, version]);

  const worldPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const transform = transformRef.current;
    return { x: (event.clientX - bounds.left - transform.offsetX) / transform.scale, y: (event.clientY - bounds.top - transform.offsetY) / transform.scale };
  };
  const pointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = worldPoint(event);
    const body = [...worldRef.current.bodies].reverse().find((item) => Math.hypot(point.x - item.x, point.y - item.y) < Math.max(item.radius, 42));
    if (!body) { setSelectedId(undefined); return; }
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { id: body.id, pointerId: event.pointerId, lastX: point.x, lastY: point.y, lastTime: performance.now() };
    body.vx = 0; body.vy = 0; setSelectedId(body.id);
  };
  const pointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current; if (!drag || drag.pointerId !== event.pointerId) return;
    const point = worldPoint(event); const body = worldRef.current.bodies.find((item) => item.id === drag.id); if (!body) return;
    const now = performance.now(); const delta = Math.max(16, now - drag.lastTime) / 1000;
    body.vx = (point.x - drag.lastX) / delta; body.vy = (point.y - drag.lastY) / delta; body.x = point.x; body.y = point.y;
    Object.assign(drag, { lastX: point.x, lastY: point.y, lastTime: now });
  };
  const pointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => { if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null; };
  const selected = worldRef.current.bodies.find((body) => body.id === selectedId);

  return (
    <LabShell experimentId="physics" title="Лаборатория физики" description="Интерактивная физическая лаборатория SITEVL с режимами, локальными сценами, виброоткликом и управлением наклоном устройства." canonicalPath="/lab/physics" status="ФИЗИКА · ОБРАТНАЯ СВЯЗЬ УСТРОЙСТВА" immersive>
      <LabExperimentIntro number="04" eyebrow="ФИЗИКА В РЕАЛЬНОМ ВРЕМЕНИ" title="ЛАБОРАТОРИЯ ФИЗИКИ" description="Создавайте, бросайте и замораживайте объекты. Меняйте гравитацию, скорость времени и свойства материалов." controls={<><button className="lab-control-button" type="button" onClick={() => setPaused((value) => !value)}>{paused ? <Play /> : <Pause />}{paused ? 'ЗАПУСТИТЬ ФИЗИКУ' : 'ПАУЗА ФИЗИКИ'}</button><button className="lab-control-button" type="button" onClick={reset}><RotateCcw />ОЧИСТИТЬ СЦЕНУ</button></>} />
      <section className="lab-stage physics-stage" data-version={version}>
        <canvas ref={canvasRef} aria-label="Физическая сцена" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} />
        <aside className="physics-toolbar lab-overlay-panel">
          <div className="physics-toolbar__create"><button type="button" onClick={() => addBody('cube')}><Cuboid />КУБ</button><button type="button" onClick={() => addBody('ball')}><Circle />ШАР</button><button type="button" onClick={() => addBody('cylinder')}>ЦИЛИНДР</button><button type="button" onClick={() => addBody('platform')}>ПЛАТФОРМА</button><button type="button" onClick={() => addBody('domino')}>ДОМИНО</button><button type="button" onClick={() => addBody('spring')}>ПРУЖИНА</button><button type="button" onClick={() => addBody('pendulum')}>МАЯТНИК</button><button type="button" onClick={() => addBody('ragdoll')}>ФИГУРА</button></div>
          <div className="physics-presets">{(Object.keys(gravityPresets) as GravityPreset[]).map((preset) => <button className={gravityPreset === preset && sensorState !== 'active' ? 'is-active' : ''} type="button" onClick={() => { setSensorState('idle'); setGravity(preset); }} key={preset}>{gravityLabels[preset]}</button>)}</div>
          <select aria-label="Режим лаборатории" value={activePreset} onChange={(event) => loadPreset(event.target.value as PhysicsPresetId)}>{(Object.keys(presetLabels) as PhysicsPresetId[]).map((id) => <option value={id} key={id}>{presetLabels[id]}</option>)}</select>
        </aside>
        <aside className="physics-inspector lab-overlay-panel"><header><span>{selected ? shapeLabels[selected.shape] : 'НОВЫЙ ОБЪЕКТ'}</span><div>{selected ? <><button type="button" onClick={duplicateSelected} aria-label="Дублировать"><Copy /></button><button type="button" onClick={freezeSelected} aria-label="Заморозить"><Snowflake /></button><button type="button" onClick={removeSelected} aria-label="Удалить"><Trash2 /></button></> : null}</div></header><label>МАССА <output>{mass.toFixed(1)}</output><input type="range" min="0.2" max="8" step="0.1" value={mass} onChange={(event) => setMass(Number(event.target.value))} /></label><label>УПРУГОСТЬ <output>{restitution.toFixed(2)}</output><input type="range" min="0" max="1" step="0.05" value={restitution} onChange={(event) => setRestitution(Number(event.target.value))} /></label><label>ТРЕНИЕ <output>{friction.toFixed(2)}</output><input type="range" min="0" max="1" step="0.05" value={friction} onChange={(event) => setFriction(Number(event.target.value))} /></label><div className="physics-time">{[1, .5, .25, .1].map((value) => <button className={timeScale === value ? 'is-active' : ''} type="button" onClick={() => updateTimeScale(value)} key={value}>{value}×</button>)}</div><button type="button" onClick={explode}><Bomb />ВЗРЫВНАЯ СИЛА</button><button className={state.hapticsEnabled ? 'is-active' : ''} type="button" onClick={toggleHaptics}><Vibrate />ВИБРООТКЛИК: {state.hapticsEnabled ? 'ВКЛ.' : 'ВЫКЛ.'}</button><button className={sensorState === 'active' ? 'is-active' : ''} type="button" onClick={() => void enableTilt()}><Smartphone />НАКЛОНЯТЬ МИР</button><div className="physics-slots">{[0, 1, 2].map((slot) => <span key={slot}><button type="button" onClick={() => saveScene(slot)} aria-label={`Сохранить сцену ${slot + 1}`}><Save />{slot + 1}</button><button type="button" onClick={() => loadScene(slot)} aria-label={`Загрузить сцену ${slot + 1}`}><FolderOpen /></button></span>)}</div>{sensorState === 'unavailable' ? <small>СЕНСОР УСТРОЙСТВА НЕДОСТУПЕН</small> : sensorState === 'active' ? <small>НАКЛОН УСТРОЙСТВА УПРАВЛЯЕТ ГРАВИТАЦИЕЙ</small> : null}</aside>
        {limitNotice ? <div className="physics-limit" role="status">Достигнут безопасный лимит объектов для этого экрана.</div> : null}
      </section>
    </LabShell>
  );
}
