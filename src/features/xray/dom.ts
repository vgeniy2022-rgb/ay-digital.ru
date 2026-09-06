import { sanitizeXRayText } from './sanitize';
import type { XRayLine, XRayManifest, XRayRect, XRaySection, XRaySelection, XRaySourceNode } from './types';

export const PRIVATE_SELECTOR = '[data-xray-private], [data-xray-ui], [data-private], [data-sensitive], form, input, textarea, select, option, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="dialog"], iframe, script, style, noscript, [hidden]';
const IGNORED_TAGS = new Set(['svg', 'path', 'defs', 'symbol', 'use', 'link', 'meta']);
const CSS_PROPERTIES = ['display', 'position', 'width', 'height', 'box-sizing', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'color', 'background-color', 'border-radius', 'gap', 'grid-template-columns', 'align-items', 'justify-content', ...['margin', 'border', 'padding'].flatMap(group => ['top', 'right', 'bottom', 'left'].map(side => `${group}-${side}${group === 'border' ? '-width' : ''}`))];
const EXPLANATIONS: Record<string, string> = {
  h1: 'Главный заголовок страницы. Обычно на странице один основной H1. Здесь показана его реальная строка JSX.',
  h2: 'Заголовок смыслового раздела: помогает ориентироваться в содержании и структуре страницы.',
  h3: 'Заголовок подраздела или карточки внутри более крупного раздела.',
  a: 'Ссылка. React Router меняет внутреннюю страницу без полной перезагрузки. В режиме выбора клик открывает инспектор.',
  button: 'Кнопка выполняет действие. Выключите выбор, чтобы нажать её как обычно.',
  img: 'Реальное изображение. В DATA видны безопасный путь и размеры, но не скрытые адреса и параметры доступа.',
  section: 'Смысловой раздел страницы. Его кодовый слой двигается вместе с этим разделом при прокрутке.',
  article: 'Самостоятельная карточка или материал. Повторяемые карточки могут происходить из одного React-компонента.',
  header: 'Шапка сайта. Навигация и бренд остаются теми же — X-RAY не создаёт копию страницы.',
  footer: 'Подвал сайта с дополнительной навигацией. Контактные значения скрываются в текстовом представлении X-RAY.',
};

export function safeResourcePath(value: string) {
  try {
    const url = new URL(value, 'https://sitevl.tech');
    if (url.origin !== 'https://sitevl.tech') return '[внешний ресурс]';
    if (!/^\/(?:assets|cases|images|media)\//.test(url.pathname)) return '[путь скрыт]';
    return url.pathname.slice(0, 220);
  } catch { return '[путь скрыт]'; }
}
export function safeClassList(element: Element) {
  return Array.from(element.classList).filter(name => !/(?:url\(|token|secret|password|@|https?:|eyJ)/i.test(name)).slice(0, 28).join(' ').slice(0, 520);
}
export function isPrivateElement(element: Element) { return Boolean(element.closest(PRIVATE_SELECTOR)); }
function publicHeadingText(element: Element) {
  let count = 0;
  const pieces: string[] = [];
  const visit = (parent: Element) => {
    if (isPrivateElement(parent) || count++ > 32) return;
    for (const child of parent.childNodes) {
      if (child.nodeType === 3) pieces.push(sanitizeXRayText(child.textContent || '').slice(0, 100));
      else if (child instanceof Element) visit(child);
    }
  };
  visit(element);
  return pieces.join(' ').replace(/\s+/g, ' ').trim().slice(0, 100);
}
export function isEditingTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]'));
}
export function rectOf(element: Element): XRayRect {
  const r = element.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}
export function nodeFor(element: Element, manifest: XRayManifest): XRaySourceNode | undefined {
  const id = element.getAttribute('data-xray-node');
  return id && Object.prototype.hasOwnProperty.call(manifest.nodes, id) ? manifest.nodes[id] : undefined;
}
export function inspectableElement(target: EventTarget | null, root: HTMLElement) {
  if (!(target instanceof Element) || !root.contains(target) || isPrivateElement(target)) return null;
  const element = target.closest<HTMLElement>('h1,h2,h3,h4,p,a,button,img,article,nav,li,section,header,footer,[data-xray-node]');
  return element && !IGNORED_TAGS.has(element.tagName.toLowerCase()) && !isPrivateElement(element) ? element : null;
}
export function describeSelection(element: HTMLElement, sections: XRaySection[], manifest: XRayManifest): XRaySelection {
  const tag = element.tagName.toLowerCase();
  const computed = getComputedStyle(element);
  const data: Record<string, string> = { element: tag, className: safeClassList(element) || '(нет классов)' };
  const role = element.getAttribute('role');
  if (role && /^[a-z-]{1,30}$/.test(role)) data.role = role;
  if (tag === 'img') {
    data.src = safeResourcePath(element.getAttribute('src') || '');
    data.alt = sanitizeXRayText(element.getAttribute('alt') || '').slice(0, 160);
    data.loading = element.getAttribute('loading') === 'lazy' ? 'lazy' : 'eager';
  }
  const classes = safeClassList(element).split(' ').filter(Boolean).slice(0, 2);
  return {
    element, node: nodeFor(element, manifest), sectionId: sections.find(section => section.element === element || section.element.contains(element))?.id,
    rect: rectOf(element), label: `<${tag}${classes.length ? '.' + classes.join('.') : ''}>`,
    styles: Object.fromEntries(CSS_PROPERTIES.map(property => [property, sanitizeXRayText(computed.getPropertyValue(property)).slice(0, 160)])), data,
    explanation: EXPLANATIONS[tag] || 'Элемент настоящего DOM. JSX доступен только для разрешённых компонентов; остальное показано как безопасный HTML, без чтения React-состояния.',
  };
}

export function collectSections(root: HTMLElement, manifest: XRayManifest): XRaySection[] {
  const main = root.querySelector<HTMLElement>('main');
  const sections = main && !isPrivateElement(main) ? [...main.querySelectorAll<HTMLElement>('section')].filter(el => !el.parentElement?.closest('section') && !isPrivateElement(el)) : [];
  if (!sections.length && main && !isPrivateElement(main)) sections.push(main);
  return [...root.querySelectorAll<HTMLElement>(':scope > header'), ...sections, ...root.querySelectorAll<HTMLElement>(':scope > footer')].slice(0, 80).map((element, index) => {
    const node = nodeFor(element, manifest);
    const heading = element.querySelector('h1,h2,h3');
    const title = heading && !isPrivateElement(heading) ? publicHeadingText(heading) : element.tagName.toLowerCase();
    return { id: `section-${index}`, element, rect: rectOf(element), node, title };
  });
}

// Walk individual text nodes, never innerHTML/textContent of a container: private descendants are skipped.
export function domLines(root: Element, selected?: Element, structure = false, manifest?: XRayManifest): XRayLine[] {
  const lines: XRayLine[] = [];
  let budget = 72;
  const push = (text: string, highlighted = false) => { if (budget-- > 0) lines.push({ number: lines.length + 1, text, highlighted }); };
  function walk(element: Element, depth: number) {
    if (budget <= 0 || depth > 5 || isPrivateElement(element) || IGNORED_TAGS.has(element.tagName.toLowerCase())) return;
    const tag = element.tagName.toLowerCase();
    const indent = '  '.repeat(depth);
    const className = safeClassList(element);
    const node = manifest && nodeFor(element, manifest);
    const attributes = className ? ` class="${className}"` : '';
    const leafText = [...element.childNodes].filter(child => child.nodeType === 3).map(child => sanitizeXRayText(child.textContent || '').replace(/\s+/g, ' ').trim()).filter(Boolean).join(' ').slice(0, 150);
    if (structure) push(`${indent}${depth ? '└─ ' : ''}${tag}${node ? ` · ${node.component}` : ''}${className ? ' .' + className.split(' ')[0] : ''}`, element === selected);
    else push(`${indent}<${tag}${attributes}>${leafText}`, element === selected);
    if (depth < 5) [...element.children].slice(0, 14).forEach(child => walk(child, depth + 1));
    if (!structure && !['img', 'br', 'hr'].includes(tag)) push(`${indent}</${tag}>`, element === selected);
  }
  walk(root, 0);
  return lines;
}

export function sourceLines(manifest: XRayManifest, node: XRaySourceNode, selected?: XRaySourceNode, limit = 60) {
  const file = manifest.files.find(item => item.id === node.file);
  if (!file) return [];
  const focus = selected?.file === node.file ? selected : undefined;
  const start = focus ? Math.max(node.start, focus.start - 5) : node.start;
  return file.lines.filter(line => line.number >= start && line.number <= node.end).slice(0, limit)
    .map(line => ({ ...line, highlighted: Boolean(focus && line.number >= focus.start && line.number <= focus.end) }));
}
