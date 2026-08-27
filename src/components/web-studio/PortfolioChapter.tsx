import { ArrowUpRight, Code2, Gauge, MonitorSmartphone, Search } from 'lucide-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { websiteTechnologyOutcomes } from '../../data/webStudio';
import { ImpulCase } from './ImpulCase';
import { StudioEyebrow, StudioHeading, StudioTag } from './StudioPrimitives';

export function PortfolioChapter() {
  return (
    <section className="studio-portfolio" id="portfolio" data-progress="portfolio" aria-labelledby="studio-portfolio-title">
      <div className="studio-shell studio-portfolio__intro">
        <StudioHeading
          eyebrow="Портфолио"
          title="Несколько примеров того, какие задачи можно решить внутри одного сайта"
          titleId="studio-portfolio-title"
          description="Здесь показаны только опубликованные проекты без вымышленных результатов, названий клиентов и рекламных процентов."
        />
      </div>

      <ImpulCase />

      <div className="studio-shell studio-sitevl-case">
        <div className="studio-sitevl-case__copy" data-studio-reveal>
          <StudioEyebrow>Личный проект</StudioEyebrow>
          <h2>SITEVL как кейс разработки</h2>
          <p>
            Этот сайт не выдаётся за клиентскую работу. Он показывает, как в одном проекте соединяются коммерческие страницы, техническое SEO, статьи, кейсы, адаптивность и интерактивные компоненты.
          </p>
          <div className="studio-sitevl-case__tags">
            {['React', 'TypeScript', 'SEO', 'prerender', 'адаптивность', 'анимации'].map((item) => <StudioTag key={item}>{item}</StudioTag>)}
          </div>
          <Link to="/cases/ay-digital-personal-website">Открыть кейс SITEVL <ArrowUpRight aria-hidden="true" /></Link>
        </div>

        <div className="studio-sitevl-browser" data-studio-reveal role="img" aria-label="Макет страниц сайта SITEVL на компьютере и телефоне">
          <div className="studio-sitevl-browser__bar"><span /><span /><span /><strong>SITEVL / PORTFOLIO</strong></div>
          <div className="studio-sitevl-browser__page">
            <aside><b>SV</b><i /><i /><i /><i /></aside>
            <div className="studio-sitevl-browser__main">
              <div className="studio-sitevl-browser__hero"><Code2 aria-hidden="true" /><span /><span /></div>
              <div className="studio-sitevl-browser__cards"><i /><i /><i /></div>
              <div className="studio-sitevl-browser__seo"><Search aria-hidden="true" /><span>SEO · sitemap · schema · prerender</span></div>
            </div>
          </div>
          <div className="studio-sitevl-browser__phone"><MonitorSmartphone aria-hidden="true" /><span /><span /><Gauge aria-hidden="true" /></div>
          <div className="studio-sitevl-browser__labels" aria-hidden="true">
            <span>61 SEO-маршрут</span><span>адаптивный UI</span><span>CMS fallback</span>
          </div>
          <p>Концептуальная схема интерфейса, а не скриншот клиентского проекта.</p>
        </div>
      </div>

      <div className="studio-shell studio-technology-grid studio-portfolio__technology">
        {websiteTechnologyOutcomes.map((item, index) => (
          <article data-studio-reveal key={item.label} style={{ '--studio-delay': `${index * 45}ms` } as CSSProperties}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{item.label}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
