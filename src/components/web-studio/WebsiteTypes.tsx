import { Check, Code2, Database, LayoutDashboard, PanelsTopLeft, Search, ServerCog } from 'lucide-react';
import { Link } from 'react-router-dom';
import { studioWebsiteTypes } from '../../data/webStudio';
import { StudioHeading } from './StudioPrimitives';

const builderLayers = [
  { label: 'Визитка', icon: PanelsTopLeft, modules: ['hero', 'контакты', 'CTA'] },
  { label: 'Лендинг', icon: Check, modules: ['преимущества', 'форма', 'сценарий'] },
  { label: 'Страницы', icon: LayoutDashboard, modules: ['навигация', 'услуги', 'статьи'] },
  { label: 'Админка', icon: Database, modules: ['dashboard', 'контент', 'editor'] },
  { label: 'Каталог', icon: ServerCog, modules: ['категории', 'фильтры', 'PDF'] },
  { label: 'Система', icon: Code2, modules: ['API', 'users', 'интеграции'] },
];

export function WebsiteTypes() {
  return (
    <section className="studio-websites" id="websites" data-progress="websites">
      <div className="studio-complexity-scroll" data-complexity-scroll>
        <div className="studio-complexity-stage">
          <div className="studio-shell studio-complexity-stage__inner">
            <div className="studio-complexity-stage__heading">
              <StudioHeading
                eyebrow="Какие сайты я делаю"
                title="От визитки до веб-сервиса"
                description="Формат определяется задачей бизнеса. Листайте: интерфейс постепенно усложняется вместе с возможностями проекта."
              />
              <div className="studio-complexity-stage__steps" aria-hidden="true">
                {studioWebsiteTypes.map((item, index) => (
                  <span className={index === 0 ? 'is-active' : ''} data-complexity-step={index} key={item.name} />
                ))}
              </div>
            </div>

            <div className="studio-complexity-stage__content">
              <div className="studio-price-stack">
                {studioWebsiteTypes.map((item, index) => (
                  <article className={index === 0 ? 'studio-price-scene is-active' : 'studio-price-scene'} data-price-scene={index} key={item.name}>
                    <div className="studio-price-scene__number">0{index + 1}</div>
                    <h3>{item.name}</h3>
                    <p className="studio-price-scene__price">{item.price}</p>
                    {item.range ? <p className="studio-price-scene__range">{item.range}</p> : null}
                    <p className="studio-price-scene__description">{item.description}</p>
                    <p className="studio-price-scene__audience"><strong>Для:</strong> {item.audience.join(', ')}.</p>
                    <p className="studio-price-scene__list-label">Что обычно входит</p>
                    <ul>
                      {item.features.map((feature) => (
                        <li key={feature}><Check aria-hidden="true" /> {feature}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>

              <div className="studio-interface-builder" aria-label="Как усложняется структура сайта">
                <div className="studio-interface-builder__bar">
                  <span>SITEVL / BUILD</span>
                  <div><Search aria-hidden="true" /><i /></div>
                </div>
                <div className="studio-interface-builder__canvas">
                  {builderLayers.map(({ label, icon: Icon }, index) => (
                    <div className={index === 0 ? 'studio-builder-layer is-active' : 'studio-builder-layer'} data-builder-layer={index} key={label}>
                      <div><Icon aria-hidden="true" /><strong>{label}</strong></div>
                      <span>{builderLayers[index].modules.map((module) => <i key={module}>{module}</i>)}</span>
                    </div>
                  ))}
                </div>
                <div className="studio-interface-builder__footer">
                  <span>уровень сложности</span>
                  <strong data-complexity-label>01 / 06</strong>
                </div>
              </div>
            </div>

            <div className="studio-complexity-stage__note">
              <p>Точная стоимость зависит от задачи. До начала разработки обсуждаем объём проекта и фиксируем, что должно быть реализовано.</p>
              <Link to="/prices/websites">Все цены на сайты</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
