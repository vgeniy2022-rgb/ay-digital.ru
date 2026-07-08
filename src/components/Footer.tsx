import { Link } from 'react-router-dom';
import { contacts, navItems, site } from '../data/site';
import { Container } from './Container';

export function Footer() {
  return (
    <footer className="border-t border-line bg-slate-50/80 py-12">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr]">
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
      </Container>
    </footer>
  );
}
