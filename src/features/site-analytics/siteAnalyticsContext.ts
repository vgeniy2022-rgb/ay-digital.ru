import { createContext } from 'react';
import type { SiteStats } from './siteAnalytics';

export type SiteAnalyticsValue = {
  stats: SiteStats | null;
  status: 'loading' | 'ready' | 'unavailable';
};

export const SiteAnalyticsContext = createContext<SiteAnalyticsValue>({ stats: null, status: 'loading' });
