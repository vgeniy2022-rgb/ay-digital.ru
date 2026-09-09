export type RadarSource = 'avito' | 'farpost';
export type Classification = 'NOT_ANALYZED' | 'NORMAL' | 'DEAL' | 'HOT' | 'ULTRA' | 'SUSPICIOUS';
export type FeedbackAction = 'SAVE' | 'NOT_INTERESTED' | 'SUSPICIOUS' | 'PURCHASED';
export type ListingStatus = 'ACTIVE' | 'MISSING' | 'REMOVED' | 'SOLD_UNKNOWN' | 'UNKNOWN';
export type HealthStatus = 'NOT_CONFIGURED' | 'NOT_ACTIVE' | 'CONFIGURED_NOT_TESTED' | 'ONLINE' | 'DEGRADED' | 'RATE_LIMITED' | 'AUTH_ERROR' | 'ERROR' | 'BLOCKED';
export type Confidence = 'LOW' | 'MEDIUM' | 'HIGH';
export type MatchingLevel = 'EXACT' | 'CLOSE' | 'FAMILY' | 'CATEGORY';
export interface ComponentHealth { status: HealthStatus; detail: string; checkedAt: string | null }
export interface CollectorHealth extends ComponentHealth { source: RadarSource; retryable: boolean }
export interface RawListing {
  source: RadarSource; sourceListingId: string; url: string; title: string; description: string;
  category: string; subcategory?: string; priceRub: number; currency: 'RUB'; condition: string;
  region: string; location: string; publishedAt: string | null; observedAt: string;
  imageUrls: string[]; status: ListingStatus;
  seller: { kind?: 'PRIVATE' | 'BUSINESS' | 'UNKNOWN' };
}
export interface NormalizedProduct {
  category: string; brand: string | null; model: string | null; family: string | null;
  attributes: Record<string, string | number | boolean>;
  key: string | null; confidence: Confidence; method: 'UNRESOLVED' | 'DETERMINISTIC' | 'DICTIONARY' | 'FUZZY' | 'LLM' | 'HYBRID';
  version: string; missingFields: string[];
}
export interface NormalizedListing extends RawListing { product: NormalizedProduct }
export interface MarketStats {
  productKey: string; sampleSize: number; confidence: Confidence; matchingLevel: MatchingLevel;
  medianRub: number; p25Rub: number; p10Rub: number; minRub: number; maxRub: number;
  recentMedianRub: number | null; localMedianRub: number | null; nationalMedianRub: number | null;
  region: string | null; calculatedAt: string; version: string;
}
export interface RiskAnalysis {
  status: 'NOT_ANALYZED' | 'ANALYZED'; score: number | null;
  reasons: { code: string; explanation: string; evidence: string[] }[]; version: string;
}
export interface DealAnalysis {
  classification: Classification; marketMedianRub: number | null; marketP25Rub: number | null; marketP10Rub: number | null;
  deviationPercent: number | null; resaleMinRub: number | null; resaleMaxRub: number | null; profitRub: number | null;
  marketScore: number | null; profitScore: number | null; liquidityScore: number | null;
  personalScore: number | null; finalScore: number | null; risk: RiskAnalysis;
  version: string; analyzedAt: string | null;
}
export interface FeedListing extends NormalizedListing { id: string; firstSeenAt: string; lastSeenAt: string; analysis: DealAnalysis | null }
export interface RadarFeedback { listingId: string; action: FeedbackAction; operationId: string; channel: 'WEB' | 'TELEGRAM' }
export interface CollectorQuery { categories: string[]; regions: string[]; limit: number; cursor?: string; signal?: AbortSignal }
export interface RadarSearchQuery { text: string; categories: string[]; regions: string[]; sources: RadarSource[]; minPriceRub?: number; maxPriceRub?: number; cursor?: string }
export interface RadarSearchResult { listings: FeedListing[]; comparableMarket: MarketStats | null; nextCursor: string | null }
export type CollectorResult<T> = { ok: true; data: T; nextCursor?: string } | { ok: false; code: 'NOT_CONFIGURED' | 'PERMISSION_REQUIRED' | 'BLOCKED' | 'RATE_LIMITED' | 'TIMEOUT' | 'SOURCE_ERROR'; retryable: boolean };
export interface ListingCollector {
  readonly source: RadarSource;
  fetchLatest(query: CollectorQuery): Promise<CollectorResult<RawListing[]>>;
  fetchListing(sourceListingId: string, signal?: AbortSignal): Promise<CollectorResult<RawListing>>;
  healthCheck(): Promise<CollectorHealth>;
}
export interface Normalizer { normalize(raw: RawListing): Promise<NormalizedListing> }
export interface RiskEngine { analyze(listing: NormalizedListing, market: MarketStats | null): Promise<RiskAnalysis> }
export interface MarketEngine { calculate(product: NormalizedProduct, region: string | null): Promise<MarketStats | null> }
export interface DealEngine { analyze(listing: NormalizedListing, market: MarketStats | null, risk: RiskAnalysis): Promise<DealAnalysis> }
export interface NotificationPayload { listingId: string; classification: 'HOT' | 'ULTRA'; event: 'CLASSIFICATION_REACHED'; title: string; priceRub: number; url: string; finalScore: number; marketMedianRub: number; profitRub: number | null }
export interface NotificationProvider {
  healthCheck(): Promise<ComponentHealth>;
  send(payload: NotificationPayload): Promise<{ status: 'SENT' | 'NOT_ACTIVE' | 'ERROR'; retryable: boolean }>;
}
export interface RuntimeStatus {
  source: RadarSource; lastSuccessAt: string | null; lastFailureAt: string | null; nextScanAt: string | null;
  processed: number; newListings: number; durationMs: number | null; workerVersion: string; errorCode: string | null;
}
export interface RadarDashboard {
  enabled: boolean; development: boolean;
  components: Record<'avito' | 'farpost' | 'database' | 'telegram' | 'analyzer', ComponentHealth>;
  runtime: RuntimeStatus[]; listings: FeedListing[];
  counts: { listings: number | null; anomalies: number | null; hot: number | null };
}
