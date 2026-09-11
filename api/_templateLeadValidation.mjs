import { createHash } from 'node:crypto';
import { templateContract } from './_templateContract.generated.mjs';

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 40 * 1024 * 1024;
export const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export const assetPattern = /^[a-zA-Z0-9_-]{8,100}$/;
export const digest = value => createHash('sha256').update(value).digest('hex');
export class TemplateError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export const requireThat = (condition, message = 'Некорректные данные заявки.', status = 400) => { if (!condition) throw new TemplateError(status, message); };
const text = (value, max, required = false) => {
  requireThat(typeof value === 'string' && value.length <= max && (!required || value.trim().length > 0));
  return Array.from(value.trim()).filter(char => char.charCodeAt(0) >= 32 || ['\n','\t','\r'].includes(char)).join('');
};
const object = (value, keys) => {
  requireThat(value && typeof value === 'object' && !Array.isArray(value));
  requireThat(Object.keys(value).every(key => keys.includes(key)));
};
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const movable = new Set(['DesignCollection', 'DesignStory', 'DesignFAQ']);
const propKeys = {
  DesignHeader: ['brand','descriptor','links','action','logo'],
  DesignHero: ['eyebrow','title','text','image','imageAlt','caption','action','href','secondary','secondaryHref','variant'],
  DesignCollection: ['idAnchor','eyebrow','title','text','layout','filter','items','action'],
  DesignStory: ['idAnchor','eyebrow','title','text','image','imageAlt','caption','reverse','points'],
  DesignFAQ: ['idAnchor','title','items'],
  DesignContact: ['idAnchor','eyebrow','title','text','options','action','addressNote','formVariant'],
  DesignFooter: ['brand','text','links'],
};
function validateProps(props, original, type, media, ids) {
  object(props, [...propKeys[type], 'id', 'hidden']);
  requireThat(props.id === original.id && (props.hidden === undefined || typeof props.hidden === 'boolean'));
  requireThat(movable.has(type) || !props.hidden);
  if (type === 'DesignCollection' && original.layout === 'comparison') requireThat(Array.isArray(props.items) && props.items.length === 2);
  for (const [key, value] of Object.entries(props)) {
    if (['id','hidden'].includes(key)) continue;
    if (['image','logo'].includes(key)) {
      requireThat(typeof value === 'string' && (value === '' || media.has(value) || (value.startsWith('asset://') && ids.has(value.slice(8)))), 'Фотография должна быть файлом проекта или исходным изображением дизайна.');
    } else if (['href','secondaryHref','idAnchor','layout','filter','reverse','variant','formVariant'].includes(key)) {
      requireThat(equal(value, original[key]));
    } else if (Array.isArray(value)) {
      requireThat(value.length <= 20);
      const keys = key === 'links' ? ['label','href'] : key === 'points' ? ['text'] : key === 'options' ? ['label'] : type === 'DesignFAQ' ? ['question','answer'] : ['title','text','tag','image','imageAlt','detail','meta','price'];
      for (const item of value) {
        object(item, keys);
        requireThat(keys.filter(k => ['title','text','question','answer','label'].includes(k)).every(k => typeof item[k] === 'string'));
        for (const [k, v] of Object.entries(item)) {
          text(v, k === 'price' ? 60 : 1500);
          if (k === 'href') requireThat(/^#[a-z][a-z0-9-]{0,60}$/.test(v));
          if (k === 'image') requireThat(media.has(v) || (v.startsWith('asset://') && ids.has(v.slice(8))));
        }
      }
    } else text(value, 2000);
  }
  // Required rendering fields cannot be removed by a crafted client.
  for (const key of Object.keys(original)) requireThat(key in props);
}
export function validateTemplateLead(raw) {
  requireThat(Buffer.byteLength(JSON.stringify(raw) || '') <= 200000, 'Снимок проекта слишком большой.', 413);
  requireThat(raw?.source === 'template-catalog' && uuidPattern.test(raw.submissionId || ''));
  requireThat(raw.contact?.consent === true, 'Подтвердите согласие на отправку данных.');
  const contact = { name: text(raw.contact.name, 100, true), contact: text(raw.contact.contact, 180, true),
    comment: text(raw.contact.comment || '', 2000), budget: text(raw.contact.budget || '', 100), deadline: text(raw.contact.deadline || '', 100), consent: true };
  requireThat(contact.contact.length >= 3, 'Укажите телефон, email или контакт в мессенджере.');
  const template = templateContract.find(t => t.id === raw.template?.id && t.version === raw.template?.version);
  requireThat(template, 'Версия дизайна изменилась. Обновите каталог перед отправкой.', 409);
  const project = structuredClone(raw.project);
  object(project, ['schemaVersion','id','templateId','name','createdAt','updatedAt','activePageId','theme','pages','assets','settings']);
  requireThat(project.schemaVersion === 1 && project.templateId === template.id && assetPattern.test(project.id));
  text(project.name, 200, true);
  requireThat(['createdAt','updatedAt'].every(k => typeof project[k] === 'string' && Number.isFinite(Date.parse(project[k]))));
  requireThat(Array.isArray(project.assets) && project.assets.length <= 20 && Array.isArray(raw.images) && raw.images.length === project.assets.length);
  const images = raw.images.map(image => {
    object(image, ['id','size','type','sha256']);
    requireThat(assetPattern.test(image.id) && /^[a-f0-9]{64}$/.test(image.sha256));
    requireThat(Number.isInteger(image.size) && image.size > 0 && image.size <= MAX_IMAGE_BYTES, 'Одна фотография для отправки должна быть не больше 3 МБ.', 413);
    requireThat(['image/jpeg','image/png','image/webp','image/avif'].includes(image.type));
    return image;
  });
  const ids = new Set(images.map(a => a.id));
  requireThat(ids.size === images.length && images.reduce((s,a) => s+a.size,0) <= MAX_TOTAL_BYTES);
  project.assets = project.assets.map(a => {
    const image = images.find(i => i.id === a.id);
    requireThat(image && a.projectId === project.id);
    return { id: a.id, projectId: project.id, name: text(a.name, 180, true), type: image.type, size: image.size,
      alt: text(a.alt || '', 500), focalPoint: {x:Math.max(0,Math.min(100,Number(a.focalPoint?.x)||50)),y:Math.max(0,Math.min(100,Number(a.focalPoint?.y)||50))}, createdAt: typeof a.createdAt==='string' && Number.isFinite(Date.parse(a.createdAt)) ? a.createdAt : project.createdAt };
  });
  object(project.settings, ['defaultBreakpoint','language','catalogCustomizer']);
  requireThat(['desktop','tablet','mobile'].includes(project.settings.defaultBreakpoint) && project.settings.language === 'ru');
  object(project.settings.catalogCustomizer, ['version','templateVersion','palette','mode']);
  const settings = project.settings.catalogCustomizer;
  requireThat(settings.version === 1 && settings.templateVersion === template.version && ['original','ocean','berry','forest','sand'].includes(settings.palette || 'original') && ['light','dark'].includes(settings.mode || 'light'));
  const base = template.project;
  object(project.theme, Object.keys(base.theme));
  object(project.theme.colors, Object.keys(base.theme.colors));
  requireThat(Object.keys(base.theme.colors).every(key => /^#[a-f0-9]{6}$/i.test(project.theme.colors[key] || '')));
  requireThat(template.typography.some(font => equal(font, project.theme.typography)));
  for (const key of ['contentWidths','spacing','shadows']) requireThat(equal(project.theme[key],base.theme[key]));
  requireThat(Array.isArray(project.theme.radii) && project.theme.radii.length === 6 && project.theme.radii.every(n => Number.isInteger(n) && n >= 0 && n <= 32));
  requireThat(['solid','outline','soft'].includes(project.theme.buttonPreset));
  requireThat(Array.isArray(project.pages) && project.pages.length === 1);
  const page = project.pages[0], originalPage = base.pages[0];
  object(page, Object.keys(originalPage));
  requireThat(assetPattern.test(page.id) && project.activePageId === page.id && page.isHome === true && page.slug === '' && page.noindex === true && page.order === 0);
  for (const key of ['name','title','metaDescription']) text(page[key], 1000);
  object(page.data, ['content','root']);
  object(page.data.root, ['props']);
  requireThat(equal(page.data.root.props, originalPage.data.root.props));
  const original = originalPage.data.content;
  requireThat(Array.isArray(page.data.content) && page.data.content.length === original.length);
  requireThat(new Set(page.data.content.map(b => b.props?.id)).size === original.length);
  const media = new Set(JSON.stringify(base).match(/\/(?:template-assets|images)\/[a-zA-Z0-9/_-]+\.(?:webp|avif|png|jpe?g)/g) || []);
  page.data.content.forEach((block, index) => {
    object(block, ['type','props']);
    const source = original.find(b => b.props.id === block.props?.id && b.type === block.type);
    requireThat(source && (movable.has(block.type) || original[index].props.id === block.props.id));
    validateProps(block.props, source.props, block.type, media, ids);
  });
  return { source: 'template-catalog', project, images, contact,
    template: {id:template.id,version:template.version,name:template.name,slug:template.slug},
    package: structuredClone(template.package),
    visitorId: /^SV-[A-F0-9]{6}$/i.test(raw.visitorId || '') ? raw.visitorId : '',
    visitorSessionId: /^session-(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/i.test(raw.visitorSessionId || '') ? raw.visitorSessionId : '',
    sourceTag: /^[a-z0-9][a-z0-9_-]{0,63}$/i.test(raw.sourceTag || '') ? raw.sourceTag.toLowerCase() : '' };
}
