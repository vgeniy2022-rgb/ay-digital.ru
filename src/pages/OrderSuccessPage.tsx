import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ButtonLink } from '../components/ButtonLink';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { useSiteData } from '../hooks/useSiteData';
import { OrderSuccessData } from '../types/cart';
import { formatRub, orderSuccessStorageKey } from '../utils/cart';

export function OrderSuccessPage() {
  const { data } = useSiteData();
  const [order, setOrder] = useState<OrderSuccessData | null>(null);
  const orderItems = order?.items ?? [];

  useEffect(() => {
    document.title = 'Заказ оформлен — AY Digital';
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Заказ AY Digital оформлен.');

    try {
      const raw = window.sessionStorage.getItem(orderSuccessStorageKey);
      setOrder(raw ? (JSON.parse(raw) as OrderSuccessData) : null);
    } catch {
      setOrder(null);
    }
  }, []);

  return (
    <PageTransition>
      <section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <div className="mx-auto max-w-3xl rounded-premium border border-line bg-white/84 p-8 text-center shadow-soft sm:p-10">
              {order ? (
                <>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Готово</p>
                  <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-6xl">Заказ оформлен</h1>
                  <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted">
                    Спасибо! Я получил ваш заказ и свяжусь с вами, чтобы уточнить детали, подтвердить стоимость и договориться о времени.
                  </p>
                  <div className="mt-8 grid gap-3 rounded-premium bg-slate-50 p-6 text-left">
                    <div className="flex justify-between gap-4 text-sm"><span className="font-bold text-muted">Номер заказа</span><span className="font-extrabold">{order.orderNumber}</span></div>
                    <div className="flex justify-between gap-4 text-sm"><span className="font-bold text-muted">Статус</span><span className="font-extrabold">{order.status}</span></div>
                    <div className="border-t border-line pt-3">
                      <p className="text-sm font-bold text-muted">Состав заказа</p>
                      <div className="mt-3 grid gap-2">
                        {orderItems.map((item) => (
                          <div className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between sm:gap-4" key={item.key}>
                            <span className="font-semibold text-graphite">{item.title} × {item.quantity}</span>
                            <span className="break-words font-extrabold sm:shrink-0">{item.unitPrice !== null ? formatRub(item.unitPrice * item.quantity) : item.priceText}</span>
                          </div>
                        ))}
                        {!orderItems.length ? <p className="text-sm leading-6 text-muted">Состав заказа сохранён в заявке.</p> : null}
                      </div>
                    </div>
                    {order.total > 0 ? (
                      <div className="flex justify-between gap-4 border-t border-line pt-3 text-sm">
                        <span className="font-bold text-muted">Предварительная сумма</span>
                        <span className="font-extrabold">{formatRub(order.total)}</span>
                      </div>
                    ) : null}
                    <p className="border-t border-line pt-3 text-sm font-semibold leading-6 text-muted">Итоговая стоимость подтверждается после обсуждения задачи.</p>
                  </div>
                  <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <ButtonLink to="/" showArrow={false}>Вернуться на главную</ButtonLink>
                    <ButtonLink to="/services" variant="secondary" showArrow={false}>Посмотреть услуги</ButtonLink>
                    <ButtonLink href={data.site.telegramUrl} variant="secondary" showArrow={false}>
                      <MessageCircle className="h-4 w-4" />
                      Написать в Telegram
                    </ButtonLink>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl">Данные заказа не найдены</h1>
                  <p className="mx-auto mt-6 max-w-md text-lg leading-8 text-muted">Возможно, страница была открыта напрямую или данные уже очищены.</p>
                  <div className="mt-8">
                    <ButtonLink to="/" showArrow={false}>На главную</ButtonLink>
                  </div>
                </>
              )}
            </div>
          </Reveal>
        </Container>
      </section>
    </PageTransition>
  );
}
