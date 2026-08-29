import assert from 'node:assert/strict';
import test from 'node:test';
import { labAchievements, labExperiments } from './catalog';
import { normalizeLabState } from './storage';

test('LAB catalogue exposes exactly eight unique public experiments', () => {
  assert.equal(labExperiments.length, 8);
  assert.equal(new Set(labExperiments.map((item) => item.id)).size, 8);
  assert.equal(new Set(labExperiments.map((item) => item.href)).size, 8);
  assert.deepEqual(labExperiments.map((item) => item.href), ['/lab/builder', '/lab/2d', '/lab/3d', '/lab/physics', '/lab/os', '/lab/retro', '/lab/canvas', '/lab/modern-os']);
});

test('achievement catalogue contains the complete Phase 4 progression', () => {
  assert.equal(labAchievements.length, 43);
  assert.equal(new Set(labAchievements.map((item) => item.id)).size, 43);
  assert.ok(labAchievements.some((item) => item.id === 'LAB_COMPLETE'));
  for (const id of ['RETRO_MONO_USER', 'RETRO_WEB_PIONEER', 'RETRO_SECRET_FILE', 'RETRO_ARTIST', 'RETRO_DOCUMENT', 'RETRO_GAME_WINNER', 'RETRO_ALL_SYSTEMS']) assert.ok(labAchievements.some((item) => item.id === id));
  for (const id of ['MODERN_FIRST_GAME', 'MODERN_CORE_COMPLETE', 'MODERN_BLOCKS_100', 'MODERN_BEST_LAP']) assert.ok(labAchievements.some((item) => item.id === id));
  assert.ok(labAchievements.every((item) => item.xp > 0));
});

test('local LAB state removes unknown experiments and achievement values', () => {
  const normalized = normalizeLabState({
    explored: ['builder', 'builder', 'unknown', 'physics'],
    achievements: { FIRST_EXPERIMENT: '2026-08-28T00:00:00.000Z', HACKED: 'yes', RETRO_USER: 17 },
    soundEnabled: 'yes',
    hapticsEnabled: false,
  });
  assert.deepEqual(normalized.explored, ['builder', 'physics']);
  assert.deepEqual(normalized.achievements, { FIRST_EXPERIMENT: '2026-08-28T00:00:00.000Z' });
  assert.equal(normalized.soundEnabled, false);
  assert.equal(normalized.hapticsEnabled, false);
});

test('legacy LAB state migrates to version 2 without losing valid progress', () => {
  const normalized = normalizeLabState({
    version: 1,
    explored: ['game2d', 'retro'],
    achievements: { BROKE_THE_WEBSITE: '2026-08-28T01:00:00.000Z' },
    soundEnabled: true,
  });
  assert.equal(normalized.version, 2);
  assert.deepEqual(normalized.explored, ['game2d', 'retro']);
  assert.equal(normalized.achievements.BROKE_THE_WEBSITE, '2026-08-28T01:00:00.000Z');
  assert.equal(normalized.soundEnabled, true);
  assert.deepEqual(normalized.audio, { master: .7, effects: .8, ambient: .35 });
});

test('LAB state clamps unsafe audio values and filters invalid completion ids', () => {
  const normalized = normalizeLabState({
    completed: ['os', 'unknown'],
    audio: { master: 12, effects: -4, ambient: Number.NaN },
    stats: { playTimeSeconds: -10, objectsCreated: 4, elementsBroken: 2, roomsVisited: 1 },
  });
  assert.deepEqual(normalized.completed, ['os']);
  assert.deepEqual(normalized.audio, { master: 1, effects: 0, ambient: .35 });
  assert.equal(normalized.stats.playTimeSeconds, 0);
});
