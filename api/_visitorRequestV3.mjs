import { classifyRequestTraffic, requestAttribution, requestCoarseGeo, requestHeader } from './_trafficPolicyV3.mjs';
import { requestNetworkHash } from './_visitorNetwork.mjs';
import { coarseBrowser } from './_visitorConfidenceV31.mjs';

export async function visitorRequestContext(request, options = {}) {
  return { traffic: await classifyRequestTraffic(request, options), browser: coarseBrowser(requestHeader(request, 'user-agent')), geo: requestCoarseGeo(request, options.environment),
    attribution: requestAttribution(request, options.environment, options.now?.() ?? Date.now()), networkHash: requestNetworkHash(request, options.environment) };
}
