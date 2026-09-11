// Browser regressions for the layout defects found during catalog release QA.
// Requires Playwright with Chrome; no project dependency or production write.
// PLAYWRIGHT_MODULE may point to an already installed local Playwright runtime.
/* global document, getComputedStyle */
import assert from 'node:assert/strict';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = new URL(process.env.TEMPLATE_QA_BASE || 'http://127.0.0.1:4193');
assert.ok(['127.0.0.1', 'localhost'].includes(base.hostname), 'Use an isolated local preview, never production.');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  for (const width of [320, 390, 768, 1024, 1440]) {
    for (const slug of ['clothing-store', 'holiday-lodge', 'logistics-company']) {
      const context = await browser.newContext({ viewport: { width, height: 950 } });
      await context.route(url => url.pathname.startsWith('/api/'), route => route.abort());
      const page = await context.newPage();
      await page.goto(new URL(`/templates/${slug}?view=preview`, base).href);
      const frame = page.frameLocator('iframe');
      await frame.locator('h1').waitFor();
      const geometry = await frame.locator('.sv-design-hero-copy').evaluate(element => ({
        viewport: document.body.clientWidth,
        scroll: document.body.scrollWidth,
        padding: parseFloat(getComputedStyle(element).paddingLeft),
        headingLeft: element.querySelector('h1').getBoundingClientRect().left,
      }));
      assert.ok(geometry.scroll <= geometry.viewport, `${slug}: horizontal overflow`);
      assert.ok(geometry.padding >= 16, `${slug}: hero text lost its intended inner gutter`);
      assert.ok(geometry.headingLeft >= 16, `${slug}: heading touches the viewport edge`);
      results.push({ slug, width, gutter: 'PASS' });
      await context.close();
    }
  }
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route(url => url.pathname.startsWith('/api/'), route => route.abort());
  const page = await context.newPage();
  await page.goto(new URL('/studio', base).href);
  await page.getByRole('button', { name: 'Новый проект', exact: true }).click();
  await page.locator('.studio-template-grid button').first().click();
  const preview = page.locator('.studio-topbar__actions').getByRole('button', { name: 'Предпросмотр', exact: true });
  await preview.waitFor();
  await page.waitForFunction(() => document.querySelector('.studio-topbar small')?.textContent === 'Сохранено');
  assert.ok(await preview.evaluate(button => {
    const rect = button.getBoundingClientRect();
    return button.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
  }), 'Puck header must not cover the Studio preview button');
  const [popup] = await Promise.all([page.waitForEvent('popup'), preview.click()]);
  await popup.locator('.studio-preview-shell h1').waitFor();
  assert.match(await popup.locator('meta[name=robots]').getAttribute('content'), /noindex/);
  results.push({ studioPreview: 'PASS' });
  await context.close();
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
