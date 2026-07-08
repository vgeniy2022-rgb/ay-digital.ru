import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { PageHero } from '../components/PageHero';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { pageMeta } from '../data/pageMeta';
import { cases } from '../data/site';

export function CasesPage() {
  return (
    <PageTransition>
      <PageHero {...pageMeta.cases} />
      <section className="pb-16">
        <Container>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cases.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal delay={index * 0.05} key={item.title}>
                  <article className="min-h-72 rounded-premium border border-line bg-white/82 p-6 shadow-glass transition duration-300 hover:-translate-y-1 hover:shadow-soft">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-ink">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-7 text-2xl font-extrabold leading-tight">{item.title}</h2>
                    <p className="mt-4 text-base leading-7 text-muted">{item.description}</p>
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
        </Container>
      </section>
      <CallToAction />
    </PageTransition>
  );
}
