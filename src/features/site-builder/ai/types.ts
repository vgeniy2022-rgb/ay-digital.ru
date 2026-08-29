import type { SiteBuilderProject, StudioThemeTokens } from '../schema/types';

export type AiProjectType = 'auto' | 'landing' | 'multipage' | 'portfolio' | 'catalog' | 'services';
export type AiVisualStyle = 'auto' | 'minimal' | 'technology' | 'premium' | 'bright' | 'dark' | 'editorial' | 'brutalist';
export type AiProviderKind = 'local' | 'gemini';

export type AiGenerateRequest = {
  kind: 'site-plan' | 'rewrite' | 'site-action';
  prompt: string;
  context?: Record<string, unknown>;
  signal?: AbortSignal;
};

export interface AIProvider {
  readonly id: AiProviderKind;
  readonly label: string;
  generateStructured<T>(request: AiGenerateRequest): Promise<T>;
  generateText(request: AiGenerateRequest): Promise<string>;
  isAvailable(): Promise<boolean>;
}

export type SitePlanSectionType =
  | 'Header' | 'Hero' | 'Services' | 'Features' | 'Pricing' | 'Portfolio'
  | 'Gallery' | 'Steps' | 'Stats' | 'Reviews' | 'Team' | 'FAQ' | 'Contact'
  | 'LeadForm' | 'MapPlaceholder' | 'Footer';

export type SitePlanSection = {
  type: SitePlanSectionType;
  title?: string;
  text?: string;
  items?: Array<Record<string, string>>;
};

export type SitePlanPage = {
  name: string;
  slug: string;
  title: string;
  metaDescription: string;
  sections: SitePlanSection[];
};

export type SitePlan = {
  projectType: Exclude<AiProjectType, 'auto'>;
  businessName: string;
  businessSummary: string;
  audience: string;
  tone: string;
  visualStyle: Exclude<AiVisualStyle, 'auto'>;
  accentColor?: string;
  pages: SitePlanPage[];
};

export type AiCreationOptions = {
  prompt: string;
  projectType: AiProjectType;
  visualStyle: AiVisualStyle;
  pageCount: 'auto' | '1' | '3' | '5';
  accentColor?: string;
};

export type AiProjectResult = {
  provider: AiProviderKind;
  plan: SitePlan;
  project: SiteBuilderProject;
  warnings: string[];
};

export type AiAuditSeverity = 'critical' | 'recommendation' | 'good';
export type AiAuditFinding = { severity: AiAuditSeverity; category: string; title: string; detail: string };
export type AiAuditResult = {
  metrics: { pages: number; sections: number; h1: number; cta: number; missingAlt: number; emptyLinks: number; duplicateHeadings: number };
  findings: AiAuditFinding[];
};

export type AiThemeProposal = {
  label: string;
  description: string;
  changes: string[];
  theme: StudioThemeTokens;
};
