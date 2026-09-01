import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Monitor, Play, Smartphone, Tablet } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type { ProjectCase } from '../data/cases';

type CaseDevice = 'desktop' | 'tablet' | 'mobile';

export function BeforeAfter({ before, after }: { before?: ReactNode; after?: ReactNode }) {
  if (!before || !after) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <article className="rounded-premium border border-line bg-slate-50 p-6"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-muted">До</p><div className="mt-4 text-sm leading-7 text-graphite">{before}</div></article>
      <article className="rounded-premium border border-emerald-200 bg-emerald-50/60 p-6"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-700">После</p><div className="mt-4 text-sm leading-7 text-graphite">{after}</div></article>
    </div>
  );
}

function InterfaceConcept({ item, device }: { item: ProjectCase; device: CaseDevice }) {
  const catalog = item.serviceSlug === 'web-application';
  return (
    <motion.div
      className={`mx-auto overflow-hidden border-[6px] border-ink bg-white shadow-2xl ${device === 'desktop' ? 'w-full rounded-2xl' : device === 'tablet' ? 'w-[78%] rounded-[24px]' : 'w-[46%] min-w-[220px] rounded-[30px]'}`}
      layout
      transition={{ type: 'spring', stiffness: 230, damping: 28 }}
    >
      <div className="flex h-9 items-center gap-1.5 border-b border-line bg-slate-50 px-3"><i className="h-2 w-2 rounded-full bg-rose-300" /><i className="h-2 w-2 rounded-full bg-amber-300" /><i className="h-2 w-2 rounded-full bg-emerald-300" /><span className="ml-auto text-[8px] font-bold text-muted">КОНЦЕПТ</span></div>
      <div className={`grid min-h-[310px] ${catalog && device !== 'mobile' ? 'grid-cols-[62px_1fr]' : 'grid-cols-1'}`}>
        {catalog && device !== 'mobile' ? <aside className="bg-ink p-2"><div className="h-5 rounded bg-white/12" /><div className="mt-4 grid gap-2">{Array.from({ length: 5 }, (_, index) => <i className="h-2 rounded bg-white/10" key={index} />)}</div></aside> : null}
        <div className="min-w-0 p-3 sm:p-4">
          <header className="flex items-center gap-3"><strong className="text-[10px]">{catalog ? 'Каталог' : 'SITEVL'}</strong><span className="ml-auto h-7 w-20 rounded-md bg-slate-100" /></header>
          <div className="mt-4 rounded-lg bg-gradient-to-br from-blue-50 to-emerald-50 p-4"><p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-blue-600">{item.category}</p><div className="mt-2 h-3 w-3/4 rounded bg-ink" /><div className="mt-2 h-2 w-1/2 rounded bg-slate-300" /></div>
          <div className={`mt-3 grid gap-2 ${device === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {Array.from({ length: device === 'mobile' ? 2 : 6 }, (_, index) => <span className="block h-16 rounded-lg border border-line bg-white shadow-sm" key={index} />)}
          </div>
          {catalog ? <div className="mt-3 flex gap-2"><span className="h-7 flex-1 rounded-md bg-slate-100" /><span className="h-7 w-20 rounded-md bg-blue-600" /></div> : null}
        </div>
      </div>
    </motion.div>
  );
}

export function CaseExperience({ item }: { item: ProjectCase }) {
  const [device, setDevice] = useState<CaseDevice>('desktop');
  const [step, setStep] = useState(0);
  const replay = [
    { title: 'Задача', text: item.task },
    { title: 'Реализация', text: item.workCompleted.slice(0, 3).join('. ') },
    { title: 'Результат', text: item.result.slice(0, 3).join('. ') },
  ];

  return (
    <section className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <article className="min-w-0 rounded-premium border border-line bg-white/84 p-5 shadow-glass sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-accent">ПРЕДПРОСМОТР УСТРОЙСТВ</p><h2 className="mt-2 text-2xl font-extrabold">Как интерфейс меняется под экран</h2></div>
          <div className="inline-flex rounded-full border border-line bg-slate-50 p-1" aria-label="Размер концептуального предпросмотра">
            {([
              ['desktop', Monitor, 'Компьютер'],
              ['tablet', Tablet, 'Планшет'],
              ['mobile', Smartphone, 'Телефон'],
            ] as const).map(([value, Icon, label]) => <button className={`grid h-10 w-10 place-items-center rounded-full transition ${device === value ? 'bg-ink text-white' : 'text-muted hover:text-ink'}`} type="button" title={label} aria-label={label} aria-pressed={device === value} onClick={() => setDevice(value)} key={value}><Icon className="h-4 w-4" /></button>)}
          </div>
        </div>
        <div className="mt-6 grid min-h-[390px] place-items-center overflow-hidden rounded-2xl bg-slate-100 p-3 sm:p-6">
          <InterfaceConcept item={item} device={device} />
        </div>
        <p className="mt-3 text-xs leading-5 text-muted">Концептуальная схема по подтверждённой структуре кейса, не скриншот готового проекта.</p>
        {item.projectPrice || item.developmentTime ? (
          <dl className="mt-4 flex flex-wrap gap-3 border-t border-line pt-4 text-xs">
            {item.projectPrice ? <div><dt className="text-muted">Подтверждённая стоимость</dt><dd className="mt-1 font-extrabold">{item.projectPrice}</dd></div> : null}
            {item.developmentTime ? <div><dt className="text-muted">Подтверждённый срок</dt><dd className="mt-1 font-extrabold">{item.developmentTime}</dd></div> : null}
          </dl>
        ) : null}
      </article>

      <article className="rounded-premium border border-line bg-ink p-6 text-white shadow-glass sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-300">РАЗБОР КЕЙСА</p>
        <h2 className="mt-3 text-2xl font-extrabold">Путь проекта</h2>
        <div className="mt-6 flex gap-2" aria-label="Этапы кейса">
          {replay.map((itemReplay, index) => <button className={`h-2 flex-1 rounded-full transition ${step === index ? 'bg-blue-400' : index < step ? 'bg-emerald-400' : 'bg-white/15'}`} type="button" aria-label={itemReplay.title} aria-pressed={step === index} onClick={() => setStep(index)} key={itemReplay.title} />)}
        </div>
        <AnimatePresence mode="wait">
          <motion.div className="mt-8 min-h-[250px]" key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <span className="inline-flex items-center gap-2 text-xs font-bold text-blue-300"><Play className="h-3 w-3" /> 0{step + 1}</span>
            <h3 className="mt-4 text-xl font-extrabold">{replay[step].title}</h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">{replay[step].text}</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-5">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-400"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Только факты из кейса</span>
          <button className="grid h-10 w-10 place-items-center rounded-full border border-white/15 transition hover:bg-white/10 disabled:opacity-30" type="button" aria-label="Следующий этап" disabled={step === replay.length - 1} onClick={() => setStep((value) => Math.min(replay.length - 1, value + 1))}><ArrowRight className="h-4 w-4" /></button>
        </div>
      </article>
    </section>
  );
}
