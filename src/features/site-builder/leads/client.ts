import type { SiteBuilderProject } from '../schema/types';
import { studioAssetRepository } from '../persistence/projectRepository';
import { ensureLabIdentity } from '../../lab/analytics/labAnalytics';
import { VISITOR_FIRST_SOURCE_KEY, VISITOR_SESSION_SOURCE_KEY } from '../../site-analytics/visitorIntelligence';
import type { TemplateContact, TemplateEnquiry } from './types';

const sha256 = async (value:BufferSource) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',value)),byte=>byte.toString(16).padStart(2,'0')).join('');
export async function prepareLocalSubmission(project:SiteBuilderProject, fields:TemplateContact, previous?:TemplateEnquiry['attempt']) {
  const copy=structuredClone(project);
  delete copy.settings.catalogEnquiry;
  const assets=await studioAssetRepository.list(project.id);
  const files=copy.assets.map(meta=>assets.find(a=>a.id===meta.id));
  if(files.some(a=>!a))throw new Error('Часть фотографий отсутствует в браузере. Восстановите их в настройщике.');
  if(files.some(a=>a!.blob.size>3*1024*1024))throw new Error('Для отправки фотография должна быть не больше 3 МБ после оптимизации. Замените слишком большой файл; остальные настройки сохранены.');
  const images=await Promise.all(files.map(async a=>({id:a!.id,size:a!.blob.size,type:a!.blob.type,sha256:await sha256(await a!.blob.arrayBuffer())})));
  const base={source:'template-catalog',template:{id:copy.templateId,version:copy.settings.catalogCustomizer!.templateVersion},project:copy,images,contact:{...fields,consent:true}};
  const fingerprint=await sha256(new TextEncoder().encode(JSON.stringify({...base,project:{...copy,updatedAt:copy.createdAt}})));
  if(previous?.fingerprint===fingerprint)return previous;
  let attribution:Record<string,string>={};
  try {
    const identity=ensureLabIdentity(localStorage,sessionStorage);
    attribution={visitorId:identity.visitorId,visitorSessionId:identity.sessionId,sourceTag:sessionStorage.getItem(VISITOR_SESSION_SOURCE_KEY)||localStorage.getItem(VISITOR_FIRST_SOURCE_KEY)||''};
  } catch { /* A visitor can submit without browser analytics storage. */ }
  const id=crypto.randomUUID();
  const key=Array.from(crypto.getRandomValues(new Uint8Array(32)),byte=>byte.toString(16).padStart(2,'0')).join('');
  return {id,key,fingerprint,serialized:JSON.stringify({...base,...attribution,submissionId:id,action:'prepare'})};
}
async function jsonResponse(response:Response) {
  if(!response.headers.get('content-type')?.includes('application/json'))throw new Error('Сервер заявок недоступен. Черновик сохранён; повторите позже.');
  const result=await response.json();
  if(!response.ok)throw new Error(typeof result.error==='string'?result.error:'Не удалось сохранить заявку.');
  return result;
}
export async function sendTemplateSubmission(attempt:NonNullable<TemplateEnquiry['attempt']>, onProgress:(text:string)=>void) {
  const headers={'Content-Type':'application/json','X-Template-Submission-Key':attempt.key};
  const send=(body:string)=>fetch('/api/ai-leads',{method:'POST',headers,body,signal:AbortSignal.timeout(45000)}).then(jsonResponse);
  onProgress('Проверяем заявку…');
  const prepared=await send(attempt.serialized);
  if(prepared.prepared!==true)throw new Error('Сервер не подтвердил подготовку заявки.');
  const body=JSON.parse(attempt.serialized) as {images:{id:string}[]};
  for(let index=0;!prepared.stored && index<body.images.length;index++) {
    const asset=await studioAssetRepository.get(body.images[index].id);
    if(!asset)throw new Error('Локальная фотография недоступна. Черновик сохранён.');
    onProgress(`Сохраняем фото ${index+1} из ${body.images.length}…`);
    const query=new URLSearchParams({source:'template-catalog',action:'upload',submissionId:attempt.id,assetId:asset.id});
    const result=await fetch('/api/ai-leads?'+query,{method:'POST',headers:{'Content-Type':'application/octet-stream','X-Template-Submission-Key':attempt.key},body:asset.blob,signal:AbortSignal.timeout(45000)}).then(jsonResponse);
    if(result.uploaded!==true)throw new Error('Файл не сохранён. Повторите отправку.');
  }
  onProgress('Сохраняем полный проект…');
  const result=await send(JSON.stringify({source:'template-catalog',action:'finalize',submissionId:attempt.id}));
  if(result.stored!==true || typeof result.reference!=='string')throw new Error('Сервер не подтвердил сохранение. Повторите отправку.');
  return result as {stored:true;reference:string;notification?:string;deduplicated?:boolean};
}
