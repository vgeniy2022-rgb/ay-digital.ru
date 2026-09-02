import { useState } from 'react';
import type { AiWebsiteConcept, AiWebsiteSection } from './types';

type Props = { concept: AiWebsiteConcept; device: 'desktop' | 'tablet' | 'mobile'; variant: string };

function SectionContent({ section, concept }: { section: AiWebsiteSection; concept: AiWebsiteConcept }) {
  if (section.type === 'services' || section.type === 'catalog' || section.type === 'pricing') {
    return <div className="ai-preview__cards">{concept.services.map((item) => <article key={item.title}><small>{item.meta || 'Направление'}</small><h4>{item.title}</h4><p>{item.text}</p></article>)}</div>;
  }
  if (section.type === 'advantages' || section.type === 'features' || section.type === 'stats') {
    return <div className="ai-preview__features">{concept.features.map((item, index) => <article key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong></article>)}</div>;
  }
  if (section.type === 'process') {
    return <ol className="ai-preview__steps">{['Знакомство и детали', 'Согласование решения', 'Получение результата'].map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol>;
  }
  if (section.type === 'faq') {
    return <div className="ai-preview__faq">{concept.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>;
  }
  if (section.type === 'contacts' || section.type === 'cta' || section.type === 'booking') return <DemoContact concept={concept} />;
  if (section.type === 'footer') return <p className="ai-preview__muted">Концепция не публикует непроверенные реквизиты. Контакты добавляются после согласования.</p>;
  return <div className="ai-preview__about"><p>{section.subtitle || concept.business.offer}</p><strong>{concept.business.audience}</strong></div>;
}

function DemoContact({ concept }: { concept: AiWebsiteConcept }) {
  const [sent, setSent] = useState(false);
  return sent ? <p className="ai-preview__demo-success">Демонстрация: на настоящем сайте здесь будет подтверждение отправки.</p> : (
    <form className="ai-preview__demo-form" onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
      <label>Имя<input aria-label="Имя в демонстрационной форме" placeholder="Как к вам обращаться" /></label>
      <label>Телефон<input aria-label="Телефон в демонстрационной форме" placeholder="+7 900 000-00-00" /></label>
      <button type="submit">{concept.site.cta}</button>
      <small>Демо-форма: данные никуда не отправляются.</small>
    </form>
  );
}

export function AiWebsitePreview({ concept, device, variant }: Props) {
  const style = { '--ai-accent': concept.theme.accent, '--ai-bg': concept.theme.background, '--ai-surface': concept.theme.surface } as React.CSSProperties;
  return (
    <div className={`ai-preview-shell ai-preview-shell--${device}`}>
      <div className={`ai-preview ai-preview--${concept.theme.mode} ai-preview--${variant}`} style={style}>
        <header className="ai-preview__nav"><strong>{concept.business.name}</strong><nav>{concept.sections.filter((item) => item.visible && !['hero', 'footer'].includes(item.type)).slice(0, 4).map((item) => <a key={item.id} href={`#preview-${item.id}`}>{item.title}</a>)}</nav><a className="ai-preview__nav-cta" href="#preview-contacts">Связаться</a></header>
        <main>
          <section className="ai-preview__hero" id="preview-hero"><div><small>{concept.business.type} · {concept.business.city}</small><h2>{concept.site.title}</h2><p>{concept.site.subtitle}</p><div><a href="#preview-contacts">{concept.site.cta}</a><a href="#preview-services" className="secondary">{concept.site.secondaryCta}</a></div></div><aside><span>AI-КОНЦЕПЦИЯ</span><strong>{concept.business.offer}</strong><small>Тексты и факты требуют проверки владельцем.</small></aside></section>
          {concept.sections.filter((section) => section.visible && section.type !== 'hero').map((section) => <section className={`ai-preview__section ai-preview__section--${section.type}`} id={`preview-${section.id}`} key={section.id}><small className="ai-preview__kicker">{section.type}</small><h3>{section.title}</h3>{section.subtitle && <p className="ai-preview__section-lead">{section.subtitle}</p>}<SectionContent section={section} concept={concept} /></section>)}
        </main>
      </div>
    </div>
  );
}
