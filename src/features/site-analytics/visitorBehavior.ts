export type BehaviorSummary = { dwell: number; scroll: number; pointer: boolean; touch: boolean; keyboard: boolean; link: boolean; form: boolean };
const empty = (): BehaviorSummary => ({ dwell: 0, scroll: 0, pointer: false, touch: false, keyboard: false, link: false, form: false });
export const dwellBucket = (ms: number) => ms >= 300000 ? 4 : ms >= 120000 ? 3 : ms >= 30000 ? 2 : ms >= 10000 ? 1 : 0;

// No coordinates, text, keys, input values or element identifiers are retained.
export class BehaviorAccumulator {
  private summary = empty();
  private visibleMs = 0;
  private previous: number;
  private visible: boolean;
  private lastActive: number;
  private lastSent = '';
  private lastSentAt = 0;
  constructor(now: number, visible: boolean) { this.previous = now; this.visible = visible; this.lastActive = now; }
  advance(now: number, visible = this.visible) {
    if (now - this.lastActive > 1800000) {
      this.summary = empty(); this.visibleMs = 0; this.lastSent = ''; this.previous = now; this.lastActive = now;
    }
    if (this.visible) this.visibleMs += Math.max(0, now - this.previous);
    this.previous = now; this.visible = visible;
    this.summary.dwell = dwellBucket(this.visibleMs);
  }
  mark(kind: 'pointer' | 'touch' | 'keyboard' | 'link' | 'form', now: number) {
    this.advance(now); if (!this.visible) return;
    this.summary[kind] = true; this.lastActive = now;
  }
  scroll(bucket: number, now: number) {
    this.advance(now); if (!this.visible) return;
    this.summary.scroll = Math.max(this.summary.scroll, Math.min(4, Math.max(0, bucket))); this.lastActive = now;
  }
  navigation(now: number) { this.advance(now); this.lastActive = now; }
  snapshot(now: number) {
    this.advance(now);
    const signature = JSON.stringify(this.summary);
    // At most one aggregate per 10s, and only at a new milestone.
    if (now - this.lastSentAt < 10000 || signature === this.lastSent || signature === JSON.stringify(empty())) return null;
    this.lastSent = signature; this.lastSentAt = now;
    return { ...this.summary };
  }
}

export function observeVisitorBehavior(send: (path: string, summary: BehaviorSummary) => void, contact: (path: string, href: string) => void) {
  const now = () => performance.now();
  const state = new BehaviorAccumulator(now(), document.visibilityState === 'visible');
  let path = window.location.pathname;
  const flush = () => { const summary = state.snapshot(now()); if (summary) send(path, summary); };
  const pointer = (event: PointerEvent) => { if (event.isTrusted) state.mark(event.pointerType === 'touch' ? 'touch' : 'pointer', now()); };
  const keyboard = (event: KeyboardEvent) => { if (event.isTrusted) state.mark('keyboard', now()); };
  const focus = (event: FocusEvent) => {
    if (event.isTrusted && event.target instanceof Element && event.target.matches('input,textarea,select')) state.mark('form', now());
  };
  const click = (event: MouseEvent) => {
    if (!event.isTrusted || document.visibilityState !== 'visible') return;
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (anchor instanceof HTMLAnchorElement) {
      if (anchor.origin === window.location.origin) state.mark('link', now());
      contact(path, anchor.href); // caller retains only allowlisted messenger category
    }
  };
  let scrollPending = false;
  const scroll = () => { scrollPending = true; };
  const tick = () => {
    if (scrollPending && document.visibilityState === 'visible') {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      if (available > 0) state.scroll(Math.floor(Math.min(1, window.scrollY / available) * 4), now());
      scrollPending = false;
    }
    flush();
  };
  const visibility = () => { state.advance(now(), document.visibilityState === 'visible'); flush(); };
  const pagehide = () => { state.advance(now(), false); flush(); };
  document.addEventListener('pointerdown', pointer, { passive: true });
  document.addEventListener('keydown', keyboard, { passive: true });
  document.addEventListener('focusin', focus);
  document.addEventListener('click', click, true);
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('scroll', scroll, { passive: true });
  window.addEventListener('pagehide', pagehide);
  const timer = window.setInterval(tick, 5000);
  return {
    navigation(nextPath: string) { flush(); state.navigation(now()); path = nextPath; },
    dispose() {
      window.clearInterval(timer);
      document.removeEventListener('pointerdown', pointer);
      document.removeEventListener('keydown', keyboard);
      document.removeEventListener('focusin', focus);
      document.removeEventListener('click', click, true);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('pagehide', pagehide);
    },
  };
}
