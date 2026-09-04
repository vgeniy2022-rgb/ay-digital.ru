import { ensureLabIdentity } from '../lab/analytics/labAnalytics';

export const SITE_VISIT_TRACKED_KEY = 'sitevl-site-visit-tracked';

export type SiteStats = {
  visits: number;
  uniqueVisitors: number;
};

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
type SiteVisitSender = (visitorId: string, sessionId: string) => Promise<boolean>;

function readStorage(storage: StorageLike, key: string) {
  try { return storage.getItem(key); } catch { return null; }
}

function writeStorage(storage: StorageLike, key: string, value: string) {
  try { storage.setItem(key, value); return true; } catch { return false; }
}

function isSafeCount(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

export function isTrackableSitePath(pathname: string) {
  if (!pathname.startsWith('/')) return false;
  if (pathname === '/robots.txt' || pathname === '/sitemap.xml') return false;
  if (pathname.startsWith('/api/') || pathname.startsWith('/assets/')) return false;
  return !/\.[a-z0-9]{2,8}$/i.test(pathname);
}

export function isSiteVisitTracked(session: StorageLike) {
  return readStorage(session, SITE_VISIT_TRACKED_KEY) === 'true';
}

export function markSiteVisitTracked(session: StorageLike) {
  writeStorage(session, SITE_VISIT_TRACKED_KEY, 'true');
}

export function parseSiteStats(payload: unknown): SiteStats | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const value = payload as Record<string, unknown>;
  if (!isSafeCount(value.visits) || !isSafeCount(value.uniqueVisitors)) return null;
  return { visits: value.visits, uniqueVisitors: value.uniqueVisitors };
}

export async function postSiteVisit(visitorId: string, sessionId: string) {
  try {
    const response = await fetch('/api/site-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'site_visit', visitorId, sessionId }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return false;
    const payload = await response.json() as { accepted?: unknown };
    return payload.accepted === true;
  } catch {
    return false;
  }
}

export async function ensureSiteVisit(
  pathname: string,
  local: StorageLike,
  session: StorageLike,
  sender: SiteVisitSender = postSiteVisit,
) {
  if (!isTrackableSitePath(pathname) || isSiteVisitTracked(session)) return false;
  const { visitorId, sessionId } = ensureLabIdentity(local, session);
  const accepted = await sender(visitorId, sessionId);
  if (accepted) markSiteVisitTracked(session);
  return accepted;
}

export async function fetchSiteStats() {
  try {
    const response = await fetch('/api/site-stats', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    return parseSiteStats(await response.json());
  } catch {
    return null;
  }
}
