import { absoluteUrl, siteConfig } from '../config/site';
import { getBreadcrumbItems } from './seoRoutes';

const identityId = absoluteUrl('/#identity');
const websiteId = absoluteUrl('/#website');
const businessId = absoluteUrl('/#local-business');

export function createContactPoint() {
  return {
    '@type': 'ContactPoint',
    telephone: siteConfig.phone,
    contactType: 'customer support',
    areaServed: 'RU-PRI',
    availableLanguage: ['ru'],
    url: siteConfig.telegramUrl,
  };
}

export function createBaseStructuredData() {
  const contactPoint = createContactPoint();

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': identityId,
      name: siteConfig.siteName,
      url: siteConfig.siteUrl,
      logo: absoluteUrl('/favicon.svg'),
      image: absoluteUrl(siteConfig.defaultOgImage),
      sameAs: [siteConfig.telegramUrl],
      contactPoint,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': absoluteUrl('/#person'),
      name: siteConfig.specialistName,
      jobTitle: 'Частный веб-разработчик и IT-специалист',
      url: siteConfig.siteUrl,
      telephone: siteConfig.phone,
      sameAs: [siteConfig.telegramUrl],
      worksFor: { '@id': identityId },
      areaServed: { '@type': 'City', name: siteConfig.city },
      knowsAbout: ['создание сайтов', 'веб-приложения', 'компьютерная помощь', 'Windows', 'MacBook', 'перенос данных', 'настройка телефонов', 'подбор техники Apple, Samsung и Xiaomi'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': businessId,
      name: `${siteConfig.specialistName} / ${siteConfig.siteName}`,
      url: siteConfig.siteUrl,
      telephone: siteConfig.phone,
      image: absoluteUrl(siteConfig.defaultOgImage),
      priceRange: '₽₽',
      areaServed: [
        { '@type': 'City', name: siteConfig.city },
        { '@type': 'AdministrativeArea', name: 'Приморский край' },
        { '@type': 'City', name: 'Артём' },
        { '@type': 'City', name: 'Уссурийск' },
        { '@type': 'City', name: 'Находка' },
      ],
      contactPoint,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': websiteId,
      name: siteConfig.siteName,
      url: siteConfig.siteUrl,
      inLanguage: 'ru-RU',
      publisher: { '@id': identityId },
    },
  ];
}

export function createBreadcrumbStructuredData(pathname: string) {
  const items = getBreadcrumbItems(pathname);

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}
