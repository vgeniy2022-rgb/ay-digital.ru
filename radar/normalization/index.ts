import type { NormalizedListing, Normalizer, RawListing, RadarSource } from '../types';

export function sourceUrl(value: unknown, source: RadarSource): string {
  if (typeof value !== 'string' || value.length > 2048) throw new Error('INVALID_SOURCE_URL');
  const url = new URL(value);
  const allowed = source === 'avito' ? ['avito.ru', 'www.avito.ru', 'm.avito.ru'] : ['farpost.ru', 'www.farpost.ru'];
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !allowed.includes(url.hostname)) throw new Error('INVALID_SOURCE_URL');
  url.search = ''; url.hash = '';
  return url.href;
}
export function listingIdentity(source: RadarSource, sourceListingId: string): string {
  if (!['avito', 'farpost'].includes(source) || !/^[a-zA-Z0-9_-]{1,128}$/.test(sourceListingId)) throw new Error('INVALID_LISTING_ID');
  return `${source}:${sourceListingId}`;
}
export function rubles(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value > 1000000000) throw new Error('INVALID_PRICE_RUB');
  return value;
}
export function normalizeText(value: string, max: number): string {
  // Public descriptions are still untrusted. Remove obvious contact details before persistence.
  return Array.from(value.normalize('NFKC')).map(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127 ? ' ' : char).join('')
    .replace(/https?:\/\/\S+/gi, '[ссылка исключена]')
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[контакт исключён]')
    .replace(/(?:\+7|8)[\s(.-]*\d{3}[\s).-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/g, '[телефон исключён]')
    .replace(/\s+/g, ' ').trim().slice(0, max);
}
export class FoundationNormalizer implements Normalizer {
  async normalize(raw: RawListing): Promise<NormalizedListing> {
    listingIdentity(raw.source, raw.sourceListingId);
    const title = normalizeText(raw.title, 300);
    if (!title || !Number.isFinite(Date.parse(raw.observedAt))) throw new Error('INVALID_LISTING');
    // No product-family inference from an ambiguous title. Unknown configurations never share an EXACT key.
    return {
      source: raw.source, sourceListingId: raw.sourceListingId, url: sourceUrl(raw.url, raw.source), title,
      description: normalizeText(raw.description, 8000), category: normalizeText(raw.category, 80),
      subcategory: raw.subcategory ? normalizeText(raw.subcategory, 80) : undefined,
      priceRub: rubles(raw.priceRub), currency: 'RUB', condition: normalizeText(raw.condition, 80),
      region: normalizeText(raw.region, 120), location: normalizeText(raw.location, 160),
      publishedAt: raw.publishedAt && Number.isFinite(Date.parse(raw.publishedAt)) ? raw.publishedAt : null,
      observedAt: raw.observedAt, status: raw.status,
      // A licensed adapter must explicitly vet image hosts. Foundation does not persist unverified image URLs.
      imageUrls: [], seller: { kind: ['PRIVATE', 'BUSINESS'].includes(raw.seller.kind || '') ? raw.seller.kind : 'UNKNOWN' },
      product: { category: raw.category, brand: null, model: null, family: null, attributes: {}, key: null,
        confidence: 'LOW', method: 'UNRESOLVED', version: 'foundation-1', missingFields: ['brand', 'model', 'configuration'] },
    };
  }
}
