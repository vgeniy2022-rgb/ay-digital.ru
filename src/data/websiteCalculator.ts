export type WebsiteProjectTypeId = 'business-card' | 'landing' | 'multipage' | 'admin' | 'catalog' | 'custom';
export type WebsitePageRangeId = 'one' | 'two-five' | 'six-ten' | 'more-ten';

export type WebsiteProjectTypeOption = {
  id: WebsiteProjectTypeId;
  label: string;
  min: number;
  max: number;
  includedFeatures: string[];
  requiresEstimate?: boolean;
};

export type WebsitePageRangeOption = {
  id: WebsitePageRangeId;
  label: string;
  min: number;
  max: number;
  complexity: number;
};

export type WebsiteFeatureOption = {
  id: string;
  label: string;
  min: number;
  max: number;
  complexity: number;
};

export type WebsiteCalculationInput = {
  projectTypeId: WebsiteProjectTypeId;
  pageRangeId: WebsitePageRangeId;
  featureIds: string[];
};

export type WebsiteCalculation = {
  min: number;
  max: number;
  display: string;
  requiresEstimate: boolean;
  projectType: WebsiteProjectTypeOption;
  pageRange: WebsitePageRangeOption;
  selectedFeatures: WebsiteFeatureOption[];
};

export const websiteProjectTypeOptions: WebsiteProjectTypeOption[] = [
  { id: 'business-card', label: 'Сайт-визитка', min: 3_000, max: 15_000, includedFeatures: [] },
  { id: 'landing', label: 'Лендинг', min: 8_000, max: 25_000, includedFeatures: [] },
  { id: 'multipage', label: 'Многостраничный сайт', min: 15_000, max: 35_000, includedFeatures: [] },
  { id: 'admin', label: 'Сайт с админкой', min: 25_000, max: 45_000, includedFeatures: ['admin'] },
  { id: 'catalog', label: 'Каталог', min: 40_000, max: 70_000, includedFeatures: ['admin', 'catalog'] },
  { id: 'custom', label: 'Индивидуальный проект', min: 50_000, max: 90_000, includedFeatures: [], requiresEstimate: true },
];

export const websitePageRangeOptions: WebsitePageRangeOption[] = [
  { id: 'one', label: '1 страница', min: 0, max: 0, complexity: 0 },
  { id: 'two-five', label: '2–5 страниц', min: 3_000, max: 7_000, complexity: 0 },
  { id: 'six-ten', label: '6–10 страниц', min: 7_000, max: 15_000, complexity: 1 },
  { id: 'more-ten', label: '10+ страниц', min: 12_000, max: 25_000, complexity: 2 },
];

export const websiteFeatureOptions: WebsiteFeatureOption[] = [
  { id: 'custom-design', label: 'Индивидуальный дизайн', min: 5_000, max: 12_000, complexity: 1 },
  { id: 'admin', label: 'Админка', min: 10_000, max: 20_000, complexity: 2 },
  { id: 'catalog', label: 'Каталог', min: 15_000, max: 30_000, complexity: 3 },
  { id: 'search', label: 'Поиск', min: 3_000, max: 8_000, complexity: 1 },
  { id: 'filters', label: 'Фильтры', min: 5_000, max: 12_000, complexity: 2 },
  { id: 'forms', label: 'Формы заявок', min: 2_000, max: 5_000, complexity: 1 },
  { id: 'messengers', label: 'Telegram / WhatsApp', min: 0, max: 2_000, complexity: 0 },
  { id: 'database', label: 'База данных', min: 10_000, max: 25_000, complexity: 3 },
  { id: 'account', label: 'Личный кабинет', min: 15_000, max: 35_000, complexity: 4 },
  { id: 'integrations', label: 'API / интеграции', min: 10_000, max: 30_000, complexity: 3 },
  { id: 'animations', label: 'Сложные анимации', min: 5_000, max: 20_000, complexity: 2 },
  { id: 'seo', label: 'Базовая SEO-подготовка', min: 3_000, max: 8_000, complexity: 1 },
  { id: 'content', label: 'Помощь с контентом', min: 3_000, max: 12_000, complexity: 1 },
];

function roundUpToThousand(value: number) {
  return Math.ceil(value / 1_000) * 1_000;
}

function formatRubles(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

export function calculateWebsitePrice(input: WebsiteCalculationInput): WebsiteCalculation {
  const projectType = websiteProjectTypeOptions.find((item) => item.id === input.projectTypeId) ?? websiteProjectTypeOptions[0];
  const pageRange = websitePageRangeOptions.find((item) => item.id === input.pageRangeId) ?? websitePageRangeOptions[0];
  const selectedFeatures = websiteFeatureOptions.filter((item) => input.featureIds.includes(item.id));
  const paidFeatures = selectedFeatures.filter((item) => !projectType.includedFeatures.includes(item.id));

  const min = roundUpToThousand(projectType.min + pageRange.min + paidFeatures.reduce((sum, item) => sum + item.min, 0));
  const max = roundUpToThousand(projectType.max + pageRange.max + paidFeatures.reduce((sum, item) => sum + item.max, 0));
  const complexity = pageRange.complexity + selectedFeatures.reduce((sum, item) => sum + item.complexity, 0);
  const requiresEstimate = Boolean(projectType.requiresEstimate || complexity >= 8 || selectedFeatures.filter((item) => item.complexity >= 3).length >= 3);

  return {
    min,
    max,
    display: requiresEstimate
      ? `от ${formatRubles(Math.max(50_000, min))} ₽ — нужна индивидуальная оценка`
      : `${formatRubles(min)}–${formatRubles(max)} ₽`,
    requiresEstimate,
    projectType,
    pageRange,
    selectedFeatures,
  };
}
