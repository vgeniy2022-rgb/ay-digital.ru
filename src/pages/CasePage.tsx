import { Navigate, Link, useParams } from 'react-router-dom';
import { ArrowRight, CalendarDays, CheckCircle2, Layers3, MessageCircle, UserRound } from 'lucide-react';
import { ButtonLink } from '../components/ButtonLink';
import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { SeoHead } from '../components/SeoHead';
import { CaseExperience } from '../components/CaseExperience';
import { CaseGallery, CaseScreenshotImage } from '../components/CaseGallery';
import { CaseMedia, CaseResultBlock, RelatedCases, TechnologiesList } from '../components/TrustBlocks';
import { absoluteUrl, siteConfig } from '../config/site';
import { ProjectCase, publishedCases } from '../data/cases';
import { useSiteData } from '../hooks/useSiteData';

function caseStructuredData(item: ProjectCase) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: item.title,
    headline: item.title,
    description: item.seoDescription,
    url: absoluteUrl(item.path),
    inLanguage: 'ru-RU',
    datePublished: item.date,
    dateModified: item.date,
    image: absoluteUrl(item.gallery?.websiteScreens[0]?.src || siteConfig.defaultOgImage),
    author: {
      '@type': 'Person',
      name: siteConfig.specialistName,
      url: absoluteUrl('/about'),
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.siteName,
      url: siteConfig.siteUrl,
    },
    about: item.category,
    mentions: item.technologies,
  };
}

function LinkGrid({ items }: { items: { label: string; href: string }[] }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <Link
          className="group flex items-center justify-between gap-4 rounded-3xl border border-line bg-white p-5 text-sm font-extrabold text-ink shadow-glass transition hover:-translate-y-0.5 hover:border-slate-300"
          to={item.href}
          key={item.href}
        >
          {item.label}
          <ArrowRight className="h-4 w-4 text-accent transition group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  );
}

export function CasePage() {
  const { slug } = useParams();
  const { data } = useSiteData();
  const item = publishedCases.find((caseItem) => caseItem.slug === slug);

  if (!item) return <Navigate to="/cases" replace />;

  return (
    <PageTransition>
      <SeoHead
        title={item.seoTitle}
        description={item.seoDescription}
        canonicalPath={item.path}
        structuredData={caseStructuredData(item)}
      />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(circle_at_18%_10%,rgba(37,99,235,0.10),transparent_34%),radial-gradient(circle_at_80%_8%,rgba(16,185,129,0.10),transparent_32%)]" />
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Кейс</p>
              <h1 className={`mt-5 max-w-4xl text-4xl font-extrabold leading-[1.03] text-ink sm:text-6xl ${item.gallery ? 'case-real-heading' : ''}`}>{item.title}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{item.shortDescription}</p>
              <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold text-graphite">
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/78 px-4 py-2 shadow-glass">
                  <Layers3 className="h-4 w-4 text-accent" />
                  {item.category}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/78 px-4 py-2 shadow-glass">
                  <UserRound className="h-4 w-4 text-accent" />
                  {item.clientType}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/78 px-4 py-2 shadow-glass">
                  <CalendarDays className="h-4 w-4 text-accent" />
                  {new Date(item.date).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink href={data.site.telegramUrl} showArrow={false}>
                  <MessageCircle className="h-4 w-4" />
                  Обсудить похожую задачу
                </ButtonLink>
                <ButtonLink to="/cases" variant="secondary">Все кейсы</ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              {item.gallery?.websiteScreens[0] ? <div className="case-real-cover"><CaseScreenshotImage image={item.gallery.websiteScreens[0]} eager sizes="(max-width: 1024px) 90vw, 600px" /></div> : <CaseMedia label={`${item.category}: ${item.title}`} alt={item.imageAlt} />}
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          {item.gallery ? <CaseGallery gallery={item.gallery} /> : <Reveal><CaseExperience item={item} /></Reveal>}
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <article className="h-full rounded-premium border border-line bg-white/84 p-6 shadow-glass sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Задача</p>
                <h2 className="mt-4 text-2xl font-extrabold">Что нужно было сделать</h2>
                <p className="mt-4 text-base leading-7 text-muted">{item.task}</p>
              </article>
            </Reveal>
            <Reveal delay={0.05}>
              <article className="h-full rounded-premium border border-line bg-white/84 p-6 shadow-glass sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Исходная ситуация</p>
                <h2 className="mt-4 text-2xl font-extrabold">С чего начинался проект</h2>
                <p className="mt-4 text-base leading-7 text-muted">{item.initialSituation}</p>
              </article>
            </Reveal>
          </div>

          <Reveal className="mt-8">
            <section className="rounded-premium border border-line bg-white/84 p-6 shadow-glass sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Реализация</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight">Что было реализовано</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {item.workCompleted.map((work) => (
                  <div className="flex gap-3 text-sm font-semibold leading-6 text-graphite" key={work}>
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    {work}
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <Reveal>
              <section className="h-full rounded-premium border border-line bg-white/84 p-6 shadow-glass sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Сложности и решения</p>
                <h2 className="mt-4 text-3xl font-extrabold leading-tight">Что было важно учесть</h2>
                <div className="mt-6 grid gap-4">
                  {item.challenges.map((challenge) => (
                    <article className="rounded-3xl bg-slate-50 p-5" key={challenge.title}>
                      <h3 className="text-lg font-extrabold">{challenge.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">{challenge.description}</p>
                    </article>
                  ))}
                </div>
              </section>
            </Reveal>
            <Reveal delay={0.05}>
              <section className="h-full rounded-premium border border-line bg-white/84 p-6 shadow-glass sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Технологии</p>
                <h2 className="mt-4 text-2xl font-extrabold">Стек проекта</h2>
                <div className="mt-5">
                  <TechnologiesList items={item.technologies} />
                </div>
              </section>
            </Reveal>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {item.images.map((image) => (
              <Reveal key={image.id}>
                <div
                  data-image-id={image.id}
                  data-loading={image.loading}
                  data-decoding={image.decoding}
                  data-fetchpriority={image.fetchPriority || 'auto'}
                  style={{ aspectRatio: `${image.width} / ${image.height}` }}
                >
                  <CaseMedia label={`${item.title}: ${image.label}`} alt={image.alt} />
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-8">
            <CaseResultBlock items={item.result} />
          </Reveal>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <Reveal>
              <section className="rounded-premium border border-line bg-slate-50 p-6 shadow-glass sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Услуги</p>
                <h2 className="mt-4 text-2xl font-extrabold">Связанные направления</h2>
                <LinkGrid items={item.relatedServices} />
              </section>
            </Reveal>
            <Reveal delay={0.05}>
              <section className="rounded-premium border border-line bg-slate-50 p-6 shadow-glass sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Полезное</p>
                <h2 className="mt-4 text-2xl font-extrabold">Материалы по теме</h2>
                <LinkGrid items={item.relatedArticles} />
              </section>
            </Reveal>
          </div>

          <Reveal className="mt-8">
            <section className="rounded-premium border border-line bg-white/84 p-6 shadow-glass sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Другие кейсы</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight">Похожие проекты</h2>
              <div className="mt-6">
                <RelatedCases currentSlug={item.slug} />
              </div>
            </section>
          </Reveal>
        </Container>
      </section>
      <CallToAction />
    </PageTransition>
  );
}
