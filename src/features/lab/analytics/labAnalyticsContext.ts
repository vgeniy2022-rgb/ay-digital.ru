import { createContext, useContext } from 'react';
import { labExperiments } from '../core/catalog';
import type { LabExperimentId } from '../core/types';
import type { LabStats } from './labAnalytics';

export type LabStatsStatus = 'loading' | 'ready' | 'unavailable';
export type LabAnalyticsContextValue = { stats: LabStats | null; status: LabStatsStatus };

export const LabAnalyticsContext = createContext<LabAnalyticsContextValue>({ stats: null, status: 'loading' });

export function useLabAnalytics() {
  return useContext(LabAnalyticsContext);
}

export function getPopularLabExperiments(stats: LabStats | null) {
  if (!stats) return [];
  return labExperiments
    .map((experiment) => ({ experiment, starts: stats.experiments[experiment.id as LabExperimentId] || 0 }))
    .filter((item) => item.starts > 0)
    .sort((left, right) => right.starts - left.starts || left.experiment.number.localeCompare(right.experiment.number))
    .slice(0, 3);
}
