import { FARM_CROPS, FARM_ZONES, farmWeatherForDate, type FarmAnimalType, type FarmCropId, type FarmPlot, type FarmZoneId, type ModernFarmState } from './modernFarmModel';

export type FarmCamera = { x: number; y: number; zoom: number };
export type FarmViewport = { width: number; height: number };
type Point = { x: number; y: number };
const TILE_W = 92;
const TILE_H = 46;

const project = (x: number, y: number, camera: FarmCamera, viewport: FarmViewport): Point => ({ x: viewport.width / 2 + camera.x + (x - y) * TILE_W * camera.zoom / 2, y: 30 + Math.max(0, (viewport.height - 680) / 2) + camera.y + (x + y) * TILE_H * camera.zoom / 2 });
const polygon = (ctx: CanvasRenderingContext2D, points: Point[], fill: string, stroke?: string) => { ctx.beginPath(); points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); } };
const diamond = (ctx: CanvasRenderingContext2D, center: Point, camera: FarmCamera, fill: string, stroke?: string) => polygon(ctx, [{ x: center.x, y: center.y - TILE_H * camera.zoom / 2 }, { x: center.x + TILE_W * camera.zoom / 2, y: center.y }, { x: center.x, y: center.y + TILE_H * camera.zoom / 2 }, { x: center.x - TILE_W * camera.zoom / 2, y: center.y }], fill, stroke);

function drawGround(ctx: CanvasRenderingContext2D, camera: FarmCamera, viewport: FarmViewport, now: number) {
  for (let y = 0; y < 14; y += 1) for (let x = 0; x < 18; x += 1) {
    const center = project(x, y, camera, viewport); const river = x >= 12 && y >= 2 && y <= 11;
    if (river) { const wave = Math.sin(now / 650 + x * .8 + y) * 3; diamond(ctx, { x: center.x, y: center.y + wave }, camera, y % 2 ? '#55b9d3' : '#64c6dd', 'rgba(225,252,255,.24)'); }
    else { const shade = (x + y) % 2 ? '#83bc5d' : '#8fc968'; diamond(ctx, center, camera, shade, 'rgba(45,92,43,.13)'); }
  }
  for (let i = 0; i < 17; i += 1) diamond(ctx, project(i, 8, camera, viewport), camera, i % 2 ? '#c8aa76' : '#d7ba83', 'rgba(91,69,40,.12)');
  for (let i = 1; i < 11; i += 1) diamond(ctx, project(7, i, camera, viewport), camera, i % 2 ? '#c4a572' : '#d2b27d', 'rgba(91,69,40,.12)');
}

function cropProgress(plot: FarmPlot, now: number) { if (!plot.plantedAt || !plot.readyAt) return 0; return Math.max(.08, Math.min(1, (now - plot.plantedAt) / (plot.readyAt - plot.plantedAt))); }
function drawPlot(ctx: CanvasRenderingContext2D, plot: FarmPlot, selected: boolean, camera: FarmCamera, viewport: FarmViewport, now: number) {
  const center = project(plot.x, plot.y, camera, viewport); diamond(ctx, center, camera, selected ? '#8b5c38' : '#765037', selected ? '#fff3a5' : '#4e3427');
  ctx.strokeStyle = 'rgba(255,226,168,.18)'; ctx.lineWidth = Math.max(1, camera.zoom); for (let row = -2; row <= 2; row += 1) { ctx.beginPath(); ctx.moveTo(center.x - TILE_W * camera.zoom * .34, center.y + row * 4 * camera.zoom); ctx.lineTo(center.x + TILE_W * camera.zoom * .34, center.y + row * 4 * camera.zoom); ctx.stroke(); }
  if (!plot.cropId) return; const definition = FARM_CROPS.find((crop) => crop.id === plot.cropId)!; const progress = cropProgress(plot, now); const sway = Math.sin(now / 420 + plot.x) * 1.8 * progress;
  for (let row = -1; row <= 1; row += 1) for (let column = -2; column <= 2; column += 1) drawCrop(ctx, definition.id, center.x + column * 11 * camera.zoom + row * 4 * camera.zoom, center.y + row * 7 * camera.zoom + column * 2 * camera.zoom, progress, sway, definition.colors, camera.zoom);
  if (progress >= 1) { ctx.fillStyle = '#fff8c8'; ctx.beginPath(); ctx.arc(center.x, center.y - 34 * camera.zoom, 8 * camera.zoom, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#3d6c3f'; ctx.font = `bold ${10 * camera.zoom}px system-ui`; ctx.textAlign = 'center'; ctx.fillText('✓', center.x, center.y - 30 * camera.zoom); }
}

function drawCrop(ctx: CanvasRenderingContext2D, id: FarmCropId, x: number, y: number, progress: number, sway: number, colors: [string, string], zoom: number) {
  const height = (8 + progress * 24) * zoom; ctx.save(); ctx.translate(x, y); ctx.lineCap = 'round'; ctx.strokeStyle = colors[1]; ctx.lineWidth = Math.max(1.2, 2 * zoom); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(sway, -height * .5, sway, -height); ctx.stroke();
  if (id === 'carrot' || id === 'potato') { ctx.fillStyle = colors[0]; ctx.beginPath(); ctx.ellipse(0, -2 * zoom, 4 * zoom, 6 * zoom, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (id === 'sunflower') { ctx.fillStyle = colors[0]; ctx.beginPath(); ctx.arc(sway, -height, 5.5 * zoom, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#614329'; ctx.beginPath(); ctx.arc(sway, -height, 2.5 * zoom, 0, Math.PI * 2); ctx.fill(); }
  else if (id === 'pumpkin' || id === 'tomato' || id === 'strawberry') { ctx.fillStyle = colors[0]; ctx.beginPath(); ctx.arc(sway - 2 * zoom, -height * .48, 4.5 * zoom, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(sway + 3 * zoom, -height * .55, 3.5 * zoom, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.fillStyle = colors[0]; ctx.beginPath(); ctx.ellipse(sway, -height, 3.5 * zoom, 7 * zoom, -.3, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = colors[1]; ctx.beginPath(); ctx.ellipse(-4 * zoom, -height * .48, 2.5 * zoom, 6 * zoom, -.7, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

function drawBuilding(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, roof: string, wall: string, camera: FarmCamera, viewport: FarmViewport, label: string) {
  const base = project(x, y, camera, viewport); const w = width * TILE_W * camera.zoom / 2; const d = width * TILE_H * camera.zoom / 2; const h = height * camera.zoom;
  ctx.save(); ctx.shadowColor = 'rgba(28,51,33,.28)'; ctx.shadowBlur = 14 * camera.zoom; ctx.shadowOffsetY = 9 * camera.zoom;
  polygon(ctx, [{ x: base.x - w, y: base.y }, { x: base.x, y: base.y + d }, { x: base.x, y: base.y + d - h }, { x: base.x - w, y: base.y - h }], wall);
  polygon(ctx, [{ x: base.x, y: base.y + d }, { x: base.x + w, y: base.y }, { x: base.x + w, y: base.y - h }, { x: base.x, y: base.y + d - h }], shade(wall, -.18));
  polygon(ctx, [{ x: base.x - w - 7 * camera.zoom, y: base.y - h }, { x: base.x, y: base.y - h - d - 18 * camera.zoom }, { x: base.x + w + 7 * camera.zoom, y: base.y - h }, { x: base.x, y: base.y - h + d }], roof, 'rgba(69,42,31,.35)'); ctx.restore();
  ctx.fillStyle = 'rgba(19,43,31,.74)'; ctx.font = `700 ${Math.max(8, 10 * camera.zoom)}px system-ui`; ctx.textAlign = 'center'; ctx.fillText(label, base.x, base.y + d + 17 * camera.zoom);
}

function shade(color: string, amount: number) { const value = Number.parseInt(color.slice(1), 16); const part = (shift: number) => Math.max(0, Math.min(255, (value >> shift & 255) + Math.round(255 * amount))); return `rgb(${part(16)} ${part(8)} ${part(0)})`; }
function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, camera: FarmCamera, viewport: FarmViewport, fruit = false) { const p = project(x, y, camera, viewport); const z = camera.zoom; ctx.fillStyle = '#765037'; ctx.fillRect(p.x - 3 * z, p.y - 36 * z, 6 * z, 38 * z); ctx.fillStyle = '#3e8d53'; [[-10,-35],[8,-40],[0,-52]].forEach(([dx,dy]) => { ctx.beginPath(); ctx.arc(p.x + dx * z, p.y + dy * z, 14 * z, 0, Math.PI * 2); ctx.fill(); }); if (fruit) { ctx.fillStyle = '#ee6063'; [[-9,-43],[8,-50],[3,-32]].forEach(([dx,dy]) => { ctx.beginPath(); ctx.arc(p.x + dx * z, p.y + dy * z, 3 * z, 0, Math.PI * 2); ctx.fill(); }); } }
function drawAnimal(ctx: CanvasRenderingContext2D, x: number, y: number, camera: FarmCamera, viewport: FarmViewport, kind: FarmAnimalType, now: number, ready: boolean) { const p = project(x, y, camera, viewport); const z = camera.zoom; const bob = Math.sin(now / 550 + x * 3) * 2 * z; ctx.save(); ctx.translate(p.x, p.y + bob); ctx.shadowColor = 'rgba(27,45,31,.2)'; ctx.shadowBlur = 8*z; if (kind === 'cow') { ctx.fillStyle = '#f7eee0'; ctx.beginPath(); ctx.ellipse(0, -16 * z, 19 * z, 11 * z, -.1, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#5b4b43'; ctx.beginPath(); ctx.arc(-6 * z, -18 * z, 5 * z, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-12 * z, -8 * z, 3 * z, 14 * z); ctx.fillRect(8 * z, -8 * z, 3 * z, 14 * z); } else { ctx.fillStyle = '#fff3c7'; ctx.beginPath(); ctx.arc(0, -12 * z, 8 * z, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ef5d42'; ctx.beginPath(); ctx.moveTo(7*z,-14*z);ctx.lineTo(13*z,-11*z);ctx.lineTo(7*z,-9*z);ctx.fill(); } ctx.shadowBlur = 0; if (ready) { ctx.fillStyle = '#fff8c8'; ctx.beginPath(); ctx.arc(0,-38*z,8*z,0,Math.PI*2);ctx.fill();ctx.fillStyle='#326a42';ctx.font=`700 ${10*z}px system-ui`;ctx.textAlign='center';ctx.fillText('✓',0,-34*z); } ctx.restore(); }
function drawTruck(ctx: CanvasRenderingContext2D, x: number, y: number, camera: FarmCamera, viewport: FarmViewport) { const p = project(x, y, camera, viewport); const z = camera.zoom; ctx.fillStyle = 'rgba(25,48,35,.24)'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 34*z, 11*z, 0, 0, Math.PI*2);ctx.fill();ctx.fillStyle='#f15d45';ctx.fillRect(p.x-28*z,p.y-30*z,55*z,25*z);ctx.fillStyle='#f9d67b';ctx.fillRect(p.x-28*z,p.y-43*z,25*z,15*z);ctx.fillStyle='#30485a';ctx.fillRect(p.x-23*z,p.y-40*z,15*z,10*z);ctx.fillStyle='#26312f';[-18,18].forEach((dx)=>{ctx.beginPath();ctx.arc(p.x+dx*z,p.y-3*z,7*z,0,Math.PI*2);ctx.fill();}); }

function drawLocks(ctx: CanvasRenderingContext2D, state: ModernFarmState, camera: FarmCamera, viewport: FarmViewport) {
  const positions: Record<FarmZoneId, [number, number]> = { farm: [4,4], market: [2,10], orchard: [10,2], river: [13,3], fishing: [14,7], pier: [14,10], 'north-land': [11,1] };
  FARM_ZONES.filter((zone) => !state.unlockedZones.includes(zone.id)).forEach((zone) => { const [x,y] = positions[zone.id]; const p = project(x,y,camera,viewport); ctx.fillStyle='rgba(25,47,38,.72)';ctx.beginPath();ctx.roundRect(p.x-52*camera.zoom,p.y-52*camera.zoom,104*camera.zoom,40*camera.zoom,8*camera.zoom);ctx.fill();ctx.strokeStyle='#fff7d1';ctx.lineWidth=1.4*camera.zoom;ctx.strokeRect(p.x-5*camera.zoom,p.y-43*camera.zoom,10*camera.zoom,8*camera.zoom);ctx.beginPath();ctx.arc(p.x,p.y-43*camera.zoom,5*camera.zoom,Math.PI,0);ctx.stroke();ctx.fillStyle='#fff7d1';ctx.font=`700 ${9*camera.zoom}px system-ui`;ctx.textAlign='center';ctx.fillText(`${zone.name} · ур. ${zone.level}`,p.x,p.y-21*camera.zoom); });
}

function drawWeather(ctx: CanvasRenderingContext2D, viewport: FarmViewport, state: ModernFarmState, now: number) {
  const hour = new Date(now).getHours(); const night = hour >= 20 || hour < 6; const quality = state.settings.quality === 'auto' ? (viewport.width < 700 ? 'low' : 'high') : state.settings.quality;
  if (night) { ctx.fillStyle='rgba(12,38,64,.18)';ctx.fillRect(0,0,viewport.width,viewport.height); }
  if (farmWeatherForDate(now) !== 'rain' || state.settings.reducedEffects) return;
  const count = quality === 'low' ? 14 : quality === 'medium' ? 26 : 40; ctx.strokeStyle='rgba(218,247,255,.5)';ctx.lineWidth=1;
  for(let index=0;index<count;index+=1){const x=(index*97+now/19)% (viewport.width+80)-40;const y=(index*53+now/8)% (viewport.height+60)-30;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-7,y+15);ctx.stroke();}
}

export function drawFarmWorld(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: ModernFarmState, camera: FarmCamera, selectedPlotId: string | null, now: number) {
  const ratio = Math.min(devicePixelRatio, 2); const viewport = { width: canvas.clientWidth, height: canvas.clientHeight };
  if (canvas.width !== Math.round(viewport.width * ratio) || canvas.height !== Math.round(viewport.height * ratio)) { canvas.width = Math.round(viewport.width * ratio); canvas.height = Math.round(viewport.height * ratio); ctx.setTransform(ratio, 0, 0, ratio, 0, 0); }
  const sky = ctx.createLinearGradient(0,0,0,viewport.height);sky.addColorStop(0,'#bce8ed');sky.addColorStop(.38,'#dff3df');sky.addColorStop(1,'#91c968');ctx.fillStyle=sky;ctx.fillRect(0,0,viewport.width,viewport.height);
  ctx.save(); ctx.lineJoin='round'; drawGround(ctx,camera,viewport,now);
  state.plots.slice().sort((a,b)=>a.x+a.y-b.x-b.y).forEach((plot)=>drawPlot(ctx,plot,plot.id===selectedPlotId,camera,viewport,now));
  drawTree(ctx,1,4,camera,viewport);drawTree(ctx,2,3,camera,viewport);drawTree(ctx,9,1,camera,viewport,true);drawTree(ctx,10,2,camera,viewport,true);drawTree(ctx,11,3,camera,viewport,true);
  drawBuilding(ctx,2,2,1.4,54,'#d85b4b','#fff1cf',camera,viewport,'Дом');drawBuilding(ctx,8,3,1.3,48,'#5e91b5','#f2d69e',camera,viewport,'Амбар');drawBuilding(ctx,8,7,1.1,45,'#c5854e','#f4dfb7',camera,viewport,'Мельница');drawBuilding(ctx,2,10,1.1,42,'#ed6d54','#fff0bf',camera,viewport,'Заказы');
  if(state.unlockedZones.includes('pier')) drawBuilding(ctx,14,10,1,35,'#4b7f9b','#e7d6ae',camera,viewport,'Пристань');
  state.animals.forEach((animal,index)=>drawAnimal(ctx,4.7+(index%3)*.72,2.4+Math.floor(index/3)*.78,camera,viewport,animal.type,now,Boolean(animal.readyAt&&animal.readyAt<=now)));
  state.decorations.forEach((decoration,index)=>{const p=project(1.2+index*.8,6.8,camera,viewport);ctx.fillStyle=decoration==='flower-bed'?'#ef6b83':decoration==='windmill'?'#edf2de':'#f6d85e';ctx.beginPath();ctx.arc(p.x,p.y-10*camera.zoom,7*camera.zoom,0,Math.PI*2);ctx.fill();});
  drawTruck(ctx,4,9,camera,viewport);drawLocks(ctx,state,camera,viewport);ctx.restore();drawWeather(ctx,viewport,state,now);
}

export function farmPlotAtScreen(state: ModernFarmState, camera: FarmCamera, viewport: FarmViewport, screen: Point): FarmPlot | undefined {
  return state.plots.map((plot) => ({ plot, point: project(plot.x, plot.y, camera, viewport) })).filter(({ point }) => Math.abs(screen.x - point.x) < TILE_W * camera.zoom * .48 && Math.abs(screen.y - point.y) < TILE_H * camera.zoom * .7).sort((a,b)=>Math.hypot(screen.x-a.point.x,screen.y-a.point.y)-Math.hypot(screen.x-b.point.x,screen.y-b.point.y))[0]?.plot;
}
