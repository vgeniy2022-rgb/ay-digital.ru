import { Circle, Focus, Link2, Maximize2, Minus, MousePointer2, Plus, RotateCcw, Square, StickyNote, Trash2, Type } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LabShell } from '../core/LabShell';
import { unlockLabAchievement } from '../core/storage';
import { createCanvasItem, hitCanvasItem, initialCanvasDocument, readCanvasDocument, writeCanvasDocument, type CanvasViewport, type InfiniteCanvasItem, type InfiniteCanvasItemType } from './canvasModel';
import './infiniteCanvas.css';

type DragSession = {
  id: number;
  kind: 'pan' | 'items';
  startX: number;
  startY: number;
  viewport: CanvasViewport;
  items: Record<string, { x: number; y: number }>;
};
type PinchSession = { distance: number; worldX: number; worldY: number };

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.roundRect(x, y, width, height, safeRadius);
}

function wrapCanvasText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
  let lineCount = 0;
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(' ');
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width > maxWidth && line) {
        context.fillText(line, x, y + lineCount * lineHeight);
        lineCount += 1;
        line = word;
        if (lineCount >= maxLines) return;
      } else line = candidate;
    }
    if (lineCount < maxLines) context.fillText(line, x, y + lineCount * lineHeight);
    lineCount += 1;
    if (lineCount >= maxLines) return;
  }
}

export function InfiniteCanvasPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragSession | null>(null);
  const pinchRef = useRef<PinchSession | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const initiallyCenteredRef = useRef(false);
  const [document, setDocument] = useState(readCanvasDocument);
  const documentRef = useRef(document);
  documentRef.current = document;
  const [viewport, setViewport] = useState<CanvasViewport>({ x: 0, y: 0, zoom: 1 });
  const [selection, setSelection] = useState<string[]>([]);
  const [multiSelect, setMultiSelect] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const navigate = useNavigate();
  const selectedItem = useMemo(() => document.items.find((item) => item.id === selection[selection.length - 1]), [document.items, selection]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.max(1, entry.contentRect.width);
      const height = Math.max(1, entry.contentRect.height);
      setDimensions({ width, height });
      if (!initiallyCenteredRef.current) {
        initiallyCenteredRef.current = true;
        setViewport({ x: width / 2, y: height / 2, zoom: 1 });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => writeCanvasDocument(document), 160);
    return () => window.clearTimeout(timer);
  }, [document]);

  useEffect(() => () => writeCanvasDocument(documentRef.current), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(dimensions.width * dpr);
    canvas.height = Math.round(dimensions.height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, dimensions.width, dimensions.height);
    context.fillStyle = '#0e1116';
    context.fillRect(0, 0, dimensions.width, dimensions.height);

    const grid = 72 * viewport.zoom;
    if (grid >= 18) {
      context.strokeStyle = 'rgba(255,255,255,.065)';
      context.lineWidth = 1;
      context.beginPath();
      for (let x = ((viewport.x % grid) + grid) % grid; x < dimensions.width; x += grid) { context.moveTo(x, 0); context.lineTo(x, dimensions.height); }
      for (let y = ((viewport.y % grid) + grid) % grid; y < dimensions.height; y += grid) { context.moveTo(0, y); context.lineTo(dimensions.width, y); }
      context.stroke();
    }

    const toScreen = (x: number, y: number) => ({ x: x * viewport.zoom + viewport.x, y: y * viewport.zoom + viewport.y });
    document.connections.forEach((connection) => {
      const from = document.items.find((item) => item.id === connection.from);
      const to = document.items.find((item) => item.id === connection.to);
      if (!from || !to) return;
      const start = toScreen(from.x + from.width / 2, from.y + from.height / 2);
      const end = toScreen(to.x + to.width / 2, to.y + to.height / 2);
      context.strokeStyle = 'rgba(117,167,255,.45)';
      context.lineWidth = Math.max(1, viewport.zoom * 2);
      context.setLineDash([7 * viewport.zoom, 8 * viewport.zoom]);
      context.beginPath(); context.moveTo(start.x, start.y); context.bezierCurveTo((start.x + end.x) / 2, start.y, (start.x + end.x) / 2, end.y, end.x, end.y); context.stroke();
      context.setLineDash([]);
    });

    document.items.forEach((item) => {
      const screen = toScreen(item.x, item.y);
      const width = item.width * viewport.zoom;
      const height = item.height * viewport.zoom;
      if (screen.x + width < -80 || screen.y + height < -80 || screen.x > dimensions.width + 80 || screen.y > dimensions.height + 80) return;
      context.save();
      context.shadowColor = 'rgba(0,0,0,.28)';
      context.shadowBlur = 24 * viewport.zoom;
      context.shadowOffsetY = 10 * viewport.zoom;
      if (item.type === 'circle') {
        context.beginPath(); context.ellipse(screen.x + width / 2, screen.y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
      } else roundedRect(context, screen.x, screen.y, width, height, item.type === 'portal' ? 11 * viewport.zoom : 7 * viewport.zoom);
      context.fillStyle = item.type === 'text' ? 'rgba(18,21,27,.78)' : item.type === 'portal' ? '#171a21' : item.color;
      context.fill();
      context.shadowColor = 'transparent';
      if (item.type === 'portal') {
        context.strokeStyle = item.color;
        context.lineWidth = 2 * viewport.zoom;
        context.stroke();
        context.fillStyle = item.color;
        context.font = `800 ${Math.max(8, 10 * viewport.zoom)}px ui-monospace, monospace`;
        context.fillText('HIDDEN LAB LINK', screen.x + 16 * viewport.zoom, screen.y + 23 * viewport.zoom);
      }
      context.fillStyle = item.type === 'note' ? '#16191d' : '#f7f8fb';
      context.font = `${item.type === 'text' ? '800' : '700'} ${Math.max(9, (item.type === 'text' ? 23 : 13) * viewport.zoom)}px Inter, sans-serif`;
      context.textBaseline = 'top';
      wrapCanvasText(context, item.text, screen.x + 16 * viewport.zoom, screen.y + (item.type === 'portal' ? 45 : 18) * viewport.zoom, width - 32 * viewport.zoom, (item.type === 'text' ? 28 : 18) * viewport.zoom, item.type === 'text' ? 3 : 6);
      if (selection.includes(item.id)) {
        context.strokeStyle = '#fff'; context.lineWidth = 2; context.setLineDash([5, 4]);
        if (item.type === 'circle') { context.beginPath(); context.ellipse(screen.x + width / 2, screen.y + height / 2, width / 2 + 5, height / 2 + 5, 0, 0, Math.PI * 2); }
        else roundedRect(context, screen.x - 5, screen.y - 5, width + 10, height + 10, 8);
        context.stroke(); context.setLineDash([]);
      }
      context.restore();
    });
    context.fillStyle = 'rgba(255,255,255,.45)';
    context.font = '700 9px ui-monospace, monospace';
    context.fillText(`${Math.round(viewport.zoom * 100)}% · X ${Math.round(-viewport.x / viewport.zoom)} · Y ${Math.round(-viewport.y / viewport.zoom)}`, 16, dimensions.height - 18);
  }, [dimensions, document, selection, viewport]);

  const screenPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const worldPoint = (screen: { x: number; y: number }, sourceViewport = viewport) => ({ x: (screen.x - sourceViewport.x) / sourceViewport.zoom, y: (screen.y - sourceViewport.y) / sourceViewport.zoom });
  const startPointer = (event: PointerEvent<HTMLCanvasElement>) => {
    const screen = screenPoint(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, screen);
    if (pointersRef.current.size === 2) {
      const [first, second] = [...pointersRef.current.values()];
      const center = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
      const world = worldPoint(center);
      pinchRef.current = { distance: Math.hypot(second.x - first.x, second.y - first.y), worldX: world.x, worldY: world.y };
      dragRef.current = null;
      return;
    }
    const world = worldPoint(screen);
    const hit = hitCanvasItem(document.items, world.x, world.y);
    if (hit) {
      const additive = event.shiftKey || multiSelect;
      const nextSelection = additive ? (selection.includes(hit.id) ? selection.filter((id) => id !== hit.id) : [...selection, hit.id]) : (selection.includes(hit.id) ? selection : [hit.id]);
      setSelection(nextSelection);
      const movingIds = nextSelection.includes(hit.id) ? nextSelection : [hit.id];
      dragRef.current = { id: event.pointerId, kind: 'items', startX: screen.x, startY: screen.y, viewport, items: Object.fromEntries(document.items.filter((item) => movingIds.includes(item.id)).map((item) => [item.id, { x: item.x, y: item.y }])) };
    } else {
      if (!event.shiftKey && !multiSelect) setSelection([]);
      dragRef.current = { id: event.pointerId, kind: 'pan', startX: screen.x, startY: screen.y, viewport, items: {} };
    }
  };
  const movePointer = (event: PointerEvent<HTMLCanvasElement>) => {
    const screen = screenPoint(event);
    pointersRef.current.set(event.pointerId, screen);
    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const [first, second] = [...pointersRef.current.values()];
      const center = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      const nextZoom = clamp(viewport.zoom * distance / Math.max(1, pinchRef.current.distance), .18, 3.2);
      setViewport({ zoom: nextZoom, x: center.x - pinchRef.current.worldX * nextZoom, y: center.y - pinchRef.current.worldY * nextZoom });
      pinchRef.current = { distance, worldX: pinchRef.current.worldX, worldY: pinchRef.current.worldY };
      return;
    }
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const deltaX = screen.x - drag.startX;
    const deltaY = screen.y - drag.startY;
    if (drag.kind === 'pan') setViewport({ ...drag.viewport, x: drag.viewport.x + deltaX, y: drag.viewport.y + deltaY });
    else setDocument((current) => ({ ...current, items: current.items.map((item) => drag.items[item.id] ? { ...item, x: drag.items[item.id].x + deltaX / drag.viewport.zoom, y: drag.items[item.id].y + deltaY / drag.viewport.zoom } : item) }));
  };
  const endPointer = (event: PointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (dragRef.current?.id === event.pointerId && dragRef.current.kind === 'items') unlockLabAchievement('CANVAS_EXPLORER');
    if (dragRef.current?.id === event.pointerId) dragRef.current = null;
    if (pointersRef.current.size < 2) pinchRef.current = null;
  };
  const zoomAt = (screen: { x: number; y: number }, factor: number) => {
    setViewport((current) => {
      const world = worldPoint(screen, current);
      const zoom = clamp(current.zoom * factor, .18, 3.2);
      return { zoom, x: screen.x - world.x * zoom, y: screen.y - world.y * zoom };
    });
  };
  const wheel = (event: WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    zoomAt({ x: event.clientX - rect.left, y: event.clientY - rect.top }, Math.exp(-event.deltaY * .0015));
  };
  const addItem = (type: Exclude<InfiniteCanvasItemType, 'portal'>) => {
    const center = worldPoint({ x: dimensions.width / 2, y: dimensions.height / 2 });
    const item = createCanvasItem(type, center.x - 110, center.y - 75);
    setDocument((current) => ({ ...current, items: [...current.items, item] }));
    setSelection([item.id]);
    unlockLabAchievement('CANVAS_EXPLORER');
  };
  const updateSelected = (patch: Partial<InfiniteCanvasItem>) => {
    if (!selectedItem) return;
    setDocument((current) => ({ ...current, items: current.items.map((item) => item.id === selectedItem.id ? { ...item, ...patch } : item) }));
  };
  const deleteSelected = () => {
    const ids = new Set(selection);
    setDocument((current) => ({ ...current, items: current.items.filter((item) => !ids.has(item.id)), connections: current.connections.filter((connection) => !ids.has(connection.from) && !ids.has(connection.to)) }));
    setSelection([]);
  };
  const connectSelected = () => {
    if (selection.length !== 2) return;
    const [from, to] = selection;
    setDocument((current) => current.connections.some((connection) => connection.from === from && connection.to === to || connection.from === to && connection.to === from) ? current : { ...current, connections: [...current.connections, { id: `connection-${Date.now()}`, from, to }] });
  };
  const reset = () => {
    setDocument(initialCanvasDocument);
    setViewport({ x: dimensions.width / 2, y: dimensions.height / 2, zoom: 1 });
    setSelection([]);
  };

  return <LabShell experimentId="canvas" title="Infinite Canvas" description="Бесконечное рабочее пространство с заметками, текстом, фигурами, связями, pan, zoom и локальным сохранением." canonicalPath="/lab/canvas" status="EXPERIMENTAL · SPATIAL CANVAS" immersive className="infinite-canvas-host">
    <section className="infinite-canvas-app">
      <header className="infinite-canvas-toolbar" aria-label="Инструменты Infinite Canvas"><div><span>07</span><strong>INFINITE CANVAS</strong></div><nav><button type="button" onClick={() => addItem('note')}><StickyNote /> <span>NOTE</span></button><button type="button" onClick={() => addItem('text')}><Type /> <span>TEXT</span></button><button type="button" onClick={() => addItem('rect')}><Square /> <span>RECT</span></button><button type="button" onClick={() => addItem('circle')}><Circle /> <span>CIRCLE</span></button><button className={multiSelect ? 'is-active' : ''} type="button" onClick={() => setMultiSelect((value) => !value)} aria-pressed={multiSelect}><MousePointer2 /> <span>MULTI</span></button><button type="button" onClick={connectSelected} disabled={selection.length !== 2}><Link2 /> <span>CONNECT</span></button><button type="button" onClick={deleteSelected} disabled={!selection.length}><Trash2 /> <span>DELETE</span></button></nav><div><button type="button" onClick={() => zoomAt({ x: dimensions.width / 2, y: dimensions.height / 2 }, .82)} aria-label="Уменьшить масштаб"><Minus /></button><button type="button" onClick={() => setViewport({ x: dimensions.width / 2, y: dimensions.height / 2, zoom: 1 })} aria-label="Центрировать холст"><Focus /></button><button type="button" onClick={() => zoomAt({ x: dimensions.width / 2, y: dimensions.height / 2 }, 1.2)} aria-label="Увеличить масштаб"><Plus /></button><button type="button" onClick={reset} aria-label="Сбросить холст"><RotateCcw /></button></div></header>
      <div ref={containerRef} className="infinite-canvas-stage"><canvas ref={canvasRef} role="application" aria-label="Бесконечный холст: перетаскивайте фон и объекты, используйте колесо или жест двумя пальцами для масштаба" onPointerDown={startPointer} onPointerMove={movePointer} onPointerUp={endPointer} onPointerCancel={endPointer} onWheel={wheel} onDoubleClick={() => { if (selectedItem?.type === 'portal' && selectedItem.href) navigate(selectedItem.href); }} />
        <div className="infinite-canvas-hint"><Maximize2 /><span>DRAG TO MOVE · SCROLL OR PINCH TO ZOOM</span></div>
        {selectedItem ? <aside className="infinite-canvas-inspector"><header><span>SELECTED / {selectedItem.type.toUpperCase()}</span><button type="button" onClick={() => setSelection([])}>CLOSE</button></header>{selectedItem.type !== 'circle' && selectedItem.type !== 'rect' ? <label>TEXT<textarea value={selectedItem.text} onChange={(event) => updateSelected({ text: event.target.value })} /></label> : null}<label>COLOR<input type="color" value={selectedItem.color} onChange={(event) => updateSelected({ color: event.target.value })} /></label><section><span>SIZE</span><button type="button" onClick={() => updateSelected({ width: Math.max(70, selectedItem.width - 20), height: Math.max(55, selectedItem.height - 15) })}><Minus /></button><output>{Math.round(selectedItem.width)} × {Math.round(selectedItem.height)}</output><button type="button" onClick={() => updateSelected({ width: selectedItem.width + 20, height: selectedItem.height + 15 })}><Plus /></button></section>{selectedItem.href ? <button className="infinite-canvas-portal-button" type="button" onClick={() => navigate(selectedItem.href || '/lab')}>OPEN PORTAL</button> : null}</aside> : null}
      </div>
    </section>
  </LabShell>;
}
