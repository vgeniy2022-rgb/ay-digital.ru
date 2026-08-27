import { Database, MonitorSmartphone } from 'lucide-react';
import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { PageHero } from '../components/PageHero';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { SeoHead } from '../components/SeoHead';
import { AuthorCard, CasePreviewCard, TrustPrinciples } from '../components/TrustBlocks';
import { absoluteUrl, siteConfig } from '../config/site';
import { publishedCases } from '../data/cases';
import { pageMeta } from '../data/pageMeta';

function casesCollectionSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Кейсы и примеры проектов',
    description: 'Реальные проекты Александра: сайт-портфолио SITEVL и каталог морского оборудования.',
    url: absoluteUrl('/cases'),
    inLanguage: 'ru-RU',
    author: {
      '@type': 'Person',
      name: siteConfig.specialistName,
      url: absoluteUrl('/about'),
    },
    mainEntity: publishedCases.map((item) => ({
      '@type': 'CreativeWork',
      name: item.title,
      description: item.shortDescription,
      url: absoluteUrl(item.path),
    })),
  };
}

export function CasesPage() {
  return (
    <PageTransition>
      <SeoHead
        title="Кейсы и реальные проекты — SITEVL"
        description="Опубликованные кейсы Александра: сайт-портфолио SITEVL и каталог морского оборудования с админкой, SEO-структурой и адаптивным интерфейсом."
        canonicalPath="/cases"
        structuredData={casesCollectionSchema()}
      />
      <PageHero
        eyebrow={pageMeta.cases.eyebrow}
        title="Кейсы и реальные проекты"
        description="Здесь собраны опубликованные проекты, которые можно описывать фактами: что было нужно, что реализовано, какие технологии использовались и какой результат подготовлен."
      />

      <section className="pb-16">
        <Container>
          <Reveal>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-premium border border-line bg-white/84 p-6 shadow-glass sm:p-8">
                <MonitorSmartphone className="h-8 w-8 text-accent" />
                <h2 className="mt-5 text-2xl font-extrabold">Без вымышленных метрик</h2>
                <p className="mt-3 text-base leading-7 text-muted">
                  В кейсах не используются неподтверждённые проценты роста, рейтинги, отзывы или названия клиентов без разрешения на публикацию.
                </p>
              </div>
              <div className="rounded-premium border border-line bg-white/84 p-6 shadow-glass sm:p-8">
                <Database className="h-8 w-8 text-accent" />
                <h2 className="mt-5 text-2xl font-extrabold">Факты и структура</h2>
                <p className="mt-3 text-base leading-7 text-muted">
                  Каждый кейс показывает задачу, исходную ситуацию, выполненные работы, технологии, сложности и проверяемый результат.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {publishedCases.map((item, index) => (
              <Reveal delay={index * 0.04} key={item.slug}>
                <CasePreviewCard item={item} />
              </Reveal>
            ))}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <AuthorCard />
            </Reveal>
            <Reveal delay={0.06}>
              <TrustPrinciples />
            </Reveal>
          </div>
        </Container>
      </section>
      <CallToAction />
    </PageTransition>
  );
}
