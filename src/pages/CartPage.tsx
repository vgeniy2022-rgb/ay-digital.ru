import { Minus, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ButtonLink } from '../components/ButtonLink';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { useCart } from '../hooks/useCart';
import { formatRub } from '../utils/cart';

export function CartPage() {
  const { items, removeItem, increaseQuantity, decreaseQuantity, clearCart, knownTotal, hasUnknownPrices } = useCart();

  useEffect(() => {
    document.title = 'Корзина услуг — AY Digital';
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Корзина выбранных услуг AY Digital.');
  }, []);

  return (
    <PageTransition>
      <section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Заказ</p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-6xl">Корзина</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">Проверьте выбранные услуги перед обсуждением стоимости и сроков.</p>
          </Reveal>

          {items.length ? (
            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="grid gap-4">
                {items.map((item) => (
                  <Reveal key={item.key}>
                    <article className="rounded-premium border border-line bg-white/84 p-5 shadow-glass">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-graphite">
                              {item.type === 'service' ? 'Услуга' : 'Пакет'}
                            </span>
                            {item.category ? (
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-accent">{item.category}</span>
                            ) : null}
                          </div>
                          <h2 className="mt-4 text-2xl font-extrabold leading-tight">{item.title}</h2>
                          <p className="mt-2 text-sm font-extrabold text-accent">{item.priceText}</p>
                          {item.description ? <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p> : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white" type="button" aria-label={`Уменьшить количество: ${item.title}`} onClick={() => decreaseQuantity(item.key)}>
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-8 text-center text-lg font-extrabold">{item.quantity}</span>
                          <button className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white" type="button" aria-label={`Увеличить количество: ${item.title}`} onClick={() => increaseQuantity(item.key)}>
                            <Plus className="h-4 w-4" />
                          </button>
                          <button className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-rose-600" type="button" aria-label={`Удалить позицию: ${item.title}`} onClick={() => removeItem(item.key)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {item.unitPrice !== null ? (
                        <p className="mt-4 text-sm font-bold text-graphite">Сумма позиции: {formatRub(item.unitPrice * item.quantity)}</p>
                      ) : (
                        <p className="mt-4 text-sm font-semibold text-muted">Цена уточняется после обсуждения задачи.</p>
                      )}
                    </article>
                  </Reveal>
                ))}
              </div>

              <aside className="h-fit rounded-premium border border-line bg-slate-50 p-6 shadow-glass">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Итого</p>
                <h2 className="mt-3 text-3xl font-extrabold">Предварительная сумма</h2>
                <p className="mt-4 text-3xl font-extrabold text-accent">{formatRub(knownTotal)}</p>
                {hasUnknownPrices ? (
                  <p className="mt-3 text-sm font-semibold leading-6 text-muted">Часть стоимости будет рассчитана после уточнения задачи.</p>
                ) : null}
                <p className="mt-4 text-sm leading-6 text-muted">Предварительная сумма рассчитана по выбранным услугам. Итоговая стоимость зависит от объёма задачи и подтверждается после обсуждения.</p>
                <div className="mt-6 grid gap-3">
                  <ButtonLink to="/checkout" showArrow={false}>Перейти к выбранным услугам</ButtonLink>
                  <ButtonLink to="/services" variant="secondary" showArrow={false}>Продолжить выбор</ButtonLink>
                  <button
                    className="min-h-11 rounded-full text-sm font-bold text-muted transition hover:bg-white hover:text-ink"
                    type="button"
                    onClick={() => {
                      if (window.confirm('Очистить список выбранных услуг?')) clearCart();
                    }}
                  >
                    Очистить список
                  </button>
                </div>
              </aside>
            </div>
          ) : (
            <Reveal>
              <div className="mt-10 rounded-premium border border-line bg-white/84 p-8 text-center shadow-glass">
                <h2 className="text-3xl font-extrabold">Список пока пуст</h2>
                <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted">Добавьте услуги или готовые пакеты, чтобы затем обсудить детали в мессенджере.</p>
                <div className="mt-7">
                  <ButtonLink to="/services">Перейти к услугам</ButtonLink>
                </div>
              </div>
            </Reveal>
          )}
          <div className="mt-8 text-center">
            <Link className="text-sm font-bold text-accent transition hover:text-ink" to="/prices">Посмотреть пакеты и цены</Link>
          </div>
        </Container>
      </section>
    </PageTransition>
  );
}
