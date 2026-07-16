import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CallToAction } from '../components/CallToAction';
import { AddToCartButton } from '../components/AddToCartButton';
import { Container } from '../components/Container';
import { PageHero } from '../components/PageHero';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { SiteAdminPromoCard } from '../components/SiteAdminPromoCard';
import { pageMeta } from '../data/pageMeta';
import { localSeoLinks } from '../data/localSeoLinks';
import { priceDirections } from '../data/priceDirections';
import { PriceGroup } from '../data/site';
import { useSiteData } from '../hooks/useSiteData';
import { createCartKey, parseExactPrice } from '../utils/cart';

const tabs = [
  { label: 'Все', key: 'all' },
  { label: 'Сайты', key: 'Сайты' },
  { label: 'Программы', key: 'Программы' },
  { label: 'Устройства', key: 'Настройка устройств' },
  { label: 'Телефоны', key: 'Телефоны и данные' },
  { label: 'ПК', key: 'ПК и техника' },
  { label: 'Дополнительно', key: 'Дополнительно' },
];

const detailPathByGroup: Record<string, string | undefined> = {
  Сайты: '/prices/websites',
  Программы: '/prices/programs',
  'Настройка устройств': '/prices/devices',
  'Телефоны и данные': '/prices/phones',
  'ПК и техника': '/prices/pc',
};

function getCompactIncludes(item: PriceGroup['items'][number]) {
  if (item.includes?.length) {
    return item.includes.slice(0, 3);
  }

  return ['состав согласуем', 'цена до старта', 'понятный результат'];
}

export function PricesPage() {
  const { data, isLoading } = useSiteData();
  const [activeTab, setActiveTab] = useState('all');
  const visibleGroups = useMemo(
    () => (activeTab === 'all' ? data.priceGroups : data.priceGroups.filter((group) => group.title === activeTab)),
    [activeTab, data.priceGroups],
  );

  return (
    <PageTransition>
      <PageHero {...pageMeta.prices} />
      <section className="pb-16">
        <Container>
          <Reveal>
            <div className="mb-6 rounded-premium border border-line bg-slate-50 p-6 text-sm leading-7 text-muted shadow-glass">
              <p>
                Цены ориентировочные и зависят от задачи, объёма работы и срочности. Точная стоимость согласуется перед
                началом работы.
              </p>
              <p className="mt-2">Предварительная проверка сайта не является юридическим заключением.</p>
            </div>
          </Reveal>

          <Reveal>
            <div className="mb-8 flex flex-wrap gap-2">
              {localSeoLinks.slice(0, 7).map((item) => (
                <Link className="rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:border-slate-300" to={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <div className="-mx-4 mb-8 overflow-x-auto px-4 pb-2">
              <div className="flex min-w-max gap-2">
                {tabs.map((tab) => (
                  <button
                    className={`rounded-full border px-4 py-2 text-sm font-extrabold transition ${
                      activeTab === tab.key
                        ? 'border-ink bg-ink text-white shadow-glass'
                        : 'border-line bg-white/82 text-graphite hover:border-slate-300'
                    }`}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    key={tab.key}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          {visibleGroups.length ? (
            <div className="grid gap-6" aria-busy={isLoading}>
              {visibleGroups.map((group, groupIndex) => {
                const detailPath = detailPathByGroup[group.title];
                const DirectionIcon = priceDirections.find((direction) => direction.groupTitle === group.title)?.icon;

                return (
                  <section key={group.title}>
                    <Reveal delay={groupIndex * 0.04}>
                      <div className="mb-4 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Пакеты</p>
                          <h2 className="mt-2 text-3xl font-extrabold leading-tight">{group.title}</h2>
                          {group.note ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{group.note}</p> : null}
                        </div>
                        {DirectionIcon ? (
                          <span className="hidden h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-ink sm:grid">
                            <DirectionIcon className="h-5 w-5" />
                          </span>
                        ) : null}
                      </div>
                    </Reveal>
                    {group.title === 'Сайты' ? (
                      <Reveal>
                        <div className="mb-4">
                          <SiteAdminPromoCard compact />
                        </div>
                      </Reveal>
                    ) : null}
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {group.items.map((item, index) => (
                        <Reveal delay={index * 0.035} key={`${group.title}-${item.name}`}>
                          <article className="flex h-full flex-col rounded-premium border border-line bg-white/84 p-6 shadow-glass transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-soft">
                            <div className="flex min-w-0 items-start justify-between gap-4">
                              <div className="min-w-0">
                                <h3 className="min-w-0 text-2xl font-extrabold leading-tight">{item.name}</h3>
                                <p className="mt-3 max-w-full overflow-wrap-anywhere whitespace-normal text-lg font-extrabold leading-7 text-accent">
                                  {item.price}
                                </p>
                              </div>
                              <AddToCartButton
                                item={{
                                  key: createCartKey('package', `${group.title}-${item.name}`),
                                  id: `${group.title}-${item.name}`,
                                  type: 'package',
                                  title: item.name,
                                  category: group.title,
                                  priceText: item.price,
                                  unitPrice: parseExactPrice(item.price),
                                  quantity: 1,
                                  description: item.description,
                                }}
                              />
                            </div>
                            {item.description ? (
                              <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted">{item.description}</p>
                            ) : (
                              <p className="mt-4 text-sm leading-6 text-muted">Короткий пакет под понятную задачу. Детали согласуем перед началом.</p>
                            )}
                            <div className="mt-5 grid gap-2">
                              {getCompactIncludes(item).map((include) => (
                                <div className="flex items-center gap-2 text-sm font-semibold text-graphite" key={include}>
                                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                                  {include}
                                </div>
                              ))}
                            </div>
                            <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
                              {detailPath ? (
                                <Link
                                  className="inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-line bg-white px-3 text-sm font-bold text-ink shadow-glass transition hover:-translate-y-0.5 hover:border-slate-300"
                                  to={detailPath}
                                >
                                  Подробнее
                                  <ArrowUpRight className="h-4 w-4" />
                                </Link>
                              ) : null}
                              <a
                                className="inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-ink px-3 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-graphite"
                                href={data.site.telegramUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <MessageCircle className="h-4 w-4" />
                                Обсудить
                              </a>
                            </div>
                          </article>
                        </Reveal>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="rounded-premium border border-line bg-white/82 p-8 text-center text-muted shadow-glass">
              Цены сейчас обновляются.
            </div>
          )}
        </Container>
      </section>
      <CallToAction />
    </PageTransition>
  );
}
