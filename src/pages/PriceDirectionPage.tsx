import { ArrowLeft, Check, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ButtonLink } from '../components/ButtonLink';
import { AddToCartButton } from '../components/AddToCartButton';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { PriceVisual } from '../components/PriceVisuals';
import { Reveal } from '../components/Reveal';
import { getPriceDirection } from '../data/priceDirections';
import { useSiteData } from '../hooks/useSiteData';
import { createCartKey, parseExactPrice } from '../utils/cart';

export function PriceDirectionPage() {
  const { slug } = useParams();
  const direction = getPriceDirection(slug);
  const { data } = useSiteData();

  useEffect(() => {
    if (!direction) return;
    document.title = `${direction.seoTitle} | ${data.site.domain}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', direction.seoDescription);
  }, [data.site.domain, direction]);

  if (!direction) {
    return <Navigate to="/prices" replace />;
  }

  return (
    <PageTransition>
      <section className="py-14 sm:py-20">
        <Container>
          <Link className="inline-flex items-center gap-2 text-sm font-extrabold text-accent transition hover:text-ink" to="/prices">
            <ArrowLeft className="h-4 w-4" />
            Все цены
          </Link>
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Направление</p>
              <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[1.03] tracking-normal text-ink sm:text-6xl">
                {direction.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{direction.description}</p>
              <div className="mt-8">
                <ButtonLink href={data.site.telegramUrl} showArrow={false}>
                  <MessageCircle className="h-4 w-4" />
                  Написать в Telegram
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <PriceVisual variant={direction.visual} />
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="pb-12 sm:pb-16">
        <Container>
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Пакеты</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">Выберите подходящий формат</h2>
          </Reveal>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {direction.packages.map((item, index) => (
              <Reveal delay={index * 0.04} key={item.name}>
                <article className="h-full rounded-premium border border-line bg-white/84 p-6 shadow-glass">
                  <div className="flex min-w-0 items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="min-w-0 text-2xl font-extrabold leading-tight">{item.name}</h3>
                      <p className="mt-3 max-w-full overflow-wrap-anywhere whitespace-normal text-lg font-extrabold leading-7 text-accent">
                        {item.price}
                      </p>
                    </div>
                    <AddToCartButton
                      item={{
                        key: createCartKey('package', `${direction.groupTitle}-${item.name}`),
                        id: `${direction.groupTitle}-${item.name}`,
                        type: 'package',
                        title: item.name,
                        category: direction.groupTitle,
                        priceText: item.price,
                        unitPrice: parseExactPrice(item.price),
                        quantity: 1,
                        description: item.fit,
                      }}
                    />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted">{item.fit}</p>
                  <div className="mt-5 grid gap-3">
                    {item.includes.map((include) => (
                      <div className="flex items-start gap-3 text-sm font-semibold leading-6 text-graphite" key={include}>
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        {include}
                      </div>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-5 lg:grid-cols-2">
            {direction.sections.map((section, index) => (
              <Reveal delay={index * 0.04} key={section.title}>
                <article className="h-full rounded-premium border border-line bg-slate-50 p-6 shadow-glass sm:p-8">
                  <h2 className="text-2xl font-extrabold">{section.title}</h2>
                  <div className="mt-5 grid gap-3">
                    {section.items.map((item) => (
                      <div className="flex items-start gap-3 text-sm font-semibold leading-6 text-graphite" key={item}>
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {item}
                      </div>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          {direction.disclaimer ? (
            <Reveal>
              <p className="mt-6 rounded-premium border border-blue-100 bg-blue-50/70 p-6 text-sm font-semibold leading-6 text-graphite shadow-glass">
                {direction.disclaimer}
              </p>
            </Reveal>
          ) : null}
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <Reveal>
            <div className="rounded-premium border border-line bg-ink p-8 text-white shadow-soft sm:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-200">Помощь с выбором</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">
                Не знаете, какой пакет выбрать?
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-blue-50">
                Напишите в Telegram — коротко опишите задачу, я подскажу подходящий вариант и примерную стоимость.
              </p>
              <div className="mt-7">
                <ButtonLink href={data.site.telegramUrl} variant="secondary" showArrow={false}>
                  Написать в Telegram
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </PageTransition>
  );
}
