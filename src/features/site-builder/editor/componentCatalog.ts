export const studioComponentGroups = {
  layout: ['Section', 'Container', 'VerticalStack', 'HorizontalStack', 'Grid', 'Columns', 'Card', 'Spacer', 'Divider'],
  basic: ['Heading', 'RichText', 'Button', 'Image', 'Icon', 'Video', 'Badge', 'List', 'Quote'],
  business: ['Header', 'Hero', 'Services', 'Features', 'Pricing', 'Portfolio', 'Gallery', 'Steps', 'Stats', 'Reviews', 'Team', 'FAQ', 'Contact', 'LeadForm', 'MapPlaceholder', 'Footer'],
} as const;

export const studioComponentNames = [
  ...studioComponentGroups.layout,
  ...studioComponentGroups.basic,
  ...studioComponentGroups.business,
] as const;
