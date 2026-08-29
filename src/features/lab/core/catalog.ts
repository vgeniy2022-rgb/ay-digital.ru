import { labAchievementCopy, labExperimentCopy } from '../i18n/ru';
import type { LabAchievement, LabAchievementCategory, LabAchievementId, LabExperiment, LabExperimentId } from './types';

export const labKnownExperimentIds: readonly LabExperimentId[] = ['builder', 'game2d', 'game3d', 'physics', 'os', 'retro', 'canvas', 'modern-os'];

export const labExperiments: LabExperiment[] = [
  { id: 'builder', number: '01', group: 'CREATE', ...labExperimentCopy.builder, status: 'STABLE', technologies: ['Puck', 'React', 'IndexedDB'], href: '/lab/builder', accent: '#75a7ff', difficulty: 2, duration: '10–30 мин', keyboard: true, touch: true, achievementIds: ['BUILDER_ARCHITECT'] },
  { id: 'canvas', number: '02', group: 'CREATE', ...labExperimentCopy.canvas, status: 'EXPERIMENTAL', technologies: ['Canvas 2D', 'Pointer API', 'Persistence'], href: '/lab/canvas', accent: '#ff8dc7', difficulty: 3, duration: '15–40 мин', keyboard: true, touch: true, achievementIds: ['CANVAS_EXPLORER', 'CANVAS_ARCHITECT'] },
  { id: 'physics', number: '03', group: 'EXPERIMENT', ...labExperimentCopy.physics, status: 'PHYSICS', technologies: ['Canvas 2D', 'Sensors', 'Vibration'], href: '/lab/physics', accent: '#63d6a2', difficulty: 2, duration: '10–30 мин', keyboard: true, touch: true, achievementIds: ['PHYSICS_ENTHUSIAST', 'ZERO_GRAVITY', 'OBJECT_HUNDRED', 'CHAIN_REACTION'] },
  { id: 'modern-os', number: '04', group: 'SYSTEM', ...labExperimentCopy['modern-os'], status: 'INTERACTIVE', technologies: ['React', 'Canvas 2D', 'Fullscreen API', 'LocalStorage'], href: '/lab/modern-os', accent: '#8be9ff', difficulty: 3, duration: '20–60 мин', keyboard: true, touch: true, achievementIds: ['MODERN_OS_USER', 'MODERN_MULTITASKER', 'MODERN_EXPLORER', 'MODERN_FIRST_GAME', 'MODERN_CORE_COMPLETE', 'MODERN_BLOCKS_100', 'MODERN_BEST_LAP', 'MODERN_FARM_HARVEST', 'MODERN_FARM_SUPPLIER', 'MODERN_FARMER'] },
  { id: 'retro', number: '05', group: 'SYSTEM', ...labExperimentCopy.retro, status: 'INTERACTIVE', technologies: ['Canvas', 'Web Audio', 'CSS'], href: '/lab/retro', accent: '#ffd66b', difficulty: 3, duration: '25–60 мин', keyboard: true, touch: true, achievementIds: ['RETRO_USER', 'RETRO_GAMER', 'FLOPPY_SECRET', 'RETRO_WEB_PIONEER', 'RETRO_SECRET_FILE', 'RETRO_ARTIST', 'RETRO_DOCUMENT', 'RETRO_GAME_WINNER', 'RETRO_NETWORKED', 'RETRO_SYSADMIN', 'RETRO_MAIL_USER', 'RETRO_SYSOP', 'RETRO_PROGRAMMER', 'RETRO_WEBMASTER', 'RETRO_INSTALLER'] },
];

export const labPublicExperimentIds = labExperiments.map((experiment) => experiment.id);

export function isKnownLabExperimentId(value: unknown): value is LabExperimentId {
  return typeof value === 'string' && labKnownExperimentIds.includes(value as LabExperimentId);
}

const achievementMeta: Record<LabAchievementId, { category: LabAchievementCategory; xp: number }> = {
  FIRST_EXPERIMENT: { category: 'EXPLORATION', xp: 50 }, BROKE_THE_WEBSITE: { category: 'COMPLETION', xp: 140 }, ENTERED_THE_ROOM: { category: 'COMPLETION', xp: 160 }, PHYSICS_ENTHUSIAST: { category: 'SKILL', xp: 80 }, RETRO_USER: { category: 'EXPLORATION', xp: 60 }, CANVAS_EXPLORER: { category: 'SKILL', xp: 70 }, LAB_COMPLETE: { category: 'COMPLETION', xp: 300 },
  BUILDER_ARCHITECT: { category: 'SKILL', xp: 100 }, DASH_MASTER: { category: 'SKILL', xp: 60 }, FRAGMENT_HUNTER: { category: 'SECRET', xp: 100 }, ROOM_EXPLORER: { category: 'EXPLORATION', xp: 100 }, SIGNAL_SOLVED: { category: 'SKILL', xp: 90 }, ZERO_GRAVITY: { category: 'EXPLORATION', xp: 60 }, OBJECT_HUNDRED: { category: 'CHAOS', xp: 120 }, CHAIN_REACTION: { category: 'CHAOS', xp: 90 }, SYSTEM_ADMIN: { category: 'SKILL', xp: 90 }, TERMINAL_SECRET: { category: 'SECRET', xp: 100 }, RETRO_GAMER: { category: 'SKILL', xp: 70 }, FLOPPY_SECRET: { category: 'SECRET', xp: 100 }, RETRO_MONO_USER: { category: 'EXPLORATION', xp: 70 }, RETRO_WEB_PIONEER: { category: 'EXPLORATION', xp: 80 }, RETRO_SECRET_FILE: { category: 'SECRET', xp: 120 }, RETRO_ARTIST: { category: 'SKILL', xp: 80 }, RETRO_DOCUMENT: { category: 'SKILL', xp: 60 }, RETRO_GAME_WINNER: { category: 'SKILL', xp: 100 }, RETRO_ALL_SYSTEMS: { category: 'COMPLETION', xp: 160 }, RETRO_NETWORKED: { category: 'EXPLORATION', xp: 70 }, RETRO_SYSADMIN: { category: 'SECRET', xp: 140 }, RETRO_MAIL_USER: { category: 'EXPLORATION', xp: 50 }, RETRO_SYSOP: { category: 'SECRET', xp: 100 }, RETRO_PROGRAMMER: { category: 'SKILL', xp: 100 }, RETRO_WEBMASTER: { category: 'SKILL', xp: 100 }, RETRO_INSTALLER: { category: 'SKILL', xp: 70 }, CANVAS_ARCHITECT: { category: 'SKILL', xp: 100 }, MODERN_OS_USER: { category: 'EXPLORATION', xp: 70 }, MODERN_MULTITASKER: { category: 'SKILL', xp: 100 }, MODERN_EXPLORER: { category: 'EXPLORATION', xp: 90 }, MODERN_FIRST_GAME: { category: 'EXPLORATION', xp: 60 }, MODERN_CORE_COMPLETE: { category: 'COMPLETION', xp: 100 }, MODERN_BLOCKS_100: { category: 'SKILL', xp: 90 }, MODERN_BEST_LAP: { category: 'SKILL', xp: 100 }, MODERN_FARM_HARVEST: { category: 'EXPLORATION', xp: 60 }, MODERN_FARM_SUPPLIER: { category: 'SKILL', xp: 80 }, MODERN_FARMER: { category: 'COMPLETION', xp: 110 }, SECRET_FOUND: { category: 'SECRET', xp: 60 }, ALL_SECRETS: { category: 'SECRET', xp: 200 },
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
