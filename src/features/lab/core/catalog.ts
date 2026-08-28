import { labAchievementCopy, labExperimentCopy } from '../i18n/ru';
import type { LabAchievement, LabAchievementCategory, LabAchievementId, LabExperiment } from './types';

export const labExperiments: LabExperiment[] = [
  { id: 'builder', number: '01', ...labExperimentCopy.builder, status: 'STABLE', technologies: ['Puck', 'React', 'IndexedDB'], href: '/lab/builder', accent: '#75a7ff', difficulty: 2, duration: '10–30 мин', keyboard: true, touch: true, achievementIds: ['BUILDER_ARCHITECT'] },
  { id: 'game2d', number: '02', ...labExperimentCopy.game2d, status: 'INTERACTIVE', technologies: ['Canvas 2D', 'Physics', 'Haptics'], href: '/lab/2d', accent: '#ff745f', difficulty: 3, duration: '5–15 мин', keyboard: true, touch: true, achievementIds: ['BROKE_THE_WEBSITE', 'DASH_MASTER', 'FRAGMENT_HUNTER'] },
  { id: 'game3d', number: '03', ...labExperimentCopy.game3d, status: '3D', technologies: ['Three.js', 'WebGL', 'Raycasting'], href: '/lab/3d', accent: '#8d7dff', difficulty: 3, duration: '10–20 мин', keyboard: true, touch: true, achievementIds: ['ENTERED_THE_ROOM', 'ROOM_EXPLORER', 'SIGNAL_SOLVED'] },
  { id: 'physics', number: '04', ...labExperimentCopy.physics, status: 'PHYSICS', technologies: ['Canvas 2D', 'Sensors', 'Vibration'], href: '/lab/physics', accent: '#63d6a2', difficulty: 2, duration: '10–30 мин', keyboard: true, touch: true, achievementIds: ['PHYSICS_ENTHUSIAST', 'ZERO_GRAVITY', 'OBJECT_HUNDRED', 'CHAIN_REACTION'] },
  { id: 'os', number: '05', ...labExperimentCopy.os, status: 'STABLE', technologies: ['React', 'Pointer API', 'LocalStorage'], href: '/lab/os', accent: '#5bb8ff', difficulty: 2, duration: '10–25 мин', keyboard: true, touch: true, achievementIds: ['SYSTEM_ADMIN', 'TERMINAL_SECRET'] },
  { id: 'retro', number: '06', ...labExperimentCopy.retro, status: 'INTERACTIVE', technologies: ['Canvas', 'Web Audio', 'CSS'], href: '/lab/retro', accent: '#ffd66b', difficulty: 2, duration: '10–20 мин', keyboard: true, touch: true, achievementIds: ['RETRO_USER', 'RETRO_GAMER', 'FLOPPY_SECRET'] },
  { id: 'canvas', number: '07', ...labExperimentCopy.canvas, status: 'EXPERIMENTAL', technologies: ['Canvas 2D', 'Pointer API', 'Persistence'], href: '/lab/canvas', accent: '#ff8dc7', difficulty: 3, duration: '15–40 мин', keyboard: true, touch: true, achievementIds: ['CANVAS_EXPLORER', 'CANVAS_ARCHITECT'] },
];

const achievementMeta: Record<LabAchievementId, { category: LabAchievementCategory; xp: number }> = {
  FIRST_EXPERIMENT: { category: 'EXPLORATION', xp: 50 }, BROKE_THE_WEBSITE: { category: 'COMPLETION', xp: 140 }, ENTERED_THE_ROOM: { category: 'COMPLETION', xp: 160 }, PHYSICS_ENTHUSIAST: { category: 'SKILL', xp: 80 }, RETRO_USER: { category: 'EXPLORATION', xp: 60 }, CANVAS_EXPLORER: { category: 'SKILL', xp: 70 }, LAB_COMPLETE: { category: 'COMPLETION', xp: 300 },
  BUILDER_ARCHITECT: { category: 'SKILL', xp: 100 }, DASH_MASTER: { category: 'SKILL', xp: 60 }, FRAGMENT_HUNTER: { category: 'SECRET', xp: 100 }, ROOM_EXPLORER: { category: 'EXPLORATION', xp: 100 }, SIGNAL_SOLVED: { category: 'SKILL', xp: 90 }, ZERO_GRAVITY: { category: 'EXPLORATION', xp: 60 }, OBJECT_HUNDRED: { category: 'CHAOS', xp: 120 }, CHAIN_REACTION: { category: 'CHAOS', xp: 90 }, SYSTEM_ADMIN: { category: 'SKILL', xp: 90 }, TERMINAL_SECRET: { category: 'SECRET', xp: 100 }, RETRO_GAMER: { category: 'SKILL', xp: 70 }, FLOPPY_SECRET: { category: 'SECRET', xp: 100 }, CANVAS_ARCHITECT: { category: 'SKILL', xp: 100 }, SECRET_FOUND: { category: 'SECRET', xp: 60 }, ALL_SECRETS: { category: 'SECRET', xp: 200 },
};

export const labAchievements: LabAchievement[] = (Object.keys(labAchievementCopy) as LabAchievementId[]).map((id) => ({
  id, title: labAchievementCopy[id][0], description: labAchievementCopy[id][1], ...achievementMeta[id],
}));

export function getLabExperiment(id: string | undefined) {
  return labExperiments.find((experiment) => experiment.id === id);
}

export function getLabLevel(xp: number) {
  return Math.min(10, Math.max(1, Math.floor(Math.max(0, xp) / 250) + 1));
}
