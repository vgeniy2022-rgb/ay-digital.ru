import { ArrowDownRight, Check, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ButtonLink } from '../components/ButtonLink';
import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { ServiceCard } from '../components/ServiceCard';
import { SpecialistStatus } from '../components/SpecialistStatus';
import { TechVisual } from '../components/TechVisual';
import { useSiteData } from '../hooks/useSiteData';

export function HomePage() {
  const { data, isLoading } = useSiteData();
  const { commonRequests, faq, homeHero, quickStats, reviews, services, site, workSteps } = data;

  return (
    <PageTransition>
      <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1.03fr_0.97fr]">
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">{homeHero.subtitle}</p>
              <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-normal text-ink sm:text-6xl lg:text-7xl">
                {homeHero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{homeHero.description}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink to="/services">Выбрать услугу</ButtonLink>
                <ButtonLink href={site.telegramUrl} variant="secondary" showArrow={false}>
                  <MessageCircle className="h-4 w-4 text-accent" />
                  Написать в Telegram
                </ButtonLink>
                <ButtonLink to="/prices" variant="ghost">Смотреть цены</ButtonLink>
              </div>
              <div className="mt-6 max-w-2xl">
                <SpecialistStatus />
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <TechVisual />
            </Reveal>
          </div>
          <Reveal delay={0.18} className="mt-12 grid gap-4 sm:grid-cols-3">
            {quickStats.map((item) => (
              <div className="rounded-premium border border-line bg-white/80 p-5 shadow-glass" key={item.label}>
                <div className="text-xl font-extrabold leading-tight sm:text-2xl">{item.value}</div>
                <div className="mt-2 text-sm font-semibold leading-6 text-muted">{item.label}</div>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Как проходит работа</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">Спокойный процесс без давления</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {workSteps.map((step, index) => (
              <Reveal delay={index * 0.05} key={step}>
                <div className="relative h-full min-h-40 rounded-premium border border-line bg-white p-5 shadow-glass">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-accent">0{index + 1}</span>
                    <ArrowDownRight className="h-5 w-5 text-slate-300" />
                  </div>
                  <p className="mt-8 font-bold leading-6 text-graphite">{step}</p>
                </div>
              </Reveal>
            ))}
          </div>
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
          {services.length ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-busy={isLoading}>
              {services.map((service, index) => (
                <Reveal delay={index * 0.04} key={service.path}>
                  <ServiceCard service={service} />
                </Reveal>
              ))}
            </div>
          ) : null}
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <Reveal>
            <div className="rounded-premium border border-line bg-slate-50 p-7 shadow-glass sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">С чем можно обратиться</p>
                  <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">Можно начать с простой ситуации</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {commonRequests.map((request) => (
                    <div className="flex min-h-20 items-center gap-3 rounded-3xl border border-line bg-white p-5 text-sm font-bold text-graphite" key={request}>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-accent">
                        <Check className="h-4 w-4" />
                      </span>
                      {request}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {reviews.length ? (
        <section className="py-12 sm:py-16">
          <Container>
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Отзывы</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">Что говорят клиенты</h2>
            </Reveal>
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {reviews.map((review, index) => (
                <Reveal delay={index * 0.04} key={`${review.name}-${index}`}>
                  <article className="h-full rounded-premium border border-line bg-white/82 p-6 shadow-glass">
                    <div className="flex items-center gap-4">
                      {review.photoUrl ? (
                        <img
                          className="h-12 w-12 rounded-full object-cover"
                          src={review.photoUrl}
                          alt={review.name}
                        />
                      ) : (
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-sm font-extrabold text-ink">
                          {review.name.slice(0, 1)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-extrabold">{review.name}</h3>
                        {review.service && <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">{review.service}</p>}
                      </div>
                    </div>
                    {review.text && <p className="mt-5 text-base leading-7 text-muted">{review.text}</p>}
                    {review.reviewImageUrl && (
                      <img
                        className="mt-5 max-h-72 w-full rounded-3xl border border-line object-cover"
                        src={review.reviewImageUrl}
                        alt={`Отзыв: ${review.name}`}
                      />
                    )}
                  </article>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {faq.length ? (
        <section className="py-12 sm:py-16">
          <Container>
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">FAQ</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">Частые вопросы</h2>
            </Reveal>
            <div className="mt-8 grid gap-4">
              {faq.map((item, index) => (
                <Reveal delay={index * 0.035} key={`${item.question}-${index}`}>
                  <article className="rounded-premium border border-line bg-white/82 p-6 shadow-glass">
                    <h3 className="text-xl font-extrabold leading-tight">{item.question}</h3>
                    {item.answer && <p className="mt-3 text-base leading-7 text-muted">{item.answer}</p>}
                  </article>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <CallToAction />
    </PageTransition>
  );
}
