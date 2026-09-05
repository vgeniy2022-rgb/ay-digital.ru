import { MapPin, Mouse } from 'lucide-react';
import { StudioButton, StudioEyebrow } from './StudioPrimitives';
import { VladivostokGlobe } from './VladivostokGlobe';
import { StudioExperienceControls } from './StudioExperienceControls';

type WebStudioHeroProps = {
  telegramUrl: string;
};

export function WebStudioHero({ telegramUrl }: WebStudioHeroProps) {
  return (
    <section className="studio-hero-story" id="vladivostok">
      <div className="studio-hero-story__stage">
        <div className="studio-space" aria-hidden="true">
          <span className="studio-star studio-star--one" />
          <span className="studio-star studio-star--two" />
          <span className="studio-star studio-star--three" />
          <span className="studio-star studio-star--four" />
          <span className="studio-star studio-star--five" />
        </div>

        <div className="studio-hero-story__globe" data-globe-stage>
          <VladivostokGlobe />
        </div>

        <div className="studio-shell studio-hero-story__content" data-hero-copy>
          <div className="studio-hero-story__copy">
            <StudioEyebrow>SITEVL · ВЛАДИВОСТОК</StudioEyebrow>
            <h1>Создание сайтов во Владивостоке под ключ</h1>
            <p className="studio-hero-story__lead">Разработка лендингов, сайтов для бизнеса, каталогов, интернет-магазинов и веб-сервисов.</p>
            <p className="studio-hero-story__description">
              Работаю напрямую, без менеджеров. Структура, дизайн и функции подбираются под задачу бизнеса, а весь проект можно согласовать удалённо.
            </p>
            <div className="studio-hero-story__actions">
              <StudioButton href={telegramUrl} target="_blank" rel="noreferrer">Заказать разработку сайта</StudioButton>
              <StudioButton href="/cases" tone="secondary">Смотреть кейсы</StudioButton>
            </div>
            <div className="studio-hero-story__location">
              <MapPin aria-hidden="true" className="h-4 w-4" />
              <span>Владивосток · работа по России удалённо</span>
            </div>
            <StudioExperienceControls />
          </div>
        </div>

        <div className="studio-city-horizon" data-city-horizon aria-hidden="true">
          <div className="studio-city-horizon__bridge">
            <span className="studio-city-horizon__tower studio-city-horizon__tower--left" />
            <span className="studio-city-horizon__tower studio-city-horizon__tower--right" />
            <span className="studio-city-horizon__cable studio-city-horizon__cable--left" />
            <span className="studio-city-horizon__cable studio-city-horizon__cable--right" />
          </div>
          <div className="studio-city-horizon__buildings">
            {Array.from({ length: 14 }, (_, index) => <span key={index} />)}
          </div>
          <div className="studio-city-horizon__road" />
        </div>

        <div className="studio-scroll-cue" aria-hidden="true">
          <Mouse className="h-4 w-4" />
          <span>Посмотреть форматы</span>
        </div>
      </div>
    </section>
  );
}
