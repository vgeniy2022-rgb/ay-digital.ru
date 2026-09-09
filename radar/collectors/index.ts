import type { CollectorHealth, CollectorResult, ListingCollector, RadarSource, RawListing } from '../types';

abstract class PermissionGatedCollector implements ListingCollector {
  abstract readonly source: RadarSource;
  abstract readonly reason: string;
  async fetchLatest(): Promise<CollectorResult<RawListing[]>> { return { ok: false, code: 'PERMISSION_REQUIRED', retryable: false }; }
  async fetchListing(): Promise<CollectorResult<RawListing>> { return { ok: false, code: 'PERMISSION_REQUIRED', retryable: false }; }
  async healthCheck(): Promise<CollectorHealth> {
    return { source: this.source, status: 'NOT_CONFIGURED', detail: this.reason, checkedAt: null, retryable: false };
  }
}
export class AvitoCollector extends PermissionGatedCollector {
  readonly source = 'avito';
  readonly reason = 'Доступ к общерыночной ленте через разрешённый API не подтверждён. Сбор выключен.';
}
export class FarPostCollector extends PermissionGatedCollector {
  readonly source = 'farpost';
  readonly reason = 'Правила FarPost требуют отдельного разрешения на автоматический сбор. Сбор выключен.';
}
