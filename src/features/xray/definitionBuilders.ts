import type { XRayFile, XRayPageDefinition, XRayRouteMatch } from './types';
import { safeXRayJson, sanitizeXRayText } from './sanitize';

type NamedSection = { title: string; items?: string[] };

function file(id: string, filename: string, label: string, language: XRayFile['language'], content: string): XRayFile {
  return { id, filename, label, language, content: sanitizeXRayText(content.trim()) };
}

function componentTag(name: string) {
  return name.replace(/[^A-Za-z0-9]/g, '') || 'Section';
}

export function createStructure(title: string, sections: string[]) {
  const lines = sections.map((section, index) => {
    const branch = index === sections.length - 1 ? '└──' : '├──';
    return `${branch} ${section}`;
  });
  return [`Page: ${title}`, '│', ...lines].join('\n');
}

export function createStaticDefinition(match: XRayRouteMatch): XRayPageDefinition {
  const sectionCode = match.sections.map((section) => `      <${componentTag(section)} />`).join('\n');
  const tsx = `import { PageTransition } from '../components/PageTransition';
import { SeoHead } from '../components/SeoHead';

export function ${match.componentName}() {
  return (
    <PageTransition>
      <SeoHead canonicalPath="${match.route}" />
${sectionCode}
    </PageTransition>
  );
}`;

  return {
    route: match.route,
    title: match.title,
    componentName: match.componentName,
    files: [
      file('tsx', `${match.componentName}.tsx`, 'TSX', 'tsx', tsx),
      file('structure', 'page.structure', 'СТРУКТУРА', 'structure', createStructure(match.title, match.sections)),
    ],
  };
}

export function createHomeDefinition(match: XRayRouteMatch): XRayPageDefinition {
  const tsx = `export function HomePage() {
  const { data } = useSiteData();

  return (
    <PageTransition>
      <CinematicHero status={<SpecialistStatus />} />
      <WebsiteDirections items={websiteDirections} />
      <Capabilities items={capabilityItems} />
      <Projects cases={featuredCases} />
      <Process steps={processSteps} />
      <LabShowcase to="/lab" />
      <SiteAdminPromoCard />
      {data.reviews.length > 0 && <Reviews items={data.reviews} />}
      {data.faq.length > 0 && <Faq items={data.faq} />}
      <CallToAction />
    </PageTransition>
  );
}`;

  const css = `.home-cinematic-hero {
  position: relative;
  min-height: min(860px, 92svh);
  display: grid;
  align-items: end;
  overflow: hidden;
}

.home-service-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1rem, 2vw, 1.5rem);
}

@media (max-width: 767px) {
  .home-service-grid { grid-template-columns: 1fr; }
}`;

  return {
    route: match.route,
    title: match.title,
    componentName: match.componentName,
    files: [
      file('tsx', 'HomePage.tsx', 'TSX', 'tsx', tsx),
      file('css', 'home.css', 'CSS', 'css', css),
      file('structure', 'home.structure', 'СТРУКТУРА', 'structure', createStructure(match.title, match.sections)),
    ],
  };
}

export function createServiceDefinition(
  match: XRayRouteMatch,
  page: {
    title: string;
    eyebrow: string;
    description: string;
    priceGroupTitles: string[];
    sections: NamedSection[];
    faq: { question: string }[];
  },
) {
  const config = {
    route: match.route,
    eyebrow: page.eyebrow,
    title: page.title,
    description: page.description,
    priceGroups: page.priceGroupTitles,
    sections: page.sections.map((section) => ({ title: section.title, items: section.items?.slice(0, 4) })),
    faq: page.faq.slice(0, 5).map((item) => item.question),
  };
  const tsx = `export function SeoLandingPage({ page }: SeoLandingPageProps) {
  const prices = usePrices(page.priceGroups);

  return (
    <PageTransition>
      <SeoHead title={page.title} canonicalPath={page.route} />
      <ServiceHero page={page} />
      <ServiceIncludes sections={page.sections} />
      <WhenServiceIsNeeded page={page} />
      <ProcessSteps page={page} />
      <ServicePrices groups={prices} />
      <TrustBlock />
      <CommonProblems page={page} />
      <FaqBlock items={page.faq} />
      <RelatedServices page={page} />
      <UsefulArticles page={page} />
      <ServiceCallToAction />
    </PageTransition>
  );
}`;

  return {
    route: match.route,
    title: page.title,
    componentName: match.componentName,
    files: [
      file('tsx', 'SeoLandingPage.tsx', 'TSX', 'tsx', tsx),
      file('data', `${match.slug}.config.ts`, 'ДАННЫЕ', 'json', `export const page = ${safeXRayJson(config)} as const;`),
      file('structure', `${match.slug}.structure`, 'СТРУКТУРА', 'structure', createStructure(page.title, match.sections)),
    ],
  } satisfies XRayPageDefinition;
}

export function createArticleDefinition(
  match: XRayRouteMatch,
  article: {
    title: string;
    description: string;
    author: string;
    updatedAt: string;
    readingTime: string;
    sections: NamedSection[];
    faq: { question: string }[];
  },
) {
  const data = {
    slug: match.slug,
    title: article.title,
    description: article.description,
    author: article.author,
    updatedAt: article.updatedAt,
    readingTime: article.readingTime,
    sections: article.sections.map((section) => section.title),
    faq: article.faq.slice(0, 5).map((item) => item.question),
  };
  const tsx = `export function UsefulArticlePage() {
  const article = useCurrentArticle();

  return (
    <PageTransition>
      <ArticleSeo article={article} />
      <ArticleHero article={article} />
      <TableOfContents sections={article.sections} />
      <DirectAnswer article={article} />
      <ArticleSections sections={article.sections} />
      <Advice items={article.advice} />
      <Warnings items={article.warnings} />
      <CommonMistakes items={article.mistakes} />
      <FaqBlock items={article.faq} />
      <RelatedArticles article={article} />
      <UsefulServices article={article} />
      <ArticleCallToAction />
    </PageTransition>
  );
}`;

  return {
    route: match.route,
    title: article.title,
    componentName: match.componentName,
    files: [
      file('tsx', 'UsefulArticlePage.tsx', 'TSX', 'tsx', tsx),
      file('data', `${match.slug}.article.ts`, 'ДАННЫЕ', 'json', `export const article = ${safeXRayJson(data)} as const;`),
      file('structure', `${match.slug}.structure`, 'СТРУКТУРА', 'structure', createStructure(article.title, match.sections)),
    ],
  } satisfies XRayPageDefinition;
}

export function createConfiguredDefinition(
  match: XRayRouteMatch,
  title: string,
  dataFilename: string,
  data: unknown,
  componentCode?: string,
) {
  const sectionCode = match.sections.map((section) => `      <${componentTag(section)} />`).join('\n');
  const tsx = componentCode || `export function ${match.componentName}() {
  const page = useCurrentPage();

  return (
    <PageTransition>
      <SeoHead title={page.title} canonicalPath={page.path} />
${sectionCode}
    </PageTransition>
  );
}`;

  return {
    route: match.route,
    title,
    componentName: match.componentName,
    files: [
      file('tsx', `${match.componentName}.tsx`, 'TSX', 'tsx', tsx),
      file('data', dataFilename, 'ДАННЫЕ', 'json', `export const page = ${safeXRayJson(data)} as const;`),
      file('structure', `${match.slug || 'page'}.structure`, 'СТРУКТУРА', 'structure', createStructure(title, match.sections)),
    ],
  } satisfies XRayPageDefinition;
}
