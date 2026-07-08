import { Link } from 'react-router-dom';
import { ButtonLink } from '../components/ButtonLink';
import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { ServiceCard } from '../components/ServiceCard';
import { TechVisual } from '../components/TechVisual';
import { quickStats, services, site, trustPoints } from '../data/site';

export function HomePage() {
  return (
    <PageTransition>
      <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1.03fr_0.97fr]">
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">{site.location}</p>
              <h1 className="mt-5 text-6xl font-extrabold leading-[0.96] tracking-normal text-ink sm:text-7xl lg:text-8xl">
                {site.name}
              </h1>
              <h2 className="mt-6 text-2xl font-bold leading-tight text-graphite sm:text-4xl">{site.tagline}</h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{site.description}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ButtonLink to="/services">Выбрать услугу</ButtonLink>
                <ButtonLink href={site.telegramUrl} variant="secondary" showArrow={false}>
                  Написать в Telegram
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <TechVisual />
            </Reveal>
          </div>
          <Reveal delay={0.18} className="mt-12 grid gap-4 sm:grid-cols-3">
            {quickStats.map((item) => (
              <div className="rounded-premium border border-line bg-white/80 p-5 shadow-glass" key={item.label}>
                <div className="text-3xl font-extrabold">{item.value}</div>
                <div className="mt-1 text-sm font-semibold text-muted">{item.label}</div>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <Reveal className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Услуги</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
                Помощь для людей и небольших проектов
              </h2>
            </div>
            <Link className="font-bold text-accent transition hover:text-ink" to="/services">
              Все услуги
            </Link>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => (
              <Reveal delay={index * 0.04} key={service.path}>
                <ServiceCard service={service} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <Reveal>
            <div className="rounded-premium border border-line bg-slate-50 p-7 shadow-glass sm:p-10">
              <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                <h2 className="text-3xl font-extrabold leading-tight sm:text-5xl">Спокойный процесс без давления</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {trustPoints.map((point) => (
                    <div className="rounded-3xl border border-line bg-white p-5 text-sm font-bold text-graphite" key={point}>
                      {point}
                    </div>
                  ))}
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
