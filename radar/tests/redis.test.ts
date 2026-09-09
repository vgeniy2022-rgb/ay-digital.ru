import test from 'node:test';
import assert from 'node:assert/strict';
import { createRedisHarness } from '../../src/features/site-analytics/visitorRedisHarness';
import { RedisRateGate } from '../server/security';
import { TEST_TOKEN } from './harness';

test('real isolated Redis: atomic rate limit, bounded sessions, logout and namespace isolation', async t => {
  const harness = await createRedisHarness(t); if (!harness) return;
  const gate = new RedisRateGate(harness.options.environment, harness.options.fetchImpl);
  await harness.command(['SET', 'sitevl:lab:visits', '100']);
  const attempts = await Promise.all(Array.from({ length: 10 }, () => gate.allow('login:qa-only', 5)));
  assert.equal(attempts.filter(Boolean).length, 5);
  const rateTtl = await harness.command(['TTL', 'sitevl:radar:rate:login:qa-only']);
  assert.ok(rateTtl > 0 && rateTtl <= 60);
  assert.equal(await gate.sessionActive(TEST_TOKEN), false);
  await gate.openSession(TEST_TOKEN, 900);
  assert.equal(await gate.sessionActive(TEST_TOKEN), true);
  const keys: string[] = await harness.command(['KEYS', 'sitevl:radar:session:*']);
  assert.equal(keys.length, 1); assert.ok(!keys[0].includes(TEST_TOKEN));
  assert.equal(await harness.command(['GET', keys[0]]), '1');
  assert.ok(await harness.command(['TTL', keys[0]]) <= 900);
  await gate.closeSession(TEST_TOKEN);
  assert.equal(await gate.sessionActive(TEST_TOKEN), false);
  assert.equal(await harness.command(['GET', 'sitevl:lab:visits']), '100');
  assert.equal(harness.telegram.length, 0);
});
