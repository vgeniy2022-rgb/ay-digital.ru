import type { ModernGameId, ModernGameProgress } from './modernOsModel';

export type ModernGameResult = {
  score: number;
  completed?: boolean;
  time?: number;
  playTime?: number;
  achievement?: string;
  progress?: number;
};

export type ModernGameProps = {
  haptics: boolean;
  progress: ModernGameProgress;
  onExit: () => void;
  onRestart: () => void;
  onResult: (id: ModernGameId, result: ModernGameResult) => void;
  onFullscreen: () => void;
};
