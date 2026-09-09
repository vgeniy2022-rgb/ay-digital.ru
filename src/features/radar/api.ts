import type { RadarDashboard, RadarFeedback } from '../../../radar/types';

export class RadarApiError extends Error {
  constructor(readonly code: string, readonly status: number) { super(code); }
}
export async function radarRequest<T>(action: 'dashboard' | 'session' | 'login' | 'logout' | 'feedback', body?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api/radar?action=${action}`, { method: body === undefined ? 'GET' : 'POST',
    credentials: 'same-origin', cache: 'no-store', signal,
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  let result: unknown;
  try { result = await response.json(); } catch { throw new RadarApiError('RADAR_UNAVAILABLE', response.status); }
  if (!response.ok) throw new RadarApiError(typeof result === 'object' && result && 'error' in result ? String(result.error) : 'RADAR_UNAVAILABLE', response.status);
  if (action === 'dashboard' && response.headers.get('X-Sitevl-QA-Fixture') === 'true' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    const fixture = result as RadarDashboard;
    fixture.components.database.detail = 'QA FIXTURE: локальная проверка интерфейса. Это не проверка реального Supabase.';
  }
  return result as T;
}
export const loadDashboard = (signal?: AbortSignal) => radarRequest<RadarDashboard>('dashboard', undefined, signal);
export const saveFeedback = (feedback: Omit<RadarFeedback, 'channel'>) => radarRequest<{ saved: boolean; duplicate: boolean }>('feedback', feedback);
export function errorMessage(error: unknown) {
  const code = error instanceof RadarApiError ? error.code : '';
  if (code === 'RADAR_DISABLED') return 'Deal Radar выключен на сервере. Публичный сайт работает независимо от него.';
  if (['AUTH_REQUIRED', 'LOGIN_FAILED'].includes(code)) return 'Войдите с учётной записью владельца. Проверьте email и пароль.';
  if (code === 'OWNER_REQUIRED') return 'Учётная запись не имеет доступа владельца Deal Radar.';
  if (code === 'RATE_LIMITED') return 'Слишком много запросов. Подождите минуту и повторите.';
  if (['AUTH_NOT_CONFIGURED', 'OWNER_REGISTRY_UNAVAILABLE', 'RATE_LIMIT_NOT_CONFIGURED'].includes(code)) return 'Закрытый доступ ещё не настроен на сервере. Инструкция — в документации проекта.';
  return 'Не удалось выполнить запрос. Данные не подменяются демонстрационными. Попробуйте позже.';
}
