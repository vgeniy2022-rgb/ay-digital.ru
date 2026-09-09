export class RadarError extends Error {
  constructor(readonly status: number, readonly code: string) { super(code); }
}
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new RadarError(502, 'INVALID_UPSTREAM_RESPONSE');
  return value as Record<string, unknown>;
}
export async function boundedJson(response: Response, maxBytes = 500000): Promise<unknown> {
  const reader = response.body?.getReader();
  if (!reader) throw new RadarError(502, 'INVALID_UPSTREAM_RESPONSE');
  const chunks: Uint8Array[] = []; let bytes = 0;
  while (true) {
    const item = await reader.read(); if (item.done) break;
    bytes += item.value.byteLength;
    if (bytes > maxBytes) { await reader.cancel(); throw new RadarError(502, 'UPSTREAM_RESPONSE_LIMIT'); }
    chunks.push(item.value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown; }
  catch { throw new RadarError(502, 'INVALID_UPSTREAM_RESPONSE'); }
}
