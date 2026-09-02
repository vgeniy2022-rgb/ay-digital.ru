import assert from 'node:assert/strict';
import test from 'node:test';
import { aiAllowedComponentNames } from './componentCatalog';
import { sitePlanToProject } from './generator';
import { GeminiAIProvider, LocalAIProvider } from './providers';
import { createProjectWithAi } from './service';
import { validateSitePlan } from './validation';
import { auditStudioProject, proposeTheme } from './audit';
import { migrateProject } from '../schema/migrations';

test('AI planner creates a normal editable SITEVL project', async () => {
  const result = await createProjectWithAi({ prompt: 'Сайт барбершопа во Владивостоке. Тёмный стиль, услуги, цены, отзывы и FAQ.', projectType: 'auto', visualStyle: 'auto', pageCount: '3' }, 'local');
  assert.equal(result.project.schemaVersion, 1);
  assert.equal(result.project.pages.length, 3);
  assert.equal(result.project.theme.colors.background, '#0d1117');
  assert.doesNotThrow(() => migrateProject(result.project));
  result.project.pages.flatMap((page) => page.data.content).forEach((block) => assert.equal(aiAllowedComponentNames.has(block.type), true));
});

test('unknown components and malicious markup never enter the project', () => {
  const plan = validateSitePlan({
    projectType: 'services', businessName: '<script>alert(1)</script>Service', businessSummary: 'javascript:bad', visualStyle: 'minimal',
    pages: [{ name: 'Главная', slug: '/', title: '<img onerror=bad>Title', metaDescription: 'Description', sections: [{ type: 'MagicSuperComponent' }, { type: 'Hero', title: '<script>x</script>Безопасный заголовок' }, { type: 'Footer' }] }],
  });
  assert.deepEqual(plan.pages[0].sections.map((section) => section.type), ['Hero', 'Footer']);
  assert.equal(JSON.stringify(plan).includes('<script>'), false);
  assert.equal(JSON.stringify(plan).includes('javascript:'), false);
  const project = sitePlanToProject(plan);
  assert.deepEqual(project.pages[0].data.content.map((block) => block.type), ['Hero', 'Footer']);
});

test('local provider is available and Gemini provider is honest when unset', async () => {
  assert.equal(await new LocalAIProvider().isAvailable(), true);
  assert.equal(await new GeminiAIProvider().isAvailable(), true);
  assert.equal(await new GeminiAIProvider('').isAvailable(), false);
  await assert.rejects(() => new GeminiAIProvider('').generateStructured({ kind: 'site-plan', prompt: 'test' }), /не настроен/);
});

test('deterministic audit reports missing SEO and theme proposal only changes tokens', async () => {
  const project = (await createProjectWithAi({ prompt: 'Лендинг мастерской с услугами и контактами', projectType: 'landing', visualStyle: 'minimal', pageCount: '1' })).project;
  project.pages[0].metaDescription = '';
  const audit = auditStudioProject(project);
  assert.equal(audit.findings.some((finding) => finding.category === 'SEO' && finding.severity === 'critical'), true);
  const proposal = proposeTheme(project, 'сделать темнее и технологичнее');
  assert.equal(proposal.theme.colors.background, '#0e1117');
  assert.equal(project.theme.colors.background, '#f5f7fa');
});

test('site plan limits pages, sections and item counts', () => {
  const plan = validateSitePlan({ projectType: 'services', businessName: 'Test', pages: Array.from({ length: 20 }, (_, page) => ({ name: `Page ${page}`, sections: Array.from({ length: 30 }, () => ({ type: 'FAQ', items: Array.from({ length: 30 }, () => ({ question: 'Q', answer: 'A' })) })) })) });
  assert.equal(plan.pages.length, 8);
  assert.equal(plan.pages[0].sections.length, 18);
  assert.equal(plan.pages[0].sections[0].items?.length, 12);
});
