import { createDefaultFarmState, normalizeFarmState, type ModernFarmState } from './modernFarmModel';

export type ModernAppId = 'files' | 'browser' | 'mail' | 'notes' | 'calendar' | 'photos' | 'music' | 'terminal' | 'settings' | 'studio' | 'network' | 'about' | 'games' | 'media' | 'ai' | 'code' | 'weblab' | 'documents' | 'archive' | 'monitor' | 'camera' | 'recorder';
export type ModernTheme = 'light' | 'dark' | 'auto';
export type ModernAccent = 'blue' | 'graphite' | 'violet' | 'green' | 'orange';
export type ModernWallpaper = 'aurora' | 'ocean' | 'midnight' | 'glass' | 'vladivostok' | 'sunset-drive' | 'neon-coast' | 'desert-highway' | 'west-coast-night' | 'pacific-drive' | 'custom';
export type ModernSpace = 1 | 2 | 3;
export type ModernFullscreenMode = 'windowed' | 'system' | 'app';

export function resolveModernFullscreenMode(nativeActive: boolean, cssFallbackActive: boolean, appWindowId: string | null): ModernFullscreenMode {
  if (appWindowId) return 'app';
  return nativeActive || cssFallbackActive ? 'system' : 'windowed';
}

export function isModernCompactViewport(width: number) { return Number.isFinite(width) && width > 0 && width < 768; }

export type ModernFile = {
  id: string;
  parentId: string | null;
  name: string;
  kind: 'folder' | 'text' | 'image' | 'audio' | 'video' | 'json';
  content?: string;
  mimeType?: string;
  size?: number;
  tags: string[];
  favorite: boolean;
  deletedAt?: string;
  createdAt: string;
  modifiedAt: string;
};

export type ModernWindowBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ModernWindow = {
  id: string;
  appId: ModernAppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  previousBounds?: ModernWindowBounds;
  space: ModernSpace;
};

export type BrowserTab = { id: string; url: string; title: string; history: string[]; historyIndex: number };
export type ModernNotification = { id: string; title: string; text: string; createdAt: string; kind: 'mail' | 'calendar' | 'system' | 'download' };
export type ModernAiMessage = { id: string; role: 'user' | 'assistant'; text: string };
export type ModernGameId = 'core-shooter' | 'blocks' | 'racing' | 'match' | 'farm';
export type ModernGameProgress = {
  launches: number;
  highScore: number;
  bestTime?: number;
  playTime: number;
  achievements: string[];
  progress: number;
  lastPlayedAt?: string;
};

export type ModernOsState = {
  version: 2;
  booted: boolean;
  locked: boolean;
  profileName: string;
  theme: ModernTheme;
  accent: ModernAccent;
  wallpaper: ModernWallpaper;
  customWallpaper?: string;
  transparency: 'low' | 'medium' | 'high';
  reducedTransparency: boolean;
  brightness: number;
  sound: number;
  networkEnabled: boolean;
  bluetoothEnabled: boolean;
  focusMode: boolean;
  notificationsEnabled: boolean;
  dockMagnification: boolean;
  dockAutoHide: boolean;
  dock: ModernAppId[];
  windows: ModernWindow[];
  activeWindowId: string | null;
  activeSpace: ModernSpace;
  files: ModernFile[];
  notes: Array<{ id: string; title: string; content: string; pinned: boolean; modifiedAt: string }>;
  browser: { tabs: BrowserTab[]; activeTabId: string; recentlyClosed: BrowserTab[]; bookmarks: Array<{ title: string; url: string }>; history: Array<{ url: string; title: string; visitedAt: string }> };
  notifications: ModernNotification[];
  aiMessages: ModernAiMessage[];
  recentApps: ModernAppId[];
  lowPowerMode: boolean;
  games: Record<ModernGameId, ModernGameProgress>;
  farm: ModernFarmState;
};

export const MODERN_OS_STORAGE_KEY = 'sitevl-lab-modern-os-v1';
const created = '2026-08-29T00:00:00.000Z';
let generatedIdSequence = 0;
const createLocalId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(generatedIdSequence++).toString(36)}`;

const file = (id: string, parentId: string | null, name: string, kind: ModernFile['kind'], content?: string): ModernFile => ({ id, parentId, name, kind, content, tags: [], favorite: false, createdAt: created, modifiedAt: created });
const firstTab: BrowserTab = { id: 'tab-home', url: 'sitevl://home', title: 'SITEVL Старт', history: ['sitevl://home'], historyIndex: 0 };

export const defaultModernOsState: ModernOsState = {
  version: 2, booted: false, locked: false, profileName: 'Пользователь SITEVL', theme: 'auto', accent: 'blue', wallpaper: 'aurora', transparency: 'medium', reducedTransparency: false, brightness: 100, sound: 65,
  networkEnabled: true, bluetoothEnabled: false, focusMode: false, notificationsEnabled: true, dockMagnification: true, dockAutoHide: false,
  dock: ['files', 'browser', 'mail', 'notes', 'games', 'media', 'ai', 'terminal', 'settings'], windows: [], activeWindowId: null, activeSpace: 1,
  files: [
    file('drive', null, 'SITEVL Drive', 'folder'), file('desktop', 'drive', 'Рабочий стол', 'folder'), file('documents', 'drive', 'Документы', 'folder'), file('downloads', 'drive', 'Загрузки', 'folder'), file('pictures', 'drive', 'Фото', 'folder'), file('videos', 'drive', 'Видео', 'folder'), file('music', 'drive', 'Музыка', 'folder'), file('games-folder', 'drive', 'Игры', 'folder'), file('applications', 'drive', 'Приложения', 'folder'),
    file('welcome', 'documents', 'Добро пожаловать.txt', 'text', 'SITEVL NOVA — самостоятельная виртуальная desktop-среда.\n\nФайлы хранятся только в этом браузере.'),
    file('project', 'documents', 'project.txt', 'text', 'Откройте SITEVL Studio, чтобы собрать настоящий сайт.'),
    file('nova-json', 'documents', 'nova-system.json', 'json', '{\n  "system": "SITEVL NOVA",\n  "version": 1\n}'),
  ],
  notes: [{ id: 'note-welcome', title: 'Добро пожаловать', content: 'Это локальные заметки SITEVL NOVA. Изменения сохраняются автоматически.', pinned: true, modifiedAt: created }],
  browser: { tabs: [firstTab], activeTabId: firstTab.id, recentlyClosed: [], bookmarks: [{ title: 'SITEVL', url: 'sitevl://home' }, { title: 'LAB', url: 'sitevl://lab' }, { title: 'Studio', url: 'sitevl://studio' }], history: [] },
  notifications: [
    { id: 'welcome-notification', title: 'SITEVL NOVA готова', text: 'Откройте быстрый поиск сочетанием Ctrl/Cmd + Space.', createdAt: created, kind: 'system' },
    { id: 'mail-notification', title: 'Новое письмо', text: 'Команда SITEVL приглашает исследовать систему.', createdAt: created, kind: 'mail' },
  ],
  aiMessages: [],
  recentApps: [], lowPowerMode: false,
  games: {
    'core-shooter': { launches: 0, highScore: 0, playTime: 0, achievements: [], progress: 0 },
    blocks: { launches: 0, highScore: 0, playTime: 0, achievements: [], progress: 0 },
    racing: { launches: 0, highScore: 0, playTime: 0, achievements: [], progress: 0 },
    match: { launches: 0, highScore: 0, playTime: 0, achievements: [], progress: 1 },
    farm: { launches: 0, highScore: 0, playTime: 0, achievements: [], progress: 1 },
  },
  farm: createDefaultFarmState(),
};

const appIds: ModernAppId[] = ['files', 'browser', 'mail', 'notes', 'calendar', 'photos', 'music', 'terminal', 'settings', 'studio', 'network', 'about', 'games', 'media', 'ai', 'code', 'weblab', 'documents', 'archive', 'monitor', 'camera', 'recorder'];
const isAppId = (value: unknown): value is ModernAppId => typeof value === 'string' && appIds.includes(value as ModernAppId);
const clamp = (value: unknown, fallback: number, min = 0, max = 100) => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
const wallpapers: ModernWallpaper[] = ['aurora', 'ocean', 'midnight', 'glass', 'vladivostok', 'sunset-drive', 'neon-coast', 'desert-highway', 'west-coast-night', 'pacific-drive', 'custom'];

const normalizeGameProgress = (value: Partial<ModernGameProgress> | undefined, fallback: ModernGameProgress): ModernGameProgress => ({
  launches: clamp(value?.launches, fallback.launches, 0, 100000),
  highScore: clamp(value?.highScore, fallback.highScore, 0, 100000000),
  bestTime: typeof value?.bestTime === 'number' && value.bestTime > 0 ? value.bestTime : fallback.bestTime,
  playTime: clamp(value?.playTime, fallback.playTime, 0, 100000000),
  achievements: Array.isArray(value?.achievements) ? [...new Set(value.achievements.filter((item): item is string => typeof item === 'string'))].slice(0, 24) : fallback.achievements,
  progress: clamp(value?.progress, fallback.progress, 0, 100),
  lastPlayedAt: typeof value?.lastPlayedAt === 'string' ? value.lastPlayedAt : fallback.lastPlayedAt,
});

const normalizeBounds = (value: Partial<ModernWindowBounds> | undefined, fallback: ModernWindowBounds): ModernWindowBounds => ({
  x: clamp(value?.x, fallback.x, 0, 1800),
  y: clamp(value?.y, fallback.y, 42, 1000),
  width: clamp(value?.width, fallback.width, 320, 1600),
  height: clamp(value?.height, fallback.height, 240, 1000),
});

function compactWindowStack(windows: ModernWindow[], frontId?: string): ModernWindow[] {
  const stack = windows
    .map((window, index) => ({ window, index }))
    .sort((a, b) => a.window.z - b.window.z || a.index - b.index)
    .map(({ window }) => window.id);
  if (frontId && stack.includes(frontId)) {
    stack.splice(stack.indexOf(frontId), 1);
    stack.push(frontId);
  }
  const ranks = new Map(stack.map((id, index) => [id, index + 1]));
  return windows.map((window) => ({ ...window, z: ranks.get(window.id) ?? 1 }));
}

function topVisibleWindowId(windows: ModernWindow[], space: ModernSpace, excludingId?: string): string | null {
  return windows
    .filter((window) => window.id !== excludingId && window.space === space && !window.minimized)
    .sort((a, b) => b.z - a.z)[0]?.id ?? null;
}

export function normalizeModernOsState(value: unknown): ModernOsState {
  if (!value || typeof value !== 'object') return structuredClone(defaultModernOsState);
  const raw = value as Partial<ModernOsState>;
  const persistedFiles = Array.isArray(raw.files) ? raw.files.filter((item): item is ModernFile => Boolean(item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.kind === 'string')) : defaultModernOsState.files;
  const requiredFolders = defaultModernOsState.files.filter((item) => item.kind === 'folder');
  const files = requiredFolders.reduce((items, folder) => items.some((item) => item.id === folder.id) ? items : [...items, folder], persistedFiles).map((item) => item.id === 'pictures' && item.name === 'Изображения' ? { ...item, name: 'Фото' } : item);
  const activeSpace: ModernSpace = raw.activeSpace === 2 || raw.activeSpace === 3 ? raw.activeSpace : 1;
  const windows: ModernWindow[] = compactWindowStack(Array.isArray(raw.windows) ? raw.windows.filter((item): item is ModernWindow => Boolean(item && typeof item.id === 'string' && isAppId(item.appId))).slice(-12).map((item, index) => {
    const bounds = normalizeBounds(item, { x: 80, y: 70, width: 720, height: 520 });
    const previousBounds = item.previousBounds ? normalizeBounds(item.previousBounds, bounds) : undefined;
    return { ...item, ...bounds, previousBounds, z: clamp(item.z, index + 1, 1, 12), minimized: item.minimized === true, maximized: item.maximized === true, space: item.space === 2 || item.space === 3 ? item.space : 1 };
  }) : []);
  const requestedActiveId = typeof raw.activeWindowId === 'string' ? raw.activeWindowId : null;
  const activeWindowId = windows.some((window) => window.id === requestedActiveId && window.space === activeSpace && !window.minimized)
    ? requestedActiveId
    : topVisibleWindowId(windows, activeSpace);
  const browser = raw.browser && typeof raw.browser === 'object' ? raw.browser : defaultModernOsState.browser;
  const tabs = Array.isArray(browser.tabs) ? browser.tabs.filter((tab): tab is BrowserTab => Boolean(tab && typeof tab.id === 'string' && typeof tab.url === 'string')).slice(0, 20) : [firstTab];
  const persistedDock = Array.isArray(raw.dock) ? [...new Set(raw.dock.filter(isAppId))] : [...defaultModernOsState.dock];
  const dock = (['games', 'media', 'ai'] as ModernAppId[]).reduce((items, id) => items.includes(id) ? items : [...items, id], persistedDock);
  return {
    ...defaultModernOsState, ...raw, version: 2,
    theme: raw.theme === 'light' || raw.theme === 'dark' ? raw.theme : 'auto',
    accent: ['blue', 'graphite', 'violet', 'green', 'orange'].includes(raw.accent || '') ? raw.accent! : 'blue',
    wallpaper: wallpapers.includes(raw.wallpaper as ModernWallpaper) ? raw.wallpaper as ModernWallpaper : 'aurora',
    customWallpaper: typeof raw.customWallpaper === 'string' && raw.customWallpaper.startsWith('data:image/') ? raw.customWallpaper : undefined,
    brightness: clamp(raw.brightness, 100), sound: clamp(raw.sound, 65),
    networkEnabled: raw.networkEnabled !== false,
    bluetoothEnabled: raw.bluetoothEnabled === true,
    focusMode: raw.focusMode === true,
    notificationsEnabled: raw.notificationsEnabled !== false,
    dockMagnification: raw.dockMagnification !== false,
    dockAutoHide: raw.dockAutoHide === true,
    activeSpace,
    dock: dock.slice(0, 14),
    files: files.length ? files : defaultModernOsState.files, windows, activeWindowId,
    notes: Array.isArray(raw.notes) ? raw.notes.filter((note) => note && typeof note.id === 'string').slice(0, 100) : defaultModernOsState.notes,
    browser: { ...defaultModernOsState.browser, ...browser, tabs: tabs.length ? tabs : [firstTab], activeTabId: tabs.some((tab) => tab.id === browser.activeTabId) ? browser.activeTabId : (tabs[0]?.id || firstTab.id), recentlyClosed: Array.isArray(browser.recentlyClosed) ? browser.recentlyClosed.slice(-10) : [], history: Array.isArray(browser.history) ? browser.history.slice(-100) : [] },
    notifications: Array.isArray(raw.notifications) ? raw.notifications.filter((item) => item && typeof item.id === 'string').slice(-30) : defaultModernOsState.notifications,
    aiMessages: Array.isArray(raw.aiMessages) ? raw.aiMessages.filter((item): item is ModernAiMessage => Boolean(item && typeof item.id === 'string' && (item.role === 'user' || item.role === 'assistant') && typeof item.text === 'string')).slice(-100) : [],
    recentApps: Array.isArray(raw.recentApps) ? [...new Set(raw.recentApps.filter(isAppId))].slice(-5) : [],
    lowPowerMode: raw.lowPowerMode === true,
    games: {
      'core-shooter': normalizeGameProgress(raw.games?.['core-shooter'], defaultModernOsState.games['core-shooter']),
      blocks: normalizeGameProgress(raw.games?.blocks, defaultModernOsState.games.blocks),
      racing: normalizeGameProgress(raw.games?.racing, defaultModernOsState.games.racing),
      match: normalizeGameProgress(raw.games?.match, defaultModernOsState.games.match),
      farm: normalizeGameProgress(raw.games?.farm, defaultModernOsState.games.farm),
    },
    farm: normalizeFarmState(raw.farm),
  };
}

export function readModernOsState(): ModernOsState { try { const raw = localStorage.getItem(MODERN_OS_STORAGE_KEY); return normalizeModernOsState(raw ? JSON.parse(raw) : undefined); } catch { return structuredClone(defaultModernOsState); } }
export function writeModernOsState(state: ModernOsState) { try { localStorage.setItem(MODERN_OS_STORAGE_KEY, JSON.stringify(normalizeModernOsState(state))); } catch { /* The active simulation remains usable. */ } }

export function openModernWindow(state: ModernOsState, appId: ModernAppId, title: string): ModernOsState {
  const existing = state.windows.filter((item) => item.appId === appId && item.space === state.activeSpace).sort((a, b) => b.z - a.z)[0];
  const recentApps = [appId, ...state.recentApps.filter((id) => id !== appId)].slice(0, 5);
  if (existing) return { ...focusModernWindow(state, existing.id), recentApps };
  const offset = state.windows.length % 5;
  const window: ModernWindow = { id: `window-${appId}-${Date.now()}`, appId, title, x: 80 + offset * 28, y: 72 + offset * 24, width: appId === 'settings' ? 820 : 900, height: 610, z: state.windows.length + 1, minimized: false, maximized: false, space: state.activeSpace };
  return { ...state, recentApps, windows: compactWindowStack([...state.windows, window], window.id), activeWindowId: window.id };
}
export function focusModernWindow(state: ModernOsState, id: string): ModernOsState {
  const target = state.windows.find((window) => window.id === id);
  if (!target) return state;
  const windows = compactWindowStack(state.windows.map((window) => window.id === id ? { ...window, minimized: false } : window), id);
  return { ...state, activeSpace: target.space, windows, activeWindowId: id };
}
export function patchModernWindow(state: ModernOsState, id: string, patch: Partial<ModernWindow>): ModernOsState {
  return { ...state, windows: compactWindowStack(state.windows.map((window) => window.id === id ? { ...window, ...patch, id: window.id, appId: window.appId } : window)) };
}
export function minimizeModernWindow(state: ModernOsState, id: string): ModernOsState {
  if (!state.windows.some((window) => window.id === id)) return state;
  const windows = compactWindowStack(state.windows.map((window) => window.id === id ? { ...window, minimized: true } : window));
  const activeWindowId = state.activeWindowId === id ? topVisibleWindowId(windows, state.activeSpace, id) : state.activeWindowId;
  return { ...state, windows, activeWindowId };
}
export function restoreModernWindow(state: ModernOsState, id: string): ModernOsState { return focusModernWindow(state, id); }
export function toggleMaximizeModernWindow(state: ModernOsState, id: string): ModernOsState {
  const target = state.windows.find((window) => window.id === id);
  if (!target) return state;
  const focused = focusModernWindow(state, id);
  const bounds: ModernWindowBounds = { x: target.x, y: target.y, width: target.width, height: target.height };
  return {
    ...focused,
    windows: focused.windows.map((window) => {
      if (window.id !== id) return window;
      if (window.maximized) return { ...window, ...(window.previousBounds ?? bounds), maximized: false, previousBounds: undefined };
      return { ...window, maximized: true, previousBounds: bounds };
    }),
  };
}
export function closeModernWindow(state: ModernOsState, id: string): ModernOsState {
  const windows = compactWindowStack(state.windows.filter((window) => window.id !== id));
  const activeWindowId = state.activeWindowId === id ? topVisibleWindowId(windows, state.activeSpace) : state.activeWindowId;
  return { ...state, windows, activeWindowId: windows.some((window) => window.id === activeWindowId) ? activeWindowId : topVisibleWindowId(windows, state.activeSpace) };
}

export function clampModernWindowBounds(bounds: ModernWindowBounds, viewport: { width: number; height: number }): ModernWindowBounds {
  const left = 8; const top = 50; const right = 8; const bottom = 86;
  const availableWidth = Math.max(1, viewport.width - left - right);
  const availableHeight = Math.max(1, viewport.height - top - bottom);
  const width = Math.min(availableWidth, Math.max(Math.min(320, availableWidth), bounds.width));
  const height = Math.min(availableHeight, Math.max(Math.min(240, availableHeight), bounds.height));
  return {
    x: Math.min(Math.max(left, bounds.x), Math.max(left, viewport.width - right - width)),
    y: Math.min(Math.max(top, bounds.y), Math.max(top, viewport.height - bottom - height)),
    width,
    height,
  };
}

export function clampModernWindowsToViewport(state: ModernOsState, viewport: { width: number; height: number }): ModernOsState {
  return {
    ...state,
    windows: state.windows.map((window) => {
      if (window.maximized) return window;
      return { ...window, ...clampModernWindowBounds(window, viewport) };
    }),
  };
}

export function createModernFile(state: ModernOsState, parentId: string, name: string, kind: 'folder' | 'text' = 'text'): ModernOsState { const now = new Date().toISOString(); return { ...state, files: [...state.files, { id: createLocalId('file'), parentId, name: name.trim() || (kind === 'folder' ? 'Новая папка' : 'Новый документ.txt'), kind, content: kind === 'text' ? '' : undefined, tags: [], favorite: false, createdAt: now, modifiedAt: now }] }; }
export function importModernFile(state: ModernOsState, input: { parentId: string; name: string; kind: ModernFile['kind']; content: string; mimeType?: string; size?: number }): ModernOsState {
  const now = new Date().toISOString();
  return { ...state, files: [...state.files, { id: createLocalId('file'), ...input, name: input.name.trim() || 'Новый файл', tags: [], favorite: false, createdAt: now, modifiedAt: now }] };
}
export function updateModernFileContent(state: ModernOsState, id: string, content: string): ModernOsState {
  return { ...state, files: state.files.map((item) => item.id === id && item.kind !== 'folder' ? { ...item, content, size: new Blob([content]).size, modifiedAt: new Date().toISOString() } : item) };
}
export function toggleModernFileFavorite(state: ModernOsState, id: string): ModernOsState {
  return { ...state, files: state.files.map((item) => item.id === id ? { ...item, favorite: !item.favorite, modifiedAt: new Date().toISOString() } : item) };
}
export function trashModernFile(state: ModernOsState, id: string): ModernOsState { return { ...state, files: state.files.map((item) => item.id === id && item.id !== 'drive' ? { ...item, deletedAt: new Date().toISOString() } : item) }; }
export function restoreModernFile(state: ModernOsState, id: string): ModernOsState { return { ...state, files: state.files.map((item) => item.id === id ? { ...item, deletedAt: undefined } : item) }; }
export function renameModernFile(state: ModernOsState, id: string, name: string): ModernOsState {
  const nextName = name.trim(); if (!nextName || id === 'drive') return state;
  return { ...state, files: state.files.map((item) => item.id === id ? { ...item, name: nextName, modifiedAt: new Date().toISOString() } : item) };
}
export function deleteModernFilePermanently(state: ModernOsState, id: string): ModernOsState {
  if (id === 'drive') return state;
  const removed = new Set([id]);
  let changed = true;
  while (changed) { changed = false; state.files.forEach((item) => { if (item.parentId && removed.has(item.parentId) && !removed.has(item.id)) { removed.add(item.id); changed = true; } }); }
  return { ...state, files: state.files.filter((item) => !removed.has(item.id)) };
}
export function emptyModernTrash(state: ModernOsState): ModernOsState {
  return state.files.filter((item) => item.deletedAt).reduce((current, item) => deleteModernFilePermanently(current, item.id), state);
}
export function moveModernFile(state: ModernOsState, id: string, parentId: string): ModernOsState {
  const target = state.files.find((item) => item.id === id); const parent = state.files.find((item) => item.id === parentId);
  if (!target || target.id === 'drive' || !parent || parent.kind !== 'folder' || parent.deletedAt || id === parentId) return state;
  let cursor: ModernFile | undefined = parent;
  while (cursor?.parentId) { if (cursor.parentId === id) return state; cursor = state.files.find((item) => item.id === cursor?.parentId); }
  return { ...state, files: state.files.map((item) => item.id === id ? { ...item, parentId, deletedAt: undefined, modifiedAt: new Date().toISOString() } : item) };
}

export function validateModernBrowserUrl(input: string) {
  const value = input.trim();
  if (/^sitevl:\/\/(home|lab|studio|ai|games|farm|about|help)$/i.test(value)) return { ok: true as const, url: value.toLowerCase() };
  const candidate = /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`;
  try { const url = new URL(candidate); return url.protocol === 'http:' || url.protocol === 'https:' ? { ok: true as const, url: url.toString() } : { ok: false as const, error: 'Разрешены только http, https и внутренние страницы sitevl.' }; } catch { return { ok: false as const, error: 'Введите корректный адрес сайта.' }; }
}

export function navigateModernTab(state: ModernOsState, tabId: string, input: string): { state: ModernOsState; error?: string } {
  const checked = validateModernBrowserUrl(input); if (!checked.ok) return { state, error: checked.error };
  const title = checked.url.startsWith('sitevl://') ? checked.url.replace('sitevl://', 'SITEVL · ') : new URL(checked.url).hostname;
  const tabs = state.browser.tabs.map((tab) => tab.id === tabId ? { ...tab, url: checked.url, title, history: [...tab.history.slice(0, tab.historyIndex + 1), checked.url].slice(-50), historyIndex: Math.min(49, tab.historyIndex + 1) } : tab);
  return { state: { ...state, browser: { ...state.browser, tabs, history: [...state.browser.history, { url: checked.url, title, visitedAt: new Date().toISOString() }].slice(-100) } } };
}

export function addModernBrowserTab(state: ModernOsState): ModernOsState { if (state.browser.tabs.length >= 20) return state; const tab = { ...firstTab, id: `tab-${Date.now()}` }; return { ...state, browser: { ...state.browser, tabs: [...state.browser.tabs, tab], activeTabId: tab.id } }; }
export function closeModernBrowserTab(state: ModernOsState, id: string): ModernOsState { const closing = state.browser.tabs.find((tab) => tab.id === id); const tabs = state.browser.tabs.filter((tab) => tab.id !== id); const safeTabs = tabs.length ? tabs : [{ ...firstTab, id: `tab-${Date.now()}` }]; return { ...state, browser: { ...state.browser, tabs: safeTabs, activeTabId: state.browser.activeTabId === id ? safeTabs[0].id : state.browser.activeTabId, recentlyClosed: closing ? [...state.browser.recentlyClosed, closing].slice(-10) : state.browser.recentlyClosed } }; }

export function moveModernBrowserHistory(state: ModernOsState, tabId: string, delta: -1 | 1): ModernOsState {
  const tab = state.browser.tabs.find((item) => item.id === tabId); if (!tab) return state;
  const index = Math.max(0, Math.min(tab.history.length - 1, tab.historyIndex + delta)); if (index === tab.historyIndex) return state;
  const url = tab.history[index]; const title = url.startsWith('sitevl://') ? url.replace('sitevl://', 'SITEVL · ') : new URL(url).hostname;
  return { ...state, browser: { ...state.browser, tabs: state.browser.tabs.map((item) => item.id === tabId ? { ...item, url, title, historyIndex: index } : item) } };
}

export function duplicateModernBrowserTab(state: ModernOsState, tabId: string): ModernOsState {
  if (state.browser.tabs.length >= 20) return state; const source = state.browser.tabs.find((item) => item.id === tabId); if (!source) return state;
  const tab = { ...source, id: `tab-${Date.now()}`, history: [...source.history] };
  return { ...state, browser: { ...state.browser, tabs: [...state.browser.tabs, tab], activeTabId: tab.id } };
}

export function reopenModernBrowserTab(state: ModernOsState): ModernOsState {
  if (!state.browser.recentlyClosed.length || state.browser.tabs.length >= 20) return state;
  const closed = state.browser.recentlyClosed[state.browser.recentlyClosed.length - 1]; const tab = { ...closed, id: `tab-${Date.now()}`, history: [...closed.history] };
  return { ...state, browser: { ...state.browser, tabs: [...state.browser.tabs, tab], activeTabId: tab.id, recentlyClosed: state.browser.recentlyClosed.slice(0, -1) } };
}

export function toggleModernBookmark(state: ModernOsState, title: string, url: string): ModernOsState {
  const exists = state.browser.bookmarks.some((item) => item.url === url);
  const bookmarks = exists ? state.browser.bookmarks.filter((item) => item.url !== url) : [...state.browser.bookmarks, { title, url }].slice(-50);
  return { ...state, browser: { ...state.browser, bookmarks } };
}

export function clearModernBrowserHistory(state: ModernOsState): ModernOsState {
  return { ...state, browser: { ...state.browser, history: [] } };
}

export function searchModernOs(state: ModernOsState, query: string, apps: Array<{ id: ModernAppId; label: string }>) { const q = query.trim().toLocaleLowerCase('ru'); if (!q) return []; return [...apps.filter((app) => `${app.label} ${app.id}`.toLocaleLowerCase('ru').includes(q)).map((app) => ({ id: `app-${app.id}`, type: 'Приложение', title: app.label, appId: app.id })), ...state.files.filter((item) => !item.deletedAt && item.name.toLocaleLowerCase('ru').includes(q)).map((item) => ({ id: `file-${item.id}`, type: 'Файл', title: item.name, appId: 'files' as ModernAppId })), ...state.notes.filter((note) => `${note.title} ${note.content}`.toLocaleLowerCase('ru').includes(q)).map((note) => ({ id: `note-${note.id}`, type: 'Заметка', title: note.title, appId: 'notes' as ModernAppId }))].slice(0, 12); }

export function reorderModernDock(state: ModernOsState, source: ModernAppId, target: ModernAppId): ModernOsState {
  if (source === target || !state.dock.includes(source) || !state.dock.includes(target)) return state;
  const dock = [...state.dock]; const from = dock.indexOf(source); const to = dock.indexOf(target); dock.splice(from, 1); dock.splice(to, 0, source);
  return { ...state, dock };
}

export function moveModernDockItem(state: ModernOsState, id: ModernAppId, delta: -1 | 1): ModernOsState {
  const index = state.dock.indexOf(id); const target = index + delta; if (index < 0 || target < 0 || target >= state.dock.length) return state;
  const dock = [...state.dock]; [dock[index], dock[target]] = [dock[target], dock[index]]; return { ...state, dock };
}

export function launchModernGame(state: ModernOsState, id: ModernGameId): ModernOsState {
  const current = state.games[id]; return { ...state, games: { ...state.games, [id]: { ...current, launches: current.launches + 1 } } };
}
export function recordModernGame(state: ModernOsState, id: ModernGameId, score: number, time?: number, playTime = 0, achievement?: string, progress?: number): ModernOsState {
  const current = state.games[id];
  const achievements = achievement ? [...new Set([...current.achievements, achievement])] : current.achievements;
  return { ...state, games: { ...state.games, [id]: { ...current, highScore: Math.max(current.highScore, Math.max(0, Math.round(score))), bestTime: time && time > 0 ? current.bestTime ? Math.min(current.bestTime, time) : time : current.bestTime, playTime: current.playTime + Math.max(0, Math.round(playTime)), achievements, progress: progress === undefined ? current.progress : clamp(progress, current.progress, 0, 100), lastPlayedAt: new Date().toISOString() } } };
}

export type ModernMediaKind = 'audio' | 'video' | 'unsupported';
export function getModernMediaKind(file: Pick<File, 'name' | 'type'>): ModernMediaKind {
  const type = file.type.toLowerCase(); const extension = file.name.split('.').pop()?.toLowerCase();
  if (type.startsWith('audio/') || ['mp3', 'aac', 'wav', 'flac', 'm4a', 'ogg'].includes(extension || '')) return 'audio';
  if (type.startsWith('video/') || ['mp4', 'webm', 'mov', 'm4v', 'ogv'].includes(extension || '')) return 'video';
  return 'unsupported';
}

export type ModernAiAction =
  | { type: 'OPEN_APP'; appId: ModernAppId }
  | { type: 'CLOSE_APP'; appId: ModernAppId }
  | { type: 'OPEN_SETTINGS' }
  | { type: 'SET_THEME'; value: ModernTheme }
  | { type: 'SET_VOLUME'; value: number }
  | { type: 'OPEN_GAME'; gameId: ModernGameId }
  | { type: 'OPEN_FARM' }
  | { type: 'SHOW_FARM_STATUS' }
  | { type: 'ENTER_FULLSCREEN' }
  | { type: 'EXIT_FULLSCREEN' };

export function normalizeModernAiAction(value: unknown): ModernAiAction | null {
  if (!value || typeof value !== 'object') return null; const action = value as Record<string, unknown>;
  if (action.type === 'OPEN_APP' && isAppId(action.appId)) return { type: 'OPEN_APP', appId: action.appId };
  if (action.type === 'CLOSE_APP' && isAppId(action.appId)) return { type: 'CLOSE_APP', appId: action.appId };
  if (action.type === 'OPEN_SETTINGS') return { type: 'OPEN_SETTINGS' };
  if (action.type === 'SET_THEME' && (action.value === 'light' || action.value === 'dark' || action.value === 'auto')) return { type: 'SET_THEME', value: action.value };
  if (action.type === 'SET_VOLUME' && typeof action.value === 'number' && Number.isFinite(action.value)) return { type: 'SET_VOLUME', value: clamp(action.value, 65) };
  if (action.type === 'OPEN_GAME' && (action.gameId === 'core-shooter' || action.gameId === 'blocks' || action.gameId === 'racing' || action.gameId === 'match' || action.gameId === 'farm')) return { type: 'OPEN_GAME', gameId: action.gameId };
  if (action.type === 'OPEN_FARM' || action.type === 'SHOW_FARM_STATUS') return { type: action.type };
  if (action.type === 'ENTER_FULLSCREEN' || action.type === 'EXIT_FULLSCREEN') return { type: action.type };
  return null;
}

export function parseModernLocalAiAction(input: string, farm?: ModernFarmState): { action: ModernAiAction; response: string } | null {
  const value = input.trim().toLocaleLowerCase('ru').replace(/[!?.,]+$/g, '');
  if (/^(открой|запусти)\s+(браузер|интернет)$/.test(value)) return { action: { type: 'OPEN_APP', appId: 'browser' }, response: 'Открываю браузер.' };
  if (/^(открой|покажи)\s+настройки$/.test(value)) return { action: { type: 'OPEN_SETTINGS' }, response: 'Открываю настройки.' };
  if (/^(открой|запусти)\s+игры$/.test(value)) return { action: { type: 'OPEN_APP', appId: 'games' }, response: 'Открываю игры.' };
  if (/^(открой|запусти|покажи)\s+(ферму|sitevl farm)$/.test(value)) return { action: { type: 'OPEN_FARM' }, response: 'Открываю игровой центр с SITEVL FARM.' };
  if (/^(покажи|какой|что)\s+.*(статус|ферм)/.test(value) && farm) { const now = Date.now(); const ready = farm.plots.filter((plot) => plot.readyAt && plot.readyAt <= now).length + farm.processes.filter((process) => process.readyAt <= now).length + farm.animals.filter((animal) => animal.readyAt && animal.readyAt <= now).length; return { action: { type: 'SHOW_FARM_STATUS' }, response: `${farm.farmName}: уровень ${farm.level}, ${farm.coins} монет, амбар ${Object.values(farm.inventory).reduce((sum, amount) => sum + amount, 0)} предметов. Готово к сбору: ${ready}.` }; }
  if (/^(открой|запусти)\s+(редактор кода|код)$/.test(value)) return { action: { type: 'OPEN_APP', appId: 'code' }, response: 'Открываю редактор кода.' };
  if (/^(открой|запусти)\s+(html lab|web lab|веб-лабораторию)$/.test(value)) return { action: { type: 'OPEN_APP', appId: 'weblab' }, response: 'Открываю WEB LAB.' };
  if (/^(сделай|включи)\s+((тему\s+)?т[её]мную|т[её]мную\s+тему)$/.test(value)) return { action: { type: 'SET_THEME', value: 'dark' }, response: 'Тёмная тема включена.' };
  if (/^(сделай|включи)\s+((тему\s+)?светлую|светлую\s+тему)$/.test(value)) return { action: { type: 'SET_THEME', value: 'light' }, response: 'Светлая тема включена.' };
  const volume = value.match(/^(?:установи|поставь|сделай)\s+громкость\s+(\d{1,3})\s*%?$/);
  if (volume) return { action: { type: 'SET_VOLUME', value: Number(volume[1]) }, response: `Устанавливаю громкость ${Math.min(100, Number(volume[1]))}%.` };
  if (/^(?:включи|открой)\s+полноэкранный режим$/.test(value)) return { action: { type: 'ENTER_FULLSCREEN' }, response: 'Включаю полноэкранный режим.' };
  return null;
}
