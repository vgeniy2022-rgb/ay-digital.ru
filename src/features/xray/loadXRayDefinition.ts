import type { XRayPageDefinition, XRayRouteMatch } from './types';

export async function loadXRayDefinition(match: XRayRouteMatch): Promise<XRayPageDefinition> {
  switch (match.kind) {
    case 'home': {
      const { createHomeDefinition } = await import('./definitionBuilders');
      return createHomeDefinition(match);
    }
    case 'static': {
      if (match.route === '/mobile-apps') {
        const [{ priceDirections }, { createConfiguredDefinition }] = await Promise.all([
          import('../../data/priceDirections'),
          import('./definitionBuilders'),
        ]);
        const direction = priceDirections.find((item) => item.slug === 'mobile-apps');
        if (!direction) throw new Error('X-RAY: конфигурация мобильных приложений не найдена.');
        return createConfiguredDefinition(
          match,
          match.title,
          'mobile-apps.config.ts',
          {
            route: match.route,
            platforms: ['iOS', 'Android', 'iOS + Android'],
            productTypes: ['Приложение компании', 'Каталог', 'Интернет-магазин', 'Запись', 'MVP'],
            startingPrice: direction.packages[0].price,
            packages: direction.packages.map((item) => ({ name: item.name, price: item.price })),
            care: ['2 990 ₽ / месяц', '5 990 ₽ / месяц', '9 990 ₽ / месяц'],
          },
          `export function MobileAppsPage() {
  return (
    <PageTransition>
      <MobileAppsSeo />
      <AppsHero visual={<MobileAppVisual />} />
      <ProductTypes />
      <Platforms />
      <Capabilities />
      <DevelopmentStages />
      <MobilePricing />
      <SitevlCare initialDirection="apps" />
      <AppsFaq />
      <AppsFinalCallToAction />
    </PageTransition>
  );
}`,
        );
      }
      const { createStaticDefinition } = await import('./definitionBuilders');
      return createStaticDefinition(match);
    }
    case 'service': {
      const [{ seoLandingPages }, { createServiceDefinition }] = await Promise.all([
        import('../../data/seoLandingPages'),
        import('./definitionBuilders'),
      ]);
      const page = seoLandingPages.find((item) => item.slug === match.slug);
      if (!page) throw new Error('X-RAY: конфигурация услуги не найдена.');
      return createServiceDefinition(match, page);
    }
    case 'web-studio': {
      const [{ seoLandingPages }, { createConfiguredDefinition }] = await Promise.all([
        import('../../data/seoLandingPages'),
        import('./definitionBuilders'),
      ]);
      const page = seoLandingPages.find((item) => item.slug === match.slug);
      if (!page) throw new Error('X-RAY: конфигурация Web Studio не найдена.');
      return createConfiguredDefinition(
        match,
        page.title,
        'website-development-vladivostok.config.ts',
        {
          route: page.path,
          title: page.title,
          description: page.description,
          websiteTypes: ['Сайт-визитка', 'Лендинг', 'Сайт с админкой', 'Бизнес-сайт'],
          faq: page.faq.slice(0, 5).map((item) => item.question),
        },
        `export function WebStudioPage() {
  const rootRef = useRef<HTMLElement>(null);
  useWebStudioMotion(rootRef);

  return (
    <article className="studio-page" ref={rootRef}>
      <WebsiteStudioSeo />
      <StudioProgress />
      <WebStudioHero />
      <StudioCapabilities />
      <WebsiteTypes />
      <ChapterNavigation />
      <WebsitePricing />
      <WebsiteCalculator />
      <WebsiteContacts />
      <PortfolioChapter />
      <CityTimeline />
      <DevelopmentProcess />
      <StudioFaqAndLinks />
      <StudioFinale />
    </article>
  );
}`,
      );
    }
    case 'article': {
      const [{ usefulArticles }, { createArticleDefinition }] = await Promise.all([
        import('../../data/useful'),
        import('./definitionBuilders'),
      ]);
      const article = usefulArticles.find((item) => item.slug === match.slug);
      if (!article) throw new Error('X-RAY: материал не найден.');
      return createArticleDefinition(match, article);
    }
    case 'price': {
      const [{ priceDirections }, { createConfiguredDefinition }] = await Promise.all([
        import('../../data/priceDirections'),
        import('./definitionBuilders'),
      ]);
      const page = priceDirections.find((item) => item.slug === match.slug);
      if (!page) throw new Error('X-RAY: направление цен не найдено.');
      return createConfiguredDefinition(match, page.title, `${page.slug}.prices.ts`, {
        path: page.path,
        title: page.title,
        description: page.description,
        packages: page.packages.map((item) => ({ name: item.name, price: item.price, includes: item.includes })),
        sections: page.sections.map((section) => section.title),
        disclaimer: page.disclaimer,
      });
    }
    case 'case': {
      const [{ publishedCases }, { createConfiguredDefinition }] = await Promise.all([
        import('../../data/cases'),
        import('./definitionBuilders'),
      ]);
      const page = publishedCases.find((item) => item.slug === match.slug);
      if (!page) throw new Error('X-RAY: кейс не найден.');
      return createConfiguredDefinition(match, page.title, `${page.slug}.case.ts`, {
        path: page.path,
        title: page.title,
        category: page.category,
        task: page.task,
        workCompleted: page.workCompleted,
        challenges: page.challenges.map((item) => item.title),
        result: page.result,
        technologies: page.technologies,
      });
    }
    case 'local': {
      const [{ localSeoPages }, { createConfiguredDefinition }] = await Promise.all([
        import('../../data/localSeo'),
        import('./definitionBuilders'),
      ]);
      const page = localSeoPages.find((item) => item.slug === match.slug);
      if (!page) throw new Error('X-RAY: локальная страница не найдена.');
      return createConfiguredDefinition(match, page.h1, `${page.slug}.local.ts`, {
        path: page.path,
        city: page.city,
        serviceType: page.serviceType,
        title: page.h1,
        description: page.description,
        taskExamples: page.taskExamples,
        remoteTasks: page.remoteTasks,
        faq: page.faq.slice(0, 5).map((item) => item.question),
      });
    }
  }
}
