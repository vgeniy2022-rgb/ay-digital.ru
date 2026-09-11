import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { priceDirections } from '../../../data/priceDirections';
import { getRouteSeo } from '../../../data/routeSeo';
import { getBreadcrumbItems } from '../../../utils/seoRoutes';
import { defaultStudioTheme } from '../schema/defaults';
import { migrateProject } from '../schema/migrations';
import { createProjectFromCatalog, filterCatalog, findCatalogTemplate, getTemplatePackage, publishCatalog, publishedTemplates, validateTemplateProject, type LoadedCatalogTemplate } from './catalog';
import { loadTemplateProject } from './projectLoaders';
import { studioComponentNames } from '../editor/componentCatalog';

// Test-only document, intentionally NOT imported by the runtime catalog.
function fixture(overrides: Partial<LoadedCatalogTemplate> = {}): LoadedCatalogTemplate {
  return {
    id: 'test-only', version: '1.0.0', slug: 'test-only', name: 'Тестовый учебный сайт', niche: 'education',
    description: 'Проверка поиска: всё о занятиях', features: ['Расписание', 'Программа обучения'],
    cover: { src: '/images/test-only.webp', alt: 'Тестовая обложка', width: 1200, height: 750 },
    servicePackageId: 'start', publication: 'published', verifiedAt: '2026-09-11',
    project: {
      schemaVersion: 1, id: 'test-seed', name: 'Test document', templateId: 'test-only',
      createdAt: '2026-09-01', updatedAt: '2026-09-01', activePageId: 'test-home', theme: structuredClone(defaultStudioTheme),
      pages: [{ id: 'test-home', name: 'Главная', slug: '', title: 'Тестовый сайт', metaDescription: 'Только тест', noindex: false, isHome: true, order: 0,
        data: { content: [{ type: 'Heading', props: { id: 'heading-test', text: 'Только тест', level: 'h1' } }], root: { props: {} } } }],
      assets: [], settings: { defaultBreakpoint: 'desktop', language: 'ru' },
    },
    ...overrides,
  };
}

test('catalog does not publish Studio starter examples or resolve unknown designs', () => {
  assert.equal(publishedTemplates.length, 30, 'Stage 7 publishes exactly thirty verified demonstrations');
  assert.equal(findCatalogTemplate('specialist'), undefined);
  assert.equal(findCatalogTemplate('does-not-exist'), undefined);
  assert.equal(findCatalogTemplate('../studio'), undefined);
  assert.deepEqual(publishCatalog([fixture({ publication: 'draft' })]), []);
});

test('catalog rejects duplicate identifiers and slugs, unverified demos and retired packages', () => {
  const template = fixture();
  assert.throws(() => publishCatalog([template, fixture({ slug: 'another' })]), /уникальными/);
  assert.throws(() => publishCatalog([template, fixture({ id: 'another' })]), /уникальными/);
  for (const change of [{ slug: '../studio' }, { version: 'next' }, { verifiedAt: undefined }, { servicePackageId: 'retired' }, { features: [] }]) {
    assert.throws(() => publishCatalog([fixture(change)]));
  }
  assert.throws(() => publishCatalog([fixture({ cover: { ...template.cover, src: 'https://unreviewed.example/cover.png' } })]), /обложка/);
});

test('catalog requires a real Studio document, homepage and portable media', () => {
  const template = fixture();
  assert.equal(publishCatalog([template]).length, 1);
  assert.throws(() => validateTemplateProject(fixture({ project: { ...template.project, pages: [] } })), /полноценный/);
  const nonPortable = fixture();
  nonPortable.project.pages[0].data.content[0].props.text = 'blob:local-browser-only';
  assert.throws(() => validateTemplateProject(nonPortable), /публичными медиа/);
});

test('search combines Russian query words with niche and excludes drafts', () => {
  const entries = [fixture(), fixture({ id: 'cafe', slug: 'cafe', name: 'Кафе', niche: 'restaurant' }), fixture({ id: 'draft', publication: 'draft' })];
  assert.equal(filterCatalog(entries, '  УЧЕБНЫЙ   ВСЕ  ', 'education').length, 1);
  assert.equal(filterCatalog(entries, 'Программа', '').length, 2);
  assert.equal(filterCatalog(entries, '', 'restaurant')[0].id, 'cafe');
  assert.equal(filterCatalog(entries, 'Учебный', 'restaurant').length, 0);
  assert.equal(filterCatalog(entries, 'нет совпадений', '').length, 0);
  assert.equal(filterCatalog(entries, '', '').length, 2);
});

test('price and package come from the existing pricing object, with no second numeric source', () => {
  const template = fixture();
  const source = priceDirections.find((direction) => direction.slug === 'websites')!.packages.find((entry) => entry.id === template.servicePackageId);
  assert.strictEqual(getTemplatePackage(template), source);
  assert.equal(getTemplatePackage(fixture({ servicePackageId: 'unknown' })), undefined);
  assert.equal('price' in template, false);
});

test('expanded niches remain discoverable through combined search and business filters', () => {
  assert.deepEqual(filterCatalog(publishedTemplates, 'фотограф галерея', 'portfolio').map(t=>t.slug), ['photographer']);
  assert.deepEqual(filterCatalog(publishedTemplates, 'психолог', 'services').map(t=>t.slug), ['private-psychologist']);
  assert.deepEqual(filterCatalog(publishedTemplates, 'отдых', 'hospitality').map(t=>t.slug), ['holiday-lodge']);
  assert.equal(filterCatalog(publishedTemplates, '', 'education').length, 4);
  assert.equal(filterCatalog(publishedTemplates, 'логистика', 'retail').length, 0);
  assert.deepEqual(filterCatalog(publishedTemplates, '', 'missing'), []);
});

test('customization clones the existing schema without altering the template or other copies', () => {
  const template = fixture();
  const original = structuredClone(template);
  const first = createProjectFromCatalog(template);
  const second = createProjectFromCatalog(template);
  assert.notEqual(first.id, template.project.id);
  assert.notEqual(first.id, second.id);
  assert.notEqual(first.pages[0].id, second.pages[0].id);
  assert.equal(first.activePageId, first.pages[0].id);
  assert.equal(first.pages[0].noindex, true);
  assert.equal(first.templateId, template.id);
  assert.equal(migrateProject(first).schemaVersion, template.project.schemaVersion);
  first.pages[0].data.content[0].props.text = 'Изменено';
  first.theme.colors.primary = '#abcdef';
  assert.deepEqual(template, original);
  assert.notEqual(second.theme.colors.primary, first.theme.colors.primary);
  assert.notEqual(second.pages[0].data.content[0].props.text, first.pages[0].data.content[0].props.text);
  assert.throws(() => createProjectFromCatalog(fixture({ publication: 'draft' })), /ещё не опубликован/);
});

test('all thirty names resolve to their own card and the final business filters stay disjoint', () => {
  for (const template of publishedTemplates) {
    assert.deepEqual(filterCatalog(publishedTemplates, template.name, template.niche).map(t=>t.id), [template.id]);
    assert.equal(findCatalogTemplate(template.slug), template);
  }
  assert.deepEqual(filterCatalog(publishedTemplates, '', 'travel').map(t=>t.slug), ['excursions', 'boat-rental']);
  assert.deepEqual(filterCatalog(publishedTemplates, '', 'home').map(t=>t.slug), ['apartment-renovation', 'custom-furniture', 'cleaning-service']);
  assert.deepEqual(filterCatalog(publishedTemplates, '', 'pets').map(t=>t.slug), ['pet-grooming', 'pet-hotel', 'dog-trainer']);
  for (const [query,slug,niche] of [['катера','boat-rental','travel'],['ремонт квартир','apartment-renovation','home'],['мебель','custom-furniture','home'],['груминг','pet-grooming','pets'],['зоогостиница','pet-hotel','pets'],['кинолог','dog-trainer','pets']])
    assert.deepEqual(filterCatalog(publishedTemplates, query, niche).map(t=>t.slug), [slug]);
  assert.equal(filterCatalog(publishedTemplates, 'катера', 'pets').length, 0);
});

test('published catalog is indexable; unknown details remain noindex with their own canonical and breadcrumb', () => {
  assert.equal(getRouteSeo('/templates').noindex, false);
  assert.equal(getRouteSeo('/templates').canonicalPath, '/templates');
  assert.equal(getRouteSeo('/templates/missing').noindex, true);
  assert.deepEqual(getBreadcrumbItems('/templates/missing').map((item) => item.label), ['Главная', 'Дизайны сайтов', 'Дизайн недоступен']);
});

test('any published catalog images must physically exist; demo fixtures stay out of runtime', async () => {
  const visit = (value: unknown) => {
    if (typeof value === 'string' && /^\/(images|template-assets)\//.test(value)) {
      assert.ok(existsSync(join(process.cwd(), 'public', value)), `Missing public template asset: ${value}`);
    } else if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === 'object') Object.values(value).forEach(visit);
  };
  publishedTemplates.forEach(visit);
  for (const template of publishedTemplates) visit((await loadTemplateProject(template)).project);
  assert.doesNotMatch(readFileSync(new URL('./catalog.ts', import.meta.url), 'utf8'), /from.*templates\/templates|from.*catalog\.test/);
});

test('all lazy projects use registered Studio blocks, working anchor targets and safe demo forms', async () => {
  const designs = new Set<string>();
  const signatures = new Set<string>();
  for (const template of publishedTemplates) {
    assert.equal('project' in template, false, 'Catalog metadata must not import heavy project data');
    const loaded = await loadTemplateProject(template);
    assert.equal(loaded.project.templateId, template.id);
    const content = loaded.project.pages[0].data.content;
    const root = loaded.project.pages[0].data.root.props as { catalogDesign: string };
    designs.add(root.catalogDesign);
    const ids = content.map(block => block.props.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(content.every(block => (studioComponentNames as readonly string[]).includes(block.type)));
    assert.equal(content.filter(block => block.type === 'DesignHero').length, 1);
    assert.equal(content.filter(block => block.type === 'DesignContact').length, 1);
    const sections = content.filter(block => !['DesignHeader', 'DesignFooter'].includes(block.type));
    assert.ok(sections.length >= 6 && sections.length <= 9);
    signatures.add(sections.map(block => `${block.type}:${block.props.layout || block.props.variant || ''}`).join('|'));
    const anchors = new Set(['top', ...content.map(block => block.props.idAnchor).filter(Boolean)]);
    for (const block of content) {
      for (const link of block.props.links || []) assert.ok(anchors.has(link.href.slice(1)), `Missing anchor ${link.href}`);
      if (block.type === 'DesignHero') for (const href of [block.props.href, block.props.secondaryHref]) assert.ok(anchors.has(href.slice(1)));
    }
    assert.ok(content.some(block => block.type === 'DesignFAQ' && block.props.items.length >= 3));
    const copy = createProjectFromCatalog(loaded);
    assert.deepEqual(copy.pages[0].data, loaded.project.pages[0].data);
    assert.notEqual(copy.id, loaded.project.id);
    assert.equal(getRouteSeo(`/templates/${template.slug}`).noindex, false);
  }
  assert.equal(designs.size, 30);
  assert.equal(signatures.size, 30, 'Each demo has its own section composition');
  await assert.rejects(loadTemplateProject(fixture()), /недоступны/);
});
