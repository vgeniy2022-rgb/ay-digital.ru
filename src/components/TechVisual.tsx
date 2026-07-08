import { motion } from 'framer-motion';

export function TechVisual() {
  return (
    <div className="relative min-h-[360px] sm:min-h-[460px]">
      <motion.div
        className="tech-slab absolute left-8 top-4 h-52 w-72 rounded-premium border border-white shadow-soft sm:left-16 sm:h-64 sm:w-96"
        animate={{ y: [0, -12, 0], rotateX: [0, 2, 0], rotateY: [-10, -6, -10] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-0 top-28 h-56 w-64 rounded-premium border border-line bg-white/72 p-5 shadow-glass backdrop-blur-xl sm:right-8 sm:w-80"
        animate={{ y: [0, 14, 0], rotate: [0, -1.5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="h-3 w-24 rounded-full bg-ink" />
        <div className="mt-8 grid gap-3">
          <div className="h-12 rounded-2xl bg-slate-100" />
          <div className="h-12 rounded-2xl bg-blue-50" />
          <div className="h-12 rounded-2xl bg-slate-100" />
        </div>
      </motion.div>
      <motion.div
        className="absolute bottom-0 left-0 h-44 w-72 rounded-premium border border-line bg-white/80 p-5 shadow-glass backdrop-blur-xl sm:left-8"
        animate={{ y: [0, -8, 0], rotate: [0, 1.4, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="grid grid-cols-3 gap-3">
          <div className="h-20 rounded-2xl bg-ink" />
          <div className="h-20 rounded-2xl bg-slate-100" />
          <div className="h-20 rounded-2xl bg-blue-100" />
        </div>
        <div className="mt-5 h-3 w-40 rounded-full bg-slate-200" />
        <div className="mt-3 h-3 w-28 rounded-full bg-slate-100" />
      </motion.div>
    </div>
  );
}
