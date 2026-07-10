import { Link } from 'react-router-dom';
import { navItems } from '../data/site';
import { useSiteData } from '../hooks/useSiteData';
import { Container } from './Container';

const usefulLinks = [
  { label: 'Полезное', href: '/useful' },
  { label: 'Цифровая гигиена', href: '/useful/digital-hygiene' },
  { label: 'Перенос данных', href: '/useful/data-transfer' },
  { label: 'Защита от мошенников', href: '/useful/scams' },
  { label: 'Приложения и чек-листы', href: '/useful/apps-checklists' },
];

export function Footer() {
  const { data } = useSiteData();
  const { contacts, site } = data;

  return (
    <footer className="border-t border-line bg-slate-50/80 py-12">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.8fr_1fr_1fr]">
          <div>
            <div className="text-2xl font-extrabold">{site.name}</div>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted">{site.tagline}. {site.location}.</p>
            <p className="mt-6 text-sm text-muted">{site.domain}</p>
          </div>
          <div>
            <div className="font-bold">Навигация</div>
            <div className="mt-4 grid gap-3 text-sm text-muted">
              {navItems.map((item) => (
                <Link className="transition hover:text-ink" key={item.href} to={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="font-bold">Полезное</div>
            <div className="mt-4 grid gap-3 text-sm text-muted">
              {usefulLinks.map((item) => (
                <Link className="transition hover:text-ink" key={item.href} to={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="font-bold">Контакты</div>
            <div className="mt-4 grid gap-3 text-sm text-muted">
              {contacts.map((contact) => (
                <a className="transition hover:text-ink" href={contact.href} key={`${contact.label}-${contact.value}`}>
                  {contact.label}: {contact.value}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-line pt-6">
          <div className="flex flex-col gap-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link className="transition hover:text-ink" to="/privacy">Политика обработки данных</Link>
              <Link className="transition hover:text-ink" to="/terms">Условия обращения</Link>
            </div>
            <span>{site.domain}</span>
          </div>
          <p className="mt-5 max-w-5xl text-xs leading-5 text-muted">
            Информация на сайте носит справочный характер. Цены ориентировочные и зависят от задачи. Аудит сайта является предварительной проверкой и не является юридическим заключением.
          </p>
        </div>
      </Container>
    </footer>
  );
}
