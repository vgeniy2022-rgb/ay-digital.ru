import { Calculator, Check, MessageCircle, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  calculateWebsitePrice,
  websiteFeatureOptions,
  websitePageRangeOptions,
  websiteProjectTypeOptions,
  type WebsitePageRangeId,
  type WebsiteProjectTypeId,
} from '../../data/websiteCalculator';
import { StudioButton, StudioHeading } from './StudioPrimitives';

type WebsiteCalculatorProps = {
  telegramUrl: string;
  whatsappUrl: string;
};

function withPreparedText(url: string, text: string) {
  return `${url}${url.includes('?') ? '&' : '?'}text=${encodeURIComponent(text)}`;
}

export function WebsiteCalculator({ telegramUrl, whatsappUrl }: WebsiteCalculatorProps) {
  const [projectTypeId, setProjectTypeId] = useState<WebsiteProjectTypeId>('business-card');
  const [pageRangeId, setPageRangeId] = useState<WebsitePageRangeId>('one');
  const [featureIds, setFeatureIds] = useState<string[]>([]);

  const calculation = useMemo(
    () => calculateWebsitePrice({ projectTypeId, pageRangeId, featureIds }),
    [featureIds, pageRangeId, projectTypeId],
  );

  const preparedText = useMemo(() => {
    const features = calculation.selectedFeatures.length
      ? calculation.selectedFeatures.map((item) => item.label.toLowerCase()).join(', ')
      : 'без дополнительных функций на первом этапе';

    return `Здравствуйте! Хочу обсудить сайт. В калькуляторе выбрал: ${calculation.projectType.label.toLowerCase()}, ${calculation.pageRange.label.toLowerCase()}, ${features}. Предварительный ориентир: ${calculation.display}.`;
  }, [calculation]);

  const toggleFeature = (featureId: string) => {
    setFeatureIds((current) => current.includes(featureId)
      ? current.filter((item) => item !== featureId)
      : [...current, featureId]);
  };

  return (
    <section className="studio-calculator" id="calculator" data-progress="calculator" aria-labelledby="studio-calculator-title">
      <div className="studio-shell">
        <StudioHeading
          eyebrow="Предварительный расчёт"
          title="Прикиньте стоимость своего сайта"
          description="Это не оферта и не окончательная смета. Точная стоимость определяется после обсуждения задачи."
        />

        <div className="studio-calculator__layout">
          <form className="studio-calculator__form" onSubmit={(event) => event.preventDefault()}>
            <fieldset>
              <legend><span>01</span> Тип проекта</legend>
              <div className="studio-calculator__choices studio-calculator__choices--projects">
                {websiteProjectTypeOptions.map((option) => (
                  <label className={projectTypeId === option.id ? 'is-selected' : ''} key={option.id}>
                    <input
                      type="radio"
                      name="website-project-type"
                      value={option.id}
                      checked={projectTypeId === option.id}
                      onChange={() => setProjectTypeId(option.id)}
                    />
                    <span>{option.label}</span>
                    <small>от {new Intl.NumberFormat('ru-RU').format(option.min)} ₽</small>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend><span>02</span> Количество страниц</legend>
              <div className="studio-calculator__choices studio-calculator__choices--pages">
                {websitePageRangeOptions.map((option) => (
                  <label className={pageRangeId === option.id ? 'is-selected' : ''} key={option.id}>
                    <input
                      type="radio"
                      name="website-page-range"
                      value={option.id}
                      checked={pageRangeId === option.id}
                      onChange={() => setPageRangeId(option.id)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend><span>03</span> Дополнительные функции</legend>
              <div className="studio-calculator__choices studio-calculator__choices--features">
                {websiteFeatureOptions.map((option) => {
                  const isSelected = featureIds.includes(option.id);
                  const isIncluded = calculation.projectType.includedFeatures.includes(option.id);

                  return (
                    <label className={isSelected ? 'is-selected' : ''} key={option.id}>
                      <input
                        type="checkbox"
                        value={option.id}
                        checked={isSelected}
                        onChange={() => toggleFeature(option.id)}
                      />
                      <i aria-hidden="true">{isSelected ? <Check /> : null}</i>
                      <span>{option.label}</span>
                      {isIncluded ? <small>уже входит в выбранный тип</small> : null}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </form>

          <aside className="studio-calculator__result" aria-live="polite">
            <div className="studio-calculator__result-icon"><Calculator aria-hidden="true" /></div>
            <span>Предварительный ориентир</span>
            <strong>{calculation.display}</strong>
            <p>
              {calculation.requiresEstimate
                ? 'Выбрано несколько сложных функций. Нужно обсудить данные, сценарии и интеграции, чтобы оценка была честной.'
                : 'Диапазон рассчитан по выбранному типу, количеству страниц и дополнительным функциям.'}
            </p>
            <dl>
              <div><dt>Проект</dt><dd>{calculation.projectType.label}</dd></div>
              <div><dt>Страницы</dt><dd>{calculation.pageRange.label}</dd></div>
              <div><dt>Функции</dt><dd>{calculation.selectedFeatures.length || 'не выбраны'}</dd></div>
            </dl>
            <div className="studio-calculator__prepared">
              <span>Сообщение подготовлено</span>
              <p>{preparedText}</p>
            </div>
            <h3>Хотите точнее?</h3>
            <div className="studio-calculator__actions">
              <StudioButton href="#contacts">Обсудить проект</StudioButton>
              <StudioButton href={withPreparedText(telegramUrl, preparedText)} target="_blank" rel="noreferrer" tone="secondary">
                <Send aria-hidden="true" /> Telegram
              </StudioButton>
              <StudioButton href={withPreparedText(whatsappUrl, preparedText)} target="_blank" rel="noreferrer" tone="secondary">
                <MessageCircle aria-hidden="true" /> WhatsApp
              </StudioButton>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
