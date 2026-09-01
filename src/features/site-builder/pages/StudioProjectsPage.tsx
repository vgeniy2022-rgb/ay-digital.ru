import { lazy, Suspense, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ArrowRight, Copy, FileJson, FolderOpen, Import, LayoutTemplate, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { convertLegacyDraftToProject } from '../schema/migrations';
import { studioProjectRepository } from '../persistence/projectRepository';
import type { ProjectListItem } from '../schema/types';
import { createProjectFromTemplate, studioTemplates } from '../templates/templates';
import { importProjectFile } from '../export/projectExport';
import '../styles/studio.css';

const AiCreateProjectDialog = lazy(() => import('../ai/AiCreateProjectDialog'));

export function StudioProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const legacyAvailable = typeof window !== 'undefined' && Boolean(window.localStorage.getItem('sitevl-landing-builder-v2'));

  const reload = async () => {
    setLoading(true);
    try {
      setProjects(await studioProjectRepository.list());
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Не удалось открыть проекты.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'SITEVL Studio — проекты';
    void reload();
  }, []);

  const create = async (templateId: string) => {
    const project = await studioProjectRepository.create(createProjectFromTemplate(templateId));
    navigate(`/studio/project/${project.id}`);
  };

  const importJson = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const project = await studioProjectRepository.create(await importProjectFile(file));
      navigate(`/studio/project/${project.id}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Не удалось импортировать проект.');
    }
    event.target.value = '';
  };

  const importLegacy = async () => {
    const raw = window.localStorage.getItem('sitevl-landing-builder-v2');
    if (!raw) return;
    try {
      const project = await studioProjectRepository.create(convertLegacyDraftToProject(raw));
      navigate(`/studio/project/${project.id}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Legacy-черновик не удалось преобразовать.');
    }
  };

  return (
    <main className="studio-projects-shell">
      <header className="studio-projects-header">
        <a href="/" className="studio-wordmark">SITEVL <span>Studio</span></a>
        <div className="studio-projects-header__actions">
          <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={importJson} />
          <button className="is-import" type="button" onClick={() => importRef.current?.click()}><Import /> Импорт JSON</button>
          <button className="is-ai" type="button" onClick={() => setShowAi(true)} aria-label="Создать с ИИ"><Sparkles /> Создать с ИИ</button>
          <button className="is-primary" type="button" onClick={() => setShowTemplates(true)} aria-label="Новый проект"><Plus /> Новый проект</button>
        </div>
      </header>

      <section className="studio-projects-intro">
        <div><span>Визуальная среда SITEVL</span><h1>Проекты</h1><p>Создавайте многостраничные сайты, управляйте компонентами и храните работу в браузере без ограничения по времени.</p></div>
        <aside><strong>{projects.length}</strong><span>проектов в IndexedDB</span><small>Автосохранение включено</small></aside>
      </section>

      {notice ? <div className="studio-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')}>Закрыть</button></div> : null}

      {legacyAvailable ? <section className="studio-legacy-card"><div><FileJson /><span><strong>Найден черновик старого конструктора</strong><small>Исходные данные останутся в localStorage после импорта.</small></span></div><button type="button" onClick={importLegacy}>Преобразовать в Studio</button><a href="/lab/builder-legacy">Открыть старую версию</a></section> : null}

      <section className="studio-project-list" aria-busy={loading}>
        <div className="studio-section-title"><div><small>Рабочее пространство</small><h2>Ваши проекты</h2></div><button type="button" onClick={() => setShowTemplates(true)}><LayoutTemplate /> Шаблоны</button></div>
        {loading ? <div className="studio-project-skeleton"><i /><i /><i /></div> : null}
        {!loading && projects.length === 0 ? <div className="studio-empty"><FolderOpen /><h3>Начните с готового шаблона</h3><p>Он создаст настоящий проект со страницами, компонентами и темой.</p><button type="button" onClick={() => setShowTemplates(true)}>Выбрать шаблон <ArrowRight /></button></div> : null}
        <div className="studio-project-grid">
          {projects.map((project) => <article key={project.id}><button className="studio-project-card__open" type="button" onClick={() => navigate(`/studio/project/${project.id}`)}><div className={`studio-project-card__visual studio-template-${project.templateId}`}><span>{project.name.slice(0, 2).toUpperCase()}</span><i /></div><div><small>{project.pageCount} стр. · {new Date(project.updatedAt).toLocaleString('ru-RU')}</small><h3>{project.name}</h3><span>Открыть редактор <ArrowRight /></span></div></button><div className="studio-project-card__actions"><button type="button" onClick={async () => { const copy = await studioProjectRepository.duplicate(project.id); navigate(`/studio/project/${copy.id}`); }}><Copy /> Дублировать</button><button type="button" onClick={async () => { if (!window.confirm(`Удалить проект «${project.name}»?`)) return; await studioProjectRepository.delete(project.id); await reload(); }}><Trash2 /> Удалить</button></div></article>)}
        </div>
      </section>

      {showTemplates ? <div className="studio-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowTemplates(false); }}><section className="studio-template-dialog" role="dialog" aria-modal="true" aria-labelledby="studio-template-title"><header><div><small>Новый проект</small><h2 id="studio-template-title">Выберите основу</h2></div><button type="button" onClick={() => setShowTemplates(false)} aria-label="Закрыть">×</button></header><div className="studio-template-grid">{studioTemplates.map((template) => <button type="button" onClick={() => void create(template.id)} key={template.id}><div style={{ '--template-accent': template.accent } as React.CSSProperties}><i /><i /><i /></div><small>{template.category}</small><strong>{template.name}</strong><span>{template.description}</span></button>)}</div></section></div> : null}
      {showAi ? <Suspense fallback={<div className="studio-dialog-backdrop"><div className="studio-ai-loading">Загружаем SITEVL AI…</div></div>}><AiCreateProjectDialog onClose={() => setShowAi(false)} onCreate={async (result) => { const project = await studioProjectRepository.create(result.project); navigate(`/studio/project/${project.id}`); }} /></Suspense> : null}
    </main>
  );
}
