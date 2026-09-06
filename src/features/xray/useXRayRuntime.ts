import { useEffect, useRef, useState } from 'react';
import { collectSections, describeSelection, inspectableElement, isEditingTarget, rectOf } from './dom';
import type { XRayManifest, XRaySection, XRaySelection } from './types';

export function useXRayRuntime(manifest: XRayManifest, route: string, selecting: boolean, lens: boolean) {
  const [sections, setSections] = useState<XRaySection[]>([]);
  const [hovered, setHovered] = useState<XRaySelection | null>(null);
  const [selected, setSelected] = useState<XRaySelection | null>(null);
  const [peek, setPeek] = useState(false);
  const runtime = useRef({ selecting, lens, selected: null as HTMLElement | null, hovered: null as HTMLElement | null });
  runtime.current.selecting = selecting;
  runtime.current.lens = lens;
  const clearSelection = () => { runtime.current.selected = null; runtime.current.hovered = null; setSelected(null); setHovered(null); };

  useEffect(() => {
    const root = document.getElementById('xray-live-site');
    if (!root) return;
    let frame = 0;
    let pointerFrame = 0;
    let currentSections: XRaySection[] = [];
    let point = { x: innerWidth / 2, y: innerHeight / 2, target: null as EventTarget | null, touch: false };
    let down = { x: 0, y: 0, cancelled: false, touch: false };
    runtime.current.selected = null; runtime.current.hovered = null;
    setSelected(null); setHovered(null);
    const updateLens = () => {
      if (!runtime.current.lens) return;
      root.style.setProperty('--xray-lens-x', `${point.x + scrollX}px`);
      root.style.setProperty('--xray-lens-y', `${point.y + scrollY}px`);
      document.documentElement.style.setProperty('--xray-pointer-x', `${point.x}px`);
      document.documentElement.style.setProperty('--xray-pointer-y', `${point.y}px`);
    };
    const measure = () => {
      frame = 0;
      currentSections = collectSections(root, manifest);
      setSections(currentSections);
      const refresh = (element: HTMLElement | null) => element?.isConnected ? describeSelection(element, currentSections, manifest) : null;
      setSelected(refresh(runtime.current.selected));
      setHovered(refresh(runtime.current.hovered));
      updateLens();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const move = (event: PointerEvent) => {
      point = { x: event.clientX, y: event.clientY, target: event.target, touch: event.pointerType === 'touch' };
      if (down.touch && Math.hypot(point.x - down.x, point.y - down.y) > 10) down.cancelled = true;
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0; updateLens();
        const next = runtime.current.selecting && !point.touch ? inspectableElement(point.target, root) : null;
        if (next === runtime.current.hovered) return;
        runtime.current.hovered = next;
        setHovered(next ? describeSelection(next, currentSections, manifest) : null);
      });
    };
    const pointerDown = (event: PointerEvent) => { down = { x: event.clientX, y: event.clientY, cancelled: false, touch: event.pointerType === 'touch' }; };
    const pointerCancel = () => { down.cancelled = true; };
    const click = (event: MouseEvent) => {
      if (!runtime.current.selecting || event.button !== 0 || event.detail === 0 || event.metaKey || event.ctrlKey || down.touch && down.cancelled || isEditingTarget(event.target)) return;
      const element = inspectableElement(event.target, root);
      if (!element) return;
      event.preventDefault(); event.stopPropagation();
      runtime.current.selected = element;
      runtime.current.hovered = null;
      setSelected(describeSelection(element, currentSections, manifest)); setHovered(null);
    };
    const keyDown = (event: KeyboardEvent) => { if (event.key === 'Alt' && !isEditingTarget(event.target)) setPeek(true); };
    const keyUp = (event: KeyboardEvent) => { if (event.key === 'Alt') setPeek(false); };
    const blur = () => { setPeek(false); runtime.current.hovered = null; setHovered(null); };
    const hidden = () => { if (document.hidden) blur(); };
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(root);
    const observer = new MutationObserver(schedule);
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerdown', pointerDown, { passive: true });
    document.addEventListener('pointercancel', pointerCancel, { passive: true });
    document.addEventListener('click', click, true);
    root.addEventListener('load', schedule, true);
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('blur', blur);
    document.addEventListener('visibilitychange', hidden);
    schedule();
    const settling = window.setTimeout(schedule, 450);
    return () => {
      cancelAnimationFrame(frame); cancelAnimationFrame(pointerFrame); clearTimeout(settling);
      observer.disconnect(); resizeObserver.disconnect();
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      window.removeEventListener('pointermove', move); document.removeEventListener('pointerdown', pointerDown);
      document.removeEventListener('pointercancel', pointerCancel); document.removeEventListener('click', click, true);
      root.removeEventListener('load', schedule, true);
      window.removeEventListener('keydown', keyDown); window.removeEventListener('keyup', keyUp);
      window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', hidden);
      for (const key of ['--xray-lens-x', '--xray-lens-y']) root.style.removeProperty(key);
      for (const key of ['--xray-pointer-x', '--xray-pointer-y']) document.documentElement.style.removeProperty(key);
    };
  }, [manifest, route]);

  useEffect(() => {
    if (!selecting) { runtime.current.hovered = null; setHovered(null); }
  }, [selecting]);
  const selection = hovered || selected;
  const visibleSections = sections.filter(section => section.rect.top + section.rect.height >= -120 && section.rect.top < innerHeight + 120);
  return { sections, visibleSections, selected, selection, clearSelection, peek, refreshSelection: () => {
    if (selected?.element.isConnected) setSelected({ ...selected, rect: rectOf(selected.element) });
  } };
}
