import { ArrowUpRight } from 'lucide-react';
import { Service } from '../data/site';
import { useSiteData } from '../hooks/useSiteData';
import { createCartKey, parseExactPrice } from '../utils/cart';
import { AddToCartButton } from './AddToCartButton';

type ServiceCardProps = {
  service: Service;
};

export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = service.icon;
  const { data } = useSiteData();
  const priceText = service.priceText || 'Цена уточняется после обсуждения';
  const cartItem = {
    key: createCartKey('service', service.slug),
    id: service.slug,
    type: 'service' as const,
    title: service.title,
    category: service.category,
    priceText,
    unitPrice: parseExactPrice(priceText),
    quantity: 1,
    description: service.lead,
  };

  return (
    <article
      className="group block rounded-premium border border-line bg-white/78 p-6 shadow-glass transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-soft"
    >
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-100 text-ink transition group-hover:bg-ink group-hover:text-white">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            {service.category && (
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-accent">{service.category}</div>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {service.badge ? (
                <span className="max-w-full overflow-wrap-anywhere rounded-full bg-blue-50 px-3 py-1 text-xs font-bold leading-5 text-accent">
                  {service.badge}
                </span>
              ) : null}
              {service.isPopular ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-graphite">Популярно</span>
              ) : null}
            </div>
          </div>
        </div>
        <AddToCartButton item={cartItem} />
      </div>
      <h3 className="mt-7 text-2xl font-extrabold leading-tight">{service.title}</h3>
      <p className="mt-4 text-base leading-7 text-muted">{service.lead}</p>
      {service.priceText ? (
        <p className="mt-4 max-w-full overflow-wrap-anywhere whitespace-normal text-lg font-extrabold leading-7 text-accent">
          {service.priceText}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-2">
        {service.format && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-graphite">{service.format}</span>
        )}
        {service.duration && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-graphite">{service.duration}</span>
        )}
      </div>
      {service.outcome ? (
        <p className="mt-5 text-sm leading-6 text-muted">{service.outcome}</p>
      ) : null}
      <div className="mt-7 grid grid-cols-1 gap-2">
        <a
          className="inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-line bg-white px-4 text-sm font-extrabold text-accent shadow-glass transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-ink"
          href={data.site.telegramUrl}
          target="_blank"
          rel="noreferrer"
        >
          {service.buttonText || 'Подробнее'}
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}
