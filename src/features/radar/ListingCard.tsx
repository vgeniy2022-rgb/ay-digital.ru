import { useState } from 'react';
import type { FeedListing, FeedbackAction } from '../../../radar/types';
import { errorMessage, saveFeedback } from './api';

const price = (n: number | null | undefined) => n == null ? 'Не рассчитано' : `${n.toLocaleString('ru-RU')} ₽`;
const time = (s: string | null) => s ? new Date(s).toLocaleString('ru-RU', { timeZone: 'Asia/Vladivostok' }) : 'Источник не сообщил';
export function ListingCard({ listing }: { listing: FeedListing }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState<{ action: FeedbackAction; operationId: string } | null>(null);
  async function feedback(action: FeedbackAction) {
    if (busy) return;
    // Reuse the operation on retry after an ambiguous network failure.
    const operation = pending?.action === action ? pending : { action, operationId: crypto.randomUUID() };
    setPending(operation); setBusy(true);
    try { await saveFeedback({ listingId: listing.id, ...operation }); setMessage('Решение сохранено'); setPending(null); }
    catch (error) { setMessage(errorMessage(error)); }
    finally { setBusy(false); }
  }
  const a = listing.analysis;
  return <article className="radar-listing">
    <div className="radar-listing-top"><span>{listing.source === 'avito' ? 'Avito' : 'FarPost'}</span><span className="radar-badge">{a?.classification || 'NOT_ANALYZED'}</span></div>
    {listing.imageUrls[0] && <img className="radar-listing-image" src={listing.imageUrls[0]} alt={listing.title} loading="lazy" referrerPolicy="no-referrer" />}
    <h3>{listing.title}</h3><p className="radar-price">{price(listing.priceRub)}</p>
    <p>{listing.product.key || 'Точная модель и конфигурация ещё не определены'}</p>
    <dl className="radar-metrics">
      {Object.entries({ 'Медиана рынка': price(a?.marketMedianRub), P25: price(a?.marketP25Rub), P10: price(a?.marketP10Rub),
        'Отклонение': a?.deviationPercent == null ? 'Не рассчитано' : `${a.deviationPercent}%`,
        'Перепродажа': a?.resaleMinRub == null ? 'Не рассчитано' : `${price(a.resaleMinRub)} — ${price(a.resaleMaxRub)}`,
        'Оценка прибыли': price(a?.profitRub), 'Оценка аномалии': a?.finalScore == null ? 'Не рассчитано' : `${a.finalScore}/100`,
        Риск: a?.risk.score == null ? 'Не анализировался' : `${a.risk.score}/100`, 'Публикация': time(listing.publishedAt),
        'Впервые найдено': time(listing.firstSeenAt), 'Место': listing.location || listing.region || 'Не указано', 'Статус источника': listing.status,
      }).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
    <a className="radar-button radar-button-primary" href={listing.url} target="_blank" rel="noopener noreferrer">Открыть объявление ↗</a>
    <div className="radar-actions">{([['SAVE', 'Сохранить'], ['NOT_INTERESTED', 'Не интересно'], ['SUSPICIOUS', 'Подозрительно'], ['PURCHASED', 'Куплено']] as const).map(([action, label]) =>
      <button key={action} disabled={busy} onClick={() => void feedback(action)}>{label}</button>)}</div>
    {message && <p role="status">{message}</p>}
  </article>;
}
