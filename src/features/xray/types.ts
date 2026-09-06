export type XRayLanguage = 'tsx' | 'html' | 'css' | 'json' | 'structure';
export type XRayMode = 'code' | 'structure' | 'box';
export type XRayLine = { number: number; text: string; highlighted?: boolean };
export type XRaySourceFile = { id: string; path: string; lines: XRayLine[]; fragments: { start: number; end: number; component: string }[] };
export type XRaySourceNode = { id: string; file: string; component: string; tag: string; start: number; end: number };
export type XRayManifest = { version: number; files: XRaySourceFile[]; nodes: Record<string, XRaySourceNode> };
export type XRayRect = { top: number; left: number; width: number; height: number };
export type XRaySection = { id: string; element: HTMLElement; rect: XRayRect; node?: XRaySourceNode; title: string };
export type XRaySelection = { element: HTMLElement; node?: XRaySourceNode; sectionId?: string; rect: XRayRect; label: string; styles: Record<string, string>; data: Record<string, string>; explanation: string };

export type XRayRouteKind =
  | 'home'
  | 'static'
  | 'service'
  | 'web-studio'
  | 'article'
  | 'price'
  | 'case'
  | 'local';

export type XRayRouteMatch = {
  route: string;
  title: string;
  componentName: string;
  kind: XRayRouteKind;
  slug?: string;
  sections: string[];
};
