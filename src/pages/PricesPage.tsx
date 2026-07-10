import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { PageHero } from '../components/PageHero';
import { PageTransition } from '../components/PageTransition';
import { PriceCard } from '../components/PriceCard';
import { Reveal } from '../components/Reveal';
import { LegalPreparationSection } from '../components/SalesSections';
import { pageMeta } from '../data/pageMeta';
import { useSiteData } from '../hooks/useSiteData';

export function PricesPage() {
  const { data, isLoading } = useSiteData();

  return (
    <PageTransition>
      <PageHero {...pageMeta.prices} />
      <section className="pb-16">
        <Container>
          <Reveal>
            <div className="mb-8 rounded-premium border border-line bg-slate-50 p-6 text-sm leading-7 text-muted shadow-glass">
              <p>
                Цены ориентировочные и зависят от задачи, объёма работы и срочности. Точная стоимость согласуется перед
                началом работы.
              </p>
              <p className="mt-2">Предварительная проверка сайта не является юридическим заключением.</p>
            </div>
          </Reveal>
          {data.priceGroups.length ? (
            <div className="grid gap-5 xl:grid-cols-2" aria-busy={isLoading}>
              {data.priceGroups.map((group, index) => (
                <Reveal delay={index * 0.035} key={group.title}>
                  <PriceCard group={group} accent={group.title === 'Сайты'} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="rounded-premium border border-line bg-white/82 p-8 text-center text-muted shadow-glass">
              Цены сейчас обновляются.
            </div>
          )}
          <div className="mt-8 rounded-premium border border-line bg-slate-50 p-6 text-sm leading-7 text-muted shadow-glass">
            <p>
              Цены ориентировочные и не являются публичной офертой. Итоговая стоимость зависит от задачи, объёма,
              сроков, материалов и способа публикации.
            </p>
            <p className="mt-2">
              Перед началом работы отдельно согласуются цена, сроки, количество правок, передача доступов, исходных
              файлов и дальнейшая поддержка.
            </p>
            <p className="mt-2">Предварительная проверка сайта не является юридическим заключением.</p>
          </div>
        </Container>
      </section>
      <LegalPreparationSection />
      <CallToAction />
    </PageTransition>
  );
}
