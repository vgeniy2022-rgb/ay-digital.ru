import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { addModernBrowserTab, clampModernWindowBounds, clampModernWindowsToViewport, clearModernBrowserHistory, closeModernBrowserTab, closeModernWindow, createModernFile, defaultModernOsState, deleteModernFilePermanently, duplicateModernBrowserTab, emptyModernTrash, focusModernWindow, getModernMediaKind, importModernFile, isModernCompactViewport, launchModernGame, minimizeModernWindow, MODERN_OS_STORAGE_KEY, moveModernBrowserHistory, moveModernDockItem, moveModernFile, navigateModernTab, normalizeModernAiAction, normalizeModernOsState, openModernWindow, parseModernLocalAiAction, readModernOsState, recordModernGame, renameModernFile, reorderModernDock, reopenModernBrowserTab, resolveModernFullscreenMode, restoreModernFile, restoreModernWindow, searchModernOs, toggleMaximizeModernWindow, toggleModernBookmark, trashModernFile, validateModernBrowserUrl } from './modernOsModel';

test('Modern OS normalizes unsafe persistence and preserves valid user data', () => {
  const state = normalizeModernOsState({ ...defaultModernOsState, brightness: 900, sound: -5, activeSpace: 9, dock: ['files', 'files', 'hacked'], files: [...defaultModernOsState.files, { id: 'user', parentId: 'documents', name: 'Мой файл.txt', kind: 'text', tags: [], favorite: false, createdAt: 'x', modifiedAt: 'x' }] });
  assert.equal(state.version, 2); assert.equal(state.brightness, 100); assert.equal(state.sound, 0); assert.equal(state.activeSpace, 1); assert.deepEqual(state.dock, ['files', 'games', 'media', 'ai']); assert.ok(state.files.some((item) => item.id === 'user'));
});

test('Modern OS windows focus, persist space and avoid duplicate app windows', () => {
  let state = openModernWindow(defaultModernOsState, 'files', 'Файлы'); state = openModernWindow(state, 'files', 'Файлы'); assert.equal(state.windows.length, 1);
  state = openModernWindow({ ...state, activeSpace: 2 }, 'files', 'Файлы'); assert.equal(state.windows.length, 2); assert.equal(state.windows[1].space, 2);
});

test('Modern Window Manager focuses a background window with compact deterministic z-order', () => {
  let state = openModernWindow(defaultModernOsState, 'files', 'Файлы');
  state = openModernWindow(state, 'browser', 'Браузер');
  state = openModernWindow(state, 'settings', 'Настройки');
  const files = state.windows.find((window) => window.appId === 'files')!;
  state = focusModernWindow(state, files.id);
  assert.equal(state.activeWindowId, files.id);
  assert.equal(state.windows.find((window) => window.id === files.id)?.z, 3);
  assert.deepEqual([...state.windows].sort((a, b) => a.z - b.z).map((window) => window.z), [1, 2, 3]);
});

test('Modern Window Manager minimizes, restores and focuses through Dock semantics', () => {
  let state = openModernWindow(defaultModernOsState, 'files', 'Файлы');
  state = openModernWindow(state, 'browser', 'Браузер');
  const browser = state.windows.find((window) => window.appId === 'browser')!;
  const files = state.windows.find((window) => window.appId === 'files')!;
  state = minimizeModernWindow(state, browser.id);
  assert.equal(state.windows.find((window) => window.id === browser.id)?.minimized, true);
  assert.equal(state.activeWindowId, files.id);
  state = openModernWindow(state, 'browser', 'Браузер');
  assert.equal(state.windows.find((window) => window.id === browser.id)?.minimized, false);
  assert.equal(state.activeWindowId, browser.id);
  assert.equal(state.windows.find((window) => window.id === browser.id)?.z, 2);
  state = restoreModernWindow(state, files.id);
  assert.equal(state.activeWindowId, files.id);
});

test('Modern Window Manager maximizes and restores exact previous bounds', () => {
  let state = openModernWindow(defaultModernOsState, 'browser', 'Браузер');
  const browser = state.windows[0]; const original = { x: browser.x, y: browser.y, width: browser.width, height: browser.height };
  state = toggleMaximizeModernWindow(state, browser.id);
  assert.equal(state.windows[0].maximized, true); assert.deepEqual(state.windows[0].previousBounds, original);
  state = toggleMaximizeModernWindow(state, browser.id);
  assert.equal(state.windows[0].maximized, false); assert.equal(state.windows[0].previousBounds, undefined);
  assert.deepEqual({ x: state.windows[0].x, y: state.windows[0].y, width: state.windows[0].width, height: state.windows[0].height }, original);
});

test('Modern Window Manager activates the next top window after close', () => {
  let state = openModernWindow(defaultModernOsState, 'files', 'Файлы'); state = openModernWindow(state, 'browser', 'Браузер'); state = openModernWindow(state, 'settings', 'Настройки');
  const settings = state.windows.find((window) => window.appId === 'settings')!; const browser = state.windows.find((window) => window.appId === 'browser')!;
  state = closeModernWindow(state, settings.id);
  assert.equal(state.activeWindowId, browser.id); assert.equal(state.windows.length, 2); assert.deepEqual(state.windows.map((window) => window.z).sort(), [1, 2]);
});

test('Modern Window Manager migrates legacy windows and clamps them after viewport changes', () => {
  const legacy = { ...defaultModernOsState, version: 1, activeWindowId: undefined, windows: [{ id: 'legacy-files', appId: 'files', title: 'Файлы', x: 1800, y: 1000, width: 1200, height: 900, z: 99, minimized: false, maximized: false, space: 1 }] };
  let state = normalizeModernOsState(legacy);
  assert.equal(state.version, 2); assert.equal(state.activeWindowId, 'legacy-files');
  state = clampModernWindowsToViewport(state, { width: 1024, height: 768 });
  assert.deepEqual({ x: state.windows[0].x, y: state.windows[0].y, width: state.windows[0].width, height: state.windows[0].height }, { x: 8, y: 50, width: 1008, height: 632 });
  assert.deepEqual(clampModernWindowBounds({ x: -50, y: -20, width: 100, height: 100 }, { width: 390, height: 844 }), { x: 8, y: 50, width: 320, height: 240 });
});

test('Modern OS filesystem creates and trashes only virtual files', () => {
  const created = createModernFile(defaultModernOsState, 'documents', 'Проверка.txt'); const target = created.files[created.files.length - 1]; assert.equal(target.parentId, 'documents');
  const trashed = trashModernFile(created, target.id); assert.ok(trashed.files.find((item) => item.id === target.id)?.deletedAt); assert.equal(trashModernFile(created, 'drive').files.find((item) => item.id === 'drive')?.deletedAt, undefined);
});

test('Modern OS filesystem renames, moves, restores and permanently deletes virtual trees', () => {
  let state = createModernFile(defaultModernOsState, 'documents', 'Черновик.txt');
  const file = state.files[state.files.length - 1];
  state = renameModernFile(state, file.id, 'План.txt');
  assert.equal(state.files.find((item) => item.id === file.id)?.name, 'План.txt');
  state = moveModernFile(state, file.id, 'pictures');
  assert.equal(state.files.find((item) => item.id === file.id)?.parentId, 'pictures');
  state = trashModernFile(state, file.id);
  state = restoreModernFile(state, file.id);
  assert.equal(state.files.find((item) => item.id === file.id)?.deletedAt, undefined);

  state = createModernFile(state, 'documents', 'Проект', 'folder');
  const folder = state.files[state.files.length - 1];
  state = createModernFile(state, folder.id, 'Вложенный.txt');
  const nested = state.files[state.files.length - 1];
  assert.equal(moveModernFile(state, folder.id, nested.id).files.find((item) => item.id === folder.id)?.parentId, 'documents');
  state = deleteModernFilePermanently(state, folder.id);
  assert.equal(state.files.some((item) => item.id === folder.id || item.id === nested.id), false);
});

test('Modern OS trash can be emptied without deleting active virtual files', () => {
  let state = createModernFile(defaultModernOsState, 'documents', 'Удалить.txt');
  const doomed = state.files[state.files.length - 1];
  state = createModernFile(state, 'documents', 'Оставить.txt');
  const retained = state.files[state.files.length - 1];
  state = emptyModernTrash(trashModernFile(state, doomed.id));
  assert.equal(state.files.some((item) => item.id === doomed.id), false);
  assert.equal(state.files.some((item) => item.id === retained.id), true);
});

test('Modern browser URL validator blocks executable schemes', () => {
  assert.equal(validateModernBrowserUrl('sitevl://home').ok, true); assert.equal(validateModernBrowserUrl('sitevl://farm').ok, true); assert.equal(validateModernBrowserUrl('example.com').ok, true); assert.equal(validateModernBrowserUrl('javascript:alert(1)').ok, false); assert.equal(validateModernBrowserUrl('data:text/html,x').ok, false); assert.equal(validateModernBrowserUrl('file:///tmp/a').ok, false);
});

test('Modern OS Phase 2 migration adds required folders without losing user files', () => {
  const legacyFiles = defaultModernOsState.files.filter((item) => !['videos', 'games-folder', 'applications'].includes(item.id));
  legacyFiles.push({ id: 'client-work', parentId: 'documents', name: 'Работа.txt', kind: 'text', content: 'Важно', tags: [], favorite: false, createdAt: 'x', modifiedAt: 'x' });
  const state = normalizeModernOsState({ ...defaultModernOsState, files: legacyFiles });
  assert.ok(state.files.some((item) => item.id === 'videos'));
  assert.ok(state.files.some((item) => item.id === 'games-folder'));
  assert.ok(state.files.some((item) => item.id === 'applications'));
  assert.equal(state.files.find((item) => item.id === 'client-work')?.content, 'Важно');
});

test('Modern OS imports selected media into the virtual filesystem only', () => {
  const state = importModernFile(defaultModernOsState, { parentId: 'pictures', name: 'photo.jpg', kind: 'image', content: 'data:image/jpeg;base64,AA==', mimeType: 'image/jpeg', size: 1 });
  const imported = state.files[state.files.length - 1];
  assert.equal(imported.parentId, 'pictures'); assert.equal(imported.mimeType, 'image/jpeg'); assert.equal(imported.size, 1);
});

test('Modern browser manages tabs and bounded local history', () => {
  let state = addModernBrowserTab(defaultModernOsState); assert.equal(state.browser.tabs.length, 2); const active = state.browser.activeTabId;
  const result = navigateModernTab(state, active, 'https://example.com'); assert.equal(result.error, undefined); assert.equal(result.state.browser.history.length, 1);
  state = closeModernBrowserTab(result.state, active); assert.equal(state.browser.tabs.length, 1); assert.equal(state.browser.recentlyClosed.length, 1);
});

test('Modern browser stores removable bookmarks and clearable private history', () => {
  let state = toggleModernBookmark(defaultModernOsState, 'Example', 'https://example.com/');
  assert.ok(state.browser.bookmarks.some((item) => item.url === 'https://example.com/'));
  state = toggleModernBookmark(state, 'Example', 'https://example.com/');
  assert.equal(state.browser.bookmarks.some((item) => item.url === 'https://example.com/'), false);
  state = navigateModernTab(state, 'tab-home', 'example.com').state;
  assert.equal(state.browser.history.length, 1);
  assert.equal(clearModernBrowserHistory(state).browser.history.length, 0);
});

test('Modern search indexes apps, files and notes without full text machinery', () => {
  const apps = [{ id: 'browser' as const, label: 'Браузер' }, { id: 'files' as const, label: 'Файлы' }];
  assert.ok(searchModernOs(defaultModernOsState, 'project', apps).some((item) => item.title === 'project.txt'));
  assert.ok(searchModernOs(defaultModernOsState, 'браузер', apps).some((item) => item.appId === 'browser'));
});

test('Modern OS migrates Phase 1 persistence with safe Phase 2 defaults', () => {
  const state = normalizeModernOsState({ ...defaultModernOsState, recentApps: undefined, games: undefined, lowPowerMode: undefined, aiMessages: [{ id: 'bad', role: 'system', text: 'unsafe' }], networkEnabled: undefined, dockMagnification: undefined });
  assert.deepEqual(state.recentApps, []); assert.equal(state.lowPowerMode, false); assert.equal(state.games.blocks.highScore, 0); assert.equal(state.networkEnabled, true); assert.equal(state.dockMagnification, true); assert.deepEqual(state.aiMessages, []); assert.ok(state.dock.includes('games')); assert.ok(state.dock.includes('media')); assert.ok(state.dock.includes('ai'));
});

test('Modern OS recovers from invalid saved JSON', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => '{broken', setItem: () => undefined } });
  try { assert.deepEqual(readModernOsState(), defaultModernOsState); } finally { if (original) Object.defineProperty(globalThis, 'localStorage', original); else Reflect.deleteProperty(globalThis, 'localStorage'); }
});

test('Modern Dock reorders through drag and keyboard-safe helpers', () => {
  let state = reorderModernDock(defaultModernOsState, 'browser', 'files');
  assert.deepEqual(state.dock.slice(0, 2), ['browser', 'files']);
  state = moveModernDockItem(state, 'browser', 1);
  assert.deepEqual(state.dock.slice(0, 2), ['files', 'browser']);
  assert.deepEqual(moveModernDockItem(state, 'files', -1).dock, state.dock);
});

test('Modern fullscreen and compact mobile state resolve deterministically', () => {
  assert.equal(resolveModernFullscreenMode(false, false, null), 'windowed'); assert.equal(resolveModernFullscreenMode(true, false, null), 'system'); assert.equal(resolveModernFullscreenMode(false, true, null), 'system'); assert.equal(resolveModernFullscreenMode(true, true, 'window-games'), 'app');
  assert.equal(isModernCompactViewport(320), true); assert.equal(isModernCompactViewport(767), true); assert.equal(isModernCompactViewport(768), false); assert.equal(isModernCompactViewport(1024), false);
});

test('Modern media accepts supported local formats without uploading', () => {
  assert.equal(getModernMediaKind({ name: 'track.FLAC', type: '' }), 'audio'); assert.equal(getModernMediaKind({ name: 'clip.mov', type: 'video/quicktime' }), 'video'); assert.equal(getModernMediaKind({ name: 'archive.zip', type: 'application/zip' }), 'unsupported');
});

test('Modern AI actions use a strict allowlist and normalize values', () => {
  assert.deepEqual(normalizeModernAiAction({ type: 'OPEN_APP', appId: 'games' }), { type: 'OPEN_APP', appId: 'games' }); assert.deepEqual(normalizeModernAiAction({ type: 'SET_VOLUME', value: 140 }), { type: 'SET_VOLUME', value: 100 }); assert.equal(normalizeModernAiAction({ type: 'OPEN_APP', appId: 'shell' }), null); assert.equal(normalizeModernAiAction({ type: 'RUN_JS', code: 'alert(1)' }), null);
});

test('Modern local AI parses only explicit allowlisted Russian commands', () => {
  assert.deepEqual(parseModernLocalAiAction('Открой браузер')?.action, { type: 'OPEN_APP', appId: 'browser' });
  assert.deepEqual(parseModernLocalAiAction('включи тёмную тему')?.action, { type: 'SET_THEME', value: 'dark' });
  assert.equal(parseModernLocalAiAction('выполни javascript:alert(1)'), null);
  assert.equal(parseModernLocalAiAction('удали все файлы'), null);
});

test('Modern game progress keeps launch count, score, time, play time and achievements', () => {
  let state = launchModernGame(defaultModernOsState, 'racing'); state = launchModernGame(state, 'racing'); state = recordModernGame(state, 'racing', 550, 24.8, 31, 'Чистый круг', 55); state = recordModernGame(state, 'racing', 420, 26.1, 28); assert.equal(state.games.racing.launches, 2); assert.equal(state.games.racing.highScore, 550); assert.equal(state.games.racing.bestTime, 24.8); assert.equal(state.games.racing.playTime, 59); assert.deepEqual(state.games.racing.achievements, ['Чистый круг']); assert.equal(state.games.racing.progress, 55);
});

test('Modern game migration adds MATCH and safe progress defaults', () => {
  const state = normalizeModernOsState({ ...defaultModernOsState, games: { 'core-shooter': { launches: 4, highScore: 20 }, blocks: { launches: 1, highScore: 10 }, racing: { launches: 2, highScore: 30 } } });
  assert.equal(state.games['core-shooter'].launches, 4); assert.equal(state.games.match.progress, 1); assert.equal(state.games.match.playTime, 0);
});

test('Modern game migration adds SITEVL FARM without changing the storage key', () => {
  const state = normalizeModernOsState({ ...defaultModernOsState, farm: undefined, games: { ...defaultModernOsState.games, farm: undefined } });
  assert.equal(state.farm.plots.length, 12); assert.equal(state.farm.coins, 350); assert.equal(state.games.farm.highScore, 0); assert.equal(MODERN_OS_STORAGE_KEY, 'sitevl-lab-modern-os-v1');
});

test('Modern browser supports history navigation, duplication and reopening', () => {
  let state = navigateModernTab(defaultModernOsState, 'tab-home', 'sitevl://games').state; state = navigateModernTab(state, 'tab-home', 'sitevl://ai').state; state = moveModernBrowserHistory(state, 'tab-home', -1); assert.equal(state.browser.tabs[0].url, 'sitevl://games'); state = duplicateModernBrowserTab(state, 'tab-home'); assert.equal(state.browser.tabs.length, 2); const duplicate = state.browser.activeTabId; state = closeModernBrowserTab(state, duplicate); state = reopenModernBrowserTab(state); assert.equal(state.browser.tabs.length, 2);
});

test('Modern OS route exists and remains noindex as a LAB experiment', () => {
  const source = readFileSync(new URL('../../../data/routeSeo.ts', import.meta.url), 'utf8'); const block = source.match(/'\/lab\/modern-os':\s*\{([\s\S]*?)\n\s*\},/); assert.ok(block); assert.match(block[1], /canonicalPath:\s*'\/lab\/modern-os'/); assert.match(block[1], /noindex:\s*true/);
});
