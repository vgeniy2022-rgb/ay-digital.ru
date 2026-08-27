import { ButtonLink } from '../components/ButtonLink';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { SeoHead } from '../components/SeoHead';
import { MapPin } from 'lucide-react';

export function NotFoundPage() {
  return (
    <PageTransition>
      <SeoHead
        title="Страница не найдена — SITEVL"
        description="Такой страницы на сайте SITEVL нет."
        canonicalPath="/404"
        noindex
      />
      <section className="relative isolate min-h-[72vh] overflow-hidden bg-[#050b13] py-16 text-white sm:py-20">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_76%_20%,rgba(37,99,235,0.24),transparent_28rem),linear-gradient(180deg,transparent_30%,rgba(14,35,55,0.65))]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 opacity-45" aria-hidden="true">
          <div className="absolute inset-x-0 bottom-0 h-20 bg-[#02060b]" />
          <div className="absolute bottom-14 left-[8%] h-20 w-12 bg-[#07111d] shadow-[90px_16px_0_10px_#07111d,205px_-8px_0_18px_#07111d,360px_10px_0_8px_#07111d,520px_-20px_0_26px_#07111d,710px_2px_0_15px_#07111d]" />
          <div className="absolute bottom-24 left-[46%] h-24 w-px rotate-[22deg] bg-blue-300/40" />
          <div className="absolute bottom-24 left-[58%] h-24 w-px -rotate-[22deg] bg-blue-300/40" />
          <div className="absolute bottom-20 left-[46%] right-[42%] h-px bg-blue-300/35" />
        </div>
        <Container>
          <div className="mx-auto max-w-2xl border-y border-white/10 py-12 text-center sm:py-16">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-300">SITEVL · 404</p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-6xl">Страница не найдена</h1>
            <p className="mx-auto mt-5 max-w-md text-base leading-7 text-slate-300">
              Маршрут закончился раньше, чем ожидалось. Можно вернуться во Владивосток или продолжить со списка услуг.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink to="/" showArrow={false}><MapPin className="h-4 w-4" />Вернуться во Владивосток</ButtonLink>
              <ButtonLink to="/services" variant="secondary" className="!border-white/70 !bg-white/5 !text-white hover:!bg-white/10" showArrow={false}>Посмотреть услуги</ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </PageTransition>
  );
}
