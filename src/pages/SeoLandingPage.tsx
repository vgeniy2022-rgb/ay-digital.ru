import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { ButtonLink } from '../components/ButtonLink';
import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { SeoHead } from '../components/SeoHead';
import { absoluteUrl, siteConfig } from '../config/site';
import { SeoLandingPage as SeoLandingPageData } from '../data/seoLandingPages';
import { useSiteData } from '../hooks/useSiteData';

type SeoLandingPageProps = {
  page?: SeoLandingPageData;
};

function faqSchema(page: SeoLandingPageData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function serviceSchema(page: SeoLandingPageData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.title,
    serviceType: page.title,
    description: page.seoDescription,
    provider: {
      '@type': 'Person',
      name: siteConfig.specialistName,
      telephone: siteConfig.phone,
      url: siteConfig.siteUrl,
      sameAs: [siteConfig.telegramUrl],
    },
    areaServed: {
      '@type': 'City',
      name: siteConfig.city,
    },
    url: absoluteUrl(page.path),
  };
}

function breadcrumbSchema(page: SeoLandingPageData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: siteConfig.siteUrl },
      { '@type': 'ListItem', position: 2, name: page.title, item: absoluteUrl(page.path) },
    ],
  };
}

export function SeoLandingPage({ page }: SeoLandingPageProps) {
  const { data } = useSiteData();

  if (!page) return <Navigate to="/services" replace />;

  const priceGroups = data.priceGroups.filter((group) => page.priceGroupTitles.includes(group.title));
  const structuredData = [serviceSchema(page), faqSchema(page), breadcrumbSchema(page)];

  return (
    <PageTransition>
      <SeoHead
        title={page.seoTitle}
        description={page.seoDescription}
        canonicalPath={page.path}
        structuredData={structuredData}
      />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.10),transparent_34%),radial-gradient(circle_at_84%_16%,rgba(16,185,129,0.10),transparent_30%)]" />
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">{page.eyebrow}</p>
              <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.03] text-ink sm:text-6xl">
                {page.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{page.description}</p>
              <p className="mt-5 max-w-2xl text-base leading-7 text-graphite">{page.intro}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink to="/checkout">Оформить заявку</ButtonLink>
                <ButtonLink href={data.site.telegramUrl} variant="secondary" showArrow={false}>
                  <MessageCircle className="h-4 w-4 text-accent" />
                  Обсудить задачу
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="rounded-premium border border-line bg-white/84 p-6 shadow-glass">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Формат</p>
                <div className="mt-5 grid gap-3">
                  {['Владивосток', 'выезд по городу', 'удалённая помощь', 'частный специалист', 'цена согласуется до начала'].map((item) => (
                    <div className="flex items-center gap-3 rounded-3xl bg-slate-50 p-4 text-sm font-bold text-graphite" key={item}>
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <div className="grid gap-5 md:grid-cols-2">
            {page.sections.map((section, index) => (
              <Reveal delay={index * 0.04} key={section.title}>
                <article className="h-full rounded-premium border border-line bg-white/84 p-6 shadow-glass">
                  <h2 className="text-2xl font-extrabold leading-tight">{section.title}</h2>
                  {section.text ? <p className="mt-4 text-base leading-7 text-muted">{section.text}</p> : null}
                  {section.items?.length ? (
                    <div className="mt-5 grid gap-3">
                      {section.items.map((item) => (
                        <div className="flex items-start gap-3 text-sm font-semibold leading-6 text-graphite" key={item}>
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              </Reveal>
            ))}
          </div>
          {page.note ? (
            <Reveal>
              <div className="mt-6 rounded-premium border border-blue-100 bg-blue-50/70 p-6 text-sm font-semibold leading-7 text-graphite shadow-glass">
                {page.note}
              </div>
            </Reveal>
          ) : null}
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <Reveal>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Цены</p>
                <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">Ориентиры по стоимости</h2>
              </div>
              <ButtonLink to="/prices" variant="secondary">Все цены</ButtonLink>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {priceGroups.flatMap((group) =>
              group.items.slice(0, 4).map((item) => (
                <Reveal key={`${group.title}-${item.name}`}>
                  <div className="rounded-[28px] border border-line bg-white/84 p-5 shadow-glass">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="text-xl font-extrabold leading-tight">{item.name}</h3>
                      <p className="font-extrabold text-accent">{item.price}</p>
                    </div>
                    {item.description ? <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p> : null}
                  </div>
                </Reveal>
              )),
            )}
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">FAQ</p>
                <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">Частые вопросы</h2>
              </div>
            </Reveal>
            <div className="grid gap-4">
              {page.faq.map((item, index) => (
                <Reveal delay={index * 0.03} key={item.question}>
                  <div className="rounded-3xl border border-line bg-white/84 p-5 shadow-glass">
                    <h3 className="text-lg font-extrabold">{item.question}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted">{item.answer}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <Reveal>
            <div className="rounded-premium border border-line bg-slate-50 p-7 shadow-glass sm:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Связанные услуги</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">Что ещё может быть полезно</h2>
              <div className="mt-7 grid gap-3 md:grid-cols-2">
                {page.links.map((item) => {
                  const isExternal = item.href.startsWith('http');
                  const className = 'group flex items-center justify-between gap-4 rounded-3xl border border-line bg-white p-5 text-sm font-extrabold text-ink shadow-glass transition hover:-translate-y-0.5 hover:border-slate-300';

                  return isExternal ? (
                    <a className={className} href={item.href} target="_blank" rel="noreferrer" key={item.href}>
                      {item.label}
                      <ArrowRight className="h-4 w-4 text-accent transition group-hover:translate-x-0.5" />
                    </a>
                  ) : (
                    <Link className={className} to={item.href} key={item.href}>
                      {item.label}
                      <ArrowRight className="h-4 w-4 text-accent transition group-hover:translate-x-0.5" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <CallToAction />
    </PageTransition>
  );
}
