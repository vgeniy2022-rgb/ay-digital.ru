import type { DesignBlockProps, DesignLink } from '../../designs/types';

// Authoring helpers only: output remains the existing Studio schema-v1 document.
export const photo = (name: string) => `/template-assets/photos/${name}.webp`;
export const illustrationNote = 'Иллюстративное фото · не сотрудники, помещение или результат работы демобренда';
export const header = (brand: string, descriptor: string, links: DesignLink[], action = 'Демо-запись') => ({ type: 'DesignHeader' as const, props: { brand, descriptor, links, action } });
export const footer = (brand: string, links: DesignLink[]) => ({ type: 'DesignFooter' as const, props: { brand, links, text: 'Учебная концепция. Название, ассортимент и сценарии созданы для демонстрации дизайна.' } });
export const hero = (props: Omit<DesignBlockProps['DesignHero'], 'caption'>) => ({ type: 'DesignHero' as const, props: { ...props, caption: illustrationNote } });
export const collection = (props: Omit<DesignBlockProps['DesignCollection'], 'filter' | 'action'> & Partial<Pick<DesignBlockProps['DesignCollection'], 'filter' | 'action'>>) => ({ type: 'DesignCollection' as const, props: { filter: false, action: '', ...props } });
export const story = (props: Omit<DesignBlockProps['DesignStory'], 'caption' | 'reverse' | 'points'> & { reverse?: boolean; points: string[] }) => ({ type: 'DesignStory' as const, props: { ...props, reverse: props.reverse ?? false, caption: illustrationNote, points: props.points.map(text => ({ text })) } });
export const faq = (title: string, pairs: [string, string][]) => ({ type: 'DesignFAQ' as const, props: { idAnchor: 'faq', title, items: pairs.map(([question, answer]) => ({ question, answer })) } });
export const contact = (props: { title: string; text: string; options: string[]; action: string; formVariant?: DesignBlockProps['DesignContact']['formVariant'] }) => ({ type: 'DesignContact' as const, props: { ...props, idAnchor: 'contact', eyebrow: 'Попробуйте сценарий', addressNote: 'Демонстрационный проект: реальный адрес, часы работы и контакты не указаны.', options: props.options.map(label => ({ label })) } });
