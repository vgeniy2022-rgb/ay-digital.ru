import { useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import { labExperiments, labPublicExperimentIds } from '../core/catalog';
import {
  ensureLabIdentity,
  fetchLabStats,
  getExperimentEventId,
  isLabVisitTracked,
  markLabVisitTracked,
  trackExperimentStart,
  trackLabVisit,
  type LabStats,
} from './labAnalytics';
import { LabAnalyticsContext, type LabStatsStatus } from './labAnalyticsContext';

export function LabAnalyticsProvider({ children }: PropsWithChildren) {
  const location = useLocation();
  const [stats, setStats] = useState<LabStats | null>(null);
  const [status, setStatus] = useState<LabStatsStatus>('loading');
  const visitRequest = useRef<Promise<boolean> | null>(null);
  const statsRequest = useRef<Promise<LabStats | null> | null>(null);
  const trackedNavigations = useRef(new Set<string>());

  useEffect(() => {
    const experiment = labExperiments.find((item) => item.href === location.pathname);
    if (!experiment) return;
    const navigationId = `${location.key || 'initial'}:${experiment.id}`;
    if (trackedNavigations.current.has(navigationId)) return;
    trackedNavigations.current.add(navigationId);
    const { sessionId } = ensureLabIdentity(window.localStorage, window.sessionStorage);
    const eventId = getExperimentEventId(window.sessionStorage, location.key, experiment.id);
    void trackExperimentStart(experiment.id, eventId, sessionId);
  }, [location.key, location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/lab') return;
    let active = true;
    const load = async () => {
      setStatus('loading');
      const { visitorId, sessionId } = ensureLabIdentity(window.localStorage, window.sessionStorage);
      if (!isLabVisitTracked(window.sessionStorage)) {
        visitRequest.current ??= trackLabVisit(visitorId, sessionId).then((accepted) => {
          if (accepted) markLabVisitTracked(window.sessionStorage);
          return accepted;
        }).finally(() => { visitRequest.current = null; });
        await visitRequest.current;
      }
      statsRequest.current ??= fetchLabStats(labPublicExperimentIds).finally(() => { statsRequest.current = null; });
      const nextStats = await statsRequest.current;
      if (!active) return;
      setStats(nextStats);
      setStatus(nextStats ? 'ready' : 'unavailable');
    };
    void load();
    return () => { active = false; };
  }, [location.pathname]);

  const value = useMemo(() => ({ stats, status }), [stats, status]);
  return <LabAnalyticsContext.Provider value={value}>{children}</LabAnalyticsContext.Provider>;
}
