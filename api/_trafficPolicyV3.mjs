import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { Resolver } from 'node:dns/promises';
import { isIP } from 'node:net';
import { PUBLIC_SITE_ORIGIN } from '../src/config/publicOrigin.mjs';

export const LEGACY_AD_HOST = 'sitevl-ru.vercel.app';
export const PRIMARY_ORIGIN = PUBLIC_SITE_ORIGIN;
export const ATTRIBUTION_COOKIE = '__Host-sitevl-attribution';
export const ATTRIBUTION_QUERY = '__sv_attribution';
export const AD_CAMPAIGN = 'telegram-vl-old-ad';
const TOKEN_SECONDS = 1800;
const verificationCache = new Map();
const pendingVerification = new Map();
const crawlerRules = [
  ['Google-InspectionTool', /Google-InspectionTool/i], ['GoogleOther', /GoogleOther/i],
  ['Googlebot', /Googlebot/i], ['AdsBot-Google', /AdsBot-Google/i],
  ['Bingbot', /bingbot|bingpreview/i], ['YandexBot', /Yandex(?:Bot|Images|RenderResources|AccessibilityBot)/i],
  ['Applebot', /Applebot/i], ['DuckDuckBot', /DuckDuckBot/i],
  ['TelegramBot', /TelegramBot/i], ['FacebookBot', /facebookexternalhit|Facebot/i],
  ['Twitterbot', /Twitterbot/i], ['LinkedInBot', /LinkedInBot/i],
  ['GPTBot', /GPTBot|OAI-SearchBot|ChatGPT-User/i], ['ClaudeBot', /ClaudeBot|Claude-SearchBot/i],
  ['SEO crawler', /AhrefsBot|SemrushBot|MJ12bot|DotBot|PetalBot/i],
];

export function requestHeader(request, name) {
  const value = request.headers?.get ? request.headers.get(name) : request.headers?.[name.toLowerCase()];
  return typeof value === 'string' ? value : '';
}

export function trustedRequestIp(request, environment = process.env) {
  if (environment.VERCEL !== '1') return '';
  const raw = requestHeader(request, 'x-vercel-forwarded-for').trim();
  if (raw.length > 64 || !isIP(raw)) return '';
  return isIP(raw) === 6 ? new URL(`http://[${raw}]`).hostname.slice(1, -1) : raw;
}

export function crawlerFamily(userAgent = '') {
  const ua = userAgent.slice(0, 1024);
  return crawlerRules.find(([, pattern]) => pattern.test(ua))?.[0] ||
    (/bot\b|crawler|spider|HeadlessChrome|PhantomJS|curl\/|wget\/|python-requests|node-fetch|undici/i.test(ua) ? 'Other automation' : '');
}

export function isHumanTraffic(traffic) {
  return traffic?.classification === 'human' || traffic?.classification === 'likely-human';
}

// Forward-confirmed reverse DNS, bounded to 800ms and 512 hashed cache entries.
// No raw IP, reverse hostname or UA is persisted or returned to the caller.
export async function verifyGoogleRequest(ip, options = {}) {
  if (!isIP(ip)) return false;
  const now = options.now?.() ?? Date.now();
  const key = createHash('sha256').update(ip).digest('hex');
  const cached = verificationCache.get(key);
  if (cached && cached.expires > now) return cached.verified;
  if (pendingVerification.has(key)) return pendingVerification.get(key);
  if (pendingVerification.size >= 8) return false;
  const resolver = options.resolver || new Resolver({ timeout: 350, tries: 1 });
  const task = (async () => {
    let timer;
    let verified = false;
    try {
      verified = await Promise.race([
        (async () => {
          const names = (await resolver.reverse(ip)).slice(0, 3);
          for (const name of names) {
            // Only published Google-controlled crawler/fetcher masks. Generic GCP
            // customer *.googleusercontent.com hosts do not prove a Google crawler.
            if (!/^(?:crawl-[0-9a-f-]+\.googlebot\.com|geo-crawl-[0-9a-f-]+\.geo\.googlebot\.com|(?:rate-limited-proxy|google-proxy)-[0-9a-f-]+\.google\.com)$/i.test(name)) continue;
            const addresses = await (isIP(ip) === 6 ? resolver.resolve6(name) : resolver.resolve4(name));
            if (addresses.some((address) => isIP(address) === 6 ? new URL(`http://[${address}]`).hostname === new URL(`http://[${ip}]`).hostname : address === ip)) return true;
          }
          return false;
        })(),
        new Promise((resolve) => { timer = setTimeout(() => { resolver.cancel?.(); resolve(false); }, 800); }),
      ]);
    } catch { verified = false; }
    finally { clearTimeout(timer); }
    if (verificationCache.size >= 512) verificationCache.delete(verificationCache.keys().next().value);
    verificationCache.set(key, { verified, expires: now + (verified ? 3600000 : 300000) });
    return verified;
  })().finally(() => pendingVerification.delete(key));
  pendingVerification.set(key, task);
  return task;
}

export async function classifyRequestTraffic(request, options = {}) {
  const ua = requestHeader(request, 'user-agent').slice(0, 1024);
  const family = crawlerFamily(ua);
  if (family) {
    const google = /^(Google|AdsBot-Google)/.test(family);
    const verified = google && await verifyGoogleRequest(trustedRequestIp(request, options.environment), options);
    return { classification: verified ? 'known-bot' : 'likely-bot', family,
      reason: verified ? 'google-forward-confirmed-rdns' : 'automation-user-agent', verification: verified ? 'verified-dns' : 'unverified-claim' };
  }
  if (!ua || !/Mozilla\/|Safari\/|Chrome\/|Firefox\/|Edg\//.test(ua)) {
    return { classification: 'likely-bot', family: 'Unknown client', reason: 'non-browser-or-missing-user-agent', verification: 'heuristic' };
  }
  // Reading without clicking is a valid visit. No CAPTCHA or interaction gate.
  return { classification: 'likely-human', family: '', reason: 'browser-request-no-automation-signature', verification: 'heuristic' };
}

function safeGeoName(raw) {
  if (!raw || raw.length > 240) return '';
  try {
    const name = decodeURIComponent(raw).trim();
    return name.length <= 80 && /^[\p{L}\p{M}\p{N} .,'’()-]+$/u.test(name) ? name : '';
  } catch { return ''; }
}

export function requestCoarseGeo(request, environment = process.env) {
  if (environment.VERCEL !== '1') return null;
  const country = requestHeader(request, 'x-vercel-ip-country').toUpperCase();
  const region = requestHeader(request, 'x-vercel-ip-country-region').toUpperCase();
  const city = safeGeoName(requestHeader(request, 'x-vercel-ip-city'));
  if (!/^[A-Z]{2}$/.test(country) || ['XX', 'ZZ'].includes(country) || !new Intl.DisplayNames(['en'], { type: 'region', fallback: 'none' }).of(country)) return null;
  return { country, region: /^[A-Z0-9]{1,3}$/.test(region) ? region : '', city, geoSource: 'network', geoPrecision: 'approximate' };
}

export function geoLabel(geo) {
  if (!geo) return 'География сети: нет данных';
  const regions = { 'RU-PRI': 'Приморский край', 'RU-KHA': 'Хабаровский край', 'RU-MOW': 'Москва', 'RU-SPE': 'Санкт-Петербург', 'RU-MOS': 'Московская область' };
  const cities = { Vladivostok: 'Владивосток', Moscow: 'Москва', 'Saint Petersburg': 'Санкт-Петербург', Khabarovsk: 'Хабаровск' };
  const country = new Intl.DisplayNames(['ru'], { type: 'region' }).of(geo.country);
  return `📍 ${[cities[geo.city] || geo.city, regions[`${geo.country}-${geo.region}`] || (geo.region ? `регион ${geo.region}` : ''), country].filter(Boolean).join(' · ')} (приблизительно, по сети)`;
}

export function safeCampaignValue(value) {
  return typeof value === 'string' && /^[a-z0-9][a-z0-9_-]{0,63}$/i.test(value) ? value.toLowerCase() : '';
}

export function legacyAttribution(url, referrer = '') {
  if (url.hostname !== LEGACY_AD_HOST) return null;
  const source = safeCampaignValue(url.searchParams.get('src')) || safeCampaignValue(url.searchParams.get('utm_source'));
  const campaign = safeCampaignValue(url.searchParams.get('utm_campaign'));
  let referrerHost = '';
  try { referrerHost = new URL(referrer).hostname; } catch { /* no reliable referrer */ }
  const external = referrerHost && ![LEGACY_AD_HOST, 'sitevl.tech', 'www.sitevl.tech', 'ay-digital-ru.vercel.app', 't.me', 'telegram.org'].includes(referrerHost);
  const otherSource = source && !/^(telegram|tg)(?:[-_]|$)/.test(source);
  const invalidSource = (url.searchParams.has('src') || url.searchParams.has('utm_source')) && !source;
  const paid = !otherSource && !invalidSource && !(external && !source);
  return { entryHost: LEGACY_AD_HOST, source: paid ? 'paid-ad' : source || 'referral', campaign: paid ? AD_CAMPAIGN : campaign,
    sourceTag: source, campaignTag: campaign, referrerHost: /^[a-z0-9.-]{1,180}$/i.test(referrerHost) ? referrerHost : '',
    paid, attributionBasis: paid ? ((source || ['t.me', 'telegram.org'].includes(referrerHost)) ? 'old-host-telegram-context' : 'assumed-old-host') : 'explicit-other-source' };
}

export function attributionConfigured(environment = process.env) {
  return typeof environment.VISITOR_ATTRIBUTION_SECRET === 'string' && environment.VISITOR_ATTRIBUTION_SECRET.length >= 32;
}

export function signAttribution(attribution, environment = process.env, now = Date.now()) {
  if (!attributionConfigured(environment)) return '';
  const payload = Buffer.from(JSON.stringify({ ...attribution, issuedAt: Math.floor(now / 1000) })).toString('base64url');
  const mac = createHmac('sha256', environment.VISITOR_ATTRIBUTION_SECRET).update(`sitevl-ad-v3:${payload}`).digest('base64url');
  return `${payload}.${mac}`;
}

export function verifyAttribution(token, environment = process.env, now = Date.now()) {
  if (!attributionConfigured(environment) || typeof token !== 'string' || token.length > 1800) return null;
  const [payload, mac, extra] = token.split('.');
  if (!payload || !mac || extra) return null;
  const expected = createHmac('sha256', environment.VISITOR_ATTRIBUTION_SECRET).update(`sitevl-ad-v3:${payload}`).digest('base64url');
  if (mac.length !== expected.length || !timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString());
    const age = Math.floor(now / 1000) - value.issuedAt;
    return age >= 0 && age <= TOKEN_SECONDS && value.entryHost === LEGACY_AD_HOST ? value : null;
  } catch { return null; }
}

export function requestAttribution(request, environment = process.env, now = Date.now()) {
  const token = requestHeader(request, 'cookie').split(';').map((s) => s.trim()).find((s) => s.startsWith(`${ATTRIBUTION_COOKIE}=`))?.slice(ATTRIBUTION_COOKIE.length + 1);
  return verifyAttribution(token, environment, now);
}

export function legacyRedirect(request, environment = process.env, now = Date.now()) {
  const url = new URL(request.url);
  if (!['GET', 'HEAD'].includes(request.method)) return null;
  if (url.hostname === LEGACY_AD_HOST) {
    // Fail open: never break a paid link if deployment configuration is incomplete.
    const token = signAttribution(legacyAttribution(url, requestHeader(request, 'referer')), environment, now);
    if (!token) return null;
    const target = new URL(PRIMARY_ORIGIN); target.pathname = url.pathname; target.search = url.search;
    target.searchParams.set(ATTRIBUTION_QUERY, token);
    return new Response(null, { status: 307, headers: { Location: target.href, 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' } });
  }
  if (url.origin === PRIMARY_ORIGIN && url.searchParams.has(ATTRIBUTION_QUERY)) {
    const token = url.searchParams.get(ATTRIBUTION_QUERY);
    const value = verifyAttribution(token, environment, now);
    url.searchParams.delete(ATTRIBUTION_QUERY);
    const headers = { Location: url.href, 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' };
    if (value) headers['Set-Cookie'] = `${ATTRIBUTION_COOKIE}=${token}; Path=/; Max-Age=${TOKEN_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
    return new Response(null, { status: 307, headers });
  }
  return null;
}

export function resetTrafficVerificationForTests() { verificationCache.clear(); pendingVerification.clear(); }
