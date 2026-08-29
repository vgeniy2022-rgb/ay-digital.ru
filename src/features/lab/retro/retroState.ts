export type RetroSystem = 'desk95' | 'classic' | 'mono';
export type CrtLevel = 'off' | 'low' | 'medium' | 'high';
export type RetroFileKind = 'folder' | 'text' | 'image' | 'app' | 'link';

export type RetroFile = {
  id: string;
  parentId: string | null;
  name: string;
  kind: RetroFileKind;
  content?: string;
  hidden?: boolean;
  readonly?: boolean;
  size?: number;
  mimeType?: string;
  deletedAt?: string;
  originalParentId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RetroVisit = { url: string; title: string; visitedAt: string };
export type RetroBookmark = { id: string; title: string; url: string };
export type RetroState = {
  version: 4;
  files: RetroFile[];
  floppyInserted: boolean;
  selectedSystem: RetroSystem | null;
  visitedSystems: RetroSystem[];
  crt: { level: CrtLevel; scanlines: boolean; curvature: boolean; glow: boolean; noise: boolean; flicker: boolean };
  browser: { history: RetroVisit[]; bookmarks: RetroBookmark[] };
  games: Record<string, { launches: number; highScore: number }>;
  clipboard?: { fileId: string; mode: 'copy' | 'cut' };
  installedApps: string[];
  network: { connected: boolean; fastConnect: boolean; labServerUnlocked: boolean; sharedFileIds: string[] };
  mail: { readIds: string[]; savedAttachmentIds: string[] };
  chat: { joinedChannels: string[]; discoveredCore: boolean };
  quest: { step: number; events: string[]; completed: boolean };
  desktop: Record<RetroSystem, { wallpaper: string; resolution: '640x480' | '800x600' | '1024x768'; startupApps: string[] }>;
  windows: Partial<Record<RetroSystem, Array<{ id: string; x: number; y: number; width: number; height: number; minimized: boolean; maximized: boolean }>>>;
};

export const RETRO_STORAGE_KEY = 'sitevl-lab-retro-v4';
const RETRO_V3_STORAGE_KEY = 'sitevl-lab-retro-v3';
const LEGACY_NOTE_KEY = 'sitevl-retro-note-v1';
const now = '2026-08-28T00:00:00.000Z';

const file = (id: string, parentId: string | null, name: string, kind: RetroFileKind, content?: string, hidden = false, readonly = false): RetroFile => ({ id, parentId, name, kind, content, hidden, readonly, size: new Blob([content || '']).size, createdAt: now, updatedAt: now });

export const defaultRetroState: RetroState = {
  version: 4,
  floppyInserted: true,
  selectedSystem: null,
  visitedSystems: [],
  crt: { level: 'medium', scanlines: true, curvature: true, glow: false, noise: false, flicker: false },
  browser: {
    history: [],
    bookmarks: [
      { id: 'bookmark-sitevl', title: 'SITEVL', url: 'sitevl://home' },
      { id: 'bookmark-lab', title: 'SITEVL LAB', url: 'sitevl://lab' },
      { id: 'bookmark-wikipedia', title: 'Wikipedia', url: 'https://ru.wikipedia.org/' },
      { id: 'bookmark-archive', title: 'Internet Archive', url: 'https://archive.org/' },
      { id: 'bookmark-example', title: 'Example.com', url: 'https://example.com/' },
    ],
  },
  games: { snake: { launches: 0, highScore: 0 }, pong: { launches: 0, highScore: 0 } },
  installedApps: ['files', 'notes', 'paint', 'calculator', 'terminal', 'snake', 'browser', 'about', 'control', 'mail', 'chat', 'network', 'basic', 'weblab'],
  network: { connected: false, fastConnect: false, labServerUnlocked: false, sharedFileIds: ['welcome'] },
  mail: { readIds: [], savedAttachmentIds: [] },
  chat: { joinedChannels: ['general'], discoveredCore: false },
  quest: { step: 0, events: [], completed: false },
  desktop: {
    desk95: { wallpaper: 'teal', resolution: '800x600', startupApps: [] },
    classic: { wallpaper: 'graphite', resolution: '800x600', startupApps: [] },
    mono: { wallpaper: 'mono-grid', resolution: '640x480', startupApps: [] },
  },
  windows: {},
  files: [
    file('root', null, 'SITEVL HD', 'folder'), file('documents', 'root', 'Документы', 'folder'), file('pictures', 'root', 'Изображения', 'folder'), file('programs', 'root', 'Программы', 'folder'), file('system', 'root', 'Система', 'folder'), file('games', 'root', 'Игры', 'folder'), file('internet', 'root', 'Интернет', 'folder'),
    file('welcome', 'documents', 'ПРОЧТИ.TXT', 'text', 'SITEVL Retro Computer — интерактивный компьютерный музей.\n\nDESK 95 даёт доступ к общему виртуальному диску и архивным узлам сети.'),
    file('notes', 'documents', 'ЗАМЕТКИ.TXT', 'text', 'ЗАМЕТКИ SITEVL LAB\n\nБраузер и есть компьютер.\nКаталог LAB обновляется и не привязан к фиксированному числу экспериментов.'),
    file('classified', 'system', 'OLD_LOG.TXT', 'text', 'MONO-STATION ОТВЕТИЛА КОДОМ 1998. Проверьте почту и сетевое окружение.', true, true),
    file('blackbox', 'system', 'PROJECT_BLACKBOX.TXT', 'text', 'PROJECT BLACKBOX\n\nКаждая система — другой взгляд на один и тот же набор данных. Вы нашли архитектурный секрет.', true, true),
    file('downloads', 'root', 'Загрузки', 'folder'), file('shared', 'root', 'Общие файлы', 'folder'), file('development', 'root', 'Разработка', 'folder'),
    file('floppy', null, 'Дискета A:', 'folder'), file('floppy-readme', 'floppy', 'README.TXT', 'text', 'Архивная дискета SITEVL LAB. Некоторые секторы скрыты.'), file('floppy-lab', 'floppy', 'LAB.EXE', 'app', '/lab'), file('floppy-mystery', 'floppy', 'MYSTERY.DAT', 'text', '01010011 01001001 01010100 01000101 01010110 01001100', true), file('floppy-photo', 'floppy', 'PHOTO.BMP', 'image', 'retro://photo'), file('floppy-secret', 'floppy', 'SECRET.TXT', 'text', 'СЕКРЕТНЫЙ СИГНАЛ: браузер помнит больше, чем кажется.', true),
    file('cd', null, 'SITEVL SOFTWARE COLLECTION (D:)', 'folder', undefined, false, true), file('cd-readme', 'cd', 'COLLECTION.TXT', 'text', 'Коллекция программ SITEVL. Пакеты SVP являются безопасными игровыми манифестами.', false, true), file('cd-paintplus', 'cd', 'PAINTPLUS.SVP', 'app', 'paintplus', false, true), file('cd-gamepack', 'cd', 'GAMEPACK.SVP', 'app', 'gamepack', false, true), file('cd-2d', 'cd', 'BREAK_SITE.LNK', 'link', '/lab/2d', false, true), file('cd-canvas', 'cd', 'CANVAS.LNK', 'link', '/lab/canvas', false, true), file('cd-museum', 'cd', 'MUSEUM.URL', 'link', 'sitevl://museum', false, true),
  ],
};

function isSystem(value: unknown): value is RetroSystem { return value === 'desk95' || value === 'classic' || value === 'mono'; }
function isCrtLevel(value: unknown): value is CrtLevel { return value === 'off' || value === 'low' || value === 'medium' || value === 'high'; }

export function normalizeRetroState(value: unknown, legacyNote?: string | null): RetroState {
  const candidate = value && typeof value === 'object' ? value as Partial<RetroState> : {};
  const files = Array.isArray(candidate.files) ? candidate.files.filter((item): item is RetroFile => Boolean(item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.kind === 'string')) : defaultRetroState.files;
  const mergedFiles = files.map((item) => item.id === 'notes' && legacyNote ? { ...item, content: legacyNote, updatedAt: new Date().toISOString() } : item);
  return {
    ...defaultRetroState,
    ...candidate,
    version: 4,
    files: mergedFiles.length ? mergedFiles : defaultRetroState.files,
    selectedSystem: isSystem(candidate.selectedSystem) ? candidate.selectedSystem : null,
    visitedSystems: Array.isArray(candidate.visitedSystems) ? candidate.visitedSystems.filter(isSystem) : [],
    floppyInserted: candidate.floppyInserted !== false,
    crt: { ...defaultRetroState.crt, ...(candidate.crt || {}), level: isCrtLevel(candidate.crt?.level) ? candidate.crt.level : 'medium' },
    browser: {
      history: Array.isArray(candidate.browser?.history) ? candidate.browser.history.slice(-100) : [],
      bookmarks: Array.isArray(candidate.browser?.bookmarks) && candidate.browser.bookmarks.length ? candidate.browser.bookmarks : defaultRetroState.browser.bookmarks,
    },
    games: { ...defaultRetroState.games, ...(candidate.games || {}) },
    installedApps: Array.isArray(candidate.installedApps) ? candidate.installedApps.filter((item): item is string => typeof item === 'string') : defaultRetroState.installedApps,
    network: { ...defaultRetroState.network, ...(candidate.network || {}) },
    mail: { ...defaultRetroState.mail, ...(candidate.mail || {}) },
    chat: { ...defaultRetroState.chat, ...(candidate.chat || {}) },
    quest: { ...defaultRetroState.quest, ...(candidate.quest || {}), events: Array.isArray(candidate.quest?.events) ? candidate.quest.events.filter((item): item is string => typeof item === 'string') : [] },
    desktop: { ...defaultRetroState.desktop, ...(candidate.desktop || {}) },
    windows: candidate.windows && typeof candidate.windows === 'object' ? candidate.windows : {},
  };
}

export function readRetroState(): RetroState {
  try {
    const raw = window.localStorage.getItem(RETRO_STORAGE_KEY) || window.localStorage.getItem(RETRO_V3_STORAGE_KEY);
    const legacyNote = window.localStorage.getItem(LEGACY_NOTE_KEY);
    return normalizeRetroState(raw ? JSON.parse(raw) : undefined, legacyNote);
  } catch { return defaultRetroState; }
}

export function writeRetroState(state: RetroState) {
  try { window.localStorage.setItem(RETRO_STORAGE_KEY, JSON.stringify(normalizeRetroState(state))); } catch { /* Active session remains usable. */ }
}

export function listRetroFiles(state: RetroState, parentId: string, includeHidden = false) {
  return state.files.filter((item) => item.parentId === parentId && !item.deletedAt && (includeHidden || !item.hidden));
}

export function saveTextFile(state: RetroState, id: string, name: string, content: string, parentId = 'documents'): RetroState {
  const timestamp = new Date().toISOString();
  const existing = state.files.find((item) => item.id === id);
  const files = existing ? state.files.map((item) => item.id === id ? { ...item, name, content, updatedAt: timestamp } : item) : [...state.files, file(id, parentId, name, 'text', content)].map((item) => item.id === id ? { ...item, createdAt: timestamp, updatedAt: timestamp } : item);
  return { ...state, files };
}

export function createRetroFile(state: RetroState, parentId: string, name: string, kind: 'folder' | 'text', content = ''): RetroState {
  const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return { ...state, files: [...state.files, file(id, parentId, name.trim() || (kind === 'folder' ? 'Новая папка' : 'Новый файл.TXT'), kind, content)] };
}

export function renameRetroFile(state: RetroState, id: string, name: string): RetroState { return { ...state, files: state.files.map((item) => item.id === id && !item.readonly ? { ...item, name: name.trim() || item.name, updatedAt: new Date().toISOString() } : item) }; }
export function duplicateRetroFile(state: RetroState, id: string): RetroState { const source = state.files.find((item) => item.id === id); return source ? { ...state, files: [...state.files, { ...source, id: `copy-${Date.now()}`, name: `КОПИЯ_${source.name}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] } : state; }
export function moveRetroFile(state: RetroState, id: string, parentId: string): RetroState { return { ...state, files: state.files.map((item) => item.id === id && !item.readonly ? { ...item, parentId, updatedAt: new Date().toISOString() } : item) }; }
export function trashRetroFile(state: RetroState, id: string): RetroState { const deletedAt = new Date().toISOString(); return { ...state, files: state.files.map((item) => item.id === id && !item.readonly ? { ...item, deletedAt, originalParentId: item.parentId } : item) }; }
export function restoreRetroFile(state: RetroState, id: string): RetroState { return { ...state, files: state.files.map((item) => item.id === id ? { ...item, deletedAt: undefined, parentId: item.originalParentId ?? 'documents', originalParentId: undefined } : item) }; }
export function emptyRetroTrash(state: RetroState): RetroState { return { ...state, files: state.files.filter((item) => !item.deletedAt) }; }

export function addRetroVisit(state: RetroState, visit: Omit<RetroVisit, 'visitedAt'>): RetroState {
  const entry = { ...visit, visitedAt: new Date().toISOString() };
  return { ...state, browser: { ...state.browser, history: [...state.browser.history, entry].slice(-100) } };
}
