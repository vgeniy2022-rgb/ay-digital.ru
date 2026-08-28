import { labAchievements, labExperiments } from './catalog';
import type { LabAchievementId, LabExperimentId, LabPersistentState } from './types';

export const LAB_STORAGE_KEY = 'sitevl-lab-state-v1';
export const LAB_STATE_EVENT = 'sitevl-lab-state';

export const defaultLabState: LabPersistentState = {
  version: 1,
  explored: [],
  achievements: {},
  soundEnabled: false,
  hapticsEnabled: true,
};

function isExperimentId(value: unknown): value is LabExperimentId {
  return typeof value === 'string' && labExperiments.some((experiment) => experiment.id === value);
}

function normalizeAchievements(value: unknown): LabPersistentState['achievements'] {
  if (!value || typeof value !== 'object') return {};
  const validIds = new Set(labAchievements.map((achievement) => achievement.id));
  return Object.fromEntries(Object.entries(value).filter(([id, unlockedAt]) => validIds.has(id as LabAchievementId) && typeof unlockedAt === 'string')) as LabPersistentState['achievements'];
}

export function normalizeLabState(value: unknown): LabPersistentState {
  if (!value || typeof value !== 'object') return defaultLabState;
  const candidate = value as Partial<LabPersistentState>;
  return {
    version: 1,
    explored: Array.isArray(candidate.explored) ? [...new Set(candidate.explored.filter(isExperimentId))] : [],
    achievements: normalizeAchievements(candidate.achievements),
    soundEnabled: candidate.soundEnabled === true,
    hapticsEnabled: candidate.hapticsEnabled !== false,
  };
}

export function readLabState(): LabPersistentState {
  if (typeof window === 'undefined') return defaultLabState;
  try {
    const raw = window.localStorage.getItem(LAB_STORAGE_KEY);
    return raw ? normalizeLabState(JSON.parse(raw)) : defaultLabState;
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
    // LAB stays usable when browser storage is unavailable or full.
  }
}

export function markExperimentExplored(id: LabExperimentId) {
  const current = readLabState();
  const explored = current.explored.includes(id) ? current.explored : [...current.explored, id];
  const achievements = { ...current.achievements };
  const now = new Date().toISOString();
  if (!achievements.FIRST_EXPERIMENT) achievements.FIRST_EXPERIMENT = now;
  if (explored.length === labExperiments.length && !achievements.LAB_COMPLETE) achievements.LAB_COMPLETE = now;
  writeLabState({ ...current, explored, achievements });
}

export function unlockLabAchievement(id: LabAchievementId) {
  const current = readLabState();
  if (current.achievements[id]) return;
  writeLabState({ ...current, achievements: { ...current.achievements, [id]: new Date().toISOString() } });
}

export function patchLabState(patch: Partial<Pick<LabPersistentState, 'soundEnabled' | 'hapticsEnabled'>>) {
  writeLabState({ ...readLabState(), ...patch });
}

export function resetLabProgress() {
  writeLabState(defaultLabState);
}
