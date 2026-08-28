import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { ArrowLeft, ExternalLink, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { studioAssetRepository, studioProjectRepository } from '../persistence/projectRepository';
import type { SiteBuilderProject, StoredStudioAsset } from '../schema/types';
import { StudioRenderer } from '../preview/StudioRenderer';
import '../styles/studio.css';

const viewportWidths = { desktop: 1440, tablet: 768, mobile: 390 } as const;

export function StudioPreviewPage() {
  const { projectId = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [project, setProject] = useState<SiteBuilderProject | null>(null);
  const [assets, setAssets] = useState<StoredStudioAsset[]>([]);
  const [viewport, setViewport] = useState<keyof typeof viewportWidths>('desktop');
  const selectedSlug = searchParams.get('page') || '';

  useEffect(() => {
    void Promise.all([studioProjectRepository.get(projectId), studioAssetRepository.list(projectId)]).then(([nextProject, nextAssets]) => { setProject(nextProject); setAssets(nextAssets); });
  }, [projectId]);

  const urls = useMemo(() => Object.fromEntries(assets.map((asset) => [asset.id, URL.createObjectURL(asset.blob)])), [assets]);
  useEffect(() => () => Object.values(urls).forEach((url) => URL.revokeObjectURL(url)), [urls]);
  const page = project?.pages.find((item) => item.slug === selectedSlug) || project?.pages.find((item) => item.isHome) || project?.pages[0];

  useEffect(() => { if (page) document.title = `${page.title} — Предпросмотр`; }, [page]);

  const handleNavigation = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor || !project) return;
    const raw = anchor.getAttribute('href') || '';
    if (raw === '/' || raw.startsWith('/')) {
      const slug = raw === '/' ? '' : raw.replace(/^\//, '').replace(/\.html$/, '');
      if (project.pages.some((item) => item.slug === slug)) {
        event.preventDefault();
        setSearchParams(slug ? { page: slug } : {});
      }
    }
  };

  if (!project || !page) return <main className="studio-loading"><span>SITEVL Studio</span><p>Загружаем предпросмотр…</p></main>;

  return <main className="studio-preview-shell"><header><button type="button" onClick={() => navigate(`/studio/project/${project.id}`)}><ArrowLeft /> Редактор</button><div><strong>{project.name}</strong><select value={page.slug} onChange={(event) => setSearchParams(event.target.value ? { page: event.target.value } : {})}>{[...project.pages].sort((a, b) => a.order - b.order).map((item) => <option value={item.slug} key={item.id}>{item.name}</option>)}</select></div><nav aria-label="Размер предпросмотра"><button className={viewport === 'desktop' ? 'is-active' : ''} type="button" onClick={() => setViewport('desktop')} aria-label="Компьютер"><Monitor /></button><button className={viewport === 'tablet' ? 'is-active' : ''} type="button" onClick={() => setViewport('tablet')} aria-label="Планшет"><Tablet /></button><button className={viewport === 'mobile' ? 'is-active' : ''} type="button" onClick={() => setViewport('mobile')} aria-label="Телефон"><Smartphone /></button></nav><button type="button" onClick={() => window.open(window.location.href, '_blank')}><ExternalLink /> Новая вкладка</button></header><div className="studio-preview-viewport" data-viewport={viewport}><div className="sv-preview-container" style={{ width: viewportWidths[viewport] }} onClick={handleNavigation}><StudioRenderer project={project} page={page} assetUrls={urls} /></div></div></main>;
}
