import type { Plugin } from 'vite';
export const XRAY_SOURCE_ALLOWLIST: readonly string[];
export function xraySourcePlugin(): Plugin;
export function redactSourceLine(line: string): string;
export function analyzeXRayFile(text: string, file: string): { code: string; source: import('../src/features/xray/types').XRaySourceFile; nodes: import('../src/features/xray/types').XRaySourceNode[] };
export function buildXRayManifest(root: string): import('../src/features/xray/types').XRayManifest;
