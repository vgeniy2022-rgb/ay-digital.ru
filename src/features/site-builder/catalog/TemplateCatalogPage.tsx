import { useState } from 'react';
import { ArrowUpRight, LayoutTemplate, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { filterCatalog, getTemplatePackage, publishedTemplates, templateNiches, type CatalogTemplate } from './catalog';
import './templateCatalog.css';

export function TemplateCard({ template }: { template: CatalogTemplate }) {
  const servicePackage = getTemplatePackage(template);
  return <article className="template-catalog__card">
    <Link to={`/templates/${template.slug}`} aria-label={`Дизайн «${template.name}»: описание и предпросмотр`}>
      <img {...template.cover} loading="lazy" decoding="async" />
    </Link>
    <div className="template-catalog__card-body">
      <span className="template-catalog__eyebrow">{templateNiches[template.niche]} · Демо</span>
      <h2><Link to={`/templates/${template.slug}`}>{template.name}</Link></h2>
      <p>{template.description}</p>
      <p className="template-catalog__price">{servicePackage?.price}<small>Разработка · {servicePackage?.name}</small></p>
      <div className="template-catalog__actions">
        <Link className="template-catalog__button" to={`/templates/${template.slug}?view=preview`}>Посмотреть сайт <ArrowUpRight size={16} aria-hidden="true" /></Link>
        <Link className="template-catalog__button template-catalog__button--secondary" to={`/templates/${template.slug}#customize`}>Настроить под себя</Link>
      </div>
    </div>
  </article>;
}

export function TemplateCatalogPage() {
  const [query, setQuery] = useState('');
  const [niche, setNiche] = useState('');
  const results = filterCatalog(publishedTemplates, query, niche);
  const hasFilter = Boolean(query.trim() || niche);

  return <div className="template-catalog">
    <div className="template-catalog__container">
      <header className="template-catalog__hero">
        <span className="template-catalog__eyebrow">SITEVL / Дизайн и разработка</span>
        <h1>Дизайны сайтов{' '}<span>для вашего бизнеса</span></h1>
        <p>Самостоятельные демонстрационные дизайны. Посмотрите целый сайт, попробуйте его меню и адаптируйте свою копию в простом настройщике. Это примеры интерфейсов, а не сайты действующих компаний.</p>
        <Link className="template-catalog__text-link" to="/prices/websites">Цены на разработку сайтов <ArrowUpRight size={17} aria-hidden="true" /></Link>
      </header>

      <section aria-label="Подбор дизайна">
        <div className="template-catalog__filters">
          <label><span>Поиск дизайна</span><div className="template-catalog__search"><Search size={19} aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Название или задача сайта" maxLength={120} /></div></label>
          <label><span>Сфера бизнеса</span><select value={niche} onChange={(event) => setNiche(event.target.value)}><option value="">Все сферы</option>{Object.entries(templateNiches).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          {hasFilter && <button className="template-catalog__reset" type="button" onClick={() => { setQuery(''); setNiche(''); }}>Сбросить</button>}
        </div>
        <p className="template-catalog__count" role="status">Дизайнов: {results.length}</p>
        {results.length ? <div className="template-catalog__grid">{results.map((template) => <TemplateCard key={template.id} template={template} />)}</div>
          : <div className="template-catalog__empty">
            <div className="template-catalog__empty-icon"><LayoutTemplate size={30} strokeWidth={1.5} aria-hidden="true" /></div>
            <span className="template-catalog__eyebrow">{publishedTemplates.length ? 'Попробуйте другой запрос' : 'Коллекция в подготовке'}</span>
            <h2>{publishedTemplates.length ? 'Подходящих дизайнов пока нет' : 'Хороший дизайн начинается с деталей'}</h2>
            <p>{publishedTemplates.length ? 'Измените сферу бизнеса или сократите поисковый запрос.' : 'Проверяем демонстрации перед публикацией. Здесь появятся только дизайны, которые можно действительно открыть и настроить — без вымышленных примеров.'}</p>
            <div className="template-catalog__actions">
              <Link className="template-catalog__button" to="/cases">Посмотреть реальные кейсы <ArrowUpRight size={17} aria-hidden="true" /></Link>
              <Link className="template-catalog__button template-catalog__button--secondary" to="/brief">Обсудить свой сайт</Link>
            </div>
          </div>}
      </section>

      <section className="template-catalog__steps" aria-label="Как выбрать дизайн">
        <div><span>01 / Выбор</span><h2>По задаче бизнеса</h2><p>Ориентируйтесь на структуру и нужные страницы, а не только на цвет обложки.</p></div>
        <div><span>02 / Настройка</span><h2>Под ваши материалы</h2><p>Тексты, цвета и изображения можно менять в простом настройщике на основе SITEVL Studio.</p></div>
        <div><span>03 / Разработка</span><h2>С понятным бюджетом</h2><p>У каждого дизайна указан пакет из общего прайса. Итоговый объём и запуск согласуем отдельно.</p></div>
      </section>
    </div>
  </div>;
}
