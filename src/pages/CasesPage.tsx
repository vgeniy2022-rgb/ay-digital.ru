import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { PageHero } from '../components/PageHero';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { pageMeta } from '../data/pageMeta';
import { useSiteData } from '../hooks/useSiteData';

export function CasesPage() {
  const { data, isLoading } = useSiteData();
  const { cases } = data;

  return (
    <PageTransition>
      <PageHero {...pageMeta.cases} />
      <section className="pb-16">
        <Container>
          {cases.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-busy={isLoading}>
              {cases.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Reveal delay={index * 0.05} key={item.title}>
                    <article className="min-h-72 rounded-premium border border-line bg-white/82 p-6 shadow-glass transition duration-300 hover:-translate-y-1 hover:shadow-soft">
                      <div className="flex items-start justify-between gap-4">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-ink">
                          <Icon className="h-5 w-5" />
                        </div>
                        {item.date && (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-graphite">{item.date}</span>
                        )}
                      </div>
                      {item.category && (
                        <div className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-accent">{item.category}</div>
                      )}
                      <h2 className="mt-7 text-2xl font-extrabold leading-tight">{item.title}</h2>
                      <p className="mt-4 text-base leading-7 text-muted">{item.description}</p>
                      <div className="mt-6 grid gap-3">
                        {item.problem && (
                          <p className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-muted">
                            <span className="font-extrabold text-ink">Проблема: </span>
                            {item.problem}
                          </p>
                        )}
                        {item.solution && (
                          <p className="rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-muted">
                            <span className="font-extrabold text-ink">Решение: </span>
                            {item.solution}
                          </p>
                        )}
                        {item.result && (
                          <p className="rounded-3xl bg-blue-50/70 p-4 text-sm leading-6 text-muted">
                            <span className="font-extrabold text-ink">Результат: </span>
                            {item.result}
                          </p>
                        )}
                      </div>
                      <div className="mt-6 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-graphite" key={tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
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
