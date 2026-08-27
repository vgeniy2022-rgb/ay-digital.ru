import { AnimatePresence, motion } from 'framer-motion';
import { Check, Clipboard, Monitor, Send, Smartphone, Tablet } from 'lucide-react';
import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import { HowMade, LabFrame, LabHero, LabSectionHeading } from '../components/lab/LabPrimitives';
import { WebsitePreview, type PreviewDevice } from '../components/lab/WebsitePreview';
import { PageTransition } from '../components/PageTransition';
import { SeoHead } from '../components/SeoHead';
import {
  budgetRecommendations,
  builderBusinesses,
  builderFeatures,
  builderPages,
  complexityLevels,
  defaultBuilderFeatures,
  defaultBuilderPages,
} from '../data/lab';
import {
  calculateWebsitePrice,
  websiteProjectTypeOptions,
  type WebsitePageRangeId,
  type WebsiteProjectTypeId,
} from '../data/websiteCalculator';
import { useSiteData } from '../hooks/useSiteData';

type BuilderMode = 'configuration' | 'budget';

function pageRangeFromCount(count: number): WebsitePageRangeId {
  if (count <= 1) return 'one';
  if (count <= 5) return 'two-five';
  if (count <= 10) return 'six-ten';
  return 'more-ten';
}

function preparedLink(url: string, text: string) {
  return `${url}${url.includes('?') ? '&' : '?'}text=${encodeURIComponent(text)}`;
}

export function WebsiteBuilderPage() {
  const { data } = useSiteData();
  const [mode, setMode] = useState<BuilderMode>('configuration');
  const [businessId, setBusinessId] = useState('specialist');
  const [projectTypeId, setProjectTypeId] = useState<WebsiteProjectTypeId>('business-card');
  const [pages, setPages] = useState(defaultBuilderPages);
  const [features, setFeatures] = useState(defaultBuilderFeatures);
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [budgetId, setBudgetId] = useState('30000');
  const [complexity, setComplexity] = useState(1);
  const [copied, setCopied] = useState(false);

  const business = builderBusinesses.find((item) => item.id === businessId) ?? builderBusinesses[0];
  const projectType = websiteProjectTypeOptions.find((item) => item.id === projectTypeId) ?? websiteProjectTypeOptions[0];
  const effectiveFeatures = useMemo(
    () => Array.from(new Set([...features, ...projectType.includedFeatures])),
    [features, projectType.includedFeatures],
  );
  const calculationFeatureIds = useMemo(
    () => Array.from(new Set(
      builderFeatures
        .filter((item) => effectiveFeatures.includes(item.id) && item.calculationId)
        .map((item) => item.calculationId as string),
    )),
    [effectiveFeatures],
  );
  const calculation = useMemo(
    () => calculateWebsitePrice({
      projectTypeId,
      pageRangeId: pageRangeFromCount(pages.length),
      featureIds: calculationFeatureIds,
    }),
    [calculationFeatureIds, pages.length, projectTypeId],
  );
  const budget = budgetRecommendations.find((item) => item.id === budgetId) ?? budgetRecommendations[0];
  const complexityItem = complexityLevels[complexity - 1];
  const selectedPageLabels = builderPages.filter((item) => pages.includes(item.id)).map((item) => item.label);
  const selectedFeatureLabels = builderFeatures.filter((item) => effectiveFeatures.includes(item.id)).map((item) => item.label);
  const briefText = `Здравствуйте! Собрал конфигурацию в SITEVL Builder. Бизнес: ${business.label}. Тип: ${calculation.projectType.label}. Страницы: ${selectedPageLabels.join(', ') || 'нужно определить'}. Функции: ${selectedFeatureLabels.join(', ') || 'без дополнительных функций'}. Ориентир: ${calculation.display}.`;

  const toggleValue = (value: string, setter: Dispatch<SetStateAction<string[]>>) => {
    setter((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const copyConfiguration = async () => {
    await navigator.clipboard.writeText(briefText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <PageTransition>
      <SeoHead
        title="Website Builder — SITEVL LAB"
        description="Интерактивный конструктор структуры сайта, функций, адаптивного preview и ориентировочной стоимости."
        canonicalPath="/lab/website-builder"
        noindex
      />
      <LabFrame>
        <LabHero
          title="Соберите свой сайт"
          description="Выберите бизнес, страницы и функции. Preview перестроится сразу, а стоимость будет рассчитана по существующему pricing-конфигу SITEVL."
          actions={(
            <>
              <button className="lab-button" type="button" onClick={() => setMode('configuration')}>Начать сборку</button>
              <Link className="lab-button lab-button--secondary" to="/brief">Пройти мини-бриф</Link>
            </>
          )}
        />

        <section className="lab-section">
          <div className="lab-shell">
            <div className="lab-tabs" aria-label="Режим конструктора">
              <button className={mode === 'configuration' ? 'is-active' : ''} type="button" onClick={() => setMode('configuration')}>Собрать конфигурацию</button>
              <button className={mode === 'budget' ? 'is-active' : ''} type="button" onClick={() => setMode('budget')}>Подобрать по бюджету</button>
            </div>

            <AnimatePresence mode="wait">
              {mode === 'configuration' ? (
                <motion.div className="lab-builder" key="configuration" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <form className="lab-builder__controls" onSubmit={(event) => event.preventDefault()}>
                    <label className="lab-control">
                      <span>Бизнес</span>
                      <select value={businessId} onChange={(event) => setBusinessId(event.target.value)}>
                        {builderBusinesses.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
                      </select>
                    </label>

                    <fieldset className="lab-fieldset">
                      <legend>Тип сайта</legend>
                      <div className="lab-choice-grid">
                        {websiteProjectTypeOptions.map((option) => (
                          <label className={`lab-choice ${projectTypeId === option.id ? 'is-selected' : ''}`} key={option.id}>
                            <input type="radio" name="builder-project" checked={projectTypeId === option.id} onChange={() => setProjectTypeId(option.id)} />
                            <i>{projectTypeId === option.id ? <Check /> : null}</i>
                            {option.label}
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <fieldset className="lab-fieldset">
                      <legend>Страницы</legend>
                      <div className="lab-choice-grid lab-choice-grid--three">
                        {builderPages.map((option) => {
                          const selected = pages.includes(option.id);
                          return (
                            <label className={`lab-choice ${selected ? 'is-selected' : ''}`} key={option.id}>
                              <input type="checkbox" checked={selected} onChange={() => toggleValue(option.id, setPages)} />
                              <i>{selected ? <Check /> : null}</i>
                              {option.label}
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>

                    <fieldset className="lab-fieldset">
                      <legend>Возможности</legend>
                      <div className="lab-choice-grid lab-choice-grid--three">
                        {builderFeatures.map((option) => {
                          const selected = effectiveFeatures.includes(option.id);
                          const included = projectType.includedFeatures.includes(option.id);
                          return (
                            <label className={`lab-choice ${selected ? 'is-selected' : ''}`} key={option.id} title={included ? 'Входит в выбранный тип сайта' : undefined}>
                              <input type="checkbox" checked={selected} disabled={included} onChange={() => toggleValue(option.id, setFeatures)} />
                              <i>{selected ? <Check /> : null}</i>
                              {option.label}
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>

                    <div className="lab-price-result" aria-live="polite">
                      <span>Предварительный ориентир</span>
                      <strong>{calculation.display}</strong>
                      <p>{calculation.requiresEstimate ? 'В конфигурации есть сложные функции: перед оценкой нужно уточнить данные, роли и интеграции.' : 'Диапазон меняется вместе с выбранным типом, количеством страниц и функциями.'}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button className="lab-button" type="button" onClick={copyConfiguration}><Clipboard /> {copied ? 'Скопировано' : 'Скопировать конфигурацию'}</button>
                        <a className="lab-button lab-button--secondary" href={preparedLink(data.site.telegramUrl, briefText)} target="_blank" rel="noreferrer"><Send /> Отправить в Telegram</a>
                      </div>
                    </div>
                  </form>

                  <aside className="lab-builder__preview-panel">
                    <div className="lab-builder__preview-toolbar">
                      <span>LIVE PREVIEW</span>
                      <div className="lab-tabs" aria-label="Размер preview">
                        <button className={device === 'desktop' ? 'is-active' : ''} type="button" onClick={() => setDevice('desktop')} aria-label="Desktop"><Monitor /></button>
                        <button className={device === 'tablet' ? 'is-active' : ''} type="button" onClick={() => setDevice('tablet')} aria-label="Tablet"><Tablet /></button>
                        <button className={device === 'mobile' ? 'is-active' : ''} type="button" onClick={() => setDevice('mobile')} aria-label="Mobile"><Smartphone /></button>
                      </div>
                    </div>
                    <div className="lab-device-stage">
                      <WebsitePreview business={business} pages={pages} features={effectiveFeatures} device={device} />
                    </div>
                  </aside>
                </motion.div>
              ) : (
                <motion.div className="mt-10" key="budget" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <LabSectionHeading eyebrow="Обратный расчёт" title="Что можно сделать за мой бюджет?" description="Без обещаний, которые невозможно выполнить: выберите диапазон и посмотрите реалистичную первую версию проекта." />
                  <div className="lab-budget-grid">
                    {budgetRecommendations.map((item) => (
                      <button className={`lab-budget-card ${budgetId === item.id ? 'is-active' : ''}`} type="button" onClick={() => setBudgetId(item.id)} key={item.id}>
                        <strong>{item.label}</strong><span>{item.project}</span>
                      </button>
                    ))}
                  </div>
                  <motion.article className="lab-result-panel mt-4" key={budget.id} initial={{ opacity: 0.5, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="lab-eyebrow">Реалистичный формат</p>
                    <h3 className="mt-3 text-2xl font-extrabold">{budget.project}</h3>
                    <p className="mt-3 max-w-3xl leading-7 text-muted">{budget.description}</p>
                    <div className="mt-5 flex flex-wrap gap-2">{budget.features.map((item) => <span className="rounded-full border border-line bg-white px-3 py-2 text-xs font-bold" key={item}>{item}</span>)}</div>
                    <p className="mt-5 border-t border-line pt-4 text-sm font-semibold text-muted"><strong className="text-ink">Ограничения:</strong> {budget.limits}</p>
                  </motion.article>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <section className="lab-section border-t border-line/70 bg-white/55">
          <div className="lab-shell">
            <LabSectionHeading eyebrow="Website complexity" title="Почему один сайт стоит 5 000 ₽, а другой 70 000 ₽?" description="Цена растёт не из-за количества декоративных блоков, а из-за данных, управления, поиска, ролей и интеграций." />
            <div className="lab-complexity">
              <div className="lab-complexity__levels">
                {complexityLevels.map((item) => (
                  <button className={complexity === item.level ? 'is-active' : ''} type="button" onClick={() => setComplexity(item.level)} key={item.level}>
                    <span>{item.level}</span><strong>{item.title}</strong>
                  </button>
                ))}
              </div>
              <motion.div className="lab-complexity__map" key={complexityItem.title} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}>
                <div className="lab-complexity__map-content">
                  <p className="lab-eyebrow">Уровень {complexityItem.level}</p>
                  <h3>{complexityItem.title}</h3>
                  <p>{complexityItem.description}</p>
                  <div className="lab-complexity__layers">
                    {complexityItem.layers.map((layer, index) => (
                      <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} key={layer}>{layer}</motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
            <HowMade items={[{ label: 'Состояние', value: 'React state' }, { label: 'Цена', value: 'общий pricing config' }, { label: 'Preview', value: 'компоненты без iframe' }, { label: 'Motion', value: 'Framer Motion' }]} />
          </div>
        </section>
      </LabFrame>
    </PageTransition>
  );
}
