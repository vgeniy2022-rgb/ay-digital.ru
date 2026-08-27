import { CalendarDays, CheckCircle2 } from 'lucide-react';
import { LabFrame, LabHero, LabSectionHeading } from '../components/lab/LabPrimitives';
import { PageTransition } from '../components/PageTransition';
import { SeoHead } from '../components/SeoHead';
import { changelogEntries } from '../data/lab';

export function ChangelogPage() {
  return (
    <PageTransition>
      <SeoHead title="Changelog — SITEVL" description="Фактические изменения интерактивного интерфейса SITEVL." canonicalPath="/changelog" noindex />
      <LabFrame>
        <LabHero title="Changelog" description="Короткий журнал изменений текущей версии. Здесь нет выдуманной истории релизов: только то, что действительно подготовлено в проекте." />
        <section className="lab-section">
          <div className="lab-shell">
            <LabSectionHeading eyebrow="Текущая версия" title="Что изменилось" description="Статус относится к состоянию кода. Production deployment не выполнялся." />
            <div className="mt-10 grid gap-4">
              {changelogEntries.map((entry) => (
                <article className="lab-card" key={`${entry.date}-${entry.title}`}>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-muted">
                    <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{entry.date}</span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">{entry.status}</span>
                  </div>
                  <h2 className="mt-5 text-2xl font-extrabold">{entry.title}</h2>
                  <ul className="mt-5 grid gap-3">
                    {entry.items.map((item) => <li className="flex items-start gap-3 text-sm font-semibold text-muted" key={item}><CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-accent" />{item}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>
      </LabFrame>
    </PageTransition>
  );
}
