import type { RadarSource } from './types';

// Broad product families, never a whitelist of individual models.
export const CATEGORY_CATALOG = [
  'smartphones', 'tablets', 'laptops', 'desktops', 'pc_components', 'gpus', 'cpus', 'monitors',
  'tvs', 'projectors', 'cameras', 'lenses', 'video_cameras', 'action_cameras', 'drones',
  'consoles', 'handheld_consoles', 'vr_ar', 'smart_watches', 'fitness_trackers', 'headphones',
  'speakers', 'audio', 'routers', 'networking', 'nas', 'storage', 'keyboards', 'mice',
  'accessories', 'chargers', 'premium_accessories', 'other_electronics',
] as const;
export const EXCLUDED_CATEGORIES = ['refrigerators', 'washing_machines', 'dishwashers', 'ovens', 'large_kitchen_appliances'];
export type Environment = Record<string, string | undefined>;
const csv = (value: string | undefined, defaults: readonly string[]) => value ? [...new Set(value.split(',').map(v => v.trim()).filter(Boolean))] : [...defaults];
const integer = (value: string | undefined, fallback: number, min: number, max: number) => {
  const n = Number(value); return value && Number.isSafeInteger(n) && n >= min && n <= max ? n : fallback;
};
export function radarConfig(env: Environment) {
  const excludedCategories = csv(env.RADAR_EXCLUDED_CATEGORIES, EXCLUDED_CATEGORIES);
  return {
    enabled: env.RADAR_ENABLED === 'true', development: env.RADAR_DEVELOPMENT_MODE !== 'false',
    // Configuration is intent, NOT evidence of an online or legally permitted collector.
    sources: csv(env.RADAR_SOURCES, []).filter((s): s is RadarSource => s === 'avito' || s === 'farpost'),
    categories: csv(env.RADAR_CATEGORIES, CATEGORY_CATALOG).filter(c => !excludedCategories.includes(c)), excludedCategories,
    regions: csv(env.RADAR_PRIORITY_REGIONS, ['Приморский край', 'Владивосток', 'Артём', 'Уссурийск']),
    localRegion: env.RADAR_LOCAL_REGION || 'Приморский край', nationalMode: env.RADAR_NATIONAL_MODE === 'true',
    scanIntervalSeconds: integer(env.RADAR_SCAN_INTERVAL_SECONDS, 180, 60, 86400),
    refreshIntervalSeconds: integer(env.RADAR_REFRESH_INTERVAL_SECONDS, 3600, 900, 86400),
    marketIntervalSeconds: integer(env.RADAR_MARKET_INTERVAL_SECONDS, 900, 300, 86400),
    minimumAnomalyPercent: integer(env.RADAR_MIN_ANOMALY_PERCENT, 20, 1, 99),
    minimumProfitRub: integer(env.RADAR_MIN_PROFIT_RUB, 5000, 0, 100000000),
    thresholds: { deal: 60, hot: 80, ultra: 95 },
    // Phase 1 never schedules collectors or dispatches the outbox, regardless of env.
    analyzerActive: false as const, schedulerActive: false as const, alertsActive: false as const,
    requestTimeoutMs: 8000, maxPayloadBytes: 8192, maxFeedItems: 30, sessionSeconds: 900,
    retention: { listingsDays: 180, marketDays: 365, runtimeDays: 30, notificationsDays: 90 },
  };
}
export type RadarConfig = ReturnType<typeof radarConfig>;
