export type CmsRecord = {
  id?: string;
  order?: number;
  isActive?: boolean | string | number;
};

export type ServiceItem = CmsRecord & {
  title: string;
  category?: string;
  shortTitle?: string;
  slug?: string;
  path?: string;
  shortDescription?: string;
  fullDescription?: string;
  priceText?: string;
  duration?: string;
  format?: string;
  buttonText?: string;
  link?: string;
  badge?: string;
  tags?: string[] | string;
  isPopular?: boolean | string | number;
  showOnHome?: boolean | string | number;
  lead?: string;
  description?: string;
  bullets?: string[] | string;
  outcome?: string;
  icon?: string;
};

export type PackageItem = CmsRecord & {
  groupTitle?: string;
  group?: string;
  category?: string;
  groupOrder?: number;
  groupNote?: string;
  note?: string;
  title?: string;
  name?: string;
  price?: string;
  isAccent?: boolean;
};

export type CaseItem = CmsRecord & {
  title: string;
  category?: string;
  description?: string;
  problem?: string;
  solution?: string;
  result?: string;
  date?: string;
  tags?: string[] | string;
  icon?: string;
};

export type PromoItem = CmsRecord & {
  title: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  imageUrl?: string;
};

export type ReviewItem = CmsRecord & {
  name: string;
  text?: string;
  service?: string;
  photoUrl?: string;
  reviewImageUrl?: string;
};

export type FaqItem = CmsRecord & {
  question: string;
  answer?: string;
};

export type SiteSettings = {
  name?: string;
  domain?: string;
  location?: string;
  tagline?: string;
  description?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  telegramUsername?: string;
  telegramUrl?: string;
  whatsappUrl?: string;
  whatsappSecondaryUrl?: string;
  phoneUrl?: string;
  smsUrl?: string;
  phones?: string[] | string;
  statusTitle?: string;
  statusText?: string;
  statusType?: 'available' | 'busy' | 'queue' | 'urgent' | 'offline' | string;
};

export type ClientTemplate = CmsRecord & {
  title: string;
  description?: string;
  serviceSlug?: string;
  fields?: string[] | string;
};

export type PublicSiteData = {
  settings?: SiteSettings;
  services?: ServiceItem[];
  packages?: PackageItem[];
  cases?: CaseItem[];
  promos?: PromoItem[];
  reviews?: ReviewItem[];
  faq?: FaqItem[];
};
