import {
  AppWindow,
  ClipboardCheck,
  Code2,
  Computer,
  FileText,
  Laptop,
  LucideIcon,
  Map as MapIcon,
  MonitorCog,
  Presentation,
  Smartphone,
  UsersRound,
  Wrench,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchPublicSiteData } from '../api/siteApi';
import { priceDirections } from '../data/priceDirections';
import {
  CaseItem as CmsCaseItem,
  FaqItem,
  PackageItem,
  PromoItem,
  PublicSiteData,
  ReviewItem,
  ServiceItem,
} from '../types/cms';
import {
  CaseItem,
  PriceGroup,
  Service,
  cases as localCases,
  commonRequests,
  contacts as localContacts,
  homeHero as localHomeHero,
  priceGroups as localPriceGroups,
  quickStats,
  services as localServices,
  site as localSite,
  trustPoints,
  workSteps,
} from '../data/site';
import { StatusViewData, getStatusViewData } from '../utils/status';

type SiteData = {
  site: typeof localSite;
  homeHero: typeof localHomeHero;
  status: StatusViewData;
  services: Service[];
  serviceOptions: string[];
  priceGroups: PriceGroup[];
  cases: CaseItem[];
  promos: PromoItem[];
  reviews: ReviewItem[];
  faq: FaqItem[];
  contacts: typeof localContacts;
  quickStats: typeof quickStats;
  workSteps: typeof workSteps;
  commonRequests: typeof commonRequests;
  trustPoints: typeof trustPoints;
};

type UseSiteDataResult = {
  data: SiteData;
  isLoading: boolean;
  isFallback: boolean;
  error: unknown;
  debug: {
    apiServicesCount: number;
    activeServicesCount: number;
    activeServiceTitles: string[];
    firstService: ServiceItem | null;
  };
};

const iconByKey: Record<string, LucideIcon> = {
  apps: AppWindow,
  application: AppWindow,
  audit: ClipboardCheck,
  clipboard: ClipboardCheck,
  computer: Computer,
  'computer-help': Wrench,
  file: FileText,
  laptop: Laptop,
  map: MapIcon,
  presentation: Presentation,
  presentations: Presentation,
  'remote-help': MonitorCog,
  smartphone: Smartphone,
  tech: Laptop,
  users: UsersRound,
  web: Code2,
  websites: Code2,
  wrench: Wrench,
};

let cachedApiData: PublicSiteData | null = null;
let cachedError: unknown = null;
let pendingRequest: Promise<PublicSiteData | null> | null = null;

function sortByOrder<T extends { order?: number }>(items: T[]) {
  return [...items].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
}

function isActiveValue(value: boolean | string | number | undefined) {
  return value === true || value === 1 || String(value).toLowerCase() === 'true';
}

function onlyActive<T extends { isActive?: boolean | string | number; order?: number }>(items?: T[]) {
  return sortByOrder((items ?? []).filter((item) => isActiveValue(item.isActive)));
}

function splitList(value?: string[] | string) {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  if (!value) {
    return [];
  }

  return value
    .split(/\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getIcon(icon?: string, slug?: string, fallback?: LucideIcon) {
  const key = (icon || slug || '').trim().toLowerCase();
  return iconByKey[key] || fallback || Code2;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/ё/g, 'e')
    .replace(/[^a-z0-9а-я]+/gi, '-')
    .replace(/^-+|-+$/g, '');
}

function getSlugFromLink(link?: string) {
  if (!link) {
    return '';
  }

  const cleanLink = link.split('?')[0].replace(/\/$/, '');
  return cleanLink.split('/').filter(Boolean).pop() || '';
}

function getServiceSlug(item: ServiceItem, index: number) {
  return item.slug || getSlugFromLink(item.path || item.link) || slugify(item.title) || `service-${index + 1}`;
}

function getServicePath(item: ServiceItem, slug: string, fallback?: Service) {
  if (item.path?.startsWith('/')) {
    return item.path;
  }

  if (item.link?.startsWith('/')) {
    return item.link;
  }

  return fallback?.path || `/services/${slug}`;
}

function normalizeServices(items: ServiceItem[] | undefined, hasApiData: boolean): Service[] {
  if (!hasApiData) {
    return localServices;
  }

  const fallbackBySlug = new Map(localServices.map((service) => [service.slug, service]));
  const activeItems = onlyActive(items);

  if (!activeItems.length) {
    return localServices;
  }

  return activeItems
    .filter((item) => item.title)
    .map((item, index) => {
      const slug = getServiceSlug(item, index);
      const fallback = fallbackBySlug.get(slug);
      const bullets = [
        ...splitList(item.bullets),
        ...splitList(item.tags),
        item.priceText,
        item.duration,
        item.format,
        item.badge,
      ].filter(Boolean) as string[];

      const isAdminWebsite = slug === 'website-with-admin' || item.title === 'Сайт с админкой';
      const usePolishedPresentation = Boolean(
        fallback && (slug === 'website-with-admin' || slug === 'simple-app'),
      );

      return {
        title: usePolishedPresentation ? fallback!.title : item.title,
        shortTitle: usePolishedPresentation
          ? fallback!.shortTitle
          : item.shortTitle || item.category || fallback?.shortTitle || item.title,
        slug,
        path: getServicePath(item, slug, fallback),
        category: item.category || fallback?.category,
        lead: usePolishedPresentation ? fallback!.lead : item.lead || item.shortDescription || fallback?.lead || '',
        description: usePolishedPresentation
          ? fallback!.description
          : item.description || item.fullDescription || item.shortDescription || fallback?.description || item.lead || '',
        bullets: bullets.length ? bullets : fallback?.bullets || [],
        outcome: usePolishedPresentation ? fallback!.outcome : item.outcome || item.priceText || fallback?.outcome || '',
        duration: item.duration || fallback?.duration,
        format: item.format || fallback?.format,
        badge: item.badge || fallback?.badge,
        buttonText: usePolishedPresentation ? fallback!.buttonText : item.buttonText || fallback?.buttonText,
        priceText: slug === 'program-installation' ? fallback?.priceText : isAdminWebsite ? 'от 34 900 ₽' : item.priceText || fallback?.priceText,
        isPopular: isActiveValue(item.isPopular) || fallback?.isPopular,
        showOnHome: isActiveValue(item.showOnHome) || fallback?.showOnHome,
        icon: getIcon(item.icon || item.category, slug, fallback?.icon),
      };
    });
}

function normalizePriceGroups(items: PackageItem[] | undefined, hasApiData: boolean): PriceGroup[] {
  if (!hasApiData) {
    return applyWebsitePriceOverrides(localPriceGroups);
  }

  const activeItems = onlyActive(items);
  if (!activeItems.length) {
    return applyWebsitePriceOverrides(localPriceGroups);
  }

  const groups = new Map<
    string,
    {
      title: string;
      note?: string;
      order: number;
      items: PriceGroup['items'];
    }
  >();

  activeItems.forEach((item) => {
    const title = item.groupTitle || item.group || item.category;
    const name = item.name || item.title;

    if (!title || !name || !item.price) {
      return;
    }

    const existing = groups.get(title);

    if (existing) {
      existing.items.push({
        name,
        price: item.price,
        description: item.description,
        includes: splitList(item.includes),
        disclaimer: item.disclaimer,
      });
      existing.order = Math.min(existing.order, item.groupOrder ?? item.order ?? existing.order);
      existing.note ||= item.groupNote || item.note;
      return;
    }

    groups.set(title, {
      title,
      note: item.groupNote || item.note,
      order: item.groupOrder ?? item.order ?? 9999,
      items: [
        {
          name,
          price: item.price,
          description: item.description,
          includes: splitList(item.includes),
          disclaimer: item.disclaimer,
        },
      ],
    });
  });

  const normalizedGroups = [...groups.values()]
    .sort((a, b) => a.order - b.order)
    .map((group) => ({
      title: group.title,
      note: group.note,
      items: group.items,
    }));

  return applyWebsitePriceOverrides(normalizedGroups.length ? normalizedGroups : localPriceGroups);
}

function applyWebsitePriceOverrides(groups: PriceGroup[]): PriceGroup[] {
  const websiteDirection = priceDirections.find((direction) => direction.slug === 'websites');
  const mobileDirection = priceDirections.find((direction) => direction.slug === 'mobile-apps');
  if (!websiteDirection || !mobileDirection) return groups;

  const legacyWebsiteNames = new Set(['Старт', 'Сайт для старта', 'Лендинг', 'Сайт с админкой', 'Сайт с системой управления', 'Бизнес', 'Бизнес-сайт', 'Сайт-каталог', 'Интернет-магазин', 'Индивидуальный веб-сервис']);
  const websiteGroup = groups.find((group) => group.title === 'Сайты');
  const websiteExtras = websiteGroup?.items.filter((item) => !legacyWebsiteNames.has(item.name)) ?? [];
  const commercialWebsites: PriceGroup = {
    title: 'Сайты',
    note: 'Указана стартовая стоимость. Точная цена фиксируется после обсуждения структуры и функционала.',
    items: [
      ...websiteDirection.packages.map((item) => ({ name: item.name, price: item.price, description: item.fit, includes: item.includes })),
      ...websiteExtras,
    ],
  };
  const commercialApps: PriceGroup = {
    title: 'Мобильные приложения',
    note: 'Стартовая цена зависит от платформы, экранов, серверной части и интеграций.',
    items: mobileDirection.packages.map((item) => ({ name: item.name, price: item.price, description: item.fit, includes: item.includes })),
  };
  const programDirection = priceDirections.find((direction) => direction.slug === 'programs');
  const programNames = new Set(programDirection?.packages.map((item) => item.name));
  const programs: PriceGroup[] = programDirection ? [{
    title: programDirection.groupTitle,
    note: programDirection.disclaimer,
    items: [
      ...programDirection.packages.map((item) => ({ name: item.name, price: item.price, description: item.fit, includes: item.includes })),
      ...(groups.find((group) => group.title === 'Программы')?.items.filter((item) => !programNames.has(item.name)) ?? []),
    ],
  }] : [];

  const withoutCommercial = groups.filter((group) => group.title !== 'Сайты' && group.title !== 'Мобильные приложения' && (!programDirection || group.title !== 'Программы'));
  return [commercialWebsites, commercialApps, ...programs, ...withoutCommercial];
}

function normalizeCases(items: CmsCaseItem[] | undefined, hasApiData: boolean): CaseItem[] {
  if (!hasApiData) {
    return localCases;
  }

  const activeItems = onlyActive(items);
  if (!activeItems.length) {
    return localCases;
  }

  const normalizedCases = activeItems
    .filter((item) => item.title)
    .map((item, index) => ({
      title: item.title,
      category: item.category,
      status: item.status,
      description: item.description || '',
      problem: item.problem,
      solution: item.solution,
      result: item.result,
      nextSteps: item.nextSteps,
      date: item.date,
      tags: splitList(item.tags),
      icon: getIcon(item.icon, undefined, localCases[index]?.icon || FileText),
    }));

  return normalizedCases.length ? normalizedCases : localCases;
}

function normalizeSettings(settings: PublicSiteData['settings'] | undefined, hasApiData: boolean) {
  if (!hasApiData || !settings) {
    return localSite;
  }

  return {
    ...localSite,
    ...settings,
    name: localSite.name,
    brandLine: localSite.brandLine,
    phones: splitList(settings.phones).length ? splitList(settings.phones) : localSite.phones,
  };
}

function createPhoneHref(phone?: string) {
  const digits = phone?.replace(/\D/g, '');
  return digits ? `tel:+${digits}` : localSite.phoneUrl;
}

function buildContacts(site: typeof localSite) {
  const primaryPhone = site.phones[0] || localSite.phones[0];
  const secondaryPhone = site.phones[1] || localSite.phones[1];

  return [
    { label: 'Основной номер', value: primaryPhone, href: site.phoneUrl || createPhoneHref(primaryPhone) },
    { label: 'Дополнительный номер', value: secondaryPhone, href: createPhoneHref(secondaryPhone) },
    { label: 'Telegram', value: `@${site.telegramUsername}`, href: site.telegramUrl },
    { label: 'WhatsApp основной', value: primaryPhone, href: site.whatsappUrl },
    { label: 'WhatsApp дополнительный', value: secondaryPhone, href: site.whatsappSecondaryUrl },
  ];
}

function normalizeSiteData(apiData: PublicSiteData | null): SiteData {
  const hasApiData = Boolean(apiData);
  const site = normalizeSettings(apiData?.settings, hasApiData);
  const services = normalizeServices(apiData?.services, hasApiData);

  return {
    site,
    homeHero: {
      title: apiData?.settings?.heroTitle || localHomeHero.title,
      subtitle: apiData?.settings?.heroSubtitle || localHomeHero.subtitle,
      description: apiData?.settings?.heroDescription || apiData?.settings?.description || localHomeHero.description,
    },
    status: getStatusViewData(apiData?.settings),
    services,
    serviceOptions: services.map((service) => service.title),
    priceGroups: normalizePriceGroups(apiData?.packages, hasApiData),
    cases: normalizeCases(apiData?.cases, hasApiData),
    promos: hasApiData ? onlyActive(apiData?.promos) : [],
    reviews: hasApiData ? onlyActive(apiData?.reviews) : [],
    faq: hasApiData ? onlyActive(apiData?.faq) : [],
    contacts: buildContacts(site),
    quickStats,
    workSteps,
    commonRequests,
    trustPoints,
  };
}

export function useSiteData(): UseSiteDataResult {
  const [apiData, setApiData] = useState<PublicSiteData | null>(cachedApiData);
  const [error, setError] = useState<unknown>(cachedError);
  const [isLoading, setIsLoading] = useState(!cachedApiData && !cachedError);

  useEffect(() => {
    let isMounted = true;

    if (!pendingRequest) {
      pendingRequest = fetchPublicSiteData();
    }

    pendingRequest
      .then((data) => {
        cachedApiData = data;
        if (isMounted) {
          setApiData(data);
        }
      })
      .catch((requestError) => {
        cachedError = requestError;
        if (isMounted) {
          setError(requestError);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const data = useMemo(() => normalizeSiteData(apiData), [apiData]);
  const debug = useMemo(() => {
    const activeServices = onlyActive(apiData?.services);

    return {
      apiServicesCount: apiData?.services?.length ?? 0,
      activeServicesCount: activeServices.length,
      activeServiceTitles: activeServices.map((service) => service.title),
      firstService: apiData?.services?.[0] ?? null,
    };
  }, [apiData]);

  return {
    data,
    isLoading,
    isFallback: !apiData,
    error,
    debug,
  };
}
