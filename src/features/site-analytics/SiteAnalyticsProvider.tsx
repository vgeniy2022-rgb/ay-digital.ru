import { useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import { ensureSiteVisit, fetchSiteStats, type SiteStats } from './siteAnalytics';
import { SiteAnalyticsContext, type SiteAnalyticsValue } from './siteAnalyticsContext';
import { contactChannel, trackVisitorAction, trackVisitorBehavior, trackVisitorPage } from './visitorIntelligence';
import { observeVisitorBehavior } from './visitorBehavior';

export function SiteAnalyticsProvider({ children }: PropsWithChildren) {
  const location = useLocation();
  // No public counters, visitor session creation or behavior observers in the owner workspace.
  if (/^\/radar(?:\/|$)/i.test(location.pathname)) return <>{children}</>;
  return <TrackedSiteAnalyticsProvider>{children}</TrackedSiteAnalyticsProvider>;
}

function TrackedSiteAnalyticsProvider({ children }: PropsWithChildren) {
  const location = useLocation();
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [status, setStatus] = useState<SiteAnalyticsValue['status']>('loading');
  const trackedNavigations = useRef(new Set<string>());
  const behavior = useRef<ReturnType<typeof observeVisitorBehavior> | null>(null);

  useEffect(() => {
    const observer = observeVisitorBehavior((path, summary) => {
      void trackVisitorBehavior(path, summary, window.localStorage, window.sessionStorage);
    }, (path, href) => {
      const channel = contactChannel(href);
      if (channel) void trackVisitorAction('contact_click', path, channel, window.localStorage, window.sessionStorage);
    });
    behavior.current = observer;
    return () => { observer.dispose(); behavior.current = null; };
  }, []);

  useEffect(() => {
    const navigationId = `${location.key || 'initial'}:${location.pathname}`;
    if (trackedNavigations.current.has(navigationId)) return;
    trackedNavigations.current.add(navigationId);
    behavior.current?.navigation(location.pathname);
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
