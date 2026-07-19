import { Copy, MessageCircle, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ButtonLink } from '../components/ButtonLink';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { useCart } from '../hooks/useCart';
import { formatRub } from '../utils/cart';
import { useSiteData } from '../hooks/useSiteData';

function formatCartMessage(items: ReturnType<typeof useCart>['items'], knownTotal: number, hasUnknownPrices: boolean) {
  const lines = [
    'Здравствуйте! Меня интересуют услуги с сайта ay-digital.ru:',
    '',
    ...items.map((item) => {
      const quantity = item.quantity > 1 ? ` × ${item.quantity}` : '';
      return `— ${item.title}${quantity} — ${item.priceText}`;
    }),
    '',
    `Ориентировочная стоимость: ${knownTotal > 0 ? formatRub(knownTotal) : 'нужно уточнить'}.`,
  ];

  if (hasUnknownPrices) {
    lines.push('Часть стоимости нужно уточнить по задаче.');
  }

  lines.push('', 'Хочу уточнить детали, точную цену и сроки.');
  return lines.filter((line) => line !== undefined && line !== null).join('\n');
}

export function CheckoutPage() {
  const { items, knownTotal, hasUnknownPrices, clearCart } = useCart();
  const { data } = useSiteData();
  const [copyMessage, setCopyMessage] = useState('');
  const discussionText = useMemo(() => formatCartMessage(items, knownTotal, hasUnknownPrices), [hasUnknownPrices, items, knownTotal]);
  const whatsappHref = `${data.site.whatsappUrl}?text=${encodeURIComponent(discussionText)}`;

  const copyList = async () => {
    try {
      await navigator.clipboard.writeText(discussionText);
      setCopyMessage('Список услуг скопирован. Вставьте его в сообщение.');
    } catch {
      setCopyMessage('Не удалось скопировать автоматически. Можно выделить текст списка вручную.');
    }
  };

  const discussInTelegram = async () => {
    await copyList();
    window.open(data.site.telegramUrl, '_blank', 'noopener,noreferrer');
  };

  if (!items.length) {
    return (
      <PageTransition>
        <section className="py-16 sm:py-20">
          <Container>
            <Reveal>
              <div className="rounded-premium border border-line bg-white/84 p-8 text-center shadow-glass">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Выбранные услуги</p>
                <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-6xl">Вы пока ничего не выбрали</h1>
                <p className="mx-auto mt-5 max-w-md text-base leading-7 text-muted">
                  Добавьте услуги или пакеты в список, чтобы затем обсудить детали в Telegram или WhatsApp.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <ButtonLink to="/services" showArrow={false}>Смотреть услуги</ButtonLink>
                  <ButtonLink href={data.site.telegramUrl} variant="secondary" showArrow={false}>
                    <MessageCircle className="h-4 w-4" />
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

  return (
    <PageTransition>
      <section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Выбранные услуги</p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-6xl">Обсудить выбранные услуги</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              Выберите удобный способ связи. Сайт не отправляет и не хранит ваши контактные данные.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="grid gap-4">
              {items.map((item) => (
                <Reveal key={item.key}>
                  <article className="rounded-premium border border-line bg-white/84 p-5 shadow-glass">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-graphite">
                          {item.type === 'service' ? 'Услуга' : 'Пакет'}
                        </span>
                        <h2 className="mt-4 text-2xl font-extrabold leading-tight">{item.title}</h2>
                        <p className="mt-2 text-sm font-extrabold text-accent">{item.priceText}</p>
                      </div>
                      <span className="rounded-full border border-line bg-white px-4 py-2 text-sm font-extrabold text-graphite">
                        {item.quantity} шт.
                      </span>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>

            <aside className="h-fit rounded-premium border border-line bg-slate-50 p-6 shadow-glass">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Итого</p>
              <h2 className="mt-3 text-3xl font-extrabold">Ориентировочная стоимость</h2>
              <p className="mt-4 text-3xl font-extrabold text-accent">{formatRub(knownTotal)}</p>
              {hasUnknownPrices ? <p className="mt-3 text-sm font-semibold leading-6 text-muted">Часть стоимости будет рассчитана после уточнения задачи.</p> : null}
              <p className="mt-4 text-sm leading-6 text-muted">
                Стоимость ориентировочная. Точная цена, состав работы и сроки согласуются в переписке до начала работы.
              </p>
              <div className="mt-6 rounded-3xl bg-white p-4 text-sm leading-6 text-muted">
                <pre className="whitespace-pre-wrap font-sans">{discussionText}</pre>
              </div>
              {copyMessage ? <p className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm font-semibold leading-6 text-graphite">{copyMessage}</p> : null}
              <div className="mt-6 grid gap-3">
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-graphite"
                  type="button"
                  onClick={discussInTelegram}
                >
                  <MessageCircle className="h-4 w-4" />
                  Обсудить в Telegram
                </button>
                <ButtonLink href={whatsappHref} variant="secondary" showArrow={false}>
                  <MessageCircle className="h-4 w-4" />
                  Написать в WhatsApp
                </ButtonLink>
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-white px-6 text-sm font-bold text-ink shadow-glass transition hover:-translate-y-0.5 hover:border-slate-300"
                  type="button"
                  onClick={copyList}
                >
                  <Copy className="h-4 w-4" />
                  Скопировать список
                </button>
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full text-sm font-bold text-muted transition hover:bg-white hover:text-ink"
                  type="button"
                  onClick={() => {
                    if (window.confirm('Очистить список выбранных услуг?')) clearCart();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Очистить список
                </button>
                <ButtonLink to="/services" variant="ghost" showArrow={false}>Вернуться к услугам</ButtonLink>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </PageTransition>
  );
}
