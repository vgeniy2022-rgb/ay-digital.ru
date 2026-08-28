export type PhysicsShape = 'cube' | 'ball' | 'domino' | 'spring' | 'pendulum' | 'ragdoll';

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
  anchor?: { x: number; y: number; length: number };
};

export type PhysicsWorld = {
  width: number;
  height: number;
  gravity: { x: number; y: number };
  bodies: PhysicsBody[];
};

let bodySequence = 0;

const colors = ['#75a7ff', '#63d6a2', '#ff8c72', '#ffd66b', '#b39cff', '#ff8dc7'];

export function createPhysicsBody(shape: PhysicsShape, x = 500, y = 100, settings = { mass: 1, restitution: .55, friction: .25 }): PhysicsBody {
  bodySequence += 1;
  const size = shape === 'domino' ? { width: 22, height: 88 } : shape === 'ragdoll' ? { width: 58, height: 92 } : { width: 54, height: 54 };
  const radius = shape === 'ball' ? 28 : Math.max(size.width, size.height) / 2;
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
  const dt = Math.max(0, Math.min(delta, 1 / 30));
  let impact = 0;
  for (const body of world.bodies) {
    if (body.id === draggedId) continue;
    body.vx += world.gravity.x * dt;
    body.vy += world.gravity.y * dt;
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
