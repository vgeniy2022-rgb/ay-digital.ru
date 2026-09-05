import { ArrowRight, CheckCircle2, Code2, ExternalLink, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProjectCase, publishedCases } from '../data/cases';
import { getServiceCategoryMedia } from '../data/editorialMedia';
import { EditorialPhoto } from './EditorialPhoto';
import { CaseScreenshotImage } from './CaseGallery';

export function AuthorCard() {
  return (
    <article className="rounded-premium border border-line bg-white/84 p-6 shadow-glass sm:p-8">
      <div className="flex gap-5">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-slate-100 text-ink">
          <UserRound className="h-8 w-8" />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Автор</p>
          <h2 className="mt-2 text-2xl font-extrabold">Александр</h2>
          <p className="mt-3 text-base leading-7 text-muted">
            Частный IT-специалист. Работаю лично во Владивостоке и удалённо: сайты, веб-приложения, Windows, MacBook, перенос данных, телефоны и подбор техники.
          </p>
          <Link className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-accent transition hover:text-ink" to="/about">
            Подробнее обо мне
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function TrustPrinciples({ compact = false }: { compact?: boolean }) {
  const principles = [
    'объясняю понятным языком',
    'не навязываю лишние услуги',
    'заранее обсуждаю объём работы',
    'сохраняю данные, когда это технически возможно',
    'работаю лично',
  ];

  return (
    <div className={`rounded-premium border border-line bg-slate-50 p-6 shadow-glass ${compact ? '' : 'sm:p-8'}`}>
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Принципы</p>
      <h2 className="mt-3 text-2xl font-extrabold">Как я подхожу к работе</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {principles.map((item) => (
          <div className="flex gap-3 text-sm font-semibold leading-6 text-graphite" key={item}>
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CaseMedia({ label, alt }: { label: string; alt: string }) {
  const media = getServiceCategoryMedia(label);

  return (
    <EditorialPhoto media={{ ...media, alt, label }} aspect="wide" />
  );
}

export function TechnologiesList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-graphite" key={item}>
          <Code2 className="h-3.5 w-3.5 text-accent" />
          {item}
        </span>
      ))}
    </div>
  );
}

export function CaseResultBlock({ items }: { items: string[] }) {
  return (
    <div className="rounded-premium border border-emerald-100 bg-emerald-50/70 p-6 shadow-glass sm:p-8">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Результат</p>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div className="flex gap-3 text-sm font-semibold leading-6 text-emerald-950" key={item}>
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CasePreviewCard({ item }: { item: ProjectCase }) {
  const caseMedia = getServiceCategoryMedia(`${item.category} ${item.title}`);

  return (
    <Link
      className="group block h-full rounded-premium border border-line bg-white/84 p-6 shadow-glass transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-soft"
      to={item.path}
    >
      {item.gallery?.websiteScreens[0] ? <div className="case-real-cover"><CaseScreenshotImage image={item.gallery.websiteScreens[0]} sizes="(max-width: 768px) 85vw, 540px" /></div> : <EditorialPhoto
        media={{ ...caseMedia, alt: item.imageAlt, label: item.category }}
        aspect="wide"
        className="shadow-none"
      />}
      <div className="mt-6 flex flex-wrap gap-2">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-accent">{item.category}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-graphite">{item.clientType}</span>
      </div>
      <h2 className="mt-4 text-2xl font-extrabold leading-tight">{item.title}</h2>
      <p className="mt-3 text-sm leading-6 text-muted">{item.shortDescription}</p>
      <div className="mt-5">
        <TechnologiesList items={item.technologies.slice(0, 5)} />
      </div>
      <div className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-accent transition group-hover:text-ink">
        Смотреть кейс
        <ExternalLink className="h-4 w-4" />
      </div>
    </Link>
  );
}

export function RelatedCases({ currentSlug }: { currentSlug?: string }) {
  const items = publishedCases.filter((item) => item.slug !== currentSlug).slice(0, 3);
  if (!items.length) return null;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {items.map((item) => (
        <CasePreviewCard item={item} key={item.slug} />
      ))}
    </div>
  );
}
