/* global document */
import fs from 'node:fs/promises';
import sharp from 'sharp';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.PREVIEW_QA_BASE || 'http://127.0.0.1:5176';
await fs.mkdir('public/preview-grocery/covers',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 for(const variant of [1,2,3,4,5]){
  const page=await browser.newPage({viewport:{width:1440,height:960},reducedMotion:'reduce'});
  await page.goto(`${base}/preview/grocery/${variant}?canvas=1`);
  await page.locator('h1').waitFor();
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top<960).map(i=>i.decode()));});
  const screenshot=await page.screenshot();
  await sharp(screenshot).resize(1200,800).webp({quality:84}).toFile(`public/preview-grocery/covers/${variant}.webp`);
  await page.close();
 }
} finally {await browser.close();}
