import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';

export function isIpAssistConfigured(environment = process.env) {
  return environment.VERCEL === '1' && typeof environment.VISITOR_IP_HASH_SECRET === 'string' && environment.VISITOR_IP_HASH_SECRET.length >= 32;
}

// Only Vercel's documented, infrastructure-supplied header. Never fall back to
// client X-Forwarded-For, request body, socket address or browser fingerprint.
export function requestNetworkHash(request, environment = process.env) {
  if (!isIpAssistConfigured(environment)) return '';
  const raw = request.headers?.['x-vercel-forwarded-for'];
  if (typeof raw !== 'string' || raw.length > 64 || !isIP(raw.trim())) return '';
  let ip = raw.trim().toLowerCase();
  if (isIP(ip) === 6) ip = new URL(`http://[${ip}]`).hostname.slice(1, -1);
  return createHmac('sha256', environment.VISITOR_IP_HASH_SECRET).update(`sitevl-network-v1:${ip}`).digest('hex');
}
