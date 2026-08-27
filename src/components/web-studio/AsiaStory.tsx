import { Boxes, Cpu, MapPinned, Network } from 'lucide-react';
import { StudioEyebrow } from './StudioPrimitives';

const asiaCities = [
  { id: 'vladivostok', label: 'Владивосток', region: 'Россия' },
  { id: 'beijing', label: 'Пекин', region: 'Китай' },
  { id: 'shanghai', label: 'Шанхай', region: 'Китай' },
  { id: 'seoul', label: 'Сеул', region: 'Корея' },
  { id: 'tokyo', label: 'Токио', region: 'Япония' },
  { id: 'hong-kong', label: 'Гонконг', region: 'Китай' },
];

export function AsiaStory() {
  return (
    <section className="studio-asia-story" id="asia">
      <div className="studio-shell studio-asia-story__layout">
        <div className="studio-asia-map" data-studio-reveal aria-label="Схема связи Владивостока с рынками Азии" role="img">
          <div className="studio-asia-map__grid" aria-hidden="true" />
          <svg className="studio-asia-map__land" viewBox="0 0 760 560" aria-hidden="true">
            <path className="studio-asia-map__country studio-asia-map__country--russia" d="M40 84L132 42l128 14 85 51 122 7 89 48-24 61-91 19-77-28-72 24-86-32-88 8-73-49z" />
            <path className="studio-asia-map__country studio-asia-map__country--china" d="M163 221l83-31 102 30 71 68-18 84-96 58-104-32-61-82z" />
            <path className="studio-asia-map__country studio-asia-map__country--korea" d="M445 250l22 28-7 69-22 31-16-47 7-56z" />
            <path className="studio-asia-map__country studio-asia-map__country--japan" d="M538 232l30 19-7 39-23 20-12 46-26 17-11-31 20-47 7-48z" />
            <path className="studio-asia-map__country studio-asia-map__country--japan" d="M488 386l17 13-7 34-18 12-7-25z" />
            <path className="studio-asia-map__coast" d="M345 108c32 63 69 88 104 111s47 83 24 139c-22 54-4 92 29 134" />
            <path className="studio-asia-map__route-line studio-asia-map__route-line--one" d="M432 210Q360 190 295 254" />
            <path className="studio-asia-map__route-line studio-asia-map__route-line--two" d="M432 210Q428 278 449 303" />
            <path className="studio-asia-map__route-line studio-asia-map__route-line--three" d="M432 210Q515 202 548 279" />
            <path className="studio-asia-map__route-line studio-asia-map__route-line--four" d="M432 210Q360 325 337 371" />
            <path className="studio-asia-map__route-line studio-asia-map__route-line--five" d="M432 210Q302 345 252 455" />
          </svg>
          <div className="studio-asia-map__region-label studio-asia-map__region-label--russia">Дальний Восток</div>
          <div className="studio-asia-map__region-label studio-asia-map__region-label--china">Китай</div>
          <div className="studio-asia-map__region-label studio-asia-map__region-label--korea">Корея</div>
          <div className="studio-asia-map__region-label studio-asia-map__region-label--japan">Япония</div>
          {asiaCities.map((city) => (
            <div className={`studio-asia-map__city studio-asia-map__city--${city.id}`} key={city.id}>
              <span />
              <strong>{city.label}</strong>
              <small>{city.region}</small>
            </div>
          ))}
          <div className="studio-asia-map__legend">
            <span><MapPinned aria-hidden="true" /> география</span>
            <span><Boxes aria-hidden="true" /> логистика</span>
            <span><Cpu aria-hidden="true" /> технологии</span>
            <span><Network aria-hidden="true" /> digital</span>
          </div>
        </div>

        <div className="studio-asia-story__copy" data-studio-reveal>
          <StudioEyebrow>География влияет на ритм</StudioEyebrow>
          <h2>Азия рядом</h2>
          <p>
            Владивосток находится рядом с Китаем и другими рынками Азии. Здесь особенно хорошо понимаешь, насколько бизнес сегодня связан с логистикой, технологиями и интернетом.
          </p>
          <strong>Сайт становится частью этой инфраструктуры.</strong>
        </div>
      </div>
    </section>
  );
}

export function DigitalTransition() {
  return (
    <section className="studio-digital-transition" aria-labelledby="digital-transition-title" data-digital-transition>
      <div className="studio-digital-transition__routes" aria-hidden="true">
        <span className="studio-digital-route studio-digital-route--one" />
        <span className="studio-digital-route studio-digital-route--two" />
        <span className="studio-digital-route studio-digital-route--three" />
        <span className="studio-digital-route studio-digital-route--four" />
      </div>
      <div className="studio-digital-transition__cargo" aria-hidden="true">
        <span>CATALOG</span><span>DATA</span><span>ADMIN</span><span>API</span>
      </div>
      <div className="studio-digital-transition__code" data-code-symbol aria-hidden="true">
        <span>&lt;</span><strong>/</strong><span>&gt;</span>
      </div>
      <div className="studio-digital-transition__interface" aria-hidden="true">
        <span /><span /><span /><span /><span /><span />
      </div>
      <div className="studio-digital-transition__copy">
        <StudioEyebrow>От маршрута к интерфейсу</StudioEyebrow>
        <h2 id="digital-transition-title">Логистика становится системой.</h2>
        <p>Контейнеры превращаются в карточки, маршруты — в навигацию, а данные — в работающий сайт.</p>
      </div>
    </section>
  );
}
