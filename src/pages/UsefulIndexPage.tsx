import { Check } from 'lucide-react';
import { useEffect } from 'react';
import { ButtonLink } from '../components/ButtonLink';
import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { UsefulCard, UsefulHero } from '../components/UsefulBlocks';
import { usefulAudience, usefulCards, usefulIndexMeta } from '../data/useful';
import { useSiteData } from '../hooks/useSiteData';

export function UsefulIndexPage() {
  const { data } = useSiteData();

  useEffect(() => {
    document.title = `${usefulIndexMeta.title} | ${data.site.domain}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', usefulIndexMeta.description);
  }, [data.site.domain]);

  return (
    <PageTransition>
      <UsefulHero
        title={usefulIndexMeta.title}
        description="Простые инструкции без сложных слов: как перенести данные, защитить аккаунты, проверить устройство и не попасться на мошенников."
        variant="hub"
        primary={{ label: 'Перенос данных', href: '/useful/data-transfer' }}
        secondary={{ label: 'Защита от мошенников', href: '/useful/scams' }}
      />

      <section className="py-10 sm:py-14">
        <Container>
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Разделы</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">Инструкции для обычных задач</h2>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {usefulCards.map((card, index) => (
              <Reveal delay={index * 0.04} key={card.href}>
                <UsefulCard card={card} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <Reveal>
            <div className="rounded-premium border border-line bg-slate-50 p-7 shadow-glass sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Кому полезно</p>
                  <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">Когда лучше не рисковать данными</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {usefulAudience.map((item) => (
                    <div className="flex min-h-20 items-center gap-3 rounded-3xl border border-line bg-white p-5 text-sm font-bold text-graphite" key={item}>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                        <Check className="h-4 w-4" />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <Reveal>
            <div className="rounded-premium border border-line bg-ink p-8 text-white shadow-soft sm:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-200">Помощь</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">Не хотите разбираться сами?</h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-blue-50">
                Я могу помочь перенести данные, проверить настройки безопасности и подготовить устройство к продаже или покупке.
              </p>
              <div className="mt-7">
                <ButtonLink href={data.site.telegramUrl} variant="secondary" showArrow={false}>Написать в Telegram</ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <CallToAction />
    </PageTransition>
  );
}
