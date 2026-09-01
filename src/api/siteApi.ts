import { cmsConfig } from '../config/cms';
import { PublicSiteData } from '../types/cms';

type AppsScriptResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
  data?: PublicSiteData;
};

function parsePublicSiteData(payload: AppsScriptResponse | PublicSiteData): PublicSiteData | null {
  if ('ok' in payload && payload.ok === false) {
    throw new Error(payload.error || payload.message || 'CMS API returned ok: false');
  }

  if ('ok' in payload && payload.ok === true) {
    return payload.data || null;
  }

  if ('data' in payload && payload.data) {
    return payload.data;
  }

  return payload as PublicSiteData;
}

function createPublicDataUrl(apiUrl: string) {
  const url = new URL(apiUrl);
  url.searchParams.set('action', 'getPublicData');
  return url.toString();
}

export async function fetchPublicSiteData(): Promise<PublicSiteData | null> {
  if (!cmsConfig.apiUrl) {
    return null;
  }

  const finalUrl = createPublicDataUrl(cmsConfig.apiUrl);

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort('CMS request timeout'), cmsConfig.timeoutMs);

  try {
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`CMS request failed: ${response.status}`);
    }

    const payload = (await response.json()) as AppsScriptResponse | PublicSiteData;
    return parsePublicSiteData(payload);
  } catch {
    if (import.meta.env.DEV) {
      console.warn('[CMS] Запрос недоступен, используются резервные данные.');
    }

    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
