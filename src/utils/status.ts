import { SiteSettings } from '../types/cms';

export type StatusType = 'available' | 'busy' | 'queue' | 'urgent' | 'offline';

export type StatusViewData = {
  title: string;
  text: string;
  type: StatusType;
  label: string;
  dotClassName: string;
  haloClassName: string;
  textClassName: string;
};

const fallbackByType: Record<StatusType, { title: string; text: string }> = {
  available: {
    title: 'Сегодня свободен',
    text: 'Можно написать в Telegram и обсудить задачу.',
  },
  busy: {
    title: 'Сегодня занят',
    text: 'Сегодня загружен задачами, но можно написать — отвечу, когда освобожусь.',
  },
  queue: {
    title: 'Работаю по очереди',
    text: 'Новые задачи беру в очередь.',
  },
  urgent: {
    title: 'Беру срочные задачи',
    text: 'Могу взять срочную задачу, если она подходит по объёму.',
  },
  offline: {
    title: 'Временно недоступен',
    text: 'Сейчас временно не беру новые задачи.',
  },
};

const stylesByType: Record<StatusType, Pick<StatusViewData, 'dotClassName' | 'haloClassName' | 'textClassName'>> = {
  available: {
    dotClassName: 'bg-emerald-500',
    haloClassName: 'bg-emerald-100',
    textClassName: 'text-emerald-700',
  },
  busy: {
    dotClassName: 'bg-amber-500',
    haloClassName: 'bg-amber-100',
    textClassName: 'text-amber-700',
  },
  queue: {
    dotClassName: 'bg-blue-500',
    haloClassName: 'bg-blue-100',
    textClassName: 'text-blue-700',
  },
  urgent: {
    dotClassName: 'bg-accent',
    haloClassName: 'bg-blue-100',
    textClassName: 'text-accent',
  },
  offline: {
    dotClassName: 'bg-slate-400',
    haloClassName: 'bg-slate-100',
    textClassName: 'text-slate-600',
  },
};

export function getStatusViewData(settings?: Pick<SiteSettings, 'statusTitle' | 'statusText' | 'statusType'>): StatusViewData {
  const rawType = settings?.statusType?.trim();
  const type: StatusType = rawType && rawType in fallbackByType ? (rawType as StatusType) : 'available';
  const fallback = fallbackByType[type];

  return {
    type,
    label: 'Статус',
    title: settings?.statusTitle?.trim() || fallback.title,
    text: settings?.statusText?.trim() || fallback.text,
    ...stylesByType[type],
  };
}

export const loadingStatusViewData: StatusViewData = {
  type: 'offline',
  label: 'Статус',
  title: 'Проверяю статус',
  text: 'Загружаю актуальную информацию о доступности.',
  dotClassName: 'bg-slate-300',
  haloClassName: 'bg-slate-100',
  textClassName: 'text-slate-500',
};
