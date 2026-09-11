import { useId, useState, type FormEvent } from 'react';
import type { DesignBlockProps } from './types';
import { useDesignImage } from './DesignMedia';
import './designs.css';
import './compositions.css';

const anchor = (href: string) => /^#[a-z][a-z0-9-]*$/.test(href) ? href : '#contact';

function Photo({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  const resolved=useDesignImage(src);
  return resolved ? <img src={resolved} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" /> : null;
}

export function DesignHeader({ brand, descriptor, links, action, logo }: DesignBlockProps['DesignHeader']) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  return <>
    <div className="sv-design-disclaimer">Демонстрационный дизайн <span>Все заявки и покупки — учебные</span></div>
    <header className="sv-design-header" id="top">
      <a className="sv-design-brand" href="#top">{logo && <span className="sv-design-logo"><Photo src={logo} alt={`Логотип ${brand}`} eager /></span>}<span>{brand}<small>{descriptor}</small></span></a>
      <button className="sv-design-menu-button" type="button" aria-expanded={open} aria-controls={menuId} onClick={() => setOpen(!open)}>{open ? 'Закрыть' : 'Меню'}</button>
      <nav id={menuId} className={open ? 'is-open' : ''} aria-label="Меню демонстрационного сайта">{links.map((link) => <a href={anchor(link.href)} key={link.href} onClick={() => setOpen(false)}>{link.label}</a>)}</nav>
      <a className="sv-design-button sv-design-header-action" href="#contact">{action}</a>
    </header>
  </>;
}

export function DesignHero(props: DesignBlockProps['DesignHero']) {
  return <section className={`sv-design-hero${props.variant ? ` sv-design-hero--${props.variant}` : ''}`} aria-labelledby="design-title">
    <div className="sv-design-hero-copy"><span className="sv-design-kicker">{props.eyebrow}</span><h1 id="design-title">{props.title}</h1><p>{props.text}</p>
      <div className="sv-design-actions"><a className="sv-design-button" href={anchor(props.href)}>{props.action}<span aria-hidden="true">↗</span></a><a className="sv-design-text-link" href={anchor(props.secondaryHref)}>{props.secondary}</a></div>
    </div>
    <figure className="sv-design-hero-photo"><Photo src={props.image} alt={props.imageAlt} eager /><figcaption>{props.caption}</figcaption></figure>
  </section>;
}

export function DesignCollection({ idAnchor, eyebrow, title, text, layout, items, filter, action }: DesignBlockProps['DesignCollection']) {
  const [category, setCategory] = useState('Все');
  const [notice, setNotice] = useState('');
  const [comparison, setComparison] = useState(50);
  const categories = ['Все', ...new Set(items.map((item) => item.tag).filter((tag): tag is string => Boolean(tag)))];
  const activeCategory=categories.includes(category)?category:'Все';
  const visible = filter && activeCategory !== 'Все' ? items.filter((item) => item.tag === activeCategory) : items;
  return <section id={idAnchor} className={`sv-design-section sv-design-collection sv-design-collection--${layout}`}>
    <div className="sv-design-section-heading"><div><span className="sv-design-kicker">{eyebrow}</span><h2>{title}</h2></div><p>{text}</p></div>
    {filter && <div className="sv-design-filters" role="group" aria-label={`Фильтр: ${title}`}>{categories.map((tag) => <button type="button" aria-pressed={activeCategory === tag} onClick={() => { setCategory(tag); setNotice(''); }} key={tag}>{tag}</button>)}</div>}
    {layout === 'comparison' && items.length === 2 && <div className="sv-design-comparison">
      <div className="sv-design-comparison-images" aria-label="Иллюстративное сравнение двух состояний">
        <Photo src={items[1].image || ''} alt={items[1].imageAlt || items[1].title} />
        <div className="sv-design-comparison-before" style={{ clipPath: `inset(0 ${100 - comparison}% 0 0)` }}><Photo src={items[0].image || ''} alt={items[0].imageAlt || items[0].title} /></div>
        <span className="sv-design-comparison-line" style={{ left: `${comparison}%` }} aria-hidden="true" />
      </div>
      <label>Сравнить: до / после<input type="range" min="0" max="100" value={comparison} onChange={event => setComparison(Number(event.target.value))} aria-valuetext={`${comparison}% первого изображения`} /></label>
    </div>}
    <div className="sv-design-items">{visible.map((item, index) => <article className="sv-design-item" key={index}>
      {item.image && layout !== 'comparison' && <figure><Photo src={item.image} alt={item.imageAlt || item.title} /></figure>}
      <div className="sv-design-item-body"><span className="sv-design-item-meta">{layout === 'steps' ? String(index + 1).padStart(2, '0') : item.meta || item.tag}</span>
        <h3>{item.title}</h3><p>{item.text}</p>{item.price && <p className="sv-design-item-price">{item.price}</p>}
        {item.detail && <details><summary>{layout === 'products' ? 'Характеристики' : layout === 'schedule' ? 'Подробнее о встрече' : 'Подробнее'}</summary><p>{item.detail}</p></details>}
        {action && <button className="sv-design-text-link" type="button" onClick={() => setNotice(`«${item.title}»: это демонстрация. ${layout === 'products' ? 'Товар не куплен, запрос не отправлен.' : 'Заявка не отправлена, запись не создана.'}`)}>{action}<span aria-hidden="true"> ↗</span></button>}
      </div>
    </article>)}</div>
    <p className="sv-design-notice" role="status" aria-live="polite">{notice}</p>
  </section>;
}

export function DesignStory(props: DesignBlockProps['DesignStory']) {
  return <section id={props.idAnchor} className={`sv-design-section sv-design-story ${props.reverse ? 'sv-design-story--reverse' : ''}`}>
    <figure><Photo src={props.image} alt={props.imageAlt} /><figcaption>{props.caption}</figcaption></figure>
    <div><span className="sv-design-kicker">{props.eyebrow}</span><h2>{props.title}</h2><p>{props.text}</p><ul>{props.points.map((point) => <li key={point.text}>{point.text}</li>)}</ul></div>
  </section>;
}

export function DesignFAQ({ idAnchor, title, items }: DesignBlockProps['DesignFAQ']) {
  return <section className="sv-design-section sv-design-faq" id={idAnchor}><div><span className="sv-design-kicker">Вопросы и ответы</span><h2>{title}</h2></div><div>{items.map((item) => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div></section>;
}

export function DesignContact(props: DesignBlockProps['DesignContact']) {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent) { event.preventDefault(); setSent(true); }
  return <section className="sv-design-section sv-design-contact" id={props.idAnchor}>
    <div><span className="sv-design-kicker">{props.eyebrow}</span><h2>{props.title}</h2><p>{props.text}</p>{props.addressNote && <p className="sv-design-address">{props.addressNote}</p>}</div>
    <form onSubmit={submit} data-demo-form="true" autoComplete="off"><span className="sv-design-form-label">Демонстрационная форма · без отправки</span>
      <label>Что вас интересует<select name="demo-choice" onChange={() => setSent(false)}>{props.options.map((item) => <option key={item.label}>{item.label}</option>)}</select></label>
      {props.formVariant === 'freight' ? <>
        <div className="sv-design-form-row"><label>Откуда (пример)<select name="demo-origin" onChange={() => setSent(false)}>{['Владивосток', 'Хабаровск', 'Уссурийск'].map(value => <option key={value}>{value}</option>)}</select></label><label>Куда (пример)<select name="demo-destination" onChange={() => setSent(false)}>{['Хабаровск', 'Уссурийск', 'Москва'].map(value => <option key={value}>{value}</option>)}</select></label></div>
        <label>Масса, кг (пример)<input name="demo-weight" type="number" min="1" max="50000" step="1" placeholder="Например, 120" onChange={() => setSent(false)} /></label>
        <p className="sv-design-form-label">Это структура запроса, не калькулятор. Стоимость и срок не вычисляются.</p>
      </> : props.formVariant ? <div className="sv-design-form-row"><label>{props.formVariant === 'enrollment' ? 'Удобное начало (пример)' : 'Дата (пример)'}<input type="date" name="demo-date" onChange={() => setSent(false)} /></label><label>{props.formVariant === 'booking' ? 'Гостей' : 'Время'}<select name="demo-slot" onChange={() => setSent(false)}>{(props.formVariant === 'booking' ? ['1–2', '3–4', '5–6'] : ['Утро', 'День', 'Вечер']).map(value => <option key={value}>{value}</option>)}</select></label></div> : null}
      <label>Комментарий для примера<textarea name="demo-comment" maxLength={300} rows={3} placeholder="Не указывайте личные и контактные данные" onChange={() => setSent(false)} /></label>
      <button type="button" className="sv-design-button" onClick={() => setSent(true)}>{props.action}<span aria-hidden="true">↗</span></button>
      <p role="status">{sent ? 'Демонстрация завершена. Данные никуда не отправлены, заказ или запись не созданы.' : 'Ничего не сохраняем. Это пример интерфейса, а не действующий бизнес.'}</p>
    </form>
  </section>;
}

export function DesignFooter({ brand, text, links }: DesignBlockProps['DesignFooter']) {
  return <footer className="sv-design-footer"><a href="#top" className="sv-design-brand">{brand}</a><nav aria-label="Ссылки демонстрации">{links.map((link) => <a key={link.href} href={anchor(link.href)}>{link.label}</a>)}</nav><p>{text}</p><small>Демонстрационный дизайн SITEVL. Не является предложением действующей компании.</small></footer>;
}
