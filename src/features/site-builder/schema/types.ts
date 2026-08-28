import type { Data } from '@puckeditor/core';

export const SITE_BUILDER_SCHEMA_VERSION = 1 as const;

export type StudioBreakpoint = 'desktop' | 'laptop' | 'tablet' | 'mobile';

export type ResponsiveStyle = {
  display?: 'block' | 'flex' | 'grid' | 'none';
  direction?: 'row' | 'column';
  alignItems?: 'stretch' | 'start' | 'center' | 'end';
  justifyContent?: 'start' | 'center' | 'end' | 'space-between';
  gap?: number;
  columns?: number;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
  padding?: number;
  margin?: number;
  fontSize?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  background?: string;
  border?: string;
  radius?: number;
  shadow?: 'none' | 'soft' | 'medium' | 'strong';
  visibility?: 'visible' | 'hidden';
  order?: number;
};

export type ResponsiveSettings = Partial<Record<StudioBreakpoint, ResponsiveStyle>>;

export type StudioThemeTokens = {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
    success: string;
    error: string;
  };
  typography: {
    display: string;
    h1: string;
    h2: string;
    h3: string;
    body: string;
    small: string;
    button: string;
    caption: string;
  };
  contentWidths: {
    narrow: number;
    default: number;
    wide: number;
  };
  spacing: number[];
  radii: number[];
  shadows: string[];
  buttonPreset: 'solid' | 'outline' | 'soft';
};

export type StudioPage = {
  id: string;
  name: string;
  slug: string;
  title: string;
  metaDescription: string;
  socialImageAssetId?: string;
  noindex: boolean;
  isHome: boolean;
  order: number;
  data: Data;
};

export type StudioAssetMetadata = {
  id: string;
  projectId: string;
  name: string;
  type: string;
  size: number;
  width?: number;
  height?: number;
  alt: string;
  focalPoint: { x: number; y: number };
  createdAt: string;
};

export type SiteBuilderProject = {
  schemaVersion: typeof SITE_BUILDER_SCHEMA_VERSION;
  id: string;
  name: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  activePageId: string;
  theme: StudioThemeTokens;
  pages: StudioPage[];
  assets: StudioAssetMetadata[];
  settings: {
    defaultBreakpoint: StudioBreakpoint;
    language: 'ru';
  };
};

export type ProjectBundle = {
  exportedAt: string;
  project: SiteBuilderProject;
  assets: StudioAssetMetadata[];
};

export type StoredStudioAsset = StudioAssetMetadata & {
  blob: Blob;
};

export type ProjectListItem = Pick<SiteBuilderProject, 'id' | 'name' | 'templateId' | 'createdAt' | 'updatedAt'> & {
  pageCount: number;
};

