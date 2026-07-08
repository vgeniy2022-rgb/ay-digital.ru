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
        <ArrowUpRight className="h-5 w-5 text-muted transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent" />
      </div>
      <h3 className="mt-7 text-2xl font-extrabold leading-tight">{service.title}</h3>
      <p className="mt-4 text-base leading-7 text-muted">{service.lead}</p>
    </Link>
  );
}
