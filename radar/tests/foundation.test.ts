import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { radarConfig } from '../config';
import { AvitoCollector, FarPostCollector } from '../collectors';
import { FoundationNormalizer, listingIdentity, sourceUrl, rubles } from '../normalization';
import { foundationRiskEngine, foundationDealEngine } from '../engines';
import { toListingRow, fromListingRow, validateFeedback } from '../database/repository';
import { notificationIdentity, TelegramNotificationProvider } from '../notifications/telegram';
import { ingestBatch } from '../services/pipeline';
import { radarLog } from '../services/logging';
import { inspectWorker } from '../../radar-worker/runtime';
import type { RawListing } from '../types';

const raw: RawListing = { source: 'avito', sourceListingId: 'qa-1', url: 'https://www.avito.ru/qa-1?token=excluded', title: '  QA   laptop  ',
  description: 'Связаться +7 (900) 123-45-67 или owner@example.invalid https://example.invalid/private?token=secret', category: 'laptops', priceRub: 100000,
  currency: 'RUB', condition: 'UNKNOWN', region: 'TEST REGION', location: 'TEST ONLY', publishedAt: null, observedAt: '2026-01-01T00:00:00Z',
  imageUrls: ['https://untrusted.example/image.png'], status: 'UNKNOWN', seller: { kind: 'PRIVATE' } };
test('feature flags fail closed and configuration remains category-based', () => {
  const config = radarConfig({ RADAR_ENABLED: '1', RADAR_CATEGORIES: 'laptops,refrigerators,smartphones,laptops', RADAR_SCAN_INTERVAL_SECONDS: '1' });
  assert.equal(config.enabled, false); assert.deepEqual(config.categories, ['laptops', 'smartphones']); assert.equal(config.scanIntervalSeconds, 180);
  assert.equal(radarConfig({ RADAR_ENABLED: 'true', RADAR_DEVELOPMENT_MODE: 'false' }).alertsActive, false);
});
test('source identity distinguishes sources and rejects Redis-style/unbounded identifiers', () => {
  assert.notEqual(listingIdentity('avito', '1'), listingIdentity('farpost', '1'));
  assert.throws(() => listingIdentity('avito', '../../secret')); assert.throws(() => listingIdentity('avito', 'x'.repeat(129)));
});
test('normalizer preserves honest unknown model and strips contacts / source query / unvetted images', async () => {
  const normalized = await new FoundationNormalizer().normalize(raw);
  assert.equal(normalized.title, 'QA laptop'); assert.equal(normalized.product.key, null);
  assert.equal(normalized.product.method, 'UNRESOLVED'); assert.deepEqual(normalized.imageUrls, []);
  assert.ok(!JSON.stringify(normalized).includes('owner@example')); assert.ok(!JSON.stringify(normalized).includes('token=secret'));
  assert.equal(normalized.url, 'https://www.avito.ru/qa-1');
});
test('money and URL inputs reject floats, SSRF, credentials and hostile hosts', () => {
  for (const value of [-1, 1.5, NaN, Infinity, '100', 1000000001]) assert.throws(() => rubles(value));
  for (const url of ['http://avito.ru/1', 'https://avito.ru.evil.example/1', 'https://avito.ru@evil.example/1', 'https://127.0.0.1/1', 'javascript:alert(1)', 'https://avito.ru:8443/1', 'https://farpost.ru/1']) assert.throws(() => sourceUrl(url, 'avito'));
});
test('collectors never claim online or issue network requests in phase 1', async () => {
  for (const collector of [new AvitoCollector(), new FarPostCollector()]) {
    assert.equal((await collector.healthCheck()).status, 'NOT_CONFIGURED');
    assert.deepEqual(await collector.fetchLatest(), { ok: false, code: 'PERMISSION_REQUIRED', retryable: false });
    assert.equal((await collector.fetchListing()).ok, false);
  }
});
test('risk and deal engines do not manufacture scores or ban on a keyword', async () => {
  const normalized = await new FoundationNormalizer().normalize({ ...raw, title: 'QA коробка в комплекте' });
  const risk = await foundationRiskEngine.analyze(normalized, null);
  assert.equal(risk.score, null); assert.deepEqual(risk.reasons, []);
  const deal = await foundationDealEngine.analyze(normalized, null, risk);
  assert.equal(deal.classification, 'NOT_ANALYZED'); assert.equal(deal.finalScore, null);
});
test('DB mapper allowlists storage fields rather than persisting arbitrary raw objects', async () => {
  const value = await new FoundationNormalizer().normalize(raw);
  const row = toListingRow({ ...value, secret: 'NEVER_STORE' } as typeof value);
  assert.ok(!JSON.stringify(row).includes('NEVER_STORE')); assert.equal(row.price_rub, 100000);
  const mapped = fromListingRow({ ...row, id: 'qa-internal', first_seen_at: raw.observedAt, last_seen_at: raw.observedAt });
  assert.equal(mapped.sourceListingId, 'qa-1'); assert.equal(mapped.id, 'qa-internal'); assert.equal(mapped.analysis, null);
});
test('feedback validates action, UUIDs and exact field allowlist', () => {
  const value = { listingId: '11111111-1111-4111-8111-111111111111', operationId: '22222222-2222-4222-8222-222222222222', action: 'SAVE' };
  assert.equal(validateFeedback(value).channel, 'WEB');
  assert.throws(() => validateFeedback({ ...value, ownerId: 'spoof' })); assert.throws(() => validateFeedback({ ...value, action: 'DELETE' }));
});
test('notification dedup allows HOT → ULTRA, phase 1 cannot send even with configured secrets', async () => {
  const base = { listingId: 'qa', classification: 'HOT' as const, event: 'CLASSIFICATION_REACHED' as const };
  assert.notEqual(notificationIdentity(base), notificationIdentity({ ...base, classification: 'ULTRA' }));
  const env = { RADAR_ENABLED: 'true', RADAR_DEVELOPMENT_MODE: 'false', TELEGRAM_BOT_TOKEN: 'fixture', TELEGRAM_CHAT_ID: 'fixture' };
  const provider = new TelegramNotificationProvider(env, radarConfig(env));
  assert.equal((await provider.healthCheck()).status, 'CONFIGURED_NOT_TESTED'); assert.equal((await provider.send()).status, 'NOT_ACTIVE');
});
test('pipeline isolates invalid listing and transient writer failure from the rest of batch', async () => {
  let writes = 0;
  const results = await ingestBatch([raw, { ...raw, sourceListingId: 'bad!', priceRub: -1 }, { ...raw, sourceListingId: '3' }, { ...raw, sourceListingId: '4' }], new FoundationNormalizer(),
    { upsert: async listing => { writes++; if (listing.sourceListingId === '3') throw new Error('DB_DOWN'); return { id: listing.sourceListingId, created: true }; } });
  assert.deepEqual(results.map(r => r.status), ['NEW', 'FAILED', 'FAILED', 'NEW']); assert.equal(writes, 3);
  assert.equal(results[1].retryable, false); assert.equal(results[2].retryable, true);
});
test('worker disabled state performs no health requests, enabled phase never scans', async () => {
  assert.equal((await inspectWorker({})).status, 'DISABLED');
  assert.equal((await inspectWorker({ RADAR_ENABLED: 'true' })).scheduler, 'NOT_ACTIVE');
});
test('structured logger ignores unknown fields', () => {
  let line = '';
  radarLog('ERROR', 'DATABASE_ERROR', { source: 'avito', fetched: 2, token: 'NEVER_LOG' } as { source: 'avito'; fetched: number }, v => { line = v; });
  assert.ok(!line.includes('NEVER_LOG')); assert.equal(JSON.parse(line).fetched, 2);
});
test('private route is lazy and excluded from public navigation, SEO sources and analytics', () => {
  const read = (path: string) => readFileSync(path, 'utf8');
  for (const path of ['src/components/Header.tsx', 'src/components/Footer.tsx', 'src/data/routeSeo.ts', 'src/utils/seoRoutes.ts', 'scripts/xray-source-plugin.mjs']) assert.ok(!read(path).includes('/radar'), path);
  assert.match(read('src/App.tsx'), /lazy\(\(\) => import\('\.\/features\/radar\/RadarPage'\)/);
  assert.match(read('src/features/site-analytics/SiteAnalyticsProvider.tsx'), /return <TrackedSiteAnalyticsProvider>/);
  assert.ok(!read('api/radar.ts').includes('harness')); assert.ok(!read('radar/server/handler.ts').includes('TEST_TOKEN'));
});
