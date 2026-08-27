import { CarFront, Ship, Smartphone } from 'lucide-react';
import { cityEras } from '../../data/webStudio';
import { StudioEyebrow, StudioTag } from './StudioPrimitives';

function EraIcon({ index }: { index: number }) {
  if (index === 0) return <Ship aria-hidden="true" />;
  if (index === 2) return <Smartphone aria-hidden="true" />;
  return <CarFront aria-hidden="true" />;
}

export function CityTimeline() {
  const openingEra = cityEras[0];

  return (
    <section className="studio-city-story" id="city">
      <div className="studio-city-intro studio-shell">
        <div className="studio-city-intro__copy" data-studio-reveal>
          <StudioEyebrow>Город как часть студии</StudioEyebrow>
          <h2>Здесь я живу и работаю</h2>
          <p>
            Владивосток формирует характер проектов: скорость, Азия рядом, порт, техника, автомобили и постоянное движение.
          </p>
        </div>
        <div className="studio-city-intro__coordinates" data-studio-reveal>
          <span><b>43.1155° N</b> широта</span>
          <span><b>131.8855° E</b> долгота</span>
          <strong>Владивосток · UTC+10</strong>
        </div>
      </div>

      <div className="studio-era-scroll" data-era-scroll>
        <div className="studio-era-stage">
          <div className="studio-city-cinematic" data-city-cinematic>
            <div className="studio-city-cinematic__mobile-copy">
              <p className="studio-era__year">{openingEra.year}</p>
              <StudioEyebrow>{openingEra.eyebrow}</StudioEyebrow>
              <h3>{openingEra.title}</h3>
              <p className="studio-era__text">{openingEra.text}</p>
              <div className="studio-era__tags">
                {openingEra.details.map((detail) => <StudioTag key={detail}>{detail}</StudioTag>)}
              </div>
            </div>

            <div className="studio-city-cinematic__frame">
              <picture className="studio-city-cinematic__picture">
                <source srcSet="/images/web-studio/vladivostok-jdm-night.avif" type="image/avif" />
                <source srcSet="/images/web-studio/vladivostok-jdm-night.webp" type="image/webp" />
                <img
                  src="/images/web-studio/vladivostok-jdm-night.webp"
                  alt="Ночной Владивосток: автомобили на мокрой трассе, порт и мост через бухту"
                  width="1672"
                  height="941"
                  loading="lazy"
                  decoding="async"
                  data-city-cinematic-image
                />
              </picture>

              <span className="studio-city-cinematic__dim" data-city-cinematic-dim aria-hidden="true" />
              <span className="studio-city-cinematic__reflection studio-city-cinematic__reflection--one" data-city-reflection aria-hidden="true" />
              <span className="studio-city-cinematic__reflection studio-city-cinematic__reflection--two" data-city-reflection aria-hidden="true" />

              <div className="studio-city-route-transition" data-city-route-transition aria-hidden="true">
                <span /><span /><span /><span />
              </div>
            </div>
          </div>

          <div className="studio-era-stage__years" aria-label="Владивосток с 2000-х до настоящего времени">
            {cityEras.map((era, index) => (
              <article className={`studio-era studio-era--${era.accent} ${index === 0 ? 'is-active' : ''}`} data-era={index} key={era.year}>
                <div className="studio-era__icon"><EraIcon index={index} /></div>
                <p className="studio-era__year">{era.year}</p>
                <StudioEyebrow>{era.eyebrow}</StudioEyebrow>
                <h3>{era.title}</h3>
                <p className="studio-era__text">{era.text}</p>
                <div className="studio-era__tags">
                  {era.details.map((detail) => <StudioTag key={detail}>{detail}</StudioTag>)}
                </div>
              </article>
            ))}
          </div>

          <div className="studio-era-stage__telemetry" aria-hidden="true">
            <span>ROAD / ROUTE / DIGITAL</span>
            <i /><i /><i /><i />
            <strong>движение становится системой</strong>
          </div>

          <div className="studio-era-stage__timeline" aria-hidden="true">
            <span data-era-progress />
            {cityEras.map((era) => <i key={era.year} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
