import { validateTemplateProject, type CatalogTemplate, type LoadedCatalogTemplate } from './catalog';

// One lazy data chunk per selected project; metadata/SEO never import this module.
const loaders = {
  'sitevl-design-salon': () => import('./projects/salon'),
  'sitevl-design-garage': () => import('./projects/garage'),
  'sitevl-design-coffee': () => import('./projects/coffee'),
  'sitevl-design-school': () => import('./projects/school'),
  'sitevl-design-tech': () => import('./projects/tech'),
  'sitevl-design-marine': () => import('./projects/marine'),
  'sitevl-design-barber': () => import('./projects/barber'),
  'sitevl-design-nails': () => import('./projects/nails'),
  'sitevl-design-detailing': () => import('./projects/detailing'),
  'sitevl-design-tires': () => import('./projects/tires'),
  'sitevl-design-restaurant': () => import('./projects/restaurant'),
  'sitevl-design-bakery': () => import('./projects/bakery'),
  'sitevl-design-language': () => import('./projects/language'),
  'sitevl-design-training': () => import('./projects/training'),
  'sitevl-design-photographer': () => import('./projects/photographer'),
  'sitevl-design-psychologist': () => import('./projects/psychologist'),
  'sitevl-design-tutor': () => import('./projects/tutor'),
  'sitevl-design-clothing': () => import('./projects/clothing'),
  'sitevl-design-florist': () => import('./projects/florist'),
  'sitevl-design-logistics': () => import('./projects/logistics'),
  'sitevl-design-wholesale': () => import('./projects/wholesale'),
  'sitevl-design-lodge': () => import('./projects/lodge'),
  'sitevl-design-tours': () => import('./projects/tours'),
  'sitevl-design-boat': () => import('./projects/boat'),
  'sitevl-design-renovation': () => import('./projects/renovation'),
  'sitevl-design-furniture': () => import('./projects/furniture'),
  'sitevl-design-cleaning': () => import('./projects/cleaning'),
  'sitevl-design-grooming': () => import('./projects/grooming'),
  'sitevl-design-pethotel': () => import('./projects/pethotel'),
  'sitevl-design-dogtrainer': () => import('./projects/dogtrainer'),
};
export async function loadTemplateProject(template: CatalogTemplate): Promise<LoadedCatalogTemplate> {
  const load = loaders[template.id as keyof typeof loaders];
  if (!load) throw new Error('Данные этого дизайна недоступны.');
  const { default: project } = await load();
  return validateTemplateProject({ ...template, project });
}
