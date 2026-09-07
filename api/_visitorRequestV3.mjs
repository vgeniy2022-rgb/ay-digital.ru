import { classifyRequestTraffic, requestAttribution, requestCoarseGeo } from './_trafficPolicyV3.mjs';
import { requestNetworkHash } from './_visitorNetwork.mjs';

export async function visitorRequestContext(request, options = {}) {
  return { traffic: await classifyRequestTraffic(request, options), geo: requestCoarseGeo(request, options.environment),
    attribution: requestAttribution(request, options.environment, options.now?.() ?? Date.now()), networkHash: requestNetworkHash(request, options.environment) };
}
