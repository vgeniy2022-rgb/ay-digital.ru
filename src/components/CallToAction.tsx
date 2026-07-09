import { MessageCircle, Phone } from 'lucide-react';
import { useSiteData } from '../hooks/useSiteData';
import { Container } from './Container';
import { Reveal } from './Reveal';

export function CallToAction() {
  const { data } = useSiteData();
  const { site } = data;

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <Reveal>
          <div className="noise rounded-premium border border-line bg-ink p-8 text-white shadow-soft sm:p-10 lg:p-12">
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-200">Связаться</p>
                <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">
                  Опишите задачу, а я подскажу самый простой следующий шаг.
                </h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <a
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-ink shadow-glass transition hover:-translate-y-0.5 hover:bg-blue-50"
                  href={site.telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="h-4 w-4 text-accent" />
                  Telegram
                </a>
                <a
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-ink shadow-glass transition hover:-translate-y-0.5 hover:bg-blue-50"
                  href={site.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="h-4 w-4 text-accent" />
                  WhatsApp
                </a>
                <a
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/12 px-6 text-sm font-bold text-white shadow-glass backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
                  href={site.phoneUrl}
                >
                  <Phone className="h-4 w-4" />
                  Позвонить
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
