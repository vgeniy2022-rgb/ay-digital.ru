import { useEffect, useRef, useState } from 'react';
import { AsiaStory, DigitalTransition } from '../components/web-studio/AsiaStory';
import { ChapterNavigation } from '../components/web-studio/ChapterNavigation';
import { CityTimeline } from '../components/web-studio/CityTimeline';
import { DevelopmentProcess, IndustriesMarquee, OwnershipStory, StudioFaqAndLinks, WhyWebsiteStory } from '../components/web-studio/DevelopmentProcess';
import { PortStory } from '../components/web-studio/PortStory';
import { PortfolioChapter } from '../components/web-studio/PortfolioChapter';
import { StudioCapabilities } from '../components/web-studio/StudioCapabilities';
import { StudioFinale } from '../components/web-studio/StudioFinale';
import { StudioProgress } from '../components/web-studio/StudioProgress';
import { WebStudioHero } from '../components/web-studio/WebStudioHero';
import { WebsiteCalculator } from '../components/web-studio/WebsiteCalculator';
import { WebsiteContacts } from '../components/web-studio/WebsiteContacts';
import { WebsitePricing } from '../components/web-studio/WebsitePricing';
import { WebsiteTypes } from '../components/web-studio/WebsiteTypes';
import { SeoHead } from '../components/SeoHead';
import { absoluteUrl, siteConfig } from '../config/site';
import { seoLandingPages } from '../data/seoLandingPages';
import { studioWebsiteTypes } from '../data/webStudio';
import { useSiteData } from '../hooks/useSiteData';
import { useWebStudioMotion } from '../hooks/useWebStudioMotion';
import '../styles/webStudio.css';

const page = seoLandingPages.find((item) => item.slug === 'website-development-vladivostok');

function websiteStudioStructuredData() {
  if (!page) return [];

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: page.title,
      serviceType: 'Создание и разработка сайтов',
      description: page.seoDescription,
      url: absoluteUrl(page.path),
      provider: {
        '@type': 'Person',
        name: siteConfig.specialistName,
        telephone: siteConfig.phone,
        url: siteConfig.siteUrl,
        sameAs: [siteConfig.telegramUrl],
      },
      areaServed: [
        { '@type': 'City', name: 'Владивосток' },
        { '@type': 'AdministrativeArea', name: 'Приморский край' },
        { '@type': 'Country', name: 'Россия' },
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Форматы разработки сайтов',
        itemListElement: studioWebsiteTypes.map((item) => ({
          '@type': 'Offer',
          name: item.name,
          description: `${item.description} ${item.range || item.price}`,
          priceCurrency: 'RUB',
          availability: 'https://schema.org/InStock',
          url: absoluteUrl(page.path),
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ];
}

export function WebStudioPage() {
  const rootRef = useRef<HTMLElement>(null);
  const [activeChapter, setActiveChapter] = useState('websites');
  const { data } = useSiteData();

  useWebStudioMotion(rootRef, setActiveChapter);

  useEffect(() => {
    const themeColor = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previousColor = themeColor?.content;
    document.body.classList.add('studio-route-active');
    if (themeColor) themeColor.content = '#07111f';

    return () => {
      document.body.classList.remove('studio-route-active');
      if (themeColor && previousColor) themeColor.content = previousColor;
    };
  }, []);

  if (!page) return null;

  const relatedServices = page.relatedServices || page.links;
  const relatedArticles = page.relatedArticles || [];

  return (
    <article className="studio-page" ref={rootRef}>
      <SeoHead
        title={page.seoTitle}
        description={page.seoDescription}
        canonicalPath={page.path}
        structuredData={websiteStudioStructuredData()}
      />
      <StudioProgress activeChapter={activeChapter} />
      <WebStudioHero telegramUrl={data.site.telegramUrl} />
      <StudioCapabilities />
      <WebsiteTypes />
      <ChapterNavigation activeChapter={activeChapter} />
      <WebsitePricing />
      <WebsiteCalculator telegramUrl={data.site.telegramUrl} whatsappUrl={data.site.whatsappUrl} />
      <WebsiteContacts
        telegramUrl={data.site.telegramUrl}
        telegramUsername={data.site.telegramUsername}
        whatsappUrl={data.site.whatsappUrl}
        phoneUrl={data.site.phoneUrl}
        phone={data.site.phones[0]}
      />
      <PortfolioChapter />
      <WhyWebsiteStory />
      <OwnershipStory />
      <CityTimeline />
      <AsiaStory />
      <PortStory />
      <DigitalTransition />
      <DevelopmentProcess />
      <IndustriesMarquee />
      <StudioFaqAndLinks
        faq={page.faq}
        relatedServices={relatedServices}
        relatedArticles={relatedArticles}
      />
      <StudioFinale telegramUrl={data.site.telegramUrl} whatsappUrl={data.site.whatsappUrl} />
    </article>
  );
}
