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
    if (import.meta.env.DEV) {
      console.log('[CMS] VITE_CMS_API_URL is not set');
    }

    return null;
  }

  const finalUrl = createPublicDataUrl(cmsConfig.apiUrl);

  if (import.meta.env.DEV) {
    console.log('[CMS] Final CMS url:', finalUrl);
  }

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

    if (import.meta.env.DEV) {
      console.log('[CMS] Response status:', response.status);
    }

    if (!response.ok) {
      throw new Error(`CMS request failed: ${response.status}`);
    }

    const payload = (await response.json()) as AppsScriptResponse | PublicSiteData;
    const data = parsePublicSiteData(payload);

    if (import.meta.env.DEV) {
      console.log('[CMS] Received JSON:', payload);
      console.log('[CMS] Parsed public data:', data);
    }

    return data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[CMS] Request failed, using fallback data:', error);
    }

    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
