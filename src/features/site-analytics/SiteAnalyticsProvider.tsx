import { useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import { ensureSiteVisit, fetchSiteStats, type SiteStats } from './siteAnalytics';
import { SiteAnalyticsContext, type SiteAnalyticsValue } from './siteAnalyticsContext';
import { trackVisitorPage } from './visitorIntelligence';

export function SiteAnalyticsProvider({ children }: PropsWithChildren) {
  const location = useLocation();
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [status, setStatus] = useState<SiteAnalyticsValue['status']>('loading');
  const trackedNavigations = useRef(new Set<string>());

  useEffect(() => {
    const navigationId = `${location.key || 'initial'}:${location.pathname}`;
    if (trackedNavigations.current.has(navigationId)) return;
    trackedNavigations.current.add(navigationId);
    void trackVisitorPage(location.pathname, location.key, location.search, window.localStorage, window.sessionStorage, navigator.userAgent, document.referrer, window.location.hostname);
  }, [location.key, location.pathname, location.search]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await ensureSiteVisit(window.location.pathname, window.localStorage, window.sessionStorage);
      const nextStats = await fetchSiteStats();
      if (!active) return;
      setStats(nextStats);
      setStatus(nextStats ? 'ready' : 'unavailable');
    };
    void load();
    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({ stats, status }), [stats, status]);
  return <SiteAnalyticsContext.Provider value={value}>{children}</SiteAnalyticsContext.Provider>;
}
