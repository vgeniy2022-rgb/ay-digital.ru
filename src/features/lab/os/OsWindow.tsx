import { Maximize2, Minus, X } from 'lucide-react';
import { useRef, type PointerEvent, type PropsWithChildren } from 'react';
import type { OsWindowState } from './types';

export function OsWindow({ windowState, onFocus, onMove, onClose, onMinimize, onMaximize, children }: PropsWithChildren<{ windowState: OsWindowState; onFocus: () => void; onMove: (x: number, y: number) => void; onClose: () => void; onMinimize: () => void; onMaximize: () => void }>) {
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; x: number; y: number } | null>(null);
  const startDrag = (event: PointerEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: windowState.x, y: windowState.y };
    onFocus();
  };
  const move = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    onMove(Math.max(0, drag.x + event.clientX - drag.startX), Math.max(0, drag.y + event.clientY - drag.startY));
  };
  const end = (event: PointerEvent<HTMLElement>) => { if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null; };
  if (windowState.minimized) return null;
  return <section className={`sitevl-os-window ${windowState.maximized ? 'is-maximized' : ''}`} style={windowState.maximized ? { zIndex: windowState.z } : { left: windowState.x, top: windowState.y, width: windowState.width, height: windowState.height, zIndex: windowState.z }} onPointerDown={onFocus}><header onDoubleClick={onMaximize} onPointerDown={startDrag} onPointerMove={move} onPointerUp={end} onPointerCancel={end}><span><i />{windowState.title}</span><div><button type="button" onClick={onMinimize} aria-label={`Свернуть ${windowState.title}`}><Minus /></button><button type="button" onClick={onMaximize} aria-label={`Развернуть ${windowState.title}`}><Maximize2 /></button><button type="button" onClick={onClose} aria-label={`Закрыть ${windowState.title}`}><X /></button></div></header><div className="sitevl-os-window__body">{children}</div></section>;
}
