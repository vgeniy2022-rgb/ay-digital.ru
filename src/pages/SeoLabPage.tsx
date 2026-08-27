import { motion } from 'framer-motion';
import { Bot, Braces, FileCode2, FileSearch, Link2, ListTree, SearchCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { HowMade, LabFrame, LabHero, LabSectionHeading } from '../components/lab/LabPrimitives';
import { PageTransition } from '../components/PageTransition';
import { SeoHead } from '../components/SeoHead';
import { publishedCases } from '../data/cases';
import { usefulArticles } from '../data/useful';

const seoPipeline = [
  { label: 'SITEVL', text: 'Проект и контент', icon: FileCode2 },
  { label: 'HTML', text: 'Доступная структура страницы', icon: Braces },
  { label: 'sitemap.xml', text: 'Список публичных URL', icon: ListTree },
  { label: 'Crawler', text: 'Поисковый робот читает страницу', icon: Bot },
  { label: 'Индексация', text: 'Страница может попасть в индекс', icon: FileSearch },
  { label: 'Выдача', text: 'Позиция зависит от многих факторов', icon: SearchCheck },
];

function cleanTitle(value: string) {
  return value.trim().replace(/\s+/g, ' ') || 'Название компании';
}

export function SeoLabPage() {
  const [company, setCompany] = useState('Пример');
  const [service, setService] = useState('Ремонт автомобилей');
  const [city, setCity] = useState('Владивосток');
  const [sitemapCount, setSitemapCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/sitemap.xml')
      .then((response) => response.ok ? response.text() : Promise.reject(new Error('Sitemap unavailable')))
      .then((xml) => {
        if (!active) return;
        const documentXml = new DOMParser().parseFromString(xml, 'application/xml');
        setSitemapCount(documentXml.querySelectorAll('url > loc').length);
      })
      .catch(() => {
        if (active) setSitemapCount(null);
      });
    return () => { active = false; };
  }, []);

  const snippet = useMemo(() => {
    const safeCompany = cleanTitle(company);
    const safeService = cleanTitle(service);
    const safeCity = cleanTitle(city);
    return {
      title: `${safeService} в ${safeCity} — ${safeCompany}`,
      url: `example.ru/${safeService.toLowerCase().replace(/[^а-яёa-z0-9]+/gi, '-').replace(/^-|-$/g, '')}`,
      description: `${safeCompany}: ${safeService.toLowerCase()} в ${safeCity}. Условия, стоимость, примеры работ и удобный способ связи.`,
    };
  }, [city, company, service]);

  return (
    <PageTransition>
      <SeoHead title="SEO Visualizer — SITEVL LAB" description="Интерактивное объяснение индексации, sitemap, метаданных и поискового сниппета." canonicalPath="/lab/seo" noindex />
      <LabFrame>
        <LabHero title="Что происходит после публикации сайта?" description="Путь от HTML до поисковой выдачи без обещаний позиции. Индексация — важный технический этап, но не гарантия высокого места." />
        <section className="lab-section">
          <div className="lab-shell">
            <LabSectionHeading eyebrow="SEO pipeline" title="Как поисковая система получает страницу" description="Каждый элемент помогает поисковику понять сайт, но итог зависит также от спроса, конкуренции, качества материалов, ссылок и поведения пользователей." />
            <div className="lab-seo-pipeline">
              {seoPipeline.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.article initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }} key={item.label}>
                    <Icon aria-hidden="true" /><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.label}</strong><p>{item.text}</p>
                  </motion.article>
                );
              })}
            </div>
            <div className="lab-seo-elements">
              {['title', 'description', 'canonical', 'structured data', 'internal links', 'sitemap'].map((item) => <span key={item}><Link2 /> {item}</span>)}
            </div>
          </div>
        </section>

        <section className="lab-section border-y border-line/70 bg-white/60">
          <div className="lab-shell">
            <LabSectionHeading eyebrow="Snippet preview" title="Соберите условный поисковый результат" description="Preview объясняет роль title и description. Он не копирует интерфейс конкретной поисковой системы и не показывает реальную позицию." />
            <div className="lab-seo-snippet-layout">
              <form className="lab-result-panel" onSubmit={(event) => event.preventDefault()}>
                <label className="lab-control"><span>Название компании</span><input value={company} onChange={(event) => setCompany(event.target.value.slice(0, 60))} /></label>
                <label className="lab-control mt-4"><span>Услуга</span><input value={service} onChange={(event) => setService(event.target.value.slice(0, 70))} /></label>
                <label className="lab-control mt-4"><span>Город</span><input value={city} onChange={(event) => setCity(event.target.value.slice(0, 40))} /></label>
              </form>
              <motion.aside className="lab-search-result" layout aria-live="polite">
                <span>{snippet.url}</span>
                <h2>{snippet.title}</h2>
                <p>{snippet.description}</p>
                <small>Условный preview · внешний вид реальной выдачи может отличаться</small>
              </motion.aside>
            </div>
          </div>
        </section>

        <section className="lab-section">
          <div className="lab-shell">
            <LabSectionHeading eyebrow="SITEVL изнутри" title="Только вычисляемые показатели" description="Здесь нет придуманных процентов производительности. Показаны данные, которые можно получить из текущей публичной структуры проекта." />
            <div className="lab-health-grid">
              {sitemapCount !== null ? <article><span>{sitemapCount}</span><strong>URL в sitemap.xml</strong><p>Посчитано из опубликованного файла при открытии страницы.</p></article> : null}
              <article><span>{usefulArticles.length}</span><strong>полезных материалов</strong><p>Посчитано из текущего массива опубликованных статей.</p></article>
              <article><span>{publishedCases.length}</span><strong>публичных кейса</strong><p>Показываются только записи со статусом published.</p></article>
            </div>
            <HowMade items={[{ label: 'Sitemap', value: 'разбор реального XML' }, { label: 'Материалы', value: 'данные проекта' }, { label: 'Баллы', value: 'не выдумываются' }, { label: 'SEO', value: 'без гарантий позиции' }]} />
          </div>
        </section>
      </LabFrame>
    </PageTransition>
  );
}
