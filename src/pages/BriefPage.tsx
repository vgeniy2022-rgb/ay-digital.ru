import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Clipboard, RotateCcw, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HowMade, LabFrame, LabHero } from '../components/lab/LabPrimitives';
import { ProjectRoadmap } from '../components/lab/ProjectRoadmap';
import { PageTransition } from '../components/PageTransition';
import { SeoHead } from '../components/SeoHead';
import { budgetRecommendations, builderBusinesses, businessStructures } from '../data/lab';
import {
  calculateWebsitePrice,
  websiteFeatureOptions,
  websiteProjectTypeOptions,
  type WebsitePageRangeId,
  type WebsiteProjectTypeId,
} from '../data/websiteCalculator';
import { useSiteData } from '../hooks/useSiteData';

type BriefAnswers = {
  business: string;
  goal: string;
  catalog: string;
  admin: string;
  leads: string;
  account: string;
  content: string;
  budget: string;
};

type BriefKey = keyof BriefAnswers;

const initialAnswers: BriefAnswers = {
  business: '',
  goal: '',
  catalog: '',
  admin: '',
  leads: '',
  account: '',
  content: '',
  budget: '',
};

const questions: Array<{
  key: BriefKey;
  title: string;
  description: string;
  options: Array<{ value: string; label: string }>;
}> = [
  {
    key: 'business',
    title: 'Для какого дела нужен сайт?',
    description: 'Это поможет предложить подходящую структуру, а не универсальный набор блоков.',
    options: builderBusinesses.map((item) => ({ value: item.id, label: item.label })),
  },
  {
    key: 'goal',
    title: 'Какую задачу сайт должен решать в первую очередь?',
    description: 'Выберите главный сценарий. Остальные задачи можно добавить после первой версии.',
    options: [
      { value: 'presence', label: 'Понятно представить компанию или специалиста' },
      { value: 'leads', label: 'Получать обращения и заявки' },
      { value: 'promo', label: 'Продвигать одну услугу или предложение' },
      { value: 'catalog', label: 'Показывать товары или большой список услуг' },
      { value: 'system', label: 'Автоматизировать рабочий процесс' },
    ],
  },
  {
    key: 'catalog',
    title: 'Нужен каталог?',
    description: 'Каталог влияет на структуру товаров или услуг, карточки, поиск и способ управления содержимым.',
    options: [{ value: 'yes', label: 'Да, нужен каталог' }, { value: 'no', label: 'Нет, достаточно страниц услуг' }],
  },
  {
    key: 'admin',
    title: 'Хотите менять информацию самостоятельно?',
    description: 'Система управления полезна, когда цены, услуги, акции, фотографии или товары обновляются регулярно.',
    options: [{ value: 'yes', label: 'Да, хочу менять контент самостоятельно' }, { value: 'no', label: 'Редкие изменения можно передавать разработчику' }],
  },
  {
    key: 'leads',
    title: 'Как клиент будет связываться?',
    description: 'Можно оставить один простой канал или собрать несколько способов обращения.',
    options: [
      { value: 'messengers', label: 'Telegram и WhatsApp' },
      { value: 'form', label: 'Форма заявки' },
      { value: 'both', label: 'Форма и мессенджеры' },
      { value: 'none', label: 'Контактов достаточно' },
    ],
  },
  {
    key: 'account',
    title: 'Нужен личный кабинет или роли пользователей?',
    description: 'Это переводит проект из обычного сайта в индивидуальную веб-систему.',
    options: [{ value: 'yes', label: 'Да, нужны пользователи и роли' }, { value: 'no', label: 'Нет, сайт будет публичным' }],
  },
  {
    key: 'content',
    title: 'Материалы для сайта уже готовы?',
    description: 'Тексты и фотографии заметно влияют на сроки и объём подготовки.',
    options: [
      { value: 'ready', label: 'Да, всё готово' },
      { value: 'partial', label: 'Есть часть материалов' },
      { value: 'help', label: 'Нужна помощь со структурой и контентом' },
    ],
  },
  {
    key: 'budget',
    title: 'Какой бюджет комфортно рассматривать?',
    description: 'Это ориентир для первой версии, а не обязательство и не финальная смета.',
    options: budgetRecommendations.map((item) => ({ value: item.id, label: item.label })),
  },
];

function pageRangeFromCount(count: number): WebsitePageRangeId {
  if (count <= 1) return 'one';
  if (count <= 5) return 'two-five';
  if (count <= 10) return 'six-ten';
  return 'more-ten';
}

function getProjectType(answers: BriefAnswers): WebsiteProjectTypeId {
  if (answers.account === 'yes' || answers.goal === 'system') return 'custom';
  if (answers.catalog === 'yes' || answers.goal === 'catalog') return 'catalog';
  if (answers.admin === 'yes') return 'admin';
  if (answers.goal === 'promo') return 'landing';
  if (answers.goal === 'presence') return 'business-card';
  return 'multipage';
}

function getFeatureIds(answers: BriefAnswers) {
  const features = ['seo'];
  if (answers.catalog === 'yes') features.push('catalog', 'search', 'filters');
  if (answers.admin === 'yes') features.push('admin');
  if (answers.account === 'yes') features.push('account', 'database', 'integrations');
  if (answers.leads === 'form' || answers.leads === 'both') features.push('forms');
  if (answers.leads === 'messengers' || answers.leads === 'both') features.push('messengers');
  if (answers.content === 'partial' || answers.content === 'help') features.push('content');
  return Array.from(new Set(features));
}

function telegramLink(url: string, text: string) {
  return `${url}${url.includes('?') ? '&' : '?'}text=${encodeURIComponent(text)}`;
}

const budgetCeilings: Record<string, number | null> = {
  '5000': 5_000,
  '15000': 15_000,
  '30000': 30_000,
  '50000': 50_000,
  '70000': null,
};

export function BriefPage() {
  const { data } = useSiteData();
  const [answers, setAnswers] = useState(initialAnswers);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [copied, setCopied] = useState(false);
  const question = questions[step];
  const selectedValue = question ? answers[question.key] : '';

  const result = useMemo(() => {
    const business = builderBusinesses.find((item) => item.id === answers.business) ?? builderBusinesses[builderBusinesses.length - 1];
    const structure = businessStructures[business.id];
    const projectTypeId = getProjectType(answers);
    const featureIds = getFeatureIds(answers);
    const calculation = calculateWebsitePrice({
      projectTypeId,
      pageRangeId: pageRangeFromCount(structure.pages.length),
      featureIds,
    });
    const projectType = websiteProjectTypeOptions.find((item) => item.id === projectTypeId) ?? websiteProjectTypeOptions[0];
    const featureLabels = websiteFeatureOptions.filter((item) => featureIds.includes(item.id)).map((item) => item.label);
    const budget = budgetRecommendations.find((item) => item.id === answers.budget);
    const budgetCeiling = answers.budget ? budgetCeilings[answers.budget] : null;
    const budgetMismatch = typeof budgetCeiling === 'number' && calculation.min > budgetCeiling;
    return { business, structure, calculation, projectType, featureLabels, budget, budgetMismatch };
  }, [answers]);

  const summary = `Здравствуйте! Я прошёл мини-бриф SITEVL. Проект: ${result.projectType.label} для направления «${result.business.label}». Цель: ${result.structure.emphasis}. Предлагаемая структура: ${result.structure.pages.join(', ')}. Возможности: ${result.featureLabels.join(', ')}. Ориентир по конфигурации: ${result.calculation.display}. Бюджет: ${result.budget?.label || 'не указан'}. Хочу обсудить детали.`;

  const choose = (value: string) => {
    if (!question) return;
    setAnswers((current) => ({ ...current, [question.key]: value }));
  };

  const next = () => {
    if (!selectedValue) return;
    if (step === questions.length - 1) setCompleted(true);
    else setStep((current) => current + 1);
  };

  const back = () => {
    if (completed) setCompleted(false);
    else setStep((current) => Math.max(0, current - 1));
  };

  const reset = () => {
    setAnswers(initialAnswers);
    setStep(0);
    setCompleted(false);
    setCopied(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      if (import.meta.env.DEV) console.error('[Brief] clipboard error', error);
    }
  };

  return (
    <PageTransition>
      <SeoHead title="Мини-бриф на создание сайта — SITEVL" description="Интерактивный мини-бриф SITEVL: задача, структура, функции и ориентировочная стоимость сайта." canonicalPath="/brief" noindex />
      <LabFrame>
        <LabHero
          eyebrow="SITEVL BRIEF"
          title="Соберём основу проекта за несколько минут"
          description="Восемь коротких вопросов без имени, телефона и отправки данных. В конце вы получите структуру и текст, который можно отправить Александру."
          actions={<Link className="lab-button lab-button--secondary" to="/studio">Открыть SITEVL Studio</Link>}
        />

        <section className="lab-section">
          <div className="lab-shell">
            <div className="lab-brief-layout">
              <div className="lab-brief-card">
                {!completed && question ? (
                  <>
                    <div className="lab-brief-progress">
                      <span>Вопрос {step + 1} из {questions.length}</span>
                      <i style={{ '--progress': `${((step + 1) / questions.length) * 100}%` } as React.CSSProperties} />
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div className="lab-brief-question" key={question.key} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                        <h2>{question.title}</h2>
                        <p>{question.description}</p>
                        <div className="lab-brief-options">
                          {question.options.map((option) => (
                            <button className={`lab-brief-option ${selectedValue === option.value ? 'is-selected' : ''}`} type="button" onClick={() => choose(option.value)} key={option.value}>
                              {selectedValue === option.value ? <Check className="mr-2 inline h-4 w-4" aria-hidden="true" /> : null}
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                    <div className="lab-brief-actions">
                      <button className="lab-button lab-button--ghost" type="button" onClick={back} disabled={step === 0}><ArrowLeft /> Назад</button>
                      <button className="lab-button" type="button" onClick={next} disabled={!selectedValue}>{step === questions.length - 1 ? 'Получить результат' : 'Дальше'} <ArrowRight /></button>
                    </div>
                  </>
                ) : (
                  <motion.div className="lab-brief-summary" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="lab-eyebrow">Предварительный результат</p>
                    <h2 className="mt-3 text-3xl font-extrabold">{result.projectType.label} для направления «{result.business.label}»</h2>
                    <p className="mt-4 leading-7 text-muted">Оптимальная первая версия делает акцент на том, чтобы показать {result.structure.emphasis}. Финальная оценка появляется после обсуждения контента, логики и сроков.</p>
                    <dl>
                      <div><dt>Структура</dt><dd>{result.structure.pages.join(' · ')}</dd></div>
                      <div><dt>Возможности</dt><dd>{result.featureLabels.join(' · ')}</dd></div>
                      <div><dt>Ориентир</dt><dd>{result.calculation.display}</dd></div>
                      <div><dt>Ваш бюджет</dt><dd>{result.budget?.label || 'Не выбран'}</dd></div>
                    </dl>
                    {result.budgetMismatch ? (
                      <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
                        Выбранная конфигурация выходит за указанный бюджет. Можно упростить первую версию, убрать часть функций или разбить работу на этапы.
                      </p>
                    ) : null}
                    <div className="mt-6 flex flex-wrap gap-2">
                      <a className="lab-button" href={telegramLink(data.site.telegramUrl, summary)} target="_blank" rel="noreferrer"><Send /> Отправить в Telegram</a>
                      <button className="lab-button lab-button--secondary" type="button" onClick={copy}><Clipboard /> {copied ? 'Скопировано' : 'Скопировать'}</button>
                    </div>
                    <div className="lab-brief-actions">
                      <button className="lab-button lab-button--ghost" type="button" onClick={back}><ArrowLeft /> Изменить ответ</button>
                      <button className="lab-button lab-button--ghost" type="button" onClick={reset}><RotateCcw /> Начать заново</button>
                    </div>
                  </motion.div>
                )}
              </div>

              <aside className="lab-brief-aside">
                <ProjectRoadmap activeStep={completed ? 1 : 0} />
                <HowMade items={[{ label: 'Вопросов', value: '8' }, { label: 'Расчёт', value: 'общий pricing config' }, { label: 'Хранение', value: 'только текущая вкладка' }, { label: 'Отправка', value: 'только по нажатию' }]} />
              </aside>
            </div>
          </div>
        </section>
      </LabFrame>
    </PageTransition>
  );
}
