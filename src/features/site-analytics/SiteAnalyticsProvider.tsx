import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { ensureSiteVisit, fetchSiteStats, type SiteStats } from './siteAnalytics';
import { SiteAnalyticsContext, type SiteAnalyticsValue } from './siteAnalyticsContext';

export function SiteAnalyticsProvider({ children }: PropsWithChildren) {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [status, setStatus] = useState<SiteAnalyticsValue['status']>('loading');

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
