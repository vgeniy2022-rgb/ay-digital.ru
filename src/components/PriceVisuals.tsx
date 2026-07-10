import { Check, Cloud, FileText, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { PriceDirection } from '../data/priceDirections';

type PriceVisualProps = {
  variant: PriceDirection['visual'];
};

function BrowserWindow({ rows = ['Услуги', 'Цены', 'Отзывы'] }: { rows?: string[] }) {
  return (
    <div className="rounded-[28px] border border-white/80 bg-white/86 p-4 shadow-soft backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-200" />
          <span className="h-3 w-3 rounded-full bg-amber-200" />
          <span className="h-3 w-3 rounded-full bg-emerald-200" />
        </div>
        <span className="h-2.5 w-24 rounded-full bg-slate-100" />
      </div>
      <div className="pt-5">
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-accent">AY Digital</span>
        <div className="mt-5 h-7 w-44 rounded-full bg-ink" />
        <div className="mt-3 h-3 w-56 max-w-full rounded-full bg-slate-200" />
        <div className="mt-5 grid gap-3">
          {rows.map((row, index) => (
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3" key={row}>
              <span className="text-xs font-extrabold text-graphite">{row}</span>
              <span className={`h-3 w-12 rounded-full ${index % 2 ? 'bg-emerald-200' : 'bg-blue-200'}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="rounded-[34px] border border-white bg-ink p-2 shadow-soft">
      <div className="rounded-[28px] bg-white p-3">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200" />
        <div className="mt-5 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50" />
        <div className="mt-3 grid gap-2">
          <div className="h-8 rounded-2xl bg-slate-100" />
          <div className="h-8 rounded-2xl bg-blue-50" />
          <div className="h-8 rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

function ChecklistPanel({ items }: { items: string[] }) {
  return (
    <div className="rounded-[28px] border border-line bg-white/86 p-5 shadow-glass">
      <div className="grid gap-3">
        {items.map((item, index) => (
          <motion.div
            className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-xs font-extrabold text-graphite"
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            key={item}
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <Check className="h-3.5 w-3.5" />
            </span>
            {item}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function PriceVisual({ variant }: PriceVisualProps) {
  if (variant === 'phones') {
    return (
      <motion.div className="relative min-h-[340px]" animate={{ y: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="hero-line-field absolute inset-0 rounded-[40px]" />
        <div className="absolute left-4 top-8 w-36"><PhoneMockup /></div>
        <div className="absolute right-4 top-20 w-36"><PhoneMockup /></div>
        <div className="absolute left-1/2 top-32 grid h-16 w-16 -translate-x-1/2 place-items-center rounded-full border border-line bg-white text-accent shadow-glass">
          <Cloud className="h-7 w-7" />
        </div>
        <div className="absolute bottom-8 left-1/2 grid h-16 w-16 -translate-x-1/2 place-items-center rounded-full bg-ink text-white shadow-soft">
          <Shield className="h-7 w-7" />
        </div>
      </motion.div>
    );
  }

  if (variant === 'pc') {
    return (
      <motion.div className="relative min-h-[340px]" animate={{ y: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="hero-line-field absolute inset-0 rounded-[40px]" />
        <div className="absolute left-5 top-8 h-56 w-40 rounded-[28px] border border-line bg-ink p-4 shadow-soft">
          <div className="h-full rounded-2xl border border-white/10 bg-white/8 p-3">
            <div className="h-16 rounded-2xl bg-blue-400/30" />
            <div className="mt-4 h-20 rounded-2xl border border-white/20" />
            <div className="mt-4 h-3 rounded-full bg-emerald-300" />
            <div className="mt-2 h-3 w-20 rounded-full bg-blue-300" />
          </div>
        </div>
        <div className="absolute bottom-8 right-4 w-56">
          <ChecklistPanel items={['комплектующие', 'кабели', 'Windows', 'тест температур']} />
        </div>
      </motion.div>
    );
  }

  if (variant === 'programs') {
    return (
      <motion.div className="relative min-h-[340px]" animate={{ y: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="hero-line-field absolute inset-0 rounded-[40px]" />
        <div className="absolute left-4 right-4 top-10">
          <BrowserWindow rows={['Документы', 'Таблицы', 'PDF', 'Облако']} />
        </div>
        <div className="absolute bottom-4 right-8 grid h-20 w-20 place-items-center rounded-3xl border border-line bg-white text-accent shadow-glass">
          <FileText className="h-8 w-8" />
        </div>
      </motion.div>
    );
  }

  if (variant === 'devices') {
    return (
      <motion.div className="relative min-h-[340px]" animate={{ y: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="hero-line-field absolute inset-0 rounded-[40px]" />
        <div className="absolute left-4 right-4 top-8">
          <BrowserWindow rows={['Система', 'Браузеры', 'Программы']} />
        </div>
        <div className="absolute bottom-4 left-8 right-8">
          <ChecklistPanel items={['обновления', 'безопасность', 'рабочий стол']} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="relative min-h-[340px]" animate={{ y: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
      <div className="hero-line-field absolute inset-0 rounded-[40px]" />
      <div className="absolute left-2 right-12 top-8"><BrowserWindow /></div>
      <div className="absolute bottom-6 right-4 w-36"><PhoneMockup /></div>
      <div className="absolute bottom-10 left-6 rounded-3xl border border-line bg-white/88 p-4 shadow-glass">
        <div className="text-xs font-extrabold text-accent">Админка</div>
        <div className="mt-3 h-3 w-24 rounded-full bg-slate-200" />
        <div className="mt-2 h-3 w-16 rounded-full bg-emerald-200" />
      </div>
    </motion.div>
  );
}
