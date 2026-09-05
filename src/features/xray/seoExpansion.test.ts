import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { seoLandingPages } from '../../data/seoLandingPages';
import { usefulArticles } from '../../data/useful';
import { structuredPrice } from '../../utils/structuredPrice';
import { createBaseStructuredData } from '../../utils/seoStructuredData';

const commercialSlugs = [
  'business-website-development',
  'landing-development',
  'catalog-website-development',
  'online-store-development',
  'web-application-development',
] as const;

const articleSlugs = [
  'how-to-order-website',
  'website-or-mobile-app',
  'ecommerce-development-cost',
] as const;

function assertUniqueMeaningfulValues(values: string[], label: string) {
  values.forEach((value) => {
    assert.ok(value.trim().length >= 24, `${label} должен быть содержательным: ${value}`);
  });
  assert.equal(new Set(values).size, values.length, `${label} не должны дублироваться`);
}

function assertMeaningfulFaq(faq: { question: string; answer: string }[], label: string) {
  assert.ok(faq.length >= 6, `${label}: требуется не менее шести FAQ`);
  faq.forEach((item) => {
    assert.ok(item.question.trim().length >= 15, `${label}: слишком короткий вопрос FAQ`);
    assert.ok(item.answer.trim().length >= 40, `${label}: слишком короткий ответ FAQ`);
  });
  assert.equal(new Set(faq.map((item) => item.question)).size, faq.length, `${label}: вопросы FAQ должны быть уникальны`);
}

test('SEO expansion содержит пять самостоятельных коммерческих страниц', () => {
  const pages = commercialSlugs.map((slug) => {
    const page = seoLandingPages.find((item) => item.slug === slug);
    assert.ok(page, `Не найдена коммерческая страница ${slug}`);
    assert.equal(page.path, `/${slug}`);
    return page;
  });

  assertUniqueMeaningfulValues(pages.map((page) => page.seoTitle), 'SEO title');
  assertUniqueMeaningfulValues(pages.map((page) => page.title), 'H1');
  assertUniqueMeaningfulValues(pages.map((page) => page.seoDescription), 'Meta description');

  pages.forEach((page) => {
    assertMeaningfulFaq(page.faq, page.path);
    const internalLinks = [
      ...(page.relatedServices ?? []),
      ...(page.relatedArticles ?? []),
      ...page.links,
    ].filter((link) => link.href.startsWith('/'));

    assert.ok(internalLinks.length >= 5, `${page.path}: недостаточно внутренних ссылок`);
    assert.ok(new Set(internalLinks.map((link) => link.href)).size >= 5, `${page.path}: перелинковка должна вести на разные страницы`);
  });
});

test('SEO expansion содержит три полезные статьи с FAQ и перелинковкой', () => {
  const articles = articleSlugs.map((slug) => {
    const article = usefulArticles.find((item) => item.slug === slug);
    assert.ok(article, `Не найдена статья ${slug}`);
    assert.equal(article.path, `/useful/${slug}`);
    return article;
  });

  articles.forEach((article) => {
    assertMeaningfulFaq(article.faq, article.path);

    const links = [...article.relatedArticles, ...article.relatedServices];
    assert.ok(links.length >= 6, `${article.path}: недостаточно связанных материалов и услуг`);
    links.forEach((link) => assert.match(link.href, /^\//, `${article.path}: внутренняя ссылка должна быть относительной`));
    assert.equal(new Set(links.map((link) => link.href)).size, links.length, `${article.path}: ссылки не должны повторяться`);
  });
});

test('SEO expansion не создаёт doorway-маршруты под синонимы запроса', () => {
  const publishedSlugs = [
    ...seoLandingPages.map((page) => page.slug),
    ...usefulArticles.map((article) => article.slug),
  ];
  const synonymDoorway = /(?:^|-)(?:zakazat|sdelat|sozdat)(?:-|$)/i;

  assert.deepEqual(publishedSlugs.filter((slug) => synonymDoorway.test(slug)), []);
});

test('цены для SEO-материалов берутся из единого прайса, а не из hardcode', () => {
  const expandedContent = [
    ...commercialSlugs.map((slug) => seoLandingPages.find((page) => page.slug === slug)),
    ...articleSlugs.map((slug) => usefulArticles.find((article) => article.slug === slug)),
  ];
  const serializedContent = JSON.stringify(expandedContent);
  const currencyLiteral = /\d[\d\s\u00a0]*(?:₽|руб(?:\.|лей)?)/iu;

  assert.doesNotMatch(serializedContent, currencyLiteral, 'В SEO-контенте обнаружена продублированная сумма');

  const articlePageSource = readFileSync(resolve(process.cwd(), 'src/pages/UsefulArticlePage.tsx'), 'utf8');
  const priceSummarySource = articlePageSource.slice(
    articlePageSource.indexOf('function WebsitePriceSummary'),
    articlePageSource.indexOf('function ArticlePhotoBreak'),
  );

  assert.match(priceSummarySource, /getPriceDirection\('websites'\)/);
  assert.match(priceSummarySource, /\{item\.price\}/);
  assert.doesNotMatch(priceSummarySource, currencyLiteral, 'Компонент ценового блока не должен содержать суммы вручную');
});

test('structured data различает стартовую, точную и диапазонную цену', () => {
  assert.deepEqual(structuredPrice('от 19 900 ₽'), {
    priceSpecification: {
      '@type': 'PriceSpecification',
      priceCurrency: 'RUB',
      minPrice: 19_900,
    },
  });
  assert.deepEqual(structuredPrice('3 500–5 000 ₽'), {
    priceSpecification: {
      '@type': 'PriceSpecification',
      priceCurrency: 'RUB',
      minPrice: 3_500,
      maxPrice: 5_000,
    },
  });
  assert.deepEqual(structuredPrice('1 500 ₽'), { price: 1_500, priceCurrency: 'RUB' });
  assert.deepEqual(structuredPrice('Цена после обсуждения'), {});
});

test('базовая schema не заявляет неподтверждённый физический офис', () => {
  const schema = createBaseStructuredData();
  const serialized = JSON.stringify(schema);
  const professionalService = schema.find((item) => item['@type'] === 'ProfessionalService');

  assert.ok(professionalService, 'ProfessionalService должен присутствовать');
  assert.doesNotMatch(serialized, /LocalBusiness|PostalAddress|addressLocality/);
  assert.match(serialized, /Частный веб-разработчик и IT-специалист/);
});
