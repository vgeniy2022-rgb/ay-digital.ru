import type { AIProvider, AiGenerateRequest, AiProjectType, AiVisualStyle, SitePlan, SitePlanSectionType } from './types';

const pageNames = ['Главная', 'Услуги', 'О проекте', 'Контакты', 'Портфолио'];
const DEFAULT_GEMINI_ENDPOINT = '/api/ai';

function inferBusinessName(prompt: string) {
  const quoted = prompt.match(/[«"]([^»"]{2,80})[»"]/);
  if (quoted) return quoted[1];
  const match = prompt.match(/(?:сайт|для)\s+([^.,\n]{3,70})/i);
  return match?.[1].replace(/^(?:для|про)\s+/i, '').trim() || 'Новый проект';
}

function inferStyle(prompt: string, requested?: AiVisualStyle): SitePlan['visualStyle'] {
  if (requested && requested !== 'auto') return requested;
  if (/т[её]мн/i.test(prompt)) return 'dark';
  if (/преми/i.test(prompt)) return 'premium';
  if (/ярк/i.test(prompt)) return 'bright';
  if (/технолог/i.test(prompt)) return 'technology';
  if (/редакц/i.test(prompt)) return 'editorial';
  return 'minimal';
}

function inferType(prompt: string, requested?: AiProjectType): SitePlan['projectType'] {
  if (requested && requested !== 'auto') return requested;
  if (/лендинг|одностранич/i.test(prompt)) return 'landing';
  if (/портфолио|работы|кейсы/i.test(prompt)) return 'portfolio';
  if (/каталог|товар/i.test(prompt)) return 'catalog';
  if (/страниц|многостранич/i.test(prompt)) return 'multipage';
  return 'services';
}

function sectionsFor(prompt: string, isHome: boolean): SitePlanSectionType[] {
  if (!isHome) return ['Header', 'Hero', 'Services', 'FAQ', 'Contact', 'Footer'];
  const sections: SitePlanSectionType[] = ['Header', 'Hero', 'Services', 'Features'];
  if (/цен|тариф/i.test(prompt)) sections.push('Pricing');
  if (/фото|галере/i.test(prompt)) sections.push('Gallery');
  if (/работ|портфолио|кейс/i.test(prompt)) sections.push('Portfolio');
  sections.push('Steps');
  if (/отзыв/i.test(prompt)) sections.push('Reviews');
  if (/faq|вопрос/i.test(prompt)) sections.push('FAQ');
  sections.push('Contact', 'Footer');
  return sections;
}

function localPlan(request: AiGenerateRequest): SitePlan {
  const prompt = request.prompt.trim();
  if (prompt.length < 12) throw new Error('Опишите задачу подробнее: минимум 12 символов.');
  const options = request.context || {};
  const projectType = inferType(prompt, options.projectType as AiProjectType | undefined);
  const visualStyle = inferStyle(prompt, options.visualStyle as AiVisualStyle | undefined);
  const desiredCount = options.pageCount === '1' || projectType === 'landing' ? 1 : options.pageCount === '5' ? 5 : options.pageCount === '3' ? 3 : projectType === 'multipage' ? 3 : 1;
  const businessName = inferBusinessName(prompt);
  return {
    projectType,
    businessName,
    businessSummary: prompt.slice(0, 420),
    audience: prompt.match(/аудитори[яи]\s*[-—:]?\s*([^.!?]+)/i)?.[1]?.trim() || 'Люди, которым нужна понятная информация и быстрый способ связаться',
    tone: /дружелюб/i.test(prompt) ? 'Дружелюбный' : /преми/i.test(prompt) ? 'Премиальный' : 'Понятный и деловой',
    visualStyle,
    accentColor: typeof options.accentColor === 'string' ? options.accentColor : undefined,
    pages: pageNames.slice(0, desiredCount).map((name, index) => ({
      name,
      slug: index === 0 ? '' : name.toLowerCase().replace(' ', '-'),
      title: index === 0 ? `${businessName} — услуги и контакты` : `${name} — ${businessName}`,
      metaDescription: index === 0 ? `${businessName}: ${prompt.slice(0, 125)}` : `${name} проекта ${businessName}. Понятная информация и способы связи.`,
      sections: sectionsFor(prompt, index === 0).map((type) => ({ type })),
    })),
  };
}

export class LocalAIProvider implements AIProvider {
  readonly id = 'local' as const;
  readonly label = 'Локальный планировщик';
  async isAvailable() { return true; }
  async generateStructured<T>(request: AiGenerateRequest) { return localPlan(request) as T; }
  async generateText(request: AiGenerateRequest) { return request.prompt.trim().replace(/\s+/g, ' '); }
}

export class GeminiAIProvider implements AIProvider {
  readonly id = 'gemini' as const;
  readonly label = 'Google Gemini';
  constructor(private readonly endpoint = import.meta.env?.VITE_SITEVL_AI_ENDPOINT || DEFAULT_GEMINI_ENDPOINT) {}
  async isAvailable() { return Boolean(this.endpoint); }
  async generateStructured<T>(request: AiGenerateRequest): Promise<T> {
    if (!this.endpoint) throw new Error('Gemini endpoint не настроен.');
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), 45000);
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: request.kind, prompt: request.prompt, context: request.context }),
        signal: request.signal || controller.signal,
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(payload.error || `Gemini endpoint вернул код ${response.status}.`);
      }
      return await response.json() as T;
    } finally { globalThis.clearTimeout(timeout); }
  }
  async generateText(request: AiGenerateRequest) {
    const result = await this.generateStructured<{ text?: string }>(request);
    return result.text || '';
  }
}

/** @deprecated Use GeminiAIProvider. Kept as a source-compatible alias for older imports. */
export const CloudflareAIProvider = GeminiAIProvider;

export function getAiProvider(mode: 'auto' | 'local' | 'cloud' = 'auto') {
  const cloud = new GeminiAIProvider();
  if (mode === 'cloud' || (mode === 'auto' && typeof window !== 'undefined')) return cloud;
  return new LocalAIProvider();
}

export function getAiCapabilities() {
  return {
    webGpu: typeof navigator !== 'undefined' && 'gpu' in navigator,
    local: true,
    cloud: true,
  };
}
