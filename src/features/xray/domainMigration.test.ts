import assert from 'node:assert/strict';
import test from 'node:test';
import { PUBLIC_SITE_ORIGIN, resolvePublicOrigin } from '../../config/publicOrigin.mjs';
import { absoluteUrl, absoluteAssetUrl, siteConfig } from '../../config/site';
import { createBaseStructuredData } from '../../utils/seoStructuredData';
import { ensureVisitorSources, safeReferrerHost, safeSource } from '../site-analytics/visitorIntelligence';

test('primary origin is fixed, never derived from a legacy hostname', () => {
  assert.equal(PUBLIC_SITE_ORIGIN, 'https://sitevl.tech');
  assert.equal(siteConfig.siteUrl, PUBLIC_SITE_ORIGIN);
  for (const value of [undefined, '', 'https://sitevl.tech', ' https://sitevl.tech/ ']) {
    assert.equal(resolvePublicOrigin(value), PUBLIC_SITE_ORIGIN);
  }
  for (const value of ['https://sitevl-ru.vercel.app', 'https://ay-digital-ru.vercel.app', 'https://www.sitevl.tech', 'http://sitevl.tech', 'https://sitevl.tech/?src=test']) {
    assert.throws(() => resolvePublicOrigin(value));
  }
});

test('absolute SEO and asset URLs use the primary domain; external links stay external', () => {
  for (const path of ['/', '/services', '/mobile-apps', '/prices/websites', '/ai-website', '/lab/modern-os']) {
    assert.equal(absoluteUrl(path), `https://sitevl.tech${path}`);
  }
  assert.equal(absoluteAssetUrl('/og-image.jpg'), 'https://sitevl.tech/og-image.jpg');
  assert.equal(absoluteUrl('https://t.me/AYDigitaLRu'), 'https://t.me/AYDigitaLRu');
  assert.doesNotMatch(JSON.stringify(createBaseStructuredData()), /vercel\.app|ay-digital\.ru/);
});

test('new origin retains first/session src without transferring another origin storage', () => {
  const storage = () => { const values = new Map<string, string>(); return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } }; };
  const legacy = storage(); const fresh = storage(); const session = storage();
  ensureVisitorSources('?src=legacy-test', legacy, storage());
  assert.deepEqual(ensureVisitorSources('?src=telegram-test&secret=never-store', fresh, session), { firstSource: 'telegram-test', sessionSource: 'telegram-test' });
  assert.deepEqual(ensureVisitorSources('?src=changed', fresh, session), { firstSource: 'telegram-test', sessionSource: 'telegram-test' });
  assert.equal(safeSource('?src=telegram-test'), 'telegram-test');
  assert.equal(safeReferrerHost('https://sitevl.tech/prices?secret=1', 'sitevl.tech'), '');
  assert.equal(safeReferrerHost('https://t.me/channel?secret=1', 'sitevl.tech'), 't.me');
});
