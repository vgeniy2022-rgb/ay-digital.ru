import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { addModernBrowserTab, closeModernBrowserTab, createModernFile, defaultModernOsState, duplicateModernBrowserTab, getModernMediaKind, isModernCompactViewport, moveModernBrowserHistory, navigateModernTab, normalizeModernAiAction, normalizeModernOsState, openModernWindow, recordModernGame, reopenModernBrowserTab, resolveModernFullscreenMode, searchModernOs, trashModernFile, validateModernBrowserUrl } from './modernOsModel';

test('Modern OS normalizes unsafe persistence and preserves valid user data', () => {
  const state = normalizeModernOsState({ ...defaultModernOsState, brightness: 900, sound: -5, activeSpace: 9, dock: ['files', 'files', 'hacked'], files: [...defaultModernOsState.files, { id: 'user', parentId: 'documents', name: 'Мой файл.txt', kind: 'text', tags: [], favorite: false, createdAt: 'x', modifiedAt: 'x' }] });
  assert.equal(state.version, 1); assert.equal(state.brightness, 100); assert.equal(state.sound, 0); assert.equal(state.activeSpace, 1); assert.deepEqual(state.dock, ['files']); assert.ok(state.files.some((item) => item.id === 'user'));
});

test('Modern OS windows focus, persist space and avoid duplicate app windows', () => {
  let state = openModernWindow(defaultModernOsState, 'files', 'Файлы'); state = openModernWindow(state, 'files', 'Файлы'); assert.equal(state.windows.length, 1);
  state = openModernWindow({ ...state, activeSpace: 2 }, 'files', 'Файлы'); assert.equal(state.windows.length, 2); assert.equal(state.windows[1].space, 2);
});

test('Modern OS filesystem creates and trashes only virtual files', () => {
  const created = createModernFile(defaultModernOsState, 'documents', 'Проверка.txt'); const target = created.files[created.files.length - 1]; assert.equal(target.parentId, 'documents');
  const trashed = trashModernFile(created, target.id); assert.ok(trashed.files.find((item) => item.id === target.id)?.deletedAt); assert.equal(trashModernFile(created, 'drive').files.find((item) => item.id === 'drive')?.deletedAt, undefined);
});

test('Modern browser URL validator blocks executable schemes', () => {
  assert.equal(validateModernBrowserUrl('sitevl://home').ok, true); assert.equal(validateModernBrowserUrl('example.com').ok, true); assert.equal(validateModernBrowserUrl('javascript:alert(1)').ok, false); assert.equal(validateModernBrowserUrl('data:text/html,x').ok, false); assert.equal(validateModernBrowserUrl('file:///tmp/a').ok, false);
});

test('Modern browser manages tabs and bounded local history', () => {
  let state = addModernBrowserTab(defaultModernOsState); assert.equal(state.browser.tabs.length, 2); const active = state.browser.activeTabId;
  const result = navigateModernTab(state, active, 'https://example.com'); assert.equal(result.error, undefined); assert.equal(result.state.browser.history.length, 1);
  state = closeModernBrowserTab(result.state, active); assert.equal(state.browser.tabs.length, 1); assert.equal(state.browser.recentlyClosed.length, 1);
});

test('Modern search indexes apps, files and notes without full text machinery', () => {
  const apps = [{ id: 'browser' as const, label: 'Браузер' }, { id: 'files' as const, label: 'Файлы' }];
  assert.ok(searchModernOs(defaultModernOsState, 'project', apps).some((item) => item.title === 'project.txt'));
  assert.ok(searchModernOs(defaultModernOsState, 'браузер', apps).some((item) => item.appId === 'browser'));
});

test('Modern OS migrates Phase 1 persistence with safe Phase 2 defaults', () => {
  const state = normalizeModernOsState({ ...defaultModernOsState, recentApps: undefined, games: undefined, lowPowerMode: undefined });
  assert.deepEqual(state.recentApps, []); assert.equal(state.lowPowerMode, false); assert.equal(state.games.blocks.highScore, 0); assert.ok(state.dock.includes('games')); assert.ok(state.dock.includes('media')); assert.ok(state.dock.includes('ai'));
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

test('Modern game progress keeps launch count, high score and best time', () => {
  let state = recordModernGame(defaultModernOsState, 'racing', 550, 24.8); state = recordModernGame(state, 'racing', 420, 26.1); assert.equal(state.games.racing.launches, 2); assert.equal(state.games.racing.highScore, 550); assert.equal(state.games.racing.bestTime, 24.8);
});

test('Modern browser supports history navigation, duplication and reopening', () => {
  let state = navigateModernTab(defaultModernOsState, 'tab-home', 'sitevl://games').state; state = navigateModernTab(state, 'tab-home', 'sitevl://ai').state; state = moveModernBrowserHistory(state, 'tab-home', -1); assert.equal(state.browser.tabs[0].url, 'sitevl://games'); state = duplicateModernBrowserTab(state, 'tab-home'); assert.equal(state.browser.tabs.length, 2); const duplicate = state.browser.activeTabId; state = closeModernBrowserTab(state, duplicate); state = reopenModernBrowserTab(state); assert.equal(state.browser.tabs.length, 2);
});

test('Modern OS route exists and remains noindex as a LAB experiment', () => {
  const source = readFileSync(new URL('../../../data/routeSeo.ts', import.meta.url), 'utf8'); const block = source.match(/'\/lab\/modern-os':\s*\{([\s\S]*?)\n\s*\},/); assert.ok(block); assert.match(block[1], /canonicalPath:\s*'\/lab\/modern-os'/); assert.match(block[1], /noindex:\s*true/);
});
