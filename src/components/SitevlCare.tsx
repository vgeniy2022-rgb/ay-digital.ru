import { Check, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from './Container';
import { Reveal } from './Reveal';
import '../styles/care.css';

type SitevlCareProps = {
  initialDirection?: 'websites' | 'apps';
  compact?: boolean;
};

type CarePlan = {
  name: string;
  monthly: string;
  annual?: string;
  featured?: boolean;
  items: string[];
};

const websitePlans: CarePlan[] = [
  { name: 'Базовый', monthly: '1 490 ₽ / месяц', annual: '14 900 ₽ / год', items: ['контроль работоспособности', 'небольшие изменения текста', 'обновление контактов и цен', 'небольшие правки содержимого'] },
  { name: 'Развитие', monthly: '2 990 ₽ / месяц', annual: '29 900 ₽ / год', featured: true, items: ['всё из Базового', 'акции и замена изображений', 'небольшие новые блоки', 'небольшие визуальные улучшения', 'помощь с развитием содержимого'] },
  { name: 'Приоритет', monthly: '5 990 ₽ / месяц', annual: '59 900 ₽ / год', items: ['всё из Развития', 'приоритет обращений', 'более регулярные небольшие доработки', 'базовый контроль состояния', 'консультации по развитию'] },
];

const appPlans: CarePlan[] = [
  { name: 'Базовое сопровождение', monthly: 'от 2 990 ₽ / месяц', items: ['контроль работы простой версии', 'небольшие изменения содержимого', 'консультации по эксплуатации'] },
  { name: 'Развитие приложения', monthly: 'от 5 990 ₽ / месяц', featured: true, items: ['всё из Базового', 'небольшие доработки', 'обновление содержимого', 'контроль согласованных сценариев'] },
  { name: 'Приоритетное сопровождение', monthly: 'от 9 990 ₽ / месяц', items: ['всё из Развития', 'приоритет обращений', 'более активный план небольших изменений', 'консультации по развитию продукта'] },
];

export function SitevlCare({ initialDirection = 'websites', compact = false }: SitevlCareProps) {
  const [direction, setDirection] = useState(initialDirection);
  const plans = direction === 'websites' ? websitePlans : appPlans;

  return (
    <section className={`care-section ${compact ? 'is-compact' : ''}`} id="sitevl-care">
      <Container>
        <Reveal className="care-heading">
          <div><p>SITEVL CARE</p><h2>Сопровождение после запуска</h2></div>
          <p>После сдачи вы получаете готовый продукт. SITEVL Care подключается только по желанию — обязательной ежемесячной оплаты нет.</p>
        </Reveal>

        <Reveal>
          <div className="care-guarantee"><ShieldCheck /><div><strong>30 дней технической гарантии после запуска — бесплатно</strong><span>Исправляю технические ошибки в реализованном функционале. Новые функции, страницы, дизайн, интеграции и изменение исходного задания в гарантию не входят.</span></div></div>
        </Reveal>

        <div className="care-tabs" role="tablist" aria-label="Направление сопровождения">
          <button type="button" role="tab" aria-selected={direction === 'websites'} className={direction === 'websites' ? 'is-active' : ''} onClick={() => setDirection('websites')}>Сайты</button>
          <button type="button" role="tab" aria-selected={direction === 'apps'} className={direction === 'apps' ? 'is-active' : ''} onClick={() => setDirection('apps')}>Приложения</button>
        </div>

        <div className="care-grid">
          {plans.map((plan, index) => (
            <Reveal delay={index * .04} key={plan.name}>
              <article className={plan.featured ? 'is-featured' : ''}>
                {plan.featured ? <span className="care-badge">Популярный</span> : null}
                <h3>{plan.name}</h3>
                <strong>{plan.monthly}</strong>
                {plan.annual ? <small>или {plan.annual}</small> : null}
                <div>{plan.items.map((item) => <span key={item}><Check />{item}</span>)}</div>
                <Link to={`/brief?projectType=${direction === 'websites' ? 'website' : 'mobile-app'}&care=${encodeURIComponent(plan.name)}`}>Обсудить сопровождение</Link>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal><div className="care-note">
          <strong>{direction === 'websites' ? 'Сайт не привязан к обязательной ежемесячной оплате.' : 'Годовое сопровождение приложения рассчитывается индивидуально.'}</strong>
          <p>Крупные новые функции, новые разделы, полный редизайн и сложные интеграции оцениваются отдельно.</p>
          {direction === 'apps' ? <p>Платные API, SMS и push-провайдеры, серверы, облачное хранение, комиссии App Store / Google Play и сторонние сервисы не включаются автоматически. Новая серверная архитектура и перенос на другой технологический стек рассчитываются отдельно.</p> : null}
        </div></Reveal>
      </Container>
    </section>
  );
}
