export type PhysicsShape = 'cube' | 'ball' | 'cylinder' | 'platform' | 'domino' | 'spring' | 'pendulum' | 'ragdoll';
export type PhysicsPresetId = 'free' | 'domino' | 'tower' | 'pendulum' | 'springs' | 'zero' | 'moon' | 'super' | 'explosion' | 'rube';

export type PhysicsBody = {
  id: string;
  shape: PhysicsShape;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  radius: number;
  mass: number;
  restitution: number;
  friction: number;
  rotation: number;
  angularVelocity: number;
  color: string;
  frozen?: boolean;
  anchor?: { x: number; y: number; length: number };
};

export type PhysicsWorld = {
  width: number;
  height: number;
  gravity: { x: number; y: number };
  airResistance?: number;
  timeScale?: number;
  bodies: PhysicsBody[];
};

let bodySequence = 0;

const colors = ['#75a7ff', '#63d6a2', '#ff8c72', '#ffd66b', '#b39cff', '#ff8dc7'];

export function createPhysicsBody(shape: PhysicsShape, x = 500, y = 100, settings = { mass: 1, restitution: .55, friction: .25 }): PhysicsBody {
  bodySequence += 1;
  const size = shape === 'domino' ? { width: 22, height: 88 } : shape === 'ragdoll' ? { width: 58, height: 92 } : shape === 'platform' ? { width: 150, height: 22 } : shape === 'cylinder' ? { width: 42, height: 72 } : { width: 54, height: 54 };
  const radius = shape === 'ball' ? 28 : Math.min(70, Math.max(size.width, size.height) / 2);
  const body: PhysicsBody = {
    id: `physics-${bodySequence}`,
    shape,
    x,
    y,
    vx: 0,
    vy: 0,
    width: size.width,
    height: size.height,
    radius,
    mass: settings.mass,
    restitution: settings.restitution,
    friction: settings.friction,
    rotation: 0,
    angularVelocity: shape === 'domino' ? .3 : 0,
    color: colors[bodySequence % colors.length],
  };
  if (shape === 'spring') body.anchor = { x, y: 34, length: 160 };
  if (shape === 'pendulum') body.anchor = { x, y: 42, length: 210 };
  return body;
}

export function createPhysicsWorld(): PhysicsWorld {
  return {
    width: 1000,
    height: 650,
    gravity: { x: 0, y: 686.7 },
    airResistance: .01,
    timeScale: 1,
    bodies: [
      createPhysicsBody('cube', 280, 170),
      createPhysicsBody('ball', 390, 90),
      createPhysicsBody('domino', 580, 140),
      createPhysicsBody('spring', 720, 220),
      createPhysicsBody('pendulum', 860, 240),
      createPhysicsBody('ragdoll', 160, 180),
    ],
  };
}

function solveBoundary(body: PhysicsBody, world: PhysicsWorld) {
  let impact = 0;
  const halfWidth = body.width / 2;
  const halfHeight = body.height / 2;
  if (body.x - halfWidth < 0) { impact = Math.max(impact, Math.abs(body.vx)); body.x = halfWidth; body.vx = Math.abs(body.vx) * body.restitution; }
  if (body.x + halfWidth > world.width) { impact = Math.max(impact, Math.abs(body.vx)); body.x = world.width - halfWidth; body.vx = -Math.abs(body.vx) * body.restitution; }
  if (body.y - halfHeight < 0) { impact = Math.max(impact, Math.abs(body.vy)); body.y = halfHeight; body.vy = Math.abs(body.vy) * body.restitution; }
  if (body.y + halfHeight > world.height - 36) {
    impact = Math.max(impact, Math.abs(body.vy));
    body.y = world.height - 36 - halfHeight;
    body.vy = -Math.abs(body.vy) * body.restitution;
    body.vx *= Math.max(0, 1 - body.friction * .08);
    body.angularVelocity *= .92;
    if (Math.abs(body.vy) < 12) body.vy = 0;
  }
  return impact;
}

function solvePairs(bodies: PhysicsBody[]) {
  let impact = 0;
  for (let firstIndex = 0; firstIndex < bodies.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < bodies.length; secondIndex += 1) {
      const first = bodies[firstIndex];
      const second = bodies[secondIndex];
      const dx = second.x - first.x;
      const dy = second.y - first.y;
      const minDistance = Math.min(first.radius, 42) + Math.min(second.radius, 42);
      const distance = Math.hypot(dx, dy) || .001;
      if (distance >= minDistance) continue;
      const nx = dx / distance;
      const ny = dy / distance;
      const overlap = minDistance - distance;
      const totalMass = first.mass + second.mass;
      first.x -= nx * overlap * (second.mass / totalMass);
      first.y -= ny * overlap * (second.mass / totalMass);
      second.x += nx * overlap * (first.mass / totalMass);
      second.y += ny * overlap * (first.mass / totalMass);
      const relative = (second.vx - first.vx) * nx + (second.vy - first.vy) * ny;
      if (relative >= 0) continue;
      const restitution = Math.min(first.restitution, second.restitution);
      const impulse = -(1 + restitution) * relative / ((1 / first.mass) + (1 / second.mass));
      first.vx -= (impulse / first.mass) * nx;
      first.vy -= (impulse / first.mass) * ny;
      second.vx += (impulse / second.mass) * nx;
      second.vy += (impulse / second.mass) * ny;
      impact = Math.max(impact, Math.abs(relative));
    }
  }
  return impact;
}

export function stepPhysicsWorld(world: PhysicsWorld, delta: number, draggedId?: string) {
  const dt = Math.max(0, Math.min(delta, 1 / 30)) * (world.timeScale ?? 1);
  let impact = 0;
  for (const body of world.bodies) {
    if (body.id === draggedId || body.frozen) continue;
    body.vx += world.gravity.x * dt;
    body.vy += world.gravity.y * dt;
    body.vx *= Math.max(0, 1 - (world.airResistance ?? .01) * dt * 10);
    body.vy *= Math.max(0, 1 - (world.airResistance ?? .01) * dt * 10);
    if (body.anchor) {
      const dx = body.x - body.anchor.x;
      const dy = body.y - body.anchor.y;
      const distance = Math.hypot(dx, dy) || 1;
      if (body.shape === 'pendulum') {
        body.x = body.anchor.x + (dx / distance) * body.anchor.length;
        body.y = body.anchor.y + (dy / distance) * body.anchor.length;
        const radialVelocity = (body.vx * dx + body.vy * dy) / distance;
        body.vx -= radialVelocity * dx / distance;
        body.vy -= radialVelocity * dy / distance;
      } else {
        const force = -(distance - body.anchor.length) * 7.5;
        body.vx += (dx / distance) * force * dt / body.mass;
        body.vy += (dy / distance) * force * dt / body.mass;
      }
    }
    body.x += body.vx * dt;
    body.y += body.vy * dt;
    body.rotation += body.angularVelocity * dt;
    impact = Math.max(impact, solveBoundary(body, world));
  }
  impact = Math.max(impact, solvePairs(world.bodies));
  return impact;
}

export function createPhysicsPreset(id: PhysicsPresetId): PhysicsWorld {
  const world = createPhysicsWorld();
  world.bodies = [];
  const add = (shape: PhysicsShape, x: number, y: number, settings = { mass: 1, restitution: .35, friction: .35 }) => world.bodies.push(createPhysicsBody(shape, x, y, settings));
  if (id === 'free') return createPhysicsWorld();
  if (id === 'domino' || id === 'rube') for (let index = 0; index < (id === 'domino' ? 72 : 36); index += 1) add('domino', 90 + index * 12, 520 - Math.sin(index * .3) * 55);
  if (id === 'tower' || id === 'rube') for (let row = 0; row < 8; row += 1) for (let column = 0; column < 5; column += 1) add('cube', 650 + column * 55, 560 - row * 56);
  if (id === 'pendulum') for (let index = 0; index < 5; index += 1) add('pendulum', 340 + index * 80, 250);
  if (id === 'springs' || id === 'rube') for (let index = 0; index < 6; index += 1) add('spring', 230 + index * 110, 260 + (index % 2) * 90);
  if (id === 'zero') { world.gravity.y = 0; for (let index = 0; index < 28; index += 1) { add(index % 2 ? 'ball' : 'cube', 100 + (index % 9) * 95, 100 + Math.floor(index / 9) * 130); const body = world.bodies[world.bodies.length - 1]; body.vx = (index % 3 - 1) * 45; body.vy = (index % 4 - 1.5) * 35; } }
  if (id === 'moon') { world.gravity.y = 113.4; for (let index = 0; index < 18; index += 1) add(index % 3 ? 'ball' : 'cylinder', 100 + index * 45, 90 + (index % 4) * 60); }
  if (id === 'super') { world.gravity.y = 1735; for (let index = 0; index < 22; index += 1) add(index % 2 ? 'cube' : 'ball', 100 + index * 38, 80); }
  if (id === 'explosion') { for (let index = 0; index < 48; index += 1) { add(index % 2 ? 'cube' : 'ball', 500 + (Math.random() - .5) * 130, 330 + (Math.random() - .5) * 130); const body = world.bodies[world.bodies.length - 1]; const angle = Math.random() * Math.PI * 2; body.vx = Math.cos(angle) * 520; body.vy = Math.sin(angle) * 520; } }
  if (id === 'rube') { add('ball', 60, 120); add('platform', 210, 240); add('platform', 520, 360); }
  return world;
}
