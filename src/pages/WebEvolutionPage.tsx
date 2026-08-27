import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { HowMade, LabFrame, LabHero, LabSectionHeading } from '../components/lab/LabPrimitives';
import { PageTransition } from '../components/PageTransition';
import { SeoHead } from '../components/SeoHead';

type Era = '2005' | '2015' | '2026';

const eraFacts: Record<Era, string[]> = {
  '2005': ['фиксированная ширина', 'табличная композиция', 'минимум адаптивности'],
  '2015': ['flat design', 'responsive layout', 'hero и карточки'],
  '2026': ['адаптивная типографика', 'motion и состояния', 'админка, интеграции и SEO'],
};

function EraPreview({ era }: { era: Era }) {
  if (era === '2005') {
    return (
      <div className="lab-era lab-era--2005">
        <header><strong>ООО «Владивосток Сервис»</strong><small>Добро пожаловать на наш сайт!</small></header>
        <nav>ГЛАВНАЯ | УСЛУГИ | ПРАЙС | КОНТАКТЫ</nav>
        <main><aside>Новости<br />О компании<br />Гостевая книга</aside><article><h2>Наши услуги</h2><p>Мы оказываем услуги для жителей города Владивостока.</p><button type="button">Подробнее &gt;&gt;</button></article></main>
        <footer>© 2005 · Все права защищены</footer>
      </div>
    );
  }

  if (era === '2015') {
    return (
      <div className="lab-era lab-era--2015">
        <header><strong>VL SERVICE</strong><nav>Услуги Портфолио Контакты</nav></header>
        <section><h2>Решения для вашего бизнеса</h2><p>Современный сервис во Владивостоке</p><button type="button">Узнать больше</button></section>
        <main>{['Услуги', 'Команда', 'Проекты'].map((item) => <article key={item}><i /><strong>{item}</strong><p>Короткое описание раздела</p></article>)}</main>
      </div>
    );
  }

  return (
    <div className="lab-era lab-era--2026">
      <header><strong>SITE / VL</strong><nav>Услуги Кейсы Процесс Контакты</nav><button type="button">Обсудить</button></header>
      <section><div><small>Владивосток · 2026</small><h2>Система, а не просто страница</h2><p>Контент, заявки и данные соединены в понятном интерфейсе.</p><button type="button">Открыть проект</button></div><aside><span /><span /><span /></aside></section>
      <main>{['ADMIN', 'API', 'SEO', 'MOTION'].map((item) => <article key={item}><strong>{item}</strong><i /></article>)}</main>
    </div>
  );
}

export function WebEvolutionPage() {
  const [era, setEra] = useState<Era>('2026');

  return (
    <PageTransition>
      <SeoHead title="Website Evolution — SITEVL LAB" description="Интерактивное сравнение веб-интерфейсов 2005, 2015 и 2026 годов." canonicalPath="/lab/web-evolution" noindex />
      <LabFrame>
        <LabHero title="Один бизнес. Три эпохи интернета." description="Условный бизнес остаётся тем же. Меняется способ объяснять предложение, работать на телефоне и связывать интерфейс с данными." />
        <section className="lab-section">
          <div className="lab-shell">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <LabSectionHeading eyebrow="Website evolution" title="Переключите эпоху" description="Это авторские демонстрационные интерфейсы, не копии реальных сайтов." />
              <div className="lab-tabs" aria-label="Эпоха сайта">
                {(['2005', '2015', '2026'] as const).map((item) => <button className={era === item ? 'is-active' : ''} type="button" onClick={() => setEra(item)} key={item}>{item}</button>)}
              </div>
            </div>

            <div className="lab-evolution-stage">
              <AnimatePresence mode="wait">
                <motion.div key={era} initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <EraPreview era={era} />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="lab-evolution-facts">
              {eraFacts[era].map((fact, index) => <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} key={fact}>{fact}</motion.span>)}
            </div>
            <HowMade items={[{ label: 'Сцены', value: 'семантический HTML/CSS' }, { label: 'Переключение', value: 'React state' }, { label: 'Переход', value: 'Framer Motion' }, { label: 'Источники', value: 'без копирования сайтов' }]} />
          </div>
        </section>
      </LabFrame>
    </PageTransition>
  );
}
