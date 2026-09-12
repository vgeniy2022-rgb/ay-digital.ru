// Local-only browser QA. No real orders, production mutations or credentials.
/* global document, innerWidth */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.PREVIEW_QA_BASE || 'http://127.0.0.1:5176';
assert.ok(['localhost','127.0.0.1','[::1]'].includes(new URL(base).hostname),'QA is restricted to local servers');
const out=process.env.PREVIEW_QA_OUTPUT || '/tmp/sitevl-grocery-qa';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report=[];
try {
for(const variant of [1,2,3,4,5])for(const width of [320,375,390,768,1024,1440]){
 const context=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'});
 const page=await context.newPage();const errors=[];const writes=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(r.method()==='POST')writes.push(new URL(r.url()).pathname);});
 await page.goto(`${base}/preview/grocery/${variant}?canvas=1`);
 await page.locator('.gp-product').first().waitFor();
 await page.locator('.gp-hero img').first().waitFor({timeout:3000}).catch(()=>{});
 await page.evaluate(async()=>{await Promise.all([...document.images].filter(i=>i.loading!=='lazy').map(i=>i.decode().catch(()=>{})));});
 assert.equal(await page.locator('h1').count(),1);
 assert.equal(await page.locator('#season').count(),1);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
 if(overflow)errors.push('document horizontal overflow');
 if([390,1440].includes(width))await page.screenshot({path:`${out}/v${variant}-${width}-hero.png`});
 const catalog=page.locator('#catalog');
 const apple=catalog.locator('[data-product="apples"]');
 await apple.scrollIntoViewIfNeeded();
 for(let i=0;i<4;i++)await apple.getByRole('button',{name:'Увеличить Яблоки Гала',exact:true}).click();
 assert.match(await apple.innerText(),/200–275/);
 await apple.getByRole('button',{name:'Добавить Яблоки Гала в корзину',exact:true}).click();
 const rice=catalog.locator('[data-product="rice"]');
 await rice.getByRole('button',{name:'Добавить Рис в корзину',exact:true}).click();
 if([390,1440].includes(width)){await apple.scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/v${variant}-${width}-catalog.png`});}
 await page.locator('.gp-header .gp-cart-trigger').click();
 const dialog=page.getByRole('dialog');await dialog.waitFor();
 assert.match(await dialog.innerText(),/285–360/);
 if([390,1440].includes(width))await page.screenshot({path:`${out}/v${variant}-${width}-cart.png`});
 await dialog.getByRole('button',{name:'Перейти к оформлению'}).click();
 await dialog.getByLabel('Ваше имя',{exact:true}).fill('Демо покупатель');
 await dialog.getByLabel('Телефон',{exact:true}).fill('00000000000');
 await dialog.getByLabel('Адрес',{exact:true}).fill('Демо, ул. Русская, 65');
 await dialog.getByLabel('Район',{exact:true}).selectOption('churkin');
 assert.match(await dialog.locator('.gp-routing').innerText(),/Шоссейная, 41/);
 await dialog.getByLabel('Район',{exact:true}).selectOption('suburb');
 assert.equal(await dialog.locator('form').evaluate(f=>f.checkValidity()),false);
 await dialog.getByLabel('Предполагаемая точка',{exact:false}).selectOption({label:'Бородинская, 26'});
 await dialog.getByRole('checkbox').check();
 assert.equal(await dialog.locator('form').evaluate(f=>f.checkValidity()),true);
 assert.equal(await dialog.evaluate(d=>d.scrollWidth>d.clientWidth+1),false,'dialog overflow');
 if([390,1440].includes(width))await page.screenshot({path:`${out}/v${variant}-${width}-checkout.png`});
 await dialog.getByRole('button',{name:'Оформить заказ',exact:true}).click();
 await dialog.getByRole('heading',{name:'Заказ принят',exact:true}).waitFor();
 assert.match(await dialog.innerText(),/ничего не отправлено/);
 assert.equal(writes.length,0,`unexpected POST ${writes.join(',')}`);
 await dialog.getByRole('button',{name:'Завершить демо'}).click();
 await page.locator('.gp-header .gp-cart-trigger').click();
 assert.match(await dialog.innerText(),/Пока пусто/);
 await page.keyboard.press('Escape');
 assert.equal(await dialog.isVisible(),false);
 assert.deepEqual(errors,[]);
 report.push({variant,width,checkout:'PASS',weightedRange:'PASS',overflow:false,errors,postRequests:writes});
 console.log(`PASS variant ${variant} / ${width}px`);
 await context.close();
}
} finally {await fs.writeFile(`${out}/results.json`,JSON.stringify(report,null,2));await browser.close();}
