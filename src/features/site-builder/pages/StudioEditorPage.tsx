import '@puckeditor/core/puck.css';
import { Puck, type Data, type PuckAction } from '@puckeditor/core';
import { toBlob } from 'html-to-image';
import { ArrowLeft, Download, ExternalLink, FileArchive, Monitor, Save, Send, Share2, Smartphone, Tablet, UploadCloud, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StudioAssetProvider } from '../assets/AssetContext';
import { useProjectAssets } from '../assets/useProjectAssets';
import { createStudioPlugins, replaceActivePageData } from '../components/StudioPanels';
import { countProjectSections, getStudioMetadata, serializeFeatureList, studioConfig } from '../editor/studioConfig';
import { createOwnerBundle, createStaticSiteZip, exportProjectJson } from '../export/projectExport';
import { studioProjectRepository } from '../persistence/projectRepository';
import type { SiteBuilderProject } from '../schema/types';
import { puckRussianDictionary, studioRu } from '../i18n/ru';
import '../styles/studio.css';

type SaveStatus = 'loading' | 'saving' | 'saved' | 'error';
type SendForm = { name: string; contact: string; email: string; comment: string; consent: boolean };

const viewports = [
  { width: 1440, height: 'auto' as const, label: studioRu.breakpoints.desktop, icon: <Monitor /> },
  { width: 1024, height: 'auto' as const, label: studioRu.breakpoints.laptop, icon: <Monitor /> },
  { width: 768, height: 'auto' as const, label: studioRu.breakpoints.tablet, icon: <Tablet /> },
  { width: 390, height: 'auto' as const, label: studioRu.breakpoints.mobile, icon: <Smartphone /> },
];

export function StudioEditorPage() {
  const { projectId = '' } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<SiteBuilderProject | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('loading');
  const [notice, setNotice] = useState('');
  const [sendOpen, setSendOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1440);
  const dispatchRef = useRef<((action: PuckAction) => void) | null>(null);
  const loadedIdRef = useRef('');

  useEffect(() => {
    let active = true;
    setSaveStatus('loading');
    void studioProjectRepository.get(projectId).then((value) => {
      if (!active) return;
      setProject(value);
      loadedIdRef.current = value?.id || '';
      setSaveStatus(value ? 'saved' : 'error');
    }).catch((error) => {
      if (!active) return;
      setNotice(error instanceof Error ? error.message : 'Проект не удалось открыть.');
      setSaveStatus('error');
    });
    return () => { active = false; };
  }, [projectId]);

  useEffect(() => {
    if (!project || loadedIdRef.current !== project.id) return;
    document.title = `${project.name} — SITEVL Studio`;
    setSaveStatus('saving');
    const timer = window.setTimeout(() => {
      void studioProjectRepository.update(project).then(() => setSaveStatus('saved')).catch((error) => {
        console.error('[SITEVL Studio] Autosave failed:', error);
        setSaveStatus('error');
      });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [project]);

  const setCurrentProject = (next: SiteBuilderProject) => setProject({ ...next, updatedAt: new Date().toISOString() });
  const assets = useProjectAssets(project, setCurrentProject);
  const assetContext = useMemo(() => ({
    assets: project?.assets || [],
    urls: assets.urls,
    upload: assets.upload,
    replace: assets.replace,
    remove: assets.remove,
    updateAlt: assets.updateAlt,
    updateFocalPoint: assets.updateFocalPoint,
  }), [assets.remove, assets.replace, assets.updateAlt, assets.updateFocalPoint, assets.upload, assets.urls, project?.assets]);
  const plugins = useMemo(() => project ? createStudioPlugins(project, setCurrentProject) : [], [project]);
  const page = project?.pages.find((item) => item.id === project.activePageId) || project?.pages[0];

  const setMobilePlugin = (plugin: string) => dispatchRef.current?.({ type: 'setUi', ui: { plugin: { current: plugin }, leftSideBarVisible: true, mobilePanelExpanded: true } });

  if (!project || !page) {
    return <main className="studio-loading"><span>SITEVL Studio</span><p>{saveStatus === 'error' ? 'Проект не найден или повреждён.' : 'Открываем рабочее пространство…'}</p><button type="button" onClick={() => navigate('/studio/projects')}><ArrowLeft /> К проектам</button></main>;
  }

  const saveNow = async () => {
    setSaveStatus('saving');
    try {
      await studioProjectRepository.update(project);
      setSaveStatus('saved');
    } catch (error) {
      console.error('[SITEVL Studio] Save failed:', error);
      setSaveStatus('error');
    }
  };

  const exportZip = async () => {
    setNotice('Готовим статический сайт…');
    try {
      await createStaticSiteZip(project, assets.storedAssets);
      setNotice('ZIP статического сайта подготовлен.');
    } catch (error) {
      console.error('[SITEVL Studio] Static export failed:', error);
      setNotice(error instanceof Error ? error.message : 'Не удалось экспортировать сайт.');
    }
  };

  return (
    <StudioAssetProvider value={assetContext}>
      <main className="studio-editor-shell">
        <Puck
          key={page.id}
          config={studioConfig}
          data={page.data}
          metadata={getStudioMetadata(project.theme, assets.urls)}
          plugins={plugins}
          dictionary={puckRussianDictionary}
          viewports={viewports}
          iframe={{ enabled: true, waitForStyles: true, syncHostStyles: true }}
          dnd={{ behavior: 'auto' }}
          height="100dvh"
          _experimentalFullScreenCanvas
          _experimentalVirtualization
          onChange={(data: Data) => setCurrentProject(replaceActivePageData(project, data))}
          onPublish={() => {
            void saveNow();
            setNotice('Проект сохранён локально. Облачная публикация пока не подключена — используйте экспорт.');
          }}
          renderHeader={({ children, dispatch }) => {
            dispatchRef.current = dispatch;
            return <StudioTopBar saveStatus={saveStatus} project={project} viewportWidth={viewportWidth} onViewportWidth={(width) => {
              const safeWidth = Math.max(320, Math.min(1920, width));
              setViewportWidth(safeWidth);
              dispatch({ type: 'setUi', ui: (current) => ({ viewports: { ...current.viewports, current: { width: safeWidth, height: 'auto' } } }) });
            }} onProjectName={(name) => setCurrentProject({ ...project, name })} onBack={() => navigate('/studio/projects')} onPreview={() => window.open(`/studio/preview/${project.id}`, '_blank')} onShare={async () => {
              const url = `${window.location.origin}/studio/preview/${project.id}`;
              if (navigator.share) await navigator.share({ title: project.name, url });
              else { await navigator.clipboard.writeText(url); setNotice('Локальная ссылка предпросмотра скопирована. Она работает только в этом браузере.'); }
            }} onJson={() => exportProjectJson(project)} onZip={() => void exportZip()} onSend={() => setSendOpen(true)}>{children}</StudioTopBar>;
          }}
        />

        <div className="studio-statusbar"><span><i className={`is-${saveStatus}`} />{saveStatus === 'saving' ? studioRu.status.saving : saveStatus === 'saved' ? 'Сохранено в IndexedDB' : saveStatus === 'error' ? studioRu.status.error : studioRu.status.loading}</span><span>{page.name} · /{page.slug}</span><span>{page.data.content.length} блоков · схема v{project.schemaVersion}</span><span>Холст {viewportWidth} px</span></div>

        <nav className="studio-mobile-nav" aria-label="Инструменты конструктора"><button type="button" onClick={() => setMobilePlugin('blocks')}><UploadCloud />Блоки</button><button type="button" onClick={() => setMobilePlugin('outline')}><FileArchive />Структура</button><button type="button" onClick={() => setMobilePlugin('fields')}><Save />Изменить</button><button type="button" onClick={() => setMobilePlugin('theme')}><Monitor />Стиль</button><button type="button" onClick={() => setMobilePlugin('pages')}><ExternalLink />Ещё</button></nav>

        {notice ? <div className="studio-toast" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Закрыть"><X /></button></div> : null}
        {assets.error ? <div className="studio-toast is-error" role="alert"><span>{assets.error}</span></div> : null}
        {sendOpen ? <SendProjectDialog project={project} onClose={() => setSendOpen(false)} onDownload={async (form) => {
          const canvas = document.querySelector<HTMLIFrameElement>('.studio-editor-shell iframe')?.contentDocument?.querySelector<HTMLElement>('.sv-site');
          let thumbnail: Blob | undefined;
          try { thumbnail = canvas ? (await toBlob(canvas, { cacheBust: true, pixelRatio: 0.7, backgroundColor: project.theme.colors.background })) || undefined : undefined; } catch (error) { console.warn('[SITEVL Studio] Thumbnail unavailable:', error); }
          await createOwnerBundle(project, assets.storedAssets, form, thumbnail);
          setNotice(thumbnail ? 'Архив и миниатюра скачаны. Передайте ZIP Александру.' : 'Архив скачан без миниатюры: холст не удалось захватить.');
        }} /> : null}
      </main>
    </StudioAssetProvider>
  );
}

function StudioTopBar({ children, saveStatus, project, viewportWidth, onViewportWidth, onProjectName, onBack, onPreview, onShare, onJson, onZip, onSend }: { children: ReactNode; saveStatus: SaveStatus; project: SiteBuilderProject; viewportWidth: number; onViewportWidth: (width: number) => void; onProjectName: (name: string) => void; onBack: () => void; onPreview: () => void; onShare: () => void; onJson: () => void; onZip: () => void; onSend: () => void }) {
  return <header className="studio-topbar"><div className="studio-topbar__project"><button type="button" onClick={onBack} aria-label="К проектам"><ArrowLeft /></button><span className="studio-topbar__mark">SV</span><input value={project.name} onChange={(event) => onProjectName(event.target.value)} aria-label="Название проекта" /><small className={`is-${saveStatus}`}>{saveStatus === 'saving' ? 'Сохранение' : saveStatus === 'saved' ? 'Сохранено' : saveStatus === 'error' ? 'Ошибка' : 'Загрузка'}</small></div><div className="studio-topbar__native">{children}</div><label className="studio-topbar__width"><span>Ш</span><input type="number" min="320" max="1920" value={viewportWidth} onChange={(event) => onViewportWidth(Number(event.target.value))} aria-label="Ширина холста" /></label><div className="studio-topbar__actions"><button type="button" onClick={onPreview}><ExternalLink /> Предпросмотр</button><button type="button" onClick={onShare}><Share2 /> Поделиться</button><div className="studio-topbar__export"><button type="button"><Download /> Экспорт</button><div><button type="button" onClick={onJson}>Проект JSON</button><button type="button" onClick={onZip}>Статический сайт ZIP</button></div></div><button className="is-send" type="button" onClick={onSend}><Send /> Отправить Александру</button></div></header>;
}

function SendProjectDialog({ project, onClose, onDownload }: { project: SiteBuilderProject; onClose: () => void; onDownload: (form: Record<string, string>) => Promise<void> }) {
  const [form, setForm] = useState<SendForm>({ name: '', contact: '', email: '', comment: '', consent: false });
  const [busy, setBusy] = useState(false);
  const pages = project.pages.length;
  const sections = project.pages.reduce((sum, page) => sum + countProjectSections(page.data), 0);
  const features = project.pages.map((page) => serializeFeatureList(page.data)).filter(Boolean).join(', ');
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.consent || !form.name.trim() || !form.contact.trim()) return;
    setBusy(true);
    await onDownload({ name: form.name, contact: form.contact, email: form.email, comment: form.comment, projectName: project.name, pages: String(pages), sections: String(sections), features });
    setBusy(false);
  };
  const telegramText = `Здравствуйте, Александр! Я собрал проект «${project.name}» в SITEVL Studio. Страниц: ${pages}, секций: ${sections}. Контакт: ${form.contact}. Комментарий: ${form.comment || 'нет'}. Я скачал bundle проекта и готов передать его.`;
  return <div className="studio-dialog-backdrop"><form className="studio-send-dialog" onSubmit={submit}><header><div><small>Передача проекта</small><h2>Отправить проект Александру</h2></div><button type="button" onClick={onClose} aria-label="Закрыть"><X /></button></header><div className="studio-send-summary"><span><strong>{project.name}</strong>Название</span><span><strong>{pages}</strong>Страниц</span><span><strong>{sections}</strong>Секций</span></div><p>Серверная отправка из Studio не подключена. Кнопка ниже скачает полный архив проекта; затем его можно передать Александру в Telegram.</p><div className="studio-send-fields"><label>Имя<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Telegram или телефон<input required value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} /></label><label>Email, если удобен<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Комментарий<textarea value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} /></label></div><label className="studio-check"><input type="checkbox" checked={form.consent} onChange={(event) => setForm({ ...form, consent: event.target.checked })} /> Согласен передать контактные данные вместе с архивом проекта.</label><footer><button type="submit" disabled={!form.consent || !form.name.trim() || !form.contact.trim() || busy}><Download /> {busy ? 'Готовим архив…' : 'Скачать полный архив'}</button><a className={!form.contact.trim() ? 'is-disabled' : ''} href={!form.contact.trim() ? undefined : `https://t.me/AYDigitaLRu?text=${encodeURIComponent(telegramText)}`} target="_blank" rel="noreferrer"><Send /> Открыть Telegram</a></footer></form></div>;
}
