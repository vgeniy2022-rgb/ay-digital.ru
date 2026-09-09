import { useEffect } from 'react';

export function RadarHead() {
  useEffect(() => {
    document.title = 'Deal Radar — закрытое пространство SITEVL';
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement('meta'); robots.setAttribute('name', 'robots'); document.head.append(robots); }
    robots.setAttribute('content', 'noindex,nofollow');
    document.head.querySelectorAll('script[type="application/ld+json"], link[rel="canonical"], link[rel="alternate"]').forEach(node => node.remove());
  }, []);
  return null;
}
