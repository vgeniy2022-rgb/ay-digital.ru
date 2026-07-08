import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { PageHero } from '../components/PageHero';
import { PageTransition } from '../components/PageTransition';
import { PriceCard } from '../components/PriceCard';
import { Reveal } from '../components/Reveal';
import { pageMeta } from '../data/pageMeta';
import { priceGroups } from '../data/site';

export function PricesPage() {
  const [websites, apps, audit, presentations, tech, remoteHelp, computerHelp] = priceGroups;

  return (
    <PageTransition>
      <PageHero {...pageMeta.prices} />
      <section className="pb-16">
        <Container>
          <div className="grid gap-5">
            <div className="grid gap-5 lg:grid-cols-2">
              {[websites, apps].map((group, index) => (
                <Reveal delay={index * 0.035} key={group.title}>
                  <PriceCard group={group} />
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.08}>
              <PriceCard group={audit} accent />
            </Reveal>
            <div className="grid gap-5 lg:grid-cols-2">
              {[presentations, tech].map((group, index) => (
                <Reveal delay={0.1 + index * 0.035} key={group.title}>
                  <PriceCard group={group} />
                </Reveal>
              ))}
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {[remoteHelp, computerHelp].map((group, index) => (
                <Reveal delay={0.16 + index * 0.035} key={group.title}>
                  <PriceCard group={group} />
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>
      <CallToAction />
    </PageTransition>
  );
}
