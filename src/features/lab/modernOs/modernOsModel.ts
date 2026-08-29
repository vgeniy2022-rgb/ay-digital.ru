export type ModernAppId = 'files' | 'browser' | 'mail' | 'notes' | 'calendar' | 'photos' | 'music' | 'terminal' | 'settings' | 'studio' | 'network' | 'about' | 'games' | 'media' | 'ai';
export type ModernTheme = 'light' | 'dark' | 'auto';
export type ModernAccent = 'blue' | 'graphite' | 'violet' | 'green' | 'orange';
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
  tags: string[];
  favorite: boolean;
  deletedAt?: string;
  createdAt: string;
  modifiedAt: string;
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
  space: ModernSpace;
};

export type BrowserTab = { id: string; url: string; title: string; history: string[]; historyIndex: number };
export type ModernNotification = { id: string; title: string; text: string; createdAt: string; kind: 'mail' | 'calendar' | 'system' | 'download' };

export type ModernOsState = {
  version: 1;
  booted: boolean;
  locked: boolean;
  profileName: string;
  theme: ModernTheme;
  accent: ModernAccent;
  wallpaper: 'aurora' | 'ocean' | 'midnight' | 'glass' | 'vladivostok';
  transparency: 'low' | 'medium' | 'high';
  reducedTransparency: boolean;
  brightness: number;
  sound: number;
  dock: ModernAppId[];
  windows: ModernWindow[];
  activeSpace: ModernSpace;
  files: ModernFile[];
  notes: Array<{ id: string; title: string; content: string; pinned: boolean; modifiedAt: string }>;
  browser: { tabs: BrowserTab[]; activeTabId: string; recentlyClosed: BrowserTab[]; bookmarks: Array<{ title: string; url: string }>; history: Array<{ url: string; title: string; visitedAt: string }> };
  notifications: ModernNotification[];
  recentApps: ModernAppId[];
  lowPowerMode: boolean;
  games: Record<'core-shooter' | 'blocks' | 'racing', { launches: number; highScore: number; bestTime?: number }>;
};

export const MODERN_OS_STORAGE_KEY = 'sitevl-lab-modern-os-v1';
const created = '2026-08-29T00:00:00.000Z';

const file = (id: string, parentId: string | null, name: string, kind: ModernFile['kind'], content?: string): ModernFile => ({ id, parentId, name, kind, content, tags: [], favorite: false, createdAt: created, modifiedAt: created });
const firstTab: BrowserTab = { id: 'tab-home', url: 'sitevl://home', title: 'SITEVL Start', history: ['sitevl://home'], historyIndex: 0 };

export const defaultModernOsState: ModernOsState = {
  version: 1, booted: false, locked: false, profileName: 'Пользователь SITEVL', theme: 'auto', accent: 'blue', wallpaper: 'aurora', transparency: 'medium', reducedTransparency: false, brightness: 100, sound: 65,
  dock: ['files', 'browser', 'mail', 'notes', 'games', 'media', 'ai', 'terminal', 'settings'], windows: [], activeSpace: 1,
  files: [
    file('drive', null, 'SITEVL Drive', 'folder'), file('desktop', 'drive', 'Рабочий стол', 'folder'), file('documents', 'drive', 'Документы', 'folder'), file('downloads', 'drive', 'Загрузки', 'folder'), file('pictures', 'drive', 'Изображения', 'folder'), file('music', 'drive', 'Музыка', 'folder'),
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
  recentApps: [], lowPowerMode: false,
  games: { 'core-shooter': { launches: 0, highScore: 0 }, blocks: { launches: 0, highScore: 0 }, racing: { launches: 0, highScore: 0 } },
};

const appIds: ModernAppId[] = ['files', 'browser', 'mail', 'notes', 'calendar', 'photos', 'music', 'terminal', 'settings', 'studio', 'network', 'about', 'games', 'media', 'ai'];
const isAppId = (value: unknown): value is ModernAppId => typeof value === 'string' && appIds.includes(value as ModernAppId);
const clamp = (value: unknown, fallback: number, min = 0, max = 100) => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

export function normalizeModernOsState(value: unknown): ModernOsState {
  if (!value || typeof value !== 'object') return structuredClone(defaultModernOsState);
  const raw = value as Partial<ModernOsState>;
  const files = Array.isArray(raw.files) ? raw.files.filter((item): item is ModernFile => Boolean(item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.kind === 'string')) : defaultModernOsState.files;
  const windows: ModernWindow[] = Array.isArray(raw.windows) ? raw.windows.filter((item): item is ModernWindow => Boolean(item && typeof item.id === 'string' && isAppId(item.appId))).slice(-12).map((item, index) => ({ ...item, x: clamp(item.x, 80, 0, 1800), y: clamp(item.y, 70, 42, 1000), width: clamp(item.width, 720, 320, 1600), height: clamp(item.height, 520, 240, 1000), z: index + 1, space: item.space === 2 || item.space === 3 ? item.space : 1 })) : [];
  const browser = raw.browser && typeof raw.browser === 'object' ? raw.browser : defaultModernOsState.browser;
  const tabs = Array.isArray(browser.tabs) ? browser.tabs.filter((tab): tab is BrowserTab => Boolean(tab && typeof tab.id === 'string' && typeof tab.url === 'string')).slice(0, 20) : [firstTab];
  return {
    ...defaultModernOsState, ...raw, version: 1,
    theme: raw.theme === 'light' || raw.theme === 'dark' ? raw.theme : 'auto',
    accent: ['blue', 'graphite', 'violet', 'green', 'orange'].includes(raw.accent || '') ? raw.accent! : 'blue',
    brightness: clamp(raw.brightness, 100), sound: clamp(raw.sound, 65),
    activeSpace: raw.activeSpace === 2 || raw.activeSpace === 3 ? raw.activeSpace : 1,
    dock: Array.isArray(raw.dock) ? [...new Set(raw.dock.filter(isAppId))].slice(0, 12) : defaultModernOsState.dock,
    files: files.length ? files : defaultModernOsState.files, windows,
    notes: Array.isArray(raw.notes) ? raw.notes.filter((note) => note && typeof note.id === 'string').slice(0, 100) : defaultModernOsState.notes,
    browser: { ...defaultModernOsState.browser, ...browser, tabs: tabs.length ? tabs : [firstTab], activeTabId: tabs.some((tab) => tab.id === browser.activeTabId) ? browser.activeTabId : (tabs[0]?.id || firstTab.id), recentlyClosed: Array.isArray(browser.recentlyClosed) ? browser.recentlyClosed.slice(-10) : [], history: Array.isArray(browser.history) ? browser.history.slice(-100) : [] },
    notifications: Array.isArray(raw.notifications) ? raw.notifications.filter((item) => item && typeof item.id === 'string').slice(-30) : defaultModernOsState.notifications,
    recentApps: Array.isArray(raw.recentApps) ? [...new Set(raw.recentApps.filter(isAppId))].slice(-5) : [],
    lowPowerMode: raw.lowPowerMode === true,
    games: {
      'core-shooter': { ...defaultModernOsState.games['core-shooter'], ...(raw.games?.['core-shooter'] || {}) },
      blocks: { ...defaultModernOsState.games.blocks, ...(raw.games?.blocks || {}) },
      racing: { ...defaultModernOsState.games.racing, ...(raw.games?.racing || {}) },
    },
  };
}

export function readModernOsState(): ModernOsState { try { const raw = localStorage.getItem(MODERN_OS_STORAGE_KEY); return normalizeModernOsState(raw ? JSON.parse(raw) : undefined); } catch { return structuredClone(defaultModernOsState); } }
export function writeModernOsState(state: ModernOsState) { try { localStorage.setItem(MODERN_OS_STORAGE_KEY, JSON.stringify(normalizeModernOsState(state))); } catch { /* The active simulation remains usable. */ } }

export function openModernWindow(state: ModernOsState, appId: ModernAppId, title: string): ModernOsState {
  const existing = state.windows.find((item) => item.appId === appId && item.space === state.activeSpace);
  const z = Math.max(0, ...state.windows.map((item) => item.z)) + 1;
  const recentApps = [appId, ...state.recentApps.filter((id) => id !== appId)].slice(0, 5);
  if (existing) return { ...state, recentApps, windows: state.windows.map((item) => item.id === existing.id ? { ...item, minimized: false, z } : item) };
  const offset = state.windows.length % 5;
  const next = { ...state, recentApps, windows: [...state.windows, { id: `window-${appId}-${Date.now()}`, appId, title, x: 80 + offset * 28, y: 72 + offset * 24, width: appId === 'settings' ? 820 : 900, height: 610, z, minimized: false, maximized: false, space: state.activeSpace }] };
  return next;
}
export function focusModernWindow(state: ModernOsState, id: string): ModernOsState { const z = Math.max(0, ...state.windows.map((item) => item.z)) + 1; return { ...state, windows: state.windows.map((item) => item.id === id ? { ...item, z, minimized: false } : item) }; }
export function patchModernWindow(state: ModernOsState, id: string, patch: Partial<ModernWindow>): ModernOsState { return { ...state, windows: state.windows.map((item) => item.id === id ? { ...item, ...patch } : item) }; }
export function closeModernWindow(state: ModernOsState, id: string): ModernOsState { return { ...state, windows: state.windows.filter((item) => item.id !== id) }; }

export function createModernFile(state: ModernOsState, parentId: string, name: string, kind: 'folder' | 'text' = 'text'): ModernOsState { const now = new Date().toISOString(); return { ...state, files: [...state.files, { id: `file-${Date.now()}`, parentId, name: name.trim() || (kind === 'folder' ? 'Новая папка' : 'Новый документ.txt'), kind, content: kind === 'text' ? '' : undefined, tags: [], favorite: false, createdAt: now, modifiedAt: now }] }; }
export function trashModernFile(state: ModernOsState, id: string): ModernOsState { return { ...state, files: state.files.map((item) => item.id === id && item.id !== 'drive' ? { ...item, deletedAt: new Date().toISOString() } : item) }; }
export function restoreModernFile(state: ModernOsState, id: string): ModernOsState { return { ...state, files: state.files.map((item) => item.id === id ? { ...item, deletedAt: undefined } : item) }; }

export function validateModernBrowserUrl(input: string) {
  const value = input.trim();
  if (/^sitevl:\/\/(home|lab|studio|ai|games|about|help)$/i.test(value)) return { ok: true as const, url: value.toLowerCase() };
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

export function searchModernOs(state: ModernOsState, query: string, apps: Array<{ id: ModernAppId; label: string }>) { const q = query.trim().toLocaleLowerCase('ru'); if (!q) return []; return [...apps.filter((app) => `${app.label} ${app.id}`.toLocaleLowerCase('ru').includes(q)).map((app) => ({ id: `app-${app.id}`, type: 'Приложение', title: app.label, appId: app.id })), ...state.files.filter((item) => !item.deletedAt && item.name.toLocaleLowerCase('ru').includes(q)).map((item) => ({ id: `file-${item.id}`, type: 'Файл', title: item.name, appId: 'files' as ModernAppId })), ...state.notes.filter((note) => `${note.title} ${note.content}`.toLocaleLowerCase('ru').includes(q)).map((note) => ({ id: `note-${note.id}`, type: 'Заметка', title: note.title, appId: 'notes' as ModernAppId }))].slice(0, 12); }

export type ModernGameId = keyof ModernOsState['games'];
export function recordModernGame(state: ModernOsState, id: ModernGameId, score: number, time?: number): ModernOsState {
  const current = state.games[id];
  return { ...state, games: { ...state.games, [id]: { launches: current.launches + 1, highScore: Math.max(current.highScore, Math.max(0, Math.round(score))), bestTime: time && time > 0 ? current.bestTime ? Math.min(current.bestTime, time) : time : current.bestTime } } };
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
  | { type: 'ENTER_FULLSCREEN' }
  | { type: 'EXIT_FULLSCREEN' };

export function normalizeModernAiAction(value: unknown): ModernAiAction | null {
  if (!value || typeof value !== 'object') return null; const action = value as Record<string, unknown>;
  if (action.type === 'OPEN_APP' && isAppId(action.appId)) return { type: 'OPEN_APP', appId: action.appId };
  if (action.type === 'CLOSE_APP' && isAppId(action.appId)) return { type: 'CLOSE_APP', appId: action.appId };
  if (action.type === 'OPEN_SETTINGS') return { type: 'OPEN_SETTINGS' };
  if (action.type === 'SET_THEME' && (action.value === 'light' || action.value === 'dark' || action.value === 'auto')) return { type: 'SET_THEME', value: action.value };
  if (action.type === 'SET_VOLUME' && typeof action.value === 'number' && Number.isFinite(action.value)) return { type: 'SET_VOLUME', value: clamp(action.value, 65) };
  if (action.type === 'OPEN_GAME' && (action.gameId === 'core-shooter' || action.gameId === 'blocks' || action.gameId === 'racing')) return { type: 'OPEN_GAME', gameId: action.gameId };
  if (action.type === 'ENTER_FULLSCREEN' || action.type === 'EXIT_FULLSCREEN') return { type: action.type };
  return null;
}
