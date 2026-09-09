import type { FeedListing, NormalizedListing, RadarFeedback, RuntimeStatus } from '../types';
import { sourceUrl, rubles } from '../normalization';
import { boundedJson, RadarError, record } from '../server/errors';
import type { AuthenticatedOwner, RadarSupabase } from '../server/supabase';

export function toListingRow(listing: NormalizedListing) {
  // Explicit allowlist, never spread a source-specific object into storage.
  return { source: listing.source, source_listing_id: listing.sourceListingId, url: sourceUrl(listing.url, listing.source),
    title: listing.title, description: listing.description, category: listing.category, price_rub: rubles(listing.priceRub),
    condition: listing.condition, location: listing.location, region: listing.region, published_at: listing.publishedAt,
    observed_at: listing.observedAt, listing_status: listing.status };
}
const str = (v: unknown) => typeof v === 'string' ? v : '';
const nullableString = (v: unknown) => typeof v === 'string' ? v : null;
export function fromListingRow(value: unknown): FeedListing {
  const r = record(value);
  const source = r.source === 'avito' || r.source === 'farpost' ? r.source : null;
  if (!source) throw new RadarError(502, 'INVALID_LISTING_DATA');
  return { id: str(r.id), source, sourceListingId: str(r.source_listing_id), url: sourceUrl(r.url, source), title: str(r.title),
    description: str(r.description), category: str(r.category), priceRub: rubles(r.price_rub), currency: 'RUB',
    condition: str(r.condition), location: str(r.location), region: str(r.region), publishedAt: nullableString(r.published_at),
    observedAt: str(r.last_seen_at), firstSeenAt: str(r.first_seen_at), lastSeenAt: str(r.last_seen_at),
    status: ['ACTIVE', 'MISSING', 'REMOVED', 'SOLD_UNKNOWN'].includes(str(r.listing_status)) ? r.listing_status as FeedListing['status'] : 'UNKNOWN',
    imageUrls: [], seller: {}, product: { category: str(r.category), brand: nullableString(r.brand), model: nullableString(r.model),
      family: nullableString(r.family), key: nullableString(r.normalized_product_key), attributes: {}, confidence: 'LOW',
      method: 'UNRESOLVED', version: str(r.normalization_version), missingFields: [] }, analysis: null };
}
export function validateFeedback(raw: Record<string, unknown>): RadarFeedback {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (Object.keys(raw).sort().join(',') !== 'action,listingId,operationId' || !uuid.test(String(raw.listingId)) || !uuid.test(String(raw.operationId)) || !['SAVE', 'NOT_INTERESTED', 'SUSPICIOUS', 'PURCHASED'].includes(String(raw.action))) throw new RadarError(400, 'INVALID_FEEDBACK');
  return { listingId: String(raw.listingId), operationId: String(raw.operationId), action: raw.action as RadarFeedback['action'], channel: 'WEB' };
}
export class RadarRepository {
  constructor(private readonly db: RadarSupabase, private readonly owner: AuthenticatedOwner) {}
  private async rows(path: string) {
    const response = await this.db.request(`/rest/v1/${path}`, this.owner.token);
    if (!response.ok) throw new RadarError(503, 'DATABASE_UNAVAILABLE');
    const data = await boundedJson(response);
    if (!Array.isArray(data)) throw new RadarError(502, 'INVALID_DATABASE_RESPONSE');
    return data;
  }
  async feed() {
    const fields = 'id,source,source_listing_id,url,title,category,price_rub,condition,region,location,published_at,first_seen_at,last_seen_at,listing_status,brand,model,family,normalized_product_key,normalization_version';
    return (await this.rows(`radar_listings?select=${fields}&order=first_seen_at.desc,id.desc&limit=30`)).map(fromListingRow);
  }
  async count(table: 'radar_listings' | 'radar_deals', filter = ''): Promise<number> {
    const response = await this.db.request(`/rest/v1/${table}?select=id&limit=1${filter}`, this.owner.token, { headers: { Prefer: 'count=exact' } });
    if (!response.ok) throw new RadarError(503, 'DATABASE_UNAVAILABLE');
    const count = response.headers.get('content-range')?.split('/')[1];
    await response.body?.cancel();
    if (!count || !/^\d+$/.test(count)) throw new RadarError(502, 'INVALID_DATABASE_RESPONSE');
    return Number(count);
  }
  async runtime(): Promise<RuntimeStatus[]> {
    const data = await this.rows('radar_runtime_status?select=*&order=created_at.desc&limit=20');
    return (['avito', 'farpost'] as const).flatMap(source => {
      const r = data.map(record).find(r => r.source === source);
      return r ? [{ source, lastSuccessAt: nullableString(r.last_success_at), lastFailureAt: nullableString(r.last_failure_at),
        nextScanAt: nullableString(r.next_scan_at), processed: Number(r.processed), newListings: Number(r.new_listings),
        durationMs: typeof r.duration_ms === 'number' ? r.duration_ms : null, workerVersion: str(r.worker_version), errorCode: nullableString(r.error_code) }] : [];
    });
  }
  async feedback(input: RadarFeedback) {
    // Shared application operation; a future verified Telegram callback calls this same service.
    const body = { listing_id: input.listingId, owner_id: this.owner.id, action: input.action, channel: input.channel, operation_id: input.operationId };
    const response = await this.db.request('/rest/v1/radar_feedback', this.owner.token, { method: 'POST', body: JSON.stringify(body), headers: { Prefer: 'return=minimal' } });
    if (response.ok) return { saved: true, duplicate: false };
    if (response.status === 409) {
      const previous = await this.rows(`radar_feedback?owner_id=eq.${this.owner.id}&operation_id=eq.${input.operationId}&select=listing_id,action,channel&limit=1`);
      const row = previous[0] ? record(previous[0]) : null;
      if (row?.listing_id === input.listingId && row.action === input.action && row.channel === input.channel) return { saved: true, duplicate: true };
      throw new RadarError(409, 'FEEDBACK_CONFLICT');
    }
    throw new RadarError(503, 'FEEDBACK_UNAVAILABLE');
  }
}
