import type { Environment, RadarConfig } from '../config';
import type { ComponentHealth, NotificationPayload, NotificationProvider } from '../types';
import { sourceUrl, rubles } from '../normalization';
import { telegramConfiguration } from '../server/legacy.mjs';

export function notificationIdentity(payload: Pick<NotificationPayload, 'listingId' | 'classification' | 'event'>) {
  return `${payload.listingId}:${payload.classification}:${payload.event}`;
}
export function formatRadarNotification(payload: NotificationPayload) {
  const source = new URL(payload.url).hostname.endsWith('avito.ru') ? 'avito' : 'farpost';
  const url = sourceUrl(payload.url, source);
  const title = payload.title.replace(/[\r\n]/g, ' ').slice(0, 180);
  return [`🚨 Deal Radar · ${payload.classification}`, title, `Цена: ${rubles(payload.priceRub).toLocaleString('ru-RU')} ₽`,
    `Рынок: ${rubles(payload.marketMedianRub).toLocaleString('ru-RU')} ₽`,
    payload.profitRub !== null ? `Оценка прибыли: ${payload.profitRub.toLocaleString('ru-RU')} ₽` : 'Прибыль: не рассчитана', url].join('\n');
}
export class TelegramNotificationProvider implements NotificationProvider {
  constructor(private readonly env: Environment, private readonly config: RadarConfig) {}
  async healthCheck(): Promise<ComponentHealth> {
    const { token, chatId } = telegramConfiguration(this.env);
    return { status: token && chatId ? 'CONFIGURED_NOT_TESTED' : 'NOT_CONFIGURED', checkedAt: null,
      detail: token && chatId ? 'Существующий бот настроен. Доставка Radar в PHASE 1 выключена и не проверялась.' : 'Секреты существующего бота не доступны этому runtime.' };
  }
  async send(): Promise<{ status: 'NOT_ACTIVE'; retryable: false }> {
    // Intentionally no fetch/sendMessage in this phase. Prevent development fixtures from escaping.
    void this.config;
    return { status: 'NOT_ACTIVE', retryable: false };
  }
}
