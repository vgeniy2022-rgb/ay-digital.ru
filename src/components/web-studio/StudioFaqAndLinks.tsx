import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StudioHeading } from './StudioPrimitives';

export type StudioFaqItem = { question: string; answer: string };

type StudioFaqAndLinksProps = {
  faq: StudioFaqItem[];
  relatedServices: { label: string; href: string }[];
  relatedArticles: { label: string; href: string }[];
};

const websiteDirections = [
  { label: 'Сайт для бизнеса', href: '/business-website-development' },
  { label: 'Разработка лендинга', href: '/landing-development' },
  { label: 'Создание сайта-каталога', href: '/catalog-website-development' },
  { label: 'Разработка интернет-магазина', href: '/online-store-development' },
  { label: 'Веб-приложение и онлайн-сервис', href: '/web-application-development' },
  { label: 'Сайт с системой управления', href: '/website-admin-vladivostok' },
  { label: 'Цены на разработку сайтов', href: '/prices/websites' },
] as const;

function uniqueLinks(items: { label: string; href: string }[]) {
  const paths = new Set<string>();
  return items.filter((item) => {
    if (paths.has(item.href)) return false;
    paths.add(item.href);
    return true;
  });
}

export function StudioFaqAndLinks({ faq, relatedServices, relatedArticles }: StudioFaqAndLinksProps) {
  const serviceLinks = uniqueLinks([...websiteDirections, ...relatedServices]).slice(0, 12);

  return (
    <section className="studio-faq" aria-labelledby="studio-faq-title">
      <div className="studio-shell">
        <StudioHeading
          eyebrow="Перед началом"
          title="Вопросы о создании сайта"
          description="Ответы про стоимость, сроки, материалы, систему управления, публикацию и удалённую работу."
        />
        <div className="studio-faq__grid">
          {faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}<span aria-hidden="true">+</span></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>

        <div className="studio-related">
          <div>
            <h3>Форматы и услуги</h3>
            {serviceLinks.map((item) => (
              <Link to={item.href} key={item.href}>{item.label}<ArrowUpRight aria-hidden="true" /></Link>
            ))}
          </div>
          <div>
            <h3>Полезные материалы</h3>
            {relatedArticles.map((item) => (
              <Link to={item.href} key={item.href}>{item.label}<ArrowUpRight aria-hidden="true" /></Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
