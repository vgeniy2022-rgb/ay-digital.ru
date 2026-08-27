import { motion } from 'framer-motion';
import { Boxes, Gauge, LayoutDashboard, SearchCheck, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { HowMade, LabFrame, LabHero, LabLink, LabSectionHeading } from '../components/lab/LabPrimitives';
import { ProjectAvailability, ProjectQueue } from '../components/lab/ProjectRoadmap';
import { PageTransition } from '../components/PageTransition';
import { SeoHead } from '../components/SeoHead';

const experiments = [
  {
    title: 'Website Builder',
    text: 'Соберите структуру сайта, добавьте функции, переключите устройство и получите ориентир стоимости.',
    href: '/lab/website-builder',
    icon: LayoutDashboard,
    wide: true,
  },
  {
    title: 'Admin Demo',
    text: 'Измените цену, текст, акцию и состав каталога. Публичный preview обновится без перезагрузки.',
    href: '/lab/admin-demo',
    icon: SlidersHorizontal,
  },
  {
    title: 'Architecture Explorer',
    text: 'Разберите путь данных от пользователя до API, базы, файлов и интерфейса управления.',
    href: '/lab/architecture',
    icon: Boxes,
  },
  {
    title: 'Website Evolution',
    text: 'Один и тот же бизнес-сайт в визуальном языке 2005, 2015 и 2026 годов.',
    href: '/lab/web-evolution',
    icon: Gauge,
  },
  {
    title: 'SEO Visualizer',
    text: 'Путь страницы до индекса, поисковый snippet и реальные показатели текущей структуры SITEVL.',
    href: '/lab/seo',
    icon: SearchCheck,
    wide: true,
  },
];

export function LabPage() {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [accent, setAccent] = useState<'blue' | 'green' | 'graphite'>('blue');

  return (
    <PageTransition>
      <SeoHead
        title="SITEVL LAB — интерактивная лаборатория"
        description="Интерактивные эксперименты SITEVL: конструктор сайта, демо-админка, архитектура, эволюция веба и SEO-визуализатор."
        canonicalPath="/lab"
        noindex
      />
      <LabFrame>
        <LabHero
          backTo=""
          title="SITEVL LAB"
          description="Интерактивные эксперименты, из которых потом появляются реальные интерфейсы. Здесь можно не только прочитать о возможностях сайта, но и попробовать их."
          actions={<a className="lab-button" href="#experiments">Открыть эксперименты</a>}
        />

        <section className="lab-section" id="experiments">
          <div className="lab-shell">
            <LabSectionHeading
              eyebrow="Эксперименты"
              title="Проверить идею прямо в браузере"
              description="Каждый экран либо помогает выбрать формат проекта, либо показывает, как устроена разработка. Данные демо не отправляются на сервер."
            />
            <div className="lab-index-grid">
              {experiments.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.article
                    className={`lab-card lab-index-card ${item.wide ? 'lab-index-card--wide' : ''}`}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ delay: index * 0.04 }}
                    key={item.href}
                  >
                    <span className="lab-index-card__number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="lab-card__icon"><Icon aria-hidden="true" /></span>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    <LabLink to={item.href}>Открыть эксперимент</LabLink>
                  </motion.article>
                );
              })}
            </div>
            <ProjectAvailability />
            <ProjectQueue />
          </div>
        </section>

        <section className="lab-section border-y border-line/70 bg-white/55" id="ui-experiments">
          <div className="lab-shell">
            <LabSectionHeading
              eyebrow="UI Experiments"
              title="Небольшая система, а не статичная картинка"
              description="Измените плотность и акцент интерфейса. Этот локальный пример показывает, как дизайн-система перестраивает сразу несколько связанных элементов."
            />
            <div className="lab-ui-experiment">
              <form className="lab-result-panel" onSubmit={(event) => event.preventDefault()}>
                <fieldset className="lab-fieldset">
                  <legend>Плотность</legend>
                  <div className="lab-choice-grid">
                    {(['comfortable', 'compact'] as const).map((value) => (
                      <button className={`lab-choice ${density === value ? 'is-selected' : ''}`} type="button" onClick={() => setDensity(value)} key={value}>
                        {value === 'comfortable' ? 'Свободная' : 'Компактная'}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="lab-fieldset mt-6">
                  <legend>Акцент</legend>
                  <div className="lab-choice-grid lab-choice-grid--three">
                    {(['blue', 'green', 'graphite'] as const).map((value) => (
                      <button className={`lab-choice ${accent === value ? 'is-selected' : ''}`} type="button" onClick={() => setAccent(value)} key={value}>
                        {value === 'blue' ? 'Синий' : value === 'green' ? 'Зелёный' : 'Графит'}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </form>
              <motion.div className="lab-ui-preview" data-density={density} data-accent={accent} layout aria-label="Интерактивный preview интерфейса">
                <div className="lab-ui-preview__nav" />
                <div className="lab-ui-preview__content">
                  <div className="lab-ui-preview__top" />
                  <div className="lab-ui-preview__cards"><span /><span /><span /></div>
                </div>
              </motion.div>
            </div>
            <HowMade items={[{ label: 'Состояние', value: 'React state' }, { label: 'Анимация', value: 'Framer Motion' }, { label: 'Данные', value: 'только локально' }, { label: 'API', value: 'не используется' }]} />
          </div>
        </section>
      </LabFrame>
    </PageTransition>
  );
}
