import { Navigate, useParams } from 'react-router-dom';
import { CalendarDays, Check, Clock, Mail, MessageCircle, UserRound } from 'lucide-react';
import { ButtonLink } from '../components/ButtonLink';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { SeoHead } from '../components/SeoHead';
import { UsefulSection, WarningCard } from '../components/UsefulBlocks';
import { absoluteUrl, siteConfig } from '../config/site';
import {
  AppleIdProtectionIllustration,
  AppsIllustration,
  ChecklistIllustration,
  DataTransferIllustration,
  MacSecurityIllustration,
  ScamsIllustration,
  UsefulIllustration,
} from '../components/UsefulIllustrations';
import { UsefulArticle, usefulArticles } from '../data/useful';
import { getUsefulIllustrationConfig } from '../data/usefulIllustrations';
import { useSiteData } from '../hooks/useSiteData';

function createArticleSchema(article: UsefulArticle) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.seoDescription,
    url: absoluteUrl(article.path),
    inLanguage: 'ru-RU',
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    timeRequired: article.readingTime,
    image: absoluteUrl(siteConfig.defaultOgImage),
    author: {
      '@type': 'Person',
      name: article.author,
      url: siteConfig.siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.siteName,
      url: siteConfig.siteUrl,
    },
    mainEntityOfPage: absoluteUrl(article.path),
  };
}

function createFaqSchema(article: UsefulArticle) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function createServiceSchema(article: UsefulArticle) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Полезные услуги по теме статьи',
    itemListElement: article.relatedServices.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: service.label,
        url: absoluteUrl(service.href),
        provider: {
          '@type': 'Person',
          name: siteConfig.specialistName,
        },
        areaServed: siteConfig.areaServed,
      },
    })),
  };
}

function UsefulVisualBreak({ slug, sectionTitle }: { slug: string; sectionTitle: string }) {
  if (slug === 'data-transfer' && (sectionTitle === 'iPhone -> Android' || sectionTitle === 'Android -> iPhone')) {
    return (
      <Container>
        <Reveal>
          <div className="my-4 grid items-center gap-6 rounded-premium border border-line bg-white/72 p-5 shadow-glass lg:grid-cols-[0.9fr_1.1fr]">
            <div className="p-2">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Схема переноса</p>
              <h3 className="mt-3 text-2xl font-extrabold leading-tight">Данные лучше переносить по понятному маршруту</h3>
              <p className="mt-3 text-sm leading-6 text-muted">Сначала резервная копия, затем перенос фото, контактов, чатов и отдельная проверка приложений.</p>
            </div>
            <DataTransferIllustration compact />
          </div>
        </Reveal>
      </Container>
    );
  }

  if (slug === 'digital-hygiene' && sectionTitle === 'MacBook') {
    return (
      <Container>
        <Reveal>
          <div className="my-4 grid items-center gap-6 rounded-premium border border-line bg-white/72 p-5 shadow-glass lg:grid-cols-[1fr_1fr]">
            <MacSecurityIllustration compact />
            <div className="p-2">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">MacBook</p>
              <h3 className="mt-3 text-2xl font-extrabold leading-tight">Защита ноутбука начинается с базовых настроек</h3>
              <p className="mt-3 text-sm leading-6 text-muted">FileVault, пароль входа, iCloud и разрешения программ помогают снизить риск потери данных.</p>
            </div>
          </div>
        </Reveal>
      </Container>
    );
  }

  if (slug === 'scams' && sectionTitle === 'Apple ID') {
    return (
      <Container>
        <Reveal>
          <div className="my-4 grid items-center gap-6 rounded-premium border border-line bg-white/72 p-5 shadow-glass lg:grid-cols-[0.95fr_1.05fr]">
            <div className="p-2">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-600">Аккаунт</p>
              <h3 className="mt-3 text-2xl font-extrabold leading-tight">Код подтверждения и пароль нельзя передавать</h3>
              <p className="mt-3 text-sm leading-6 text-muted">Если кто-то просит войти в чужой аккаунт или назвать код, это повод остановиться и проверить ситуацию.</p>
            </div>
            <AppleIdProtectionIllustration compact />
          </div>
        </Reveal>
      </Container>
    );
  }

  if (slug === 'scams' && sectionTitle === 'Удалённый доступ') {
    return (
      <Container>
        <Reveal>
          <div className="my-4 grid items-center gap-6 rounded-premium border border-rose-100 bg-rose-50/60 p-5 shadow-glass lg:grid-cols-[1fr_1fr]">
            <ScamsIllustration compact />
            <div className="p-2">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-600">Удалённый доступ</p>
              <h3 className="mt-3 text-2xl font-extrabold leading-tight">Не показывайте экран незнакомым людям</h3>
              <p className="mt-3 text-sm leading-6 text-muted">Если человек видит экран, он может подсказать опасные действия или увидеть коды подтверждения.</p>
            </div>
          </div>
        </Reveal>
      </Container>
    );
  }

  if (slug === 'apps-checklists' && sectionTitle === 'Если приложения нет в App Store') {
    return (
      <Container>
        <Reveal>
          <div className="my-4 grid items-center gap-6 rounded-premium border border-line bg-white/72 p-5 shadow-glass lg:grid-cols-[1fr_1fr]">
            <AppsIllustration compact />
            <div className="p-2">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Приложения</p>
              <h3 className="mt-3 text-2xl font-extrabold leading-tight">Ищите официальный источник, а не случайный файл</h3>
              <p className="mt-3 text-sm leading-6 text-muted">Веб-версия, сайт разработчика и поддержка сервиса безопаснее файлов из неизвестных каналов.</p>
            </div>
          </div>
        </Reveal>
      </Container>
    );
  }

  if (slug === 'apps-checklists' && sectionTitle === 'Чек-листы') {
    return (
      <Container>
        <Reveal>
          <div className="my-4 grid items-center gap-6 rounded-premium border border-line bg-white/72 p-5 shadow-glass lg:grid-cols-[0.95fr_1.05fr]">
            <div className="p-2">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Проверка</p>
              <h3 className="mt-3 text-2xl font-extrabold leading-tight">Чек-лист помогает ничего не забыть</h3>
              <p className="mt-3 text-sm leading-6 text-muted">Перед продажей, покупкой или настройкой лучше пройтись по пунктам спокойно и по порядку.</p>
            </div>
            <ChecklistIllustration compact />
          </div>
        </Reveal>
      </Container>
    );
  }

  return null;
}

function ArticleHero({ article }: { article: UsefulArticle }) {
  const illustration = getUsefulIllustrationConfig(article.slug);

  return (
    <section className="py-14 sm:py-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.92fr]">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Полезное</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.05] text-ink sm:text-6xl">{article.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{article.description}</p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold text-graphite">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/78 px-4 py-2 shadow-glass">
                <CalendarDays className="h-4 w-4 text-accent" />
                Обновлено {new Date(article.updatedAt).toLocaleDateString('ru-RU')}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/78 px-4 py-2 shadow-glass">
                <Clock className="h-4 w-4 text-accent" />
                {article.readingTime}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/78 px-4 py-2 shadow-glass">
                <UserRound className="h-4 w-4 text-accent" />
                {article.author}
              </span>
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href={siteConfig.telegramUrl} showArrow={false}>Получить консультацию</ButtonLink>
              <ButtonLink to="/prices" variant="secondary">Смотреть цены</ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <figure
              aria-label={illustration.heroImageAlt}
              data-hero-image={illustration.heroImage}
              data-loading={illustration.loading}
              data-decoding={illustration.decoding}
              data-fetchpriority={illustration.fetchPriority}
              style={{ aspectRatio: `${illustration.width} / ${illustration.height}` }}
            >
              <UsefulIllustration variant={article.variant} />
            </figure>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function DirectAnswerBlock({ article }: { article: UsefulArticle }) {
  if (!article.directAnswer) return null;

  return (
    <section className="pb-8">
      <Container>
        <Reveal>
          <article className="rounded-premium border border-blue-100 bg-blue-50/70 p-6 shadow-glass sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Короткий ответ</p>
            <p className="mt-4 max-w-4xl text-xl font-extrabold leading-8 text-ink sm:text-2xl">{article.directAnswer}</p>
          </article>
        </Reveal>
      </Container>
    </section>
  );
}

function LongreadList({
  eyebrow,
  title,
  items,
  tone = 'blue',
}: {
  eyebrow: string;
  title: string;
  items: string[];
  tone?: 'blue' | 'amber' | 'emerald';
}) {
  const toneClass = {
    blue: 'bg-blue-50 text-accent',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  }[tone];

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">{title}</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {items.map((item, index) => (
            <Reveal delay={index * 0.025} key={item}>
              <div className="flex h-full gap-4 rounded-3xl border border-line bg-white/82 p-5 text-base font-semibold leading-7 text-graphite shadow-glass">
                <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${toneClass}`}>
                  <Check className="h-4 w-4" />
                </span>
                <p>{item}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function MistakesBlock({ mistakes }: { mistakes: UsefulArticle['mistakes'] }) {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Частые ошибки</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">Что чаще всего мешает решить задачу</h2>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {mistakes.map((mistake, index) => (
            <Reveal delay={index * 0.035} key={mistake.title}>
              <article className="h-full rounded-premium border border-line bg-white/82 p-6 shadow-glass">
                <h3 className="text-xl font-extrabold leading-tight">{mistake.title}</h3>
                <p className="mt-3 text-base leading-7 text-muted">{mistake.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FaqBlock({ faq }: { faq: UsefulArticle['faq'] }) {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">FAQ</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">Частые вопросы</h2>
        </Reveal>
        <div className="mt-8 grid gap-4">
          {faq.map((item, index) => (
            <Reveal delay={index * 0.02} key={item.question}>
              <details className="group rounded-3xl border border-line bg-white/82 p-5 shadow-glass">
                <summary className="cursor-pointer list-none text-lg font-extrabold leading-tight text-ink">
                  {item.question}
                </summary>
                <p className="mt-3 text-base leading-7 text-muted">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function AuthorBlock({ article }: { article: UsefulArticle }) {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <Reveal>
          <aside className="rounded-premium border border-line bg-white/82 p-6 shadow-glass sm:p-8" aria-label="Автор материала">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Автор</p>
            <div className="mt-5 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <h2 className="text-3xl font-extrabold leading-tight">{article.author}</h2>
                <p className="mt-3 text-base leading-7 text-muted">Частный IT-специалист. Регион: Владивосток. Формат работы: лично во Владивостоке и удалённо.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
                <ButtonLink to="/about" variant="secondary">Обо мне</ButtonLink>
                <ButtonLink to="/contacts" variant="secondary">Контакты</ButtonLink>
              </div>
            </div>
          </aside>
        </Reveal>
      </Container>
    </section>
  );
}

function LinkGrid({
  eyebrow,
  title,
  links,
}: {
  eyebrow: string;
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">{title}</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link, index) => (
            <Reveal delay={index * 0.025} key={`${link.href}-${link.label}`}>
              <ButtonLink to={link.href} variant="secondary" className="w-full justify-between">
                {link.label}
              </ButtonLink>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function UsefulArticlePage() {
  const { slug } = useParams();
  const { data } = useSiteData();
  const article = usefulArticles.find((item) => item.slug === slug);

  if (!article) {
    return <Navigate to="/useful" replace />;
  }

  return (
    <PageTransition>
      <SeoHead
        title={article.seoTitle}
        description={article.seoDescription}
        canonicalPath={`/useful/${article.slug}`}
        type="article"
        structuredData={[createArticleSchema(article), createFaqSchema(article), createServiceSchema(article)]}
      />
      <ArticleHero article={article} />
      <section className="pb-8">
        <Container>
          <Reveal>
            <nav aria-label="Содержание статьи" className="rounded-premium border border-line bg-white/82 p-6 shadow-glass">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Содержание статьи</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {article.sections.map((section, index) => (
                  <a
                    className="rounded-3xl bg-slate-50 px-4 py-3 text-sm font-bold text-graphite transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-accent"
                    href={`#section-${index + 1}`}
                    key={section.title}
                  >
                    {index + 1}. {section.title}
                  </a>
                ))}
                <a className="rounded-3xl bg-slate-50 px-4 py-3 text-sm font-bold text-graphite transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-accent" href="#faq">
                  FAQ
                </a>
              </div>
            </nav>
          </Reveal>
        </Container>
      </section>
      <DirectAnswerBlock article={article} />
      {article.warning && (
        <section className="pb-8">
          <Container>
            <WarningCard>{article.warning}</WarningCard>
          </Container>
        </section>
      )}
      {article.sections.map((section, index) => (
        <div id={`section-${index + 1}`} key={section.title}>
          <UsefulVisualBreak slug={article.slug} sectionTitle={section.title} />
          <UsefulSection section={section} />
        </div>
      ))}
      {article.selfHelp?.length ? (
        <LongreadList eyebrow="Самостоятельно" title="Когда можно решить самому" items={article.selfHelp} tone="blue" />
      ) : null}
      {article.specialistHelp?.length ? (
        <LongreadList eyebrow="Помощь специалиста" title="Когда лучше не экспериментировать" items={article.specialistHelp} tone="amber" />
      ) : null}
      <LongreadList eyebrow="Советы" title="Что лучше сделать заранее" items={article.advice} tone="emerald" />
      <LongreadList eyebrow="Предупреждения" title="Где стоит быть осторожнее" items={article.warnings} tone="amber" />
      <MistakesBlock mistakes={article.mistakes} />
      <div id="faq">
        <FaqBlock faq={article.faq} />
      </div>
      <LinkGrid eyebrow="Похожие статьи" title="Что ещё почитать по теме" links={article.relatedArticles} />
      <LinkGrid
        eyebrow="Полезные услуги"
        title="Куда можно перейти дальше"
        links={[
          ...article.relatedServices,
          { label: 'Цены', href: '/prices' },
          { label: 'Контакты', href: '/contacts' },
          { label: 'Главная', href: '/' },
        ]}
      />
      <AuthorBlock article={article} />
      {article.conclusion ? (
        <section className="py-10 sm:py-14">
          <Container>
            <Reveal>
              <div className="rounded-premium border border-line bg-slate-50 p-7 shadow-glass sm:p-10">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Вывод</p>
                <p className="mt-4 max-w-4xl text-xl font-extrabold leading-8 text-ink sm:text-2xl">{article.conclusion}</p>
              </div>
            </Reveal>
          </Container>
        </section>
      ) : null}
      <section className="py-12 sm:py-16">
        <Container>
          <Reveal>
            <div className="rounded-premium border border-line bg-ink p-8 text-white shadow-soft sm:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-200">Нужна помощь?</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">{article.cta.title}</h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-blue-50">{article.cta.description}</p>
              <div className="mt-6 grid gap-3 text-sm font-semibold text-blue-50 sm:grid-cols-2 lg:grid-cols-3">
                {['Компьютерная помощь', 'Windows', 'MacBook', 'Перенос данных', 'Создание сайтов', 'Разработка приложений'].map((item) => (
                  <span className="inline-flex items-center gap-2" key={item}>
                    <Check className="h-4 w-4 text-emerald-300" />
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={data.site.telegramUrl} variant="secondary" showArrow={false}>
                  <MessageCircle className="h-4 w-4" />
                  Telegram
                </ButtonLink>
                <ButtonLink href={data.site.whatsappUrl} variant="secondary" showArrow={false}>
                  <Mail className="h-4 w-4" />
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
