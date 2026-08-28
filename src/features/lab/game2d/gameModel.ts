export type GameBodyKind = 'platform' | 'crate' | 'breakable' | 'spring' | 'moving';

export type GameBody = {
  id: string; kind: GameBodyKind; x: number; y: number; width: number; height: number; label: string;
  hp?: number; vx?: number; vy?: number; baseX?: number; baseY?: number; range?: number; speed?: number;
};

export type GamePlayer = {
  x: number; y: number; width: number; height: number; vx: number; vy: number; facing: -1 | 1;
  grounded: boolean; grabbedId?: string; jumps: number; dashCooldown: number;
  abilities: { dash: boolean; doubleJump: boolean; gravitySwitch: boolean };
};

export type GameWorld = {
  width: number; height: number; player: GamePlayer; bodies: GameBody[];
  switches: Array<{ id: string; x: number; y: number; active: boolean }>;
  fragments: Array<{ id: string; x: number; y: number; collected: boolean }>;
  secrets: Array<{ id: string; x: number; y: number; found: boolean }>;
  hazards: Array<{ id: string; x: number; y: number; width: number; height: number; label: string }>;
  checkpoints: Array<{ id: string; x: number; active: boolean }>;
  core: { x: number; y: number; active: boolean };
  zone: number; checkpointX: number; won: boolean; elapsed: number; destroyed: number; deaths: number;
};

export type GameInput = { left: boolean; right: boolean; jump: boolean; dash?: boolean };

const zonePlatforms: GameBody[] = [
  { id: 'header', kind: 'platform', x: 30, y: 500, width: 310, height: 32, label: 'НАВИГАЦИЯ' },
  { id: 'title', kind: 'platform', x: 390, y: 430, width: 250, height: 34, label: 'ЗАГОЛОВОК' },
  { id: 'button', kind: 'spring', x: 690, y: 545, width: 130, height: 26, label: 'CTA-ПРУЖИНА' },
  { id: 'card-a', kind: 'moving', x: 900, y: 410, width: 190, height: 32, label: 'ДВИЖУЩАЯСЯ КАРТОЧКА', baseX: 900, baseY: 410, range: 90, speed: 1.1 },
  { id: 'style-grid', kind: 'platform', x: 1300, y: 520, width: 220, height: 30, label: 'CSS GRID' },
  { id: 'style-var', kind: 'moving', x: 1600, y: 400, width: 190, height: 30, label: 'CSS VARIABLE', baseX: 1600, baseY: 400, range: 110, speed: 1.35 },
  { id: 'component-a', kind: 'platform', x: 2500, y: 520, width: 240, height: 30, label: 'REACT COMPONENT' },
  { id: 'component-b', kind: 'spring', x: 2890, y: 590, width: 120, height: 24, label: 'HOOK' },
  { id: 'system-a', kind: 'moving', x: 3700, y: 470, width: 220, height: 30, label: 'EVENT LOOP', baseX: 3700, baseY: 470, range: 130, speed: .9 },
  { id: 'system-b', kind: 'platform', x: 4150, y: 360, width: 210, height: 30, label: 'LOCAL STORAGE' },
  { id: 'core-bridge', kind: 'moving', x: 5050, y: 500, width: 220, height: 30, label: 'CORE BRIDGE', baseX: 5050, baseY: 500, range: 115, speed: 1.2 },
  { id: 'crate-a', kind: 'crate', x: 820, y: 610, width: 52, height: 52, label: 'UI-КАРТОЧКА', vx: 0, vy: 0 },
  { id: 'crate-b', kind: 'crate', x: 2830, y: 610, width: 52, height: 52, label: 'КНОПКА', vx: 0, vy: 0 },
  { id: 'wall-a', kind: 'breakable', x: 1140, y: 554, width: 55, height: 110, label: 'МОДАЛЬНОЕ ОКНО', hp: 3 },
  { id: 'wall-b', kind: 'breakable', x: 2250, y: 564, width: 50, height: 100, label: 'CSS-КАСКАД', hp: 3 },
  { id: 'wall-c', kind: 'breakable', x: 3480, y: 554, width: 55, height: 110, label: 'ОШИБКА STATE', hp: 3 },
  { id: 'wall-d', kind: 'breakable', x: 4750, y: 544, width: 58, height: 120, label: 'FIREWALL', hp: 3 },
];

export function createGameWorld(): GameWorld {
  return {
    width: 6000, height: 720,
    player: { x: 70, y: 580, width: 28, height: 42, vx: 0, vy: 0, facing: 1, grounded: false, jumps: 0, dashCooldown: 0, abilities: { dash: false, doubleJump: false, gravitySwitch: false } },
    bodies: [{ id: 'ground', kind: 'platform', x: 0, y: 664, width: 6000, height: 56, label: 'НИЖНЯЯ ГРАНИЦА' }, ...zonePlatforms.map((body) => ({ ...body }))],
    switches: [620, 1765, 3000, 4310, 5480].map((x, index) => ({ id: `switch-${index + 1}`, x, y: index % 2 ? 350 : 622, active: false })),
    fragments: [520, 980, 1440, 2050, 2670, 3260, 3890, 4470, 5120, 5680].map((x, index) => ({ id: `fragment-${index + 1}`, x, y: index % 3 === 0 ? 370 : 590, collected: false })),
    secrets: [{ id: 'secret-style', x: 2110, y: 600, found: false }, { id: 'secret-system', x: 4540, y: 320, found: false }],
    hazards: [{ id: 'laser-a', x: 1860, y: 630, width: 170, height: 34, label: 'СКАНЕР' }, { id: 'glitch-a', x: 3190, y: 620, width: 180, height: 44, label: 'GLITCH' }, { id: 'firewall-a', x: 4590, y: 610, width: 120, height: 54, label: 'FIREWALL' }],
    checkpoints: [70, 1240, 2440, 3640, 4840].map((x, index) => ({ id: `checkpoint-${index + 1}`, x, active: index === 0 })),
    core: { x: 5850, y: 616, active: false }, zone: 0, checkpointX: 70, won: false, elapsed: 0, destroyed: 0, deaths: 0,
  };
}

function overlaps(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function colliders(world: GameWorld) {
  return world.bodies.filter((body) => body.kind !== 'breakable' || (body.hp || 0) > 0);
}

function respawn(world: GameWorld) {
  Object.assign(world.player, { x: world.checkpointX, y: 570, vx: 0, vy: 0, grabbedId: undefined });
  world.deaths += 1;
}

export function stepGameWorld(world: GameWorld, input: GameInput, delta: number) {
  if (world.won) return;
  const dt = Math.max(0, Math.min(delta, 1 / 30));
  const player = world.player;
  world.elapsed += dt;
  world.zone = Math.min(4, Math.floor(player.x / 1200));
  player.abilities.dash ||= player.x >= 1240;
  player.abilities.doubleJump ||= player.x >= 2440;
  player.abilities.gravitySwitch ||= player.x >= 3640;
  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  for (const body of world.bodies) if (body.kind === 'moving') body.y = (body.baseY || body.y) + Math.sin(world.elapsed * (body.speed || 1)) * (body.range || 0);

  const acceleration = player.grounded ? 1500 : 950;
  const direction = Number(input.right) - Number(input.left);
  if (direction) { player.vx += direction * acceleration * dt; player.facing = direction < 0 ? -1 : 1; }
  else player.vx *= player.grounded ? .78 : .97;
  if (input.dash && player.abilities.dash && player.dashCooldown <= 0) { player.vx = player.facing * 620; player.vy *= .35; player.dashCooldown = .9; }
  player.vx = Math.max(-620, Math.min(620, player.vx));
  if (input.jump && (player.grounded || (player.abilities.doubleJump && player.jumps < 2))) {
    player.vy = -565; player.grounded = false; player.jumps += 1;
  }
  player.vy = Math.min(900, player.vy + (player.abilities.gravitySwitch && input.left && input.right ? 520 : 1450) * dt);

  if (player.grabbedId) {
    const grabbed = world.bodies.find((body) => body.id === player.grabbedId);
    if (grabbed) { grabbed.x += ((player.x + player.facing * 58) - grabbed.x) * Math.min(1, dt * 10); grabbed.y += ((player.y + 4) - grabbed.y) * Math.min(1, dt * 10); }
  }

  player.x += player.vx * dt;
  for (const body of colliders(world)) {
    if (body.id === player.grabbedId || !overlaps(player, body)) continue;
    if (player.vx > 0) player.x = body.x - player.width; else if (player.vx < 0) player.x = body.x + body.width;
    if (body.kind === 'crate') body.x += player.vx * dt * .65;
    player.vx *= .2;
  }
  const previousBottom = player.y + player.height;
  player.y += player.vy * dt;
  player.grounded = false;
  for (const body of colliders(world)) {
    if (body.id === player.grabbedId || !overlaps(player, body)) continue;
    if (player.vy >= 0 && previousBottom <= body.y + 14) {
      player.y = body.y - player.height;
      player.vy = body.kind === 'spring' ? -760 : 0;
      player.grounded = body.kind !== 'spring';
      if (player.grounded) player.jumps = 0;
    } else if (player.vy < 0) { player.y = body.y + body.height; player.vy = 0; }
  }

  for (const checkpoint of world.checkpoints) if (!checkpoint.active && player.x >= checkpoint.x) { checkpoint.active = true; world.checkpointX = checkpoint.x; }
  for (const fragment of world.fragments) if (!fragment.collected && Math.hypot(player.x - fragment.x, player.y - fragment.y) < 52) fragment.collected = true;
  for (const secret of world.secrets) if (!secret.found && Math.hypot(player.x - secret.x, player.y - secret.y) < 60) secret.found = true;
  if (world.hazards.some((hazard) => overlaps(player, hazard))) respawn(world);
  player.x = Math.max(0, Math.min(world.width - player.width, player.x));
  if (player.y > world.height + 80) respawn(world);
  world.core.active = world.switches.every((item) => item.active);
  if (world.core.active && Math.hypot(player.x - world.core.x, player.y - world.core.y) < 54) world.won = true;
}

export type InteractionResult = { type: 'none' | 'switch' | 'grab' | 'drop' | 'break'; x?: number; y?: number };

export function interactWithGameWorld(world: GameWorld): InteractionResult {
  const player = world.player;
  if (player.grabbedId) { player.grabbedId = undefined; return { type: 'drop', x: player.x, y: player.y }; }
  const switchItem = world.switches.find((item) => !item.active && Math.hypot(player.x - item.x, player.y - item.y) < 86);
  if (switchItem) { switchItem.active = true; return { type: 'switch', x: switchItem.x, y: switchItem.y }; }
  const breakable = world.bodies.find((body) => body.kind === 'breakable' && (body.hp || 0) > 0 && Math.hypot(player.x - body.x, player.y - body.y) < 105);
  if (breakable) { breakable.hp = Math.max(0, (breakable.hp || 0) - 1); if (breakable.hp === 0) world.destroyed += 1; return { type: 'break', x: breakable.x + breakable.width / 2, y: breakable.y + breakable.height / 2 }; }
  const crate = world.bodies.find((body) => body.kind === 'crate' && Math.hypot(player.x - body.x, player.y - body.y) < 95);
  if (crate) { player.grabbedId = crate.id; return { type: 'grab', x: crate.x, y: crate.y }; }
  return { type: 'none' };
}
