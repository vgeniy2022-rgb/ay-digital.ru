export type XRayLanguage = 'tsx' | 'css' | 'json' | 'structure';

export type XRayFile = {
  id: string;
  filename: string;
  label: string;
  language: XRayLanguage;
  content: string;
};

export type XRayPageDefinition = {
  route: string;
  title: string;
  componentName: string;
  files: XRayFile[];
};

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
