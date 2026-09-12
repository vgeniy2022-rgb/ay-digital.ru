/* global document, innerWidth */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.PREVIEW_QA_BASE || 'http://127.0.0.1:5176';
assert.ok(['localhost','127.0.0.1','[::1]'].includes(new URL(base).hostname),'QA is restricted to local servers');
const out='/tmp/sitevl-grocery-qa';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try {
for(const variant of [1,2,3,4,5]){
 const p=await browser.newPage({viewport:{width:390,height:900},reducedMotion:'reduce'});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(`${base}/preview/grocery/${variant}?canvas=1`);
 const catalog=p.locator('#catalog');await catalog.waitFor();
 const search=p.getByRole('searchbox').first();await search.fill('несуществующий');
 await catalog.getByRole('heading',{name:'Пока ничего не найдено'}).waitFor();
 await search.fill('яблоки');assert.equal(await catalog.locator('.gp-product').count(),1);
 await search.fill('');
 const catButtons=p.locator(variant===3?'.gp-sidebar':'#catalog');
 await catButtons.getByRole('button',{name:'Орехи',exact:true}).click();
 assert.equal(await catalog.locator('.gp-product').count(),2);
 await catButtons.getByRole('button',{name:'Всё',exact:true}).click();
 const apple=catalog.locator('[data-product="apples"]');
 await apple.getByRole('button',{name:'По весу',exact:true}).click();
 await apple.getByRole('button',{name:'Увеличить Яблоки Гала',exact:true}).click();
 assert.match(await apple.innerText(),/188/);
 await apple.getByRole('button',{name:'Добавить Яблоки Гала в корзину'}).click();
 await apple.getByRole('button',{name:'Избранное: Яблоки Гала'}).click();
 // Fast-shopping hides header favorites on narrow screens; product favorites remain interactive.
 assert.equal(await apple.getByRole('button',{name:'Избранное: Яблоки Гала'}).getAttribute('aria-pressed'),'true');
 await p.locator('.gp-header .gp-cart-trigger').click();
 const dialog=p.getByRole('dialog');await dialog.getByRole('button',{name:'Удалить Яблоки Гала'}).click();
 assert.match(await dialog.innerText(),/Пока пусто/);await p.keyboard.press('Escape');
 await p.locator('#about summary').click();assert.match(await p.locator('#about details').innerText(),/270/);
 await p.getByLabel('Фактический вес в примере, кг').fill('2');
 assert.match(await p.locator('#about details').innerText(),/500/);
 await p.evaluate(async()=>Promise.all([...document.images].map(i=>i.decode())));
 assert.equal(await p.locator('img').evaluateAll(els=>els.every(e=>e.naturalWidth>0)),true);
 assert.deepEqual(errors,[]);results.push({variant,filters:'PASS',search:'PASS',kg:'PASS',remove:'PASS',images:'PASS',errors});await p.close();
}
for(const width of [320,375,390,768,1024,1440]){
 const p=await browser.newPage({viewport:{width,height:950},reducedMotion:'reduce'});
 await p.goto(`${base}/preview`);await p.getByRole('heading',{name:'Предревью',exact:true}).waitFor();
 if(width<1280){await p.getByRole('button',{name:'Открыть меню',exact:true}).click();await p.locator('.site-header').getByRole('link',{name:'Предревью',exact:true}).click();}
 else assert.equal(await p.locator('.site-header').getByRole('link',{name:'Предревью',exact:true}).isVisible(),true);
 await p.locator('.pv-project').click();await p.locator('.pv-concepts article').first().waitFor();
 assert.equal(await p.locator('.pv-concepts article').count(),5);
 await p.evaluate(async()=>Promise.all([...document.querySelectorAll('.pv-cover img')].map(i=>i.decode())));
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 if([390,1440].includes(width))await p.screenshot({path:`${out}/project-${width}.png`,fullPage:true});
 await p.locator('.pv-concepts article').first().getByRole('link',{name:'Открыть концепцию'}).click();
 for(const variant of [1,2,3,4,5]){
  await p.getByRole('link',{name:`Вариант ${variant}`,exact:true}).click();
  await p.frameLocator('iframe').locator(`.gp-v${variant}`).waitFor();
  assert.equal(await p.locator('iframe').count(),1);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 }
 await p.getByRole('button',{name:'Mobile',exact:true}).click();
 const frame=p.frameLocator('iframe');assert.ok(await frame.locator('body').evaluate(()=>innerWidth)<=390);
 await p.getByRole('button',{name:'Desktop',exact:true}).click();
 if([390,1440].includes(width))await p.screenshot({path:`${out}/presenter-${width}.png`});
 const fullscreen=p.locator('.pv-full');await fullscreen.click();
 assert.equal(await p.evaluate(()=>Boolean(document.fullscreenElement)),true);await p.evaluate(()=>document.exitFullscreen());
 await p.getByRole('link',{name:'Предревью',exact:true}).click();await p.locator('.pv-concepts').waitFor();
 results.push({width,project:'PASS',navigation:'PASS',variants:'PASS',viewport:'PASS',fullscreen:'PASS'});await p.close();
}
for(const route of ['/','/services','/templates','/prices','/cases','/studio','/lab']){
 const p=await browser.newPage({viewport:{width:1440,height:950}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const response=await p.goto(base+route);await p.locator('h1').first().waitFor();
 assert.equal(response.status(),200);assert.deepEqual(errors,[]);
 await p.screenshot({path:`${out}/regression-${route.replaceAll('/','')||'home'}.png`});
 results.push({route,http:200,heading:await p.locator('h1').allTextContents(),errors});await p.close();
}
console.log(JSON.stringify(results,null,2));
} finally {await fs.writeFile(`${out}/navigation.json`,JSON.stringify(results,null,2));await browser.close();}
