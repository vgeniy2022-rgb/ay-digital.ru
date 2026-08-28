export type InfiniteCanvasItemType = 'note' | 'text' | 'rect' | 'circle' | 'portal';

export type InfiniteCanvasItem = {
  id: string;
  type: InfiniteCanvasItemType;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
  href?: string;
};

export type InfiniteCanvasConnection = { id: string; from: string; to: string };
export type CanvasViewport = { x: number; y: number; zoom: number };
export type InfiniteCanvasDocument = { version: 1; items: InfiniteCanvasItem[]; connections: InfiniteCanvasConnection[] };

export const CANVAS_STORAGE_KEY = 'sitevl-infinite-canvas-v1';

export const initialCanvasDocument: InfiniteCanvasDocument = {
  version: 1,
  items: [
    { id: 'welcome', type: 'note', x: -170, y: -90, width: 250, height: 170, text: 'SITEVL LAB\nMove in any direction. Build a map of ideas.', color: '#f8dc72' },
    { id: 'system', type: 'text', x: 160, y: -220, width: 310, height: 90, text: 'THE BROWSER IS\nA WORKSPACE', color: '#f5f7fb' },
    { id: 'portal-room', type: 'portal', x: 720, y: 250, width: 230, height: 120, text: 'PORTAL / THE ROOM', color: '#8d7dff', href: '/lab/3d' },
    { id: 'portal-retro', type: 'portal', x: -980, y: 430, width: 230, height: 120, text: 'PORTAL / RETRO OS', color: '#ffd66b', href: '/lab/retro' },
    { id: 'portal-physics', type: 'portal', x: 420, y: -740, width: 230, height: 120, text: 'PORTAL / PHYSICS', color: '#63d6a2', href: '/lab/physics' },
  ],
  connections: [{ id: 'line-welcome-system', from: 'welcome', to: 'system' }],
};

function isCanvasItem(value: unknown): value is InfiniteCanvasItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<InfiniteCanvasItem>;
  return typeof item.id === 'string' && typeof item.x === 'number' && typeof item.y === 'number' && typeof item.width === 'number' && typeof item.height === 'number' && typeof item.text === 'string' && typeof item.color === 'string' && ['note', 'text', 'rect', 'circle', 'portal'].includes(item.type || '');
}

export function normalizeCanvasDocument(value: unknown): InfiniteCanvasDocument {
  if (!value || typeof value !== 'object') return initialCanvasDocument;
  const candidate = value as Partial<InfiniteCanvasDocument>;
  const items = Array.isArray(candidate.items) ? candidate.items.filter(isCanvasItem).slice(0, 300) : initialCanvasDocument.items;
  const ids = new Set(items.map((item) => item.id));
  const connections = Array.isArray(candidate.connections) ? candidate.connections.filter((connection): connection is InfiniteCanvasConnection => Boolean(connection && typeof connection.id === 'string' && typeof connection.from === 'string' && typeof connection.to === 'string' && ids.has(connection.from) && ids.has(connection.to))).slice(0, 400) : [];
  return { version: 1, items, connections };
}

export function readCanvasDocument(): InfiniteCanvasDocument {
  try {
    const raw = window.localStorage.getItem(CANVAS_STORAGE_KEY);
    return raw ? normalizeCanvasDocument(JSON.parse(raw)) : initialCanvasDocument;
  } catch {
    return initialCanvasDocument;
  }
}

export function writeCanvasDocument(document: InfiniteCanvasDocument) {
  try {
    window.localStorage.setItem(CANVAS_STORAGE_KEY, JSON.stringify(normalizeCanvasDocument(document)));
  } catch {
    // Canvas remains editable even when browser storage is unavailable.
  }
}

export function hitCanvasItem(items: InfiniteCanvasItem[], x: number, y: number) {
  return [...items].reverse().find((item) => x >= item.x && x <= item.x + item.width && y >= item.y && y <= item.y + item.height);
}

export function createCanvasItem(type: Exclude<InfiniteCanvasItemType, 'portal'>, x: number, y: number): InfiniteCanvasItem {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  if (type === 'note') return { id, type, x, y, width: 240, height: 170, text: 'Новая идея\nВыберите карточку и измените текст справа.', color: '#f8dc72' };
  if (type === 'text') return { id, type, x, y, width: 280, height: 100, text: 'TEXT OBJECT', color: '#f5f7fb' };
  return { id, type, x, y, width: type === 'circle' ? 150 : 210, height: 150, text: type === 'circle' ? 'CIRCLE' : 'SHAPE', color: type === 'circle' ? '#ff8dc7' : '#75a7ff' };
}
