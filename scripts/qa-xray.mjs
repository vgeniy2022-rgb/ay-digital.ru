import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// Runs only against a local production preview. No provider credentials or database writes.
const base = process.argv[2] || 'http://localhost:4173';
if (!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(base)) throw new Error('X-RAY QA accepts local previews only');
const executable = process.env.SITEVL_BROWSER_BIN || 'agent-browser';
const session = 'sitevl-xray-qa';
const directory = mkdtempSync(join(tmpdir(), 'sitevl-xray-qa-'));
const results = [];
function run(...args) {
  return execFileSync(executable.endsWith('.js') ? process.execPath : executable, [...(executable.endsWith('.js') ? [executable] : []), '--session', session, ...args], { encoding: 'utf8', timeout: 45000 });
}
function read(script) {
  const value = JSON.parse(run('eval', `JSON.stringify(${script})`).trim());
  return typeof value === 'string' ? JSON.parse(value) : value;
}
const settle = (ms = 380) => run('eval', `(async()=>{await document.fonts.ready;await new Promise(r=>setTimeout(r,${ms}));})()`);
function check(name, pass, details = {}) {
  results.push({ name, pass, ...details }); console.log(JSON.stringify({ name, pass, ...details }));
  if (!pass) throw new Error(name);
}
function button(name) { run('snapshot', '-i'); run('find', 'role', 'button', 'click', '--name', name, '--exact'); settle(60); }
function open(path) { run('open', base + path); run('wait', 'h1'); settle(); }
function activate() { run('press', 'x'); run('wait', '.xray-controller'); settle(); }
function off() { run('click', '[aria-label="Выключить X-RAY"]'); settle(); }
const opacity = () => read('Number(getComputedStyle(document.getElementById("xray-live-site")).opacity)');
let socket;
let cdpSession;
let sequence = 0;
const pending = new Map();
function send(method, params = {}, attached = true) {
  const id = ++sequence;
  return new Promise((resolvePromise, reject) => {
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error('CDP command timeout')); }, 15000);
    pending.set(id, { resolve: result => { clearTimeout(timeout); resolvePromise(result); }, reject: error => { clearTimeout(timeout); reject(error); } });
    socket.send(JSON.stringify({ id, method, params, ...(attached && cdpSession ? { sessionId: cdpSession } : {}) }));
  });
}
async function connectInput() {
  socket = new WebSocket(run('get', 'cdp-url').trim());
  await new Promise((resolvePromise, reject) => { socket.addEventListener('open', resolvePromise, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (!pending.has(message.id)) return;
    const request = pending.get(message.id); pending.delete(message.id);
    if (message.error) request.reject(new Error('Browser input command failed')); else request.resolve(message.result);
  });
  const targets = await send('Target.getTargets', {}, false);
  const target = targets.targetInfos.find(item => item.type === 'page' && item.url.startsWith(base));
  if (!target) throw new Error('QA page not found');
  cdpSession = (await send('Target.attachToTarget', { targetId: target.targetId, flatten: true }, false)).sessionId;
}

try {
  run('--init-script', resolve('scripts/xray-qa-init.js'), 'open', base + '/');
  run('set', 'viewport', '1440', '1000'); run('wait', 'h1'); settle();
  // Real CMS status loads asynchronously; wait for its own fallback/success before comparing page height.
  run('wait', '--fn', '!document.querySelector(".home-cinematic-hero__status")?.textContent.includes("Проверяю статус")');
  settle();
  if (read('Boolean([...document.querySelectorAll("button")].find(b=>b.textContent==="Понятно"))')) button('Понятно');
  check('off: no X-RAY source chunk fetched', !read('performance.getEntriesByType("resource").some(r=>r.name.includes("XRayExperience"))'));
  run('eval', 'void(window.__xrayOriginalHeading=document.querySelector("h1"))');
  run('screenshot', join(directory, '01-normal-desktop.png'));
  // Ten real keyboard/button cycles, including exact scroll/DOM restoration.
  run('eval', 'scrollTo({top:260,behavior:"instant"})'); settle();
  for (let i = 1; i <= 10; i++) {
    const before = read('({scroll:scrollY,height:document.documentElement.scrollHeight})');
    activate();
    check(`cycle ${i}: live DOM and correct stacking`, read('window.__xrayOriginalHeading===document.querySelector("h1") && getComputedStyle(document.querySelector(".xray-code-layer")).zIndex==="0" && getComputedStyle(document.getElementById("xray-live-site")).zIndex==="1"') && Math.abs(opacity() - .55) < .01);
    off();
    const after = read('({scroll:scrollY,height:document.documentElement.scrollHeight,clean:!document.querySelector(".xray-code-layer,.xray-ui,.xray-effects")&&!document.body.hasAttribute("data-xray-open")&&!document.getElementById("xray-live-site").hasAttribute("data-xray-active"),style:document.getElementById("xray-live-site").getAttribute("style")})');
    check(`cycle ${i}: clean exit, no scroll reset`, after.clean && after.scroll === before.scroll && after.height === before.height && !after.style, { before, after });
  }
  run('eval', 'scrollTo({top:0,behavior:"instant"})'); activate();
  run('screenshot', join(directory, '02-xray-desktop.png'));
  run('hover', 'h1'); settle(80);
  check('hover maps H1 to real HomePage JSX', read('document.querySelector(".xray-element-label")?.textContent.includes("HomePage") && [...document.querySelectorAll(".xray-code-layer .is-highlighted")].some(e=>e.textContent.includes("<h1>{pageMeta.home.title}</h1>"))'));
  run('click', 'h1'); settle();
  check('click opens compact inspector', read('document.querySelectorAll(".xray-inspector").length===1 && document.querySelector(".xray-inspector").innerText.includes("src/pages/HomePage.tsx")'));
  button('CSS');
  check('CSS is computed style, panels do not overlap', read('(()=>{const c=document.querySelector(".xray-controller").getBoundingClientRect(),i=document.querySelector(".xray-inspector").getBoundingClientRect();return document.querySelector(".xray-inspector__code").innerText.includes("font-size:")&&(c.bottom<=i.top||i.bottom<=c.top)})()'));
  button('DATA'); check('DATA is limited to DOM attributes', read('document.querySelector(".xray-inspector").innerText.includes("DOM-атрибуты") && !document.querySelector(".xray-inspector__code").innerText.includes("pageMeta")'));
  button('JSX'); run('screenshot', join(directory, '03-inspector-desktop.png'));
  run('press', 'Escape'); check('Esc first closes inspector only', read('!document.querySelector(".xray-inspector")&&Boolean(document.querySelector(".xray-controller"))'));
  button('Развернуть настройки');
  button('Фокус кода'); settle(); check('Focus code uses 20% opacity', Math.abs(opacity() - .2) < .01);
  button('Фокус кода'); settle();
  await connectInput();
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Alt', code: 'AltLeft', windowsVirtualKeyCode: 18, modifiers: 1 }); settle();
  check('native Alt hold reveals code', Math.abs(opacity() - .2) < .01);
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Alt', code: 'AltLeft', windowsVirtualKeyCode: 18, modifiers: 0 }); settle();
  check('native Alt release restores opacity', Math.abs(opacity() - .55) < .01);
  run('focus', '[aria-label="Непрозрачность сайта"]'); run('press', 'Home'); settle(); check('opacity slider minimum', Math.abs(opacity() - .25) < .01);
  run('press', 'End'); settle(); check('opacity slider maximum', Math.abs(opacity() - .85) < .01);
  off(); activate();
  button('Линза EXP'); run('mouse', 'move', '380', '360'); settle(100);
  check('lens follows pointer using real CSS mask', read('getComputedStyle(document.getElementById("xray-live-site")).maskImage.includes("380px 360px") && document.querySelectorAll(".xray-lens-ring").length===1'));
  run('screenshot', join(directory, '04-reveal-lens.png')); button('Линза EXP');
  button('Структура'); check('structure is actual DOM/component tree', read('document.querySelector(".xray-code-layer").innerText.includes("└─")'));
  button('Box model'); run('hover', 'h1'); settle(80);
  check('box model adds measured overlays', read('Boolean(document.querySelector(".xray-box-margin"))&&Boolean(document.querySelector(".xray-box-padding"))'));
  button('Код'); run('mouse', 'move', '1400', '900');
  run('check', '.xray-toggle:not(:has(svg)) input'); settle(80);
  check('HTML view renders actual sanitized DOM', read('document.querySelector(".xray-code-layer").innerText.includes("HTML · актуальный DOM")'));
  run('eval', '(()=>{const e=document.createElement("span");e.dataset.sensitive="";e.id="qa-xray-sensitive";e.textContent="QA-PRIVATE-DESCENDANT";document.querySelector("h1").append(e)})()'); settle(80);
  check('private descendants excluded from HTML and section titles', read('!document.querySelector(".xray-code-layer").innerText.includes("QA-PRIVATE-DESCENDANT")'));
  run('eval','document.getElementById("qa-xray-sensitive").remove()');
  run('uncheck','.xray-toggle:not(:has(svg)) input');
  run('focus','[aria-label="Яркость кода"]');run('press','Home');settle();
  check('brightness control changes only the code layer',read('Number(document.querySelector(".xray-code-layer").style.getPropertyValue("--xray-code-brightness"))===.25')&&Math.abs(opacity()-.55)<.01);
  run('press','End');
  run('click','.xray-files-toggle');button('pages/HomePage.tsx');settle();
  check('file inspector exposes real JSX fragments, not imports or private config',read('document.querySelector(".xray-inspector").innerText.includes("src/pages/HomePage.tsx")&&document.querySelector(".xray-inspector__code").innerText.includes("home-cinematic-hero")&&!/import\\s|process\\.env|import\\.meta\\.env/.test(document.querySelector(".xray-inspector__code").innerText)'));
  button('Копировать безопасный фрагмент');
  check('safe fragment copy succeeds',read('Boolean([...document.querySelectorAll("button")].find(b=>b.getAttribute("aria-label")==="Код скопирован"))'));
  run('press','Escape');button('Развернуть настройки');
  run('eval', 'document.querySelector(".home-editorial-section--services").scrollIntoView({behavior:"instant",block:"start"})'); settle();
  check('scroll synchronizes Services code with its section', read('(()=>{const s=document.querySelector(".home-editorial-section--services"),c=[...document.querySelectorAll(".xray-source-section")].find(e=>e.innerText.includes("home-service-grid"));return Boolean(c)&&Math.abs(s.getBoundingClientRect().top-c.getBoundingClientRect().top)<2})()'));
  run('screenshot', join(directory, '05-synced-services.png'));
  run('uncheck', '.xray-toggle:has(svg) input[type="checkbox"]');
  run('eval', 'scrollTo({top:0,behavior:"instant"})'); settle();
  run('click', '.site-header a[href="/services"]'); run('wait', '--url', '**/services'); run('wait', 'h1'); settle(650);
  check('SPA navigation keeps one X-RAY and removes old page source', read('document.querySelectorAll(".xray-controller").length===1&&!document.querySelector(".xray-code-layer").innerText.includes("src/pages/HomePage.tsx")&&location.pathname==="/services"'));
  off();
  // Representative public templates at desktop/tablet/mobile sizes.
  for (const [width, height] of [[1440,1000],[768,1024],[390,844],[320,844]]) {
    run('set','viewport',String(width),String(height)); open('/cases/inner-support-school'); activate();
    check(`case ${width}px: real source and no horizontal overflow`, read('document.documentElement.scrollWidth<=innerWidth&&document.querySelectorAll("h1").length===1&&document.querySelector(".xray-code-layer").innerText.includes("src/pages/CasePage.tsx")'));
    if (width <= 640) {
      await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
      const tap = read('(()=>{const r=document.querySelector("h1").getBoundingClientRect();return{x:r.left+30,y:Math.max(100,Math.min(innerHeight-140,r.top+24))}})()');
      await send('Input.dispatchTouchEvent', { type:'touchStart',touchPoints:[{...tap,id:1}] });
      await send('Input.dispatchTouchEvent', { type:'touchEnd',touchPoints:[] }); settle();
      check(`touch ${width}px: tap opens inspector within viewport`, read('(()=>{const i=document.querySelector(".xray-inspector");if(!i)return false;const r=i.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight})()'));
      run('screenshot',join(directory,`06-touch-${width}.png`));
      run('press','Escape');
      const before=read('scrollY');
      await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:width/2,y:520,id:1}]});
      for(let step=1;step<=8;step++){await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:width/2,y:520-step*35,id:1}]});await new Promise(r=>setTimeout(r,20));}
      await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});settle();
      check(`touch ${width}px: swipe scrolls, not selects`,read('scrollY')>before+80&&!read('Boolean(document.querySelector(".xray-inspector"))'));
      await send('Emulation.setTouchEmulationEnabled',{enabled:false});
    } else { run('screenshot',join(directory,`06-case-${width}.png`)); }
    off();
  }
  run('set','viewport','1440','1000');open('/ai-website');activate();
  run('fill','input[placeholder="Например, семейная стоматология"]','QA-XRAY-PRIVATE-INPUT');run('press','x');settle(60);
  check('typing X in real form does not toggle X-RAY or disclose input',read('Boolean(document.querySelector(".xray-controller"))&&!document.querySelector(".xray-code-layer").innerText.includes("QA-XRAY-PRIVATE")&&!document.querySelector(".xray-inspector")&&document.querySelector("main").hasAttribute("data-xray-private")'));
  off();
  open('/ai-website/');activate();check('private route remains excluded with a trailing slash',read('document.querySelector("main").hasAttribute("data-xray-private")'));off();
  open('/');await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});activate();
  check('reduced motion disables scan and opacity animation',read('getComputedStyle(document.querySelector(".xray-scan")).display==="none"&&getComputedStyle(document.getElementById("xray-live-site")).transitionDuration==="0s"'));
  run('press','Tab');check('keyboard focus stays reachable in controller',read('Boolean(document.activeElement.closest("[data-xray-ui]"))'));
  off();await send('Emulation.setEmulatedMedia',{features:[]});
  open('/lab');check('LAB has no duplicate X-RAY mode or leaked global styles',read('!document.querySelector(".xray-controller,.xray-launcher,.xray-code-layer")&&!document.body.hasAttribute("data-xray-open")'));
  check('no unhandled browser errors',run('errors').trim()==='');
} catch(error) {
  console.log(JSON.stringify({failure:error.message}));
  try{run('screenshot',join(directory,'failure.png'));}catch{/* retain original failure */}
  process.exitCode=1;
} finally {
  if(socket){try{await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Alt',code:'AltLeft',modifiers:0});}catch{/* page may already be closed */}socket.close();}
  writeFileSync(join(directory,'results.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({evidence:directory,passed:results.filter(r=>r.pass).length,checks:results.length}));
  run('close');
}
