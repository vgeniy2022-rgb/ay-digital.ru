import { pathToFileURL } from 'node:url';
import { radarConfig, type Environment } from '../radar/config';
import { AvitoCollector, FarPostCollector } from '../radar/collectors';
import type { ListingCollector } from '../radar/types';

export async function inspectWorker(env: Environment, collectors: ListingCollector[] = [new AvitoCollector(), new FarPostCollector()]) {
  const config = radarConfig(env);
  if (!config.enabled) return { status: 'DISABLED', version: 'foundation-1', scheduler: 'NOT_ACTIVE', sources: [] };
  const results = await Promise.allSettled(collectors.map(c => c.healthCheck()));
  return { status: 'FOUNDATION_ONLY', version: 'foundation-1', scheduler: 'NOT_ACTIVE',
    sources: results.map((r, index) => r.status === 'fulfilled' ? r.value : { source: collectors[index].source, status: 'ERROR', retryable: true }) };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // One-shot health only. No launchd, daemon, cron, browser or perpetual timer installation.
  console.log(JSON.stringify(await inspectWorker(process.env)));
}
