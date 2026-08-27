import { Menu, Search, ShoppingCart, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { navItems } from '../data/site';
import { useSiteData } from '../hooks/useSiteData';
import { useCart } from '../hooks/useCart';
import { ButtonLink } from './ButtonLink';
import { Container } from './Container';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useSiteData();
  const { totalQuantity } = useCart();
  const { site } = data;

  const close = () => setIsOpen(false);
  const openCommandPalette = () => window.dispatchEvent(new Event('sitevl:open-command-palette'));

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/62 backdrop-blur-2xl">
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
        href="#main-content"
      >
        Перейти к основному содержимому
      </a>
      <Container className="py-3">
        <div className="glass flex min-h-16 items-center justify-between rounded-full px-4 shadow-glass sm:px-5">
          <NavLink to="/" onClick={close} className="flex items-center gap-3" aria-label="SITEVL — на главную">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-sm font-bold text-white">S</span>
            <span className="leading-tight">
              <span className="block text-sm font-bold sm:text-base">{site.name}</span>
              <span className="hidden text-xs text-muted sm:block">{site.brandLine}</span>
            </span>
          </NavLink>

          <nav className="hidden items-center gap-1 xl:flex">
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

          <div className="hidden items-center gap-3 xl:flex">
            <button
              className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white transition hover:border-slate-300"
              type="button"
              title="Быстрая навигация (Command или Ctrl + K)"
              aria-label="Открыть быструю навигацию"
              onClick={openCommandPalette}
            >
              <Search className="h-5 w-5" />
            </button>
            <NavLink
              className="relative grid h-11 w-11 place-items-center rounded-full border border-line bg-white transition hover:border-slate-300"
              to="/cart"
              aria-label={`Открыть корзину, товаров: ${totalQuantity}`}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalQuantity > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-extrabold text-white">
                  {totalQuantity}
                </span>
              ) : null}
            </NavLink>
            <ButtonLink href={site.telegramUrl} variant="secondary" showArrow={false}>
              Telegram
            </ButtonLink>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <button
              className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white"
              type="button"
              aria-label="Открыть быструю навигацию"
              onClick={openCommandPalette}
            >
              <Search className="h-5 w-5" />
            </button>
            <NavLink
              className="relative grid h-11 w-11 place-items-center rounded-full border border-line bg-white"
              to="/cart"
              onClick={close}
              aria-label={`Открыть корзину, товаров: ${totalQuantity}`}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalQuantity > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-extrabold text-white">
                  {totalQuantity}
                </span>
              ) : null}
            </NavLink>
            <button
              className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white"
              type="button"
              aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
              onClick={() => setIsOpen((value) => !value)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="glass mt-3 rounded-[28px] p-3 shadow-glass xl:hidden">
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
