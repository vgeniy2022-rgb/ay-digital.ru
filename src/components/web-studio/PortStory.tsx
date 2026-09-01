import { Database, FileText, LayoutDashboard, PackageSearch, Search, Ship, Truck } from 'lucide-react';
import { StudioEyebrow } from './StudioPrimitives';

const containers = Array.from({ length: 12 }, (_, index) => ({
  id: index,
  tone: index % 5 === 0 ? 'amber' : index % 3 === 0 ? 'cyan' : 'blue',
}));

export function PortStory() {
  return (
    <section className="studio-port-story" id="port" data-port-scroll>
      <div className="studio-port-stage">
        <div className="studio-port-stage__visual" aria-hidden="true">
          <div className="studio-port-stage__crane studio-port-stage__crane--left"><i data-port-hook /><b /></div>
          <div className="studio-port-stage__crane studio-port-stage__crane--right"><i /><b /></div>
          <div className="studio-port-stage__ship">
            <span className="studio-port-stage__bridge" />
            <div className="studio-container-stack">
              {containers.map((container) => (
                <span className={`studio-container studio-container--${container.tone}`} data-port-container key={container.id} />
              ))}
            </div>
          </div>
          <div className="studio-port-stage__truck" data-port-truck>
            <span /><b /><i /><i />
          </div>
          <div className="studio-port-stage__transfer" data-port-transfer>
            <span>01</span><b>груз</b><i />
          </div>
          <div className="studio-port-stage__water" />
        </div>

        <div className="studio-shell studio-port-stage__content">
          <div className="studio-port-copy" data-port-copy>
            <StudioEyebrow>Логистика превращается в интерфейс</StudioEyebrow>
            <h2>Портовый город</h2>
            <p>
              Товары приезжают, разгружаются, перевозятся, продаются. За каждым таким бизнесом стоят каталог, заявки, контакты, документы и клиенты.
            </p>
            <strong>И всё это можно собрать в одном хорошем сайте.</strong>
            <div className="studio-port-copy__flow" aria-label="Путь от груза к цифровой системе">
              <span><Ship aria-hidden="true" /> Порт</span>
              <i />
              <span><Truck aria-hidden="true" /> Доставка</span>
              <i />
              <span><Database aria-hidden="true" /> Данные</span>
              <i />
              <span><LayoutDashboard aria-hidden="true" /> Интерфейс</span>
            </div>
          </div>

          <div className="studio-catalogue" data-catalogue-mockup aria-label="Макет сайта-каталога">
            <div className="studio-catalogue__bar">
              <span>SITEVL / CATALOG</span>
              <div className="studio-catalogue__search"><Search aria-hidden="true" /><span>Поиск по каталогу</span></div>
            </div>
            <div className="studio-catalogue__layout">
              <aside>
                <strong>Категории</strong>
                <span className="is-active">Оборудование</span>
                <span>Комплектующие</span>
                <span>Документы</span>
                <span>Сервис</span>
              </aside>
              <div className="studio-catalogue__grid">
                {[0, 1, 2, 3].map((item) => (
                  <div className="studio-catalogue__card" key={item}>
                    <div className="studio-catalogue__image"><PackageSearch aria-hidden="true" /></div>
                    <strong>Позиция {String(item + 1).padStart(2, '0')}</strong>
                    <span>Характеристики · документы</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="studio-catalogue__footer">
              <span><FileText aria-hidden="true" /> PDF-документы</span>
              <span className="studio-catalogue__button">Оставить заявку</span>
            </div>
            <div className="studio-catalogue__status" aria-hidden="true">
              <span>каталог</span><span>поиск</span><span>документы</span><span>управление</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
