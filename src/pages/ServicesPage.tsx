import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { PageHero } from '../components/PageHero';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { ServiceCard } from '../components/ServiceCard';
import { pageMeta } from '../data/pageMeta';
import { services } from '../data/site';

export function ServicesPage() {
  return (
    <PageTransition>
      <PageHero {...pageMeta.services} />
      <section className="pb-16">
        <Container>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => (
              <Reveal delay={index * 0.04} key={service.path}>
                <ServiceCard service={service} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      <CallToAction />
    </PageTransition>
  );
}
