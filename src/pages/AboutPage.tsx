import { Code2, Laptop, MapPin, MessageCircle, MonitorSmartphone, Wrench } from 'lucide-react';
import { useState } from 'react';
import { businessPortraitUrl } from '../assets/portrait';
import { ButtonLink } from '../components/ButtonLink';
import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { EditorialPhoto } from '../components/EditorialPhoto';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { SeoHead } from '../components/SeoHead';
import { AuthorCard, CasePreviewCard, TrustPrinciples } from '../components/TrustBlocks';
import { absoluteUrl, siteConfig } from '../config/site';
import { featuredCases } from '../data/cases';
import { editorialMedia } from '../data/editorialMedia';
import { pageMeta } from '../data/pageMeta';
import { useSiteData } from '../hooks/useSiteData';

const directions = [
  'создание сайтов',
  'веб-приложения',
  'мобильные приложения',
  'компьютерная помощь',
  'Windows',
  'MacBook',
  'перенос данных',
  'настройка телефонов',
  'подбор техники Apple, Samsung и Xiaomi',
];

const taskGroups = [
  { title: 'Сайты и онлайн-сервисы', description: 'Структура страниц, интерфейс, адаптация под телефон, SEO-основа, управление контентом и публикация.', icon: MonitorSmartphone },
  { title: 'Компьютеры и ноутбуки', description: 'Настройка Windows и macOS, установка программ, подготовка нового устройства, перенос данных.', icon: Laptop },
  { title: 'Телефоны и техника', description: 'Настройка iPhone и Android, перенос данных, консультации по выбору Apple, Samsung и Xiaomi.', icon: Wrench },
];

const processSteps = ['вы описываете задачу', 'я уточняю детали', 'обсуждаем объём работы', 'согласуем формат и сроки', 'я выполняю работу и объясняю, что сделано'];
const technologies = ['React', 'Vite', 'TypeScript', 'Supabase', 'Swift', 'SwiftUI', 'Google Apps Script', 'Windows', 'macOS'];
const faq = [
  { question: 'Я буду общаться напрямую с разработчиком?', answer: 'Да. Задачу, структуру, стоимость, правки и запуск вы обсуждаете напрямую со мной, без передачи проекта между менеджерами.' },
  { question: 'В каком регионе можно обратиться?', answer: 'Основной регион — Владивосток. Часть задач можно обсудить и выполнить удалённо.' },
  { question: 'С какими устройствами помогаете?', answer: 'Можно обратиться по Windows, macOS, MacBook, iPhone, Android и подбору техники Apple, Samsung и Xiaomi.' },
  { question: 'Можно ли заранее понять стоимость?', answer: 'Перед началом я уточняю задачу и объём работы. Цены на сайте ориентировочные, финальная стоимость зависит от деталей.' },
  { question: 'Вы сохраняете данные?', answer: 'Я стараюсь сохранять данные, когда это технически возможно. Если есть риск потери, это нужно обсудить до начала работы.' },
  { question: 'Можно ли обратиться по сайту или приложению?', answer: 'Да, можно обсудить сайт, веб-приложение, админку, MVP или автоматизацию небольшой задачи.' },
];

function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteConfig.siteUrl}/#person`,
    name: siteConfig.specialistName,
    jobTitle: 'Частный веб-разработчик и IT-специалист',
    url: absoluteUrl('/about'),
    telephone: siteConfig.phone,
    sameAs: [siteConfig.telegramUrl],
    worksFor: {
      '@type': 'Organization',
      '@id': `${siteConfig.siteUrl}/#identity`,
      name: siteConfig.siteName,
      url: siteConfig.siteUrl,
    },
    areaServed: {
      '@type': 'City',
      name: siteConfig.city,
    },
    knowsAbout: directions,
  };
}

function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function AboutPage() {
  const [isPortraitVisible, setIsPortraitVisible] = useState(Boolean(businessPortraitUrl));
  const { data } = useSiteData();

  return (
    <PageTransition>
      <SeoHead
        title="Частный веб-разработчик во Владивостоке — Александр | SITEVL"
        description="Разработка сайтов, веб-приложений и мобильных продуктов напрямую со специалистом: без менеджеров, с понятными этапами, стоимостью и поддержкой."
        canonicalPath="/about"
        structuredData={[personSchema(), faqSchema()]}
      />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(circle_at_18%_12%,rgba(37,99,235,0.10),transparent_34%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.10),transparent_30%)]" />
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Обо мне</p>
              <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.03] text-ink sm:text-6xl">
                {pageMeta.about.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
                Разрабатываю сайты, веб-приложения и мобильные продукты, а также помогаю с техникой. Работаю лично во Владивостоке и удалённо: вы обсуждаете задачу, решения и правки напрямую со мной, без менеджеров.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink href={data.site.telegramUrl} showArrow={false}>
                  <MessageCircle className="h-4 w-4" />
                  Написать в Telegram
                </ButtonLink>
                <ButtonLink to="/website-development-vladivostok" variant="secondary">Создание сайтов</ButtonLink>
                <ButtonLink to="/ai-website" variant="secondary">Получить AI-концепт</ButtonLink>
                <ButtonLink to="/cases" variant="secondary">Смотреть кейсы</ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="relative min-h-[420px] overflow-hidden rounded-premium border border-line bg-slate-50 shadow-soft">
                {isPortraitVisible && businessPortraitUrl ? (
                  <img
                    className="h-full min-h-[420px] w-full object-cover"
                    src={businessPortraitUrl}
                    alt="Деловой портрет Александра, частного IT-специалиста во Владивостоке"
                    width={720}
                    height={900}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    onError={() => setIsPortraitVisible(false)}
                  />
                ) : (
                  <EditorialPhoto
                    media={editorialMedia.developerWorkspace}
                    aspect="portrait"
                    className="min-h-[420px] rounded-none border-0 shadow-none"
                    caption="Рабочая среда и процесс разработки"
                  >
                    <div className="photo-ui-note">
                      <strong>Работа над проектом SITEVL</strong>
                      <span>Проектирование, разработка и настройка цифровых решений.</span>
                    </div>
                  </EditorialPhoto>
                )}
              </div>
            </Reveal>
          </div>

          <Reveal className="mt-8">
            <section className="rounded-premium border border-line bg-ink p-7 text-white shadow-soft sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-200">Прямая работа</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight">Один специалист отвечает за проект от структуры до запуска</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <h3 className="text-lg font-extrabold">Без менеджеров</h3>
                  <p className="mt-2 text-sm leading-6 text-blue-50">Вопросы по интерфейсу, логике, срокам и правкам не теряются между участниками.</p>
                </article>
                <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <h3 className="text-lg font-extrabold">Проверяемый результат</h3>
                  <p className="mt-2 text-sm leading-6 text-blue-50">До начала фиксируем состав работы, а перед передачей проверяем страницы, сценарии, формы и адаптивность.</p>
                </article>
                <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <h3 className="text-lg font-extrabold">После запуска</h3>
                  <p className="mt-2 text-sm leading-6 text-blue-50">30 дней технической гарантии входят в запуск. Дальнейшая поддержка SITEVL Care подключается только по желанию.</p>
                </article>
              </div>
            </section>
          </Reveal>
        </Container>
      </section>

      <section className="pb-16">
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            {taskGroups.map((group, index) => {
              const Icon = group.icon;
              return (
                <Reveal delay={index * 0.04} key={group.title}>
                  <article className="h-full rounded-premium border border-line bg-white/84 p-6 shadow-glass">
                    <Icon className="h-8 w-8 text-accent" />
                    <h2 className="mt-5 text-2xl font-extrabold leading-tight">{group.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-muted">{group.description}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <Reveal className="mt-8">
            <section className="rounded-premium border border-line bg-white/84 p-7 shadow-glass sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Чем занимаюсь</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight">С какими задачами можно обратиться</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {directions.map((item) => (
                  <div className="rounded-3xl bg-slate-50 p-4 text-sm font-bold text-graphite" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <Reveal>
              <section className="h-full rounded-premium border border-line bg-white/84 p-7 shadow-glass sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Процесс</p>
                <h2 className="mt-4 text-3xl font-extrabold leading-tight">Как проходит работа</h2>
                <div className="mt-6 grid gap-4">
                  {processSteps.map((step, index) => (
                    <div className="flex gap-4 rounded-3xl bg-slate-50 p-4" key={step}>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-sm font-extrabold text-accent shadow-glass">{index + 1}</span>
                      <p className="text-sm font-semibold leading-6 text-graphite">{step}</p>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
            <Reveal delay={0.06}>
              <TrustPrinciples />
            </Reveal>
          </div>

          <Reveal className="mt-8">
            <section className="rounded-premium border border-line bg-slate-50 p-7 shadow-glass sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Инструменты</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight">Технологии и системы</h2>
              <div className="mt-6 flex flex-wrap gap-2">
                {technologies.map((item) => (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-graphite shadow-glass" key={item}>
                    <Code2 className="h-4 w-4 text-accent" />
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal className="mt-8">
            <section className="rounded-premium border border-line bg-white/84 p-7 shadow-glass sm:p-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Кейсы</p>
                  <h2 className="mt-4 text-3xl font-extrabold leading-tight">Реальные проекты</h2>
                </div>
                <ButtonLink to="/cases" variant="secondary">Все кейсы</ButtonLink>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {featuredCases.map((item) => (
                  <CasePreviewCard item={item} key={item.slug} />
                ))}
              </div>
            </section>
          </Reveal>

          <div className="mt-8 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <AuthorCard />
            </Reveal>
            <Reveal delay={0.06}>
              <section className="rounded-premium border border-line bg-white/84 p-7 shadow-glass sm:p-8">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">FAQ</p>
                <h2 className="mt-4 text-3xl font-extrabold leading-tight">Вопросы об обращении</h2>
                <div className="mt-6 grid gap-3">
                  {faq.map((item) => (
                    <details className="rounded-3xl bg-slate-50 p-5" key={item.question}>
                      <summary className="cursor-pointer list-none text-base font-extrabold text-ink">{item.question}</summary>
                      <p className="mt-3 text-sm leading-6 text-muted">{item.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            </Reveal>
          </div>

          <Reveal className="mt-8">
            <section className="rounded-premium border border-line bg-white/84 p-7 shadow-glass sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Регион</p>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <MapPin className="h-8 w-8 shrink-0 text-accent" />
                <p className="text-base font-semibold leading-7 text-graphite">
                  Работаю во Владивостоке и удалённо. Формат зависит от задачи: часть вопросов удобнее решить онлайн, а задачи с устройствами можно согласовать лично.
                </p>
              </div>
            </section>
          </Reveal>
        </Container>
      </section>
      <CallToAction />
    </PageTransition>
  );
}
