import { Clock3 } from 'lucide-react';
import { useSiteData } from '../hooks/useSiteData';
import { loadingStatusViewData } from '../utils/status';

type SpecialistStatusProps = {
  compact?: boolean;
};

export function SpecialistStatus({ compact = false }: SpecialistStatusProps) {
  const { data, isFallback, isLoading } = useSiteData();
  const status = isLoading && isFallback ? loadingStatusViewData : data.status;

  return (
    <div
      className={`rounded-[28px] border border-line bg-white/84 shadow-glass backdrop-blur ${
        compact ? 'p-4' : 'p-5 sm:p-6'
      }`}
    >
      <div className="flex items-start gap-4">
        <span className={`mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full ${status.haloClassName}`}>
          <span className={`h-3 w-3 rounded-full ${status.dotClassName}`} />
        </span>
        <div>
          <div className={`flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.14em] ${status.textClassName}`}>
            <Clock3 className="h-4 w-4" />
            {status.label}
          </div>
          <h2 className={`${compact ? 'mt-2 text-lg' : 'mt-3 text-xl sm:text-2xl'} font-extrabold leading-tight text-ink`}>
            {status.title}
          </h2>
          <p className={`${compact ? 'mt-2 text-sm' : 'mt-3 text-base'} leading-6 text-muted`}>{status.text}</p>
        </div>
      </div>
    </div>
  );
}
