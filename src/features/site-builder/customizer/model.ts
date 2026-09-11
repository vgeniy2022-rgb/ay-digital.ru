import type { SiteBuilderProject } from '../schema/types';
import type { LoadedCatalogTemplate } from '../catalog/catalog';
import { designKeys, type DesignKey } from '../designs/types';
import { initialDesignTheme, defaultDesignMode } from './theme';

export const movableTypes = new Set(['DesignCollection','DesignStory','DesignFAQ']);
export const homePage = (project: SiteBuilderProject) => project.pages.find(p => p.isHome)!;
export function designOf(project: SiteBuilderProject): DesignKey {
  const key = (homePage(project).data.root.props as { catalogDesign?: string }).catalogDesign;
  if (!designKeys.includes(key as DesignKey)) throw new Error('Этот проект не поддерживает простой настройщик.');
  return key as DesignKey;
}
export function enableCustomizer(project: SiteBuilderProject, templateVersion: string) {
  const copy = structuredClone(project);
  copy.theme = initialDesignTheme(copy.theme, designOf(copy));
  copy.settings.catalogCustomizer = { version: 1, templateVersion, palette: 'original', mode: defaultDesignMode(designOf(copy)) };
  const root = homePage(copy).data.root.props;
  homePage(copy).data.root.props = { ...root, ...{ useThemeTokens: true } };
  return copy;
}
export function editProject(project: SiteBuilderProject, edit: (copy: SiteBuilderProject) => void) {
  const copy = structuredClone(project); edit(copy); copy.updatedAt = new Date().toISOString(); return copy;
}
const cleanText = (value: string, max: number) => Array.from(value).filter(char => char.charCodeAt(0)>=32 || char==='\n' || char==='\t' || char==='\r').join('').slice(0,max);
export function setMainText(project: SiteBuilderProject, field: 'brand' | 'title' | 'text' | 'action', value: string) {
  return editProject(project, copy => {
    const page = homePage(copy);
    if (field === 'brand') {
      const brand = cleanText(value,80);
      page.data.content.filter(b => b.type === 'DesignHeader' || b.type === 'DesignFooter').forEach(b => { b.props.brand = brand; });
      copy.name = brand.trim() || 'Мой сайт'; page.title = copy.name;
    } else page.data.content.find(b => b.type === 'DesignHero')!.props[field] = cleanText(value, field === 'text' ? 700 : field === 'title' ? 180 : 60);
  });
}
export function setItemText(project: SiteBuilderProject, blockId: string, index: number, field: 'title' | 'text' | 'price', value: string) {
  return editProject(project, copy => {
    const block = homePage(copy).data.content.find(b => b.props.id === blockId && b.type === 'DesignCollection');
    if (block?.props.items[index]) block.props.items[index][field] = cleanText(value, field === 'text' ? 500 : field === 'title' ? 100 : 60);
  });
}
export function setSectionHidden(project: SiteBuilderProject, id: string, hidden: boolean) {
  return editProject(project, copy => { const block = homePage(copy).data.content.find(b=>b.props.id===id); if (block && movableTypes.has(block.type)) block.props.hidden=hidden; });
}
export function moveSection(project: SiteBuilderProject, id: string, direction: -1 | 1) {
  return editProject(project, copy => {
    const content = homePage(copy).data.content;
    const positions = content.flatMap((b,i)=>movableTypes.has(b.type)?[i]:[]);
    const current = positions.findIndex(i=>content[i].props.id===id);
    if (current < 0 || current+direction < 0 || current+direction >= positions.length) return;
    const from=positions[current], to=positions[current+direction]; [content[from],content[to]]=[content[to],content[from]];
  });
}
export function resetCopy(current: SiteBuilderProject, template: LoadedCatalogTemplate) {
  const reset = enableCustomizer(template.project,template.version);
  const pageId = homePage(current).id;
  reset.id=current.id; reset.createdAt=current.createdAt; reset.name=template.name+' — мой сайт';
  reset.pages[0].id=pageId; reset.activePageId=pageId; reset.pages.forEach(p=>p.noindex=true);
  if(current.settings.catalogEnquiry) reset.settings.catalogEnquiry=structuredClone(current.settings.catalogEnquiry);
  return reset;
}
export type DraftHistory = { past: SiteBuilderProject[]; present: SiteBuilderProject; future: SiteBuilderProject[]; group?: string; time: number };
export const startHistory = (present: SiteBuilderProject): DraftHistory => ({ past:[],present,future:[],time:0 });
export function commitHistory(state: DraftHistory, present: SiteBuilderProject, group?: string, time=Date.now()): DraftHistory {
  const sameGroup = group && group===state.group && time-state.time<900;
  return { past:sameGroup ? state.past : [...state.past,state.present].slice(-50), present, future:[],group,time };
}
export function undoHistory(state: DraftHistory): DraftHistory { return state.past.length ? { past:state.past.slice(0,-1),present:state.past[state.past.length-1],future:[state.present,...state.future].slice(0,50),time:0 } : state; }
export function redoHistory(state: DraftHistory): DraftHistory { return state.future.length ? { past:[...state.past,state.present].slice(-50),present:state.future[0],future:state.future.slice(1),time:0 } : state; }

export function usedAssetIds(project: SiteBuilderProject) {
  const ids = new Set<string>();
  const walk = (value: unknown) => { if (typeof value==='string' && /^asset:\/\/[\w-]+$/.test(value)) ids.add(value.slice(8)); else if(Array.isArray(value)) value.forEach(walk); else if(value && typeof value==='object') Object.values(value).forEach(walk); };
  walk(project.pages); return ids;
}
export function pruneAssetMetadata(project: SiteBuilderProject) {
  const used=usedAssetIds(project); return {...project,assets:project.assets.filter(a=>a.projectId===project.id && used.has(a.id))};
}
