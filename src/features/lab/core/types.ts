export type LabExperimentId = 'builder' | 'game2d' | 'game3d' | 'physics' | 'os' | 'retro' | 'canvas';

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
};

export type LabAchievementId =
  | 'FIRST_EXPERIMENT'
  | 'BROKE_THE_WEBSITE'
  | 'ENTERED_THE_ROOM'
  | 'PHYSICS_ENTHUSIAST'
  | 'RETRO_USER'
  | 'CANVAS_EXPLORER'
  | 'LAB_COMPLETE';

export type LabAchievement = {
  id: LabAchievementId;
  title: string;
  description: string;
  unlockedAt?: string;
};

export type LabPersistentState = {
  version: 1;
  explored: LabExperimentId[];
  achievements: Partial<Record<LabAchievementId, string>>;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
};
