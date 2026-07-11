import { ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { ButtonLink } from '../components/ButtonLink';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { AgreementSection } from '../components/SalesSections';
import { useSiteData } from '../hooks/useSiteData';

const processSteps = [
  ['Обсуждаем задачу', 'Вы рассказываете, что нужно сделать: сайт, приложение, презентация, настройка техники или другая цифровая задача.'],
  ['Согласуем объём', 'Фиксируем, что входит в работу: страницы, блоки, функции, материалы, сроки и ориентировочная стоимость.'],
  ['Старт работы', 'После согласования задачи, стоимости, сроков и формата можно запускать работу.'],
  ['Первая версия', 'Я подготавливаю первую рабочую версию: макет, сайт, презентацию, прототип или другое решение.'],
  ['Правки', 'Вы смотрите результат и отправляете правки в рамках согласованной задачи.'],
  ['Финальная версия', 'После правок проект публикуется, передаётся или подготавливается к использованию.'],
  ['Инструкция', 'Если у проекта есть админка или самостоятельное управление, я могу подготовить короткую инструкцию.'],
];

const exclusions = [
  'покупка домена',
  'платный хостинг',
  'платные сервисы',
  'услуги юриста',
  'услуги дизайнера/фотографа, если не согласовано',
  'большой объём текстов',
  'большое количество дополнительных правок',
  'поддержка после завершения проекта, если она не согласована',
];

export function ProcessPage() {
  const { data } = useSiteData();

  return (
    <PageTransition>
      <section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Порядок работы</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-tight sm:text-6xl">
              Спокойный процесс с понятными шагами
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
              Сначала разбираемся в задаче, затем согласуем объём, цену, сроки и формат результата. Без давления и лишней сложности.
            </p>
            <div className="mt-8">
              <ButtonLink href={data.site.telegramUrl} showArrow={false}>Обсудить задачу</ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="pb-12 sm:pb-16">
        <Container>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {processSteps.map(([title, text], index) => (
              <Reveal delay={index * 0.04} key={title}>
                <article className="h-full rounded-premium border border-line bg-white/84 p-6 shadow-glass">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-accent">0{index + 1}</span>
                    <ArrowDownRight className="h-5 w-5 text-slate-300" />
                  </div>
                  <h2 className="mt-8 text-2xl font-extrabold">{title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <AgreementSection />

      <section className="py-12 sm:py-16">
        <Container>
          <Reveal>
            <div className="rounded-premium border border-line bg-slate-50 p-7 shadow-glass sm:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Границы работы</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">
                Что не входит в стоимость по умолчанию
              </h2>
              <div className="mt-7 grid gap-3 md:grid-cols-2">
                {exclusions.map((item) => (
                  <div className="flex items-start gap-3 rounded-3xl bg-white p-4 text-sm font-bold leading-6 text-graphite" key={item}>
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </PageTransition>
  );
}
