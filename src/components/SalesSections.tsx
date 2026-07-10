import { Check, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { ButtonLink } from './ButtonLink';
import { Container } from './Container';
import { Reveal } from './Reveal';
import { useSiteData } from '../hooks/useSiteData';

const adminFeatures = [
  ['Услуги и цены', 'Меняйте стоимость, описание и порядок показа услуг.'],
  ['Фото и портфолио', 'Добавляйте реальные работы, новые фото и примеры проектов.'],
  ['Отзывы', 'Публикуйте отзывы, скрины и короткие комментарии клиентов.'],
  ['Акции', 'Запускайте временные предложения без правки кода.'],
  ['Скрытие старого', 'Отключайте неактуальные услуги, не удаляя их навсегда.'],
  ['Инструкция', 'После запуска можно получить короткую инструкцию по управлению.'],
];

const audiences = [
  'Салоны красоты',
  'Ногтевые студии',
  'Фотостудии',
  'Частные специалисты',
  'Мастера услуг',
  'Репетиторы и эксперты',
  'Небольшие локальные бизнесы',
  'Онлайн-проекты',
];

const deliverables = [
  ['Готовый сайт', 'Собранный и опубликованный сайт под вашу задачу.'],
  ['Адаптация под телефон', 'Сайт корректно выглядит на смартфонах и компьютерах.'],
  ['Базовая SEO-структура', 'Заголовки, описания страниц и понятная структура.'],
  ['Подключение домена', 'Помогу подключить домен, если он есть или будет куплен.'],
  ['Инструкция', 'Объясню, как пользоваться сайтом или админкой.'],
  ['Возможность переноса', 'Сайт можно перенести на другой хостинг при необходимости.'],
  ['Файлы сайта', 'Передача файлов возможна по договорённости после завершения работы.'],
];

const agreementItems = [
  'что входит в задачу',
  'стоимость',
  'сроки',
  'количество правок',
  'материалы от клиента',
  'способ публикации',
  'передачу доступов и файлов',
  'дальнейшую поддержку',
];

function AdminMockup() {
  return (
    <div className="relative min-h-[320px] overflow-hidden rounded-premium border border-white/80 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-6 shadow-soft">
      <div className="absolute right-8 top-8 grid h-14 w-14 place-items-center rounded-2xl bg-white/90 text-accent shadow-glass">
        <LayoutDashboard className="h-7 w-7" />
      </div>
      <div className="absolute bottom-8 left-6 right-10 rounded-[28px] border border-line bg-white/90 p-5 shadow-glass">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 rounded-full bg-slate-200" />
          <div className="h-8 w-20 rounded-full bg-ink" />
        </div>
        <div className="mt-6 grid gap-3">
          {['Услуга', 'Цена', 'Отзыв', 'Акция'].map((item, index) => (
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3" key={item}>
              <span className="text-xs font-extrabold text-graphite">{item}</span>
              <span className={`h-5 w-10 rounded-full ${index < 3 ? 'bg-emerald-200' : 'bg-blue-200'}`} />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute left-8 top-10 h-36 w-24 rounded-[28px] border border-white/90 bg-white p-3 shadow-glass">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-200" />
        <div className="mt-5 grid gap-2">
          <div className="h-8 rounded-2xl bg-blue-100" />
          <div className="h-8 rounded-2xl bg-emerald-100" />
          <div className="h-8 rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export function AdminWebsiteSection() {
  const { data } = useSiteData();

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Сайт с админкой</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
              Сайт, которым можно управлять без программиста
            </h2>
            <p className="mt-5 text-base leading-8 text-muted">
              Клиент может сам добавлять услуги, менять цены, публиковать отзывы, скрывать старые позиции, обновлять
              акции и добавлять фото работ через простую админку.
            </p>
            <div className="mt-7">
              <ButtonLink href={data.site.telegramUrl} showArrow={false}>Хочу сайт с админкой</ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <AdminMockup />
          </Reveal>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminFeatures.map(([title, text], index) => (
            <Reveal delay={index * 0.035} key={title}>
              <div className="h-full rounded-premium border border-line bg-white/82 p-5 shadow-glass">
                <h3 className="font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function WebsiteAudienceSection() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Для кого</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">Для кого я делаю сайты</h2>
        </Reveal>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((item, index) => (
            <Reveal delay={index * 0.025} key={item}>
              <div className="flex min-h-20 items-center gap-3 rounded-3xl border border-line bg-white/82 p-5 text-sm font-bold text-graphite shadow-glass">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-50 text-accent">
                  <Check className="h-4 w-4" />
                </span>
                {item}
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="mt-6 rounded-premium border border-line bg-slate-50 p-6 text-base leading-7 text-muted shadow-glass">
            Если у вас есть услуги, цены, отзывы, фото работ и запись через мессенджер — сайт поможет показать это
            аккуратно и понятно.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

export function DirectoryComparisonSection() {
  const { data } = useSiteData();
  const directory = ['короткая информация', 'ограниченное оформление', 'мало места для объяснений', 'не всегда удобно показать актуальные цены', 'сложно передать атмосферу'];
  const website = ['подробные услуги и цены', 'реальные фото и кейсы', 'отзывы и скрины', 'акции и условия записи', 'кнопки Telegram / WhatsApp / телефон', 'можно подключить админку'];

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <Reveal>
          <div className="rounded-premium border border-line bg-white/82 p-7 shadow-soft sm:p-10">
            <h2 className="text-4xl font-extrabold leading-tight sm:text-5xl">Почему одного 2ГИС часто недостаточно</h2>
            <p className="mt-5 max-w-4xl text-base leading-8 text-muted">
              Карточка в справочнике помогает найти бизнес на карте, но сайт помогает человеку принять решение. На сайте
              можно подробно показать услуги, цены, фото работ, отзывы, акции, условия записи и атмосферу проекта.
            </p>
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {[
                ['Карточка в справочнике', directory],
                ['Собственный сайт', website],
              ].map(([title, items]) => (
                <div className="rounded-premium border border-line bg-slate-50 p-6" key={title as string}>
                  <h3 className="text-2xl font-extrabold">{title as string}</h3>
                  <div className="mt-5 grid gap-3">
                    {(items as string[]).map((item) => (
                      <div className="flex gap-3 text-sm font-semibold text-graphite" key={item}>
                        <Check className="h-5 w-5 shrink-0 text-accent" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-7">
              <ButtonLink href={data.site.telegramUrl} showArrow={false}>Сделать сайт для моего бизнеса</ButtonLink>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export function DeliverablesSection() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Результат</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">Что вы получаете после работы</h2>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {deliverables.map(([title, text], index) => (
            <Reveal delay={index * 0.035} key={title}>
              <div className="h-full rounded-premium border border-line bg-white/82 p-6 shadow-glass">
                <h3 className="text-xl font-extrabold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="mt-6 rounded-premium border border-line bg-slate-50 p-6 text-sm leading-6 text-muted shadow-glass">
            Объём передачи файлов, доступов и исходников лучше согласовать до начала работы.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

export function AgreementSection() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <Reveal>
          <div className="rounded-premium border border-line bg-slate-50 p-7 shadow-glass sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">До старта</p>
                <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">Перед началом работы согласуем</h2>
                <p className="mt-5 text-base leading-7 text-muted">
                  Это помогает избежать недопонимания и заранее определить границы работы.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {agreementItems.map((item) => (
                  <div className="flex items-center gap-3 rounded-3xl bg-white p-4 text-sm font-bold text-graphite" key={item}>
                    <Check className="h-5 w-5 shrink-0 text-accent" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export function LegalPreparationSection() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <Reveal>
          <div className="rounded-premium border border-blue-100 bg-blue-50/70 p-7 shadow-glass sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-accent shadow-glass">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h2 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">
                  Базовая подготовка сайта к работе с заявками
                </h2>
                <p className="mt-5 max-w-4xl text-base leading-8 text-muted">
                  Могу добавить на сайт политику обработки персональных данных, согласие под формами, условия оказания
                  услуг, cookie-уведомление и аккуратные дисклеймеры. Это помогает сделать сайт понятнее и безопаснее для
                  работы с клиентами.
                </p>
                <p className="mt-4 max-w-4xl text-sm font-semibold leading-6 text-graphite">
                  Это базовая техническая подготовка сайта, а не юридическое заключение. Для полной правовой проверки
                  рекомендуется обратиться к юристу.
                </p>
              </div>
              <div className="shrink-0 rounded-3xl bg-white p-5 text-sm font-extrabold text-accent shadow-glass">
                3 000–5 000 ₽
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
