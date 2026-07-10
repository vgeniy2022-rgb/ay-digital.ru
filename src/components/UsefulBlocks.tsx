import { AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ButtonLink } from './ButtonLink';
import { Container } from './Container';
import { Reveal } from './Reveal';
import { UsefulArticleSection, UsefulCardData, UsefulIllustrationVariant } from '../data/useful';
import { UsefulIllustration } from './UsefulIllustrations';

export function UsefulHero({
  title,
  description,
  variant,
  primary,
  secondary,
}: {
  title: string;
  description: string;
  variant: UsefulIllustrationVariant;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="py-14 sm:py-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.92fr]">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Полезное</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.05] text-ink sm:text-6xl">{title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{description}</p>
            {(primary || secondary) && (
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {primary && <ButtonLink to={primary.href}>{primary.label}</ButtonLink>}
                {secondary && <ButtonLink to={secondary.href} variant="secondary">{secondary.label}</ButtonLink>}
              </div>
            )}
          </Reveal>
          <Reveal delay={0.08}>
            <UsefulIllustration variant={variant} />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

export function UsefulCard({ card }: { card: UsefulCardData }) {
  return (
    <Link
      className="group block h-full rounded-premium border border-line bg-white/82 p-6 shadow-glass transition duration-300 hover:-translate-y-1 hover:shadow-soft"
      to={card.href}
    >
      <UsefulIllustration variant={card.variant} />
      <h2 className="mt-6 text-2xl font-extrabold leading-tight">{card.title}</h2>
      <p className="mt-3 text-base leading-7 text-muted">{card.description}</p>
      <div className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-accent transition group-hover:text-ink">
        Открыть раздел
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

export function WarningCard({ children }: { children: string }) {
  return (
    <Reveal>
      <div className="rounded-premium border border-amber-100 bg-amber-50/80 p-6 text-base font-semibold leading-7 text-amber-900 shadow-glass">
        <div className="flex gap-4">
          <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-amber-600" />
          <p>{children}</p>
        </div>
      </div>
    </Reveal>
  );
}

export function ChecklistCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="h-full rounded-premium border border-line bg-white/82 p-6 shadow-glass">
      <h3 className="text-xl font-extrabold leading-tight">{title}</h3>
      <div className="mt-5 grid gap-3">
        {items.map((item, index) => (
          <Reveal delay={index * 0.025} key={item}>
            <div className="flex gap-3 text-sm font-semibold leading-6 text-graphite">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <Check className="h-3.5 w-3.5" />
              </span>
              {item}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export function ScamScenarioCard({
  title,
  deception,
  danger,
  action,
}: {
  title: string;
  deception: string;
  danger: string;
  action: string;
}) {
  return (
    <div className="h-full rounded-premium border border-line bg-white/82 p-6 shadow-glass">
      <h3 className="text-xl font-extrabold leading-tight">{title}</h3>
      <div className="mt-5 grid gap-3 text-sm leading-6 text-muted">
        <p><span className="font-extrabold text-ink">Как звучит: </span>{deception}</p>
        <p><span className="font-extrabold text-ink">Почему опасно: </span>{danger}</p>
        <p className="rounded-3xl bg-emerald-50 p-4 font-semibold text-emerald-900">{action}</p>
      </div>
    </div>
  );
}

export function UsefulSection({ section }: { section: UsefulArticleSection }) {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <Reveal>
          <h2 className="text-3xl font-extrabold leading-tight sm:text-5xl">{section.title}</h2>
          {section.description && <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{section.description}</p>}
        </Reveal>
        {section.cards && (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {section.cards.map((card, index) => (
              <Reveal delay={index * 0.035} key={card.title}>
                <div className="h-full rounded-premium border border-line bg-white/82 p-6 shadow-glass transition duration-300 hover:-translate-y-1 hover:shadow-soft">
                  <h3 className="text-xl font-extrabold leading-tight">{card.title}</h3>
                  <p className="mt-3 text-base leading-7 text-muted">{card.description}</p>
                  {card.meta && <p className="mt-4 rounded-3xl bg-blue-50/70 p-4 text-sm font-semibold leading-6 text-graphite">{card.meta}</p>}
                  {card.items && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {card.items.map((item) => (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-graphite" key={item}>{item}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}
        {section.scenarios && (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {section.scenarios.map((scenario, index) => (
              <Reveal delay={index * 0.035} key={scenario.title}>
                <ScamScenarioCard {...scenario} />
              </Reveal>
            ))}
          </div>
        )}
        {section.tips && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {section.tips.map((tip, index) => (
              <Reveal delay={index * 0.025} key={tip}>
                <div className="flex min-h-20 items-center gap-3 rounded-3xl border border-line bg-white/82 p-5 text-sm font-bold text-graphite shadow-glass">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-accent">
                    <Check className="h-4 w-4" />
                  </span>
                  {tip}
                </div>
              </Reveal>
            ))}
          </div>
        )}
        {section.checklist && (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {section.checklist.map((list, index) => (
              <Reveal delay={index * 0.035} key={list.title}>
                <ChecklistCard title={list.title} items={list.items} />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
