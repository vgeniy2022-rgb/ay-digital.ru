import {
  ArrowRight,
  Check,
  Globe2,
  LayoutDashboard,
  MessageCircle,
  MoveUpRight,
  Settings2,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ButtonLink } from '../components/ButtonLink';
import { CallToAction } from '../components/CallToAction';
import { MobileAppVisual, WebsiteProductVisual } from '../components/CommercialVisuals';
import { Container } from '../components/Container';
import { EditorialPhoto } from '../components/EditorialPhoto';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { SpecialistStatus } from '../components/SpecialistStatus';
import { CasePreviewCard } from '../components/TrustBlocks';
import { featuredCases } from '../data/cases';
import { editorialMedia } from '../data/editorialMedia';
import { useSiteData } from '../hooks/useSiteData';
import '../styles/home.css';

const commercialDirections = [
  {
    number: '01',
    eyebrow: 'САЙТЫ',
    title: 'Разработка сайтов',
    subtitle: 'Для бизнеса, услуг и цифровых продуктов',
    text: 'Профессиональный сайт с понятной структурой, адаптацией под устройства и продуманным путём до обращения.',
    price: 'от 19 900 ₽',
    href: '/website-development-vladivostok',
    visual: 'websites' as const,
    icon: Globe2,
  },
  {
    number: '02',
    eyebrow: 'МОБИЛЬНЫЕ ПРИЛОЖЕНИЯ',
    title: 'Мобильные приложения',
    subtitle: 'iOS и Android',
    text: 'Разработка мобильных продуктов для бизнеса, сервисов и собственных проектов — от первой версии до запуска.',
    price: 'от 49 900 ₽',
    href: '/mobile-apps',
    visual: 'mobile-apps' as const,
    icon: Smartphone,
  },
];

const processSteps = [
  ['Знакомство', 'Вы рассказываете о задаче, клиентах и том, что сайт должен изменить.'],
  ['Структура', 'Собираю страницы и смысловые блоки, чтобы человек быстро понял предложение.'],
  ['Визуальная система', 'Подбираю типографику, ритм, фотографии и интерфейсные правила проекта.'],
  ['Разработка', 'Собираю адаптивный интерфейс, анимации и нужные функции.'],
  ['Проверка', 'Тестирую desktop и мобильную версию, формы, ссылки, скорость и SEO-основу.'],
  ['Запуск', 'Публикую сайт и объясняю, как обновлять его и что развивать дальше.'],
];

const capabilityItems = [
  'Лендинг под конкретное предложение',
  'Многостраничный сайт компании',
  'Самостоятельное управление контентом',
  'Каталог услуг или товаров',
  'Формы, Telegram и WhatsApp',
  'Базовая SEO-подготовка',
];

export function HomePage() {
  const { data } = useSiteData();
  const { faq, homeHero, quickStats, reviews, site } = data;

  return (
    <PageTransition>
      <section className="home-cinematic-hero">
        <img
          className="home-cinematic-hero__image"
          src={editorialMedia.homeCollaboration.src}
          alt="Рабочее обсуждение структуры и интерфейса нового сайта"
          width={1600}
          height={1067}
          loading="eager"
          decoding="async"
        />
        <div className="home-cinematic-hero__shade" />
        <Container className="home-cinematic-hero__content">
          <Reveal>
            <p className="home-cinematic-hero__eyebrow">SITEVL · Владивосток</p>
            <h1>Создаю сайты и цифровые продукты для бизнеса</h1>
            <p className="home-cinematic-hero__lead">{homeHero.description}</p>
            <div className="home-cinematic-hero__actions">
              <ButtonLink className="home-cinematic-hero__action home-cinematic-hero__action--primary" to="/website-development-vladivostok">Обсудить проект</ButtonLink>
              <ButtonLink className="home-cinematic-hero__action home-cinematic-hero__action--ai" to="/ai-website" variant="secondary">Создать AI-концепцию</ButtonLink>
              <ButtonLink className="home-cinematic-hero__action home-cinematic-hero__action--works" to="/cases" variant="secondary" aria-label="Смотреть работы">
                <span className="home-cinematic-hero__works-label home-cinematic-hero__works-label--desktop">Смотреть работы</span>
                <span className="home-cinematic-hero__works-label home-cinematic-hero__works-label--mobile">Работы</span>
              </ButtonLink>
              <a className="home-cinematic-hero__action home-cinematic-hero__telegram" href={site.telegramUrl} target="_blank" rel="noreferrer">
                <MessageCircle aria-hidden="true" /> Telegram
              </a>
            </div>
            <div className="home-cinematic-hero__status"><SpecialistStatus /></div>
          </Reveal>
        </Container>
        <Container className="home-cinematic-hero__facts">
          {quickStats.slice(0, 3).map((item) => (
            <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>
          ))}
        </Container>
      </section>

      <section className="home-editorial-section home-editorial-section--services">
        <Container>
          <Reveal className="home-section-intro">
            <div>
              <p className="home-kicker">Что я создаю</p>
              <h2>Два направления. Один продуктовый подход.</h2>
            </div>
            <p>Проектирую сайты и мобильные приложения как рабочие цифровые продукты: с понятным сценарием, аккуратным интерфейсом и реалистичным планом запуска.</p>
          </Reveal>
          <div className="home-service-grid">
            {commercialDirections.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal delay={index * 0.06} key={item.title}>
                  <motion.article className="home-service-card" whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}>
                    <div className="home-service-card__visual">
                      {item.visual === 'websites' ? <WebsiteProductVisual compact /> : <MobileAppVisual compact />}
                    </div>
                    <div className="home-service-card__body">
                      <div className="home-service-card__meta"><span>{item.number}</span><Icon aria-hidden="true" /></div>
                      <small className="home-service-card__eyebrow">{item.eyebrow}</small>
                      <h3>{item.title}</h3>
                      <strong className="home-service-card__subtitle">{item.subtitle}</strong>
                      <p>{item.text}</p>
                      <div className="home-service-card__footer">
                        <strong>{item.price}</strong>
                        <Link to={item.href}>Подробнее <ArrowRight aria-hidden="true" /></Link>
                      </div>
                    </div>
                  </motion.article>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="home-editorial-section home-capabilities">
        <Container>
          <Reveal className="home-capabilities__grid">
            <div>
              <p className="home-kicker">Сайт под задачу</p>
              <h2>Не шаблон ради шаблона, а инструмент для реальной задачи</h2>
              <p>Показываю услуги, цены, реальные работы и следующий шаг. Если информация меняется регулярно, добавляю систему управления контентом.</p>
              <div className="home-capabilities__list">
                {capabilityItems.map((item) => <span key={item}><Check aria-hidden="true" />{item}</span>)}
              </div>
              <ButtonLink to="/website-development-vladivostok" variant="secondary">Как создаётся сайт</ButtonLink>
            </div>
            <div className="home-capabilities__visual">
              <EditorialPhoto media={editorialMedia.webStudioCapture} aspect="landscape" priority />
              <motion.div className="home-capabilities__floating" animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
                <Settings2 aria-hidden="true" />
                <strong>Контент под контролем</strong>
                <span>Услуги · цены · фото · акции</span>
              </motion.div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="home-editorial-section home-projects">
        <Container>
          <Reveal className="home-section-intro home-section-intro--light">
            <div><p className="home-kicker">Проекты</p><h2>Показываю не только финальный экран, но и логику внутри</h2></div>
            <ButtonLink to="/cases" variant="secondary">Все кейсы</ButtonLink>
          </Reveal>
          <div className="home-project-mosaic">
            {featuredCases.slice(0, 4).map((item, index) => (
              <Reveal className={index === 0 ? 'home-project-mosaic__lead' : ''} delay={index * 0.05} key={item.slug}>
                <CasePreviewCard item={item} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="home-editorial-section home-process">
        <Container>
          <Reveal className="home-section-intro">
            <div><p className="home-kicker">От идеи до результата</p><h2>Понятный процесс, в котором видно, что происходит</h2></div>
            <p>До начала работы согласуем задачу, объём и стоимость. На каждом этапе есть конкретный результат, который можно посмотреть и обсудить.</p>
          </Reveal>
          <div className="home-process__grid">
            {processSteps.map(([title, text], index) => (
              <Reveal delay={index * 0.05} key={title}>
                <article><span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="home-editorial-section home-lab-showcase">
        <Container>
          <Reveal className="home-lab-showcase__intro">
            <p className="home-kicker">SITEVL LAB</p>
            <h2>Не просто рассказываю об интерфейсах. Даю их попробовать.</h2>
            <p>Откройте цельную экспериментальную среду с конструктором, физикой, виртуальными системами и бесконечным холстом.</p>
          </Reveal>
          <div className="home-lab-showcase__grid">
            <Link to="/lab" className="home-lab-product">
              <div><span><LayoutDashboard /></span><small>ОТОБРАННЫЕ ВЕБ-ЭКСПЕРИМЕНТЫ</small><h3>Исследуйте возможности браузера</h3><p>SITEVL Studio, физическая песочница, Modern OS, ретро-компьютер и бесконечный холст в одной среде.</p></div>
              <MoveUpRight aria-hidden="true" />
            </Link>
            <Link to="/lab/builder" className="home-lab-product home-lab-product--blue">
              <div><span><Sparkles /></span><small>КОНСТРУКТОР ЛЕНДИНГА</small><h3>Соберите свой первый экран</h3><p>Настройте содержание, стиль и блоки, а затем сохраните снимок получившегося сайта.</p></div>
              <MoveUpRight aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>

      {reviews.length ? (
        <section className="home-editorial-section">
          <Container>
            <Reveal className="home-section-intro"><div><p className="home-kicker">Отзывы</p><h2>Что замечают после совместной работы</h2></div></Reveal>
            <div className="home-review-grid">
              {reviews.slice(0, 3).map((review, index) => (
                <Reveal delay={index * 0.05} key={`${review.name}-${index}`}>
                  <article>
                    <div className="home-review-grid__person">
                      {review.photoUrl ? <img src={review.photoUrl} alt={`Фото клиента ${review.name}`} loading="lazy" decoding="async" /> : <span>{review.name.slice(0, 1)}</span>}
                      <div><h3>{review.name}</h3><small>{review.service}</small></div>
                    </div>
                    <p>{review.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {faq.length ? (
        <section className="home-editorial-section home-faq">
          <Container>
            <Reveal className="home-section-intro"><div><p className="home-kicker">FAQ</p><h2>Перед началом проекта</h2></div></Reveal>
            <div className="home-faq__grid">
              {faq.slice(0, 6).map((item, index) => (
                <Reveal delay={index * 0.03} key={`${item.question}-${index}`}>
                  <article><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{item.question}</h3><p>{item.answer}</p></div></article>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <CallToAction />
    </PageTransition>
  );
}
