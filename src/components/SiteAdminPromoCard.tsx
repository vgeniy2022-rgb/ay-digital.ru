import { ArrowUpRight } from 'lucide-react';
import { siteAdminPromo } from '../data/site';
import { createCartKey, parseExactPrice } from '../utils/cart';
import { AddToCartButton } from './AddToCartButton';

type SiteAdminPromoCardProps = {
  compact?: boolean;
};

export function SiteAdminPromoCard({ compact = false }: SiteAdminPromoCardProps) {
  if (!siteAdminPromo.isActive) return null;

  return (
    <article className={`rounded-premium border border-blue-100 bg-blue-50/70 p-6 shadow-glass ${compact ? '' : 'sm:p-8'}`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-extrabold text-accent shadow-glass">
            {siteAdminPromo.badge}
          </div>
          <h3 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">{siteAdminPromo.title}</h3>
          <p className="mt-2 text-sm font-bold uppercase tracking-[0.14em] text-muted">{siteAdminPromo.subtitle}</p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">{siteAdminPromo.description}</p>
          <p className="mt-3 text-sm font-semibold leading-6 text-graphite">{siteAdminPromo.note}</p>
        </div>
        <div className="flex shrink-0 items-start gap-3 rounded-3xl bg-white p-5 shadow-glass sm:min-w-44">
          <div>
            <div className="text-sm font-bold text-muted line-through">{siteAdminPromo.oldPrice}</div>
            <div className="mt-1 text-3xl font-extrabold text-accent">{siteAdminPromo.newPrice}</div>
            <div className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-muted">вместо 35 000 ₽</div>
          </div>
          <AddToCartButton
            item={{
              key: createCartKey('package', siteAdminPromo.type),
              id: siteAdminPromo.type,
              type: 'package',
              title: siteAdminPromo.title,
              category: 'Сайты',
              priceText: siteAdminPromo.newPrice,
              unitPrice: parseExactPrice(siteAdminPromo.newPrice),
              quantity: 1,
              description: siteAdminPromo.description,
            }}
          />
        </div>
      </div>
      <div className="mt-6">
        <a
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-graphite"
          href={siteAdminPromo.href}
          target="_blank"
          rel="noreferrer"
        >
          {siteAdminPromo.buttonText}
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}
