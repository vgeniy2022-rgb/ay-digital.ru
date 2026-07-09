import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { PageHero } from '../components/PageHero';
import { PageTransition } from '../components/PageTransition';
import { PriceCard } from '../components/PriceCard';
import { Reveal } from '../components/Reveal';
import { pageMeta } from '../data/pageMeta';
import { PriceGroup } from '../data/site';
import { useSiteData } from '../hooks/useSiteData';

function isAuditGroup(group: PriceGroup) {
  return group.title.toLowerCase().includes('аудит');
}

export function PricesPage() {
  const { data, isLoading } = useSiteData();
  const [websites, apps, ...restGroups] = data.priceGroups;
  const audit = restGroups.find(isAuditGroup);
  const otherGroups = restGroups.filter((group) => group !== audit);
  const firstPair = [websites, apps].filter(Boolean);
  const secondPair = otherGroups.slice(0, 2);
  const thirdPair = otherGroups.slice(2, 4);
  const extraGroups = otherGroups.slice(4);

  return (
    <PageTransition>
      <PageHero {...pageMeta.prices} />
      <section className="pb-16">
        <Container>
          {data.priceGroups.length ? (
            <div className="grid gap-5" aria-busy={isLoading}>
              {firstPair.length ? (
                <div className="grid gap-5 lg:grid-cols-2">
                  {firstPair.map((group, index) => (
                    <Reveal delay={index * 0.035} key={group.title}>
                      <PriceCard group={group} />
                    </Reveal>
                  ))}
                </div>
              ) : null}
              {audit ? (
                <Reveal delay={0.08}>
                  <PriceCard group={audit} accent />
                </Reveal>
              ) : null}
              {[secondPair, thirdPair].map((pair, rowIndex) =>
                pair.length ? (
                  <div className="grid gap-5 lg:grid-cols-2" key={`price-row-${rowIndex}`}>
                    {pair.map((group, index) => (
                      <Reveal delay={0.1 + rowIndex * 0.06 + index * 0.035} key={group.title}>
                        <PriceCard group={group} />
                      </Reveal>
                    ))}
                  </div>
                ) : null,
              )}
              {extraGroups.length ? (
                <div className="grid gap-5 lg:grid-cols-2">
                  {extraGroups.map((group, index) => (
                    <Reveal delay={0.24 + index * 0.035} key={group.title}>
                      <PriceCard group={group} />
                    </Reveal>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-premium border border-line bg-white/82 p-8 text-center text-muted shadow-glass">
              Цены сейчас обновляются.
            </div>
          )}
          <div className="mt-8 rounded-premium border border-line bg-slate-50 p-6 text-sm leading-7 text-muted shadow-glass">
            <p>
              Цены ориентировочные и зависят от задачи, объёма работы и срочности. Точная стоимость согласуется перед
              началом работы.
            </p>
            <p className="mt-2">Предварительная проверка сайта не является юридическим заключением.</p>
          </div>
        </Container>
      </section>
      <CallToAction />
    </PageTransition>
  );
}
