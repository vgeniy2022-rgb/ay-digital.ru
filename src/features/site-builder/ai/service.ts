import { sitePlanToProject } from './generator';
import { getAiProvider } from './providers';
import type { AiCreationOptions, AiProjectResult } from './types';
import { validateSitePlan } from './validation';

export async function createProjectWithAi(options: AiCreationOptions, mode: 'auto' | 'local' | 'cloud' = 'auto'): Promise<AiProjectResult> {
  const provider = getAiProvider(mode);
  if (!await provider.isAvailable()) throw new Error('Выбранный AI-провайдер сейчас недоступен.');
  const raw = await provider.generateStructured<unknown>({ kind: 'site-plan', prompt: options.prompt, context: options });
  const plan = validateSitePlan(raw);
  const project = sitePlanToProject(plan);
  return { provider: provider.id, plan, project, warnings: provider.id === 'local' ? ['Проект создан локальным структурным планировщиком. Проверьте тексты и замените демонстрационные данные перед публикацией.'] : [] };
}

