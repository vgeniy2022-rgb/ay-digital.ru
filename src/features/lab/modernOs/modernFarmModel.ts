export type FarmCropId = 'wheat' | 'corn' | 'carrot' | 'soy' | 'sugarcane' | 'strawberry' | 'tomato' | 'potato' | 'pumpkin' | 'sunflower';
export type FarmProductId = 'flour' | 'cornmeal' | 'sugar' | 'tomato-juice' | 'harvest-box' | 'bread' | 'egg' | 'milk';
export type FarmFeedId = 'chicken-feed' | 'cow-feed';
export type FarmMaterialId = 'wood';
export type FarmFishId = 'river-fish';
export type FarmItemId = FarmCropId | FarmProductId | FarmFeedId | FarmMaterialId | FarmFishId;
export type FarmRecipeId = Exclude<FarmProductId, 'egg' | 'milk'> | FarmFeedId;
export type FarmZoneId = 'farm' | 'market' | 'orchard' | 'river' | 'fishing' | 'pier' | 'north-land';
export type FarmAnimalType = 'chicken' | 'cow';
export type FarmBuildingId = 'mill' | 'press' | 'workshop' | 'barn';
export type FarmQuality = 'auto' | 'low' | 'medium' | 'high';
export type FarmItemCategory = 'crops' | 'products' | 'feed' | 'materials' | 'fish' | 'other';

export type FarmCropDefinition = { id: FarmCropId; name: string; growthMs: number; sellPrice: number; level: number; colors: [string, string] };
export type FarmRecipeDefinition = { id: FarmRecipeId; name: string; building: Exclude<FarmBuildingId, 'barn'>; durationMs: number; level: number; ingredients: Partial<Record<FarmItemId, number>> };
export type FarmAnimalDefinition = { id: FarmAnimalType; name: string; level: number; cost: number; zone: FarmZoneId; feedId: FarmFeedId; productId: Extract<FarmProductId, 'egg' | 'milk'>; durationMs: number };
export type FarmPlot = { id: string; x: number; y: number; cropId?: FarmCropId; plantedAt?: number; readyAt?: number };
export type FarmProcess = { id: string; recipeId: FarmRecipeId; startedAt: number; readyAt: number };
export type FarmAnimal = { id: string; type: FarmAnimalType; fedAt?: number; readyAt?: number };
export type FarmOrder = { id: string; title: string; items: Partial<Record<FarmItemId, number>>; coins: number; xp: number; completed: boolean; event?: boolean };
export type FarmDailyTask = { id: string; title: string; kind: 'harvest' | 'produce' | 'orders'; target: number; startValue: number; coins: number; xp: number; claimed: boolean };
export type FarmSettings = { music: boolean; sounds: boolean; haptics: boolean; reducedEffects: boolean; quality: FarmQuality; confirmDestructive: boolean };

export type ModernFarmState = {
  version: 2;
  farmName: string;
  coins: number;
  xp: number;
  level: number;
  inventory: Record<FarmItemId, number>;
  plots: FarmPlot[];
  processes: FarmProcess[];
  animals: FarmAnimal[];
  orders: FarmOrder[];
  unlockedZones: FarmZoneId[];
  buildingLevels: Record<FarmBuildingId, number>;
  harvested: number;
  harvestByCrop: Record<FarmCropId, number>;
  produced: number;
  producedByItem: Partial<Record<FarmItemId, number>>;
  fulfilledOrders: number;
  claimedGoals: string[];
  daily: { date: string; tasks: FarmDailyTask[] };
  decorations: string[];
  fishingReadyAt: number;
  settings: FarmSettings;
  lastUpdatedAt: number;
};

export const FARM_CROPS: FarmCropDefinition[] = [
  { id: 'wheat', name: 'Пшеница', growthMs: 20_000, sellPrice: 4, level: 1, colors: ['#f6d65b', '#c89527'] },
  { id: 'corn', name: 'Кукуруза', growthMs: 60_000, sellPrice: 9, level: 1, colors: ['#ffe66c', '#55a94b'] },
  { id: 'carrot', name: 'Морковь', growthMs: 100_000, sellPrice: 10, level: 1, colors: ['#ff8b3d', '#49a85c'] },
  { id: 'soy', name: 'Соя', growthMs: 90_000, sellPrice: 13, level: 2, colors: ['#b9d76a', '#4f9a4d'] },
  { id: 'sugarcane', name: 'Сахарный тростник', growthMs: 120_000, sellPrice: 18, level: 3, colors: ['#bde879', '#3f8e58'] },
  { id: 'potato', name: 'Картофель', growthMs: 120_000, sellPrice: 19, level: 3, colors: ['#c99a58', '#5e9f51'] },
  { id: 'tomato', name: 'Томат', growthMs: 150_000, sellPrice: 25, level: 4, colors: ['#f25d4b', '#45964e'] },
  { id: 'strawberry', name: 'Клубника', growthMs: 300_000, sellPrice: 31, level: 5, colors: ['#ef4261', '#65ae51'] },
  { id: 'sunflower', name: 'Подсолнечник', growthMs: 210_000, sellPrice: 38, level: 6, colors: ['#ffd84e', '#72502b'] },
  { id: 'pumpkin', name: 'Тыква', growthMs: 240_000, sellPrice: 45, level: 7, colors: ['#f79232', '#458b47'] },
];

export const FARM_RECIPES: FarmRecipeDefinition[] = [
  { id: 'flour', name: 'Мука', building: 'mill', durationMs: 15_000, level: 1, ingredients: { wheat: 2 } },
  { id: 'chicken-feed', name: 'Корм для кур', building: 'mill', durationMs: 18_000, level: 1, ingredients: { wheat: 1, corn: 1 } },
  { id: 'cornmeal', name: 'Кукурузная крупа', building: 'mill', durationMs: 22_000, level: 2, ingredients: { corn: 2 } },
  { id: 'cow-feed', name: 'Корм для коров', building: 'mill', durationMs: 25_000, level: 2, ingredients: { soy: 1, corn: 1 } },
  { id: 'sugar', name: 'Сахар', building: 'press', durationMs: 28_000, level: 3, ingredients: { sugarcane: 2 } },
  { id: 'tomato-juice', name: 'Томатный сок', building: 'press', durationMs: 34_000, level: 4, ingredients: { tomato: 2 } },
  { id: 'bread', name: 'Хлеб', building: 'workshop', durationMs: 30_000, level: 3, ingredients: { flour: 1, wheat: 1 } },
  { id: 'harvest-box', name: 'Фермерский набор', building: 'workshop', durationMs: 42_000, level: 5, ingredients: { carrot: 2, strawberry: 1, sunflower: 1 } },
];

export const FARM_ANIMALS: FarmAnimalDefinition[] = [
  { id: 'chicken', name: 'Курица', level: 2, cost: 120, zone: 'farm', feedId: 'chicken-feed', productId: 'egg', durationMs: 45_000 },
  { id: 'cow', name: 'Корова', level: 4, cost: 360, zone: 'orchard', feedId: 'cow-feed', productId: 'milk', durationMs: 90_000 },
];

export const FARM_BUILDINGS: Array<{ id: FarmBuildingId; name: string; level: number }> = [
  { id: 'mill', name: 'Мельница', level: 1 }, { id: 'press', name: 'Пресс', level: 3 }, { id: 'workshop', name: 'Пекарня', level: 3 }, { id: 'barn', name: 'Амбар', level: 1 },
];

export const FARM_ZONES: Array<{ id: FarmZoneId; name: string; level: number; cost: number }> = [
  { id: 'farm', name: 'Основная ферма', level: 1, cost: 0 }, { id: 'market', name: 'Рынок', level: 2, cost: 220 },
  { id: 'orchard', name: 'Сад', level: 3, cost: 380 }, { id: 'river', name: 'Река', level: 4, cost: 520 },
  { id: 'fishing', name: 'Рыбалка', level: 6, cost: 760 }, { id: 'pier', name: 'Пристань', level: 8, cost: 1100 },
  { id: 'north-land', name: 'Новые земли', level: 10, cost: 1600 },
];

export const FARM_DECORATIONS = [
  { id: 'flower-bed', name: 'Цветочная клумба', cost: 75, level: 1 },
  { id: 'windmill', name: 'Декоративный ветряк', cost: 240, level: 3 },
  { id: 'harvest-flag', name: 'Флаг урожая', cost: 160, level: 2 },
] as const;

export const FARM_GOALS = [
  { id: 'wheat-30', title: 'Соберите 30 пшеницы', coins: 120, xp: 70 },
  { id: 'bread-5', title: 'Испеките 5 хлебов', coins: 210, xp: 110 },
  { id: 'first-cow', title: 'Купите первую корову', coins: 180, xp: 100 },
  { id: 'open-orchard', title: 'Откройте сад', coins: 150, xp: 90 },
] as const;

export const FARM_ITEM_CATEGORY: Record<FarmItemId, FarmItemCategory> = {
  wheat: 'crops', corn: 'crops', carrot: 'crops', soy: 'crops', sugarcane: 'crops', strawberry: 'crops', tomato: 'crops', potato: 'crops', pumpkin: 'crops', sunflower: 'crops',
  flour: 'products', cornmeal: 'products', sugar: 'products', 'tomato-juice': 'products', 'harvest-box': 'products', bread: 'products', egg: 'products', milk: 'products',
  'chicken-feed': 'feed', 'cow-feed': 'feed', wood: 'materials', 'river-fish': 'fish',
};

const itemNames: Record<FarmItemId, string> = {
  ...Object.fromEntries(FARM_CROPS.map((crop) => [crop.id, crop.name])),
  ...Object.fromEntries(FARM_RECIPES.map((recipe) => [recipe.id, recipe.name])),
  egg: 'Яйцо', milk: 'Молоко', wood: 'Доски', 'river-fish': 'Речная рыба',
} as Record<FarmItemId, string>;
export const farmItemName = (id: FarmItemId) => itemNames[id];

const allItems = Object.keys(FARM_ITEM_CATEGORY) as FarmItemId[];
const allCrops = FARM_CROPS.map((crop) => crop.id);
const emptyInventory = () => Object.fromEntries(allItems.map((id) => [id, 0])) as Record<FarmItemId, number>;
const emptyHarvests = () => Object.fromEntries(allCrops.map((id) => [id, 0])) as Record<FarmCropId, number>;
const initialPlots = (): FarmPlot[] => Array.from({ length: 12 }, (_, index) => ({ id: `plot-${index + 1}`, x: 3 + index % 4, y: 4 + Math.floor(index / 4) }));
const initialOrders = (): FarmOrder[] => [
  { id: 'order-bakery', title: 'Городская пекарня', items: { wheat: 3, corn: 2 }, coins: 95, xp: 34, completed: false },
  { id: 'order-cafe', title: 'Кафе у набережной', items: { carrot: 2, flour: 1 }, coins: 145, xp: 48, completed: false },
  { id: 'order-market', title: 'Утренний рынок', items: { cornmeal: 1, soy: 2 }, coins: 210, xp: 68, completed: false },
];
const defaultSettings = (): FarmSettings => ({ music: false, sounds: true, haptics: true, reducedEffects: false, quality: 'auto', confirmDestructive: true });
const dateKey = (now: number) => new Date(now).toISOString().slice(0, 10);

export function farmLevelFromXp(xp: number) { return Math.max(1, Math.min(30, Math.floor(Math.sqrt(Math.max(0, xp) / 85)) + 1)); }
export function farmXpForNextLevel(level: number) { return Math.max(85, level * level * 85); }
export function farmBarnCapacity(state: Pick<ModernFarmState, 'buildingLevels'>) { return 60 + Math.max(0, state.buildingLevels.barn - 1) * 30; }
export function farmInventoryUsed(state: Pick<ModernFarmState, 'inventory'>) { return Object.values(state.inventory).reduce((sum, amount) => sum + amount, 0); }
export function farmProductionSlots(level: number) { return Math.min(5, Math.max(0, level) + 1); }
export function farmWeatherForDate(now: number) { const day = Number(dateKey(now).replace(/-/g, '')); return day % 4 === 0 ? 'rain' as const : 'sunny' as const; }
export function isFarmHarvestDay(now: number) { return new Date(now).getDate() % 5 === 0; }

function dailyValue(state: ModernFarmState, kind: FarmDailyTask['kind']) { return kind === 'harvest' ? state.harvested : kind === 'produce' ? state.produced : state.fulfilledOrders; }
function createDaily(state: Pick<ModernFarmState, 'harvested' | 'produced' | 'fulfilledOrders'>, now: number) {
  return { date: dateKey(now), tasks: [
    { id: `harvest-${dateKey(now)}`, title: 'Соберите 9 единиц урожая', kind: 'harvest' as const, target: 9, startValue: state.harvested, coins: 45, xp: 20, claimed: false },
    { id: `produce-${dateKey(now)}`, title: 'Произведите 2 товара', kind: 'produce' as const, target: 2, startValue: state.produced, coins: 60, xp: 28, claimed: false },
    { id: `orders-${dateKey(now)}`, title: 'Выполните 1 заказ', kind: 'orders' as const, target: 1, startValue: state.fulfilledOrders, coins: 75, xp: 35, claimed: false },
  ] };
}

export function createDefaultFarmState(now = Date.now()): ModernFarmState {
  const inventory = emptyInventory(); inventory.wheat = 4; inventory.corn = 3; inventory.carrot = 3; inventory.wood = 3;
  const base = { harvested: 0, produced: 0, fulfilledOrders: 0 };
  return { version: 2, farmName: 'SITEVL FARM', coins: 350, xp: 0, level: 1, inventory, plots: initialPlots(), processes: [], animals: [], orders: initialOrders(), unlockedZones: ['farm'], buildingLevels: { mill: 1, press: 0, workshop: 0, barn: 1 }, harvested: 0, harvestByCrop: emptyHarvests(), produced: 0, producedByItem: {}, fulfilledOrders: 0, claimedGoals: [], daily: createDaily(base, now), decorations: [], fishingReadyAt: 0, settings: defaultSettings(), lastUpdatedAt: now };
}

const finite = (value: unknown, fallback: number, min = 0, max = 1_000_000) => typeof value === 'number' && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
const knownItemEntries = (value: unknown) => {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return Object.fromEntries(Object.entries(source).filter(([id, amount]) => allItems.includes(id as FarmItemId) && typeof amount === 'number' && Number.isFinite(amount) && amount >= 0)) as Partial<Record<FarmItemId, number>>;
};

export function normalizeFarmState(value: unknown, now = Date.now()): ModernFarmState {
  const fallback = createDefaultFarmState(now); if (!value || typeof value !== 'object') return fallback;
  const raw = value as Partial<ModernFarmState> & { version?: number }; const inventory = emptyInventory(); const rawInventory = knownItemEntries(raw.inventory);
  allItems.forEach((id) => { inventory[id] = finite(rawInventory[id], fallback.inventory[id], 0, 100_000); });
  const plots = Array.isArray(raw.plots) ? raw.plots.filter((plot): plot is FarmPlot => Boolean(plot && typeof plot.id === 'string' && typeof plot.x === 'number' && typeof plot.y === 'number')).slice(0, 60).map((plot) => ({ id: plot.id, x: finite(plot.x, 0, -20, 40), y: finite(plot.y, 0, -20, 40), cropId: FARM_CROPS.some((crop) => crop.id === plot.cropId) ? plot.cropId : undefined, plantedAt: finite(plot.plantedAt, 0, 0, 9e15) || undefined, readyAt: finite(plot.readyAt, 0, 0, 9e15) || undefined })) : fallback.plots;
  const processes = Array.isArray(raw.processes) ? raw.processes.filter((process): process is FarmProcess => Boolean(process && FARM_RECIPES.some((recipe) => recipe.id === process.recipeId) && typeof process.readyAt === 'number')).slice(0, 24).map((process) => ({ id: String(process.id), recipeId: process.recipeId, startedAt: finite(process.startedAt, now, 0, 9e15), readyAt: finite(process.readyAt, now, 0, 9e15) })) : [];
  const animals = Array.isArray(raw.animals) ? raw.animals.filter((animal): animal is FarmAnimal => Boolean(animal && FARM_ANIMALS.some((item) => item.id === animal.type) && typeof animal.id === 'string')).slice(0, 12).map((animal) => ({ id: animal.id, type: animal.type, fedAt: finite(animal.fedAt, 0, 0, 9e15) || undefined, readyAt: finite(animal.readyAt, 0, 0, 9e15) || undefined })) : [];
  const orders = Array.isArray(raw.orders) ? raw.orders.filter((order): order is FarmOrder => Boolean(order && typeof order.id === 'string' && typeof order.title === 'string')).slice(0, 12).map((order) => ({ id: order.id, title: order.title, items: knownItemEntries(order.items), coins: finite(order.coins, 80, 0, 100_000), xp: finite(order.xp, 25, 0, 100_000), completed: Boolean(order.completed), event: Boolean(order.event) })) : fallback.orders;
  const unlockedZones: FarmZoneId[] = Array.isArray(raw.unlockedZones) ? FARM_ZONES.map((zone) => zone.id).filter((id) => raw.unlockedZones?.includes(id)) : ['farm']; if (!unlockedZones.includes('farm')) unlockedZones.unshift('farm');
  const harvestByCrop = emptyHarvests(); allCrops.forEach((id) => { harvestByCrop[id] = finite(raw.harvestByCrop?.[id], 0, 0, 1_000_000); });
  const producedByItem = knownItemEntries(raw.producedByItem); const xp = finite(raw.xp, 0); const level = farmLevelFromXp(xp);
  const buildingLevels: Record<FarmBuildingId, number> = { mill: finite(raw.buildingLevels?.mill, 1, 1, 5), press: finite(raw.buildingLevels?.press, 0, 0, 5), workshop: finite(raw.buildingLevels?.workshop, 0, 0, 5), barn: finite(raw.buildingLevels?.barn, 1, 1, 5) };
  const settings: FarmSettings = { music: Boolean(raw.settings?.music), sounds: raw.settings?.sounds !== false, haptics: raw.settings?.haptics !== false, reducedEffects: Boolean(raw.settings?.reducedEffects), quality: ['auto', 'low', 'medium', 'high'].includes(String(raw.settings?.quality)) ? raw.settings!.quality : 'auto', confirmDestructive: raw.settings?.confirmDestructive !== false };
  const harvested = finite(raw.harvested, 0); const produced = finite(raw.produced, 0); const fulfilledOrders = finite(raw.fulfilledOrders, 0);
  const dailySource = raw.daily?.date === dateKey(now) && Array.isArray(raw.daily.tasks) ? raw.daily : createDaily({ harvested, produced, fulfilledOrders }, now);
  const daily = { date: dateKey(now), tasks: dailySource.tasks.filter((task) => task && ['harvest', 'produce', 'orders'].includes(task.kind)).slice(0, 3).map((task) => ({ id: String(task.id), title: String(task.title), kind: task.kind, target: finite(task.target, 1, 1, 1000), startValue: finite(task.startValue, 0), coins: finite(task.coins, 40), xp: finite(task.xp, 20), claimed: Boolean(task.claimed) })) };
  return { version: 2, farmName: typeof raw.farmName === 'string' && raw.farmName.trim() ? raw.farmName.trim().slice(0, 32) : fallback.farmName, coins: finite(raw.coins, fallback.coins), xp, level, inventory, plots: plots.length ? plots : fallback.plots, processes, animals, orders: orders.length ? orders : fallback.orders, unlockedZones, buildingLevels, harvested, harvestByCrop, produced, producedByItem, fulfilledOrders, claimedGoals: Array.isArray(raw.claimedGoals) ? raw.claimedGoals.filter((id): id is string => typeof id === 'string' && FARM_GOALS.some((goal) => goal.id === id)) : [], daily, decorations: Array.isArray(raw.decorations) ? raw.decorations.filter((id): id is string => typeof id === 'string' && FARM_DECORATIONS.some((item) => item.id === id)) : [], fishingReadyAt: finite(raw.fishingReadyAt, 0, 0, 9e15), settings, lastUpdatedAt: now };
}

const hasItems = (inventory: Record<FarmItemId, number>, items: Partial<Record<FarmItemId, number>>) => Object.entries(items).every(([id, count]) => inventory[id as FarmItemId] >= (count || 0));
const spendItems = (inventory: Record<FarmItemId, number>, items: Partial<Record<FarmItemId, number>>) => { const next = { ...inventory }; Object.entries(items).forEach(([id, count]) => { next[id as FarmItemId] -= count || 0; }); return next; };
const addXp = (state: ModernFarmState, xpAdded: number) => { const xp = state.xp + xpAdded; return { xp, level: farmLevelFromXp(xp) }; };

export function advanceFarm(state: ModernFarmState, now = Date.now()): ModernFarmState {
  let remainingCapacity = farmBarnCapacity(state) - farmInventoryUsed(state); if (remainingCapacity <= 0) return { ...state, lastUpdatedAt: now };
  const inventory = { ...state.inventory }; const producedByItem = { ...state.producedByItem }; let produced = state.produced; const pending: FarmProcess[] = [];
  state.processes.forEach((process) => { if (process.readyAt <= now && remainingCapacity > 0) { inventory[process.recipeId] += 1; producedByItem[process.recipeId] = (producedByItem[process.recipeId] || 0) + 1; produced += 1; remainingCapacity -= 1; } else pending.push(process); });
  if (pending.length === state.processes.length) return { ...state, lastUpdatedAt: now };
  return { ...state, inventory, producedByItem, produced, processes: pending, lastUpdatedAt: now };
}

export function plantFarmPlot(state: ModernFarmState, plotId: string, cropId: FarmCropId, now = Date.now()): ModernFarmState {
  const crop = FARM_CROPS.find((item) => item.id === cropId); const plot = state.plots.find((item) => item.id === plotId);
  if (!crop || !plot || plot.cropId || crop.level > state.level || state.inventory[cropId] < 1) return state;
  return { ...state, inventory: { ...state.inventory, [cropId]: state.inventory[cropId] - 1 }, plots: state.plots.map((item) => item.id === plotId ? { ...item, cropId, plantedAt: now, readyAt: now + crop.growthMs } : item), lastUpdatedAt: now };
}

export function harvestFarmPlot(state: ModernFarmState, plotId: string, now = Date.now()): ModernFarmState {
  const plot = state.plots.find((item) => item.id === plotId); if (!plot?.cropId || !plot.readyAt || plot.readyAt > now || farmInventoryUsed(state) + 3 > farmBarnCapacity(state)) return state;
  const inventory = { ...state.inventory }; inventory[plot.cropId] += 3; const reward = addXp(state, 8); const harvestByCrop = { ...state.harvestByCrop, [plot.cropId]: state.harvestByCrop[plot.cropId] + 3 };
  return { ...state, ...reward, inventory, harvestByCrop, plots: state.plots.map((item) => item.id === plotId ? { id: item.id, x: item.x, y: item.y } : item), harvested: state.harvested + 3, lastUpdatedAt: now };
}

export function queueFarmRecipe(state: ModernFarmState, recipeId: FarmRecipeId, now = Date.now()): ModernFarmState {
  const current = advanceFarm(state, now); const recipe = FARM_RECIPES.find((item) => item.id === recipeId); if (!recipe || recipe.level > current.level || current.buildingLevels[recipe.building] < 1) return current;
  const buildingQueue = current.processes.filter((process) => FARM_RECIPES.find((item) => item.id === process.recipeId)?.building === recipe.building); if (buildingQueue.length >= farmProductionSlots(current.buildingLevels[recipe.building]) || !hasItems(current.inventory, recipe.ingredients)) return current;
  const speed = current.buildingLevels[recipe.building] >= 3 ? 1.2 + (current.buildingLevels[recipe.building] - 3) * .12 : 1;
  return { ...current, inventory: spendItems(current.inventory, recipe.ingredients), processes: [...current.processes, { id: `process-${now}-${recipeId}`, recipeId, startedAt: now, readyAt: now + recipe.durationMs / speed }], lastUpdatedAt: now };
}

function replacementOrder(state: ModernFarmState, now: number): FarmOrder {
  const pool = [
    { level: 1, title: 'Отель «Маяк»', items: { wheat: 3, carrot: 2 } },
    { level: 2, title: 'Семейная пекарня', items: { flour: 1, corn: 2 } },
    { level: 3, title: 'Портовый рынок', items: { bread: 1, soy: 2 } },
    { level: 4, title: 'Кафе «Волна»', items: { 'tomato-juice': 1, egg: 1 } },
  ].filter((template) => template.level <= state.level);
  const template = pool[state.fulfilledOrders % pool.length]; const event = isFarmHarvestDay(now) && state.fulfilledOrders % 3 === 2;
  return { id: `order-${now}`, title: event ? `День урожая · ${template.title}` : template.title, items: template.items, coins: Math.round((120 + state.level * 24) * (event ? 1.2 : 1)), xp: 35 + state.level * 8, completed: false, event };
}

export function fulfillFarmOrder(state: ModernFarmState, orderId: string, now = Date.now()): ModernFarmState {
  const current = advanceFarm(state, now); const order = current.orders.find((item) => item.id === orderId); if (!order || order.completed || !hasItems(current.inventory, order.items)) return current;
  const reward = addXp(current, order.xp); return { ...current, ...reward, inventory: spendItems(current.inventory, order.items), coins: current.coins + order.coins, orders: [...current.orders.filter((item) => item.id !== orderId), replacementOrder(current, now)].slice(-3), fulfilledOrders: current.fulfilledOrders + 1, lastUpdatedAt: now };
}

export function unlockFarmZone(state: ModernFarmState, zoneId: FarmZoneId, now = Date.now()): ModernFarmState {
  const zone = FARM_ZONES.find((item) => item.id === zoneId); if (!zone || state.unlockedZones.includes(zoneId) || state.level < zone.level || state.coins < zone.cost) return state;
  const extraPlots = zoneId === 'north-land' ? Array.from({ length: 8 }, (_, index) => ({ id: `north-${index + 1}`, x: 10 + index % 4, y: 3 + Math.floor(index / 4) })) : [];
  return { ...state, coins: state.coins - zone.cost, unlockedZones: [...state.unlockedZones, zoneId], plots: [...state.plots, ...extraPlots], lastUpdatedAt: now };
}

export function upgradeFarmBuilding(state: ModernFarmState, building: FarmBuildingId, now = Date.now()): ModernFarmState {
  const level = state.buildingLevels[building]; const definition = FARM_BUILDINGS.find((item) => item.id === building)!; const nextLevel = level === 0 ? 1 : level + 1; const cost = level === 0 ? 180 : 180 * nextLevel;
  if (level >= 5 || state.level < definition.level || state.coins < cost) return state;
  return { ...state, coins: state.coins - cost, buildingLevels: { ...state.buildingLevels, [building]: nextLevel }, lastUpdatedAt: now };
}

export function sellFarmItem(state: ModernFarmState, itemId: FarmItemId, amount = 1, now = Date.now()): ModernFarmState {
  if (state.inventory[itemId] < amount || amount <= 0) return state;
  const crop = FARM_CROPS.find((item) => item.id === itemId); if (crop && state.inventory[itemId] - amount < 1 && !state.plots.some((plot) => plot.cropId === itemId)) return state;
  const value = crop?.sellPrice || (itemId === 'egg' ? 18 : itemId === 'milk' ? 35 : itemId === 'river-fish' ? 42 : 28);
  return { ...state, coins: state.coins + value * amount, inventory: { ...state.inventory, [itemId]: state.inventory[itemId] - amount }, lastUpdatedAt: now };
}

export function buyFarmAnimal(state: ModernFarmState, type: FarmAnimalType, now = Date.now()): ModernFarmState {
  const definition = FARM_ANIMALS.find((animal) => animal.id === type); if (!definition || state.level < definition.level || state.coins < definition.cost || !state.unlockedZones.includes(definition.zone) || state.animals.length >= 8) return state;
  return { ...state, coins: state.coins - definition.cost, animals: [...state.animals, { id: `${type}-${now}-${state.animals.length}`, type }], lastUpdatedAt: now };
}

export function feedFarmAnimal(state: ModernFarmState, animalId: string, now = Date.now()): ModernFarmState {
  const animal = state.animals.find((item) => item.id === animalId); const definition = FARM_ANIMALS.find((item) => item.id === animal?.type); if (!animal || !definition || animal.readyAt || state.inventory[definition.feedId] < 1) return state;
  return { ...state, inventory: { ...state.inventory, [definition.feedId]: state.inventory[definition.feedId] - 1 }, animals: state.animals.map((item) => item.id === animalId ? { ...item, fedAt: now, readyAt: now + definition.durationMs } : item), lastUpdatedAt: now };
}

export function collectFarmAnimal(state: ModernFarmState, animalId: string, now = Date.now()): ModernFarmState {
  const animal = state.animals.find((item) => item.id === animalId); const definition = FARM_ANIMALS.find((item) => item.id === animal?.type); if (!animal || !definition || !animal.readyAt || animal.readyAt > now || farmInventoryUsed(state) >= farmBarnCapacity(state)) return state;
  const reward = addXp(state, 6); return { ...state, ...reward, inventory: { ...state.inventory, [definition.productId]: state.inventory[definition.productId] + 1 }, animals: state.animals.map((item) => item.id === animalId ? { id: item.id, type: item.type } : item), lastUpdatedAt: now };
}

export function catchFarmFish(state: ModernFarmState, now = Date.now()): ModernFarmState {
  if (!state.unlockedZones.includes('fishing') || state.fishingReadyAt > now || farmInventoryUsed(state) >= farmBarnCapacity(state)) return state;
  const reward = addXp(state, 5); return { ...state, ...reward, inventory: { ...state.inventory, 'river-fish': state.inventory['river-fish'] + 1 }, fishingReadyAt: now + 30_000, lastUpdatedAt: now };
}

export function buyFarmDecoration(state: ModernFarmState, decorationId: string, now = Date.now()): ModernFarmState {
  const decoration = FARM_DECORATIONS.find((item) => item.id === decorationId); if (!decoration || state.decorations.includes(decorationId) || state.level < decoration.level || state.coins < decoration.cost) return state;
  return { ...state, coins: state.coins - decoration.cost, decorations: [...state.decorations, decorationId], lastUpdatedAt: now };
}

export function farmGoalProgress(state: ModernFarmState, id: string) {
  if (id === 'wheat-30') return { value: state.harvestByCrop.wheat, target: 30 };
  if (id === 'bread-5') return { value: state.producedByItem.bread || 0, target: 5 };
  if (id === 'first-cow') return { value: state.animals.some((animal) => animal.type === 'cow') ? 1 : 0, target: 1 };
  return { value: state.unlockedZones.includes('orchard') ? 1 : 0, target: 1 };
}

export function claimFarmGoal(state: ModernFarmState, id: string, now = Date.now()): ModernFarmState {
  const goal = FARM_GOALS.find((item) => item.id === id); const progress = farmGoalProgress(state, id); if (!goal || state.claimedGoals.includes(id) || progress.value < progress.target) return state;
  const reward = addXp(state, goal.xp); return { ...state, ...reward, coins: state.coins + goal.coins, claimedGoals: [...state.claimedGoals, id], lastUpdatedAt: now };
}

export function farmDailyProgress(state: ModernFarmState, task: FarmDailyTask) { return Math.max(0, dailyValue(state, task.kind) - task.startValue); }
export function claimFarmDaily(state: ModernFarmState, taskId: string, now = Date.now()): ModernFarmState {
  const current = normalizeFarmState(state, now); const task = current.daily.tasks.find((item) => item.id === taskId); if (!task || task.claimed || farmDailyProgress(current, task) < task.target) return current;
  const reward = addXp(current, task.xp); return { ...current, ...reward, coins: current.coins + task.coins, daily: { ...current.daily, tasks: current.daily.tasks.map((item) => item.id === taskId ? { ...item, claimed: true } : item) }, lastUpdatedAt: now };
}

export function renameFarm(state: ModernFarmState, name: string, now = Date.now()): ModernFarmState { const clean = name.trim().replace(/[<>]/g, '').slice(0, 32); return clean ? { ...state, farmName: clean, lastUpdatedAt: now } : state; }
export function updateFarmSettings(state: ModernFarmState, patch: Partial<FarmSettings>, now = Date.now()): ModernFarmState { return normalizeFarmState({ ...state, settings: { ...state.settings, ...patch } }, now); }

export function exportFarmSave(state: ModernFarmState) { return JSON.stringify({ kind: 'sitevl-farm-save', schemaVersion: 2, exportedAt: new Date().toISOString(), farm: normalizeFarmState(state) }, null, 2); }
export function importFarmSave(value: string, now = Date.now()): { ok: true; state: ModernFarmState } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(value) as { kind?: unknown; schemaVersion?: unknown; farm?: unknown };
    if (parsed.kind !== 'sitevl-farm-save' || (parsed.schemaVersion !== 1 && parsed.schemaVersion !== 2) || !parsed.farm || typeof parsed.farm !== 'object') return { ok: false, error: 'Файл не является совместимым сохранением SITEVL FARM.' };
    return { ok: true, state: normalizeFarmState(parsed.farm, now) };
  } catch { return { ok: false, error: 'Не удалось прочитать JSON сохранения.' }; }
}

export function isFarmOrderReachable(order: FarmOrder, level: number) {
  return Object.keys(order.items).every((id) => {
    const crop = FARM_CROPS.find((item) => item.id === id); if (crop) return crop.level <= level;
    const recipe = FARM_RECIPES.find((item) => item.id === id); if (recipe) return recipe.level <= level && Object.keys(recipe.ingredients).every((ingredient) => allItems.includes(ingredient as FarmItemId));
    const animal = FARM_ANIMALS.find((item) => item.productId === id); return animal ? animal.level <= level : id === 'wood' || id === 'river-fish';
  });
}
