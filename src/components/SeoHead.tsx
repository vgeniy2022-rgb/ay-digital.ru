import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { absoluteAssetUrl, absoluteUrl, siteConfig } from '../config/site';
import { getRouteSeo } from '../data/routeSeo';

export type SeoHeadProps = {
  title?: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  structuredData?: unknown | unknown[];
};

function setMeta(selector: string, attribute: 'content' | 'href', value: string, create: () => HTMLMetaElement | HTMLLinkElement) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
  if (!element) {
    element = create();
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

function createNamedMeta(name: string) {
  const element = document.createElement('meta');
  element.setAttribute('name', name);
  element.setAttribute('data-seo', 'true');
  return element;
}

function createPropertyMeta(property: string) {
  const element = document.createElement('meta');
  element.setAttribute('property', property);
  element.setAttribute('data-seo', 'true');
  return element;
}

function cleanJsonLd(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(cleanJsonLd).filter((item) => item !== undefined);
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
      const cleaned = cleanJsonLd(item);
      if (cleaned !== undefined && cleaned !== '' && !(Array.isArray(cleaned) && !cleaned.length)) {
        result[key] = cleaned;
      }
    });
    return result;
  }

  return value === undefined || value === null ? undefined : value;
}

export function SeoHead(props: SeoHeadProps) {
  const location = useLocation();
  const routeSeo = getRouteSeo(location.pathname);
  const title = props.title || routeSeo?.title || siteConfig.defaultTitle;
  const description = props.description || routeSeo?.description || siteConfig.defaultDescription;
  const canonicalPath = props.canonicalPath || routeSeo?.canonicalPath || location.pathname;
  const noindex = props.noindex ?? routeSeo?.noindex ?? false;
  const type = props.type || routeSeo?.type || 'website';
  const image = absoluteAssetUrl(props.image || routeSeo?.image || siteConfig.defaultOgImage);
  const structuredData = props.structuredData ?? routeSeo?.structuredData;
  const canonicalUrl = absoluteUrl(canonicalPath);

  useEffect(() => {
    document.documentElement.lang = 'ru';
    document.title = title;

    setMeta('meta[name="description"]', 'content', description, () => createNamedMeta('description'));
    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex, follow' : 'index, follow', () => createNamedMeta('robots'));

    setMeta('link[rel="canonical"]', 'href', canonicalUrl, () => {
      const element = document.createElement('link');
      element.setAttribute('rel', 'canonical');
      element.setAttribute('data-seo', 'true');
      return element;
    });

    setMeta('meta[property="og:locale"]', 'content', 'ru_RU', () => createPropertyMeta('og:locale'));
    setMeta('meta[property="og:type"]', 'content', type, () => createPropertyMeta('og:type'));
    setMeta('meta[property="og:site_name"]', 'content', siteConfig.siteName, () => createPropertyMeta('og:site_name'));
    setMeta('meta[property="og:title"]', 'content', title, () => createPropertyMeta('og:title'));
    setMeta('meta[property="og:description"]', 'content', description, () => createPropertyMeta('og:description'));
    setMeta('meta[property="og:url"]', 'content', canonicalUrl, () => createPropertyMeta('og:url'));
    setMeta('meta[property="og:image"]', 'content', image, () => createPropertyMeta('og:image'));

    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image', () => createNamedMeta('twitter:card'));
    setMeta('meta[name="twitter:title"]', 'content', title, () => createNamedMeta('twitter:title'));
    setMeta('meta[name="twitter:description"]', 'content', description, () => createNamedMeta('twitter:description'));
    setMeta('meta[name="twitter:image"]', 'content', image, () => createNamedMeta('twitter:image'));

    document.head.querySelectorAll('script[data-seo-json-ld="true"]').forEach((element) => element.remove());
    const dataItems = Array.isArray(structuredData) ? structuredData : structuredData ? [structuredData] : [];
    dataItems.forEach((item) => {
      const cleaned = cleanJsonLd(item);
      if (!cleaned) return;
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-json-ld', 'true');
      script.textContent = JSON.stringify(cleaned);
      document.head.appendChild(script);
    });
  }, [canonicalUrl, description, image, noindex, structuredData, title, type]);

  return null;
}
