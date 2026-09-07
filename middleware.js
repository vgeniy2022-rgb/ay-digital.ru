import { next } from '@vercel/functions';
import { classifyRequestTraffic, crawlerFamily, legacyRedirect, requestHeader } from './api/_trafficPolicyV3.mjs';
import { trackCrawlerVisit } from './api/_visitorIntelligenceCore.mjs';

export const config = {
  runtime: 'nodejs',
  matcher: ['/((?!api(?:/|$)|assets(?:/|$)|admin(?:/|$)|studio(?:/|$)|.*\\.).*)'],
};

// No human identity, Redis write, or DNS work on normal document delivery.
// Infrastructure failure must never prevent serving the site or paid link.
export default function middleware(request, context) {
  const url = new URL(request.url);
  const redirect = legacyRedirect(request);
  if (redirect) return redirect;
  if (request.method === 'GET' && crawlerFamily(requestHeader(request, 'user-agent'))) {
    const task = classifyRequestTraffic(request).then(traffic => trackCrawlerVisit(url.pathname, traffic)).catch(() => {});
    context.waitUntil(task);
  }
  return next();
}
