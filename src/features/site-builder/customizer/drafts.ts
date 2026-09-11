import { createProjectFromCatalog, type LoadedCatalogTemplate } from '../catalog/catalog';
import { studioProjectRepository } from '../persistence/projectRepository';
import { enableCustomizer } from './model';

export async function openCatalogDraft(template: LoadedCatalogTemplate) {
  const candidates = (await studioProjectRepository.list()).filter((item) => item.templateId === template.id);
  for (const item of candidates) {
    const existing = await studioProjectRepository.get(item.id);
    if (existing?.settings.catalogCustomizer?.version === 1) return existing;
  }
  const copy = enableCustomizer(createProjectFromCatalog(template), template.version);
  return studioProjectRepository.create(copy);
}
