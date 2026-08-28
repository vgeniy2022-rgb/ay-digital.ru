import assert from 'node:assert/strict';
import test from 'node:test';
import { createPhysicsBody, createPhysicsWorld, stepPhysicsWorld } from './physicsModel';

test('physics world exposes all requested object families', () => {
  const shapes = new Set(createPhysicsWorld().bodies.map((body) => body.shape));
  assert.deepEqual([...shapes].sort(), ['ball', 'cube', 'domino', 'pendulum', 'ragdoll', 'spring']);
});

test('earth gravity accelerates a free body downwards', () => {
  const world = { width: 1000, height: 650, gravity: { x: 0, y: 686.7 }, bodies: [createPhysicsBody('ball', 500, 100)] };
  stepPhysicsWorld(world, 1 / 30);
  assert.ok(world.bodies[0].vy > 0);
  assert.ok(world.bodies[0].y > 100);
});

test('physics step clamps negative deltas and keeps boundaries stable', () => {
  const body = createPhysicsBody('cube', 20, 20);
  const world = { width: 200, height: 200, gravity: { x: 0, y: 0 }, bodies: [body] };
  stepPhysicsWorld(world, -2);
  assert.equal(body.x, body.width / 2);
  assert.equal(body.y, body.height / 2);
});
