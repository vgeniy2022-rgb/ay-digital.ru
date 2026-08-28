import type { LabAchievement, LabExperiment } from './types';

export const labExperiments: LabExperiment[] = [
  { id: 'builder', number: '01', title: 'WEBSITE BUILDER', shortTitle: 'Builder', description: 'Visual no-code workspace for pages, components, responsive states and export.', status: 'STABLE', technologies: ['Puck', 'React', 'IndexedDB'], href: '/lab/builder', accent: '#75a7ff' },
  { id: 'game2d', number: '02', title: 'BREAK THE WEBSITE', shortTitle: '2D Game', description: 'Run across interface fragments, move cards and reach the hidden CORE.', status: 'INTERACTIVE', technologies: ['Canvas 2D', 'Physics', 'Haptics'], href: '/lab/2d', accent: '#ff745f' },
  { id: 'game3d', number: '03', title: 'THE ROOM', shortTitle: '3D Room', description: 'A compact first-person room with four modules and a surreal exit.', status: '3D', technologies: ['Three.js', 'WebGL', 'Raycasting'], href: '/lab/3d', accent: '#8d7dff' },
  { id: 'physics', number: '04', title: 'PHYSICS LAB', shortTitle: 'Physics', description: 'Create, throw and tune objects under gravity presets or device tilt.', status: 'PHYSICS', technologies: ['Canvas 2D', 'Sensors', 'Vibration'], href: '/lab/physics', accent: '#63d6a2' },
  { id: 'os', number: '05', title: 'OS SIMULATOR', shortTitle: 'SITEVL OS', description: 'A fictional browser OS with movable windows, terminal, files and notes.', status: 'STABLE', technologies: ['React', 'Pointer API', 'LocalStorage'], href: '/lab/os', accent: '#5bb8ff' },
  { id: 'retro', number: '06', title: 'RETRO COMPUTING', shortTitle: 'Retro OS', description: 'Two original computing-era interfaces with working miniature apps.', status: 'INTERACTIVE', technologies: ['Canvas', 'Web Audio', 'CSS'], href: '/lab/retro', accent: '#ffd66b' },
  { id: 'canvas', number: '07', title: 'INFINITE CANVAS', shortTitle: 'Canvas', description: 'Pan, zoom and connect notes across a persistent spatial workspace.', status: 'EXPERIMENTAL', technologies: ['Canvas 2D', 'Pointer API', 'Persistence'], href: '/lab/canvas', accent: '#ff8dc7' },
];

export const labAchievements: LabAchievement[] = [
  { id: 'FIRST_EXPERIMENT', title: 'FIRST EXPERIMENT', description: 'Opened the first SITEVL LAB module.' },
  { id: 'BROKE_THE_WEBSITE', title: 'BROKE THE WEBSITE', description: 'Reached CORE and dismantled the controlled interface.' },
  { id: 'ENTERED_THE_ROOM', title: 'ENTERED THE ROOM', description: 'Found all four modules inside THE ROOM.' },
  { id: 'PHYSICS_ENTHUSIAST', title: 'PHYSICS ENTHUSIAST', description: 'Ran a custom gravity experiment.' },
  { id: 'RETRO_USER', title: 'RETRO USER', description: 'Booted a system from another computing era.' },
  { id: 'CANVAS_EXPLORER', title: 'CANVAS EXPLORER', description: 'Created and moved an object on the infinite canvas.' },
  { id: 'LAB_COMPLETE', title: 'LAB COMPLETE', description: 'Explored all seven experiments.' },
];

export function getLabExperiment(id: string | undefined) {
  return labExperiments.find((experiment) => experiment.id === id);
}
