import assert from 'node:assert/strict';
import test from 'node:test';
import { createGameWorld, interactWithGameWorld, stepGameWorld } from './gameModel';

test('2D world ignores a negative first-frame delta', () => {
  const world = createGameWorld();
  stepGameWorld(world, { left: false, right: false, jump: false }, -1);
  assert.equal(world.elapsed, 0);
});

test('2D player moves and lands on the controlled page floor', () => {
  const world = createGameWorld();
  for (let index = 0; index < 90; index += 1) stepGameWorld(world, { left: false, right: true, jump: false }, 1 / 60);
  assert.ok(world.player.x > 70);
  assert.equal(world.player.grounded, true);
  assert.ok(world.elapsed > 1);
});

test('switches unlock CORE and reaching it completes the experiment', () => {
  const world = createGameWorld();
  world.switches.forEach((item) => { world.player.x = item.x; world.player.y = item.y; assert.equal(interactWithGameWorld(world).type, 'switch'); });
  world.player.x = world.core.x;
  world.player.y = world.core.y;
  stepGameWorld(world, { left: false, right: false, jump: false }, 1 / 60);
  assert.equal(world.core.active, true);
  assert.equal(world.won, true);
});

test('break action reduces a nearby controlled UI wall', () => {
  const world = createGameWorld();
  const wall = world.bodies.find((item) => item.id === 'wall-a');
  assert.ok(wall);
  world.player.x = wall.x;
  world.player.y = wall.y;
  assert.equal(interactWithGameWorld(world).type, 'break');
  assert.equal(wall.hp, 2);
});
