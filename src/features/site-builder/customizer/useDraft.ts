import { useEffect, useRef, useState } from 'react';
import { saveStudioProjectWithAssets, studioAssetRepository } from '../persistence/projectRepository';
import { optimizeStudioImage } from '../assets/imageProcessing';
import type { SiteBuilderProject, StoredStudioAsset } from '../schema/types';
import { createStudioId } from '../utils/id';
import { commitHistory, editProject, homePage, pruneAssetMetadata, redoHistory, startHistory, undoHistory, type DraftHistory } from './model';
import { CUSTOMIZER_ASSET_LIMIT, CUSTOMIZER_STORAGE_LIMIT, validateCustomizerImage } from './imageValidation';
import { DraftSaveQueue } from './saveQueue';

export function useDraft(initial: SiteBuilderProject, initialAssets: StoredStudioAsset[]) {
  const [history,setHistory]=useState(()=>startHistory(initial));
  const current=useRef(history);
  const records=useRef(new Map(initialAssets.map(a=>[a.id,a])));
  const unsaved=useRef(new Set<string>());
  const urlRef=useRef<Record<string,string>>({});
  const [urls,setUrls]=useState<Record<string,string>>({});
  const [status,setStatus]=useState<'saved'|'saving'|'error'>('saved');
  const [error,setError]=useState('');
  const [uploading,setUploading]=useState(false);
  const uploadLock=useRef(false);
  const mounted=useRef(true);
  const revision=useRef(0);
  const statusRef=useRef(status); statusRef.current=status;
  const [writer]=useState(()=>new DraftSaveQueue(async project=>{
    const additions=project.assets.filter(a=>unsaved.current.has(a.id)).map(a=>records.current.get(a.id)!).filter(Boolean);
    await saveStudioProjectWithAssets(project,additions);
    additions.forEach(a=>unsaved.current.delete(a.id));
  }));
  useEffect(()=>{
    mounted.current=true;
    const loaded=Object.fromEntries(initialAssets.map(a=>[a.id,URL.createObjectURL(a.blob)]));
    urlRef.current=loaded;setUrls(loaded);
    const guard=(event:BeforeUnloadEvent)=>{if(statusRef.current!=='saved'||uploadLock.current){event.preventDefault();event.returnValue='';}};
    window.addEventListener('beforeunload',guard);
    return ()=>{mounted.current=false;window.removeEventListener('beforeunload',guard);Object.values(urlRef.current).forEach(url=>URL.revokeObjectURL(url));};
  },[initialAssets]);

  function persist(project:SiteBuilderProject) {
    const ticket=++revision.current;statusRef.current='saving';setStatus('saving');setError('');
    return writer.write(project).then(()=>{if(mounted.current&&ticket===revision.current){statusRef.current='saved';setStatus('saved');}},()=>{
      if(mounted.current&&ticket===revision.current){statusRef.current='error';setStatus('error');setError('Не удалось сохранить черновик. Проверьте свободное место и доступ к хранилищу. Изменения остаются на экране — повторите сохранение.');}
    });
  }
  function apply(next:DraftHistory) { current.current=next;setHistory(next);return persist(next.present); }
  function change(update:(project:SiteBuilderProject)=>SiteBuilderProject,group?:string) {
    if(uploadLock.current) return;
    const project=pruneAssetMetadata(update(current.current.present));
    void apply(commitHistory(current.current,project,group));
  }
  function undo(){if(!uploadLock.current&&current.current.past.length)void apply(undoHistory(current.current));}
  function redo(){if(!uploadLock.current&&current.current.future.length)void apply(redoHistory(current.current));}
  function endGroup(){current.current={...current.current,group:undefined};}
  async function upload(file:File,blockId:string,field:'image'|'logo',itemIndex?:number) {
    if(uploadLock.current)return;uploadLock.current=true;setUploading(true);setError('');
    try {
      await validateCustomizerImage(file);
      if(records.current.size>=CUSTOMIZER_ASSET_LIMIT)throw new Error('Лимит — 20 локальных изображений с учётом истории. Сохраните и перезагрузите черновик, чтобы освободить неиспользуемые файлы.');
      const processed=await optimizeStudioImage(file,{maxPixels:32_000_000});
      if([...records.current.values()].reduce((sum,a)=>sum+a.size,0)+processed.blob.size>CUSTOMIZER_STORAGE_LIMIT)throw new Error('Лимит файлов черновика — 40 МБ с учётом истории. Используйте изображения меньшего размера.');
      if(!mounted.current)return;
      const project=current.current.present;
      const asset:StoredStudioAsset={id:createStudioId('asset'),projectId:project.id,name:file.name.replace(/\.[^.]+$/,processed.type==='image/webp'?'.webp':'.png'),type:processed.type,size:processed.blob.size,width:processed.width,height:processed.height,alt:'Изображение владельца сайта',focalPoint:{x:50,y:50},createdAt:new Date().toISOString(),blob:processed.blob};
      records.current.set(asset.id,asset);unsaved.current.add(asset.id);
      urlRef.current={...urlRef.current,[asset.id]:URL.createObjectURL(asset.blob)};setUrls(urlRef.current);
      const {blob,...metadata}=asset;void blob;
      const next=editProject(project,copy=>{
        copy.assets.push(metadata);
        const block=homePage(copy).data.content.find(b=>b.props.id===blockId)!;
        const target=itemIndex===undefined?block.props:block.props.items[itemIndex];
        target[field]=`asset://${asset.id}`;
        if(field==='image')target.imageAlt=metadata.alt;
      });
      await apply(commitHistory(current.current,pruneAssetMetadata(next)));
    } catch(e) {if(mounted.current)setError(e instanceof Error?e.message:'Не удалось обработать изображение.');}
    finally {uploadLock.current=false;if(mounted.current)setUploading(false);}
  }
  async function flush(){await writer.flush();if(statusRef.current==='error')throw new Error('Черновик не сохранён.');}
  return {project:history.present,history,urls,status,error,uploading,change,undo,redo,endGroup,upload,flush,retry:()=>void persist(current.current.present)};
}

/** Only this draft's superseded files are collected, after reload has discarded its undo history. */
export async function collectDraftAssets(project:SiteBuilderProject) {
  const all=await studioAssetRepository.list(project.id);
  const used=new Set(project.assets.map(a=>a.id));
  await Promise.all(all.filter(a=>!used.has(a.id)).map(a=>studioAssetRepository.delete(a.id)));
  return all.filter(a=>used.has(a.id));
}
