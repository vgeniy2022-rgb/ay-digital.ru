import { PriceGroup } from '../data/site';

type PriceCardProps = {
  group: PriceGroup;
  accent?: boolean;
};

export function PriceCard({ group, accent = false }: PriceCardProps) {
  return (
    <div
      className={`rounded-premium border p-6 shadow-glass ${
        accent ? 'border-blue-100 bg-blue-50/70 sm:p-8' : 'border-line bg-white/82'
      }`}
    >
      <div className={accent ? 'grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start' : ''}>
        <div>
          <h2 className="text-2xl font-extrabold">{group.title}</h2>
          {group.note && <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{group.note}</p>}
        </div>
        <div className={`${accent ? 'mt-0' : 'mt-5'} divide-y divide-line`}>
        {group.items.map((item) => (
          <div className="py-4" key={item.name}>
            <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:justify-between">
              <span className="min-w-0 text-sm font-extrabold leading-6 text-ink">{item.name}</span>
              <span className="max-w-full overflow-wrap-anywhere whitespace-normal text-left text-sm font-bold leading-6 text-accent sm:max-w-[48%] sm:text-right">{item.price}</span>
            </div>
            {item.description ? (
              <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
            ) : null}
            {item.includes?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.includes.map((include) => (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-graphite" key={include}>
                    {include}
                  </span>
                ))}
              </div>
            ) : null}
            {item.disclaimer ? (
              <p className="mt-3 rounded-2xl bg-blue-50 p-3 text-xs font-semibold leading-5 text-graphite">
                {item.disclaimer}
              </p>
            ) : null}
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
