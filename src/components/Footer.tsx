import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { localSeoLinks } from '../data/localSeoLinks';
import { navItems } from '../data/site';
import { useSiteData } from '../hooks/useSiteData';
import { Container } from './Container';
import { SiteAnalyticsContext } from '../features/site-analytics/siteAnalyticsContext';

const numberFormatter = new Intl.NumberFormat('ru-RU');

const usefulLinks = [
  { label: 'Полезное', href: '/useful' },
  { label: 'Обо мне', href: '/about' },
  { label: 'Цифровая гигиена', href: '/useful/digital-hygiene' },
  { label: 'Перенос данных', href: '/useful/data-transfer' },
  { label: 'Защита от мошенников', href: '/useful/scams' },
  { label: 'Приложения и чек-листы', href: '/useful/apps-checklists' },
  { label: 'SITEVL LAB', href: '/lab' },
  { label: 'Мини-бриф', href: '/brief' },
  { label: 'Журнал изменений', href: '/changelog' },
];

export function Footer() {
  const { data } = useSiteData();
  const { stats, status } = useContext(SiteAnalyticsContext);
  const { contacts, site } = data;

  return (
    <footer className="site-footer border-t border-slate-800 bg-[#0d1117] py-14 text-white">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.8fr_1fr_1fr]">
          <div>
            <div className="text-2xl font-extrabold">{site.name}</div>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">{site.tagline}. {site.location}.</p>
            <p className="mt-6 text-sm text-slate-400">SITEVL — создание сайтов и мобильных приложений во Владивостоке и удалённо.</p>
          </div>
          <div>
            <div className="font-bold">Навигация</div>
            <div className="mt-4 grid gap-3 text-sm text-slate-400">
              {navItems.map((item) => (
                <Link className="transition hover:text-white" key={item.href} to={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="font-bold">Полезное</div>
            <div className="mt-4 grid gap-3 text-sm text-slate-400">
              {usefulLinks.map((item) => (
                <Link className="transition hover:text-white" key={item.href} to={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="font-bold">География и услуги</div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-400">
              {localSeoLinks.slice(0, 5).map((item) => (
                <Link className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 transition hover:border-slate-500 hover:text-white" key={item.href} to={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <div className="font-bold">Контакты</div>
            <div className="mt-4 grid gap-3 text-sm text-slate-400">
              {contacts.map((contact) => (
                <a className="transition hover:text-white" href={contact.href} key={`${contact.label}-${contact.value}`}>
                  {contact.label}: {contact.value}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-800 pt-6">
          <div className="flex flex-col gap-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link className="transition hover:text-white" to="/privacy">Политика обработки персональных данных</Link>
              <Link className="transition hover:text-white" to="/terms">Условия оказания услуг</Link>
            </div>
            <span>SITEVL · Владивосток</span>
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-400">Владивосток · выезд по городу · удалённо</p>
          <p className="mt-5 max-w-5xl text-xs leading-5 text-slate-500">
            Информация на сайте носит справочный характер. Цены ориентировочные и не являются публичной офертой. Точная стоимость и сроки согласуются индивидуально перед началом работы.
          </p>
          {status === 'ready' && stats ? (
            <p className="mt-3 text-xs leading-5 text-slate-500" aria-label="Анонимная статистика посещений SITEVL">
              За всё время: {numberFormatter.format(stats.visits)} посещений · {numberFormatter.format(stats.uniqueVisitors)} посетителей
            </p>
          ) : null}
          <p className="mt-2 max-w-5xl text-xs leading-5 text-slate-500">
            Аудит сайта является предварительной проверкой заметных рисков и не является юридическим заключением.
          </p>
        </div>
      </Container>
    </footer>
  );
}
