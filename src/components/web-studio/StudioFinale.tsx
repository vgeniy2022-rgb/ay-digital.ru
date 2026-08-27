import { MessageCircle, Send } from 'lucide-react';
import { StudioButton, StudioEyebrow } from './StudioPrimitives';

type StudioFinaleProps = {
  telegramUrl: string;
  whatsappUrl: string;
};

export function StudioFinale({ telegramUrl, whatsappUrl }: StudioFinaleProps) {
  return (
    <section className="studio-finale" aria-labelledby="studio-finale-title">
      <div className="studio-finale__earth" aria-hidden="true">
        <span className="studio-finale__orbit studio-finale__orbit--one" />
        <span className="studio-finale__orbit studio-finale__orbit--two" />
        <span className="studio-finale__origin" />
        <span className="studio-finale__destination studio-finale__destination--one" />
        <span className="studio-finale__destination studio-finale__destination--two" />
        <span className="studio-finale__destination studio-finale__destination--three" />
      </div>
      <div className="studio-shell studio-finale__content" data-studio-reveal>
        <StudioEyebrow>SITEVL · 43.1155° N</StudioEyebrow>
        <h2 id="studio-finale-title">Сделано во Владивостоке</h2>
        <p className="studio-finale__statement">Работает везде.</p>
        <p className="studio-finale__description">
          Разработка сайта полностью может проходить удалённо. Поэтому география клиента почти не ограничивает проект.
        </p>
        <div className="studio-finale__actions">
          <StudioButton href={telegramUrl} target="_blank" rel="noreferrer">
            <Send aria-hidden="true" className="h-4 w-4" /> Обсудить проект
          </StudioButton>
          <StudioButton href={whatsappUrl} target="_blank" rel="noreferrer" tone="secondary">
            <MessageCircle aria-hidden="true" className="h-4 w-4" /> Написать в WhatsApp
          </StudioButton>
        </div>
      </div>
    </section>
  );
}
