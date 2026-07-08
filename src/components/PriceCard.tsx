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
          <div className="flex items-start justify-between gap-5 py-4" key={item.name}>
            <span className="text-sm font-semibold leading-6 text-ink">{item.name}</span>
            <span className="shrink-0 text-sm font-bold text-accent">{item.price}</span>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
