import { BarChart3, Database, HardDrive, Laptop, Monitor, Smartphone } from 'lucide-react';

function WebsitesVisual() {
  return (
    <div className="relative h-64 overflow-hidden rounded-premium bg-[#eef3fa] p-5 sm:h-72 sm:p-7">
      <div className="mx-auto h-full max-w-md overflow-hidden rounded-xl border border-white bg-white shadow-soft">
        <div className="flex h-8 items-center gap-1.5 border-b border-line px-3">
          <span className="h-2 w-2 rounded-full bg-slate-300" /><span className="h-2 w-2 rounded-full bg-slate-200" /><span className="h-2 w-2 rounded-full bg-blue-400" />
        </div>
        <div className="grid h-[calc(100%-2rem)] grid-cols-[0.4fr_0.6fr] gap-4 p-5">
          <div><div className="h-3 w-16 rounded-full bg-ink" /><div className="mt-5 h-5 rounded bg-slate-200" /><div className="mt-2 h-5 w-4/5 rounded bg-slate-100" /><div className="mt-5 h-8 w-24 rounded-full bg-blue-600" /></div>
          <div className="rounded-lg bg-gradient-to-br from-blue-100 via-white to-slate-200 p-3"><div className="ml-auto h-full w-3/5 rounded-md border border-white bg-white/70 shadow-glass" /></div>
        </div>
      </div>
    </div>
  );
}

function AppsVisual() {
  return (
    <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-premium bg-[#eff2f7] sm:h-72">
      <div className="absolute left-[12%] top-8 rounded-2xl bg-white p-3 shadow-glass"><Database className="h-5 w-5 text-accent" /></div>
      <div className="relative h-56 w-28 rounded-[28px] border-[5px] border-ink bg-white p-2 shadow-soft">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-ink" /><div className="mt-4 h-14 rounded-xl bg-blue-600 p-2"><BarChart3 className="h-5 w-5 text-white" /></div>
        <div className="mt-3 grid gap-2"><div className="h-7 rounded-lg bg-slate-100" /><div className="h-7 rounded-lg bg-slate-100" /><div className="h-7 rounded-lg bg-blue-50" /></div>
      </div>
      <div className="absolute bottom-8 right-[12%] rounded-2xl bg-white p-3 shadow-glass"><Smartphone className="h-5 w-5 text-accent" /></div>
    </div>
  );
}

function TechVisual() {
  return (
    <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-premium bg-[#eef3fa] sm:h-72">
      <div className="relative h-36 w-56 rounded-xl border-[6px] border-ink bg-white p-4 shadow-soft"><div className="h-full rounded-md bg-gradient-to-br from-blue-100 via-white to-slate-200" /><div className="absolute -bottom-3 left-1/2 h-3 w-64 -translate-x-1/2 rounded-b-xl bg-slate-300" /></div>
      <div className="absolute bottom-7 right-[16%] h-32 w-16 rounded-[18px] border-4 border-ink bg-white p-1.5 shadow-glass"><div className="h-full rounded-xl bg-blue-50" /></div>
      <Laptop className="absolute left-[12%] top-8 h-6 w-6 text-accent" />
    </div>
  );
}

function ComputerVisual() {
  return (
    <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-premium bg-[#f0f3f7] sm:h-72">
      <div className="relative h-36 w-56 rounded-xl border-[6px] border-ink bg-white p-3 shadow-soft"><div className="grid h-full grid-cols-2 gap-2 rounded-md bg-slate-50 p-3"><div className="rounded bg-blue-100" /><div className="grid gap-2"><div className="rounded bg-white" /><div className="rounded bg-slate-200" /></div></div><div className="absolute -bottom-7 left-1/2 h-7 w-12 -translate-x-1/2 border-x-4 border-ink" /></div>
      <div className="absolute bottom-6 right-[12%] rounded-2xl bg-white p-4 shadow-glass"><HardDrive className="h-7 w-7 text-accent" /></div>
      <div className="absolute left-[10%] top-8 rounded-2xl bg-white p-4 shadow-glass"><Monitor className="h-6 w-6 text-graphite" /></div>
    </div>
  );
}

export function ServiceVisual({ slug }: { slug: string }) {
  if (slug === 'websites') return <WebsitesVisual />;
  if (slug === 'apps') return <AppsVisual />;
  if (slug === 'tech') return <TechVisual />;
  if (slug === 'computer-help') return <ComputerVisual />;
  return null;
}
