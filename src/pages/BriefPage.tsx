import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Clipboard, RotateCcw, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HowMade, LabFrame, LabHero } from '../components/lab/LabPrimitives';
import { ProjectRoadmap } from '../components/lab/ProjectRoadmap';
import { PageTransition } from '../components/PageTransition';
import { SeoHead } from '../components/SeoHead';
import { builderBusinesses, businessStructures } from '../data/lab';
import { useSiteData } from '../hooks/useSiteData';
import { ensureLabIdentity } from '../features/lab/analytics/labAnalytics';
import { trackVisitorBriefCompleted } from '../features/site-analytics/visitorIntelligence';

type BriefAnswers = {
  projectType: string;
  websitePackage: string;
  mobilePackage: string;
  business: string;
  goal: string;
  catalog: string;
  admin: string;
  leads: string;
  content: string;
  platform: string;
  screens: string;
  appFeatures: string;
  budget: string;
};

type BriefKey = keyof BriefAnswers;
type BriefQuestion = {
  key: BriefKey;
  title: string;
  description: string;
  options: Array<{ value: string; label: string }>;
  multiple?: boolean;
};

const initialAnswers: BriefAnswers = {
  projectType: '', websitePackage: '', mobilePackage: '', business: '', goal: '', catalog: '', admin: '', leads: '', content: '', platform: '', screens: '', appFeatures: '', budget: '',
};

const websitePackages = [
  ['start', 'Сайт для старта', 'от 19 900 ₽'], ['landing', 'Лендинг', 'от 24 900 ₽'], ['managed', 'Система управления', 'от 34 900 ₽'], ['business', 'Бизнес-сайт', 'от 44 900 ₽'], ['catalog', 'Сайт-каталог', 'от 59 900 ₽'], ['store', 'Интернет-магазин', 'от 79 900 ₽'], ['web-service', 'Индивидуальный веб-сервис', 'от 139 900 ₽'], ['unknown', 'Пока не знаю', 'после обсуждения'],
] as const;

const mobilePackages = [
  ['starter-app', 'Приложение для старта', 'от 49 900 ₽'], ['business-app', 'Приложение для бизнеса', 'от 79 900 ₽'], ['server-app', 'Приложение + серверная часть', 'от 119 900 ₽'], ['dual-platform', 'iOS + Android', 'от 149 900 ₽'], ['complex-mobile', 'Сложный мобильный сервис', 'от 199 900 ₽'], ['unknown', 'Пока не знаю', 'после обсуждения'],
] as const;

const budgetOptions = [
  { value: 'under-50', label: 'До 50 000 ₽' }, { value: '50-100', label: '50 000–100 000 ₽' }, { value: '100-200', label: '100 000–200 000 ₽' }, { value: 'over-200', label: 'Более 200 000 ₽' }, { value: 'unknown', label: 'Пока не знаю' },
];

const projectQuestion: BriefQuestion = {
  key: 'projectType', title: 'Какой продукт нужно разработать?', description: 'Brief покажет только вопросы, которые относятся к выбранному направлению.', options: [{ value: 'website', label: 'Сайт' }, { value: 'mobile-app', label: 'Мобильное приложение' }],
};

const websiteQuestions: BriefQuestion[] = [
  { key: 'websitePackage', title: 'Какой формат сайта ближе к задаче?', description: 'Можно выбрать «Пока не знаю» — формат уточним по остальным ответам.', options: websitePackages.map(([value, label]) => ({ value, label })) },
  { key: 'business', title: 'Для какого дела нужен сайт?', description: 'Это помогает предложить подходящую структуру, а не универсальный набор блоков.', options: builderBusinesses.map((item) => ({ value: item.id, label: item.label })) },
  { key: 'goal', title: 'Какую задачу сайт должен решать в первую очередь?', description: 'Выберите главный сценарий. Остальные можно добавить после первой версии.', options: [
    { value: 'presence', label: 'Представить компанию или специалиста' }, { value: 'leads', label: 'Получать обращения и заявки' }, { value: 'promo', label: 'Продвигать одну услугу или предложение' }, { value: 'catalog', label: 'Показывать товары или большой список услуг' }, { value: 'system', label: 'Автоматизировать рабочий процесс' },
  ] },
  { key: 'catalog', title: 'Нужен каталог?', description: 'Каталог влияет на карточки, поиск, фильтры и способ управления содержимым.', options: [{ value: 'yes', label: 'Да, нужен каталог' }, { value: 'no', label: 'Нет, достаточно страниц услуг' }] },
  { key: 'admin', title: 'Хотите менять информацию самостоятельно?', description: 'Система управления полезна, когда цены, услуги, акции, фотографии или товары обновляются регулярно.', options: [{ value: 'yes', label: 'Да, хочу менять содержимое самостоятельно' }, { value: 'no', label: 'Редкие изменения можно передавать разработчику' }] },
  { key: 'leads', title: 'Как клиент будет связываться?', description: 'Можно оставить один канал или собрать несколько способов обращения.', options: [{ value: 'messengers', label: 'Telegram и WhatsApp' }, { value: 'form', label: 'Форма заявки' }, { value: 'both', label: 'Форма и мессенджеры' }, { value: 'none', label: 'Контактов достаточно' }] },
  { key: 'content', title: 'Материалы уже готовы?', description: 'Тексты и фотографии заметно влияют на сроки и объём подготовки.', options: [{ value: 'ready', label: 'Да, всё готово' }, { value: 'partial', label: 'Есть часть материалов' }, { value: 'help', label: 'Нужна помощь со структурой и содержимым' }] },
  { key: 'budget', title: 'Какой бюджет комфортно рассматривать?', description: 'Это ориентир для первой версии, а не обязательство и не финальная смета.', options: budgetOptions },
];

const mobileQuestions: BriefQuestion[] = [
  { key: 'mobilePackage', title: 'Какой формат приложения ближе к задаче?', description: 'Стартовая цена уточняется после обсуждения экранов, логики и интеграций.', options: mobilePackages.map(([value, label]) => ({ value, label })) },
  { key: 'platform', title: 'Для какой платформы нужно приложение?', description: 'Если выбор пока не очевиден, можно определить его после обсуждения аудитории.', options: [{ value: 'ios', label: 'iOS' }, { value: 'android', label: 'Android' }, { value: 'both', label: 'iOS + Android' }, { value: 'unknown', label: 'Пока не знаю' }] },
  { key: 'screens', title: 'Примерное количество экранов', description: 'Учитывайте основные экраны и важные состояния продукта.', options: [{ value: 'up-to-5', label: 'До 5' }, { value: '5-10', label: '5–10' }, { value: '10-20', label: '10–20' }, { value: '20+', label: '20+' }, { value: 'unknown', label: 'Пока не знаю' }] },
  { key: 'appFeatures', title: 'Какие возможности могут понадобиться?', description: 'Можно выбрать несколько вариантов. Это не означает, что все они автоматически войдут в первую версию.', multiple: true, options: [
    { value: 'accounts', label: 'Аккаунты' }, { value: 'server', label: 'Серверная часть' }, { value: 'management', label: 'Система управления' }, { value: 'push', label: 'Push-уведомления' }, { value: 'maps', label: 'Карты' }, { value: 'payments', label: 'Оплата' }, { value: 'other', label: 'Другое' }, { value: 'unknown', label: 'Пока не знаю' },
  ] },
  { key: 'budget', title: 'Какой бюджет комфортно рассматривать?', description: 'Это ориентир для первой версии, а не обязательство и не финальная смета.', options: budgetOptions },
];

const labelFrom = (options: readonly (readonly [string, string, string])[], value: string) => options.find(([id]) => id === value)?.[1] ?? 'Формат уточняется';
const priceFrom = (options: readonly (readonly [string, string, string])[], value: string) => options.find(([id]) => id === value)?.[2] ?? 'после обсуждения';
const selectedValuesFor = (value: string) => value ? value.split(',').filter(Boolean) : [];
const telegramLink = (url: string, text: string) => `${url}${url.includes('?') ? '&' : '?'}text=${encodeURIComponent(text)}`;

export function BriefPage() {
  const { data } = useSiteData();
  const [searchParams] = useSearchParams();
  const [answers, setAnswers] = useState<BriefAnswers>(initialAnswers);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visitorId] = useState(() => ensureLabIdentity(window.localStorage, window.sessionStorage).visitorId);

  useEffect(() => {
    const projectType = searchParams.get('projectType');
    const selectedPackage = searchParams.get('package');
    if (projectType !== 'website' && projectType !== 'mobile-app') return;
    setAnswers((current) => ({ ...current, projectType, websitePackage: projectType === 'website' && selectedPackage ? selectedPackage : current.websitePackage, mobilePackage: projectType === 'mobile-app' && selectedPackage ? selectedPackage : current.mobilePackage }));
  }, [searchParams]);

  const questions = useMemo(() => [projectQuestion, ...(answers.projectType === 'mobile-app' ? mobileQuestions : answers.projectType === 'website' ? websiteQuestions : [])], [answers.projectType]);
  const question = questions[step];
  const selectedValue = question ? answers[question.key] : '';
  const selectedValues = selectedValuesFor(selectedValue);

  const result = useMemo(() => {
    if (answers.projectType === 'mobile-app') {
      const featureOptions = mobileQuestions.find((item) => item.key === 'appFeatures')?.options ?? [];
      return { title: labelFrom(mobilePackages, answers.mobilePackage), description: `Платформа: ${mobileQuestions[1].options.find((item) => item.value === answers.platform)?.label || 'уточняется'}. Экранов: ${mobileQuestions[2].options.find((item) => item.value === answers.screens)?.label || 'уточняется'}.`, structure: featureOptions.filter((item) => selectedValuesFor(answers.appFeatures).includes(item.value)).map((item) => item.label), price: priceFrom(mobilePackages, answers.mobilePackage), budget: budgetOptions.find((item) => item.value === answers.budget)?.label || 'не указан' };
    }
    const business = builderBusinesses.find((item) => item.id === answers.business) ?? builderBusinesses[builderBusinesses.length - 1];
    const structure = businessStructures[business.id];
    return { title: labelFrom(websitePackages, answers.websitePackage), description: `Сайт для направления «${business.label}». ${structure.emphasis}.`, structure: structure.pages, price: priceFrom(websitePackages, answers.websitePackage), budget: budgetOptions.find((item) => item.value === answers.budget)?.label || 'не указан' };
  }, [answers]);

  const summary = `Здравствуйте! Я прошёл Brief SITEVL. Visitor ID: ${visitorId}. Проект: ${result.title}. ${result.description} Основные разделы или возможности: ${result.structure.join(', ') || 'нужно уточнить'}. Стартовый ориентир: ${result.price}. Бюджет: ${result.budget}. Хочу обсудить детали.`;

  const choose = (value: string) => {
    if (!question) return;
    if (question.multiple) { const current = new Set(selectedValues); if (current.has(value)) current.delete(value); else current.add(value); setAnswers((state) => ({ ...state, [question.key]: [...current].join(',') })); return; }
    setAnswers((state) => ({ ...state, [question.key]: value }));
  };
  const next = () => { if (!selectedValue) return; if (step === questions.length - 1) { setCompleted(true); void trackVisitorBriefCompleted(window.localStorage, window.sessionStorage); } else setStep((current) => current + 1); };
  const back = () => { if (completed) setCompleted(false); else setStep((current) => Math.max(0, current - 1)); };
  const reset = () => { setAnswers(initialAnswers); setStep(0); setCompleted(false); setCopied(false); };
  const copy = async () => { try { await navigator.clipboard.writeText(summary); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch (error) { if (import.meta.env.DEV) console.error('[Brief] clipboard error', error); } };

  return (
    <PageTransition>
      <SeoHead title="Brief на разработку сайта или приложения — SITEVL" description="Интерактивный Brief SITEVL для сайта или мобильного приложения: формат, платформа, функции и стартовый ориентир." canonicalPath="/brief" noindex />
      <LabFrame>
        <LabHero eyebrow="SITEVL BRIEF" title="Соберём основу проекта за несколько минут" description="Короткие вопросы без имени, телефона и автоматической отправки данных. В конце вы получите сводку, которую можно отправить Александру." actions={<Link className="lab-button lab-button--secondary" to="/prices">Посмотреть цены</Link>} />
        <section className="lab-section"><div className="lab-shell"><div className="lab-brief-layout"><div className="lab-brief-card">
          {!completed && question ? <>
            <div className="lab-brief-progress"><span>Вопрос {step + 1} из {questions.length}</span><i style={{ '--progress': `${((step + 1) / questions.length) * 100}%` } as React.CSSProperties} /></div>
            <AnimatePresence mode="wait"><motion.div className="lab-brief-question" key={question.key} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}><h2>{question.title}</h2><p>{question.description}</p><div className="lab-brief-options">{question.options.map((option) => { const isSelected = question.multiple ? selectedValues.includes(option.value) : selectedValue === option.value; return <button className={`lab-brief-option ${isSelected ? 'is-selected' : ''}`} type="button" onClick={() => choose(option.value)} key={option.value}>{isSelected ? <Check className="mr-2 inline h-4 w-4" /> : null}{option.label}</button>; })}</div></motion.div></AnimatePresence>
            <div className="lab-brief-actions"><button className="lab-button lab-button--ghost" type="button" onClick={back} disabled={step === 0}><ArrowLeft /> Назад</button><button className="lab-button" type="button" onClick={next} disabled={!selectedValue}>{step === questions.length - 1 ? 'Получить результат' : 'Дальше'} <ArrowRight /></button></div>
          </> : <motion.div className="lab-brief-summary" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}><p className="lab-eyebrow">Предварительный результат</p><h2 className="mt-3 text-3xl font-extrabold">{result.title}</h2><p className="mt-4 leading-7 text-muted">{result.description} Точный состав и цена фиксируются после обсуждения.</p><dl><div><dt>Разделы и возможности</dt><dd>{result.structure.join(' · ') || 'Нужно уточнить'}</dd></div><div><dt>Стартовый ориентир</dt><dd>{result.price}</dd></div><div><dt>Ваш бюджет</dt><dd>{result.budget}</dd></div></dl><div className="mt-6 flex flex-wrap gap-2"><a className="lab-button" href={telegramLink(data.site.telegramUrl, summary)} target="_blank" rel="noreferrer"><Send /> Отправить в Telegram</a><button className="lab-button lab-button--secondary" type="button" onClick={copy}><Clipboard /> {copied ? 'Скопировано' : 'Скопировать'}</button></div><div className="lab-brief-actions"><button className="lab-button lab-button--ghost" type="button" onClick={back}><ArrowLeft /> Изменить ответ</button><button className="lab-button lab-button--ghost" type="button" onClick={reset}><RotateCcw /> Начать заново</button></div></motion.div>}
        </div><aside className="lab-brief-aside"><ProjectRoadmap activeStep={completed ? 1 : 0} /><HowMade items={[{ label: 'Направления', value: 'сайт / приложение' }, { label: 'Расчёт', value: 'стартовый ориентир' }, { label: 'Хранение', value: 'только текущая вкладка' }, { label: 'Отправка', value: 'только по нажатию' }]} /></aside></div></div></section>
      </LabFrame>
    </PageTransition>
  );
}
