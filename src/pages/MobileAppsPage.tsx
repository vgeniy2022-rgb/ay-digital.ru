import {
  Bell,
  Building2,
  CalendarDays,
  Camera,
  Database,
  Map,
  MessageCircle,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Store,
  Users,
  WalletCards,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ButtonLink } from '../components/ButtonLink';
import { MobileAppVisual } from '../components/CommercialVisuals';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { SitevlCare } from '../components/SitevlCare';
import { SeoHead } from '../components/SeoHead';
import { absoluteUrl, siteConfig } from '../config/site';
import { getPriceDirection } from '../data/priceDirections';
import { useSiteData } from '../hooks/useSiteData';
import '../styles/mobile-apps.css';

const productTypes = [
  ['Приложение компании', 'Услуги, новости, обращения и личный кабинет.', Building2],
  ['Каталог товаров', 'Категории, карточки, поиск и заявки.', Store],
  ['Интернет-магазин', 'Каталог, корзина и оформление заказа.', ShoppingBag],
  ['Запись и бронирование', 'Расписание, свободное время и подтверждения.', CalendarDays],
  ['Программа лояльности', 'Баллы, предложения и история клиента.', WalletCards],
  ['Внутренний инструмент', 'Рабочие сценарии для сотрудников и команды.', Users],
  ['MVP стартапа', 'Первая версия для проверки продукта и сценариев.', Rocket],
  ['Нестандартный сервис', 'Продукт с собственной логикой и интеграциями.', Smartphone],
] as const;

const capabilities = [
  ['Аккаунты', Users],
  ['Push-уведомления', Bell],
  ['Карты', Map],
  ['Каталог', Store],
  ['Запись', CalendarDays],
  ['Оплата', WalletCards],
  ['Камера и медиа', Camera],
  ['Хранение данных', Database],
] as const;

const stages = [
  ['01', 'Задача', 'Определяем аудиторию, цель продукта и границы первой версии.'],
  ['02', 'Прототип', 'Собираем экраны, переходы и основные пользовательские сценарии.'],
  ['03', 'Дизайн', 'Создаём визуальную систему и состояния интерфейса.'],
  ['04', 'Разработка', 'Реализуем продукт и подключаем согласованные возможности.'],
  ['05', 'Тестирование', 'Проверяем сценарии, устройства и пограничные состояния.'],
  ['06', 'Запуск', 'Готовим сборку, материалы и понятный план публикации.'],
  ['07', 'Сопровождение', 'После запуска продукт можно развивать по отдельному плану.'],
] as const;

const faq = [
  ['Что входит в стартовую стоимость?', 'Небольшая первая версия с несколькими основными экранами, навигацией и тестовой сборкой. Точный состав фиксируется после обсуждения.'],
  ['Можно сделать приложение сразу для iOS и Android?', 'Да. Архитектура выбирается под функционал, сроки и требования конкретного продукта; единая кодовая база подходит не каждому проекту.'],
  ['Входит ли серверная часть в стартовую стоимость?', 'Нет. Аккаунты, синхронизация, база данных, система управления и серверная инфраструктура оцениваются отдельно.'],
  ['Вы публикуете приложение в магазинах?', 'Подготовку и сопровождение публикации можно обсудить отдельно. Решение о выпуске зависит от требований App Store и Google Play и аккаунтов владельца продукта.'],
  ['Сколько времени занимает разработка?', 'Срок зависит от количества экранов, платформ, серверной части и интеграций. Сначала фиксируем границы первой версии, затем составляем этапы и календарный план.'],
  ['Можно заказать приложение из другого города?', 'Да. Разработку для Владивостока и других городов можно вести удалённо: обсуждение, прототип, промежуточные сборки и правки передаются онлайн.'],
  ['Кому принадлежат аккаунты и материалы проекта?', 'Аккаунты публикации и сторонних сервисов оформляются на владельца продукта. Состав передаваемых материалов, исходного кода и доступов согласуется до начала разработки.'],
  ['Что происходит после запуска?', 'В течение 30 дней действует бесплатная техническая гарантия на реализованный функционал. Дальнейшее сопровождение SITEVL Care подключается только по желанию.'],
] as const;

const mobilePriceDirection = getPriceDirection('mobile-apps');
const mobileStartingPrice = mobilePriceDirection?.packages[0]?.price || 'по расчёту';
const mobileLowPrice = Number(mobileStartingPrice.match(/\d[\d\s]*/)?.[0].replace(/\s/g, '')) || undefined;

const mobileAppsSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Разработка мобильных приложений для iOS и Android',
  serviceType: 'Разработка мобильных приложений',
  description: 'Разработка мобильных продуктов для бизнеса, сервисов и собственных проектов во Владивостоке и удалённо.',
  url: absoluteUrl('/mobile-apps'),
  provider: { '@type': 'Person', name: siteConfig.specialistName, url: siteConfig.siteUrl },
  areaServed: [
    { '@type': 'City', name: siteConfig.city },
    { '@type': 'Country', name: 'Россия' },
  ],
  offers: mobileLowPrice ? {
    '@type': 'AggregateOffer',
    priceCurrency: 'RUB',
    lowPrice: mobileLowPrice,
    offerCount: mobilePriceDirection?.packages.length,
  } : undefined,
};

const mobileAppsFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map(([question, answer]) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: answer,
    },
  })),
};

export function MobileAppsPage() {
  const { data } = useSiteData();

  return (
    <PageTransition>
      <SeoHead
        title="Разработка мобильных приложений iOS и Android | SITEVL"
        description={`Разработка мобильных приложений для бизнеса на iOS и Android во Владивостоке и удалённо. MVP, серверная часть и запуск — ${mobileStartingPrice}.`}
        canonicalPath="/mobile-apps"
        structuredData={[mobileAppsSchema, mobileAppsFaqSchema]}
      />

      <section className="apps-hero">
        <Container className="apps-hero__grid">
          <Reveal>
            <p className="apps-kicker">SITEVL · МОБИЛЬНЫЕ ПРОДУКТЫ</p>
            <h1>Разработка мобильных приложений для iOS и Android</h1>
            <p className="apps-hero__lead">Создаю приложения для бизнеса на iPhone, iPad и Android во Владивостоке и удалённо — от структуры первой версии до рабочей сборки и плана публикации.</p>
            <div className="apps-hero__price"><small>Стартовая стоимость</small><strong>{mobileStartingPrice}</strong><span>Точная цена зависит от экранов, логики, платформ и интеграций.</span></div>
            <div className="apps-hero__actions">
              <ButtonLink to="/brief?projectType=mobile-app">Обсудить приложение</ButtonLink>
              <ButtonLink to="/prices/mobile-apps" variant="secondary">Смотреть цены</ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={0.08}><MobileAppVisual /></Reveal>
        </Container>
      </section>

      <section className="apps-section apps-section--soft">
        <Container>
          <Reveal className="apps-heading"><p className="apps-kicker">ФОРМАТЫ</p><h2>Что можно разработать</h2><p>Первая версия фокусируется на главном сценарии. Дополнительные возможности подключаются только тогда, когда они действительно нужны продукту.</p></Reveal>
          <div className="apps-product-grid">
            {productTypes.map(([title, text, Icon], index) => <Reveal delay={index * .03} key={title}><article><Icon /><h3>{title}</h3><p>{text}</p></article></Reveal>)}
          </div>
        </Container>
      </section>

      <section className="apps-section apps-platforms">
        <Container>
          <Reveal className="apps-heading"><p className="apps-kicker">ПЛАТФОРМЫ</p><h2>Один продукт — подходящая архитектура</h2></Reveal>
          <div className="apps-platform-grid">
            <Reveal><article><span>iOS</span><h3>iPhone и iPad</h3><p>Нативные интерфейсы и сценарии для экосистемы Apple. Swift и SwiftUI показываются как инструмент реализации, а не как цель проекта.</p><small>Swift · SwiftUI</small></article></Reveal>
            <Reveal delay={.04}><article><span>Android</span><h3>Смартфоны и планшеты</h3><p>Приложение проектируется с учётом разных размеров экранов, поведения платформы и сценариев конкретной аудитории.</p><small>Архитектура под задачу</small></article></Reveal>
            <Reveal delay={.08}><article className="is-accent"><span>iOS + Android</span><h3>Две платформы</h3><p>Общая продуктовая логика и согласованный интерфейс. Решение об общей или отдельной кодовой базе принимается после анализа проекта.</p><small>Без универсальных обещаний</small></article></Reveal>
          </div>
        </Container>
      </section>

      <section className="apps-section apps-section--dark">
        <Container>
          <Reveal className="apps-heading"><p className="apps-kicker">ВОЗМОЖНОСТИ</p><h2>Функции подключаются под сценарий</h2><p>Список показывает возможные направления развития, а не состав базового пакета.</p></Reveal>
          <div className="apps-capability-grid">{capabilities.map(([label, Icon]) => <span key={label}><Icon />{label}</span>)}</div>
          <p className="apps-capability-note"><ShieldCheck />Серверная часть, платные сервисы, публикация в магазинах и сложные интеграции рассчитываются отдельно.</p>
        </Container>
      </section>

      <section className="apps-section">
        <Container>
          <Reveal className="apps-heading"><p className="apps-kicker">ПРОЦЕСС</p><h2>От задачи до запуска</h2></Reveal>
          <div className="apps-stage-grid">{stages.map(([number, title, text], index) => <Reveal delay={index * .03} key={number}><article><span>{number}</span><h3>{title}</h3><p>{text}</p></article></Reveal>)}</div>
        </Container>
      </section>

      <section className="apps-section apps-pricing-teaser">
        <Container>
          <Reveal><div className="apps-pricing-teaser__panel"><div><p className="apps-kicker">СТОИМОСТЬ</p><h2>Первая версия — {mobileStartingPrice}</h2><p>Цена становится точной после согласования экранов, платформы, серверной части и интеграций. Состав и границы первой версии фиксируются до начала разработки.</p></div><div><Link to="/prices/mobile-apps">Все пакеты и цены</Link><Link to="/brief?projectType=mobile-app">Рассчитать проект</Link></div></div></Reveal>
        </Container>
      </section>

      <SitevlCare initialDirection="apps" compact />

      <section className="apps-section apps-faq">
        <Container><Reveal className="apps-heading"><p className="apps-kicker">FAQ</p><h2>Перед началом проекта</h2></Reveal><div className="apps-faq__grid">{faq.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></Container>
      </section>

      <section className="apps-section apps-final">
        <Container><Reveal><div><p className="apps-kicker">ОБСУДИТЬ ПРОДУКТ</p><h2>Опишите идею обычными словами</h2><p>Я помогу выделить первую версию, выбрать платформу и определить следующий шаг без обязательства сразу заказывать разработку.</p><div><ButtonLink to="/brief?projectType=mobile-app">Пройти Brief</ButtonLink><ButtonLink href={data.site.telegramUrl} variant="secondary" showArrow={false}><MessageCircle />Telegram</ButtonLink></div></div></Reveal></Container>
      </section>
    </PageTransition>
  );
}
