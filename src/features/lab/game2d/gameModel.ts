export type GameBodyKind = 'platform' | 'crate' | 'breakable';

export type GameBody = {
  id: string;
  kind: GameBodyKind;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  hp?: number;
  vx?: number;
  vy?: number;
};

export type GamePlayer = {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  facing: -1 | 1;
  grounded: boolean;
  grabbedId?: string;
};

export type GameWorld = {
  width: number;
  height: number;
  player: GamePlayer;
  bodies: GameBody[];
  switches: Array<{ id: string; x: number; y: number; active: boolean }>;
  core: { x: number; y: number; active: boolean };
  won: boolean;
  elapsed: number;
};

export type GameInput = { left: boolean; right: boolean; jump: boolean };

export function createGameWorld(): GameWorld {
  return {
    width: 2400,
    height: 720,
    player: { x: 70, y: 580, width: 28, height: 42, vx: 0, vy: 0, facing: 1, grounded: false },
    bodies: [
      { id: 'ground', kind: 'platform', x: 0, y: 664, width: 2400, height: 56, label: 'PAGE FOOTER' },
      { id: 'header', kind: 'platform', x: 30, y: 500, width: 310, height: 32, label: 'NAVIGATION' },
      { id: 'title', kind: 'platform', x: 390, y: 430, width: 250, height: 34, label: 'BIG HEADING' },
      { id: 'button', kind: 'platform', x: 690, y: 520, width: 130, height: 34, label: 'CTA BUTTON' },
      { id: 'card-a', kind: 'platform', x: 900, y: 410, width: 190, height: 32, label: 'SERVICE CARD' },
      { id: 'card-b', kind: 'platform', x: 1270, y: 500, width: 210, height: 32, label: 'CASE STUDY' },
      { id: 'quote', kind: 'platform', x: 1530, y: 400, width: 260, height: 32, label: 'REVIEW' },
      { id: 'price', kind: 'platform', x: 1850, y: 500, width: 220, height: 32, label: 'PRICE CARD' },
      { id: 'crate-a', kind: 'crate', x: 820, y: 610, width: 52, height: 52, label: 'UI CARD', vx: 0, vy: 0 },
      { id: 'crate-b', kind: 'crate', x: 1630, y: 610, width: 52, height: 52, label: 'BUTTON', vx: 0, vy: 0 },
      { id: 'wall-a', kind: 'breakable', x: 1140, y: 554, width: 55, height: 110, label: 'MODAL', hp: 3 },
      { id: 'wall-b', kind: 'breakable', x: 2085, y: 584, width: 46, height: 80, label: 'COOKIE', hp: 2 },
    ],
    switches: [{ id: 'switch-a', x: 620, y: 622, active: false }, { id: 'switch-b', x: 1765, y: 358, active: false }],
    core: { x: 2270, y: 616, active: false },
    won: false,
    elapsed: 0,
  };
}

function overlaps(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function colliders(world: GameWorld) {
  return world.bodies.filter((body) => body.kind !== 'breakable' || (body.hp || 0) > 0);
}

export function stepGameWorld(world: GameWorld, input: GameInput, delta: number) {
  if (world.won) return;
  const dt = Math.max(0, Math.min(delta, 1 / 30));
  const player = world.player;
  const acceleration = player.grounded ? 1500 : 950;
  const direction = Number(input.right) - Number(input.left);
  if (direction) {
    player.vx += direction * acceleration * dt;
    player.facing = direction < 0 ? -1 : 1;
  } else {
    player.vx *= player.grounded ? .78 : .97;
  }
  player.vx = Math.max(-270, Math.min(270, player.vx));
  if (input.jump && player.grounded) {
    player.vy = -565;
    player.grounded = false;
  }
  player.vy = Math.min(900, player.vy + 1450 * dt);

  if (player.grabbedId) {
    const grabbed = world.bodies.find((body) => body.id === player.grabbedId);
    if (grabbed) {
      grabbed.x += ((player.x + player.facing * 58) - grabbed.x) * Math.min(1, dt * 10);
      grabbed.y += ((player.y + 4) - grabbed.y) * Math.min(1, dt * 10);
    }
  }

  player.x += player.vx * dt;
  for (const body of colliders(world)) {
    if (body.id === player.grabbedId || !overlaps(player, body)) continue;
    if (player.vx > 0) player.x = body.x - player.width;
    else if (player.vx < 0) player.x = body.x + body.width;
    if (body.kind === 'crate') body.x += player.vx * dt * .65;
    player.vx *= .2;
  }

  const previousBottom = player.y + player.height;
  player.y += player.vy * dt;
  player.grounded = false;
  for (const body of colliders(world)) {
    if (body.id === player.grabbedId || !overlaps(player, body)) continue;
    if (player.vy >= 0 && previousBottom <= body.y + 12) {
      player.y = body.y - player.height;
      player.vy = 0;
      player.grounded = true;
    } else if (player.vy < 0) {
      player.y = body.y + body.height;
      player.vy = 0;
    }
  }

  player.x = Math.max(0, Math.min(world.width - player.width, player.x));
  if (player.y > world.height + 80) Object.assign(player, { x: 70, y: 580, vx: 0, vy: 0 });
  world.elapsed += dt;
  world.core.active = world.switches.every((item) => item.active);
  const coreDistance = Math.hypot(player.x - world.core.x, player.y - world.core.y);
  if (world.core.active && coreDistance < 54) world.won = true;
}

export type InteractionResult = { type: 'none' | 'switch' | 'grab' | 'drop' | 'break'; x?: number; y?: number };

export function interactWithGameWorld(world: GameWorld): InteractionResult {
  const player = world.player;
  if (player.grabbedId) {
    player.grabbedId = undefined;
    return { type: 'drop', x: player.x, y: player.y };
  }
  const switchItem = world.switches.find((item) => !item.active && Math.hypot(player.x - item.x, player.y - item.y) < 86);
  if (switchItem) {
    switchItem.active = true;
    return { type: 'switch', x: switchItem.x, y: switchItem.y };
  }
  const breakable = world.bodies.find((body) => body.kind === 'breakable' && (body.hp || 0) > 0 && Math.hypot(player.x - body.x, player.y - body.y) < 105);
  if (breakable) {
    breakable.hp = Math.max(0, (breakable.hp || 0) - 1);
    return { type: 'break', x: breakable.x + breakable.width / 2, y: breakable.y + breakable.height / 2 };
  }
  const crate = world.bodies.find((body) => body.kind === 'crate' && Math.hypot(player.x - body.x, player.y - body.y) < 95);
  if (crate) {
    player.grabbedId = crate.id;
    return { type: 'grab', x: crate.x, y: crate.y };
  }
  return { type: 'none' };
}
