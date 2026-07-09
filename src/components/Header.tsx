import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { navItems } from '../data/site';
import { useSiteData } from '../hooks/useSiteData';
import { ButtonLink } from './ButtonLink';
import { Container } from './Container';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useSiteData();
  const { site } = data;

  const close = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/62 backdrop-blur-2xl">
      <Container className="py-3">
        <div className="glass flex min-h-16 items-center justify-between rounded-full px-4 shadow-glass sm:px-5">
          <NavLink to="/" onClick={close} className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-sm font-bold text-white">A</span>
            <span className="hidden leading-tight sm:block">
              <span className="block font-bold">{site.name}</span>
              <span className="block text-xs text-muted">{site.domain}</span>
            </span>
          </NavLink>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-slate-100 text-ink' : 'text-muted hover:bg-slate-50 hover:text-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <ButtonLink href={site.telegramUrl} variant="secondary" showArrow={false}>
              Telegram
            </ButtonLink>
          </div>

          <button
            className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white lg:hidden"
            type="button"
            aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setIsOpen((value) => !value)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isOpen && (
          <div className="glass mt-3 rounded-[28px] p-3 shadow-glass lg:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={close}
                className="block rounded-2xl px-4 py-3 text-base font-semibold text-ink hover:bg-slate-100"
              >
                {item.label}
              </NavLink>
            ))}
            <ButtonLink href={site.telegramUrl} variant="primary" className="mt-2 w-full" showArrow={false}>
              Написать в Telegram
            </ButtonLink>
          </div>
        )}
      </Container>
    </header>
  );
}
