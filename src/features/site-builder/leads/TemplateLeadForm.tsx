import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { SiteBuilderProject } from '../schema/types';
import { getTemplatePackage, type CatalogTemplate } from '../catalog/catalog';
import { prepareLocalSubmission, sendTemplateSubmission } from './client';
import type { TemplateContact, TemplateEnquiry } from './types';
import './leads.css';

export function TemplateLeadForm({project,template,save,flush,onClose}:{project:SiteBuilderProject;template:CatalogTemplate;save:(enquiry:TemplateEnquiry)=>void;flush:()=>Promise<void>;onClose:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const [fields,setFields]=useState<TemplateContact>(()=>project.settings.catalogEnquiry?.fields||{name:'',contact:'',comment:'',budget:'',deadline:''});
  const attempt=useRef(project.settings.catalogEnquiry?.attempt);
  const [consent,setConsent]=useState(false);
  const [busy,setBusy]=useState(false);
  const busyRef=useRef(false);
  const [status,setStatus]=useState('');
  const [error,setError]=useState('');
  const [receipt,setReceipt]=useState('');
  const pack=getTemplatePackage(template);
  useEffect(()=>{dialog.current?.showModal();},[]);
  useEffect(()=>{
    const guard=(event:BeforeUnloadEvent)=>{if(busyRef.current){event.preventDefault();event.returnValue='';}};
    window.addEventListener('beforeunload',guard);
    return ()=>window.removeEventListener('beforeunload',guard);
  },[]);
  function change(key:keyof TemplateContact,value:string) {
    const next={...fields,[key]:value};setFields(next);setError('');
    save({fields:next,attempt:attempt.current});
  }
  async function submit(event:FormEvent) {
    event.preventDefault();if(busyRef.current || !consent)return;
    busyRef.current=true;setBusy(true);setError('');
    try {
      await flush();
      const next=await prepareLocalSubmission(project,fields,attempt.current);
      attempt.current=next;
      save({fields,attempt:next});await flush();
      const result=await sendTemplateSubmission(next,setStatus);
      setReceipt(result.reference);save({fields,attempt:next,receipt:result.reference});
    } catch(e) {setError(e instanceof Error?e.message:'Не удалось отправить. Черновик сохранён.');}
    finally {busyRef.current=false;setBusy(false);setStatus('');}
  }
  return <dialog ref={dialog} className="tl-dialog" aria-labelledby="tl-title" onCancel={e=>{e.preventDefault();if(!busy)onClose();}}>
    <div className="tl-heading"><span>SITEVL · ваш дизайн</span><button type="button" onClick={onClose} disabled={busy} aria-label="Закрыть заявку">✕</button></div>
    <h2 id="tl-title">Хочу сайт на основе этого дизайна</h2>
    {receipt?<section role="status"><h3>Заявка сохранена</h3><p>Номер: <strong>{receipt}</strong>. Владелец сможет открыть ваш проект и фотографии. Черновик остаётся в браузере.</p><button type="button" onClick={onClose}>Вернуться к дизайну</button></section>:<form onSubmit={e=>void submit(e)}>
      <p>{template.name}<br/><strong>{pack?.name} · {pack?.price}</strong></p>
      <p className="tl-note">Стартовая цена — ориентир. Состав работ, окончательную стоимость и сроки согласуем отдельно.</p>
      <fieldset disabled={busy}>
        <label>Ваше имя<input autoFocus autoComplete="name" required maxLength={100} value={fields.name} onChange={e=>change('name',e.target.value)} /></label>
        <label>Один удобный контакт<input autoComplete="off" required minLength={3} maxLength={180} placeholder="Телефон, email или @telegram" value={fields.contact} onChange={e=>change('contact',e.target.value)} /></label>
        <label>Комментарий<textarea rows={3} maxLength={2000} placeholder="Что важно учесть? Название и тексты сайта уже включены в заявку." value={fields.comment} onChange={e=>change('comment',e.target.value)} /></label>
        <div className="tl-optional"><label>Бюджет · необязательно<input maxLength={100} value={fields.budget} onChange={e=>change('budget',e.target.value)} /></label><label>Срок · необязательно<input maxLength={100} value={fields.deadline} onChange={e=>change('deadline',e.target.value)} /></label></div>
        <label className="tl-consent"><input type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)} /><span>Согласен отправить контакт, пожелания, проект и выбранные фотографии владельцу SITEVL для обсуждения заказа. У меня есть право передавать эти изображения. <a href="/privacy" target="_blank" rel="noreferrer">Политика обработки данных</a>.</span></label>
      </fieldset>
      <p className="tl-note">После отправки — закрытое серверное хранение и краткое уведомление владельцу в Telegram. До отправки фотографии остаются в браузере. Обычно данные заявки хранятся 90 дней.</p>
      {error&&<p className="tl-error" role="alert">{error} Ваши настройки и поля формы не удалены.</p>}
      <p role="status" aria-live="polite">{status}</p>
      <button type="submit" className="tl-primary" disabled={busy||!consent}>{busy?'Отправляем…':error?'Повторить отправку':'Отправить проект и заявку'}</button>
    </form>}
  </dialog>;
}
