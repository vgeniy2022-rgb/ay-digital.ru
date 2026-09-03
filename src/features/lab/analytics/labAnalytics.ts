import type { LabExperimentId } from '../core/types';

export const LAB_VISITOR_ID_KEY = 'sitevl-lab-visitor-id';
export const LAB_SESSION_ID_KEY = 'sitevl-lab-session-id';
export const LAB_VISIT_TRACKED_KEY = 'sitevl-lab-visit-tracked';

export type LabStats = {
  visits: number;
  uniqueVisitors: number;
  experiments: Partial<Record<LabExperimentId, number>>;
};

type AnonymousIdKind = 'visitor' | 'session' | 'event';
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
type CryptoLike = Pick<Crypto, 'getRandomValues'> & { randomUUID?: () => `${string}-${string}-${string}-${string}-${string}` };

const ID_PATTERN = /^(?:visitor|session|event)-[a-f0-9]{32}$|^(?:visitor|session|event)-[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
let memoryVisitorId = '';
let memorySessionId = '';
const memoryExperimentEvents = new Map<string, string>();

export function createAnonymousId(kind: AnonymousIdKind, cryptoApi: CryptoLike = globalThis.crypto) {
  if (typeof cryptoApi?.randomUUID === 'function') return `${kind}-${cryptoApi.randomUUID()}`;
  const bytes = new Uint8Array(16);
  cryptoApi.getRandomValues(bytes);
  return `${kind}-${Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function readStorage(storage: StorageLike, key: string) {
  try { return storage.getItem(key); } catch { return null; }
}

function writeStorage(storage: StorageLike, key: string, value: string) {
  try { storage.setItem(key, value); return true; } catch { return false; }
}

function ensureStoredId(storage: StorageLike, key: string, kind: AnonymousIdKind, memoryValue: string) {
  const stored = readStorage(storage, key);
  if (stored && ID_PATTERN.test(stored) && stored.startsWith(`${kind}-`)) return stored;
  const next = memoryValue || createAnonymousId(kind);
  writeStorage(storage, key, next);
  return next;
}

export function ensureLabIdentity(local: StorageLike, session: StorageLike) {
  const visitorId = ensureStoredId(local, LAB_VISITOR_ID_KEY, 'visitor', memoryVisitorId);
  const sessionId = ensureStoredId(session, LAB_SESSION_ID_KEY, 'session', memorySessionId);
  memoryVisitorId = visitorId;
  memorySessionId = sessionId;
  return { visitorId, sessionId };
}

export function isLabVisitTracked(session: StorageLike) {
  return readStorage(session, LAB_VISIT_TRACKED_KEY) === 'true';
}

export function markLabVisitTracked(session: StorageLike) {
  writeStorage(session, LAB_VISIT_TRACKED_KEY, 'true');
}

export function getExperimentEventId(session: StorageLike, navigationKey: string, experimentId: LabExperimentId) {
  const storageKey = `sitevl-lab-experiment-event:${experimentId}:${navigationKey || 'initial'}`;
  const stored = readStorage(session, storageKey);
  if (stored && ID_PATTERN.test(stored) && stored.startsWith('event-')) return stored;
  const memoryKey = `${experimentId}:${navigationKey || 'initial'}`;
  const eventId = memoryExperimentEvents.get(memoryKey) || createAnonymousId('event');
  memoryExperimentEvents.set(memoryKey, eventId);
  writeStorage(session, storageKey, eventId);
  return eventId;
}

function isSafeCount(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

export function parseLabStats(payload: unknown, publicExperimentIds: readonly LabExperimentId[]): LabStats | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const value = payload as Record<string, unknown>;
  if (!isSafeCount(value.visits) || !isSafeCount(value.uniqueVisitors) || !value.experiments || typeof value.experiments !== 'object' || Array.isArray(value.experiments)) return null;
  const rawExperiments = value.experiments as Record<string, unknown>;
  const experiments: Partial<Record<LabExperimentId, number>> = {};
  for (const id of publicExperimentIds) {
    if (!isSafeCount(rawExperiments[id])) return null;
    experiments[id] = rawExperiments[id];
  }
  return { visits: value.visits, uniqueVisitors: value.uniqueVisitors, experiments };
}

async function postLabEvent(body: Record<string, string>) {
  try {
    const response = await fetch('/api/lab-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return false;
    const payload = await response.json() as { accepted?: unknown };
    return payload.accepted === true;
  } catch {
    return false;
  }
}

export function trackLabVisit(visitorId: string, sessionId: string) {
  return postLabEvent({ event: 'lab_visit', visitorId, sessionId });
}

export function trackExperimentStart(experimentId: LabExperimentId, eventId: string, sessionId: string) {
  return postLabEvent({ event: 'experiment_start', experimentId, eventId, sessionId });
}

export async function fetchLabStats(publicExperimentIds: readonly LabExperimentId[]) {
  try {
    const response = await fetch('/api/lab-stats', { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    return parseLabStats(await response.json(), publicExperimentIds);
  } catch {
    return null;
  }
}
