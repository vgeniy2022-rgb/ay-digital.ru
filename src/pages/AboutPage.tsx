import { CheckCircle2, UserRound } from 'lucide-react';
import { useState } from 'react';
import { businessPortraitUrl } from '../assets/portrait';
import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { PageHero } from '../components/PageHero';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { pageMeta } from '../data/pageMeta';
import { aboutText } from '../data/site';
import { useSiteData } from '../hooks/useSiteData';

export function AboutPage() {
  const [isPortraitVisible, setIsPortraitVisible] = useState(Boolean(businessPortraitUrl));
  const { data } = useSiteData();
  const { services, trustPoints } = data;

  return (
    <PageTransition>
      <PageHero {...pageMeta.about} />
      <section className="pb-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <div className="relative min-h-[420px] overflow-hidden rounded-premium border border-line bg-slate-50 shadow-soft">
                {isPortraitVisible && businessPortraitUrl ? (
                  <img
                    className="h-full min-h-[420px] w-full object-cover"
                    src={businessPortraitUrl}
                    alt="Александр"
                    onError={() => setIsPortraitVisible(false)}
                  />
                ) : (
                  <div className="grid min-h-[420px] place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(29,78,216,0.12),transparent_34%),linear-gradient(145deg,#ffffff,#eef3fb)] p-8 text-center">
                    <div>
                      <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-white text-ink shadow-glass">
                        <UserRound className="h-11 w-11" />
                      </div>
                      <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-accent">Фото</p>
                      <h2 className="mt-3 text-3xl font-extrabold">Александр</h2>
                      <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-muted">
                        Здесь появится деловой портрет из файла business-portrait.png
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="rounded-premium border border-line bg-white/84 p-7 shadow-soft sm:p-10">
                <p className="text-xl leading-9 text-graphite">{aboutText}</p>
              </div>
            </Reveal>
          </div>
          <Reveal className="mt-8">
            <div className="rounded-premium border border-line bg-slate-50 p-7 shadow-glass sm:p-8">
                <h2 className="text-2xl font-extrabold">Принципы работы</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {trustPoints.map((point) => (
                    <div className="flex gap-3" key={point}>
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                      <span className="font-semibold text-graphite">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
          </Reveal>
          <Reveal className="mt-8">
            <div className="rounded-premium border border-line bg-white p-7 shadow-glass sm:p-8">
              <h2 className="text-2xl font-extrabold">С чем можно обратиться</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <div className="rounded-3xl bg-slate-50 p-4 text-sm font-bold text-graphite" key={service.path}>
                    {service.title}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
      <CallToAction />
    </PageTransition>
  );
}
