import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  LayoutDashboard,
  Maximize2,
  Minimize2,
  Monitor,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { HowMade, LabFrame, LabHero } from '../components/lab/LabPrimitives';
import { PageTransition } from '../components/PageTransition';
import { SeoHead } from '../components/SeoHead';
import '../styles/adminDemo.css';

type AdminSection = 'dashboard' | 'editor' | 'services' | 'media' | 'settings';
type Accent = 'blue' | 'graphite' | 'green';

type DemoService = {
  id: string;
  title: string;
  price: string;
  description: string;
  image: string;
  hidden: boolean;
};

type AdminDemoState = {
  brand: string;
  eyebrow: string;
  heroTitle: string;
  heroText: string;
  city: string;
  phone: string;
  accent: Accent;
  heroImage: string;
  services: DemoService[];
};

const storageKey = 'sitevl-admin-demo-v2';
const initialState: AdminDemoState = {
  brand: 'Тихая студия',
  eyebrow: 'Услуги во Владивостоке',
  heroTitle: 'Пространство, в которое хочется возвращаться',
  heroText: 'Показываем атмосферу, услуги и цены так, чтобы клиенту было легко выбрать и записаться.',
  city: 'Владивосток',
  phone: '+7 924 130-86-26',
  accent: 'blue',
  heroImage: '/images/editorial/home-collaboration.webp',
  services: [
    { id: 'service-1', title: 'Основная услуга', price: 'от 5 000 ₽', description: 'Коротко объясните, что получает клиент.', image: '/images/editorial/presentation-work.avif', hidden: false },
    { id: 'service-2', title: 'Консультация', price: 'от 1 500 ₽', description: 'Подходит для первого знакомства с задачей.', image: '/images/editorial/phone-laptop.webp', hidden: false },
    { id: 'service-3', title: 'Комплексное решение', price: 'от 20 000 ₽', description: 'Несколько этапов работы в одном понятном формате.', image: '/images/editorial/developer-workspace.webp', hidden: false },
  ],
};

const adminSections: Array<{ id: AdminSection; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: 'Обзор', icon: BarChart3 },
  { id: 'editor', label: 'Редактор сайта', icon: Monitor },
  { id: 'services', label: 'Услуги и цены', icon: LayoutDashboard },
  { id: 'media', label: 'Фотографии', icon: ImagePlus },
  { id: 'settings', label: 'Настройки', icon: Settings2 },
];

function readInitialState(): AdminDemoState {
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? { ...initialState, ...JSON.parse(saved) as AdminDemoState } : initialState;
  } catch {
    return initialState;
  }
}

async function optimizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать изображение'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Не удалось обработать изображение'));
      image.onload = () => {
        const maxSide = 1400;
        const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function SitePreview({ state }: { state: AdminDemoState }) {
  const visibleServices = state.services.filter((item) => !item.hidden);

  return (
    <div className="admin-public-site" data-accent={state.accent}>
      <header className="admin-public-site__header">
        <strong>{state.brand || 'Название проекта'}</strong>
        <nav aria-label="Навигация демонстрационного сайта"><span>Услуги</span><span>О проекте</span><span>Контакты</span></nav>
        <span>{state.city}</span>
      </header>
      <section className="admin-public-site__hero">
        <img src={state.heroImage} alt="Фотография для главного экрана демонстрационного сайта" />
        <div className="admin-public-site__shade" />
        <div>
          <small>{state.eyebrow || 'Короткая подпись'}</small>
          <h2>{state.heroTitle || 'Заголовок главного экрана'}</h2>
          <p>{state.heroText || 'Описание появится здесь.'}</p>
          <button type="button">Обсудить задачу</button>
        </div>
      </section>
      <section className="admin-public-site__services">
        <div><small>Направления</small><h3>Услуги и стоимость</h3></div>
        <div className="admin-public-site__grid">
          <AnimatePresence initial={false}>
            {visibleServices.map((item) => (
              <motion.article layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .95 }} key={item.id}>
                <img src={item.image || '/images/editorial/laptop-office.avif'} alt="Изображение демонстрационной услуги" />
                <div><strong>{item.title || 'Услуга без названия'}</strong><span>{item.price || 'Цена уточняется'}</span><p>{item.description || 'Добавьте короткое описание.'}</p></div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </section>
      <footer><strong>{state.brand}</strong><span>{state.phone}</span></footer>
    </div>
  );
}

export function AdminDemoPage() {
  const [state, setState] = useState<AdminDemoState>(readInitialState);
  const [section, setSection] = useState<AdminSection>('editor');
  const [saved, setSaved] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState('');
  const visibleCount = useMemo(() => state.services.filter((item) => !item.hidden).length, [state.services]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
    setSaved(true);
    const timer = window.setTimeout(() => setSaved(false), 900);
    return () => window.clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    document.body.classList.toggle('admin-preview-open', fullscreen);
    return () => document.body.classList.remove('admin-preview-open');
  }, [fullscreen]);

  const update = <Key extends keyof AdminDemoState>(key: Key, value: AdminDemoState[Key]) => {
    setState((current) => ({ ...current, [key]: value }));
  };

  const updateService = (id: string, patch: Partial<DemoService>) => {
    update('services', state.services.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const addService = () => {
    const next: DemoService = {
      id: `service-${Date.now()}`,
      title: 'Новая услуга',
      price: 'от 3 000 ₽',
      description: 'Опишите результат для клиента.',
      image: '/images/editorial/laptop-office.avif',
      hidden: false,
    };
    update('services', [...state.services, next]);
    setSection('services');
  };

  const moveService = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= state.services.length) return;
    const next = [...state.services];
    [next[index], next[target]] = [next[target], next[index]];
    update('services', next);
  };

  const uploadHero = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      update('heroImage', await optimizeImage(file));
      setNotice('Фотография главного экрана обновлена.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Не удалось загрузить изображение.');
    }
    event.target.value = '';
  };

  const uploadService = async (id: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      updateService(id, { image: await optimizeImage(file) });
      setNotice('Фотография услуги обновлена.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Не удалось загрузить изображение.');
    }
    event.target.value = '';
  };

  const reset = () => {
    setState(initialState);
    window.localStorage.removeItem(storageKey);
    setNotice('Демо возвращено в исходное состояние.');
  };

  return (
    <PageTransition>
      <SeoHead title="Demo Admin — SITEVL LAB" description="Интерактивная демонстрация управления услугами, ценами и фотографиями сайта." canonicalPath="/lab/admin-demo" noindex />
      <LabFrame>
        <LabHero
          title="Админ-панель, которую можно попробовать"
          description="Измените главный экран, добавьте услугу, загрузите фотографию или переставьте карточки. Публичная часть обновится сразу, а полноэкранный режим покажет результат без элементов редактора."
          actions={<button className="lab-button" type="button" onClick={() => setFullscreen(true)}><Maximize2 /> Открыть preview</button>}
        />

        <section className="lab-section admin-demo-section">
          <div className="lab-shell">
            <div className="admin-workspace">
              <aside className="admin-workspace__sidebar">
                <div className="admin-workspace__brand"><span><LayoutDashboard /></span><div><strong>SITEVL</strong><small>ADMIN DEMO</small></div></div>
                <nav aria-label="Разделы демонстрационной панели">
                  {adminSections.map((item) => {
                    const Icon = item.icon;
                    return <button className={section === item.id ? 'is-active' : ''} type="button" onClick={() => setSection(item.id)} key={item.id}><Icon />{item.label}</button>;
                  })}
                </nav>
                <div className="admin-workspace__session"><span className="admin-workspace__pulse" /><div><strong>Демо-сессия</strong><small>Сохранено в браузере</small></div></div>
              </aside>

              <div className="admin-workspace__main">
                <header className="admin-workspace__topbar">
                  <div><strong>{adminSections.find((item) => item.id === section)?.label}</strong><small>Изменения сразу видны справа</small></div>
                  <div className="admin-workspace__top-actions">
                    <span><Save />{saved ? 'Сохранено' : 'Готово'}</span>
                    <button type="button" onClick={() => setFullscreen(true)}><Maximize2 /> На весь экран</button>
                  </div>
                </header>

                <div className="admin-workspace__body">
                  <div className="admin-workspace__controls">
                    {section === 'dashboard' ? (
                      <div className="admin-dashboard">
                        <div className="admin-dashboard__stats"><article><span>Услуги</span><strong>{state.services.length}</strong></article><article><span>На сайте</span><strong>{visibleCount}</strong></article><article><span>Фотографии</span><strong>{state.services.filter((item) => item.image).length + 1}</strong></article></div>
                        <div className="admin-dashboard__welcome"><Check /><div><h2>Демо готово к работе</h2><p>Перейдите в редактор, измените текст, затем откройте preview на весь экран.</p></div></div>
                      </div>
                    ) : null}

                    {section === 'editor' ? (
                      <form className="admin-editor-form" onSubmit={(event) => event.preventDefault()}>
                        <div className="admin-control-group"><h2>Главный экран</h2><p>Основная информация, которую увидит клиент.</p></div>
                        <label className="lab-control"><span>Короткая подпись</span><input value={state.eyebrow} onChange={(event) => update('eyebrow', event.target.value)} /></label>
                        <label className="lab-control"><span>Большой заголовок</span><textarea value={state.heroTitle} onChange={(event) => update('heroTitle', event.target.value)} /></label>
                        <label className="lab-control"><span>Описание</span><textarea value={state.heroText} onChange={(event) => update('heroText', event.target.value)} /></label>
                        <label className="admin-upload-button"><Upload /> Загрузить фото для hero<input type="file" accept="image/*" onChange={uploadHero} /></label>
                      </form>
                    ) : null}

                    {section === 'services' ? (
                      <div className="admin-services-editor">
                        <div className="admin-control-group admin-control-group--row"><div><h2>Услуги и цены</h2><p>Меняйте порядок, содержимое и видимость.</p></div><button type="button" onClick={addService}><Plus /> Добавить</button></div>
                        {state.services.map((item, index) => (
                          <article className="admin-service-editor" key={item.id}>
                            <img src={item.image} alt="Превью фотографии услуги" />
                            <div className="admin-service-editor__fields">
                              <input aria-label="Название услуги" value={item.title} onChange={(event) => updateService(item.id, { title: event.target.value })} />
                              <input aria-label="Цена услуги" value={item.price} onChange={(event) => updateService(item.id, { price: event.target.value })} />
                              <textarea aria-label="Описание услуги" value={item.description} onChange={(event) => updateService(item.id, { description: event.target.value })} />
                            </div>
                            <div className="admin-service-editor__actions">
                              <button type="button" onClick={() => moveService(index, -1)} disabled={index === 0} aria-label="Поднять услугу"><ArrowUp /></button>
                              <button type="button" onClick={() => moveService(index, 1)} disabled={index === state.services.length - 1} aria-label="Опустить услугу"><ArrowDown /></button>
                              <button type="button" onClick={() => updateService(item.id, { hidden: !item.hidden })} aria-label={item.hidden ? 'Показать услугу' : 'Скрыть услугу'}>{item.hidden ? <EyeOff /> : <Eye />}</button>
                              <button type="button" onClick={() => update('services', state.services.filter((service) => service.id !== item.id))} aria-label="Удалить услугу"><Trash2 /></button>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : null}

                    {section === 'media' ? (
                      <div className="admin-media-editor">
                        <div className="admin-control-group"><h2>Фотографии сайта</h2><p>Загруженные файлы уменьшаются перед сохранением в браузере.</p></div>
                        <label className="admin-media-card"><img src={state.heroImage} alt="Главная фотография сайта" /><span><strong>Главный экран</strong><small>Заменить изображение</small></span><Upload /><input type="file" accept="image/*" onChange={uploadHero} /></label>
                        {state.services.map((item) => (
                          <label className="admin-media-card" key={item.id}><img src={item.image} alt={`Фотография услуги ${item.title}`} /><span><strong>{item.title}</strong><small>Заменить изображение</small></span><Upload /><input type="file" accept="image/*" onChange={(event) => uploadService(item.id, event)} /></label>
                        ))}
                      </div>
                    ) : null}

                    {section === 'settings' ? (
                      <form className="admin-editor-form" onSubmit={(event) => event.preventDefault()}>
                        <div className="admin-control-group"><h2>Название и контакты</h2><p>Данные шапки и подвала демонстрационного сайта.</p></div>
                        <label className="lab-control"><span>Название проекта</span><input value={state.brand} onChange={(event) => update('brand', event.target.value)} /></label>
                        <label className="lab-control"><span>Город</span><input value={state.city} onChange={(event) => update('city', event.target.value)} /></label>
                        <label className="lab-control"><span>Телефон</span><input type="tel" value={state.phone} onChange={(event) => update('phone', event.target.value)} /></label>
                        <fieldset className="lab-fieldset"><legend>Цвет интерфейса</legend><div className="admin-accent-grid">{(['blue','graphite','green'] as const).map((accent) => <button className={state.accent === accent ? 'is-active' : ''} type="button" onClick={() => update('accent', accent)} key={accent}><span data-accent={accent} />{accent === 'blue' ? 'Синий' : accent === 'green' ? 'Зелёный' : 'Графит'}</button>)}</div></fieldset>
                        <button className="admin-reset" type="button" onClick={reset}><RotateCcw /> Сбросить демо</button>
                      </form>
                    ) : null}
                    {notice ? <p className="admin-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Закрыть сообщение"><X /></button></p> : null}
                  </div>

                  <aside className="admin-workspace__preview">
                    <div className="admin-workspace__preview-bar"><span>LIVE PREVIEW</span><button type="button" onClick={() => setFullscreen(true)}><Maximize2 /> Развернуть</button></div>
                    <SitePreview state={state} />
                  </aside>
                </div>
              </div>
            </div>
            <HowMade items={[{ label: 'Поля', value: 'реальный React state' }, { label: 'Фотографии', value: 'upload + оптимизация' }, { label: 'Сессия', value: 'localStorage' }, { label: 'Preview', value: 'единая модель данных' }]} />
          </div>
        </section>

        <AnimatePresence>
          {fullscreen ? (
            <motion.div className="admin-fullscreen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Полноэкранный предпросмотр сайта">
              <div className="admin-fullscreen__bar"><button type="button" onClick={() => setFullscreen(false)}><ArrowLeft /> Вернуться в панель</button><span>PUBLIC PREVIEW · изменения сохраняются локально</span><button type="button" onClick={() => setFullscreen(false)} aria-label="Закрыть полноэкранный режим"><Minimize2 /></button></div>
              <div className="admin-fullscreen__content"><SitePreview state={state} /></div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </LabFrame>
    </PageTransition>
  );
}
