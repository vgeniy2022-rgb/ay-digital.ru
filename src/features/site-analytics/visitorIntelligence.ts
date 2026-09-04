import { createAnonymousId, ensureLabIdentity } from '../lab/analytics/labAnalytics';
import type { LabExperimentId } from '../lab/core/types';

export const VISITOR_SESSION_TRACKED_KEY = 'sitevl-visitor-session-tracked';
export const VISITOR_FIRST_SOURCE_KEY = 'sitevl-visitor-first-source';
export const VISITOR_SESSION_SOURCE_KEY = 'sitevl-visitor-session-source';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
type VisitorEvent = Record<string, string>;

function readStorage(storage: StorageLike, key: string) {
  try { return storage.getItem(key); } catch { return null; }
}

function writeStorage(storage: StorageLike, key: string, value: string) {
  try { storage.setItem(key, value); return true; } catch { return false; }
}

export function safeSource(search: string) {
  const raw = new URLSearchParams(search).get('src')?.trim().toLowerCase() || '';
  return /^[a-z0-9][a-z0-9_-]{0,63}$/.test(raw) ? raw : '';
}

export function safeReferrerHost(referrer: string, currentHost: string) {
  if (!referrer) return '';
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    return host && host !== currentHost.toLowerCase() ? host.slice(0, 180) : '';
  } catch { return ''; }
}

export function classifyBrowser(userAgent: string) {
  if (/Edg\//.test(userAgent)) return 'Edge';
  if (/OPR\//.test(userAgent)) return 'Opera';
  if (/Firefox\//.test(userAgent)) return 'Firefox';
  if (/Chrome\//.test(userAgent) || /CriOS\//.test(userAgent)) return 'Chrome';
  if (/Safari\//.test(userAgent)) return 'Safari';
  return 'Other';
}

export function classifyDevice(userAgent: string) {
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(userAgent)) return 'tablet';
  if (/iPhone|iPod|Android.*Mobile|Mobile/i.test(userAgent)) return 'mobile';
  return 'desktop';
}

function eventIdFor(session: StorageLike, key: string) {
  const storageKey = `sitevl-visitor-event:${key}`;
  const stored = readStorage(session, storageKey);
  if (stored?.startsWith('event-')) return stored;
  const next = createAnonymousId('event');
  writeStorage(session, storageKey, next);
  return next;
}

async function postVisitorEvent(body: VisitorEvent) {
  try {
    const response = await fetch('/api/visitor-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return false;
    const payload = await response.json() as { accepted?: unknown };
    return payload.accepted === true;
  } catch { return false; }
}

export function ensureVisitorSources(search: string, local: StorageLike, session: StorageLike) {
  const incoming = safeSource(search);
  const first = readStorage(local, VISITOR_FIRST_SOURCE_KEY) || incoming || 'direct';
  const sessionSource = readStorage(session, VISITOR_SESSION_SOURCE_KEY) || incoming || first;
  writeStorage(local, VISITOR_FIRST_SOURCE_KEY, first);
  writeStorage(session, VISITOR_SESSION_SOURCE_KEY, sessionSource);
  return { firstSource: first, sessionSource };
}

export async function ensureVisitorSession(path: string, search: string, local: StorageLike, session: StorageLike, userAgent: string, referrer: string, currentHost: string) {
  const { visitorId, sessionId } = ensureLabIdentity(local, session);
  if (readStorage(session, VISITOR_SESSION_TRACKED_KEY) === 'true') return { visitorId, sessionId };
  const { sessionSource } = ensureVisitorSources(search, local, session);
  const accepted = await postVisitorEvent({
    event: 'session_start', visitorId, sessionId,
    eventId: eventIdFor(session, 'session-start'), path,
    source: sessionSource,
    referrerHost: safeReferrerHost(referrer, currentHost),
    deviceType: classifyDevice(userAgent), browser: classifyBrowser(userAgent),
  });
  if (accepted) writeStorage(session, VISITOR_SESSION_TRACKED_KEY, 'true');
  return { visitorId, sessionId };
}

export async function trackVisitorPage(path: string, navigationKey: string, search: string, local: StorageLike, session: StorageLike, userAgent: string, referrer: string, currentHost: string) {
  const { visitorId, sessionId } = await ensureVisitorSession(path, search, local, session, userAgent, referrer, currentHost);
  return postVisitorEvent({ event: 'page_view', visitorId, sessionId, eventId: eventIdFor(session, `page:${navigationKey || 'initial'}:${path}`), path });
}

export function trackVisitorExperiment(experimentId: LabExperimentId, eventId: string, path: string, local: StorageLike, session: StorageLike) {
  const { visitorId, sessionId } = ensureLabIdentity(local, session);
  return postVisitorEvent({ event: 'experiment_start', visitorId, sessionId, eventId, path, experimentId });
}

export function trackAiConceptCreated(conceptId: string, local: StorageLike, session: StorageLike) {
  const { visitorId, sessionId } = ensureLabIdentity(local, session);
  return postVisitorEvent({ event: 'ai_concept_created', visitorId, sessionId, eventId: createAnonymousId('event'), path: '/ai-website', conceptId });
}

export async function trackVisitorBriefCompleted(local: StorageLike, session: StorageLike) {
  const marker = 'sitevl-visitor-brief-completed';
  if (readStorage(session, marker) === 'true') return true;
  const { visitorId, sessionId } = ensureLabIdentity(local, session);
  const accepted = await postVisitorEvent({ event: 'brief_completed', visitorId, sessionId, eventId: eventIdFor(session, 'brief-completed'), path: '/brief' });
  if (accepted) writeStorage(session, marker, 'true');
  return accepted;
}
