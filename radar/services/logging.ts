type LogEvent = 'COLLECTOR_STARTED' | 'COLLECTOR_COMPLETED' | 'NORMALIZATION_FAILED' | 'DATABASE_ERROR' | 'TELEGRAM_ERROR' | 'SOURCE_HEALTH' | 'REQUEST_FAILED';
export function radarLog(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR', event: LogEvent,
  fields: { source?: 'avito' | 'farpost'; fetched?: number; created?: number; duplicates?: number; durationMs?: number } = {}, sink: (line: string) => void = console.log) {
  // Reconstruct a tiny allowlisted record; never serialize arbitrary error/raw data objects.
  const safe: Record<string, string | number> = { level, event, time: new Date().toISOString() };
  if (fields.source === 'avito' || fields.source === 'farpost') safe.source = fields.source;
  for (const key of ['fetched', 'created', 'duplicates', 'durationMs'] as const) {
    const value = fields[key]; if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) safe[key] = value;
  }
  sink(JSON.stringify(safe));
}
