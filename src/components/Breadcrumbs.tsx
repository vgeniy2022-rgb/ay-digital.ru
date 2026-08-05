import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getBreadcrumbItems } from '../utils/seoRoutes';
import { Container } from './Container';

export function Breadcrumbs() {
  const location = useLocation();
  const items = getBreadcrumbItems(location.pathname);

  if (items.length <= 1) return null;

  return (
    <nav className="border-b border-line/70 bg-white/70 py-3 text-sm backdrop-blur-xl" aria-label="Хлебные крошки">
      <Container>
        <ol className="flex flex-wrap items-center gap-2 text-muted">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li className="flex min-w-0 items-center gap-2" key={item.href}>
                {index > 0 ? <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden="true" /> : null}
                {isLast ? (
                  <span className="max-w-[220px] truncate font-semibold text-ink sm:max-w-none" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link className="font-semibold transition hover:text-ink" to={item.href}>
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </Container>
    </nav>
  );
}
