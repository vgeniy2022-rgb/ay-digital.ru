import { ArrowDown, ArrowUp, Circle, Copy, Download, Eye, EyeOff, Focus, Frame, Grid3X3, Image as ImageIcon, Link2, Lock, Maximize2, Minus, MousePointer2, Plus, Redo2, RotateCcw, Save, Shapes, Square, StickyNote, Trash2, Type, Undo2, Unlock } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LabShell } from '../core/LabShell';
import { completeLabExperiment, recordLabActivity, saveExperimentState, unlockLabAchievement } from '../core/storage';
import { canvasTemplates, createCanvasItem, hitCanvasItem, initialCanvasDocument, readCanvasDocument, writeCanvasDocument, type CanvasViewport, type InfiniteCanvasDocument, type InfiniteCanvasItem, type InfiniteCanvasItemType } from './canvasModel';
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
const DOCUMENTS_KEY = 'sitevl-infinite-canvas-documents-v2';
type SavedDocument = { id: string; name: string; document: InfiniteCanvasDocument };
function readDocuments(): SavedDocument[] { try { const value = window.localStorage.getItem(DOCUMENTS_KEY); return value ? JSON.parse(value) as SavedDocument[] : [{ id: 'main', name: 'Основная доска', document: readCanvasDocument() }]; } catch { return [{ id: 'main', name: 'Основная доска', document: readCanvasDocument() }]; } }

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
  const [savedDocuments, setSavedDocuments] = useState(readDocuments);
  const [activeDocumentId, setActiveDocumentId] = useState(savedDocuments[0]?.id || 'main');
  const [document, setDocument] = useState(() => savedDocuments[0]?.document || readCanvasDocument());
  const documentRef = useRef(document);
  const historyRef = useRef<InfiniteCanvasDocument[]>([]);
  const redoRef = useRef<InfiniteCanvasDocument[]>([]);
  const clipboardRef = useRef<InfiniteCanvasItem[]>([]);
  documentRef.current = document;
  const [viewport, setViewport] = useState<CanvasViewport>({ x: 0, y: 0, zoom: 1 });
  const [selection, setSelection] = useState<string[]>([]);
  const [multiSelect, setMultiSelect] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [renderTick, setRenderTick] = useState(0);
  const imageCacheRef = useRef(new Map<string, HTMLImageElement>());
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const navigate = useNavigate();
  const selectedItem = useMemo(() => document.items.find((item) => item.id === selection[selection.length - 1]), [document.items, selection]);
  const snapshot = () => {
    historyRef.current = [...historyRef.current.slice(-39), structuredClone(documentRef.current)];
    redoRef.current = [];
  };
  const undo = () => {
    const previous = historyRef.current.pop();
    if (!previous) return;
    redoRef.current.push(structuredClone(documentRef.current));
    setDocument(previous);
    setSelection([]);
  };
  const redo = () => {
    const next = redoRef.current.pop();
    if (!next) return;
    historyRef.current.push(structuredClone(documentRef.current));
    setDocument(next);
    setSelection([]);
  };

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

  useEffect(() => {
    const timer = window.setTimeout(() => setSavedDocuments((current) => {
      const next = current.map((item) => item.id === activeDocumentId ? { ...item, document } : item);
      try { window.localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(next)); } catch { /* Current board remains editable. */ }
      return next;
    }), 220);
    return () => window.clearTimeout(timer);
  }, [activeDocumentId, document]);

  useEffect(() => () => writeCanvasDocument(documentRef.current), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea')) return;
      const command = event.metaKey || event.ctrlKey;
      if (command && event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) redo(); else undo(); }
      if (command && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
      if (command && event.key.toLowerCase() === 'c') clipboardRef.current = documentRef.current.items.filter((item) => selection.includes(item.id)).map((item) => structuredClone(item));
      if (command && event.key.toLowerCase() === 'v' && clipboardRef.current.length) {
        event.preventDefault(); snapshot();
        const copies = clipboardRef.current.map((item) => ({ ...structuredClone(item), id: `${item.type}-${crypto.randomUUID()}`, x: item.x + 32, y: item.y + 32 }));
        setDocument((current) => ({ ...current, items: [...current.items, ...copies] })); setSelection(copies.map((item) => item.id));
      }
      if ((event.key === 'Delete' || event.key === 'Backspace') && selection.length) { event.preventDefault(); deleteSelected(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

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
    if (gridEnabled && grid >= 18) {
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
      if (item.hidden) return;
      const screen = toScreen(item.x, item.y);
      const width = item.width * viewport.zoom;
      const height = item.height * viewport.zoom;
      if (screen.x + width < -80 || screen.y + height < -80 || screen.x > dimensions.width + 80 || screen.y > dimensions.height + 80) return;
      context.save();
      context.shadowColor = 'rgba(0,0,0,.28)';
      context.shadowBlur = 24 * viewport.zoom;
      context.shadowOffsetY = 10 * viewport.zoom;
      if (item.type === 'line' || item.type === 'arrow') {
        context.shadowColor = 'transparent'; context.strokeStyle = item.color; context.lineWidth = Math.max(2, 4 * viewport.zoom); context.beginPath(); context.moveTo(screen.x, screen.y + height / 2); context.lineTo(screen.x + width, screen.y + height / 2); context.stroke();
        if (item.type === 'arrow') { context.fillStyle = item.color; context.beginPath(); context.moveTo(screen.x + width, screen.y + height / 2); context.lineTo(screen.x + width - 16 * viewport.zoom, screen.y + height / 2 - 10 * viewport.zoom); context.lineTo(screen.x + width - 16 * viewport.zoom, screen.y + height / 2 + 10 * viewport.zoom); context.closePath(); context.fill(); }
      } else if (item.type === 'circle' || item.type === 'sticker') {
        context.beginPath(); context.ellipse(screen.x + width / 2, screen.y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
      } else roundedRect(context, screen.x, screen.y, width, height, item.type === 'portal' ? 11 * viewport.zoom : 7 * viewport.zoom);
      if (item.type !== 'line' && item.type !== 'arrow') { context.fillStyle = item.type === 'text' || item.type === 'frame' ? 'rgba(18,21,27,.55)' : item.type === 'portal' ? '#171a21' : item.color; if (item.type === 'frame') { context.strokeStyle = item.color; context.lineWidth = 2; context.stroke(); } else context.fill(); }
      context.shadowColor = 'transparent';
      if (item.type === 'image' && item.imageUrl) {
        let image = imageCacheRef.current.get(item.imageUrl);
        if (!image) { image = new window.Image(); image.crossOrigin = 'anonymous'; image.onload = () => setRenderTick((value) => value + 1); image.src = item.imageUrl; imageCacheRef.current.set(item.imageUrl, image); }
        if (image.complete && image.naturalWidth) { context.save(); roundedRect(context, screen.x, screen.y, width, height, 7 * viewport.zoom); context.clip(); context.drawImage(image, screen.x, screen.y, width, height); context.restore(); }
      }
      if (item.type === 'portal') {
        context.strokeStyle = item.color;
        context.lineWidth = 2 * viewport.zoom;
        context.stroke();
        context.fillStyle = item.color;
        context.font = `800 ${Math.max(8, 10 * viewport.zoom)}px ui-monospace, monospace`;
        context.fillText('СКРЫТАЯ ССЫЛКА LAB', screen.x + 16 * viewport.zoom, screen.y + 23 * viewport.zoom);
      }
      context.fillStyle = item.type === 'note' ? '#16191d' : '#f7f8fb';
      context.font = `${item.type === 'text' ? '800' : '700'} ${Math.max(9, (item.type === 'text' ? 23 : 13) * viewport.zoom)}px Inter, sans-serif`;
      context.textBaseline = 'top';
      if (item.type !== 'line' && item.type !== 'arrow' && item.type !== 'image') wrapCanvasText(context, item.text, screen.x + 16 * viewport.zoom, screen.y + (item.type === 'portal' ? 45 : 18) * viewport.zoom, width - 32 * viewport.zoom, (item.type === 'text' ? 28 : 18) * viewport.zoom, item.type === 'text' ? 3 : 6);
      if (item.locked) { context.fillStyle = '#fff'; context.font = `700 ${Math.max(8, 9 * viewport.zoom)}px monospace`; context.fillText('ЗАБЛОКИРОВАНО', screen.x + 8, screen.y + height - 15); }
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
  }, [dimensions, document, gridEnabled, renderTick, selection, viewport]);

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
      if (hit.locked) return;
      snapshot();
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
    else setDocument((current) => ({ ...current, items: current.items.map((item) => {
      if (!drag.items[item.id]) return item;
      const x = drag.items[item.id].x + deltaX / drag.viewport.zoom;
      const y = drag.items[item.id].y + deltaY / drag.viewport.zoom;
      return { ...item, x: snapEnabled ? Math.round(x / 20) * 20 : x, y: snapEnabled ? Math.round(y / 20) * 20 : y };
    }) }));
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
    snapshot();
    const center = worldPoint({ x: dimensions.width / 2, y: dimensions.height / 2 });
    const item = createCanvasItem(type, center.x - 110, center.y - 75);
    if (type === 'image') {
      const imageUrl = window.prompt('Вставьте прямую ссылку на изображение');
      if (!imageUrl) return;
      item.imageUrl = imageUrl;
    }
    setDocument((current) => ({ ...current, items: [...current.items, item] }));
    setSelection([item.id]);
    recordLabActivity({ objectsCreated: 1 });
    unlockLabAchievement('CANVAS_EXPLORER');
  };
  const updateSelected = (patch: Partial<InfiniteCanvasItem>) => {
    if (!selectedItem) return;
    snapshot();
    setDocument((current) => ({ ...current, items: current.items.map((item) => item.id === selectedItem.id ? { ...item, ...patch } : item) }));
  };
  const deleteSelected = () => {
    if (!selection.length) return;
    snapshot();
    const ids = new Set(selection);
    setDocument((current) => ({ ...current, items: current.items.filter((item) => !ids.has(item.id)), connections: current.connections.filter((connection) => !ids.has(connection.from) && !ids.has(connection.to)) }));
    setSelection([]);
  };
  const connectSelected = () => {
    if (selection.length !== 2) return;
    snapshot();
    const [from, to] = selection;
    setDocument((current) => current.connections.some((connection) => connection.from === from && connection.to === to || connection.from === to && connection.to === from) ? current : { ...current, connections: [...current.connections, { id: `connection-${Date.now()}`, from, to }] });
  };
  const reset = () => {
    snapshot();
    setDocument(initialCanvasDocument);
    setViewport({ x: dimensions.width / 2, y: dimensions.height / 2, zoom: 1 });
    setSelection([]);
  };

  const duplicateSelected = () => {
    const source = document.items.filter((item) => selection.includes(item.id));
    if (!source.length) return;
    snapshot();
    const copies = source.map((item) => ({ ...structuredClone(item), id: `${item.type}-${crypto.randomUUID()}`, x: item.x + 28, y: item.y + 28 }));
    setDocument((current) => ({ ...current, items: [...current.items, ...copies] }));
    setSelection(copies.map((item) => item.id));
  };
  const moveLayer = (direction: 'front' | 'back') => {
    if (!selection.length) return;
    snapshot();
    setDocument((current) => {
      const selected = current.items.filter((item) => selection.includes(item.id));
      const rest = current.items.filter((item) => !selection.includes(item.id));
      return { ...current, items: direction === 'front' ? [...rest, ...selected] : [...selected, ...rest] };
    });
  };
  const fitAll = () => {
    const visible = document.items.filter((item) => !item.hidden);
    if (!visible.length) return;
    const left = Math.min(...visible.map((item) => item.x)); const top = Math.min(...visible.map((item) => item.y));
    const right = Math.max(...visible.map((item) => item.x + item.width)); const bottom = Math.max(...visible.map((item) => item.y + item.height));
    const zoom = clamp(Math.min((dimensions.width - 100) / Math.max(1, right - left), (dimensions.height - 100) / Math.max(1, bottom - top)), .18, 2);
    setViewport({ zoom, x: dimensions.width / 2 - (left + right) / 2 * zoom, y: dimensions.height / 2 - (top + bottom) / 2 * zoom });
  };
  const applyTemplate = (name: keyof typeof canvasTemplates) => {
    snapshot(); const next = structuredClone(canvasTemplates[name]); setDocument(next); setSelection([]); window.setTimeout(fitAll, 30);
  };
  const createDocument = () => {
    const name = window.prompt('Название новой доски', 'Новая доска')?.trim(); if (!name) return;
    const id = crypto.randomUUID(); const next = { ...initialCanvasDocument, id, title: name };
    setSavedDocuments((current) => [...current, { id, name, document: next }]); setActiveDocumentId(id); setDocument(next); setSelection([]);
  };
  const openDocument = (id: string) => { const target = savedDocuments.find((item) => item.id === id); if (target) { setActiveDocumentId(id); setDocument(target.document); setSelection([]); historyRef.current = []; redoRef.current = []; } };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(document, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement('a'); anchor.href = url; anchor.download = `${savedDocuments.find((item) => item.id === activeDocumentId)?.name || 'sitevl-board'}.json`; anchor.click(); URL.revokeObjectURL(url);
  };
  const exportPng = () => { const source = canvasRef.current; if (!source) return; const anchor = window.document.createElement('a'); anchor.href = source.toDataURL('image/png'); anchor.download = `${savedDocuments.find((item) => item.id === activeDocumentId)?.name || 'sitevl-board'}.png`; anchor.click(); saveExperimentState('canvas', { activeDocumentId, documentCount: savedDocuments.length, itemCount: document.items.length }); unlockLabAchievement('CANVAS_ARCHITECT'); completeLabExperiment('canvas'); };

  return <LabShell experimentId="canvas" title="Бесконечный холст" description="Пространство для заметок, схем, изображений и связей с масштабированием и локальным сохранением." canonicalPath="/lab/canvas" status="ЭКСПЕРИМЕНТ · ПРОСТРАНСТВЕННЫЙ ХОЛСТ" immersive className="infinite-canvas-host">
    <section className="infinite-canvas-app">
      <header className="infinite-canvas-toolbar" aria-label="Инструменты бесконечного холста"><div><span>07</span><strong>БЕСКОНЕЧНЫЙ ХОЛСТ</strong></div><nav><button type="button" onClick={() => addItem('note')} title="Заметка"><StickyNote /> <span>ЗАМЕТКА</span></button><button type="button" onClick={() => addItem('text')} title="Текст"><Type /> <span>ТЕКСТ</span></button><button type="button" onClick={() => addItem('rect')} title="Прямоугольник"><Square /> <span>ФИГУРА</span></button><button type="button" onClick={() => addItem('circle')} title="Круг"><Circle /> <span>КРУГ</span></button><button type="button" onClick={() => addItem('arrow')} title="Стрелка"><Shapes /> <span>СТРЕЛКА</span></button><button type="button" onClick={() => addItem('frame')} title="Фрейм"><Frame /> <span>ФРЕЙМ</span></button><button type="button" onClick={() => addItem('image')} title="Изображение"><ImageIcon /> <span>ФОТО</span></button><button className={multiSelect ? 'is-active' : ''} type="button" onClick={() => setMultiSelect((value) => !value)} aria-pressed={multiSelect}><MousePointer2 /> <span>ВЫБОР</span></button><button type="button" onClick={connectSelected} disabled={selection.length !== 2}><Link2 /> <span>СВЯЗАТЬ</span></button><button type="button" onClick={duplicateSelected} disabled={!selection.length}><Copy /> <span>КОПИЯ</span></button><button type="button" onClick={deleteSelected} disabled={!selection.length}><Trash2 /> <span>УДАЛИТЬ</span></button></nav><div><button type="button" onClick={undo} aria-label="Отменить"><Undo2 /></button><button type="button" onClick={redo} aria-label="Повторить"><Redo2 /></button><button className={gridEnabled ? 'is-active' : ''} type="button" onClick={() => setGridEnabled((value) => !value)} aria-label="Сетка"><Grid3X3 /></button><button type="button" onClick={fitAll} aria-label="Показать всё"><Focus /></button><button type="button" onClick={exportPng} aria-label="Скачать PNG"><Download /></button><button type="button" onClick={reset} aria-label="Сбросить холст"><RotateCcw /></button></div></header>
      <div className="infinite-canvas-subbar"><select value={activeDocumentId} onChange={(event) => openDocument(event.target.value)} aria-label="Выбрать доску">{savedDocuments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button type="button" onClick={createDocument}><Plus /> Новая доска</button><select defaultValue="" onChange={(event) => { if (event.target.value) applyTemplate(event.target.value as keyof typeof canvasTemplates); event.target.value = ''; }} aria-label="Применить шаблон"><option value="">Шаблоны</option><option value="blank">Пустой</option><option value="mindmap">Карта мыслей</option><option value="site">Структура сайта</option><option value="plan">План проекта</option></select><button className={snapEnabled ? 'is-active' : ''} type="button" onClick={() => setSnapEnabled((value) => !value)}><Grid3X3 /> Привязка</button><button type="button" onClick={exportJson}><Save /> JSON</button></div>
      <div ref={containerRef} className="infinite-canvas-stage"><canvas ref={canvasRef} role="application" aria-label="Бесконечный холст: перетаскивайте фон и объекты, используйте колесо или жест двумя пальцами для масштаба" onPointerDown={startPointer} onPointerMove={movePointer} onPointerUp={endPointer} onPointerCancel={endPointer} onWheel={wheel} onDoubleClick={() => { if (selectedItem?.type === 'portal' && selectedItem.href) navigate(selectedItem.href); }} />
        <div className="infinite-canvas-hint"><Maximize2 /><span>Тяните фон · колесо или два пальца меняют масштаб</span></div>
        {selectedItem ? <aside className="infinite-canvas-inspector"><header><span>ВЫБРАНО / {selectedItem.type.toUpperCase()}</span><button type="button" onClick={() => setSelection([])}>ЗАКРЫТЬ</button></header>{selectedItem.type !== 'circle' && selectedItem.type !== 'rect' ? <label>ТЕКСТ<textarea value={selectedItem.text} onChange={(event) => updateSelected({ text: event.target.value })} /></label> : null}<label>ЦВЕТ<input type="color" value={selectedItem.color} onChange={(event) => updateSelected({ color: event.target.value })} /></label><section><span>РАЗМЕР</span><button type="button" onClick={() => updateSelected({ width: Math.max(70, selectedItem.width - 20), height: Math.max(55, selectedItem.height - 15) })}><Minus /></button><output>{Math.round(selectedItem.width)} × {Math.round(selectedItem.height)}</output><button type="button" onClick={() => updateSelected({ width: selectedItem.width + 20, height: selectedItem.height + 15 })}><Plus /></button></section><div className="infinite-canvas-layer-actions"><button type="button" onClick={() => moveLayer('front')}><ArrowUp /> Выше</button><button type="button" onClick={() => moveLayer('back')}><ArrowDown /> Ниже</button><button type="button" onClick={() => updateSelected({ locked: !selectedItem.locked })}>{selectedItem.locked ? <Unlock /> : <Lock />} {selectedItem.locked ? 'Разблокировать' : 'Заблокировать'}</button><button type="button" onClick={() => updateSelected({ hidden: !selectedItem.hidden })}>{selectedItem.hidden ? <Eye /> : <EyeOff />} {selectedItem.hidden ? 'Показать' : 'Скрыть'}</button></div>{selectedItem.href ? <button className="infinite-canvas-portal-button" type="button" onClick={() => navigate(selectedItem.href || '/lab')}>ОТКРЫТЬ ПОРТАЛ</button> : null}</aside> : null}
      </div>
    </section>
  </LabShell>;
}
