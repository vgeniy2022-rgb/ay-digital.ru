import type { ProjectCase } from './cases';

export const caseDrafts: ProjectCase[] = [
  {
    slug: 'small-business-website-draft',
    path: '/cases/small-business-website-draft',
    title: 'Сайт для специалиста или малого бизнеса',
    shortDescription:
      'Черновик кейса. Для публикации нужны подтверждённые сведения о проекте, составе работ, статусе и разрешении на показ.',
    category: 'Черновик',
    serviceSlug: 'website-development',
    date: '2026-08-05',
    clientType: 'Требует уточнения',
    task: 'Заполнить после подтверждения реального проекта.',
    initialSituation: 'Нужно вручную добавить факты: кто клиент, какая задача, что было реализовано и можно ли показывать проект публично.',
    workCompleted: ['ожидает ручного заполнения'],
    technologies: [],
    challenges: [],
    result: ['не публикуется до подтверждения фактов'],
    images: [],
    imageAlt: 'Черновик кейса без публичных изображений',
    relatedServices: [{ label: 'Создание сайтов', href: '/website-development-vladivostok' }],
    relatedArticles: [{ label: 'Когда бизнесу нужен сайт', href: '/useful/when-business-needs-website' }],
    published: false,
    featured: false,
    seoTitle: 'Черновик кейса сайта для специалиста или малого бизнеса',
    seoDescription: 'Непубличный черновик кейса, который требует ручного подтверждения фактов перед публикацией.',
    draftNote: 'Нужно подтвердить название проекта, статус, состав работ, изображения и разрешение на публикацию.',
  },
];
