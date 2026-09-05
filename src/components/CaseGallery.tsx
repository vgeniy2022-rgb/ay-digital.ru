import { useState } from 'react';
import { ArrowDown, ArrowUpRight, Check, Globe2, Smartphone } from 'lucide-react';
import type { CaseGalleryData, CaseScreenshot } from '../data/cases';
import '../styles/case-gallery.css';

export function CaseScreenshotImage({ image, eager = false, sizes = '(max-width: 640px) 90vw, 700px' }: { image: CaseScreenshot; eager?: boolean; sizes?: string }) {
  return <img className="case-screenshot" src={image.src} srcSet={image.srcSet} sizes={sizes} width={image.width} height={image.height} alt={image.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" fetchPriority={eager ? 'high' : 'auto'} />;
}

export function CaseGallery({ gallery }: { gallery: CaseGalleryData }) {
  const [selected, setSelected] = useState(0);
  const screen = gallery.websiteScreens[selected];
  if (!screen) return null;

  return <div className="case-gallery">
    <nav className="case-gallery__nav" aria-label="Разделы галереи кейса">
      <a href="#case-website">01 · Сайт <ArrowDown aria-hidden="true" /></a>
      <a href="#case-app">02 · Мобильное приложение <ArrowDown aria-hidden="true" /></a>
      <a href="#case-screens">03 · Ключевые экраны <ArrowDown aria-hidden="true" /></a>
    </nav>

    <section id="case-website" className="case-gallery__website" aria-labelledby="case-website-title">
      <header className="case-gallery__heading"><span><Globe2 aria-hidden="true" /> САЙТ ШКОЛЫ</span><h2 id="case-website-title">Первое знакомство —<br />{' '}спокойно и по делу</h2><p>Школа объясняет формат встреч, помогает выбрать тему и найти способ связи.</p></header>
      <div className="case-gallery__web-grid">
        <div className="case-gallery__web-preview">
          <div className="case-gallery__switcher" role="group" aria-label="Скриншоты сайта">
            {gallery.websiteScreens.map((image, index) => <button type="button" key={image.id} aria-pressed={selected === index} aria-controls="case-web-image" onClick={() => setSelected(index)}>{image.label}</button>)}
          </div>
          <figure id="case-web-image" className={screen.width < screen.height ? 'is-portrait' : ''}>
            <CaseScreenshotImage image={screen} sizes={screen.width < screen.height ? '390px' : '(max-width: 900px) 90vw, 800px'} />
            <figcaption aria-live="polite">{screen.caption}</figcaption>
          </figure>
        </div>
        <aside><h3>Что есть на сайте</h3><ul>{gallery.websiteFeatures.map((feature) => <li key={feature}><Check aria-hidden="true" /><span>{feature}</span></li>)}</ul><a href={gallery.websiteUrl} target="_blank" rel="noreferrer">Открыть сайт школы <ArrowUpRight aria-hidden="true" /></a><p>Реальные снимки опубликованного сайта. Содержимое может обновляться после съёмки.</p></aside>
      </div>
    </section>

    <section id="case-app" className="case-gallery__app" aria-labelledby="case-app-title">
      <header className="case-gallery__heading"><span><Smartphone aria-hidden="true" /> МОБИЛЬНОЕ ПРИЛОЖЕНИЕ</span><h2 id="case-app-title">Контент школы —<br />{' '}под рукой у администратора</h2><p>Приложение для iPhone — рабочий инструмент владельца, а не учебный кабинет слушателя. Публикации, материалы и служебные проверки разделены по вкладкам.</p></header>
      <div className="case-gallery__features">{gallery.appFeatures.map((feature, index) => <article key={feature.title}><small>0{index + 1}</small><h3>{feature.title}</h3><p>{feature.description}</p></article>)}</div>
    </section>

    <section id="case-screens" aria-labelledby="case-screens-title">
      <header className="case-gallery__heading"><span>КЛЮЧЕВЫЕ ЭКРАНЫ</span><h2 id="case-screens-title">Ключевые экраны<br />{' '}администратора</h2><p>Предоставленные скриншоты приложения. Можно открыть каждый в полном размере; интерфейс не обрезан и не перерисован.</p></header>
      <div className="case-gallery__phones">{gallery.appScreens.map((image, index) => <figure key={image.id}><div className="case-gallery__screen-label"><span>0{index + 1}</span><h3>{image.label}</h3></div><a className="case-gallery__phone" href={image.src} target="_blank" rel="noreferrer" aria-label={`Открыть полный скриншот: ${image.label}`}><CaseScreenshotImage image={image} sizes="(max-width: 640px) 85vw, (max-width: 1100px) 40vw, 340px" /></a><figcaption>{image.caption}<a href={image.src} target="_blank" rel="noreferrer">Открыть скриншот <ArrowUpRight aria-hidden="true" /></a></figcaption></figure>)}</div>
      <details className="case-gallery__evidence"><summary>Об источниках и границах проверки</summary><p>{gallery.evidenceNote}</p></details>
    </section>
  </div>;
}
