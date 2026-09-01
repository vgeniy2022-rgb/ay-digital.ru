import { Check, ExternalLink, FileText, Filter, Search, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { impulFeatures } from '../../data/webStudio';
import { StudioEyebrow, StudioTag } from './StudioPrimitives';

function ProductGrid({ compact = false }: { compact?: boolean }) {
  const products = ['Навигация', 'Связь', 'Палубное', 'Документы'];
  return (
    <div className={compact ? 'studio-impul-grid is-compact' : 'studio-impul-grid'}>
      {products.map((product, index) => (
        <div className="studio-impul-product" key={product}>
          <span><b>0{index + 1}</b><FileText aria-hidden="true" /></span>
          <strong>{product}</strong>
          <i />
          <small>PDF · характеристики</small>
        </div>
      ))}
    </div>
  );
}

export function ImpulCase() {
  return (
    <section className="studio-impul" id="projects" data-progress="portfolio" aria-labelledby="studio-catalog-case-title">
      <div className="studio-shell">
        <div className="studio-impul__heading" data-studio-reveal>
          <div>
            <StudioEyebrow>Опубликованный кейс</StudioEyebrow>
            <h2 id="studio-catalog-case-title">Каталог морского оборудования</h2>
          </div>
          <div className="studio-impul__price">
            <span>Формат</span>
            <strong>индивидуальная оценка</strong>
          </div>
        </div>

        <div className="studio-impul__layout">
          <div className="studio-device-stage" data-studio-reveal aria-label="Схематичные макеты каталога морского оборудования на компьютере, планшете и смартфоне" role="img">
            <div className="studio-device studio-device--desktop">
              <div className="studio-device__topbar">
                <strong>MARINE / CATALOG</strong>
                <span><Search aria-hidden="true" /> Поиск</span>
              </div>
              <div className="studio-device__content">
                <aside><i /><i /><i /><i /></aside>
                <ProductGrid />
              </div>
            </div>
            <div className="studio-device studio-device--tablet">
              <div className="studio-device__mobilebar"><strong>CATALOG</strong><Filter aria-hidden="true" /></div>
              <ProductGrid compact />
            </div>
            <div className="studio-device studio-device--phone">
              <div className="studio-device__notch" />
              <div className="studio-device__mobilebar"><strong>CATALOG</strong><Search aria-hidden="true" /></div>
              <ProductGrid compact />
            </div>
            <div className="studio-device studio-device--admin">
              <div className="studio-admin-panel__bar"><Settings2 aria-hidden="true" /><strong>Управление каталогом</strong></div>
              <div className="studio-admin-panel__rows">
                {[0, 1, 2].map((item) => <span key={item}><i /><b /><em>Изменить</em></span>)}
              </div>
            </div>
            <p className="studio-device-stage__caption">Интерфейсный mockup. Реальные скриншоты проекта нужно добавить после подготовки материалов к публикации.</p>
          </div>

          <div className="studio-impul__copy" data-studio-reveal>
            <StudioTag>Каталог · управление · адаптивность</StudioTag>
            <h3>Один сайт может заменить большой PDF-каталог</h3>
            <p>
              В проекте товары собраны в систему с категориями, поиском, фильтрами, документами и управлением контентом. Название клиента и стоимость не публикуются без отдельного подтверждения.
            </p>
            <ul>
              {impulFeatures.map((feature) => (
                <li key={feature}><Check aria-hidden="true" /> {feature}</li>
              ))}
            </ul>
            <div className="studio-impul__links">
              <Link to="/cases/marine-equipment-catalog">Подробнее о реализации <ExternalLink aria-hidden="true" /></Link>
              <span><FileText aria-hidden="true" /> Без выдуманных показателей бизнеса</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
