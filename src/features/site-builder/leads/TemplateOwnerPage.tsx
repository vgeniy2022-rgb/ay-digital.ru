import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { DesignFrame } from '../preview/DesignFrame';
import type { StoredStudioAsset } from '../schema/types';
import type { SavedTemplateLead } from './types';
import './leads.css';

export function TemplateOwnerPage() {
  const {leadId=''}=useParams();
  const [key,setKey]=useState('');
  const [lead,setLead]=useState<SavedTemplateLead|null>(null);
  const [assets,setAssets]=useState<StoredStudioAsset[]>([]);
  const [urls,setUrls]=useState<Record<string,string>>({});
  const objectUrls=useRef<string[]>([]);
  const request=useRef<AbortController>();
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>()=>{request.current?.abort();objectUrls.current.forEach(url=>URL.revokeObjectURL(url));},[]);
  function logout() {
    request.current?.abort();objectUrls.current.forEach(url=>URL.revokeObjectURL(url));objectUrls.current=[];
    setKey('');setLead(null);setAssets([]);setUrls({});setError('');
  }
  async function open(event:FormEvent) {
    event.preventDefault();if(busy)return;setBusy(true);setError('');
    const controller=new AbortController();request.current=controller;
    const headers={Authorization:'Bearer '+key};
    const files:StoredStudioAsset[]=[];
    try {
      const response=await fetch('/api/visitor-owner?'+new URLSearchParams({view:'template-lead',leadId}),{headers,signal:controller.signal});
      if(!response.ok)throw new Error(response.status===401?'Неверный ключ владельца.':'Проект недоступен или срок хранения истёк.');
      const saved=await response.json() as SavedTemplateLead;
      if(saved.source!=='template-catalog'||saved.id!==leadId)throw new Error('Некорректный ответ сервера.');
      for(const image of saved.images) {
        const res=await fetch('/api/visitor-owner?'+new URLSearchParams({view:'template-asset',leadId,assetId:image.id}),{headers,signal:controller.signal});
        if(!res.ok)throw new Error('Не удалось получить все фотографии. Предпросмотр не будет выдан за полный.');
        const blob=await res.blob();
        const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())),b=>b.toString(16).padStart(2,'0')).join('');
        if(blob.size!==image.size||hash!==image.sha256)throw new Error('Фотография загружена не полностью. Повторите открытие.');
        files.push({...saved.project.assets.find(a=>a.id===image.id)!,blob});
      }
      controller.signal.throwIfAborted();
      const next=Object.fromEntries(files.map(a=>[a.id,URL.createObjectURL(a.blob)]));
      objectUrls.current=Object.values(next);setUrls(next);setAssets(files);setLead(saved);setKey('');
    } catch(e) { if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Не удалось открыть проект.'); }
    finally{setBusy(false);}
  }
  async function download() {
    if(!lead || busy)return;setBusy(true);setError('');
    try {
      const {createOwnerBundle}=await import('../export/projectExport');
      await createOwnerBundle(lead.project,assets,{...lead.contact,reference:lead.reference,template:lead.template.name,templateVersion:lead.template.version,package:lead.package.name,startingPrice:lead.package.price,source:lead.attribution.source},undefined,
        'Закрытая сохранённая заявка SITEVL. Проект — существующий формат Studio schema v1. project.sitevl.json и assets/ составляют полный пакет. Визуально открыть сохранённый результат можно в защищённом просмотре владельца. Контакты и фотографии не предназначены для публикации.');
    } catch {setError('Не удалось собрать пакет. Проект остаётся открыт.');}finally{setBusy(false);}
  }
  return <main className="tl-owner">
    {!lead?<section className="tl-owner-auth"><h1>Сохранённый дизайн · доступ владельца</h1><p>Заявка не публичная. Введите существующий ключ доступа владельца SITEVL. Он используется только в этой вкладке, не сохраняется и не добавляется в адрес.</p><form onSubmit={e=>void open(e)}><label>Ключ доступа владельца<input type="password" autoComplete="off" value={key} onChange={e=>setKey(e.target.value)} required maxLength={300} /></label><button disabled={busy}>{busy?'Открываем проект…':'Открыть сохранённый проект'}</button></form></section>:<>
      <header><h1>{lead.reference} · {lead.template.name}</h1><button disabled={busy} onClick={()=>void download()}>Скачать полный пакет</button><button onClick={logout}>Закрыть доступ</button></header>
      <details className="tl-owner-details" open><summary>Заявка и условия</summary><p>{lead.contact.name} · {lead.contact.contact}</p><p>{lead.contact.comment || 'Без дополнительных пожеланий'}</p><p>Бюджет: {lead.contact.budget || 'не указан'} · Срок: {lead.contact.deadline || 'не указан'}</p><p>{lead.package.name} · {lead.package.price} на момент отправки (ориентир, не оферта).</p><p>Версия: {lead.template.version} · Источник: {lead.attribution.source || 'не определён'}</p></details>
      <details className="tl-owner-details"><summary>Посетитель и рекламная кампания</summary><p>Visitor: {lead.visitorId || 'не определён'}</p><p>Кампания: {lead.attribution.campaign || lead.attribution.campaignTag || 'не определена'}</p><p>Метка: {lead.attribution.sourceTag || 'не указана'} · Вход: {lead.attribution.entryHost || 'не определён'}</p><p>Основание: {lead.attribution.basis === 'signed-ad-cookie' ? 'подписанная рекламная метка' : lead.attribution.basis === 'visitor-session' ? 'история сессии' : 'источник не подтверждён'}</p></details>
      <DesignFrame className="tl-owner-frame" project={lead.project} page={lead.project.pages[0]} assetUrls={urls} />
    </>}
    {error&&<p role="alert" className="tl-error">{error}</p>}
  </main>;
}
