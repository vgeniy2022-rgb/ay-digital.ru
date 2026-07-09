import { MessageCircle, Phone, Send } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteData } from '../hooks/useSiteData';

type PreparedRequest = {
  name: string;
  service: string;
  description: string;
  text: string;
};

export function ContactForm() {
  const [preparedRequest, setPreparedRequest] = useState<PreparedRequest | null>(null);
  const [hasConsent, setHasConsent] = useState(false);
  const { data } = useSiteData();
  const { serviceOptions, site } = data;

  const createRequestText = (name: string, service: string, description: string) => {
    const cleanName = name.trim() || 'не указано';
    const cleanDescription = description.trim() || 'не указано';

    return `Здравствуйте, ${site.name}! Меня зовут ${cleanName}. Интересует услуга: ${service}. Задача: ${cleanDescription}.`;
  };

  const createContactHref = (channel: 'telegram' | 'whatsappPrimary' | 'whatsappSecondary' | 'sms', text: string) => {
    const encodedText = encodeURIComponent(text);

    if (channel === 'telegram') {
      return `${site.telegramUrl}?text=${encodedText}`;
    }

    if (channel === 'sms') {
      return `${site.smsUrl}?body=${encodedText}`;
    }

    const whatsappUrl = channel === 'whatsappSecondary' ? site.whatsappSecondaryUrl : site.whatsappUrl;
    return `${whatsappUrl}?text=${encodedText}`;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasConsent) return;

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') || '');
    const service = String(formData.get('service') || serviceOptions[0] || 'Услуга не выбрана');
    const description = String(formData.get('description') || '');

    setPreparedRequest({
      name,
      service,
      description,
      text: createRequestText(name, service, description),
    });
  };

  return (
    <div className="rounded-premium border border-line bg-white/84 p-5 shadow-soft sm:p-7">
      {preparedRequest ? (
        <div className="grid min-h-[360px] place-items-center">
          <div>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-accent">
              <Send className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-center text-2xl font-extrabold">Заявка подготовлена.</h2>
            <p className="mx-auto mt-4 max-w-sm text-center text-base leading-7 text-muted">
              Выберите удобный способ связи. Текст обращения уже подставится автоматически.
            </p>
            <div className="mt-6 rounded-3xl bg-slate-50 p-4 text-sm leading-6 text-muted">
              {preparedRequest.text}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-graphite"
                href={createContactHref('telegram', preparedRequest.text)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                Написать в Telegram
              </a>
              <a
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-bold text-ink shadow-glass transition hover:-translate-y-0.5 hover:border-slate-300"
                href={createContactHref('whatsappPrimary', preparedRequest.text)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                Написать в WhatsApp
              </a>
              <a
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-bold text-ink shadow-glass transition hover:-translate-y-0.5 hover:border-slate-300"
                href={createContactHref('sms', preparedRequest.text)}
              >
                <Send className="h-4 w-4" />
                Отправить SMS
              </a>
              <a
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-bold text-ink shadow-glass transition hover:-translate-y-0.5 hover:border-slate-300"
                href={site.phoneUrl}
              >
                <Phone className="h-4 w-4" />
                Позвонить
              </a>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <a
                className="text-center text-sm font-bold text-accent transition hover:text-ink"
                href={createContactHref('whatsappSecondary', preparedRequest.text)}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp на дополнительный номер
              </a>
              <button
                className="text-sm font-bold text-muted transition hover:text-ink"
                type="button"
                onClick={() => setPreparedRequest(null)}
              >
                Изменить заявку
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-ink">
            Имя
            <input className="min-h-12 rounded-2xl border border-line bg-slate-50 px-4 outline-none transition focus:border-accent focus:bg-white" name="name" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-ink">
            Телефон или мессенджер
            <input
              className="min-h-12 rounded-2xl border border-line bg-slate-50 px-4 outline-none transition focus:border-accent focus:bg-white"
              name="contact"
              placeholder={site.phones[0]}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-ink">
            Выбор услуги
            <select className="min-h-12 rounded-2xl border border-line bg-slate-50 px-4 outline-none transition focus:border-accent focus:bg-white" name="service">
              {serviceOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-ink">
            Описание задачи
            <textarea
              className="min-h-32 resize-y rounded-2xl border border-line bg-slate-50 px-4 py-3 outline-none transition focus:border-accent focus:bg-white"
              name="description"
            />
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-slate-50 p-4 text-sm leading-6 text-muted">
            <input
              className="mt-1 h-4 w-4 shrink-0 accent-blue-700"
              type="checkbox"
              checked={hasConsent}
              onChange={(event) => setHasConsent(event.target.checked)}
            />
            <span>
              Я соглашаюсь с{' '}
              <Link className="font-semibold text-accent hover:text-ink" to="/privacy">обработкой персональных данных</Link>
              {' '}и принимаю{' '}
              <Link className="font-semibold text-accent hover:text-ink" to="/terms">условия обращения</Link>.
            </span>
          </label>
          <button
            className="mt-2 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-sm font-bold text-white shadow-soft transition enabled:hover:-translate-y-0.5 enabled:hover:bg-graphite disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            type="submit"
            disabled={!hasConsent}
          >
            Отправить заявку
            <Send className="h-4 w-4" />
          </button>
        </form>
      )}
    </div>
  );
}
