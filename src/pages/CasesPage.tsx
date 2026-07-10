import { ChevronDown, ChevronUp, Gamepad2, LayoutDashboard, MonitorSmartphone, Presentation, Smartphone, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { PageHero } from '../components/PageHero';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { pageMeta } from '../data/pageMeta';
import { CaseItem } from '../data/site';
import { useSiteData } from '../hooks/useSiteData';

const filters = ['Все', 'Сайты', 'Админки', 'iOS', 'Игры', 'Презентации', 'Техника', 'Автоматизация'];

const categoryIcons = {
  Сайты: MonitorSmartphone,
  Админки: LayoutDashboard,
  iOS: Smartphone,
  Игры: Gamepad2,
  Презентации: Presentation,
  Техника: Wrench,
  Автоматизация: LayoutDashboard,
};

function caseMatchesFilter(item: CaseItem, filter: string) {
  if (filter === 'Все') return true;
  if (item.category === filter) return true;
  if (filter === 'Автоматизация') {
    return item.tags.some((tag) => ['CMS', 'API', 'Google Sheets', 'Apps Script', 'Автоматизация'].includes(tag));
  }
  return false;
}

export function CasesPage() {
  const { data, isLoading } = useSiteData();
  const { cases } = data;
  const [activeFilter, setActiveFilter] = useState('Все');
  const [openedTitle, setOpenedTitle] = useState<string | null>(null);
  const visibleCases = useMemo(
    () => cases.filter((item) => caseMatchesFilter(item, activeFilter)),
    [activeFilter, cases],
  );

  return (
    <PageTransition>
      <PageHero {...pageMeta.cases} />
      <section className="pb-16">
        <Container>
          <Reveal>
            <div className="-mx-4 mb-8 overflow-x-auto px-4 pb-2">
              <div className="flex min-w-max gap-2">
                {filters.map((filter) => (
                  <button
                    className={`rounded-full border px-4 py-2 text-sm font-extrabold transition ${
                      activeFilter === filter
                        ? 'border-ink bg-ink text-white shadow-glass'
                        : 'border-line bg-white/82 text-graphite hover:border-slate-300'
                    }`}
                    type="button"
                    onClick={() => {
                      setActiveFilter(filter);
                      setOpenedTitle(null);
                    }}
                    key={filter}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          {visibleCases.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-busy={isLoading}>
              {visibleCases.map((item, index) => {
                const VisualIcon = categoryIcons[item.category as keyof typeof categoryIcons] || item.icon;
                const isOpen = openedTitle === item.title;

                return (
                  <Reveal delay={index * 0.035} key={item.title}>
                    <article className="rounded-premium border border-line bg-white/84 p-6 shadow-glass transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-soft">
                      <div className="flex items-start justify-between gap-4">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-ink">
                          <VisualIcon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {item.status ? (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-accent">
                              {item.status}
                            </span>
                          ) : null}
                          {item.category ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-graphite">
                              {item.category}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <h2 className="mt-7 text-2xl font-extrabold leading-tight">{item.title}</h2>
                      <p className="mt-4 text-sm leading-6 text-muted">{item.description}</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {item.tags.slice(0, 5).map((tag) => (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-graphite" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      {isOpen ? (
                        <div className="mt-6 grid gap-3">
                          {[
                            ['Задача', item.problem],
                            ['Что сделано', item.solution],
                            ['Результат', item.result],
                            ['Что можно развить дальше', item.nextSteps],
                          ].map(([label, text]) =>
                            text ? (
                              <p className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-muted" key={label}>
                                <span className="font-extrabold text-ink">{label}: </span>
                                {text}
                              </p>
                            ) : null,
                          )}
                        </div>
                      ) : null}

                      <button
                        className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-extrabold text-ink shadow-glass transition hover:-translate-y-0.5 hover:border-slate-300"
                        type="button"
                        onClick={() => setOpenedTitle(isOpen ? null : item.title)}
                      >
                        {isOpen ? 'Свернуть' : 'Подробнее'}
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          ) : (
            <div className="rounded-premium border border-line bg-white/82 p-8 text-center text-muted shadow-glass">
              Кейсы сейчас обновляются.
            </div>
          )}
        </Container>
      </section>
      <CallToAction />
    </PageTransition>
  );
}
