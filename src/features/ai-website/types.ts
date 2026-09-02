export const aiWebsiteModes = ['quick', 'detailed', 'existing'] as const;
export type AiWebsiteMode = typeof aiWebsiteModes[number];

export const aiWebsiteStyles = ['modern', 'minimal', 'premium', 'technology', 'warm', 'strict', 'bright', 'dark'] as const;
export type AiWebsiteStyle = typeof aiWebsiteStyles[number];

export const aiWebsiteSiteTypes = ['start', 'landing', 'managed', 'business', 'catalog', 'store', 'web-service'] as const;
export type AiWebsiteSiteType = typeof aiWebsiteSiteTypes[number];

export const aiWebsiteSectionTypes = ['hero', 'services', 'advantages', 'about', 'process', 'gallery', 'team', 'catalog', 'pricing', 'reviews', 'faq', 'contacts', 'cta', 'stats', 'features', 'delivery', 'booking', 'map', 'footer'] as const;
export type AiWebsiteSectionType = typeof aiWebsiteSectionTypes[number];

export type AiWebsiteItem = {
  title: string;
  text: string;
  meta?: string;
};

export type AiWebsiteSection = {
  id: string;
  type: AiWebsiteSectionType;
  title: string;
  subtitle?: string;
  items?: AiWebsiteItem[];
  visible: boolean;
};

export type AiWebsiteConcept = {
  version: 1;
  business: {
    name: string;
    type: string;
    city: string;
    audience: string;
    offer: string;
  };
  site: {
    type: AiWebsiteSiteType;
    title: string;
    subtitle: string;
    cta: string;
    secondaryCta: string;
  };
  theme: {
    style: AiWebsiteStyle;
    mode: 'light' | 'dark';
    accent: string;
    background: string;
    surface: string;
    radius: 'compact' | 'medium' | 'large';
    density: 'compact' | 'comfortable' | 'spacious';
  };
  sections: AiWebsiteSection[];
  services: AiWebsiteItem[];
  features: string[];
  faq: Array<{ question: string; answer: string }>;
  contacts: {
    city: string;
    phoneLabel: string;
    emailLabel: string;
  };
  recommendedPackage: AiWebsiteSiteType;
  estimatedComplexity: 'low' | 'medium' | 'high';
  notes: string[];
};

export type AiWebsiteAnswers = {
  business: string;
  city: string;
  offer: string;
  audience: string;
  services: string;
  functions: string;
  style: AiWebsiteStyle | 'auto';
  brandColor: string;
  contacts: string;
  budget: string;
  deadline: string;
  existingUrl: string;
  existingText: string;
};

export type AiWebsiteContact = {
  name: string;
  phone: string;
  telegram: string;
  whatsapp: string;
  email: string;
  notes: string;
  consent: boolean;
};

export type AiWebsiteLeadPayload = {
  sessionId: string;
  conceptId: string;
  source: '/ai-website';
  originalPrompt: string;
  answers: AiWebsiteAnswers;
  generatedConcept: AiWebsiteConcept;
  selectedVariant: string;
  selectedStyle: AiWebsiteStyle;
  recommendedPackage: string;
  estimatedStartingPrice: string;
  budget: string;
  deadline: string;
  requiredFeatures: string[];
  contact: AiWebsiteContact;
};
