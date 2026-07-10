import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { PageHero } from '../components/PageHero';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { AdminWebsiteSection, AgreementSection, LegalPreparationSection } from '../components/SalesSections';
import { ServiceCard } from '../components/ServiceCard';
import { SiteAdminPromoCard } from '../components/SiteAdminPromoCard';
import { pageMeta } from '../data/pageMeta';
import { useSiteData } from '../hooks/useSiteData';

const categoryOrder = [
  'Сайты и админки',
  'Приложения и прототипы',
  'Презентации',
  'Компьютеры и ноутбуки',
  'Телефоны и перенос данных',
  'ПК и техника',
  'Базовая подготовка сайта к заявкам',
];

export function ServicesPage() {
  const { data, isLoading } = useSiteData();
  const { services } = data;
  const groupedServices = categoryOrder
    .map((category) => ({
      category,
      items: services.filter((service) => service.category === category),
    }))
    .filter((group) => group.items.length);
  const uncategorizedServices = services.filter((service) => !service.category || !categoryOrder.includes(service.category));

  return (
    <PageTransition>
      <PageHero {...pageMeta.services} />
      <section className="pb-16">
        <Container>
          {services.length ? (
            <div className="grid gap-10" aria-busy={isLoading}>
              {[...groupedServices, ...(uncategorizedServices.length ? [{ category: 'Другие услуги', items: uncategorizedServices }] : [])].map((group) => (
                <section key={group.category}>
                  <Reveal>
                    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Категория</p>
                        <h2 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">{group.category}</h2>
                      </div>
                      <span className="text-sm font-bold text-muted">{group.items.length} услуг</span>
                    </div>
                  </Reveal>
                  {group.category === 'Сайты и админки' ? (
                    <Reveal>
                      <div className="mb-5">
                        <SiteAdminPromoCard compact />
                      </div>
                    </Reveal>
                  ) : null}
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {group.items.map((service, index) => (
                      <Reveal delay={index * 0.04} key={`${group.category}-${service.slug}`}>
                        <ServiceCard service={service} />
                      </Reveal>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="rounded-premium border border-line bg-white/82 p-8 text-center text-muted shadow-glass">
              Раздел услуг сейчас обновляется.
            </div>
          )}
        </Container>
      </section>
      <AdminWebsiteSection />
      <LegalPreparationSection />
      <AgreementSection />
      <CallToAction />
    </PageTransition>
  );
}
