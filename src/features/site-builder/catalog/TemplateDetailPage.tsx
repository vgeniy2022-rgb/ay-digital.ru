import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { findCatalogTemplate, getTemplatePackage, templateNiches, type CatalogTemplate, type LoadedCatalogTemplate } from './catalog';
import { loadTemplateProject } from './projectLoaders';
import './templateCatalog.css';

const TemplatePreview = lazy(() => import('./TemplatePreview').then((module) => ({ default: module.TemplatePreview })));

class PreviewBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <p role="alert">Не удалось открыть предпросмотр. Перезагрузите страницу или вернитесь к каталогу.</p> : this.props.children;
  }
}

export function TemplateDetail({ template }: { template: CatalogTemplate }) {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [searchParams] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState<LoadedCatalogTemplate | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const creating = useRef(false);
  const mounted = useRef(true);
  const customizeRef = useRef<HTMLElement>(null);
  const previewOnly = searchParams.get('view') === 'preview';
  const servicePackage = getTemplatePackage(template);

  useEffect(() => {
    let current = true;
    void loadTemplateProject(template).then((result) => { if (current) { setLoaded(result); setLoadError(false); } }, () => { if (current) setLoadError(true); });
    return () => { current = false; };
  }, [template, attempt]);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    if (hash === '#customize') customizeRef.current?.scrollIntoView({ block: 'center' });
  }, [hash]);

  async function customize() {
    if (creating.current || !loaded) return;
    creating.current = true;
    setBusy(true);
    setError('');
    try {
      // IndexedDB and editor code are loaded only after an explicit user action.
      const { openCatalogDraft } = await import('../customizer/drafts');
      const project = await openCatalogDraft(loaded);
      if (mounted.current) navigate(`/templates/customize/${project.id}`);
    } catch {
      if (mounted.current) setError('Не удалось сохранить копию в этом браузере. Проверьте доступ к локальному хранилищу и попробуйте ещё раз.');
    } finally {
      creating.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  return <div className={`template-catalog${previewOnly ? ' template-catalog--preview' : ''}`}>
    <div className="template-catalog__container">
      <Link className="template-catalog__text-link" to={previewOnly ? `/templates/${template.slug}` : '/templates'}><ArrowLeft size={17} aria-hidden="true" />{previewOnly ? 'Об описании дизайна' : 'Все дизайны'}</Link>
      <header className="template-catalog__detail-heading">
        <span className="template-catalog__eyebrow">Демонстрационный дизайн · {templateNiches[template.niche]} · Версия {template.version}</span>
        <h1>{template.name}</h1><p>{template.description}</p>
      </header>
      {!previewOnly && <div className="template-catalog__details">
        <section><h2>Возможности дизайна</h2><ul className="template-catalog__features">{template.features.map((feature) => <li key={feature}><Check size={18} aria-hidden="true" />{feature}</li>)}</ul>
          <Link className="template-catalog__button" to={`/templates/${template.slug}?view=preview`}>Посмотреть сайт <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </section>
        <section className="template-catalog__package" id="customize" ref={customizeRef} aria-labelledby="template-package-title">
          <h2 id="template-package-title">{servicePackage?.name}</h2><p className="template-catalog__price">{servicePackage?.price}</p>
          <p>Стоимость разработки по действующему прайсу, не цена покупки шаблона. Подключения и публикацию согласуем отдельно.</p>
          <button className="template-catalog__button" type="button" disabled={busy || !loaded} onClick={() => void customize()}>{busy ? 'Создаём вашу копию…' : 'Настроить под себя'}</button>
          <p className="template-catalog__note">Откроется простой настройщик вашей личной копии. Если черновик уже есть в этом браузере, вы продолжите его настройку. Это не заявка и не публикация сайта.</p>
          {error && <p role="alert">{error}</p>}
          <Link className="template-catalog__text-link" to="/prices/websites">Что входит в разработку</Link>
        </section>
      </div>}
      <section className="template-catalog__preview" id="preview" aria-label="Предпросмотр дизайна">
        {loadError ? <p role="alert">Не удалось загрузить дизайн. <button type="button" onClick={() => { setLoadError(false); setAttempt(attempt + 1); }}>Попробовать ещё раз</button></p> : loaded ? <PreviewBoundary><Suspense fallback={<p role="status">Загружаем предпросмотр…</p>}><TemplatePreview template={loaded} expanded={previewOnly} /></Suspense></PreviewBoundary> : <p role="status">Загружаем выбранный дизайн…</p>}
      </section>
      {previewOnly && <Link className="template-catalog__button" to={`/templates/${template.slug}#customize`}>Настроить под себя</Link>}
    </div>
  </div>;
}

export function TemplateDetailPage() {
  const { slug = '' } = useParams();
  const template = findCatalogTemplate(slug);
  if (!template) return <div className="template-catalog"><div className="template-catalog__container"><div className="template-catalog__empty">
    <span className="template-catalog__eyebrow">Дизайн недоступен</span><h1>Такого дизайна пока нет</h1>
    <p>Он ещё не опубликован или ссылка устарела. Доступные демонстрации собраны в каталоге.</p>
    <Link className="template-catalog__button" to="/templates">Вернуться к дизайнам сайтов</Link>
  </div></div></div>;
  return <TemplateDetail key={`${template.id}@${template.version}`} template={template} />;
}
