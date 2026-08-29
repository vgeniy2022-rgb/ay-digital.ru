import type { XRayRouteMatch } from './types';

type StaticRoute = Omit<XRayRouteMatch, 'route' | 'kind'>;

const staticRoutes: Record<string, StaticRoute> = {
  '/': {
    title: 'Главная SITEVL',
    componentName: 'HomePage',
    sections: ['Hero', 'WebsiteDirections', 'Capabilities', 'Projects', 'Process', 'LabShowcase', 'Promo', 'Reviews', 'FAQ', 'CTA'],
  },
  '/services': {
    title: 'Услуги',
    componentName: 'ServicesPage',
    sections: ['PageHero', 'LocalServices', 'ServiceGroups', 'AdminPromo', 'ServiceCards', 'Trust', 'CTA'],
  },
  '/useful': {
    title: 'Полезные материалы',
    componentName: 'UsefulIndexPage',
    sections: ['LibraryHero', 'TopicNavigation', 'ArticleGrid', 'UsefulCTA'],
  },
  '/prices': {
    title: 'Цены',
    componentName: 'PricesPage',
    sections: ['PageHero', 'DirectionCards', 'PriceGroups', 'AdminPromo', 'Disclaimers', 'CTA'],
  },
  '/process': {
    title: 'Порядок работы',
    componentName: 'ProcessPage',
    sections: ['PageHero', 'ProcessSteps', 'Agreement', 'FAQ', 'CTA'],
  },
  '/cases': {
    title: 'Кейсы',
    componentName: 'CasesPage',
    sections: ['PageHero', 'CasesGrid', 'ProjectCards', 'CTA'],
  },
  '/about': {
    title: 'Обо мне',
    componentName: 'AboutPage',
    sections: ['PageHero', 'Profile', 'Principles', 'Experience', 'Trust', 'CTA'],
  },
  '/contacts': {
    title: 'Контакты',
    componentName: 'ContactsPage',
    sections: ['PageHero', 'SpecialistStatus', 'ContactMethods', 'ContactForm'],
  },
  '/privacy': {
    title: 'Политика обработки данных',
    componentName: 'LegalPage',
    sections: ['LegalHeader', 'LegalSections', 'ContactReference'],
  },
  '/terms': {
    title: 'Условия обращения',
    componentName: 'LegalPage',
    sections: ['LegalHeader', 'TermsSections', 'ContactReference'],
  },
  '/brief': {
    title: 'Мини-бриф',
    componentName: 'BriefPage',
    sections: ['BriefIntro', 'ProjectType', 'Requirements', 'Estimate', 'Summary'],
  },
  '/changelog': {
    title: 'История изменений',
    componentName: 'ChangelogPage',
    sections: ['PageHero', 'ReleaseTimeline', 'ReleaseNotes'],
  },
  '/primorsky-krai': {
    title: 'Услуги в Приморском крае',
    componentName: 'LocalSeoPage',
    sections: ['LocalHero', 'Cities', 'ServiceDirections', 'WorkFormat', 'FAQ', 'CTA'],
  },
};

export const xrayServiceSlugs = [
  'computer-help-vladivostok',
  'program-installation-vladivostok',
  'windows-setup-vladivostok',
  'macbook-setup-vladivostok',
  'pc-build-vladivostok',
  'data-transfer-vladivostok',
  'phone-setup-vladivostok',
  'website-admin-vladivostok',
] as const;

export const xrayArticleSlugs = [
  'speed-up-windows',
  'new-laptop-setup',
  'how-to-choose-ssd',
  'safe-data-transfer',
  'how-to-choose-laptop',
  'macbook-or-windows',
  'how-to-choose-computer',
  'how-to-protect-computer',
  'how-to-choose-wifi-router',
  'slow-internet',
  'how-to-choose-smartphone',
  'what-is-business-card-website',
  'what-is-landing-page',
  'what-is-admin-website',
  'what-is-mvp',
  'when-business-needs-website',
  'when-business-needs-automation',
  'how-to-choose-hosting',
  'prepare-photos-for-website',
  'how-to-choose-website-developer',
  'data-transfer',
  'digital-hygiene',
  'scams',
  'apps-checklists',
  'website-development-cost',
  'website-for-small-business',
  'company-website-structure',
  'diy-or-developer-website',
] as const;

export const xrayPriceSlugs = ['websites', 'programs', 'devices', 'phones', 'pc'] as const;
export const xrayCaseSlugs = ['ay-digital-personal-website', 'marine-equipment-catalog'] as const;
export const xrayLocalSlugs = [
  'computer-help-artem',
  'computer-help-ussuriysk',
  'computer-help-nakhodka',
  'website-development-artem',
  'website-development-ussuriysk',
  'website-development-nakhodka',
] as const;

function normalizePathname(pathname: string) {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

function slugFrom(pathname: string, prefix = '/') {
  return pathname.slice(prefix.length);
}

function hasSlug(values: readonly string[], slug: string) {
  return values.includes(slug);
}

export function matchXRayRoute(pathname: string): XRayRouteMatch | null {
  const route = normalizePathname(pathname);
  const staticRoute = staticRoutes[route];
  if (staticRoute) {
    return { route, kind: route === '/' ? 'home' : 'static', ...staticRoute };
  }

  if (route === '/website-development-vladivostok') {
    return {
      route,
      kind: 'web-studio',
      slug: 'website-development-vladivostok',
      title: 'Создание сайтов во Владивостоке',
      componentName: 'WebStudioPage',
      sections: ['WebStudioHero', 'Capabilities', 'WebsiteTypes', 'Pricing', 'Calculator', 'Portfolio', 'CityStory', 'Process', 'FAQ', 'Finale'],
    };
  }

  const articleSlug = route.startsWith('/useful/') ? slugFrom(route, '/useful/') : '';
  if (articleSlug && !articleSlug.includes('/') && hasSlug(xrayArticleSlugs, articleSlug)) {
    return {
      route,
      kind: 'article',
      slug: articleSlug,
      title: 'Полезный материал',
      componentName: 'UsefulArticlePage',
      sections: ['ArticleHero', 'Contents', 'DirectAnswer', 'ArticleSections', 'Advice', 'Warnings', 'Mistakes', 'FAQ', 'RelatedArticles', 'Services', 'CTA'],
    };
  }

  const priceSlug = route.startsWith('/prices/') ? slugFrom(route, '/prices/') : '';
  if (priceSlug && !priceSlug.includes('/') && hasSlug(xrayPriceSlugs, priceSlug)) {
    return {
      route,
      kind: 'price',
      slug: priceSlug,
      title: 'Направление цен',
      componentName: 'PriceDirectionPage',
      sections: ['DirectionHero', 'Packages', 'Includes', 'Disclaimer', 'RelatedDirections', 'CTA'],
    };
  }

  const caseSlug = route.startsWith('/cases/') ? slugFrom(route, '/cases/') : '';
  if (caseSlug && !caseSlug.includes('/') && hasSlug(xrayCaseSlugs, caseSlug)) {
    return {
      route,
      kind: 'case',
      slug: caseSlug,
      title: 'Кейс',
      componentName: 'CasePage',
      sections: ['CaseHero', 'Task', 'InitialSituation', 'WorkCompleted', 'Challenges', 'Result', 'Technologies', 'RelatedLinks'],
    };
  }

  const singleSlug = route.startsWith('/') ? slugFrom(route) : '';
  if (singleSlug && !singleSlug.includes('/') && hasSlug(xrayLocalSlugs, singleSlug)) {
    return {
      route,
      kind: 'local',
      slug: singleSlug,
      title: 'Локальная страница',
      componentName: 'LocalSeoPage',
      sections: ['LocalHero', 'TaskExamples', 'RemoteFormat', 'PersonalFormat', 'RelatedServices', 'FAQ', 'CTA'],
    };
  }

  if (singleSlug && !singleSlug.includes('/') && hasSlug(xrayServiceSlugs, singleSlug)) {
    return {
      route,
      kind: 'service',
      slug: singleSlug,
      title: 'Страница услуги',
      componentName: 'SeoLandingPage',
      sections: ['ServiceHero', 'Includes', 'WhenNeeded', 'Process', 'Prices', 'Trust', 'Problems', 'FAQ', 'RelatedServices', 'Articles', 'CTA'],
    };
  }

  return null;
}

export function isXRayEnabledRoute(pathname: string) {
  return matchXRayRoute(pathname) !== null;
}

export const xrayStaticRoutes = Object.keys(staticRoutes);
