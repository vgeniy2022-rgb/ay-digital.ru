import { ArrowUpRight, Check, Database, Layers3, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';
import { studioWebsiteTypes, websitePriceFactors } from '../../data/webStudio';
import { StudioEyebrow, StudioHeading } from './StudioPrimitives';

export function WebsitePricing() {
  return (
    <section className="studio-pricing" id="pricing" data-progress="pricing" aria-labelledby="studio-pricing-title">
      <div className="studio-shell">
        <StudioHeading
          eyebrow="Цены и ценообразование"
          title="Сколько стоит разработка сайта"
          description="Ниже — стартовые ориентиры. Точная стоимость зависит не только от количества страниц, но и от логики, данных, управления контентом и интеграций."
        />

        <div className="studio-pricing__list" data-studio-reveal>
          {studioWebsiteTypes.map((item, index) => (
            <article key={item.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </div>
              <strong>{item.range?.replace('Типичный диапазон: ', '').replace('Ориентир: ', '') || item.price}</strong>
            </article>
          ))}
        </div>

        <div className="studio-pricing__note" data-studio-reveal>
          <div>
            <StudioEyebrow>Важно</StudioEyebrow>
            <h3>Дороже — не значит просто больше страниц</h3>
            <p>
              Каталог с системой управления, поиском, фильтрами, документами и собственными сценариями оценивается отдельно. Цена такого проекта не является стандартной стоимостью любого сайта.
            </p>
          </div>
          <Link to="/prices/websites">Все цены на сайты <ArrowUpRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}

export function PriceComplexityStory() {
  return (
    <section className="studio-cost-story" aria-labelledby="studio-cost-story-title" data-cost-story>
      <div className="studio-cost-story__stage">
        <div className="studio-shell studio-cost-story__inner">
          <div className="studio-cost-story__copy">
            <StudioEyebrow>Из чего складывается цена</StudioEyebrow>
            <h2 id="studio-cost-story-title">Сайт становится системой постепенно</h2>
            <p>Каждая дополнительная функция решает рабочую задачу и добавляет проектирование, разработку и проверку.</p>
            <div className="studio-cost-story__range">
              <span>ориентир проекта</span>
              <strong data-cost-label>от 19 900 ₽</strong>
              <i><b data-cost-meter /></i>
            </div>
          </div>

          <div className="studio-cost-story__visual" aria-label="Схема роста сложности сайта">
            <div className="studio-cost-story__screen">
              <div className="studio-cost-story__screen-bar"><span /><span /><span /><b>SITEVL / PROJECT</b></div>
              <div className="studio-cost-story__screen-content">
                <div className="studio-cost-story__hero-block"><Layers3 aria-hidden="true" /><span>Основная страница</span></div>
                <div className="studio-cost-story__data-block"><Database aria-hidden="true" /><span>Данные и управление</span></div>
                <div className="studio-cost-story__logic-block"><Workflow aria-hidden="true" /><span>Логика и интеграции</span></div>
              </div>
            </div>
            <div className="studio-cost-story__factors">
              {websitePriceFactors.map((factor, index) => (
                <article data-cost-factor={index} key={factor.label}>
                  <Check aria-hidden="true" />
                  <div><h3>{factor.label}</h3><p>{factor.text}</p></div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
