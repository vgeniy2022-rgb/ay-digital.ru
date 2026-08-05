import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import { Navigate, Link, useParams } from 'react-router-dom';
import { ButtonLink } from '../components/ButtonLink';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { SeoHead } from '../components/SeoHead';
import { CasePreviewCard } from '../components/TrustBlocks';
import { absoluteUrl, siteConfig } from '../config/site';
import { publishedCases } from '../data/cases';
import { seoLandingPages } from '../data/seoLandingPages';
import type { SeoLandingPage as SeoLandingPageData } from '../data/seoLandingPages';
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

function serviceSchema(page: SeoLandingPageData, priceGroups: ReturnType<typeof useSiteData>['data']['priceGroups']) {
  const offers = priceGroups.flatMap((group) =>
    group.items.slice(0, 4).map((item) => ({
      '@type': 'Offer',
      name: item.name,
      description: item.description,
      priceCurrency: 'RUB',
      availability: 'https://schema.org/InStock',
      category: group.title,
    })),
  );

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
    offers,
    url: absoluteUrl(page.path),
  };
}

const fallbackTrust = [
  'работаю лично',
  'объясняю простым языком',
  'без навязывания лишних услуг',
  'цена обсуждается до начала',
  'проверяю результат вместе с клиентом',
  'возможна удалённая помощь',
];

const fallbackProcess = ['вы описываете задачу', 'я уточняю детали', 'согласуем цену и сроки', 'выполняю работу', 'проверяем результат'];

function InternalLinkGrid({ items }: { items: { label: string; href: string }[] }) {
  return (
    <div className="mt-7 grid gap-3 md:grid-cols-2">
      {items.map((item) => {
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
  );
}

export function SeoLandingPage({ page }: SeoLandingPageProps) {
  const { landingSlug } = useParams();
  const { data } = useSiteData();
  const currentPage = page || seoLandingPages.find((item) => item.slug === landingSlug);

  if (!currentPage) return <Navigate to="/services" replace />;

  const priceGroups = data.priceGroups.filter((group) => currentPage.priceGroupTitles.includes(group.title));
  const structuredData = [serviceSchema(currentPage, priceGroups), faqSchema(currentPage)];
  const serviceIncludes = currentPage.serviceIncludes || currentPage.sections.flatMap((section) => section.items?.slice(0, 2).map((item) => ({ title: item, description: section.text || currentPage.description })) || []).slice(0, 6);
  const neededWhen = currentPage.neededWhen || currentPage.sections.flatMap((section) => section.items || []).slice(0, 6);
  const processSteps = currentPage.processSteps || fallbackProcess;
  const trust = currentPage.trust || fallbackTrust;
  const relatedServices = currentPage.relatedServices || currentPage.links;
  const usefulArticles = currentPage.relatedArticles || [
    { label: 'Полезное', href: '/useful' },
    { label: 'Цифровая гигиена', href: '/useful/digital-hygiene' },
  ];
  const relatedCases = publishedCases.filter((caseItem) =>
    caseItem.relatedServices.some((service) => service.href === currentPage.path || currentPage.links.some((link) => link.href === service.href)),
  );

  return (
    <PageTransition>
      <SeoHead
        title={currentPage.seoTitle}
        description={currentPage.seoDescription}
        canonicalPath={currentPage.path}
        structuredData={structuredData}
      />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.10),transparent_34%),radial-gradient(circle_at_84%_16%,rgba(16,185,129,0.10),transparent_30%)]" />
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">{currentPage.eyebrow}</p>
              <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.03] text-ink sm:text-6xl">
                {currentPage.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{currentPage.description}</p>
              <p className="mt-5 max-w-2xl text-base leading-7 text-graphite">{currentPage.intro}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink to="/services">Выбрать услугу</ButtonLink>
                <ButtonLink href={data.site.telegramUrl} variant="secondary" showArrow={false}>
                  <MessageCircle className="h-4 w-4 text-accent" />
                  Связаться
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
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Что входит</p>
            <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">Что входит в услугу</h2>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {serviceIncludes.map((item, index) => (
              <Reveal delay={index * 0.04} key={item.title}>
                <article className="h-full rounded-premium border border-line bg-white/84 p-6 shadow-glass">
                  <span className="text-sm font-extrabold text-accent">0{index + 1}</span>
                  <h3 className="mt-5 text-2xl font-extrabold leading-tight">{item.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-muted">{item.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
          {currentPage.note ? (
            <Reveal>
              <div className="mt-6 rounded-premium border border-blue-100 bg-blue-50/70 p-6 text-sm font-semibold leading-7 text-graphite shadow-glass">
                {currentPage.note}
              </div>
            </Reveal>
          ) : null}
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <Reveal>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Когда нужна</p>
                <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">Когда стоит обратиться</h2>
              </div>
            </Reveal>
            <div className="grid gap-3 sm:grid-cols-2">
              {neededWhen.map((item, index) => (
                <Reveal delay={index * 0.03} key={item}>
                  <div className="flex min-h-20 items-center gap-3 rounded-3xl border border-line bg-white/84 p-5 text-sm font-bold leading-6 text-graphite shadow-glass">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                    {item}
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
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Процесс</p>
            <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">Как проходит работа</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {processSteps.map((step, index) => (
              <Reveal delay={index * 0.04} key={step}>
                <article className="h-full rounded-premium border border-line bg-white/84 p-5 shadow-glass">
                  <span className="text-sm font-extrabold text-accent">0{index + 1}</span>
                  <h3 className="mt-6 text-base font-extrabold leading-6 text-graphite">{step}</h3>
                </article>
              </Reveal>
            ))}
          </div>
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
          <Reveal>
            <p className="mt-6 rounded-premium border border-blue-100 bg-blue-50/70 p-6 text-sm font-semibold leading-7 text-graphite shadow-glass">
              {currentPage.priceNote || 'Стоимость зависит от конкретной задачи, объёма работы, срочности и исходных материалов. Итоговую цену согласуем до начала работы.'}
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <Reveal>
            <div className="rounded-premium border border-line bg-slate-50 p-7 shadow-glass sm:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Доверие</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">Почему клиенты обращаются ко мне</h2>
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {trust.map((item) => (
                  <div className="flex gap-3 rounded-3xl border border-line bg-white p-5 text-sm font-bold leading-6 text-graphite shadow-glass" key={item}>
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {currentPage.commonProblems?.length ? (
        <section className="py-10 sm:py-14">
          <Container>
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Проблемы</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">Частые проблемы клиентов</h2>
            </Reveal>
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {currentPage.commonProblems.map((problem, index) => (
                <Reveal delay={index * 0.04} key={problem.title}>
                  <article className="h-full rounded-premium border border-line bg-white/84 p-6 shadow-glass">
                    <h3 className="text-xl font-extrabold leading-tight">{problem.title}</h3>
                    <p className="mt-4 text-sm leading-6 text-muted">{problem.description}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

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
              {currentPage.faq.map((item, index) => (
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
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Перелинковка</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">Похожие услуги</h2>
              <InternalLinkGrid items={relatedServices} />
              <h2 className="mt-10 text-2xl font-extrabold leading-tight">Цены, контакты и навигация</h2>
              <InternalLinkGrid items={currentPage.links} />
              <h2 className="mt-10 text-2xl font-extrabold leading-tight">Полезные статьи</h2>
              <InternalLinkGrid items={usefulArticles} />
            </div>
          </Reveal>
        </Container>
      </section>

      {relatedCases.length ? (
        <section className="py-10 sm:py-14">
          <Container>
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Кейсы</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">Похожие проекты</h2>
            </Reveal>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {relatedCases.map((caseItem, index) => (
                <Reveal delay={index * 0.04} key={caseItem.slug}>
                  <CasePreviewCard item={caseItem} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section className="py-12 sm:py-16">
        <Container>
          <Reveal>
            <div className="noise rounded-premium border border-line bg-ink p-8 text-white shadow-soft sm:p-10 lg:p-12">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-200">Нужна помощь?</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">Получите консультацию перед началом работы.</h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-blue-50">
                Напишите, что нужно сделать. Я уточню детали, подскажу подходящий формат и ориентир по стоимости.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink href={data.site.telegramUrl} variant="secondary" showArrow={false}>
                  <MessageCircle className="h-4 w-4 text-accent" />
                  Telegram
                </ButtonLink>
                <ButtonLink href={data.site.whatsappUrl} variant="secondary" showArrow={false}>
                  <MessageCircle className="h-4 w-4 text-accent" />
                  WhatsApp
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

    </PageTransition>
  );
}
