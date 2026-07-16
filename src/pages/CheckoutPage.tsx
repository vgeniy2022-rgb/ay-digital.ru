import { FormEvent, useEffect, useState } from 'react';
import { Check, Mail, MessageCircle, Phone, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder } from '../api/ordersApi';
import { ButtonLink } from '../components/ButtonLink';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { paymentsConfig } from '../config/payments';
import { useCart } from '../hooks/useCart';
import { CheckoutPayload, OrderSuccessData } from '../types/cart';
import { formatRub, orderSuccessStorageKey } from '../utils/cart';
import { formatRussianPhone, hasPhoneLetters, validateRussianMobilePhone } from '../utils/phone';
import { useSiteData } from '../hooks/useSiteData';

type ContactMethod = 'Позвонить' | 'Telegram' | 'WhatsApp' | 'Email';
type WorkFormat = 'Удалённо' | 'Выезд';

const today = new Date().toISOString().slice(0, 10);
const agreedLaterPaymentMethod = 'Согласуется после оформления';
const contactMethods: { value: ContactMethod; label: string; hint: string; icon: typeof Phone }[] = [
  { value: 'Позвонить', label: 'Позвонить', hint: 'по номеру телефона', icon: Phone },
  { value: 'Telegram', label: 'Telegram', hint: 'по этому же номеру', icon: Send },
  { value: 'WhatsApp', label: 'WhatsApp', hint: 'по этому же номеру', icon: MessageCircle },
  { value: 'Email', label: 'Email', hint: 'адрес уточню позже', icon: Mail },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, knownTotal, hasUnknownPrices, clearCart } = useCart();
  const { data } = useSiteData();
  const [preferredContactMethods, setPreferredContactMethods] = useState<ContactMethod[]>(['Позвонить']);
  const [workFormat, setWorkFormat] = useState<WorkFormat>('Удалённо');
  const [hasConsent, setHasConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [timeMode, setTimeMode] = useState('Неважно');

  const hasItems = items.length > 0;
  const phoneValidation = validateRussianMobilePhone(phone);
  const canSubmit = hasConsent && phoneValidation.isValid && !isSubmitting;

  const toggleContactMethod = (method: ContactMethod) => {
    setPreferredContactMethods((current) =>
      current.includes(method) ? current.filter((item) => item !== method) : [...current, method],
    );
  };

  useEffect(() => {
    document.title = 'Оформление заказа — AY Digital';
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Оформление заказа AY Digital.');
  }, []);

  const validate = (formData: FormData) => {
    const clientName = String(formData.get('clientName') || '').trim();
    const address = String(formData.get('address') || '').trim();

    if (!clientName) return 'Укажите имя.';
    if (!phoneValidation.isValid) return phoneValidation.error;
    if (!preferredContactMethods.length) return 'Выберите хотя бы один способ связи.';
    if (workFormat === 'Выезд' && !address) return 'Для выезда укажите адрес.';
    if (!hasConsent) return 'Нужно согласие на обработку персональных данных.';
    return '';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const validationError = validate(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    const clientName = String(formData.get('clientName') || '').trim();
    const normalizedPhone = phoneValidation.normalized;

    const payload: CheckoutPayload = {
      name: clientName,
      clientName,
      phone: normalizedPhone,
      preferredContactMethods,
      contactMethod: preferredContactMethods.join(', '),
      telegram: preferredContactMethods.includes('Telegram') ? normalizedPhone : '',
      whatsapp: preferredContactMethods.includes('WhatsApp') ? normalizedPhone : '',
      email: '',
      workFormat,
      address: workFormat === 'Выезд' ? String(formData.get('address') || '').trim() : '',
      preferredDate: String(formData.get('preferredDate') || ''),
      preferredTime: timeMode === 'Точное время' ? String(formData.get('preferredTime') || '') : timeMode,
      comment: String(formData.get('comment') || '').trim(),
      paymentMethod: agreedLaterPaymentMethod,
      paymentStatus: paymentsConfig.enabled ? 'pending_manual_payment' : 'not_required',
      total: knownTotal,
      items,
    };

    try {
      const result = await createOrder(payload);
      const successData: OrderSuccessData = {
        orderNumber: result.orderNumber,
        status: 'Новый',
        total: knownTotal,
        hasUnknownPrices,
        items,
      };
      window.sessionStorage.setItem(orderSuccessStorageKey, JSON.stringify(successData));
      clearCart();
      navigate('/order-success');
    } catch (orderError) {
      console.error('[Checkout] Order request failed:', orderError);
      setError('Не удалось оформить заказ. Попробуйте ещё раз или напишите в Telegram.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasItems) {
    return (
      <PageTransition>
        <section className="py-16 sm:py-20">
          <Container>
            <Reveal>
              <div className="rounded-premium border border-line bg-white/84 p-8 text-center shadow-glass">
                <h1 className="text-4xl font-extrabold">Корзина пока пуста</h1>
                <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted">Добавьте услуги или готовые пакеты перед оформлением.</p>
                <div className="mt-7">
                  <ButtonLink to="/services">Перейти к услугам</ButtonLink>
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
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Заказ</p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-6xl">Оформление заказа</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">Оставьте контакты и удобное время. Я свяжусь с вами, уточню детали задачи и подтвержу итоговую стоимость.</p>
          </Reveal>

          <form className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]" onSubmit={handleSubmit}>
            <div className="grid gap-5">
              <section className="rounded-premium border border-line bg-white/84 p-6 shadow-glass">
                <h2 className="text-2xl font-extrabold">Ваши данные</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-bold">Имя<input className="min-h-12 rounded-2xl border border-line bg-slate-50 px-4 text-base outline-none focus:border-accent" name="clientName" autoComplete="name" /></label>
                  <label className="grid gap-2 text-sm font-bold">
                    Телефон
                    <input
                      className={`min-h-12 rounded-2xl border bg-slate-50 px-4 text-base outline-none transition focus:bg-white ${
                        phone && !phoneValidation.isValid ? 'border-rose-300 focus:border-rose-500' : 'border-line focus:border-accent'
                      }`}
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+7 (999) 123-45-67"
                      value={phone}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setPhone(hasPhoneLetters(nextValue) ? nextValue : formatRussianPhone(nextValue));
                        if (error === phoneValidation.error) setError('');
                      }}
                    />
                    {phone && !phoneValidation.isValid ? <span className="text-sm font-semibold text-rose-700">{phoneValidation.error}</span> : null}
                  </label>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">Номер используется для звонка, Telegram или WhatsApp, если вы выберете эти способы ниже.</p>
              </section>

              <section className="rounded-premium border border-line bg-white/84 p-6 shadow-glass">
                <h2 className="text-2xl font-extrabold">Как с вами связаться?</h2>
                <p className="mt-3 text-sm leading-6 text-muted">Можно выбрать несколько вариантов. Если выберете Email, адрес уточню отдельно.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {contactMethods.map(({ value, label, hint, icon: Icon }) => {
                    const isActive = preferredContactMethods.includes(value);

                    return (
                      <button
                        className={`group flex min-h-20 items-center gap-4 rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft ${
                          isActive ? 'border-blue-200 bg-blue-50/80 shadow-glass' : 'border-line bg-slate-50 hover:bg-white'
                        }`}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => toggleContactMethod(value)}
                        key={value}
                      >
                        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition ${isActive ? 'bg-ink text-white' : 'bg-white text-accent shadow-sm'}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-extrabold text-ink">{label}</span>
                          <span className="mt-1 block text-xs leading-5 text-muted">{hint}</span>
                        </span>
                        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition ${
                          isActive ? 'border-ink bg-ink text-white' : 'border-line bg-white text-transparent group-hover:border-accent'
                        }`}>
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-premium border border-line bg-white/84 p-6 shadow-glass">
                <h2 className="text-2xl font-extrabold">Формат работы</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {(['Удалённо', 'Выезд'] as WorkFormat[]).map((format) => (
                    <button className={`rounded-full border px-4 py-2 text-sm font-bold ${workFormat === format ? 'border-ink bg-ink text-white' : 'border-line bg-white'}`} type="button" onClick={() => setWorkFormat(format)} key={format}>{format}</button>
                  ))}
                </div>
                {workFormat === 'Выезд' ? (
                  <label className="mt-5 grid gap-2 text-sm font-bold">
                    Адрес
                    <input className="min-h-12 rounded-2xl border border-line bg-slate-50 px-4 text-base outline-none focus:border-accent" name="address" placeholder="Город, улица, дом, квартира или офис" autoComplete="street-address" />
                    <span className="text-sm font-normal leading-6 text-muted">Выезд доступен во Владивостоке. Возможность и стоимость выезда подтверждаются отдельно.</span>
                  </label>
                ) : null}
              </section>

              <section className="rounded-premium border border-line bg-white/84 p-6 shadow-glass">
                <h2 className="text-2xl font-extrabold">Когда удобно</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-bold">Желаемая дата<input className="min-h-12 rounded-2xl border border-line bg-slate-50 px-4 text-base outline-none focus:border-accent" type="date" min={today} name="preferredDate" /></label>
                  <label className="grid gap-2 text-sm font-bold">Удобное время<select className="min-h-12 rounded-2xl border border-line bg-slate-50 px-4 text-base outline-none focus:border-accent" value={timeMode} onChange={(event) => setTimeMode(event.target.value)}>
                    {['Утро', 'День', 'Вечер', 'Неважно', 'Точное время'].map((value) => <option key={value}>{value}</option>)}
                  </select></label>
                  {timeMode === 'Точное время' ? <label className="grid gap-2 text-sm font-bold sm:col-span-2">Время<input className="min-h-12 rounded-2xl border border-line bg-slate-50 px-4 text-base outline-none focus:border-accent" type="time" name="preferredTime" /></label> : null}
                </div>
              </section>

              <section className="rounded-premium border border-line bg-white/84 p-6 shadow-glass">
                <h2 className="text-2xl font-extrabold">Комментарий</h2>
                <textarea className="mt-5 min-h-32 w-full resize-y rounded-2xl border border-line bg-slate-50 px-4 py-3 text-base outline-none focus:border-accent" name="comment" placeholder="Расскажите подробнее о задаче" />
              </section>

            </div>

            <aside className="h-fit rounded-premium border border-line bg-slate-50 p-6 shadow-glass">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Итого</p>
              <h2 className="mt-3 text-3xl font-extrabold">Предварительная сумма</h2>
              <p className="mt-4 text-3xl font-extrabold text-accent">{formatRub(knownTotal)}</p>
              {hasUnknownPrices ? <p className="mt-3 text-sm font-semibold leading-6 text-muted">Часть стоимости будет рассчитана после уточнения задачи.</p> : null}
              <div className="mt-5 grid gap-2 text-sm leading-6 text-muted">
                <p>Для сайтов итоговая цена зависит от страниц, функций, материалов и правок.</p>
                <p>Комплектующие, SSD, лицензии и платные программы согласуются отдельно.</p>
                <p>Некоторые приложения, чаты, пароли и eSIM могут переноситься отдельно.</p>
              </div>
              <p className="mt-5 rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-graphite">
                Оформление заказа не обязывает к оплате. Сначала мы уточним задачу, стоимость, сроки и формат работы.
              </p>
              <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-white p-4 text-sm leading-6 text-muted">
                <input className="mt-1 h-4 w-4 shrink-0 accent-blue-700" type="checkbox" checked={hasConsent} onChange={(event) => setHasConsent(event.target.checked)} />
                <span>
                  Я соглашаюсь с обработкой персональных данных и принимаю{' '}
                  <Link className="font-semibold text-accent hover:text-ink" to="/privacy">Политику обработки персональных данных</Link>
                  {' '}и{' '}
                  <Link className="font-semibold text-accent hover:text-ink" to="/terms">Условия оказания услуг</Link>.
                </span>
              </label>
              {error ? <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-semibold leading-6 text-rose-700">{error}</p> : null}
              <button className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-6 text-sm font-bold text-white shadow-soft transition enabled:hover:-translate-y-0.5 enabled:hover:bg-graphite disabled:cursor-not-allowed disabled:bg-slate-300" type="submit" disabled={!canSubmit}>
                {isSubmitting ? 'Оформляем заказ…' : 'Оформить заказ'}
              </button>
              {error ? <ButtonLink href={data.site.telegramUrl} className="mt-3 w-full" variant="secondary" showArrow={false}>Написать в Telegram</ButtonLink> : null}
            </aside>
          </form>
        </Container>
      </section>
    </PageTransition>
  );
}
