import assert from 'node:assert/strict';
import test from 'node:test';
import { publishedTemplates, createProjectFromCatalog } from '../catalog/catalog';
import { loadTemplateProject } from '../catalog/projectLoaders';
import { migrateProject } from '../schema/migrations';
import { prepareDesignData } from '../designs/prepareDesignData';
import { enableCustomizer, setMainText, setItemText, homePage, moveSection, setSectionHidden, resetCopy, startHistory, commitHistory, undoHistory, redoHistory, editProject, pruneAssetMetadata, usedAssetIds } from './model';
import { DraftSaveQueue } from './saveQueue';
import { applyFont, customDesignVariables, initialDesignTheme, themeColors, fontPairs, accentTextColor, defaultDesignMode } from './theme';
import { designKeys } from '../designs/types';
import { validateCustomizerImage, detectRasterType, CUSTOMIZER_FILE_LIMIT } from './imageValidation';

async function fixture() {
 const template=await loadTemplateProject(publishedTemplates[0]);
 return {template,project:enableCustomizer(createProjectFromCatalog(template),template.version)};
}
test('all catalog personal copies stay schema v1 and originals stay immutable after edits, theme, hide and reset', async()=>{
 for(const meta of publishedTemplates) {
  const template=await loadTemplateProject(meta),original=structuredClone(template);
  const copy=enableCustomizer(createProjectFromCatalog(template),template.version);
  const block=homePage(copy).data.content.find(b=>b.type==='DesignCollection')!;
  let changed=setMainText(copy,'brand','Моя компания');
  changed=setMainText(changed,'title','Новый заголовок');
  changed=setItemText(changed,block.props.id,0,'price','от 2 000 ₽');
  changed=setSectionHidden(changed,block.props.id,true);
  changed=moveSection(changed,block.props.id,1);
  const restored=migrateProject(changed);
  assert.equal(restored.settings.catalogCustomizer?.version,1);
  assert.equal(restored.schemaVersion,1);
  assert.equal(homePage(restored).data.content.find(b=>b.props.id===block.props.id)?.props.hidden,true);
  assert.equal(homePage(restored).data.content.find(b=>b.props.id===block.props.id)?.props.items[0].price,'от 2 000 ₽');
  const reset=resetCopy(restored,template);
  assert.equal(reset.id,copy.id);assert.equal(reset.activePageId,copy.activePageId);
  assert.equal(reset.createdAt,copy.createdAt);assert.equal(reset.templateId,meta.id);
  assert.equal(homePage(reset).noindex,true);
  assert.deepEqual(homePage(reset).data.content,homePage(template.project).data.content);
  assert.deepEqual(template,original);
 }
});
test('only allowed sections move/hide and renderer removes their navigation, preserving original document',async()=>{
 const {project}=await fixture(),page=homePage(project);
 const header=page.data.content[0],section=page.data.content[2],before=structuredClone(project);
 assert.deepEqual(homePage(moveSection(project,header.props.id,1)).data.content,page.data.content);
 assert.deepEqual(homePage(setSectionHidden(project,header.props.id,true)).data.content,page.data.content);
 const moved=moveSection(project,section.props.id,1);
 assert.equal(homePage(moved).data.content[3].props.id,section.props.id);
 const hidden=setSectionHidden(project,section.props.id,true);
 const rendered=prepareDesignData(homePage(hidden).data);
 assert.equal(rendered.content.some(b=>b.props.id===section.props.id),false);
 assert.equal(rendered.content[0].props.links.some((link:{href:string})=>link.href==='#'+section.props.idAnchor),false);
 assert.equal(rendered.content.find(b=>b.type==='DesignHero')!.props.href,'#contact');
 assert.equal(homePage(hidden).data.content.length,page.data.content.length);
 assert.deepEqual(project,before);
});
test('text limits are enforced; markup remains inert text, not arbitrary CSS or JavaScript',async()=>{
 const {project}=await fixture();
 assert.equal(homePage(setMainText(project,'brand','x'.repeat(100))).data.content[0].props.brand.length,80);
 const title='<script>alert(1)</script>';
 assert.equal(homePage(setMainText(project,'title',title)).data.content[1].props.title,title);
 assert.equal(homePage(setMainText(project,'text','a\0b')).data.content[1].props.text,'ab');
});
test('history coalesces typing, supports redo and reset undo; new edits discard redo and cap history',async()=>{
 const {project,template}=await fixture();
 let state=commitHistory(startHistory(project),setMainText(project,'brand','A'),'brand',1000);
 state=commitHistory(state,setMainText(state.present,'brand','AB'),'brand',1200);
 assert.equal(state.past.length,1);
 assert.deepEqual(undoHistory(state).present,project);
 assert.equal(redoHistory(undoHistory(state)).present.name,'AB');
 const reset=commitHistory(state,resetCopy(state.present,template),undefined,2000);
 assert.equal(undoHistory(reset).present.name,'AB');
 assert.equal(commitHistory(undoHistory(state),setMainText(project,'brand','other')).future.length,0);
 for(let i=0;i<70;i++)state=commitHistory(state,setMainText(state.present,'brand',String(i)),undefined,3000+i);
 assert.equal(state.past.length,50);
});
test('photo references in undo/redo keep immutable asset ids; metadata never contains bytes',async()=>{
 const {project}=await fixture();
 const add=editProject(project,c=>{
  c.assets.push({id:'asset-test',projectId:c.id,name:'photo.webp',type:'image/webp',size:100,width:10,height:10,alt:'Фото',focalPoint:{x:50,y:50},createdAt:'2026-09-11'});
  homePage(c).data.content[1].props.image='asset://asset-test';
 });
 assert.deepEqual([...usedAssetIds(add)],['asset-test']);
 assert.equal(pruneAssetMetadata(add).assets.length,1);
 const state=commitHistory(startHistory(project),add);
 assert.equal(undoHistory(state).present.assets.length,0);
 assert.equal(redoHistory(undoHistory(state)).present.assets[0].id,'asset-test');
 const removed=editProject(add,c=>{homePage(c).data.content[1].props.image='/template-assets/photos/original.webp';});
 assert.equal(pruneAssetMetadata(removed).assets.length,0);
 assert.doesNotMatch(JSON.stringify(add),/data:image|blob:|"blob":/);
});
test('predefined fonts and bounded theme tokens cannot inject CSS and preserve original theme',async()=>{
 const {project}=await fixture(),before=structuredClone(project.theme);
 for(const font of fontPairs){
  const vars=customDesignVariables(applyFont(project.theme,font.id)) as Record<string,string>;
  assert.equal(vars['--d-heading-font'],font.heading);
 }
 const theme=initialDesignTheme(project.theme,'salon');
 theme.colors.accent='url(https://example.test/x)';
 theme.typography.h1='url(https://example.test/font)';
 theme.radii[3]=9000;
 const vars=customDesignVariables(theme) as Record<string,string>;
 assert.equal(vars['--d-accent'],'#3159e7');assert.equal(vars['--d-radius'],'32px');
 assert.doesNotMatch(JSON.stringify(vars),/url\(/);
 const dark=themeColors('salon','ocean','dark',theme.colors),light=themeColors('salon','ocean','light',theme.colors);
 assert.notEqual(dark.background,light.background);assert.notEqual(dark.text,light.text);
 assert.equal(accentTextColor('#ffffff'),'#000000');assert.equal(accentTextColor('#000000'),'#ffffff');
 assert.deepEqual(project.theme,before);
});
test('image headers and MIME validated: reject SVG, renamed images, empty and oversized files',async()=>{
 const png=new Uint8Array([137,80,78,71,13,10,26,10,0,0]);
 assert.equal(detectRasterType(png),'image/png');
 await validateCustomizerImage(new File([png],'photo.png',{type:'image/png'}));
 await assert.rejects(()=>validateCustomizerImage(new File([png],'photo.jpg',{type:'image/jpeg'})),/настоящая/);
 await assert.rejects(()=>validateCustomizerImage(new File(['<svg/>'],'bad.png',{type:'image/png'})),/настоящая/);
 await assert.rejects(()=>validateCustomizerImage(new File([png],'bad.svg',{type:'image/png'})),/настоящая/);
 await assert.rejects(()=>validateCustomizerImage(new File([],'empty.png',{type:'image/png'})),/непустой/);
 await assert.rejects(()=>validateCustomizerImage(new File([new Uint8Array(CUSTOMIZER_FILE_LIMIT+1)],'large.png',{type:'image/png'})),/12 МБ/);
});
test('every design has independent light and dark palettes and a matching initial preference',async()=>{
 const {project}=await fixture();
 for(const design of designKeys) {
  const dark=themeColors(design,'original','dark',project.theme.colors);
  const light=themeColors(design,'original','light',project.theme.colors);
  assert.notEqual(dark.background,light.background,design);
  const initial=initialDesignTheme(project.theme,design);
  assert.deepEqual(initial.colors,defaultDesignMode(design)==='dark'?dark:light);
 }
});
test('autosaves are ordered immutable snapshots, flush waits, failed save remains retryable',async()=>{
 const {project}=await fixture();
 let release=()=>{};const hold=new Promise<void>(r=>{release=r;});const writes:string[]=[];
 const writer=new DraftSaveQueue(async p=>{if(!writes.length)await hold;writes.push(p.name);});
 const a=setMainText(project,'brand','first');const first=writer.write(a);a.name='mutated';
 const second=writer.write(setMainText(project,'brand','second'));
 assert.deepEqual(writes,[]);release();await Promise.all([first,second,writer.flush()]);
 assert.deepEqual(writes,['first','second']);
 let attempt=0;const retry=new DraftSaveQueue(async()=>{if(++attempt===1)throw new Error('quota');});
 await assert.rejects(retry.write(project),/quota/);await retry.write(project);await retry.flush();assert.equal(attempt,2);
});
