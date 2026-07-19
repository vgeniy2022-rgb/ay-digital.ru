import { MessageCircle, Phone, Send } from 'lucide-react';
import { useSiteData } from '../hooks/useSiteData';

export function ContactForm() {
  const { data } = useSiteData();
  const { site } = data;

  return (
    <div className="rounded-premium border border-line bg-white/84 p-5 shadow-soft sm:p-7">
      <div className="grid min-h-[360px] place-items-center">
        <div className="w-full">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-accent">
            <Send className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-2xl font-extrabold">Связаться напрямую</h2>
          <p className="mx-auto mt-4 max-w-sm text-center text-base leading-7 text-muted">
            Сайт не принимает и не хранит заявки через форму. Вы сами решаете, какие данные сообщать в Telegram, WhatsApp, SMS или по телефону.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <a
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-graphite"
              href={site.telegramUrl}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="h-4 w-4" />
              Telegram
            </a>
            <a
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-bold text-ink shadow-glass transition hover:-translate-y-0.5 hover:border-slate-300"
              href={site.whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-bold text-ink shadow-glass transition hover:-translate-y-0.5 hover:border-slate-300"
              href={site.phoneUrl}
            >
              <Phone className="h-4 w-4" />
              Позвонить
            </a>
            <a
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 text-sm font-bold text-ink shadow-glass transition hover:-translate-y-0.5 hover:border-slate-300"
              href={site.smsUrl}
            >
              <Send className="h-4 w-4" />
              SMS
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
