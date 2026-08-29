import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeRetroUrl } from './retroBrowserModel';
import { addRetroVisit, createRetroFile, defaultRetroState, emptyRetroTrash, normalizeRetroState, restoreRetroFile, saveTextFile, trashRetroFile } from './retroState';

test('Retro URL validator accepts web and known SITEVL pages', () => {
  assert.deepEqual(normalizeRetroUrl('example.com'), { ok: true, url: 'https://example.com/', internal: false });
  assert.deepEqual(normalizeRetroUrl('sitevl://museum'), { ok: true, url: 'sitevl://museum', internal: true });
  assert.deepEqual(normalizeRetroUrl('sitevl://farm'), { ok: true, url: 'sitevl://farm', internal: true });
});

test('Retro URL validator blocks executable and local schemes', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,test', 'file:///tmp/a', 'blob:https://example.com/id']) assert.equal(normalizeRetroUrl(value).ok, false);
});

test('Retro migration preserves a legacy note and valid system', () => {
  const state = normalizeRetroState({ selectedSystem: 'mono', files: defaultRetroState.files }, 'СТАРАЯ ЗАМЕТКА');
  assert.equal(state.version, 4);
  assert.equal(state.selectedSystem, 'mono');
  assert.equal(state.files.find((item) => item.id === 'notes')?.content, 'СТАРАЯ ЗАМЕТКА');
});

test('Retro files persist, enter trash, restore and delete permanently', () => {
  let state = createRetroFile(defaultRetroState, 'documents', 'ТЕСТ.TXT', 'text', 'данные');
  const created = state.files[state.files.length - 1];
  assert.equal(created?.name, 'ТЕСТ.TXT');
  state = saveTextFile(state, created?.id || '', 'ТЕСТ.TXT', 'обновлено');
  state = trashRetroFile(state, created?.id || '');
  assert.ok(state.files.find((item) => item.id === created?.id)?.deletedAt);
  state = restoreRetroFile(state, created?.id || '');
  assert.equal(state.files.find((item) => item.id === created?.id)?.deletedAt, undefined);
  state = trashRetroFile(state, created?.id || '');
  assert.equal(emptyRetroTrash(state).files.some((item) => item.id === created?.id), false);
});

test('Retro history is capped and bookmarks survive normalization', () => {
  let state = defaultRetroState;
  for (let index = 0; index < 120; index += 1) state = addRetroVisit(state, { url: `https://example.com/${index}`, title: String(index) });
  assert.equal(state.browser.history.length, 100);
  assert.equal(normalizeRetroState(state).browser.bookmarks.length, 5);
});

test('Retro system migration filters invalid values and preserves all three systems', () => {
  const state = normalizeRetroState({ visitedSystems: ['desk95', 'classic', 'mono', 'future'] });
  assert.deepEqual(state.visitedSystems, ['desk95', 'classic', 'mono']);
});
