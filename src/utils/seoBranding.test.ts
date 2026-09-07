import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { siteConfig, absoluteUrl } from '../config/site';
import { createBaseStructuredData } from './seoStructuredData';

const asset = (name: string) => readFileSync(new URL(`../../public/${name}`, import.meta.url));
const pngSignature = '89504e470d0a1a0a';

function assertPng(bytes: Buffer, size: number) {
  assert.equal(bytes.subarray(0, 8).toString('hex'), pngSignature, 'must be PNG, not an HTML fallback');
  assert.equal(bytes.toString('ascii', 12, 16), 'IHDR');
  assert.equal(bytes.readUInt32BE(16), size);
  assert.equal(bytes.readUInt32BE(20), size);
}

test('brand PNGs have real square image headers and declared dimensions', () => {
  for (const size of [48, 96, 192, 512]) assertPng(asset(`favicon-${size}x${size}.png`), size);
  assertPng(asset('apple-touch-icon.png'), 180);
});

test('ICO has bounded, correctly sized 16/32/48 PNG frames', () => {
  const ico = asset('favicon.ico');
  assert.equal(ico.readUInt16LE(0), 0);
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 3);
  let expectedOffset = 54;
  for (const [index, size] of [16, 32, 48].entries()) {
    const entry = 6 + 16 * index;
    assert.equal(ico[entry], size);
    assert.equal(ico[entry + 1], size);
    assert.equal(ico.readUInt16LE(entry + 4), 1);
    assert.equal(ico.readUInt16LE(entry + 6), 32);
    const length = ico.readUInt32LE(entry + 8);
    const offset = ico.readUInt32LE(entry + 12);
    assert.equal(offset, expectedOffset);
    assert.ok(length > 0 && offset + length <= ico.length);
    assertPng(ico.subarray(offset, offset + length), size);
    expectedOffset += length;
  }
  assert.equal(expectedOffset, ico.length);
});

test('source HTML declares a compact compatible favicon set before hydration', () => {
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const icons = html.match(/<link rel="icon"[^>]+>/g) || [];
  assert.equal(icons.length, 2);
  assert.ok(icons.some((icon) => icon.includes('type="image/x-icon"') && icon.includes('href="/favicon.ico"') && icon.includes('sizes="16x16 32x32 48x48"')));
  assert.ok(icons.some((icon) => icon.includes('type="image/png"') && icon.includes('href="/favicon-96x96.png"') && icon.includes('sizes="96x96"')));
  assert.match(html, /<link rel="apple-touch-icon" sizes="180x180" href="\/apple-touch-icon.png"/);
  assert.match(html, /<meta name="google-site-verification" content="[^"]+"/);
});

test('manifest refers to existing correctly sized raster icons', () => {
  const manifest = JSON.parse(asset('site.webmanifest').toString('utf8'));
  assert.equal(manifest.short_name, 'SITEVL');
  assert.deepEqual(manifest.icons.map((icon: { sizes: string }) => icon.sizes), ['192x192', '512x512']);
  for (const icon of manifest.icons) {
    assert.equal(icon.type, 'image/png');
    assert.match(icon.src, /^\/favicon-\d+x\d+\.png$/);
    assertPng(asset(icon.src.slice(1)), Number(icon.sizes.split('x')[0]));
  }
});

test('brand identity stays unique on sitevl.tech with a shared crawlable raster logo', () => {
  const data = createBaseStructuredData();
  const organizations = data.filter((item) => item['@type'] === 'Organization');
  const websites = data.filter((item) => item['@type'] === 'WebSite');
  assert.equal(organizations.length, 1);
  assert.equal(websites.length, 1);
  assert.equal(organizations[0].name, 'SITEVL');
  assert.equal(websites[0].name, 'SITEVL');
  assert.equal(organizations[0].logo, absoluteUrl(siteConfig.logoImage));
  assert.equal(organizations[0].logo, 'https://sitevl.tech/favicon-192x192.png');
  for (const item of data) assert.equal(item.url, 'https://sitevl.tech');
  assertPng(asset(siteConfig.logoImage.slice(1)), 192);
  const generator = readFileSync(new URL('../../scripts/generate-seo.mjs', import.meta.url), 'utf8');
  assert.ok(generator.includes('logo: `${siteUrl}${siteConfig.logoImage}`'));
});
