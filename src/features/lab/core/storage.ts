import { getLabLevel, isKnownLabExperimentId, labAchievements, labPublicExperimentIds } from './catalog';
import type { LabAchievementId, LabExperimentId, LabPersistentState } from './types';

export const LAB_STORAGE_KEY = 'sitevl-lab-state-v2';
export const LAB_LEGACY_STORAGE_KEY = 'sitevl-lab-state-v1';
export const LAB_STATE_EVENT = 'sitevl-lab-state';

export const defaultLabState: LabPersistentState = {
  version: 2,
  explored: [],
  completed: [],
  achievements: {},
  xp: 0,
  secrets: [],
  stats: { playTimeSeconds: 0, objectsCreated: 0, elementsBroken: 0, roomsVisited: 0 },
  experimentState: {},
  soundEnabled: false,
  hapticsEnabled: true,
  audio: { master: .7, effects: .8, ambient: .35 },
};

function finite(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : fallback;
}

function normalizeAchievements(value: unknown): LabPersistentState['achievements'] {
  if (!value || typeof value !== 'object') return {};
  const validIds = new Set(labAchievements.map((achievement) => achievement.id));
  return Object.fromEntries(Object.entries(value).filter(([id, at]) => validIds.has(id as LabAchievementId) && typeof at === 'string')) as LabPersistentState['achievements'];
}

export function normalizeLabState(value: unknown): LabPersistentState {
  if (!value || typeof value !== 'object') return { ...defaultLabState };
  const candidate = value as Partial<LabPersistentState> & { version?: number };
  const explored = Array.isArray(candidate.explored) ? [...new Set(candidate.explored.filter(isKnownLabExperimentId))] : [];
  const completed = Array.isArray(candidate.completed) ? [...new Set(candidate.completed.filter(isKnownLabExperimentId))] : [];
  const achievements = normalizeAchievements(candidate.achievements);
  const migratedXp = Object.keys(achievements).reduce((sum, id) => sum + (labAchievements.find((item) => item.id === id)?.xp || 0), explored.length * 25);
  const stats = candidate.stats && typeof candidate.stats === 'object' ? candidate.stats : defaultLabState.stats;
  const audio = candidate.audio && typeof candidate.audio === 'object' ? candidate.audio : defaultLabState.audio;
  return {
    version: 2,
    explored,
    completed,
    achievements,
    xp: Math.round(finite(candidate.xp, migratedXp)),
    secrets: Array.isArray(candidate.secrets) ? [...new Set(candidate.secrets.filter((item): item is string => typeof item === 'string'))].slice(0, 100) : [],
    lastExperiment: isKnownLabExperimentId(candidate.lastExperiment) ? candidate.lastExperiment : explored[explored.length - 1],
    stats: {
      playTimeSeconds: finite(stats.playTimeSeconds),
      objectsCreated: finite(stats.objectsCreated),
      elementsBroken: finite(stats.elementsBroken),
      roomsVisited: finite(stats.roomsVisited),
    },
    experimentState: candidate.experimentState && typeof candidate.experimentState === 'object' ? candidate.experimentState : {},
    soundEnabled: candidate.soundEnabled === true,
    hapticsEnabled: candidate.hapticsEnabled !== false,
    audio: {
      master: Math.min(1, finite(audio.master, .7)),
      effects: Math.min(1, finite(audio.effects, .8)),
      ambient: Math.min(1, finite(audio.ambient, .35)),
    },
  };
}

export function readLabState(): LabPersistentState {
  if (typeof window === 'undefined') return defaultLabState;
  try {
    const current = window.localStorage.getItem(LAB_STORAGE_KEY);
    if (current) return normalizeLabState(JSON.parse(current));
    const legacy = window.localStorage.getItem(LAB_LEGACY_STORAGE_KEY);
    const migrated = legacy ? normalizeLabState(JSON.parse(legacy)) : defaultLabState;
    if (legacy) window.localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return defaultLabState;
  }
}

export function writeLabState(state: LabPersistentState) {
  if (typeof window === 'undefined') return;
  const normalized = normalizeLabState(state);
  try {
    window.localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent(LAB_STATE_EVENT, { detail: normalized }));
  } catch {
    // LAB remains available without persistent storage.
  }
}

function achievementReward(state: LabPersistentState, id: LabAchievementId, now: string) {
  if (state.achievements[id]) return state;
  const reward = labAchievements.find((item) => item.id === id)?.xp || 0;
  return { ...state, xp: state.xp + reward, achievements: { ...state.achievements, [id]: now } };
}

export function markExperimentExplored(id: LabExperimentId) {
  const current = readLabState();
  const isNew = !current.explored.includes(id);
  let next: LabPersistentState = { ...current, explored: isNew ? [...current.explored, id] : current.explored, lastExperiment: id, xp: current.xp + (isNew ? 25 : 0) };
  if (isNew) next = achievementReward(next, 'FIRST_EXPERIMENT', new Date().toISOString());
  writeLabState(next);
}

export function unlockLabAchievement(id: LabAchievementId) {
  const current = readLabState();
  if (current.achievements[id]) return;
  writeLabState(achievementReward(current, id, new Date().toISOString()));
}

export function completeLabExperiment(id: LabExperimentId) {
  let current = readLabState();
  if (!current.explored.includes(id)) current = { ...current, explored: [...current.explored, id] };
  if (!current.completed.includes(id)) current = { ...current, completed: [...current.completed, id], xp: current.xp + 100 };
  if (labPublicExperimentIds.every((experimentId) => current.completed.includes(experimentId))) current = achievementReward(current, 'LAB_COMPLETE', new Date().toISOString());
  writeLabState({ ...current, lastExperiment: id });
}

export function recordLabSecret(secret: string) {
  let current = readLabState();
  if (current.secrets.includes(secret)) return;
  current = { ...current, secrets: [...current.secrets, secret], xp: current.xp + 35 };
  current = achievementReward(current, 'SECRET_FOUND', new Date().toISOString());
  if (current.secrets.length >= 7) current = achievementReward(current, 'ALL_SECRETS', new Date().toISOString());
  writeLabState(current);
}

export function recordLabActivity(delta: Partial<LabPersistentState['stats']>) {
  const current = readLabState();
  writeLabState({
    ...current,
    stats: {
      playTimeSeconds: current.stats.playTimeSeconds + finite(delta.playTimeSeconds),
      objectsCreated: current.stats.objectsCreated + finite(delta.objectsCreated),
      elementsBroken: current.stats.elementsBroken + finite(delta.elementsBroken),
      roomsVisited: current.stats.roomsVisited + finite(delta.roomsVisited),
    },
  });
}

export function saveExperimentState(id: LabExperimentId, value: Record<string, unknown>) {
  const current = readLabState();
  writeLabState({ ...current, experimentState: { ...current.experimentState, [id]: value }, lastExperiment: id });
}

export function patchLabState(patch: Partial<Pick<LabPersistentState, 'soundEnabled' | 'hapticsEnabled' | 'audio'>>) {
  writeLabState({ ...readLabState(), ...patch });
}

export function resetLabProgress() {
  writeLabState(defaultLabState);
}

export { getLabLevel };
