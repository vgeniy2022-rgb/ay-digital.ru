import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Download, Expand, Laptop, LoaderCircle, Monitor, RotateCcw, Send, Smartphone, Sparkles, Tablet, Undo2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { useSiteData } from '../hooks/useSiteData';
import { AiWebsitePreview } from '../features/ai-website/AiWebsitePreview';
import { aiWebsiteStyleLabels, createAiWebsiteConceptId, createAiWebsiteSessionId, recommendAiWebsitePackage, validateAiWebsiteConcept } from '../features/ai-website/schema';
import { aiWebsiteModes, aiWebsiteStyles, type AiWebsiteAnswers, type AiWebsiteConcept, type AiWebsiteContact, type AiWebsiteMode } from '../features/ai-website/types';
import { ensureLabIdentity } from '../features/lab/analytics/labAnalytics';
import { trackAiConceptCreated } from '../features/site-analytics/visitorIntelligence';
import '../styles/ai-website.css';

const emptyAnswers: AiWebsiteAnswers = { business: '', city: '', offer: '', audience: '', services: '', functions: '', style: 'auto', brandColor: '#2563eb', contacts: '', budget: '', deadline: '', existingUrl: '', existingText: '' };
const emptyContact: AiWebsiteContact = { name: '', phone: '', telegram: '', whatsapp: '', email: '', notes: '', consent: false };
const modeLabels: Record<AiWebsiteMode, [string, string]> = { quick: ['Быстрый старт', 'Опишите бизнес одним текстом'], detailed: ['Подробный бриф', 'Ответьте на несколько вопросов'], existing: ['Уже есть сайт', 'Разберите его по предоставленному тексту'] };
const variants = [{ id: 'balanced', name: 'Сбалансированный', note: 'Универсальная композиция' }, { id: 'minimal', name: 'Минимальный', note: 'Больше воздуха и фокуса' }, { id: 'expressive', name: 'Выразительный', note: 'Крупнее акценты и карточки' }];

function buildPrompt(mode: AiWebsiteMode, answers: AiWebsiteAnswers) {
  const parts = [`Режим: ${mode}.`, `Бизнес: ${answers.business}.`, `Город: ${answers.city}.`, `Предложение: ${answers.offer}.`, `Аудитория: ${answers.audience}.`, `Услуги: ${answers.services}.`, `Функции: ${answers.functions}.`, `Стиль: ${answers.style}.`, `Бюджет: ${answers.budget}.`, `Срок: ${answers.deadline}.`];
  if (mode === 'existing') parts.push(`Адрес-справка: ${answers.existingUrl}.`, `Текст существующего сайта, предоставленный пользователем: ${answers.existingText}.`);
  return parts.join('\n').slice(0, 6000);
}

export function AiWebsitePage() {
  const { data } = useSiteData();
  const [mode, setMode] = useState<AiWebsiteMode>('quick');
  const [answers, setAnswers] = useState<AiWebsiteAnswers>(() => { try { return { ...emptyAnswers, ...JSON.parse(localStorage.getItem('sitevl-ai-draft') || '{}') }; } catch { return emptyAnswers; } });
  const [concept, setConcept] = useState<AiWebsiteConcept | null>(() => { try { const saved = JSON.parse(localStorage.getItem('sitevl-ai-concept') || 'null'); return saved ? validateAiWebsiteConcept(saved, 'Восстановленная концепция сайта') : null; } catch { return null; } });
  const [previousConcept, setPreviousConcept] = useState<AiWebsiteConcept | null>(null);
  const [sessionId] = useState(() => sessionStorage.getItem('sitevl-ai-session') || createAiWebsiteSessionId());
  const [conceptId, setConceptId] = useState(() => createAiWebsiteConceptId());
  const [generationCount, setGenerationCount] = useState(() => Number(sessionStorage.getItem('sitevl-ai-count') || 0));
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(concept ? 'ready' : 'idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [variant, setVariant] = useState('balanced');
  const [contact, setContact] = useState(emptyContact);
  const [leadState, setLeadState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => { sessionStorage.setItem('sitevl-ai-session', sessionId); }, [sessionId]);
  useEffect(() => { localStorage.setItem('sitevl-ai-draft', JSON.stringify(answers)); }, [answers]);
  useEffect(() => { if (concept) localStorage.setItem('sitevl-ai-concept', JSON.stringify(concept)); }, [concept]);
  const packageInfo = useMemo(() => concept ? recommendAiWebsitePackage(concept, answers) : null, [concept, answers]);
  const prompt = buildPrompt(mode, answers);
  const canGenerate = answers.business.trim().length >= 2 && answers.offer.trim().length >= 12 && generationCount < 3 && status !== 'loading';

  const update = (key: keyof AiWebsiteAnswers, value: string) => setAnswers((current) => ({ ...current, [key]: value }));
  const mutateConcept = (change: (value: AiWebsiteConcept) => AiWebsiteConcept) => { if (!concept) return; setPreviousConcept(structuredClone(concept)); setConcept(change(structuredClone(concept))); };

  async function generate() {
    if (!canGenerate) return;
    setStatus('loading'); setMessage(''); setProgress(12);
    const timer = window.setInterval(() => setProgress((value) => Math.min(88, value + (value < 45 ? 9 : 3))), 700);
    try {
      const response = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'website-concept', prompt, sessionId, context: { mode, requestedStyle: answers.style, brandColor: answers.brandColor } }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Не удалось создать концепцию.');
      const safeConcept = validateAiWebsiteConcept(payload.concept, prompt, answers);
      const nextConceptId = createAiWebsiteConceptId();
      setPreviousConcept(concept); setConcept(safeConcept); setConceptId(nextConceptId);
      void trackAiConceptCreated(nextConceptId, window.localStorage, window.sessionStorage);
      const nextCount = generationCount + 1; setGenerationCount(nextCount); sessionStorage.setItem('sitevl-ai-count', String(nextCount));
      setProgress(100); setStatus('ready');
      setMessage(payload.fallback ? 'Gemini не вернул валидную схему, поэтому показан безопасный базовый вариант. Его можно отредактировать.' : payload.repaired ? 'Ответ Gemini автоматически исправлен и проверен по безопасной схеме.' : 'Концепция создана Gemini и проверена по безопасной схеме.');
    } catch (error) { setStatus('error'); setMessage(error instanceof Error ? error.message : 'Ошибка генерации. Ответы сохранены — можно повторить.'); }
    finally { window.clearInterval(timer); }
  }

  async function submitLead(event: React.FormEvent) {
    event.preventDefault(); if (!concept || !packageInfo) return;
    setLeadState('sending'); setMessage('');
    const visitor = ensureLabIdentity(window.localStorage, window.sessionStorage);
    const body = { sessionId, visitorId: visitor.visitorId, visitorSessionId: visitor.sessionId, conceptId, source: '/ai-website', originalPrompt: prompt, answers, generatedConcept: concept, selectedVariant: variant, selectedStyle: concept.theme.style, recommendedPackage: packageInfo.name, estimatedStartingPrice: packageInfo.price, budget: answers.budget, deadline: answers.deadline, requiredFeatures: concept.features, contact };
    try {
      const response = await fetch('/api/ai-leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Не удалось отправить заявку.');
      setLeadState('sent'); setMessage(`Заявка сохранена. Номер концепции: ${payload.reference}.`);
    } catch (error) { setLeadState('error'); setMessage(error instanceof Error ? error.message : 'Не удалось отправить заявку.'); }
  }

  function downloadConcept() {
    if (!concept) return; const blob = new Blob([JSON.stringify({ conceptId, concept }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${conceptId}.json`; anchor.click(); URL.revokeObjectURL(url);
  }

  return <PageTransition><main className="ai-website-page">
    <Container><Link className="inline-flex min-h-12 items-center gap-2 py-4 text-sm font-bold text-accent" to="/lab"><Undo2 className="h-4 w-4" aria-hidden="true" /> Вернуться в SITEVL LAB</Link></Container>
    <section className="ai-website-hero"><Container><div className="ai-website-hero__grid"><div><span className="ai-website-eyebrow"><Sparkles /> SITEVL AI · GEMINI</span><h1>Соберите концепцию сайта за несколько минут</h1><p>Опишите бизнес — AI предложит структуру, тексты и визуальное направление. Вы увидите настоящий адаптивный прототип и сможете поправить его до обращения.</p><div className="ai-website-trust"><span><Check /> Без регистрации</span><span><Check /> До 3 вариантов</span><span><Check /> Без фейковых отзывов</span></div></div><aside><strong>Как это работает</strong><ol><li>Расскажите о задаче</li><li>Gemini создаст безопасный JSON-план</li><li>SITEVL отрисует интерактивный прототип</li></ol><small>AI может ошибаться. Проверяйте факты перед публикацией.</small></aside></div></Container></section>
    <Container className="ai-generator">
      <section className="ai-generator__brief">
        <div className="ai-generator__heading"><div><small>ШАГ 1</small><h2>Расскажите о будущем сайте</h2></div><span>{generationCount}/3 генераций</span></div>
        <div className="ai-modes">{aiWebsiteModes.map((item) => <button className={mode === item ? 'active' : ''} key={item} onClick={() => setMode(item)}><strong>{modeLabels[item][0]}</strong><small>{modeLabels[item][1]}</small></button>)}</div>
        {mode === 'existing' && <div className="ai-honesty-note"><strong>Безопасный ручной режим</strong><p>SITEVL не загружает произвольные сайты автоматически: это защищает от SSRF, ограничений robots.txt и ошибочного копирования. Вставьте адрес как справку и добавьте текст/структуру, которую имеете право анализировать.</p></div>}
        <div className="ai-form-grid">
          <label><span>Название или тип бизнеса *</span><input value={answers.business} onChange={(e) => update('business', e.target.value)} maxLength={90} placeholder="Например, семейная стоматология" /></label>
          <label><span>Город</span><input value={answers.city} onChange={(e) => update('city', e.target.value)} maxLength={80} placeholder="Владивосток или онлайн" /></label>
          <label className="wide"><span>Что вы предлагаете и чем полезны клиенту? *</span><textarea value={answers.offer} onChange={(e) => update('offer', e.target.value)} maxLength={1200} placeholder="Опишите услуги, продукт и главное отличие" /></label>
          {(mode === 'detailed' || mode === 'existing') && <><label><span>Целевая аудитория</span><textarea value={answers.audience} onChange={(e) => update('audience', e.target.value)} maxLength={600} /></label><label><span>Услуги или категории</span><textarea value={answers.services} onChange={(e) => update('services', e.target.value)} maxLength={800} /></label><label><span>Нужные функции</span><textarea value={answers.functions} onChange={(e) => update('functions', e.target.value)} maxLength={800} placeholder="Каталог, запись, оплата…" /></label><label><span>Желаемый срок</span><input value={answers.deadline} onChange={(e) => update('deadline', e.target.value)} maxLength={100} /></label><label><span>Ориентир бюджета</span><input value={answers.budget} onChange={(e) => update('budget', e.target.value)} maxLength={100} /></label></>}
          {mode === 'existing' && <><label className="wide"><span>Адрес существующего сайта</span><input type="url" value={answers.existingUrl} onChange={(e) => update('existingUrl', e.target.value)} maxLength={500} placeholder="https://example.ru" /></label><label className="wide"><span>Текст и структура для анализа</span><textarea value={answers.existingText} onChange={(e) => update('existingText', e.target.value)} maxLength={2000} placeholder="Вставьте содержимое, которое вы имеете право использовать" /></label></>}
          <label><span>Стиль</span><select value={answers.style} onChange={(e) => update('style', e.target.value)}><option value="auto">Подобрать автоматически</option>{aiWebsiteStyles.map((item) => <option key={item} value={item}>{aiWebsiteStyleLabels[item]}</option>)}</select></label>
          <label><span>Фирменный акцент</span><div className="ai-color-field"><input type="color" value={answers.brandColor} onChange={(e) => update('brandColor', e.target.value)} /><code>{answers.brandColor}</code></div></label>
        </div>
        <button className="ai-primary-action" disabled={!canGenerate} onClick={generate}>{status === 'loading' ? <><LoaderCircle className="spin" /> Создаём концепцию…</> : <><Sparkles /> {generationCount ? 'Создать ещё вариант' : 'Создать концепцию сайта'}</>}</button>
        {status === 'loading' && <div className="ai-progress"><span style={{ width: `${progress}%` }} /><p>{progress < 40 ? 'Анализируем бизнес и аудиторию…' : progress < 75 ? 'Проектируем структуру и предложение…' : 'Проверяем JSON и собираем прототип…'}</p></div>}
        {message && <p className={`ai-message ai-message--${status === 'error' || leadState === 'error' ? 'error' : 'ok'}`}>{message}</p>}
      </section>

      {concept && <section className="ai-result"><div className="ai-result__top"><div><small>ШАГ 2 · {conceptId}</small><h2>Интерактивная концепция</h2><p>Это прототип, а не опубликованный сайт. Все тексты можно уточнить.</p></div><div className="ai-result__tools"><button title="Отменить последнее изменение" disabled={!previousConcept} onClick={() => { if (previousConcept) { const current = concept; setConcept(previousConcept); setPreviousConcept(current); } }}><Undo2 /></button><button onClick={downloadConcept}><Download /> JSON</button><button onClick={() => previewRef.current?.requestFullscreen()}><Expand /> На весь экран</button></div></div>
        <div className="ai-variants">{variants.map((item) => <button className={variant === item.id ? 'active' : ''} onClick={() => setVariant(item.id)} key={item.id}><span /><strong>{item.name}</strong><small>{item.note}</small></button>)}</div>
        <div className="ai-result__workspace"><aside className="ai-editor"><h3>Быстрые правки</h3><label>Заголовок<textarea value={concept.site.title} onChange={(e) => mutateConcept((value) => ({ ...value, site: { ...value.site, title: e.target.value.slice(0, 150) } }))} /></label><label>Подзаголовок<textarea value={concept.site.subtitle} onChange={(e) => mutateConcept((value) => ({ ...value, site: { ...value.site, subtitle: e.target.value.slice(0, 360) } }))} /></label><label>Текст кнопки<input value={concept.site.cta} onChange={(e) => mutateConcept((value) => ({ ...value, site: { ...value.site, cta: e.target.value.slice(0, 60) } }))} /></label><label>Акцент<input type="color" value={concept.theme.accent} onChange={(e) => mutateConcept((value) => ({ ...value, theme: { ...value.theme, accent: e.target.value } }))} /></label><div className="ai-editor__sections"><strong>Блоки</strong>{concept.sections.map((section, index) => <div key={section.id}><label><input type="checkbox" checked={section.visible} onChange={() => mutateConcept((value) => ({ ...value, sections: value.sections.map((item) => item.id === section.id ? { ...item, visible: !item.visible } : item) }))} />{section.title}</label><button disabled={index === 0} onClick={() => mutateConcept((value) => { const next = [...value.sections]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return { ...value, sections: next }; })}><ArrowUp /></button><button disabled={index === concept.sections.length - 1} onClick={() => mutateConcept((value) => { const next = [...value.sections]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; return { ...value, sections: next }; })}><ArrowDown /></button></div>)}</div></aside>
          <div className="ai-preview-workspace" ref={previewRef}><div className="ai-device-bar"><span><Monitor /> Предпросмотр</span><div><button className={device === 'desktop' ? 'active' : ''} onClick={() => setDevice('desktop')} title="Компьютер"><Laptop /></button><button className={device === 'tablet' ? 'active' : ''} onClick={() => setDevice('tablet')} title="Планшет"><Tablet /></button><button className={device === 'mobile' ? 'active' : ''} onClick={() => setDevice('mobile')} title="Телефон"><Smartphone /></button></div></div><AiWebsitePreview concept={concept} device={device} variant={variant} /></div></div>
        <div className="ai-estimate"><div><small>РЕКОМЕНДАЦИЯ ПО ТЕКУЩЕМУ ПРАЙСУ</small><h3>{packageInfo?.name}</h3><p>Стартовая оценка рассчитывается по типу и функциям сайта, а не придумывается AI.</p></div><strong>{packageInfo?.price}</strong></div>
        <form className="ai-lead" onSubmit={submitLead}><div className="ai-lead__heading"><div><small>ШАГ 3</small><h2>Получить разбор концепции</h2><p>Заявка появится только после того, как вы увидели результат. Укажите любой удобный способ связи.</p></div>{leadState === 'sent' && <span><Check /> Отправлено</span>}</div><div className="ai-form-grid"><label><span>Имя *</span><input required value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} maxLength={100} /></label><label><span>Телефон</span><input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} maxLength={40} /></label><label><span>Telegram</span><input value={contact.telegram} onChange={(e) => setContact({ ...contact, telegram: e.target.value })} maxLength={80} placeholder="@username" /></label><label><span>WhatsApp</span><input value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} maxLength={40} /></label><label className="wide"><span>Email</span><input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} maxLength={160} /></label><label className="wide"><span>Комментарий</span><textarea value={contact.notes} onChange={(e) => setContact({ ...contact, notes: e.target.value })} maxLength={2000} /></label></div><label className="ai-consent"><input type="checkbox" required checked={contact.consent} onChange={(e) => setContact({ ...contact, consent: e.target.checked })} />Согласен с <Link to="/privacy">политикой обработки персональных данных</Link> и передачей текста запроса Gemini для создания концепции.</label><button className="ai-primary-action" disabled={leadState === 'sending' || leadState === 'sent'} type="submit">{leadState === 'sending' ? <><LoaderCircle className="spin" /> Сохраняем…</> : <><Send /> Отправить концепцию SITEVL</>}</button>{leadState === 'error' && <div className="ai-direct-links"><p>Ваш результат сохранён в этом браузере. Можно связаться напрямую:</p><a href={data.site.telegramUrl} target="_blank" rel="noreferrer">Telegram</a><a href={data.site.whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a></div>}</form>
      </section>}
      {!concept && <section className="ai-empty-preview"><RotateCcw /><h2>Здесь появится ваш сайт</h2><p>После генерации можно переключать устройства, раскрывать FAQ, тестировать демо-форму и редактировать блоки — без выполнения произвольного кода.</p></section>}
    </Container>
  </main></PageTransition>;
}
