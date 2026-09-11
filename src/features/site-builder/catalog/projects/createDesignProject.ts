import { defaultStudioTheme } from '../../schema/defaults';
import type { SiteBuilderProject } from '../../schema/types';
import type { DesignBlockProps, DesignKey } from '../../designs/types';

export type DesignBlock = { [K in keyof DesignBlockProps]: { type: K; props: DesignBlockProps[K] } }[keyof DesignBlockProps];

/** Plain schema-v1 Studio document, editable by the existing Puck config. */
export function createDesignProject(design: DesignKey, name: string, content: DesignBlock[]): SiteBuilderProject {
  const pageId = `design-${design}-home`;
  const rootProps = { title: name, catalogDesign: design };
  return {
    schemaVersion: 1, id: `design-${design}-seed`, templateId: `sitevl-design-${design}`, name,
    createdAt: '2026-09-11T00:00:00.000Z', updatedAt: '2026-09-11T00:00:00.000Z', activePageId: pageId,
    theme: structuredClone(defaultStudioTheme), assets: [], settings: { defaultBreakpoint: 'desktop', language: 'ru' },
    pages: [{ id: pageId, name: 'Главная', slug: '', title: `${name} — демонстрационный дизайн`, metaDescription: 'Учебный сайт SITEVL: без реальных заказов и отправки данных.', noindex: true, isHome: true, order: 0,
      data: { root: { props: rootProps }, content: content.map((block, index) => ({ ...block, props: { ...block.props, id: `${design}-${block.type}-${index}` } })) },
    }],
  };
}
