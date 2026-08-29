export type LabExperimentId = 'builder' | 'game2d' | 'game3d' | 'physics' | 'os' | 'retro' | 'canvas' | 'modern-os';
export type LabExperimentGroup = 'CREATE' | 'EXPERIMENT' | 'SYSTEM' | 'PLAY';

export type LabExperiment = {
  id: LabExperimentId;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  status: 'STABLE' | 'EXPERIMENTAL' | 'PHYSICS' | '3D' | 'INTERACTIVE';
  technologies: string[];
  href: string;
  accent: string;
  group: LabExperimentGroup;
  category: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  duration: string;
  keyboard: boolean;
  touch: boolean;
  achievementIds: LabAchievementId[];
};

export type LabAchievementId =
  | 'FIRST_EXPERIMENT'
  | 'BROKE_THE_WEBSITE'
  | 'ENTERED_THE_ROOM'
  | 'PHYSICS_ENTHUSIAST'
  | 'RETRO_USER'
  | 'CANVAS_EXPLORER'
  | 'LAB_COMPLETE'
  | 'BUILDER_ARCHITECT'
  | 'DASH_MASTER'
  | 'FRAGMENT_HUNTER'
  | 'ROOM_EXPLORER'
  | 'SIGNAL_SOLVED'
  | 'ZERO_GRAVITY'
  | 'OBJECT_HUNDRED'
  | 'CHAIN_REACTION'
  | 'SYSTEM_ADMIN'
  | 'TERMINAL_SECRET'
  | 'RETRO_GAMER'
  | 'FLOPPY_SECRET'
  | 'RETRO_MONO_USER'
  | 'RETRO_WEB_PIONEER'
  | 'RETRO_SECRET_FILE'
  | 'RETRO_ARTIST'
  | 'RETRO_DOCUMENT'
  | 'RETRO_GAME_WINNER'
  | 'RETRO_ALL_SYSTEMS'
  | 'RETRO_NETWORKED'
  | 'RETRO_SYSADMIN'
  | 'RETRO_MAIL_USER'
  | 'RETRO_SYSOP'
  | 'RETRO_PROGRAMMER'
  | 'RETRO_WEBMASTER'
  | 'RETRO_INSTALLER'
  | 'MODERN_OS_USER'
  | 'MODERN_MULTITASKER'
  | 'MODERN_EXPLORER'
  | 'MODERN_FIRST_GAME'
  | 'MODERN_CORE_COMPLETE'
  | 'MODERN_BLOCKS_100'
  | 'MODERN_BEST_LAP'
  | 'MODERN_FARM_HARVEST'
  | 'MODERN_FARM_SUPPLIER'
  | 'MODERN_FARMER'
  | 'CANVAS_ARCHITECT'
  | 'SECRET_FOUND'
  | 'ALL_SECRETS';

export type LabAchievementCategory = 'EXPLORATION' | 'SKILL' | 'SECRET' | 'COMPLETION' | 'CHAOS';

export type LabAchievement = {
  id: LabAchievementId;
  title: string;
  description: string;
  category: LabAchievementCategory;
  xp: number;
  unlockedAt?: string;
};

export type LabPersistentState = {
  version: 2;
  explored: LabExperimentId[];
  completed: LabExperimentId[];
  achievements: Partial<Record<LabAchievementId, string>>;
  xp: number;
  secrets: string[];
  lastExperiment?: LabExperimentId;
  stats: {
    playTimeSeconds: number;
    objectsCreated: number;
    elementsBroken: number;
    roomsVisited: number;
  };
  experimentState: Partial<Record<LabExperimentId, Record<string, unknown>>>;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  audio: { master: number; effects: number; ambient: number };
};
