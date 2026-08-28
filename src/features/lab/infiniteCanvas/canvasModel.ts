export type InfiniteCanvasItemType = 'note' | 'text' | 'rect' | 'circle' | 'line' | 'arrow' | 'frame' | 'sticker' | 'image' | 'portal';

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
  imageUrl?: string;
  locked?: boolean;
  hidden?: boolean;
};

export type InfiniteCanvasConnection = { id: string; from: string; to: string };
export type CanvasViewport = { x: number; y: number; zoom: number };
export type InfiniteCanvasDocument = { version: 1; items: InfiniteCanvasItem[]; connections: InfiniteCanvasConnection[] };

export const CANVAS_STORAGE_KEY = 'sitevl-infinite-canvas-v1';

export const initialCanvasDocument: InfiniteCanvasDocument = {
  version: 1,
  items: [
    { id: 'welcome', type: 'note', x: -170, y: -90, width: 250, height: 170, text: 'SITEVL LAB\nДвигайтесь в любую сторону. Соберите карту идей.', color: '#f8dc72' },
    { id: 'system', type: 'text', x: 160, y: -220, width: 310, height: 90, text: 'БРАУЗЕР — ЭТО\nРАБОЧЕЕ ПРОСТРАНСТВО', color: '#f5f7fb' },
    { id: 'portal-room', type: 'portal', x: 720, y: 250, width: 230, height: 120, text: 'ПОРТАЛ / КОМНАТА', color: '#8d7dff', href: '/lab/3d' },
    { id: 'portal-retro', type: 'portal', x: -980, y: 430, width: 230, height: 120, text: 'ПОРТАЛ / РЕТРО', color: '#ffd66b', href: '/lab/retro' },
    { id: 'portal-physics', type: 'portal', x: 420, y: -740, width: 230, height: 120, text: 'ПОРТАЛ / ФИЗИКА', color: '#63d6a2', href: '/lab/physics' },
  ],
  connections: [{ id: 'line-welcome-system', from: 'welcome', to: 'system' }],
};

function isCanvasItem(value: unknown): value is InfiniteCanvasItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<InfiniteCanvasItem>;
  return typeof item.id === 'string' && typeof item.x === 'number' && typeof item.y === 'number' && typeof item.width === 'number' && typeof item.height === 'number' && typeof item.text === 'string' && typeof item.color === 'string' && ['note', 'text', 'rect', 'circle', 'line', 'arrow', 'frame', 'sticker', 'image', 'portal'].includes(item.type || '');
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
  return [...items].reverse().find((item) => !item.hidden && x >= item.x && x <= item.x + item.width && y >= item.y && y <= item.y + item.height);
}

export function createCanvasItem(type: Exclude<InfiniteCanvasItemType, 'portal'>, x: number, y: number): InfiniteCanvasItem {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  if (type === 'note') return { id, type, x, y, width: 240, height: 170, text: 'Новая идея\nВыберите карточку и измените текст справа.', color: '#f8dc72' };
  if (type === 'text') return { id, type, x, y, width: 280, height: 100, text: 'ТЕКСТОВЫЙ ОБЪЕКТ', color: '#f5f7fb' };
  if (type === 'line' || type === 'arrow') return { id, type, x, y, width: 220, height: 70, text: '', color: '#75a7ff' };
  if (type === 'frame') return { id, type, x, y, width: 420, height: 280, text: 'ФРЕЙМ', color: '#75a7ff' };
  if (type === 'sticker') return { id, type, x, y, width: 110, height: 110, text: '★', color: '#ffd66b' };
  if (type === 'image') return { id, type, x, y, width: 320, height: 210, text: 'ИЗОБРАЖЕНИЕ', color: '#303845' };
  return { id, type, x, y, width: type === 'circle' ? 150 : 210, height: 150, text: type === 'circle' ? 'КРУГ' : 'ФИГУРА', color: type === 'circle' ? '#ff8dc7' : '#75a7ff' };
}

export const canvasTemplates: Record<string, InfiniteCanvasDocument> = {
  blank: { version: 1, items: [], connections: [] },
  mindmap: { version: 1, items: [{ id: 'center', type: 'note', x: -110, y: -70, width: 220, height: 140, text: 'ГЛАВНАЯ ИДЕЯ', color: '#f8dc72' }, ...[-1, 1].flatMap((side) => [0, 1].map((row) => ({ id: `idea-${side}-${row}`, type: 'note' as const, x: side * 350 - 100, y: row * 210 - 170, width: 200, height: 130, text: `НАПРАВЛЕНИЕ ${side === -1 ? row + 1 : row + 3}`, color: side === -1 ? '#8eb3ff' : '#8ee0b7' })))], connections: ['idea--1-0', 'idea--1-1', 'idea-1-0', 'idea-1-1'].map((to, index) => ({ id: `mind-${index}`, from: 'center', to })) },
  site: { version: 1, items: ['ГЛАВНАЯ', 'УСЛУГИ', 'ЦЕНЫ', 'КЕЙСЫ', 'КОНТАКТЫ'].map((text, index) => ({ id: `site-${index}`, type: 'rect' as const, x: index === 0 ? -100 : -430 + (index - 1) * 230, y: index === 0 ? -220 : 80, width: 190, height: 100, text, color: index === 0 ? '#75a7ff' : '#303845' })), connections: [1,2,3,4].map((index) => ({ id: `site-line-${index}`, from: 'site-0', to: `site-${index}` })) },
  plan: { version: 1, items: ['ИДЕИ', 'В РАБОТЕ', 'ГОТОВО'].flatMap((title, column) => [{ id: `frame-${column}`, type: 'frame' as const, x: column * 360 - 540, y: -230, width: 320, height: 500, text: title, color: ['#75a7ff','#ffd66b','#63d6a2'][column] }, ...[0,1].map((row) => ({ id: `task-${column}-${row}`, type: 'note' as const, x: column * 360 - 510, y: -140 + row * 180, width: 260, height: 130, text: `ЗАДАЧА ${column * 2 + row + 1}`, color: '#f8dc72' }))]), connections: [] },
};
