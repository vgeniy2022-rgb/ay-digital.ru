import assert from 'node:assert/strict';
import test from 'node:test';
import { labAchievements, labExperiments } from './catalog';
import { normalizeLabState } from './storage';

test('LAB catalogue exposes exactly seven unique public experiments', () => {
  assert.equal(labExperiments.length, 7);
  assert.equal(new Set(labExperiments.map((item) => item.id)).size, 7);
  assert.equal(new Set(labExperiments.map((item) => item.href)).size, 7);
  assert.deepEqual(labExperiments.map((item) => item.href), ['/lab/builder', '/lab/2d', '/lab/3d', '/lab/physics', '/lab/os', '/lab/retro', '/lab/canvas']);
});

test('achievement catalogue contains the shared seven signals', () => {
  assert.equal(labAchievements.length, 7);
  assert.ok(labAchievements.some((item) => item.id === 'LAB_COMPLETE'));
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
