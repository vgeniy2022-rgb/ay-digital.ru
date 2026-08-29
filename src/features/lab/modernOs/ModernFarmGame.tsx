import { ArrowLeft, Camera, Check, Coins, Download, Expand, Factory, Fish, Focus, Leaf, LockKeyhole, Map as MapIcon, PackageOpen, Pause, PawPrint, Play, Settings, ShoppingBasket, Sparkles, Target, Tractor, Upload, Warehouse as Barn, Wheat, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react';
import {
  FARM_CROPS,
  FARM_ANIMALS,
  FARM_BUILDINGS,
  FARM_DECORATIONS,
  FARM_GOALS,
  FARM_ITEM_CATEGORY,
  FARM_RECIPES,
  FARM_ZONES,
  advanceFarm,
  buyFarmAnimal,
  buyFarmDecoration,
  catchFarmFish,
  claimFarmDaily,
  claimFarmGoal,
  collectFarmAnimal,
  createDefaultFarmState,
  exportFarmSave,
  farmBarnCapacity,
  farmDailyProgress,
  farmGoalProgress,
  farmInventoryUsed,
  farmItemName,
  farmProductionSlots,
  farmXpForNextLevel,
  feedFarmAnimal,
  fulfillFarmOrder,
  harvestFarmPlot,
  importFarmSave,
  isFarmHarvestDay,
  plantFarmPlot,
  queueFarmRecipe,
  renameFarm,
  sellFarmItem,
  unlockFarmZone,
  updateFarmSettings,
  upgradeFarmBuilding,
  type FarmBuildingId,
  type FarmCropId,
  type FarmItemCategory,
  type FarmItemId,
  type FarmRecipeId,
  type FarmZoneId,
  type ModernFarmState,
} from './modernFarmModel';
import { drawFarmWorld, farmPlotAtScreen, type FarmCamera } from './modernFarmRenderer';
import type { ModernGameProps } from './modernGameTypes';

type FarmTab = 'crops' | 'production' | 'orders' | 'barn' | 'animals' | 'goals' | 'map' | 'settings';
type FarmProps = ModernGameProps & { farm: ModernFarmState; onFarmChange: (farm: ModernFarmState) => void; lowPowerMode?: boolean };
type PointerSnapshot = { x: number; y: number };

const tabs: Array<{ id: FarmTab; label: string; icon: typeof Wheat }> = [
  { id: 'crops', label: 'Посевы', icon: Wheat },
  { id: 'production', label: 'Цеха', icon: Factory },
  { id: 'orders', label: 'Заказы', icon: ShoppingBasket },
  { id: 'barn', label: 'Амбар', icon: Barn },
  { id: 'animals', label: 'Животные', icon: PawPrint },
  { id: 'goals', label: 'Цели', icon: Target },
  { id: 'map', label: 'Земли', icon: MapIcon },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const formatDuration = (milliseconds: number) => {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return seconds < 60 ? `${seconds} с` : `${Math.floor(seconds / 60)} мин ${String(seconds % 60).padStart(2, '0')} с`;
};
const ingredientText = (items: Partial<Record<FarmItemId, number>>) => Object.entries(items).map(([id, amount]) => `${farmItemName(id as FarmItemId)} ×${amount}`).join(' · ');

export function ModernFarmGame({ farm, haptics, lowPowerMode = false, progress, onExit, onFullscreen, onResult, onFarmChange }: FarmProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const farmRef = useRef(farm);
  const cameraRef = useRef<FarmCamera>({ x: -70, y: 54, zoom: .72 });
  const cameraTargetRef = useRef<FarmCamera | null>(null);
  const pointersRef = useRef(new Map<number, PointerSnapshot>());
  const dragRef = useRef({ moved: false, lastX: 0, lastY: 0, pinchDistance: 0 });
  const [selectedPlotId, setSelectedPlotId] = useState(farm.plots[0]?.id || null);
  const [selectedCropId, setSelectedCropId] = useState<FarmCropId>('wheat');
  const [tab, setTab] = useState<FarmTab>('crops');
  const [now, setNow] = useState(Date.now());
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(!document.hidden);
  const [zoom, setZoom] = useState(cameraRef.current.zoom);
  const [message, setMessage] = useState('Выберите грядку и посадите первую культуру.');
  const [saveState, setSaveState] = useState<'saved' | 'saving'>('saved');
  const [category, setCategory] = useState<FarmItemCategory>('crops');

  useEffect(() => { farmRef.current = farm; }, [farm]);
  useEffect(() => {
    if (paused || !visible) return;
    let frame = 0;
    const render = () => {
      const target = cameraTargetRef.current;
      if (target) {
        cameraRef.current.x += (target.x - cameraRef.current.x) * .16; cameraRef.current.y += (target.y - cameraRef.current.y) * .16; cameraRef.current.zoom += (target.zoom - cameraRef.current.zoom) * .16;
        if (Math.abs(target.x - cameraRef.current.x) < .2 && Math.abs(target.y - cameraRef.current.y) < .2 && Math.abs(target.zoom - cameraRef.current.zoom) < .002) { cameraRef.current = target; cameraTargetRef.current = null; }
      }
      const canvas = canvasRef.current;
      const context = canvas?.getContext('2d');
      if (canvas && context) { const renderState = lowPowerMode ? { ...farmRef.current, settings: { ...farmRef.current.settings, quality: 'low' as const, reducedEffects: true } } : farmRef.current; drawFarmWorld(context, canvas, renderState, cameraRef.current, selectedPlotId, Date.now()); }
      frame = window.requestAnimationFrame(render);
    };
    frame = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frame);
  }, [lowPowerMode, paused, selectedPlotId, visible]);

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      const tick = Date.now();
      setNow(tick);
      const current = farmRef.current;
      const next = advanceFarm(current, tick);
      if (next.processes.length !== current.processes.length) {
        farmRef.current = next;
        onFarmChange(next);
        onResult('farm', { score: next.coins + next.xp, progress: next.level, achievement: 'Первый продукт' });
        setMessage('Производство завершено. Продукт отправлен в амбар.');
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, [onFarmChange, onResult, paused]);

  const selectedPlot = farm.plots.find((plot) => plot.id === selectedPlotId);
  const xpGoal = farmXpForNextLevel(farm.level);
  const xpPrevious = farm.level <= 1 ? 0 : (farm.level - 1) * (farm.level - 1) * 85;
  const xpProgress = clamp((farm.xp - xpPrevious) / Math.max(1, xpGoal - xpPrevious), 0, 1);
  const inventoryItems = useMemo(() => Object.entries(farm.inventory).filter(([id, amount]) => amount > 0 && FARM_ITEM_CATEGORY[id as FarmItemId] === category) as Array<[FarmItemId, number]>, [category, farm.inventory]);

  const notify = (text: string) => {
    setMessage(text);
    if (haptics && farmRef.current.settings.haptics && navigator.vibrate) navigator.vibrate(12);
  };
  const playTone = () => { if (!farmRef.current.settings.sounds) return; try { const context = new AudioContext(); const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.frequency.value = 520; gain.gain.setValueAtTime(.025, context.currentTime); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .07); oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .07); oscillator.addEventListener('ended', () => void context.close(), { once: true }); } catch { /* Sound is optional. */ } };
  const commit = (next: ModernFarmState, text: string, achievement?: string) => {
    if (next === farmRef.current) { notify(text); return false; }
    farmRef.current = next;
    setSaveState('saving');
    onFarmChange(next);
    onResult('farm', { score: next.coins + next.xp, progress: next.level, achievement });
    playTone();
    notify(text);
    window.setTimeout(() => setSaveState('saved'), 420);
    return true;
  };
  const plant = (cropId = selectedCropId) => {
    if (!selectedPlotId) return notify('Сначала выберите свободную грядку.');
    const crop = FARM_CROPS.find((item) => item.id === cropId)!;
    if (farm.level < crop.level) return notify(`Культура откроется на уровне ${crop.level}.`);
    if (selectedPlot?.cropId) return notify('Эта грядка уже занята.');
    if (farm.inventory[cropId] < 1) return notify(`Нет семян: оставьте хотя бы одну единицу культуры ${crop.name.toLowerCase()}.`);
    commit(plantFarmPlot(farmRef.current, selectedPlotId, cropId), `${crop.name}: рост начался, урожай через ${formatDuration(crop.growthMs)}.`);
  };
  const harvest = () => {
    if (!selectedPlotId || !selectedPlot?.cropId) return notify('На выбранной грядке пока нечего собирать.');
    if ((selectedPlot.readyAt || 0) > now) return notify(`Урожай созреет через ${formatDuration((selectedPlot.readyAt || now) - now)}.`);
    const next = harvestFarmPlot(farmRef.current, selectedPlotId, now);
    commit(next, 'Урожай собран: +3 в амбар и +8 XP.', next.harvested >= 30 ? 'Опытный фермер' : 'Первый урожай');
  };
  const process = (recipeId: FarmRecipeId) => {
    const recipe = FARM_RECIPES.find((item) => item.id === recipeId)!;
    const next = queueFarmRecipe(farmRef.current, recipeId, now);
    commit(next, next === farmRef.current ? 'Для запуска не хватает ингредиентов, уровня или доступного места.' : `${recipe.name}: производство запущено.`);
  };
  const completeOrder = (orderId: string) => {
    const next = fulfillFarmOrder(farmRef.current, orderId, now);
    commit(next, next === farmRef.current ? 'Сначала соберите все товары из заказа.' : 'Заказ отправлен. Монеты и опыт начислены.', next.fulfilledOrders >= 3 ? 'Надёжный поставщик' : 'Первый заказ');
  };
  const unlock = (zoneId: FarmZoneId) => {
    const next = unlockFarmZone(farmRef.current, zoneId, now);
    commit(next, next === farmRef.current ? 'Пока не хватает уровня или монет для открытия.' : 'Новая территория открыта.', next.unlockedZones.length >= 3 ? 'Исследователь земель' : undefined);
  };
  const changeZoom = (delta: number) => {
    cameraTargetRef.current = null;
    cameraRef.current.zoom = clamp(cameraRef.current.zoom + delta, .46, 1.35);
    setZoom(cameraRef.current.zoom);
  };
  const clampCamera = () => { cameraRef.current.x = clamp(cameraRef.current.x, -700, 700); cameraRef.current.y = clamp(cameraRef.current.y, -260, 480); };
  const resetCamera = () => {
    cameraTargetRef.current = { x: -70, y: 54, zoom: .72 };
    setZoom(.72);
    notify('Карта снова в центре.');
  };

  const beginPointer = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    cameraTargetRef.current = null;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    dragRef.current.lastX = event.clientX;
    dragRef.current.lastY = event.clientY;
    dragRef.current.moved = false;
    if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      dragRef.current.pinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
    }
  };
  const movePointer = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const previous = pointersRef.current.get(event.pointerId);
    if (!previous) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size > 1) {
      const [a, b] = [...pointersRef.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (dragRef.current.pinchDistance) cameraRef.current.zoom = clamp(cameraRef.current.zoom * distance / dragRef.current.pinchDistance, .46, 1.35);
      dragRef.current.pinchDistance = distance;
      dragRef.current.moved = true;
      setZoom(cameraRef.current.zoom);
      return;
    }
    const dx = event.clientX - previous.x;
    const dy = event.clientY - previous.y;
    if (Math.abs(dx) + Math.abs(dy) > 1) {
      cameraRef.current.x += dx;
      cameraRef.current.y += dy;
      clampCamera();
      dragRef.current.moved = dragRef.current.moved || Math.hypot(event.clientX - dragRef.current.lastX, event.clientY - dragRef.current.lastY) > 5;
    }
  };
  const endPointer = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const shouldSelect = pointersRef.current.size === 1 && !dragRef.current.moved;
    pointersRef.current.delete(event.pointerId);
    dragRef.current.pinchDistance = 0;
    if (!shouldSelect) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const plot = farmPlotAtScreen(farmRef.current, cameraRef.current, { width: rect.width, height: rect.height }, { x: event.clientX - rect.left, y: event.clientY - rect.top });
    if (plot) { setSelectedPlotId(plot.id); setTab('crops'); notify(`Выбрана грядка ${plot.id.replace(/\D/g, '') || plot.id}.`); }
  };
  const wheel = (event: ReactWheelEvent<HTMLCanvasElement>) => { event.preventDefault(); changeZoom(event.deltaY > 0 ? -.06 : .06); };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;
      if (event.key === 'Escape') setPaused((value) => !value);
      if (event.key === '+' || event.key === '=') changeZoom(.08);
      if (event.key === '-') changeZoom(-.08);
      const step = 28;
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') cameraRef.current.x += step;
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') cameraRef.current.x -= step;
      if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') cameraRef.current.y += step;
      if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') cameraRef.current.y -= step;
      clampCamera();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const download = (content: string | Blob, name: string, type = 'application/json') => {
    const blob = content instanceof Blob ? content : new Blob([content], { type }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 500);
  };
  const screenshot = () => canvasRef.current?.toBlob((blob) => { if (blob) download(blob, `sitevl-farm-${Date.now()}.png`, 'image/png'); }, 'image/png');
  const importSave = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
    const result = importFarmSave(await file.text());
    if (!result.ok) return notify(result.error);
    commit(result.state, 'Сохранение импортировано. Ферма восстановлена.');
  };

  return <div className="nova-game nova-farm">
    <header>
      <button type="button" onClick={onExit} aria-label="Вернуться в игровой центр"><ArrowLeft /></button>
      <strong>SITEVL FARM</strong>
      <small className="nova-farm-save"><Check />{saveState === 'saved' ? 'Сохранено' : 'Сохранение…'}</small>
      <span><Sparkles />Уровень {farm.level}</span>
      <span><Coins />{farm.coins.toLocaleString('ru-RU')}</span>
      <span className="nova-farm-xp"><i style={{ width: `${xpProgress * 100}%` }} /><small>{farm.xp} XP</small></span>
      <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Продолжить игру' : 'Пауза'}>{paused ? <Play /> : <Pause />}</button>
      <button type="button" onClick={resetCamera} aria-label="Центрировать карту"><Focus /></button>
      <button type="button" onClick={onFullscreen} aria-label="Играть на весь экран"><Expand /></button>
    </header>
    <div className="nova-farm-stage">
      <section className="nova-farm-world" aria-label="Изометрическая карта фермы">
        <canvas ref={canvasRef} onPointerDown={beginPointer} onPointerMove={movePointer} onPointerUp={endPointer} onPointerCancel={endPointer} onWheel={wheel} />
        <div className="nova-farm-map-help"><Tractor /><span>Перетаскивайте карту · колёсико или жест двумя пальцами меняет масштаб</span></div>
        <div className="nova-farm-zoom" aria-label="Масштаб карты">
          <button type="button" onClick={() => changeZoom(.1)} aria-label="Приблизить"><ZoomIn /></button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => changeZoom(-.1)} aria-label="Отдалить"><ZoomOut /></button>
        </div>
        <p className="nova-farm-message">{message}</p>
      </section>
      <aside className="nova-farm-panel">
        <nav aria-label="Разделы фермы">{tabs.map(({ id, label, icon: Icon }) => <button className={tab === id ? 'is-active' : ''} type="button" onClick={() => setTab(id)} aria-label={label} title={label} key={id}><Icon /><span>{label}</span></button>)}</nav>
        <div className="nova-farm-panel-content">
          {tab === 'crops' ? <CropsPanel farm={farm} selectedPlot={selectedPlot} selectedCropId={selectedCropId} now={now} onSelectCrop={setSelectedCropId} onPlant={plant} onHarvest={harvest} /> : null}
          {tab === 'production' ? <ProductionPanel farm={farm} now={now} onProcess={process} /> : null}
          {tab === 'orders' ? <OrdersPanel farm={farm} onComplete={completeOrder} /> : null}
          {tab === 'barn' ? <BarnPanel farm={farm} items={inventoryItems} category={category} onCategory={setCategory} onSell={(itemId) => { const next = sellFarmItem(farmRef.current, itemId); commit(next, next === farmRef.current ? 'Последнее семя нельзя продать, пока культура не растёт на поле.' : `${farmItemName(itemId)} продано.`); }} /> : null}
          {tab === 'animals' ? <AnimalsPanel farm={farm} now={now} onBuy={(type) => { const next = buyFarmAnimal(farmRef.current, type); commit(next, next === farmRef.current ? 'Пока не хватает уровня, территории или монет.' : 'Новое животное поселилось на ферме.'); }} onFeed={(id) => { const next = feedFarmAnimal(farmRef.current, id, now); commit(next, next === farmRef.current ? 'Сначала приготовьте подходящий корм.' : 'Животное накормлено.'); }} onCollect={(id) => { const next = collectFarmAnimal(farmRef.current, id, now); commit(next, next === farmRef.current ? 'Продукт ещё не готов или амбар заполнен.' : 'Продукт отправлен в амбар.'); }} /> : null}
          {tab === 'goals' ? <GoalsPanel farm={farm} now={now} onGoal={(id) => commit(claimFarmGoal(farmRef.current, id), 'Награда за цель получена.')} onDaily={(id) => commit(claimFarmDaily(farmRef.current, id), 'Ежедневная награда получена.')} /> : null}
          {tab === 'map' ? <ZonesPanel farm={farm} onUnlock={unlock} onUpgrade={(building) => { const next = upgradeFarmBuilding(farmRef.current, building); commit(next, next === farmRef.current ? 'Для улучшения не хватает монет или достигнут максимум.' : 'Здание улучшено.'); }} /> : null}
          {tab === 'settings' ? <SettingsPanel farm={farm} playTime={progress.playTime} lowPowerMode={lowPowerMode} onRename={(name) => commit(renameFarm(farmRef.current, name), 'Название фермы сохранено.')} onSetting={(patch) => commit(updateFarmSettings(farmRef.current, patch), 'Настройки фермы сохранены.')} onDecoration={(id) => { const next = buyFarmDecoration(farmRef.current, id); commit(next, next === farmRef.current ? 'Декорация пока недоступна.' : 'Декорация установлена на ферме.'); }} onFish={() => { const next = catchFarmFish(farmRef.current, now); commit(next, next === farmRef.current ? 'Рыбалка ещё недоступна или снасти не готовы.' : 'Улов отправлен в амбар.'); }} onExport={() => download(exportFarmSave(farmRef.current), 'sitevl-farm-save.json')} onImport={() => importRef.current?.click()} onScreenshot={screenshot} onReset={() => { if (farmRef.current.settings.confirmDestructive && !window.confirm('Сбросить только прогресс SITEVL FARM? Остальные данные Modern OS останутся без изменений.')) return; commit(createDefaultFarmState(), 'Ферма сброшена до нового сохранения.'); }} /> : null}
        </div>
      </aside>
    </div>
    <input ref={importRef} hidden type="file" accept="application/json,.json" onChange={importSave} />
    {paused ? <div className="nova-farm-pause"><Leaf /><h2>Ферма на паузе</h2><p>Рост культур продолжится по реальному времени, но интерфейс остановлен.</p><button type="button" onClick={() => setPaused(false)}><Play />Продолжить</button><button type="button" onClick={onExit}><X />Выйти в игровой центр</button></div> : null}
  </div>;
}

function CropsPanel({ farm, selectedPlot, selectedCropId, now, onSelectCrop, onPlant, onHarvest }: { farm: ModernFarmState; selectedPlot: ModernFarmState['plots'][number] | undefined; selectedCropId: FarmCropId; now: number; onSelectCrop: (id: FarmCropId) => void; onPlant: (id?: FarmCropId) => void; onHarvest: () => void }) {
  const crop = selectedPlot?.cropId ? FARM_CROPS.find((item) => item.id === selectedPlot.cropId) : undefined;
  const ready = Boolean(selectedPlot?.readyAt && selectedPlot.readyAt <= now);
  return <><header><small>ПОЛЯ</small><h2>{selectedPlot ? `Грядка ${selectedPlot.id.replace(/\D/g, '') || selectedPlot.id}` : 'Выберите грядку'}</h2><p>{crop ? ready ? `${crop.name} созрела.` : `${crop.name} растёт ещё ${formatDuration((selectedPlot?.readyAt || now) - now)}.` : 'Свободная земля готова к посадке.'}</p></header>
    {selectedPlot?.cropId ? <button className="nova-farm-primary" type="button" disabled={!ready} onClick={onHarvest}><Wheat />{ready ? 'Собрать урожай' : 'Урожай растёт'}</button> : <button className="nova-farm-primary" type="button" onClick={() => onPlant()}><Leaf />Посадить выбранную культуру</button>}
    <section className="nova-farm-crops">{FARM_CROPS.map((item) => <button className={selectedCropId === item.id ? 'is-active' : ''} type="button" disabled={farm.level < item.level || farm.inventory[item.id] < 1} onClick={() => onSelectCrop(item.id)} key={item.id}><i style={{ '--crop-a': item.colors[0], '--crop-b': item.colors[1] } as React.CSSProperties} /><span><strong>{item.name}</strong><small>{formatDuration(item.growthMs)} · семян {farm.inventory[item.id]} · урожай +3</small></span>{farm.level < item.level ? <LockKeyhole /> : null}</button>)}</section></>;
}

function ProductionPanel({ farm, now, onProcess }: { farm: ModernFarmState; now: number; onProcess: (id: FarmRecipeId) => void }) {
  return <><header><small>ПЕРЕРАБОТКА</small><h2>Фермерские цеха</h2><p>Превращайте урожай в более ценные товары для заказов.</p></header>
    {FARM_BUILDINGS.filter((building) => building.id !== 'barn').map((building) => { const queue = farm.processes.filter((process) => FARM_RECIPES.find((recipe) => recipe.id === process.recipeId)?.building === building.id); const slots = farmProductionSlots(farm.buildingLevels[building.id]); return <section className="nova-farm-production-group" key={building.id}><h3>{building.name} <small>{queue.length}/{slots} слотов</small></h3>{queue.length ? <div className="nova-farm-queue">{queue.map((process) => { const recipe = FARM_RECIPES.find((item) => item.id === process.recipeId)!; return <article className={process.readyAt <= now ? 'is-ready' : ''} key={process.id}><Factory /><span><strong>{recipe.name}</strong><small>{process.readyAt <= now ? 'Готово, переносим в амбар' : formatDuration(process.readyAt - now)}</small></span></article>; })}</div> : null}<div className="nova-farm-recipes">{FARM_RECIPES.filter((recipe) => recipe.building === building.id).map((recipe) => { const installed = farm.buildingLevels[recipe.building] > 0; return <article key={recipe.id}><PackageOpen /><div><strong>{recipe.name}</strong><small>{ingredientText(recipe.ingredients)}</small><small>{formatDuration(recipe.durationMs)}</small></div><button type="button" disabled={!installed || farm.level < recipe.level || queue.length >= slots} onClick={() => onProcess(recipe.id)}>{installed ? 'Запустить' : `Ур. ${recipe.level}`}</button></article>; })}</div></section>; })}</>;
}

function OrdersPanel({ farm, onComplete }: { farm: ModernFarmState; onComplete: (id: string) => void }) {
  return <><header><small>ДОСТАВКА</small><h2>Доска заказов</h2><p>{isFarmHarvestDay(Date.now()) ? 'Сегодня День урожая: некоторые заказы дают на 20% больше монет.' : 'Соберите товары и отправьте грузовик клиенту.'}</p></header><section className="nova-farm-orders">{farm.orders.map((order) => { const ready = Object.entries(order.items).every(([id, amount]) => farm.inventory[id as FarmItemId] >= (amount || 0)); return <article className={ready ? 'is-ready' : ''} key={order.id}><header><strong>{order.title}</strong><span>{order.coins} мон. · {order.xp} XP</span></header><div>{Object.entries(order.items).map(([id, amount]) => <span key={id}>{farmItemName(id as FarmItemId)} <b>{farm.inventory[id as FarmItemId]}/{amount}</b></span>)}</div><button type="button" disabled={!ready} onClick={() => onComplete(order.id)}><Tractor />{ready ? 'Отправить заказ' : 'Соберите товары'}</button></article>; })}</section></>;
}

function BarnPanel({ farm, items, category, onCategory, onSell }: { farm: ModernFarmState; items: Array<[FarmItemId, number]>; category: FarmItemCategory; onCategory: (category: FarmItemCategory) => void; onSell: (id: FarmItemId) => void }) {
  const capacity = farmBarnCapacity(farm); const occupied = farmInventoryUsed(farm);
  const labels: Array<[FarmItemCategory, string]> = [['crops','Урожай'],['products','Товары'],['feed','Корм'],['materials','Материалы'],['fish','Рыба']];
  return <><header><small>ХРАНИЛИЩЕ</small><h2>Амбар</h2><p>{occupied} из {capacity} мест занято.</p><div className="nova-farm-capacity"><i style={{ width: `${clamp(occupied / capacity, 0, 1) * 100}%` }} /></div></header><div className="nova-farm-segments">{labels.map(([id,label])=><button className={category===id?'is-active':''} type="button" onClick={()=>onCategory(id)} key={id}>{label}</button>)}</div><section className="nova-farm-inventory">{items.length ? items.map(([id, amount]) => <article key={id}><i /><span><strong>{farmItemName(id)}</strong><small>В наличии: {amount}</small></span><button type="button" onClick={() => onSell(id)}>Продать 1</button></article>) : <p>В этой категории пока ничего нет.</p>}</section></>;
}

function AnimalsPanel({ farm, now, onBuy, onFeed, onCollect }: { farm: ModernFarmState; now: number; onBuy: (type: typeof FARM_ANIMALS[number]['id']) => void; onFeed: (id: string) => void; onCollect: (id: string) => void }) {
  return <><header><small>ЖИВОТНЫЕ</small><h2>Жители фермы</h2><p>Кормите животных и возвращайтесь за готовыми продуктами. Таймер работает и когда игра закрыта.</p></header><section className="nova-farm-animals">{farm.animals.map((animal,index)=>{const definition=FARM_ANIMALS.find((item)=>item.id===animal.type)!;const ready=Boolean(animal.readyAt&&animal.readyAt<=now);return <article key={animal.id}><PawPrint/><span><strong>{definition.name} {index+1}</strong><small>{ready?`${farmItemName(definition.productId)} готово`:animal.readyAt?`Осталось ${formatDuration(animal.readyAt-now)}`:`Нужен: ${farmItemName(definition.feedId)}`}</small></span><button type="button" onClick={()=>ready?onCollect(animal.id):onFeed(animal.id)}>{ready?'Собрать':animal.readyAt?'Ждём':'Покормить'}</button></article>})}</section><h3>Купить животное</h3><section className="nova-farm-shop">{FARM_ANIMALS.map((animal)=><article key={animal.id}><PawPrint/><span><strong>{animal.name}</strong><small>Уровень {animal.level} · {animal.cost} мон.</small></span><button type="button" disabled={farm.level<animal.level} onClick={()=>onBuy(animal.id)}>Купить</button></article>)}</section></>;
}

function GoalsPanel({ farm, now, onGoal, onDaily }: { farm: ModernFarmState; now: number; onGoal: (id: string) => void; onDaily: (id: string) => void }) {
  return <><header><small>ПРОГРЕСС</small><h2>Цели и задания</h2><p>{isFarmHarvestDay(now)?'Событие «День урожая» активно до конца локального дня.':'Новые короткие задания появляются по локальной дате.'}</p></header><h3>Ежедневные задания</h3><section className="nova-farm-goals">{farm.daily.tasks.map((task)=>{const value=farmDailyProgress(farm,task);const ready=value>=task.target;return <article key={task.id}><Target/><span><strong>{task.title}</strong><small>{Math.min(value,task.target)}/{task.target} · {task.coins} мон. · {task.xp} XP</small></span><button type="button" disabled={!ready||task.claimed} onClick={()=>onDaily(task.id)}>{task.claimed?'Получено':'Забрать'}</button></article>})}</section><h3>Долгие цели</h3><section className="nova-farm-goals">{FARM_GOALS.map((goal)=>{const progress=farmGoalProgress(farm,goal.id);const claimed=farm.claimedGoals.includes(goal.id);return <article key={goal.id}><Sparkles/><span><strong>{goal.title}</strong><small>{Math.min(progress.value,progress.target)}/{progress.target} · {goal.coins} мон. · {goal.xp} XP</small></span><button type="button" disabled={progress.value<progress.target||claimed} onClick={()=>onGoal(goal.id)}>{claimed?'Получено':'Забрать'}</button></article>})}</section></>;
}

function ZonesPanel({ farm, onUnlock, onUpgrade }: { farm: ModernFarmState; onUnlock: (id: FarmZoneId) => void; onUpgrade: (building: keyof ModernFarmState['buildingLevels']) => void }) {
  return <><header><small>РАЗВИТИЕ</small><h2>Карта фермы</h2><p>Открывайте новые территории и улучшайте производственные слоты.</p></header><section className="nova-farm-zones">{FARM_ZONES.map((zone) => { const open = farm.unlockedZones.includes(zone.id); return <article className={open ? 'is-open' : ''} key={zone.id}><MapIcon /><span><strong>{zone.name}</strong><small>{open ? 'Открыто' : `Уровень ${zone.level} · ${zone.cost} мон.`}</small></span>{open ? <Leaf /> : <button type="button" onClick={() => onUnlock(zone.id)}>Открыть</button>}</article>; })}</section><section className="nova-farm-upgrades"><h3>Здания</h3>{FARM_BUILDINGS.map((definition) => { const building=definition.id as FarmBuildingId; const level = farm.buildingLevels[building]; const cost=level===0?180:180*(level+1); return <article key={building}><Factory /><span><strong>{definition.name}</strong><small>Уровень {level} · {cost} мон. · {building==='barn'?`${farmBarnCapacity(farm)} мест`:`${farmProductionSlots(level)} слотов`}</small></span><button type="button" disabled={level >= 5} onClick={() => onUpgrade(building)}>{level >= 5 ? 'Максимум' : 'Улучшить'}</button></article>; })}</section></>;
}

function SettingsPanel({ farm, playTime, lowPowerMode, onRename, onSetting, onDecoration, onFish, onExport, onImport, onScreenshot, onReset }: { farm: ModernFarmState; playTime: number; lowPowerMode: boolean; onRename: (name: string) => void; onSetting: (patch: Partial<ModernFarmState['settings']>) => void; onDecoration: (id: string) => void; onFish: () => void; onExport: () => void; onImport: () => void; onScreenshot: () => void; onReset: () => void }) {
  const [name,setName]=useState(farm.farmName); const minutes=Math.floor(playTime/60);
  return <><header><small>ПРОФИЛЬ</small><h2>{farm.farmName}</h2><p>Уровень {farm.level} · собрано {farm.harvested} · выполнено заказов {farm.fulfilledOrders} · в игре {minutes} мин.</p></header><form className="nova-farm-name" onSubmit={(event)=>{event.preventDefault();onRename(name)}}><label>Название фермы<input value={name} maxLength={32} onChange={(event)=>setName(event.target.value)}/></label><button type="submit">Сохранить</button></form><h3>Качество и отклик</h3><section className="nova-farm-settings"><label>Качество<select value={lowPowerMode?'low':farm.settings.quality} disabled={lowPowerMode} onChange={(event)=>onSetting({quality:event.target.value as ModernFarmState['settings']['quality']})}><option value="auto">Авто</option><option value="low">Низкое</option><option value="medium">Среднее</option><option value="high">Высокое</option></select></label><label className="nova-farm-toggle"><input type="checkbox" checked={false} disabled/><span>Музыка · оригинальная дорожка пока не подключена</span></label>{([['sounds','Звуки интерфейса'],['haptics','Тактильный отклик'],['reducedEffects','Уменьшить эффекты'],['confirmDestructive','Подтверждать удаление']] as const).map(([key,label])=><label className="nova-farm-toggle" key={key}><input type="checkbox" checked={farm.settings[key]} onChange={(event)=>onSetting({[key]:event.target.checked})}/><span>{label}</span></label>)}</section>{lowPowerMode?<p className="nova-farm-note">В Modern OS включён режим низкого энергопотребления: ферма использует облегчённую графику.</p>:null}<h3>Магазин декораций</h3><section className="nova-farm-shop">{FARM_DECORATIONS.map((item)=><article key={item.id}><Sparkles/><span><strong>{item.name}</strong><small>{item.cost} мон. · уровень {item.level}</small></span><button type="button" disabled={farm.decorations.includes(item.id)} onClick={()=>onDecoration(item.id)}>{farm.decorations.includes(item.id)?'Куплено':'Купить'}</button></article>)}</section>{farm.unlockedZones.includes('fishing')?<button className="nova-farm-primary" type="button" onClick={onFish}><Fish/>Порыбачить</button>:null}<h3>Данные фермы</h3><div className="nova-farm-file-actions"><button type="button" onClick={onScreenshot}><Camera/>Снимок PNG</button><button type="button" onClick={onExport}><Download/>Экспорт JSON</button><button type="button" onClick={onImport}><Upload/>Импорт</button><button className="is-danger" type="button" onClick={onReset}><X/>Сбросить ферму</button></div></>;
}
