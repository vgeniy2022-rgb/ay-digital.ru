import { AnimatePresence, motion } from 'framer-motion';
import { Check, Database, MessageCircle, Search, Settings2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { BuilderBusiness } from '../../data/lab';

export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

type WebsitePreviewProps = {
  business: BuilderBusiness;
  pages: string[];
  features: string[];
  device: PreviewDevice;
};

function PreviewBlock({ id, children }: { id: string; children: ReactNode }) {
  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className={`lab-preview__section lab-preview__section--${id}`}
    >
      {children}
    </motion.section>
  );
}

export function WebsitePreview({ business, pages, features, device }: WebsitePreviewProps) {
  const has = (value: string) => features.includes(value);
  const hasPage = (value: string) => pages.includes(value);
  const showCatalog = hasPage('catalog') || has('catalog');
  const showMessenger = has('telegram') || has('whatsapp');

  return (
    <motion.div className={`lab-device lab-device--${device}`} layout transition={{ type: 'spring', stiffness: 240, damping: 28 }}>
      <div className="lab-device__bar">
        <span /><span /><span />
        <strong>{business.previewTitle.toLowerCase().replace(/\s+/g, '-')}.sitevl.demo</strong>
        {has('admin') ? <i><Settings2 aria-hidden="true" /> управление</i> : null}
      </div>
      <div className="lab-preview">
        <header className="lab-preview__header">
          <strong>{business.previewTitle}</strong>
          <nav aria-label="Навигация демонстрационного сайта">
            {pages.slice(0, device === 'mobile' ? 2 : 5).map((page) => <span key={page}>{page === 'home' ? 'Главная' : page}</span>)}
          </nav>
          {has('search') ? <Search aria-hidden="true" /> : null}
        </header>

        <main>
          <PreviewBlock id="hero">
            <div>
              <small>Владивосток</small>
              <h2>{business.previewSubtitle}</h2>
              <p>Понятное предложение, основные преимущества и следующий шаг для клиента.</p>
              <button type="button">Обсудить задачу</button>
            </div>
            <div className="lab-preview__visual" aria-hidden="true"><span /><span /><span /></div>
          </PreviewBlock>

          <AnimatePresence initial={false}>
            {hasPage('services') ? (
              <PreviewBlock id="services" key="services">
                <h3>Услуги</h3>
                <div className="lab-preview__cards">
                  {['Основное направление', 'Дополнительная услуга', 'Консультация'].map((item) => (
                    <article key={item}><Check aria-hidden="true" /><strong>{item}</strong><small>Короткое объяснение результата</small></article>
                  ))}
                </div>
              </PreviewBlock>
            ) : null}

            {showCatalog ? (
              <PreviewBlock id="catalog" key="catalog">
                <div className="lab-preview__section-head">
                  <h3>Каталог</h3>
                  {has('filters') ? <span><Settings2 aria-hidden="true" /> Фильтры</span> : null}
                </div>
                <div className="lab-preview__products">
                  {[1, 2, 3].map((item) => <article key={item}><i /><strong>Позиция {String(item).padStart(2, '0')}</strong><small>характеристики и цена</small></article>)}
                </div>
              </PreviewBlock>
            ) : null}

            {hasPage('blog') ? (
              <PreviewBlock id="blog" key="blog">
                <h3>Полезные материалы</h3>
                <div className="lab-preview__articles"><span /><span /><span /></div>
              </PreviewBlock>
            ) : null}

            {has('forms') || showMessenger ? (
              <PreviewBlock id="form" key="form">
                <div>
                  <h3>Обсудим задачу?</h3>
                  <p>Контактная форма и удобные каналы связи.</p>
                </div>
                <button type="button"><MessageCircle aria-hidden="true" /> Написать</button>
              </PreviewBlock>
            ) : null}
          </AnimatePresence>
        </main>

        {has('database') || has('api') || has('integrations') ? (
          <footer className="lab-preview__system">
            <Database aria-hidden="true" /> Данные и интеграции подключены к структуре проекта
          </footer>
        ) : null}
      </div>
    </motion.div>
  );
}
