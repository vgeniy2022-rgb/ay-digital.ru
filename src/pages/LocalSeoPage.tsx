import { Link, Navigate, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Laptop, MapPin, MessageCircle, MonitorSmartphone } from 'lucide-react';
import { ButtonLink } from '../components/ButtonLink';
import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { SeoHead } from '../components/SeoHead';
import { absoluteUrl, siteConfig } from '../config/site';
import { localHubLinks, localSeoPages, primorskyCities, LocalSeoPage as LocalSeoPageData } from '../data/localSeo';
import { useSiteData } from '../hooks/useSiteData';

const hubFaq = [
  {
    question: 'Какие услуги доступны во Владивостоке?',
    answer: 'Во Владивостоке можно обсудить сайты, веб-приложения, компьютерную помощь, настройку Windows и MacBook, перенос данных, настройку телефонов и подбор техники.',
  },
  {
    question: 'Можно ли обратиться из другого города Приморского края?',
    answer: 'Да, многие задачи удобно решать удалённо: консультации, сайты, настройку программ, диагностику по симптомам и помощь с цифровыми сервисами.',
  },
  {
    question: 'Обещается ли выезд за пределы Владивостока?',
    answer: 'Нет, выезд за пределы Владивостока не обещается автоматически. Формат определяется после предварительной консультации и понимания задачи.',
  },
  {
    question: 'Какие задачи требуют личного присутствия?',
    answer: 'Обычно личное присутствие может понадобиться для физической замены комплектующих, работ с устройством, которое не включается, или задач с оборудованием на месте.',
  },
];

const hubServiceLinks = [
  { label: 'Компьютерная помощь во Владивостоке', href: '/computer-help-vladivostok' },
  { label: 'Создание сайтов во Владивостоке', href: '/website-development-vladivostok' },
  { label: 'Настройка Windows', href: '/windows-setup-vladivostok' },
  { label: 'Настройка MacBook', href: '/macbook-setup-vladivostok' },
  { label: 'Перенос данных', href: '/data-transfer-vladivostok' },
  { label: 'Цены', href: '/prices' },
];

const hubArticleLinks = [
  { label: 'Как ускорить Windows', href: '/useful/speed-up-windows' },
  { label: 'Как выбрать ноутбук', href: '/useful/how-to-choose-laptop' },
  { label: 'Когда бизнесу нужен сайт', href: '/useful/when-business-needs-website' },
];

function faqSchema(faq: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

function localServiceSchema(page: LocalSeoPageData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.h1,
    serviceType: page.serviceType === 'computer-help' ? 'Компьютерная помощь' : 'Создание сайтов',
    description: page.description,
    url: absoluteUrl(page.path),
    provider: { '@id': `${siteConfig.siteUrl}/#person` },
    areaServed: { '@type': 'City', name: page.city },
  };
}

function HubSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'IT-услуги во Владивостоке и Приморском крае',
    description: 'Локальный хаб услуг Александра: Владивосток, удалённая помощь по Приморскому краю и городские страницы для Артёма, Уссурийска и Находки.',
    url: absoluteUrl('/primorsky-krai'),
    inLanguage: 'ru-RU',
  };
}

function LinkGrid({ items }: { items: { label: string; href: string }[] }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

function ListCard({ title, items, tone = 'blue' }: { title: string; items: string[]; tone?: 'blue' | 'emerald' | 'slate' }) {
  const className = {
    blue: 'bg-blue-50 text-accent',
    emerald: 'bg-emerald-50 text-emerald-700',
    slate: 'bg-slate-100 text-graphite',
  }[tone];

  return (
    <div className="h-full rounded-premium border border-line bg-white/84 p-6 shadow-glass">
      <h2 className="text-2xl font-extrabold leading-tight">{title}</h2>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div className="flex gap-3 text-sm font-semibold leading-6 text-graphite" key={item}>
            <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${className}`}>
              <CheckCircle2 className="h-4 w-4" />
            </span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function LocalHubPage() {
  const { data } = useSiteData();
  return (
    <PageTransition>
      <SeoHead
        title="IT-услуги во Владивостоке и Приморском крае — AY Digital"
        description="Локальный хаб AY Digital: услуги во Владивостоке, удалённая помощь по Приморскому краю, сайты, компьютерная помощь, Windows, MacBook и консультации."
        canonicalPath="/primorsky-krai"
        structuredData={[HubSchema(), faqSchema(hubFaq)]}
      />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(circle_at_18%_12%,rgba(37,99,235,0.10),transparent_34%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.10),transparent_30%)]" />
        <Container>
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Приморский край</p>
            <h1 className="mt-5 max-w-5xl text-4xl font-extrabold leading-[1.03] text-ink sm:text-6xl">
              IT-услуги во Владивостоке и удалённо по Приморскому краю
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
              Основной регион работы — Владивосток. По Приморскому краю можно обратиться за удалённой консультацией, помощью с сайтами, настройкой программ, Windows, MacBook, телефонами и цифровыми задачами. Формат зависит от конкретной задачи.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href={data.site.telegramUrl} showArrow={false}>
                <MessageCircle className="h-4 w-4" />
                Написать в Telegram
              </ButtonLink>
              <ButtonLink to="/prices" variant="secondary">Смотреть цены</ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <div className="grid gap-5 md:grid-cols-2">
            <Reveal>
              <ListCard
                title="Удалённо по Приморскому краю"
                items={['создание сайтов и админок', 'консультации по технике', 'настройка программ', 'помощь с Windows и macOS', 'разбор цифровых задач']}
                tone="emerald"
              />
            </Reveal>
            <Reveal delay={0.05}>
              <ListCard
                title="Во Владивостоке"
                items={['компьютерная помощь', 'настройка ноутбуков и ПК', 'перенос данных', 'настройка телефонов', 'задачи, где нужен физический доступ к устройству']}
              />
            </Reveal>
          </div>

          <Reveal className="mt-8">
            <section className="rounded-premium border border-line bg-slate-50 p-7 shadow-glass sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Города</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight">Где можно обратиться</h2>
              <div className="mt-6 flex flex-wrap gap-2">
                {primorskyCities.map((city) => (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-graphite shadow-glass" key={city}>
                    <MapPin className="h-4 w-4 text-accent" />
                    {city}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-sm font-semibold leading-6 text-muted">
                Наличие города в списке не означает автоматический выезд. Сначала обсуждается задача, затем определяется подходящий формат.
              </p>
            </section>
          </Reveal>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Reveal>
              <ListCard
                title="Удобно выполнять удалённо"
                items={['сайты и лендинги', 'сайты с админкой', 'установка и настройка программ', 'консультации по выбору техники', 'проверка типовых ошибок и настроек']}
                tone="emerald"
              />
            </Reveal>
            <Reveal delay={0.05}>
              <ListCard
                title="Может требовать личного присутствия"
                items={['замена SSD или комплектующих', 'устройство не включается', 'перенос данных с повреждённого носителя', 'работа с оборудованием на месте', 'сложная аппаратная диагностика']}
                tone="slate"
              />
            </Reveal>
          </div>

          <Reveal className="mt-8">
            <section className="rounded-premium border border-line bg-white/84 p-7 shadow-glass sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Городские страницы</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight">Отдельные направления</h2>
              <LinkGrid items={localHubLinks} />
            </section>
          </Reveal>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <Reveal>
              <section className="rounded-premium border border-line bg-white/84 p-7 shadow-glass sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Услуги</p>
                <h2 className="mt-4 text-2xl font-extrabold">Основные страницы</h2>
                <LinkGrid items={hubServiceLinks} />
              </section>
            </Reveal>
            <Reveal delay={0.05}>
              <section className="rounded-premium border border-line bg-white/84 p-7 shadow-glass sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Полезное</p>
                <h2 className="mt-4 text-2xl font-extrabold">Материалы по теме</h2>
                <LinkGrid items={hubArticleLinks} />
              </section>
            </Reveal>
          </div>

          <Reveal className="mt-8">
            <section className="rounded-premium border border-line bg-slate-50 p-7 shadow-glass sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">FAQ</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight">Частые вопросы</h2>
              <div className="mt-6 grid gap-3">
                {hubFaq.map((item) => (
                  <details className="rounded-3xl bg-white p-5" key={item.question}>
                    <summary className="cursor-pointer list-none text-base font-extrabold text-ink">{item.question}</summary>
                    <p className="mt-3 text-sm leading-6 text-muted">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </Reveal>
        </Container>
      </section>
      <CallToAction />
    </PageTransition>
  );
}

function CityPage({ page }: { page: LocalSeoPageData }) {
  const { data } = useSiteData();
  const icon = page.serviceType === 'computer-help' ? Laptop : MonitorSmartphone;
  const Icon = icon;
  const formatLabel = page.serviceType === 'computer-help' ? 'Удалённая диагностика и консультация' : 'Полностью удалённая разработка';

  return (
    <PageTransition>
      <SeoHead
        title={page.title}
        description={page.description}
        canonicalPath={page.path}
        structuredData={[localServiceSchema(page), faqSchema(page.faq)]}
      />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(circle_at_18%_12%,rgba(37,99,235,0.10),transparent_34%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.10),transparent_30%)]" />
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.82fr] lg:items-center">
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">{page.city}</p>
              <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.03] text-ink sm:text-6xl">{page.h1}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{page.intro}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink href={data.site.telegramUrl} showArrow={false}>
                  <MessageCircle className="h-4 w-4" />
                  Написать в Telegram
                </ButtonLink>
                <ButtonLink to="/prices" variant="secondary">Смотреть цены</ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="rounded-premium border border-line bg-white/84 p-7 shadow-glass sm:p-8">
                <div className="grid h-16 w-16 place-items-center rounded-3xl bg-slate-100 text-ink">
                  <Icon className="h-8 w-8" />
                </div>
                <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-accent">Формат</p>
                <h2 className="mt-3 text-2xl font-extrabold">{formatLabel}</h2>
                <p className="mt-4 text-base leading-7 text-muted">{page.format}</p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <div className="grid gap-5 lg:grid-cols-3">
            <Reveal>
              <ListCard title="Примеры задач" items={page.taskExamples} />
            </Reveal>
            <Reveal delay={0.05}>
              <ListCard title="Что удобно удалённо" items={page.remoteTasks} tone="emerald" />
            </Reveal>
            <Reveal delay={0.1}>
              <ListCard title="Что требует проверки формата" items={page.personalTasks} tone="slate" />
            </Reveal>
          </div>

          <Reveal className="mt-8">
            <section className="rounded-premium border border-line bg-white/84 p-7 shadow-glass sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Связанные страницы</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight">Куда перейти дальше</h2>
              <LinkGrid items={[page.relatedMainPage, ...page.relatedServices]} />
            </section>
          </Reveal>

          <Reveal className="mt-8">
            <section className="rounded-premium border border-line bg-slate-50 p-7 shadow-glass sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Полезное</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight">Материалы по теме</h2>
              <LinkGrid items={page.relatedArticles} />
            </section>
          </Reveal>

          <Reveal className="mt-8">
            <section className="rounded-premium border border-line bg-white/84 p-7 shadow-glass sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">FAQ</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight">Частые вопросы</h2>
              <div className="mt-6 grid gap-3">
                {page.faq.map((item) => (
                  <details className="rounded-3xl bg-slate-50 p-5" key={item.question}>
                    <summary className="cursor-pointer list-none text-base font-extrabold text-ink">{item.question}</summary>
                    <p className="mt-3 text-sm leading-6 text-muted">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal className="mt-8">
            <section className="noise rounded-premium border border-line bg-ink p-8 text-white shadow-soft sm:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-200">Консультация</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">{page.ctaTitle}</h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-blue-50">{page.ctaText}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink href={data.site.telegramUrl} variant="secondary" showArrow={false}>Telegram</ButtonLink>
                <ButtonLink href={data.site.whatsappUrl} variant="secondary" showArrow={false}>WhatsApp</ButtonLink>
              </div>
            </section>
          </Reveal>
        </Container>
      </section>
    </PageTransition>
  );
}

export function LocalSeoPage() {
  const location = useLocation();

  if (location.pathname === '/primorsky-krai') return <LocalHubPage />;

  const page = localSeoPages.find((item) => item.path === location.pathname);
  if (!page) return <Navigate to="/primorsky-krai" replace />;

  return <CityPage page={page} />;
}
