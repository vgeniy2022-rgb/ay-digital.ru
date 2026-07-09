import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Service } from '../data/site';

type ServiceCardProps = {
  service: Service;
};

export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <Link
      to={service.path}
      className="group block rounded-premium border border-line bg-white/78 p-6 shadow-glass transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-soft"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-ink transition group-hover:bg-ink group-hover:text-white">
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex flex-col items-end gap-2">
          {service.badge ? (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-accent">{service.badge}</span>
          ) : null}
          {service.isPopular ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-graphite">Популярно</span>
          ) : null}
        </div>
        <ArrowUpRight className="h-5 w-5 text-muted transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent" />
      </div>
      {service.category && (
        <div className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-accent">{service.category}</div>
      )}
      <h3 className="mt-7 text-2xl font-extrabold leading-tight">{service.title}</h3>
      <p className="mt-4 text-base leading-7 text-muted">{service.lead}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {service.format && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-graphite">{service.format}</span>
        )}
        {service.duration && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-graphite">{service.duration}</span>
        )}
      </div>
      <div className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-accent transition group-hover:text-ink">
        {service.buttonText || 'Подробнее'}
        <ArrowUpRight className="h-4 w-4" />
      </div>
    </Link>
  );
}
