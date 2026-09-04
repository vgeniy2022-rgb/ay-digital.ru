import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { matchXRayRoute } from './routeRegistry';

const XRayExperience = lazy(() => import('./XRayExperience').then((module) => ({ default: module.XRayExperience })));

export function XRayController() {
  const location = useLocation();
  const match = useMemo(() => matchXRayRoute(location.pathname), [location.pathname]);
  const [expanded, setExpanded] = useState(false);
  const [reveal, setReveal] = useState(0);

  useEffect(() => {
    setExpanded(false);
    setReveal(0);
  }, [location.pathname]);

  if (!match) return null;

  if (!expanded) {
    return (
      <button
        type="button"
        className="xray-launcher fixed bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] right-3 z-[1200] inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-950/92 px-3 text-xs font-extrabold text-white shadow-xl backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:bottom-5 sm:right-5"
        onClick={() => setExpanded(true)}
        aria-label="Открыть X-RAY и посмотреть код страницы"
      >
        <span aria-hidden="true" className="font-mono text-blue-300">&lt;/&gt;</span>
        X-RAY
      </button>
    );
  }

  return (
    <Suspense fallback={null}>
      <XRayExperience
        key={match.route}
        match={match}
        reveal={reveal}
        onRevealChange={setReveal}
        onClose={() => {
          setReveal(0);
          setExpanded(false);
        }}
      />
    </Suspense>
  );
}
