import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { LockKeyhole, Radar, RefreshCw, LogOut } from 'lucide-react';
import type { RadarDashboard } from '../../../radar/types';
import { errorMessage, loadDashboard, RadarApiError, radarRequest } from './api';
import { RadarHead } from './RadarHead';
import { ListingCard } from './ListingCard';
import './radar.css';

const labels = { avito: 'Avito Collector', farpost: 'FarPost Collector', database: 'База данных', telegram: 'Telegram', analyzer: 'Анализатор' };
const statusLabels: Record<string, string> = { NOT_CONFIGURED: 'Не настроено', NOT_ACTIVE: 'Не запущено', CONFIGURED_NOT_TESTED: 'Настроено · не проверено', ONLINE: 'Проверено', ERROR: 'Ошибка', BLOCKED: 'Доступ ограничен', DEGRADED: 'Работает с ограничениями', RATE_LIMITED: 'Лимит запросов', AUTH_ERROR: 'Ошибка авторизации' };
const timestamp = (value: string | null | undefined) => value ? new Date(value).toLocaleString('ru-RU', { timeZone: 'Asia/Vladivostok' }) : 'Сканирований ещё не было';

export function RadarPage() {
  const [data, setData] = useState<RadarDashboard | null>(null);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');
  const [canLogin, setCanLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  function failed(error: unknown) {
    setData(null); setMessage(errorMessage(error));
    setCanLogin(error instanceof RadarApiError && [401, 403].includes(error.status));
  }
  useEffect(() => {
    const controller = new AbortController();
    loadDashboard(controller.signal).then(setData).catch(error => { if (!controller.signal.aborted) failed(error); })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, []);
  async function refresh() {
    setBusy(true); setMessage('');
    try { setData(await loadDashboard()); } catch (error) { failed(error); } finally { setBusy(false); }
  }
  async function login(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    const suppliedPassword = password; setPassword('');
    try { await radarRequest('login', { email, password: suppliedPassword }); setCanLogin(false); await refresh(); }
    catch (error) { failed(error); } finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true);
    try { await radarRequest('logout', {}); setData(null); setCanLogin(true); setMessage('Вы вышли из закрытого пространства.'); }
    catch (error) { setMessage(errorMessage(error)); } finally { setBusy(false); }
  }
  return <main className="radar-root">
    <RadarHead />
    <div className="radar-container">
      <header className="radar-header"><div className="radar-brand"><Radar aria-hidden="true" /><div><span>SITEVL / ВНУТРЕННИЙ ИНСТРУМЕНТ</span><h1>Deal Radar</h1></div></div>
        <div className="radar-actions"><Link to="/">На сайт</Link>{data && <button onClick={() => void logout()} disabled={busy}><LogOut size={16} />Выйти</button>}</div>
      </header>
      {!data ? <section className="radar-gate" aria-busy={busy}>
        <LockKeyhole aria-hidden="true" size={32} /><h2>{busy ? 'Проверяем доступ…' : 'Только для владельца'}</h2>
        <p role="status">{message || 'История рынка и объявления доступны только после проверки учётной записи.'}</p>
        {canLogin && <form onSubmit={event => void login(event)} className="radar-login">
          <label>Email владельца<input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required maxLength={300} disabled={busy} /></label>
          <label>Пароль<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required maxLength={256} disabled={busy} /></label>
          <button className="radar-button-primary" disabled={busy} type="submit">Войти в Deal Radar</button>
          <small>Вход через Supabase Auth. Самостоятельная регистрация не предоставляет доступ к Radar.</small>
        </form>}
        {!canLogin && !busy && <button onClick={() => void refresh()}><RefreshCw size={16} />Проверить снова</button>}
      </section> : <>
        <section className="radar-intro"><div><span className="radar-eyebrow">PHASE 1 · FOUNDATION</span><h2>Состояние системы</h2><p>Основа мониторинга б/у техники. Сбор, оценка выгодности и отправка alerts пока не запущены.</p></div>
          <button onClick={() => void refresh()} disabled={busy}><RefreshCw size={16} />{busy ? 'Обновляем…' : 'Обновить статус'}</button></section>
        {data.development && <p className="radar-notice">Безопасный режим разработки. Автоматические сканирования и Telegram-уведомления выключены. Демонстрационные объявления не загружаются.</p>}
        {message && <p className="radar-notice" role="status">{message}</p>}
        <div className="radar-status-grid">{(Object.keys(labels) as (keyof typeof labels)[]).map(key => <article className="radar-status-card" key={key}>
          <h3>{labels[key]}</h3><span className={`radar-badge radar-status-${data.components[key].status.toLowerCase()}`}>{statusLabels[data.components[key].status] || data.components[key].status}</span>
          <p>{data.components[key].detail}</p>{data.components[key].checkedAt && <small>Проверка: {timestamp(data.components[key].checkedAt)}</small>}
        </article>)}</div>
        <section className="radar-panel"><h2>Сканирование и рынок</h2><dl className="radar-metrics">
          <div><dt>Последний scan</dt><dd>{timestamp(data.runtime.map(r => r.lastSuccessAt).filter((s): s is string => Boolean(s)).sort().slice(-1)[0])}</dd></div>
          <div><dt>Следующий scan</dt><dd>Планировщик не запущен</dd></div>
          <div><dt>Объявлений в базе</dt><dd>{data.counts.listings ?? 'Нет данных'}</dd></div>
          <div><dt>Обработано за scan</dt><dd>{data.runtime.length ? data.runtime.reduce((sum, r) => sum + r.processed, 0) : 'Нет данных'}</dd></div>
          <div><dt>Новых за scan</dt><dd>{data.runtime.length ? data.runtime.reduce((sum, r) => sum + r.newListings, 0) : 'Нет данных'}</dd></div>
          <div><dt>Аномалии / HOT</dt><dd>Анализ ещё не выполнялся</dd></div>
        </dl></section>
        <section className="radar-feed"><h2>Лента объявлений</h2>{data.listings.length ? <div className="radar-feed-grid">{data.listings.map(listing => <ListingCard key={listing.id} listing={listing} />)}</div> :
          <div className="radar-empty"><Radar size={36} aria-hidden="true" /><h3>{data.components.database.status === 'ONLINE' ? 'Объявлений пока нет' : 'Лента пока недоступна'}</h3>
            <p>Здесь появятся реальные данные после подключения разрешённого источника. Нет выдуманных цен, оценок рынка или «выгодных» предложений.</p></div>}
        </section>
        <footer className="radar-footer">Время: Владивосток · Данные закрыты RLS · Не является рекомендацией к покупке</footer>
      </>}
    </div>
  </main>;
}
