import assert from 'node:assert/strict';
import test from 'node:test';
import { priceDirections } from '../../data/priceDirections';
import { calculateWebsitePrice } from '../../data/websiteCalculator';
import { matchXRayRoute } from './routeRegistry';

test('commercial website and mobile price matrices match the published starting prices', () => {
  const websites = priceDirections.find((item) => item.slug === 'websites');
  const apps = priceDirections.find((item) => item.slug === 'mobile-apps');

  assert.deepEqual(websites?.packages.map((item) => item.price), [
    'от 19 900 ₽',
    'от 24 900 ₽',
    'от 34 900 ₽',
    'от 44 900 ₽',
    'от 59 900 ₽',
    'от 79 900 ₽',
    'от 139 900 ₽',
  ]);
  assert.deepEqual(apps?.packages.map((item) => item.price), [
    'от 49 900 ₽',
    'от 79 900 ₽',
    'от 119 900 ₽',
    'от 149 900 ₽',
    'от 199 900 ₽',
  ]);
});

test('mobile apps routes are represented by specific X-RAY definitions', () => {
  assert.equal(matchXRayRoute('/mobile-apps')?.componentName, 'MobileAppsPage');
  assert.equal(matchXRayRoute('/prices/mobile-apps')?.kind, 'price');
});

test('existing website calculator starts from the current commercial baseline', () => {
  const result = calculateWebsitePrice({ projectTypeId: 'business-card', pageRangeId: 'one', featureIds: [] });
  assert.equal(result.min, 20_000);
  assert.equal(result.display, '20 000–25 000 ₽');
});

