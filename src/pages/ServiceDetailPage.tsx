import { CheckCircle2 } from 'lucide-react';
import { Navigate, Link, useParams } from 'react-router-dom';
import { ButtonLink } from '../components/ButtonLink';
import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { ServiceVisual } from '../components/ServiceVisual';
import { useSiteData } from '../hooks/useSiteData';

export function ServiceDetailPage() {
  const { slug } = useParams();
  const { data } = useSiteData();
  const { services, site } = data;
  const service = services.find((item) => item.slug === slug);

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  const Icon = service.icon;

  return (
    <PageTransition>
      <section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <Link className="text-sm font-bold text-accent transition hover:text-ink" to="/services">
              Услуги
            </Link>
            <div className="mt-7 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <div className="grid h-16 w-16 place-items-center rounded-3xl bg-slate-100 text-ink">
                  <Icon className="h-7 w-7" />
                </div>
                <h1 className="mt-7 text-4xl font-extrabold leading-[1.03] sm:text-6xl">{service.title}</h1>
                <p className="mt-6 text-xl leading-8 text-muted">{service.description}</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <ButtonLink href={site.telegramUrl} showArrow={false}>
                    Написать в Telegram
                  </ButtonLink>
                  <ButtonLink href={site.whatsappUrl} variant="secondary" showArrow={false}>
                    WhatsApp
                  </ButtonLink>
                  <ButtonLink href={site.phoneUrl} variant="secondary" showArrow={false}>
                    Позвонить
                  </ButtonLink>
                  <ButtonLink to="/prices" variant="secondary">
                    Посмотреть цены
                  </ButtonLink>
                </div>
              </div>
              <div className="grid gap-5">
                <ServiceVisual slug={service.slug} />
                <div className="rounded-premium border border-line bg-white/84 p-6 shadow-soft sm:p-8">
                <h2 className="text-2xl font-extrabold">Что входит</h2>
                <div className="mt-6 grid gap-4">
                  {service.bullets.map((bullet) => (
                    <div className="flex gap-3 rounded-3xl bg-slate-50 p-4" key={bullet}>
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                      <span className="font-semibold text-graphite">{bullet}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-6 rounded-3xl border border-line bg-white p-5 text-base font-semibold leading-7 text-muted">
                  {service.outcome}
                </p>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
      <CallToAction />
    </PageTransition>
  );
}
