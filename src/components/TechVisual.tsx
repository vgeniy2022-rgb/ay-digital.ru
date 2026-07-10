import { Check, MessageCircle, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const siteRows = ['Сайты и админки', 'Сборка ПК', 'Перенос данных'];

export function TechVisual() {
  return (
    <div className="relative min-h-[390px] overflow-visible sm:min-h-[500px]">
      <div className="hero-line-field absolute inset-0 -z-10 rounded-[40px]" />
      <motion.div
        className="absolute left-0 top-8 w-[86%] rounded-[30px] border border-white/80 bg-white/82 p-4 shadow-soft backdrop-blur-xl sm:left-4 sm:top-10 sm:w-[82%] sm:p-5"
        initial={{ opacity: 0, y: 24, rotate: -1.5 }}
        animate={{ opacity: 1, y: [0, -8, 0], rotate: [-1.5, -0.7, -1.5] }}
        transition={{ opacity: { duration: 0.55, delay: 0.1 }, y: { duration: 7, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 7, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-200" />
            <span className="h-3 w-3 rounded-full bg-amber-200" />
            <span className="h-3 w-3 rounded-full bg-emerald-200" />
          </div>
          <div className="h-3 w-28 rounded-full bg-slate-100" />
        </div>
        <div className="grid gap-5 pt-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-accent">
              AY Digital
            </div>
            <div className="mt-5 h-8 w-52 rounded-full bg-ink" />
            <div className="mt-3 h-3 w-56 rounded-full bg-slate-200" />
            <div className="mt-2 h-3 w-44 rounded-full bg-slate-100" />
            <div className="mt-6 flex gap-2">
              <div className="h-10 w-28 rounded-full bg-ink" />
              <div className="h-10 w-28 rounded-full border border-line bg-white" />
            </div>
          </div>
          <div className="grid gap-3">
            {siteRows.map((row, index) => (
              <motion.div
                className="flex items-center justify-between rounded-2xl border border-line bg-slate-50/80 p-3"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.12, duration: 0.45 }}
                key={row}
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-accent shadow-glass">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-extrabold text-graphite">{row}</span>
                </div>
                <span className="h-2 w-12 rounded-full bg-blue-200" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-2 right-0 w-[42%] min-w-[150px] max-w-[210px] rounded-[34px] border border-white/90 bg-ink p-2 shadow-soft sm:bottom-8 sm:right-4"
        initial={{ opacity: 0, y: 34, rotate: 4 }}
        animate={{ opacity: 1, y: [0, 10, 0], rotate: [4, 2.5, 4] }}
        transition={{ opacity: { duration: 0.55, delay: 0.28 }, y: { duration: 8, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 8, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <div className="rounded-[28px] bg-white p-3">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200" />
          <div className="mt-5 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-blue-50 text-accent">
              <Smartphone className="h-4 w-4" />
            </span>
            <div>
              <div className="h-2.5 w-16 rounded-full bg-ink" />
              <div className="mt-1.5 h-2 w-12 rounded-full bg-slate-200" />
            </div>
          </div>
          <div className="mt-5 grid gap-2">
            <div className="h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50" />
            <div className="h-9 rounded-2xl bg-slate-100" />
            <div className="h-9 rounded-2xl bg-slate-100" />
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-ink px-3 py-3 text-xs font-extrabold text-white">
            <MessageCircle className="h-3.5 w-3.5" />
            Telegram
          </div>
        </div>
      </motion.div>
    </div>
  );
}
