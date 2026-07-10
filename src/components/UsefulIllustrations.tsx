import { motion } from 'framer-motion';
import { AlertTriangle, Check, Cloud, FileText, LockKeyhole, ShieldCheck, Smartphone } from 'lucide-react';
import { UsefulIllustrationVariant } from '../data/useful';

type IllustrationProps = {
  compact?: boolean;
};

const floatTransition = {
  duration: 5,
  repeat: Infinity,
  repeatType: 'reverse' as const,
  ease: 'easeInOut' as const,
};

function IllustrationShell({
  children,
  compact = false,
  tone = 'blue',
}: IllustrationProps & {
  children: React.ReactNode;
  tone?: 'blue' | 'green' | 'red' | 'slate';
}) {
  const gradient = {
    blue: 'from-blue-50 via-white to-emerald-50',
    green: 'from-emerald-50 via-white to-blue-50',
    red: 'from-rose-50 via-white to-blue-50',
    slate: 'from-slate-50 via-white to-blue-50',
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className={`relative mx-auto w-full max-w-[560px] overflow-hidden rounded-[36px] border border-white/80 bg-gradient-to-br ${gradient} shadow-soft ${
        compact ? 'min-h-[280px] p-5' : 'min-h-[390px] p-7 sm:p-8'
      }`}
    >
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="absolute -bottom-16 -left-14 h-44 w-44 rounded-full bg-emerald-100/70 blur-3xl" />
      <div className="relative h-full min-h-[inherit]">{children}</div>
    </motion.div>
  );
}

function Phone({
  className = '',
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      animate={{ y: [0, -8] }}
      transition={floatTransition}
      className={`absolute rounded-[30px] border border-white/90 bg-white p-3 shadow-glass ${className}`}
    >
      <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200" />
      <div className="mt-4 overflow-hidden rounded-[22px] bg-slate-50 p-4">{children}</div>
    </motion.div>
  );
}

function Laptop({ className = '', children }: { className?: string; children?: React.ReactNode }) {
  return (
    <motion.div animate={{ y: [0, 7] }} transition={{ ...floatTransition, duration: 6 }} className={`absolute ${className}`}>
      <div className="rounded-[24px] border border-white/90 bg-white p-4 shadow-glass">
        <div className="h-28 rounded-2xl bg-slate-50 p-4">{children}</div>
      </div>
      <div className="mx-auto h-3 w-44 rounded-b-3xl bg-slate-200/90" />
    </motion.div>
  );
}

function Pill({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`absolute flex items-center gap-2 rounded-full border border-white/80 bg-white/88 px-4 py-2 text-xs font-extrabold text-graphite shadow-glass backdrop-blur ${className}`}>
      {children}
    </div>
  );
}

function MiniRows({ danger = false }: { danger?: boolean }) {
  return (
    <div className="grid gap-3">
      <div className={`h-4 rounded-full ${danger ? 'bg-rose-100' : 'bg-blue-100'}`} />
      <div className="h-4 w-4/5 rounded-full bg-emerald-100" />
      <div className="h-4 w-3/5 rounded-full bg-slate-200" />
    </div>
  );
}

export function UsefulMainIllustration(props: IllustrationProps) {
  return (
    <IllustrationShell {...props} tone="blue">
      <Laptop className="bottom-8 right-5 hidden w-60 sm:block">
        <MiniRows />
      </Laptop>
      <Phone className="bottom-8 left-5 h-64 w-36">
        <MiniRows />
      </Phone>
      <Phone className="bottom-16 left-36 h-56 w-32 hidden sm:block">
        <div className="grid grid-cols-2 gap-3">
          <div className="h-12 rounded-2xl bg-blue-100" />
          <div className="h-12 rounded-2xl bg-emerald-100" />
          <div className="h-12 rounded-2xl bg-slate-200" />
          <div className="h-12 rounded-2xl bg-blue-50" />
        </div>
      </Phone>
      <Pill className="right-10 top-10">
        <Cloud className="h-4 w-4 text-accent" />
        Резервная копия
      </Pill>
      <Pill className="left-24 top-20">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        Защита аккаунтов
      </Pill>
      <Pill className="bottom-20 right-24 hidden sm:flex">
        <FileText className="h-4 w-4 text-slate-500" />
        Файлы и фото
      </Pill>
    </IllustrationShell>
  );
}

export function DataTransferIllustration(props: IllustrationProps) {
  return (
    <IllustrationShell {...props} tone="green">
      <Phone className="bottom-10 left-8 h-64 w-36">
        <MiniRows />
      </Phone>
      <Phone className="bottom-10 right-8 h-64 w-36">
        <div className="grid gap-3">
          {['Фото', 'Контакты', 'Чаты', 'Файлы'].map((item) => (
            <div className="rounded-2xl bg-white px-3 py-2 text-xs font-extrabold text-graphite shadow-sm" key={item}>
              {item}
            </div>
          ))}
        </div>
      </Phone>
      <motion.div
        animate={{ x: [0, 12] }}
        transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
        className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full bg-white/90 px-5 py-3 shadow-glass sm:flex"
      >
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        <span className="h-1 w-16 rounded-full bg-blue-200" />
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
      </motion.div>
      <Pill className="left-16 top-9">
        <Cloud className="h-4 w-4 text-accent" />
        Облако
      </Pill>
      <Pill className="bottom-8 left-1/2 -translate-x-1/2">
        <Check className="h-4 w-4 text-emerald-600" />
        Проверить результат
      </Pill>
    </IllustrationShell>
  );
}

export function DigitalHygieneIllustration(props: IllustrationProps) {
  return (
    <IllustrationShell {...props} tone="green">
      <Phone className="bottom-9 left-12 h-72 w-40">
        <div className="grid gap-3">
          {['Камера', 'Геопозиция', 'Микрофон', 'Фото'].map((item, index) => (
            <div className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm" key={item}>
              <span className="text-xs font-extrabold text-graphite">{item}</span>
              <span className={`h-5 w-9 rounded-full ${index < 2 ? 'bg-emerald-300' : 'bg-slate-200'}`} />
            </div>
          ))}
        </div>
      </Phone>
      <div className="absolute right-12 top-16 grid h-28 w-28 place-items-center rounded-[32px] bg-white/90 shadow-glass">
        <LockKeyhole className="h-12 w-12 text-accent" />
      </div>
      <Pill className="bottom-24 right-10">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        Приватность
      </Pill>
    </IllustrationShell>
  );
}

export function ScamsIllustration(props: IllustrationProps) {
  return (
    <IllustrationShell {...props} tone="red">
      <Phone className="bottom-8 left-10 h-72 w-44">
        <div className="grid gap-3">
          <div className="rounded-2xl bg-rose-50 p-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-rose-700">
              <AlertTriangle className="h-4 w-4" />
              Срочно подтвердите вход
            </div>
            <div className="mt-3 h-3 w-24 rounded-full bg-rose-100" />
          </div>
          <div className="rounded-2xl bg-white p-3 text-xs font-bold text-muted shadow-sm">Назовите код из SMS</div>
        </div>
      </Phone>
      <div className="absolute right-12 top-16 grid h-28 w-28 place-items-center rounded-[32px] bg-white/90 shadow-glass">
        <ShieldCheck className="h-12 w-12 text-emerald-600" />
      </div>
      <Pill className="bottom-20 right-8">
        <LockKeyhole className="h-4 w-4 text-accent" />
        Код не передавать
      </Pill>
    </IllustrationShell>
  );
}

export function AppsIllustration(props: IllustrationProps) {
  return (
    <IllustrationShell {...props} tone="slate">
      <div className="absolute bottom-12 left-10 h-56 w-48 rounded-[32px] border border-white/90 bg-white p-5 shadow-glass">
        <div className="text-sm font-extrabold text-ink">Официальный источник</div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div className="h-12 rounded-2xl bg-blue-50" key={item} />
          ))}
        </div>
      </div>
      <div className="absolute right-10 top-14 rounded-[28px] bg-white/92 p-5 shadow-glass">
        <div className="flex items-center gap-3 text-sm font-extrabold text-rose-700">
          <AlertTriangle className="h-5 w-5" />
          неизвестный файл.apk
        </div>
        <div className="mt-4 h-3 w-40 rounded-full bg-rose-100" />
      </div>
      <Pill className="bottom-14 right-14">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        Проверить источник
      </Pill>
    </IllustrationShell>
  );
}

export function ChecklistIllustration(props: IllustrationProps) {
  return (
    <IllustrationShell {...props} tone="blue">
      <div className="absolute bottom-10 left-10 h-64 w-48 rounded-[32px] border border-white/90 bg-white p-5 shadow-glass">
        <div className="text-sm font-extrabold text-ink">Чек-лист</div>
        <div className="mt-5 grid gap-4">
          {['Копия', 'Аккаунты', 'Локатор', 'Сброс'].map((item, index) => (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="flex items-center gap-3 text-xs font-extrabold text-graphite"
              key={item}
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <Check className="h-4 w-4" />
              </span>
              {item}
            </motion.div>
          ))}
        </div>
      </div>
      <Laptop className="bottom-14 right-10 hidden w-56 sm:block">
        <MiniRows />
      </Laptop>
      <Pill className="right-14 top-12">
        <Smartphone className="h-4 w-4 text-accent" />
        Перед продажей
      </Pill>
    </IllustrationShell>
  );
}

export function AppleIdProtectionIllustration(props: IllustrationProps) {
  return (
    <IllustrationShell {...props} tone="red">
      <Phone className="bottom-8 left-12 h-64 w-40">
        <div className="grid gap-3">
          <div className="rounded-2xl bg-white p-3 text-xs font-extrabold text-ink shadow-sm">Аккаунт</div>
          <div className="rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-700">Код: 482 019</div>
          <div className="rounded-2xl bg-slate-100 p-3 text-xs font-bold text-muted">Не передавать</div>
        </div>
      </Phone>
      <div className="absolute right-14 top-16 grid h-28 w-28 place-items-center rounded-[32px] bg-white/90 shadow-glass">
        <LockKeyhole className="h-12 w-12 text-accent" />
      </div>
      <Pill className="bottom-20 right-8">
        <AlertTriangle className="h-4 w-4 text-rose-600" />
        Не входить в чужой аккаунт
      </Pill>
    </IllustrationShell>
  );
}

export function MacSecurityIllustration(props: IllustrationProps) {
  return (
    <IllustrationShell {...props} tone="blue">
      <Laptop className="bottom-10 left-8 w-72">
        <div className="grid gap-3">
          <div className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm">
            <span className="text-xs font-extrabold text-graphite">FileVault</span>
            <LockKeyhole className="h-4 w-4 text-accent" />
          </div>
          <MiniRows />
        </div>
      </Laptop>
      <Pill className="right-10 top-12">
        <Cloud className="h-4 w-4 text-accent" />
        iCloud
      </Pill>
      <Pill className="bottom-16 right-12">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        Разрешения
      </Pill>
    </IllustrationShell>
  );
}

export function UsefulIllustration({ variant, compact = false }: { variant: UsefulIllustrationVariant; compact?: boolean }) {
  if (variant === 'transfer') return <DataTransferIllustration compact={compact} />;
  if (variant === 'hygiene') return <DigitalHygieneIllustration compact={compact} />;
  if (variant === 'scams') return <ScamsIllustration compact={compact} />;
  if (variant === 'apps') return <AppsIllustration compact={compact} />;
  return <UsefulMainIllustration compact={compact} />;
}
