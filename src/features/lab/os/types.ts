export type OsAppId = 'files' | 'terminal' | 'notes' | 'browser' | 'settings' | 'about';

export type OsWindowState = {
  id: OsAppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  minimized: boolean;
};

export type OsPreferences = {
  theme: 'dark' | 'light';
  wallpaper: 'aurora' | 'grid' | 'calm';
  motion: boolean;
};
