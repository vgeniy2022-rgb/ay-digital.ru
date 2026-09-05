import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { EditorialPhoto } from '../components/EditorialPhoto';
import { PageHero } from '../components/PageHero';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { AdminWebsiteSection, AgreementSection, LegalPreparationSection } from '../components/SalesSections';
import { ServiceCard } from '../components/ServiceCard';
import { SeoHead } from '../components/SeoHead';
import { absoluteUrl, siteConfig } from '../config/site';
import { pageMeta } from '../data/pageMeta';
import { localSeoLinks } from '../data/localSeoLinks';
import { getServiceCategoryMedia } from '../data/editorialMedia';
import { useSiteData } from '../hooks/useSiteData';
import { Link } from 'react-router-dom';

const categoryOrder = [
  'Сайты и админки',
  'Приложения и прототипы',
  'Презентации',
  'Компьютеры и ноутбуки',
  'Телефоны и перенос данных',
  'ПК и техника',
  'Базовая подготовка сайта к заявкам',
];

const categoryLabels: Record<string, string> = {
  'Сайты и админки': 'Сайты и управление контентом',
  'Приложения и прототипы': 'Мобильные приложения и цифровые продукты',
};

const commercialDirections = [
  { title: 'Сайт для бизнеса', description: 'Многостраничный сайт компании с услугами, кейсами, ценами и понятным путём до обращения.', href: '/business-website-development' },
  { title: 'Лендинг', description: 'Одностраничный сайт под конкретную услугу, продукт, мероприятие или рекламную кампанию.', href: '/landing-development' },
  { title: 'Сайт-каталог', description: 'Категории, карточки, поиск, фильтры, документы и заявки без обязательной онлайн-оплаты.', href: '/catalog-website-development' },
  { title: 'Интернет-магазин', description: 'Каталог товаров, корзина, оформление заказа и согласованное управление витриной.', href: '/online-store-development' },
  { title: 'Веб-приложение', description: 'Личный кабинет, онлайн-сервис, база данных, роли пользователей и интеграции.', href: '/web-application-development' },
  { title: 'Система управления', description: 'Сайт, на котором владелец самостоятельно обновляет согласованные тексты, цены и фотографии.', href: '/website-admin-vladivostok' },
  { title: 'Мобильное приложение', description: 'Разработка продукта для iOS и Android: от первой версии до сервиса для бизнеса.', href: '/mobile-apps' },
  { title: 'Цены на сайты', description: 'Актуальные пакеты и стартовая стоимость из единой системы цен SITEVL.', href: '/prices/websites' },
] as const;

function createServicesSchema(services: ReturnType<typeof useSiteData>['data']['services']) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Услуги SITEVL',
    url: absoluteUrl('/services'),
    itemListElement: services.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: service.title,
        serviceType: service.category,
        description: service.description || service.lead,
        url: absoluteUrl(service.path),
        provider: {
          '@type': 'Person',
          name: siteConfig.specialistName,
          telephone: siteConfig.phone,
        },
        areaServed: {
          '@type': 'City',
          name: siteConfig.city,
        },
      },
    })),
  };
}

export function ServicesPage() {
  const { data, isLoading } = useSiteData();
  const { services } = data;
  const groupedServices = categoryOrder
    .map((category) => ({
      category,
      items: services.filter((service) => service.category === category),
    }))
    .filter((group) => group.items.length);
  const uncategorizedServices = services.filter((service) => !service.category || !categoryOrder.includes(service.category));

  return (
    <PageTransition>
      <SeoHead structuredData={createServicesSchema(services)} />
      <PageHero {...pageMeta.services} />
      <section className="pb-12 sm:pb-16">
        <Container>
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Цифровые продукты</p>
            <h2 className="mt-3 max-w-4xl text-3xl font-extrabold leading-tight sm:text-5xl">Выберите формат под задачу бизнеса</h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted">
              На страницах направлений собраны состав работы, ограничения, примеры подходящих задач и ссылки на актуальные цены.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {commercialDirections.map((item, index) => (
              <Reveal className="h-full" delay={index * 0.03} key={item.href}>
                <Link className="group flex h-full flex-col rounded-premium border border-line bg-white/84 p-6 shadow-glass transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-soft" to={item.href}>
                  <h3 className="text-xl font-extrabold leading-tight text-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
                  <span className="mt-auto pt-5 text-sm font-extrabold text-accent transition group-hover:text-ink">Подробнее →</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      <section className="pb-12">
        <Container>
          <Reveal>
            <div className="rounded-premium border border-line bg-slate-50 p-6 shadow-glass">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Локальные услуги</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight">Популярные задачи во Владивостоке</h2>
              <div className="mt-5 flex flex-wrap gap-2">
                {localSeoLinks.map((item) => (
                  <Link className="rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:border-slate-300" to={item.href} key={item.href}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
      <section className="pb-16">
        <Container>
          {services.length ? (
            <div className="grid gap-14 lg:gap-16" aria-busy={isLoading}>
              {[...groupedServices, ...(uncategorizedServices.length ? [{ category: 'Другие услуги', items: uncategorizedServices }] : [])].map((group) => (
                <section key={group.category}>
                  <Reveal>
                    <div className="mb-6 grid gap-5 lg:grid-cols-[1fr_340px] lg:items-end">
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Категория</p>
                        <h2 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">{categoryLabels[group.category] || group.category}</h2>
                      </div>
                      <EditorialPhoto
                        media={getServiceCategoryMedia(group.category)}
                        aspect="wide"
                        className="max-h-[190px] shadow-glass"
                        caption={`${group.items.length} услуг в направлении`}
                      />
                    </div>
                  </Reveal>
                  <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-6">
                    {group.items.map((service, index) => {
                      const remainder = group.items.length % 3;
                      const lastRowPosition = remainder === 1 && index === group.items.length - 1
                        ? 'xl:col-start-3'
                        : remainder === 2 && index === group.items.length - 2
                          ? 'xl:col-start-2'
                          : '';

                      return (
                        <Reveal className={`h-full xl:col-span-2 ${lastRowPosition}`} delay={index * 0.04} key={`${group.category}-${service.slug}`}>
                          <ServiceCard service={service} />
                        </Reveal>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="rounded-premium border border-line bg-white/82 p-8 text-center text-muted shadow-glass">
              Раздел услуг сейчас обновляется.
            </div>
          )}
        </Container>
      </section>
      <AdminWebsiteSection />
      <LegalPreparationSection />
      <AgreementSection />
      <CallToAction />
    </PageTransition>
  );
}
