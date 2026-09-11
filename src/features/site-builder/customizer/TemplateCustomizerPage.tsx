import { Component, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { studioAssetRepository, studioProjectRepository } from '../persistence/projectRepository';
import type { SiteBuilderProject, StoredStudioAsset } from '../schema/types';
import { DesignFrame } from '../preview/DesignFrame';
import { publishedTemplates, type LoadedCatalogTemplate } from '../catalog/catalog';
import { loadTemplateProject } from '../catalog/projectLoaders';
import { collectDraftAssets, useDraft } from './useDraft';
import { designOf, editProject, enableCustomizer, homePage, movableTypes, moveSection, resetCopy, setItemText, setMainText, setSectionHidden } from './model';
import { applyFont, fontPairs, isHexColor, palettes, selectedFont, themeColors, defaultDesignMode } from './theme';
import './customizer.css';
import { TemplateLeadForm } from '../leads/TemplateLeadForm';

type LoadedDraft = { project: SiteBuilderProject; template: LoadedCatalogTemplate; assets: StoredStudioAsset[] };
const tabs = [{id:'content',name:'Тексты'},{id:'style',name:'Стиль'},{id:'images',name:'Фото'},{id:'services',name:'Услуги'},{id:'sections',name:'Секции'}] as const;
type Tab = typeof tabs[number]['id'];
class CustomizerBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed ? <main className="tc-loading"><h1>Не удалось показать черновик</h1><p>Данные сохранены в этом браузере. Перезагрузите страницу или вернитесь к каталогу.</p><a href="/templates">Каталог</a></main>:this.props.children;}
}
export function TemplateCustomizerPage() {
  const {projectId=''}=useParams();
  return <CustomizerBoundary key={projectId}><DraftLoader projectId={projectId} /></CustomizerBoundary>;
}
function DraftLoader({projectId}:{projectId:string}) {
  const [loaded,setLoaded]=useState<LoadedDraft|null>(null);
  const [error,setError]=useState('');
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    let active=true;let release=()=>{};
    const hold=new Promise<void>(resolve=>{release=resolve;});
    async function load(collect:boolean) {
      const saved=await studioProjectRepository.get(projectId);
      const meta=publishedTemplates.find(t=>t.id===saved?.templateId);
      if(!saved || !meta || saved.settings.catalogCustomizer?.version!==1)throw new Error('Личный черновик не найден в этом браузере. Откройте дизайн из каталога и нажмите «Настроить под себя».');
      const template=await loadTemplateProject(meta);
      designOf(saved);
      const project=(homePage(saved).data.root.props as {useThemeTokens?:boolean}).useThemeTokens?saved:enableCustomizer(saved,template.version);
      const assets=collect?await collectDraftAssets(project):await studioAssetRepository.list(project.id);
      if(project.assets.some(a=>!assets.some(file=>file.id===a.id)))throw new Error('Часть локальных фотографий недоступна. Не очищайте данные браузера; восстановите файлы из резервной копии или создайте новый черновик.');
      if(active)setLoaded({project,template,assets});
    }
    const fail=(e:unknown)=>{if(active)setError(e instanceof Error?e.message:'Не удалось открыть локальное хранилище.');};
    const controller=new AbortController();
    let waiting:ReturnType<typeof setTimeout>|undefined;
    if(navigator.locks) {
      waiting=setTimeout(()=>fail(new Error('Этот черновик уже открыт в другой вкладке. Закройте её: настройщик продолжит загрузку автоматически.')),1500);
      void navigator.locks.request('sitevl-customizer:'+projectId,{signal:controller.signal},async ()=>{
        clearTimeout(waiting);
        if(!active)return;
        try{setError('');await load(true);await hold;}catch(e){fail(e);}
      }).catch(fail);
    } else void load(false).catch(fail);
    return ()=>{active=false;clearTimeout(waiting);controller.abort();release();};
  },[projectId,attempt]);
  if(!loaded)return <main className="tc-loading"><h1>Настройка дизайна</h1><p role={error?'alert':'status'}>{error||'Открываем вашу копию…'}</p>{error&&<button type="button" onClick={()=>{setError('');setAttempt(attempt+1);}}>Повторить</button>}<Link to="/templates">Каталог дизайнов</Link></main>;
  return <DraftWorkspace loaded={loaded} />;
}
function ResetDialog({onCancel,onConfirm}:{onCancel:()=>void;onConfirm:()=>void}) {
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{ref.current?.showModal();},[]);
  return <dialog className="tc-reset-dialog" ref={ref} aria-labelledby="tc-reset-title" onCancel={e=>{e.preventDefault();onCancel();}}>
    <h2 id="tc-reset-title">Вернуть исходный дизайн?</h2><p>Тексты, оформление, фотографии и порядок секций вашей копии вернутся к исходному состоянию. Оригинал и другие проекты не изменятся.</p><p>До перезагрузки сброс можно отменить кнопкой «Отмена» в настройщике.</p><div><button type="button" onClick={onCancel} autoFocus>Продолжить настройку</button><button type="button" className="tc-danger" onClick={onConfirm}>Сбросить мою копию</button></div>
  </dialog>;
}
function TextField({label,value,onChange,max=500,multiline=false}:{label:string;value:string;onChange:(value:string)=>void;max?:number;multiline?:boolean}) {
  const id=useId();
  return <label><span id={id}>{label}</span>{multiline?<textarea aria-labelledby={id} rows={3} maxLength={max} value={value} onChange={e=>onChange(e.target.value)} />:<input aria-labelledby={id} maxLength={max} value={value} onChange={e=>onChange(e.target.value)} />}</label>;
}
function DraftWorkspace({loaded}:{loaded:LoadedDraft}) {
  const draft=useDraft(loaded.project,loaded.assets);
  const project=draft.project,page=homePage(project),content=page.data.content;
  const [tab,setTab]=useState<Tab>('content');
  const [panelOpen,setPanelOpen]=useState(false);
  const [viewport,setViewport]=useState('auto');
  const [fullscreen,setFullscreen]=useState(false);
  const [confirm,setConfirm]=useState(false);
  const [leadOpen,setLeadOpen]=useState(false);
  const hero=content.find(b=>b.type==='DesignHero')!;
  const header=content.find(b=>b.type==='DesignHeader')!;
  const collections=content.filter(b=>b.type==='DesignCollection'&&!['steps','schedule','comparison','gallery'].includes(b.props.layout));
  const [collectionId,setCollectionId]=useState(collections[0]?.props.id||'');
  const collection=collections.find(b=>b.props.id===collectionId)||collections[0];
  const sections=content.filter(b=>movableTypes.has(b.type));
  const design=designOf(project);
  const preferences=project.settings.catalogCustomizer!;
  const palette=preferences.palette||'original';
  const mode=preferences.mode||defaultDesignMode(design);
  const width=fullscreen||viewport==='auto'?'100%':Number(viewport);
  function paletteChange(nextPalette:string,nextMode:'light'|'dark',preserveAccent=false) {
    draft.change(p=>editProject(p,copy=>{
      const colors=themeColors(design,nextPalette,nextMode,copy.theme.colors);
      if(preserveAccent){colors.accent=copy.theme.colors.accent;colors.primary=copy.theme.colors.primary;}
      copy.theme.colors=colors;copy.settings.catalogCustomizer={...copy.settings.catalogCustomizer!,palette:nextPalette,mode:nextMode};
    }));
  }
  const photos=content.flatMap(block=>{
    if(block.type==='DesignHeader')return [{id:block.props.id,field:'logo' as const,title:'Логотип',src:block.props.logo||'',index:undefined as number|undefined}];
    if(block.type==='DesignHero'||block.type==='DesignStory')return [{id:block.props.id,field:'image' as const,title:block.type==='DesignHero'?'Главная фотография':block.props.title,src:block.props.image,index:undefined}];
    if(block.type==='DesignCollection')return block.props.items.flatMap((item:{image?:string;title:string},index:number)=>item.image?[{id:block.props.id,field:'image' as const,title:item.title,src:item.image,index}]:[]);
    return [];
  });
  function restorePhoto(id:string,field:'image'|'logo',index?:number) {
    const original=homePage(loaded.template.project).data.content.find(b=>b.props.id===id);
    draft.change(p=>editProject(p,copy=>{
      const block=homePage(copy).data.content.find(b=>b.props.id===id)!;
      const target=index===undefined?block.props:block.props.items[index];
      const source=index===undefined?original?.props:original?.props.items[index];
      target[field]=source?.[field]||'';
      if(field==='image')target.imageAlt=source?.imageAlt||'Фотография';
    }));
  }
  return <main className={`tc-shell${fullscreen?' is-fullscreen':''}`}>
    <header className="tc-toolbar"><Link to="/templates" aria-disabled={draft.uploading} onClick={e=>{if(draft.uploading){e.preventDefault();return;}if(draft.status!=='saved'){e.preventDefault();void draft.flush().then(()=>{window.location.href='/templates';},()=>{});}}}>← Дизайны</Link><strong>Ваш сайт</strong><span className="tc-save-status" role="status">{draft.uploading?'Обрабатываем фото…':draft.status==='saved'?'Сохранено в браузере':draft.status==='saving'?'Сохраняем…':'Не сохранено'}</span>
      <div className="tc-history"><button type="button" onClick={draft.undo} disabled={!draft.history.past.length||draft.uploading} aria-label="Отмена">↶<span>Отмена</span></button><button type="button" onClick={draft.redo} disabled={!draft.history.future.length||draft.uploading} aria-label="Повтор">↷<span>Повтор</span></button><button type="button" onClick={()=>setConfirm(true)} disabled={draft.uploading}>Сброс</button></div>
    </header>
    <div className="tc-preview-toolbar"><label>Предпросмотр<select aria-label="Размер предпросмотра" value={viewport} disabled={fullscreen} onChange={e=>setViewport(e.target.value)}><option value="auto">По ширине окна</option><option value="1440">Компьютер · 1440</option><option value="768">Планшет · 768</option><option value="390">Телефон · 390</option></select></label><button type="button" aria-pressed={fullscreen} onClick={()=>{setFullscreen(!fullscreen);setPanelOpen(false);}}>{fullscreen?'Вернуться к настройкам':'Весь экран'}</button><button type="button" className="tc-lead-button" disabled={draft.uploading} onClick={()=>setLeadOpen(true)}>Хочу сайт на основе этого дизайна</button></div>
    {draft.error&&<div className="tc-error" role="alert">{draft.error}{draft.status==='error'&&<button type="button" onClick={draft.retry}>Повторить сохранение</button>}</div>}
    <div className="tc-workspace">
      <aside className={`tc-panel${panelOpen?' is-open':''}`} aria-label="Настройки дизайна">
        <div className="tc-panel-heading"><h1>Настроить дизайн</h1><button type="button" className="tc-panel-close" onClick={()=>setPanelOpen(false)} aria-label="Свернуть настройки">Свернуть</button></div>
        <nav className="tc-tabs tc-tabs-desktop" aria-label="Разделы настроек">{tabs.map(t=><button type="button" key={t.id} aria-pressed={tab===t.id} onClick={()=>setTab(t.id)}>{t.name}</button>)}</nav>
        <div className="tc-panel-scroll" onBlurCapture={draft.endGroup}><fieldset disabled={draft.uploading}>
          {tab==='content'&&<><p className="tc-help">Только ваша копия. Тексты сразу появляются на сайте.</p><TextField label="Название компании" value={header.props.brand} max={80} onChange={value=>draft.change(p=>setMainText(p,'brand',value),'brand')} /><TextField label="Главный заголовок" value={hero.props.title} max={180} multiline onChange={value=>draft.change(p=>setMainText(p,'title',value),'title')} /><TextField label="Описание" value={hero.props.text} max={700} multiline onChange={value=>draft.change(p=>setMainText(p,'text',value),'description')} /><TextField label="Текст кнопки" value={hero.props.action} max={60} onChange={value=>draft.change(p=>setMainText(p,'action',value),'action')} /></>}
          {tab==='style'&&<><label>Палитра<select aria-label="Палитра" value={palette} onChange={e=>paletteChange(e.target.value,mode)}>{palettes.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Тема<select aria-label="Тема" value={mode} onChange={e=>paletteChange(palette,e.target.value as 'light'|'dark',true)}><option value="light">Светлая</option><option value="dark">Тёмная</option></select></label><label>Акцентный цвет<div className="tc-color"><input type="color" value={project.theme.colors.accent} onChange={e=>{const value=e.target.value;if(isHexColor(value))draft.change(p=>editProject(p,c=>{c.theme.colors.accent=value;c.theme.colors.primary=value;}),'accent');}} /><code>{project.theme.colors.accent}</code></div></label><label>Сочетание шрифтов<select aria-label="Сочетание шрифтов" value={selectedFont(project.theme).id} onChange={e=>draft.change(p=>({...p,theme:applyFont(p.theme,e.target.value)}))}>{fontPairs.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></label><p className="tc-help">Системные шрифты: ничего не загружается с внешних сервисов.</p><label>Вид кнопок<select aria-label="Вид кнопок" value={project.theme.buttonPreset} onChange={e=>draft.change(p=>editProject(p,c=>{c.theme.buttonPreset=e.target.value as 'solid'|'outline'|'soft';}))}><option value="solid">Заливка</option><option value="outline">Контур</option><option value="soft">Мягкий фон</option></select></label><label>Скругления: {project.theme.radii[3]} px<input type="range" min={0} max={32} step={1} value={project.theme.radii[3]} onChange={e=>draft.change(p=>editProject(p,c=>{c.theme.radii[3]=Number(e.target.value);}), 'radius')} /></label></>}
          {tab==='images'&&<><p className="tc-help">JPG, PNG, WebP, AVIF: до 12 МБ и 32 Мп. Оптимизация до 2200 px. До 20 файлов / 40 МБ с учётом истории. Фотографии остаются на устройстве.</p>{photos.map(photo=><section className="tc-photo-field" key={photo.id+photo.field+photo.index}><h2>{photo.title}</h2>{photo.src&&<img src={photo.src.startsWith('asset://')?draft.urls[photo.src.slice(8)]:photo.src} alt={photo.title} />}<label className="tc-upload">Заменить изображение<input aria-label={`Загрузить: ${photo.title}`} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void draft.upload(file,photo.id,photo.field,photo.index);}} /></label><button type="button" onClick={()=>restorePhoto(photo.id,photo.field,photo.index)}>{photo.field==='logo'?'Убрать логотип':'Исходная фотография'}</button></section>)}</>}
          {tab==='services'&&collection&&<><label>Раздел услуг / товаров<select aria-label="Раздел услуг / товаров" value={collection.props.id} onChange={e=>setCollectionId(e.target.value)}>{collections.map(b=><option key={b.props.id} value={b.props.id}>{b.props.title}</option>)}</select></label><p className="tc-help">Это позиции вашей демо-страницы, не цены услуг SITEVL. Данные никуда не отправляются.</p>{collection.props.items.map((item:{title:string;text:string;price?:string},index:number)=><details className="tc-service-item" key={collection.props.id+index} open={index===0?true:undefined}><summary>{item.title||'Новая услуга'}</summary><TextField label={`Название позиции ${index+1}`} value={item.title} max={100} onChange={value=>draft.change(p=>setItemText(p,collection.props.id,index,'title',value),'item-title-'+index)} /><TextField label={`Описание позиции ${index+1}`} value={item.text} max={500} multiline onChange={value=>draft.change(p=>setItemText(p,collection.props.id,index,'text',value),'item-text-'+index)} /><TextField label={`Цена позиции ${index+1}`} value={item.price||''} max={60} onChange={value=>draft.change(p=>setItemText(p,collection.props.id,index,'price',value),'item-price-'+index)} /><button type="button" disabled={collection.props.items.length<=1} onClick={()=>draft.change(p=>editProject(p,c=>{homePage(c).data.content.find(b=>b.props.id===collection.props.id)!.props.items.splice(index,1);} ))}>Удалить позицию</button></details>)}<button type="button" disabled={collection.props.items.length>=20} onClick={()=>draft.change(p=>editProject(p,c=>{homePage(c).data.content.find(b=>b.props.id===collection.props.id)!.props.items.push({title:'Новая услуга',text:'Описание услуги',price:''});}))}>Добавить позицию</button></>}
          {tab==='sections'&&<><p className="tc-help">Первый экран, меню, контактная форма и подвал закреплены. Остальные секции можно скрывать и переставлять.</p>{sections.map((block,index)=><section className="tc-section-control" key={block.props.id}><label><input type="checkbox" checked={!block.props.hidden} onChange={e=>draft.change(p=>setSectionHidden(p,block.props.id,!e.target.checked))} />{block.props.title}</label><div><button type="button" disabled={index===0} aria-label={`Выше: ${block.props.title}`} onClick={()=>draft.change(p=>moveSection(p,block.props.id,-1))}>↑ Выше</button><button type="button" disabled={index===sections.length-1} aria-label={`Ниже: ${block.props.title}`} onClick={()=>draft.change(p=>moveSection(p,block.props.id,1))}>↓ Ниже</button></div></section>)}</>}
        </fieldset></div>
      </aside>
      <section className="tc-preview" aria-label="Живой предпросмотр"><div className="tc-frame-track"><DesignFrame project={project} page={page} assetUrls={draft.urls} className="tc-frame" style={{width,height:'100%'}} /></div>{viewport!=='auto'&&!fullscreen&&<p className="tc-preview-note">Точная ширина {viewport} px · если экран уже, прокрутите предпросмотр вбок</p>}</section>
    </div>
    {!fullscreen&&<nav className="tc-tabs tc-tabs-mobile" aria-label="Настройки на телефоне">{tabs.map(t=><button type="button" key={t.id} aria-pressed={panelOpen&&tab===t.id} onClick={()=>{setTab(t.id);setPanelOpen(panelOpen&&tab===t.id?false:true);}}>{t.name}</button>)}</nav>}
    {confirm&&<ResetDialog onCancel={()=>setConfirm(false)} onConfirm={()=>{draft.change(p=>resetCopy(p,loaded.template));setConfirm(false);}} />}
    {leadOpen&&<TemplateLeadForm project={project} template={loaded.template} flush={draft.flush} save={enquiry=>draft.change(p=>({...p,settings:{...p.settings,catalogEnquiry:enquiry}}),'enquiry')} onClose={()=>setLeadOpen(false)} />}
  </main>;
}
