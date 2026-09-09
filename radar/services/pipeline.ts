import type { Normalizer, NormalizedListing, RawListing } from '../types';

export interface ListingWriter { upsert(listing: NormalizedListing): Promise<{ id: string; created: boolean }> }
export async function ingestBatch(listings: RawListing[], normalizer: Normalizer, writer: ListingWriter) {
  const results: { sourceId: string; status: 'NEW' | 'UPDATED' | 'FAILED'; retryable: boolean }[] = [];
  for (const raw of listings) {
    let normalized: NormalizedListing;
    try { normalized = await normalizer.normalize(raw); }
    catch { results.push({ sourceId: raw.sourceListingId, status: 'FAILED', retryable: false }); continue; }
    try {
      const saved = await writer.upsert(normalized);
      results.push({ sourceId: raw.sourceListingId, status: saved.created ? 'NEW' : 'UPDATED', retryable: false });
    } catch { results.push({ sourceId: raw.sourceListingId, status: 'FAILED', retryable: true }); }
  }
  return results;
}
