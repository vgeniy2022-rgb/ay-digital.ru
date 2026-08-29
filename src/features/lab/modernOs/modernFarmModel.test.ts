import assert from 'node:assert/strict';
import test from 'node:test';
import {
  FARM_CROPS, FARM_ITEM_CATEGORY, FARM_RECIPES, FARM_ZONES, advanceFarm, buyFarmAnimal, claimFarmDaily, collectFarmAnimal, createDefaultFarmState, exportFarmSave, feedFarmAnimal, fulfillFarmOrder, harvestFarmPlot, importFarmSave, isFarmOrderReachable, normalizeFarmState, plantFarmPlot, queueFarmRecipe, sellFarmItem, unlockFarmZone, upgradeFarmBuilding,
} from './modernFarmModel';

test('SITEVL FARM uses a safe seed cycle and accelerated timestamps', () => {
  const now = 1_000; let state = createDefaultFarmState(now); state = plantFarmPlot(state, 'plot-1', 'wheat', now);
  assert.equal(state.coins, 350); assert.equal(state.inventory.wheat, 3); assert.equal(state.plots[0].readyAt, now + 20_000); assert.equal(harvestFarmPlot(state, 'plot-1', now + 19_999), state);
  state = harvestFarmPlot(state, 'plot-1', now + 20_000); assert.equal(state.inventory.wheat, 6); assert.equal(state.plots[0].cropId, undefined); assert.equal(state.harvestByCrop.wheat, 3);
});

test('SITEVL FARM keeps the release growth-time checkpoints', () => {
  assert.equal(FARM_CROPS.find((crop) => crop.id === 'wheat')?.growthMs, 20_000);
  assert.equal(FARM_CROPS.find((crop) => crop.id === 'corn')?.growthMs, 60_000);
  assert.equal(FARM_CROPS.find((crop) => crop.id === 'carrot')?.growthMs, 100_000);
  assert.equal(FARM_CROPS.find((crop) => crop.id === 'strawberry')?.growthMs, 300_000);
});

test('SITEVL FARM never lets the player sell the final seed', () => {
  const state = createDefaultFarmState(1_000); const oneSeed = normalizeFarmState({ ...state, inventory: { ...state.inventory, wheat: 1 } }, 1_000);
  assert.equal(sellFarmItem(oneSeed, 'wheat'), oneSeed);
  const planted = plantFarmPlot(oneSeed, 'plot-1', 'wheat', 1_000); assert.equal(planted.inventory.wheat, 0);
});

test('SITEVL FARM processes ingredients and collects offline output', () => {
  const now = 2_000; let state = createDefaultFarmState(now); state = queueFarmRecipe(state, 'flour', now);
  assert.equal(state.inventory.wheat, 2); assert.equal(state.processes.length, 1); state = advanceFarm(state, now + 15_000); assert.equal(state.inventory.flour, 1); assert.equal(state.processes.length, 0);
});

test('SITEVL FARM respects barn capacity for harvest and expands it safely', () => {
  const now = 2_000; let state = createDefaultFarmState(now); state = plantFarmPlot(state, 'plot-1', 'wheat', now);
  state = normalizeFarmState({ ...state, coins: 1_000, inventory: { ...state.inventory, corn: 57 } }, now); assert.equal(harvestFarmPlot(state, 'plot-1', now + 20_000), state);
  state = upgradeFarmBuilding(state, 'barn', now); assert.equal(state.buildingLevels.barn, 2); assert.notEqual(harvestFarmPlot(state, 'plot-1', now + 20_000), state);
});

test('SITEVL FARM completes a valid order and preserves invalid ones', () => {
  let state = createDefaultFarmState(3_000); const invalid = fulfillFarmOrder(state, 'order-cafe', 3_000); assert.equal(invalid.fulfilledOrders, 0);
  state = fulfillFarmOrder(state, 'order-bakery', 3_000); assert.equal(state.fulfilledOrders, 1); assert.equal(state.coins, 445); assert.equal(state.orders.length, 3);
});

test('SITEVL FARM animals produce offline and require feed', () => {
  const now = 4_000; let state = normalizeFarmState({ ...createDefaultFarmState(now), xp: 400, coins: 500, inventory: { ...createDefaultFarmState(now).inventory, 'chicken-feed': 1 } }, now);
  state = buyFarmAnimal(state, 'chicken', now); assert.equal(state.animals.length, 1); const animalId = state.animals[0].id;
  state = feedFarmAnimal(state, animalId, now); assert.equal(state.inventory['chicken-feed'], 0); assert.equal(collectFarmAnimal(state, animalId, now + 44_999), state);
  state = collectFarmAnimal(state, animalId, now + 45_000); assert.equal(state.inventory.egg, 1); assert.equal(state.animals[0].readyAt, undefined);
});

test('SITEVL FARM zones require both level and coins', () => {
  let state = createDefaultFarmState(4_000); assert.equal(unlockFarmZone(state, 'market', 4_000), state);
  state = normalizeFarmState({ ...state, xp: 400, coins: 500 }, 4_000); state = unlockFarmZone(state, 'market', 4_000); assert.ok(state.unlockedZones.includes('market')); assert.equal(state.coins, 280);
});

test('SITEVL FARM daily goals can only be claimed after progress', () => {
  const now = Date.UTC(2026, 7, 30); let state = createDefaultFarmState(now); const task = state.daily.tasks[0]; const unclaimed = claimFarmDaily(state, task.id, now); assert.equal(unclaimed.coins, state.coins); assert.equal(unclaimed.daily.tasks[0].claimed, false);
  state = normalizeFarmState({ ...state, harvested: task.target }, now); state = claimFarmDaily(state, task.id, now); assert.equal(state.daily.tasks[0].claimed, true); assert.ok(state.coins > 350);
});

test('SITEVL FARM migrates v1 data and exports validated v2 backups', () => {
  const now = 5_000; const state = normalizeFarmState({ version: 1, coins: 99, inventory: { wheat: 2 }, plots: [], unlockedZones: ['farm'] }, now);
  assert.equal(state.version, 2); assert.equal(state.coins, 99); assert.equal(state.plots.length, 12); const imported = importFarmSave(exportFarmSave(state), now); assert.equal(imported.ok, true); if (imported.ok) assert.equal(imported.state.coins, 99);
  assert.deepEqual(importFarmSave('{"unsafe":true}', now), { ok: false, error: 'Файл не является совместимым сохранением SITEVL FARM.' });
});

test('SITEVL FARM data tables remain reachable and internally consistent', () => {
  FARM_RECIPES.forEach((recipe) => { assert.ok(recipe.durationMs > 0); Object.keys(recipe.ingredients).forEach((id) => assert.ok(id in FARM_ITEM_CATEGORY)); });
  FARM_CROPS.forEach((crop) => { assert.ok(crop.growthMs >= 20_000); assert.ok(crop.sellPrice > 0); });
  FARM_ZONES.forEach((zone, index) => { assert.ok(zone.cost >= 0); if (index) assert.ok(zone.level >= FARM_ZONES[index - 1].level); });
  createDefaultFarmState().orders.forEach((order) => assert.equal(isFarmOrderReachable(order, Math.max(1, order.id === 'order-market' ? 2 : 1)), true));
});

test('SITEVL FARM normalization rejects unsafe inventory and caps plots for stress safety', () => {
  const plots = Array.from({ length: 100 }, (_, index) => ({ id: `plot-${index}`, x: index % 10, y: Math.floor(index / 10) }));
  const state = normalizeFarmState({ coins: -100, inventory: { wheat: -20 }, plots, unlockedZones: ['unknown'] }, 5_000);
  assert.equal(state.coins, 0); assert.equal(state.inventory.wheat, 4); assert.equal(state.plots.length, 60); assert.deepEqual(state.unlockedZones, ['farm']);
});
