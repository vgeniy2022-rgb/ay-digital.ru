import { Link } from 'react-router-dom';
import { localSeoLinks } from '../data/localSeoLinks';
import { navItems } from '../data/site';
import { useSiteData } from '../hooks/useSiteData';
import { Container } from './Container';

const usefulLinks = [
  { label: 'Полезное', href: '/useful' },
  { label: 'Обо мне', href: '/about' },
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
          <div className="lg:col-span-2">
            <div className="font-bold">Услуги во Владивостоке</div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted">
              {localSeoLinks.slice(0, 5).map((item) => (
                <Link className="rounded-full border border-line bg-white px-3 py-1.5 transition hover:text-ink" key={item.href} to={item.href}>
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
              <Link className="transition hover:text-ink" to="/privacy">Политика обработки персональных данных</Link>
              <Link className="transition hover:text-ink" to="/terms">Условия оказания услуг</Link>
            </div>
            <span>{site.domain}</span>
          </div>
          <p className="mt-4 text-sm font-semibold text-muted">Владивосток · выезд по городу · удалённо</p>
          <p className="mt-5 max-w-5xl text-xs leading-5 text-muted">
            Информация на сайте носит справочный характер. Цены ориентировочные и не являются публичной офертой. Точная стоимость и сроки согласуются индивидуально перед началом работы.
          </p>
          <p className="mt-2 max-w-5xl text-xs leading-5 text-muted">
            Аудит сайта является предварительной проверкой заметных рисков и не является юридическим заключением.
          </p>
        </div>
      </Container>
    </footer>
  );
}
