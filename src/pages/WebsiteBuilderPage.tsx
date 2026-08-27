import { toPng } from 'html-to-image';
import {
  Check,
  Clock3,
  Download,
  FileJson,
  ImagePlus,
  LayoutTemplate,
  Maximize2,
  Monitor,
  Palette,
  Plus,
  RotateCcw,
  Send,
  Smartphone,
  Trash2,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type RefObject } from 'react';
import { HowMade, LabFrame, LabHero } from '../components/lab/LabPrimitives';
import { PageTransition } from '../components/PageTransition';
import { SeoHead } from '../components/SeoHead';
import { useSiteData } from '../hooks/useSiteData';
import '../styles/websiteBuilder.css';

type BuilderPanel = 'content' | 'services' | 'style' | 'export';
type BuilderDevice = 'desktop' | 'mobile';
type BuilderTheme = 'ink' | 'blue' | 'green' | 'coral';

type BuilderService = {
  id: string;
  title: string;
  text: string;
  price: string;
};

type LandingDraft = {
  brand: string;
  eyebrow: string;
  title: string;
  description: string;
  buttonText: string;
  heroImage: string;
  theme: BuilderTheme;
  showAbout: boolean;
  showServices: boolean;
  showContact: boolean;
  aboutTitle: string;
  aboutText: string;
  services: BuilderService[];
};

type StoredDraft = {
  draft: LandingDraft;
  sessionId: string;
  expiresAt: number;
};

const sessionDuration = 30 * 60 * 1000;
const storageKey = 'sitevl-landing-builder-v2';

const initialDraft: LandingDraft = {
  brand: 'Моя студия',
  eyebrow: 'Услуги во Владивостоке',
  title: 'Создаём пространство для ваших идей',
  description: 'Коротко расскажите, чем вы занимаетесь, кому помогаете и почему клиенту стоит обратиться именно к вам.',
  buttonText: 'Обсудить задачу',
  heroImage: '/images/editorial/home-collaboration.webp',
  theme: 'ink',
  showAbout: true,
  showServices: true,
  showContact: true,
  aboutTitle: 'Работаем спокойно и внимательно',
  aboutText: 'Здесь можно рассказать о подходе, опыте и важных деталях, которые помогают принять решение.',
  services: [
    { id: 'landing-service-1', title: 'Основная услуга', text: 'Короткое объяснение результата для клиента.', price: 'от 5 000 ₽' },
    { id: 'landing-service-2', title: 'Консультация', text: 'Подходит, чтобы разобраться с задачей и выбрать формат.', price: 'от 1 500 ₽' },
    { id: 'landing-service-3', title: 'Комплексный проект', text: 'Решение под ключ с понятными этапами работы.', price: 'от 20 000 ₽' },
  ],
};

function createSessionId() {
  return `SV-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

function freshSession(): StoredDraft {
  return { draft: initialDraft, sessionId: createSessionId(), expiresAt: Date.now() + sessionDuration };
}

function readSession(): StoredDraft {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return freshSession();
    const stored = JSON.parse(raw) as StoredDraft;
    return stored.expiresAt > Date.now() ? { ...stored, draft: { ...initialDraft, ...stored.draft } } : freshSession();
  } catch {
    return freshSession();
  }
}

async function optimizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать фотографию'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Не удалось обработать фотографию'));
      image.onload = () => {
        const maxSide = 1600;
        const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', .84));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function formatRemaining(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function LandingPreview({ draft, previewRef }: { draft: LandingDraft; previewRef: RefObject<HTMLDivElement> }) {
  return (
    <div className="builder-landing" data-theme={draft.theme} ref={previewRef}>
      <header><strong>{draft.brand || 'Название проекта'}</strong><nav><span>Услуги</span><span>О нас</span><span>Контакты</span></nav><button type="button">{draft.buttonText || 'Связаться'}</button></header>
      <main>
        <section className="builder-landing__hero">
          <img src={draft.heroImage} alt="Главное изображение создаваемого лендинга" />
          <div className="builder-landing__shade" />
          <div><small>{draft.eyebrow}</small><h2>{draft.title || 'Заголовок вашего сайта'}</h2><p>{draft.description}</p><button type="button">{draft.buttonText || 'Связаться'}</button></div>
        </section>
        {draft.showServices ? (
          <section className="builder-landing__section"><small>Что можно выбрать</small><h3>Услуги</h3><div className="builder-landing__services">{draft.services.map((service) => <article key={service.id}><span>{service.price}</span><h4>{service.title}</h4><p>{service.text}</p></article>)}</div></section>
        ) : null}
        {draft.showAbout ? (
          <section className="builder-landing__about"><div><small>О проекте</small><h3>{draft.aboutTitle}</h3></div><p>{draft.aboutText}</p></section>
        ) : null}
        {draft.showContact ? (
          <section className="builder-landing__contact"><small>Следующий шаг</small><h3>Давайте обсудим вашу задачу</h3><button type="button">{draft.buttonText || 'Связаться'}</button></section>
        ) : null}
      </main>
      <footer><strong>{draft.brand}</strong><span>Сайт собран в SITEVL LAB</span></footer>
    </div>
  );
}

export function WebsiteBuilderPage() {
  const { data } = useSiteData();
  const [session, setSession] = useState<StoredDraft>(readSession);
  const [panel, setPanel] = useState<BuilderPanel>('content');
  const [device, setDevice] = useState<BuilderDevice>('desktop');
  const [fullscreen, setFullscreen] = useState(false);
  const [remaining, setRemaining] = useState(() => session.expiresAt - Date.now());
  const [notice, setNotice] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const draft = session.draft;

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = session.expiresAt - Date.now();
      setRemaining(next);
      if (next <= 0) {
        const replacement = freshSession();
        setSession(replacement);
        setRemaining(sessionDuration);
        setNotice('Предыдущий черновик очищен через 30 минут. Начата новая сессия.');
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [session.expiresAt]);

  useEffect(() => {
    document.body.classList.toggle('builder-preview-open', fullscreen);
    return () => document.body.classList.remove('builder-preview-open');
  }, [fullscreen]);

  const update = <Key extends keyof LandingDraft>(key: Key, value: LandingDraft[Key]) => {
    setSession((current) => ({ ...current, draft: { ...current.draft, [key]: value } }));
  };

  const updateService = (id: string, patch: Partial<BuilderService>) => {
    update('services', draft.services.map((service) => service.id === id ? { ...service, ...patch } : service));
  };

  const addService = () => {
    update('services', [...draft.services, { id: `landing-service-${Date.now()}`, title: 'Новая услуга', text: 'Что получает клиент в результате.', price: 'от 3 000 ₽' }]);
  };

  const uploadHero = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      update('heroImage', await optimizeImage(file));
      setNotice('Фотография добавлена в главный экран.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Не удалось загрузить фотографию.');
    }
    event.target.value = '';
  };

  const saveScreenshot = async () => {
    if (!previewRef.current) return;
    setIsCapturing(true);
    try {
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 1.6, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `sitevl-${session.sessionId.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      setNotice('Снимок лендинга сохранён в PNG.');
    } catch (error) {
      console.error('[Builder] Screenshot failed:', error);
      setNotice('Не удалось создать снимок. Попробуйте ещё раз после загрузки всех фотографий.');
    } finally {
      setIsCapturing(false);
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ sessionId: session.sessionId, createdAt: new Date().toISOString(), draft }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sitevl-${session.sessionId.toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice('Конфигурация сохранена в JSON.');
  };

  const reset = () => {
    const next = freshSession();
    setSession(next);
    setRemaining(sessionDuration);
    setNotice('Конструктор очищен. Начата новая 30-минутная сессия.');
  };

  const briefText = useMemo(() => [
    `Здравствуйте! Я собрал лендинг в SITEVL LAB. Код: ${session.sessionId}.`,
    `Проект: ${draft.brand}.`,
    `Заголовок: ${draft.title}.`,
    `Описание: ${draft.description}.`,
    `Услуги: ${draft.services.map((item) => `${item.title} — ${item.price}`).join('; ')}.`,
    `Блоки: ${[draft.showServices && 'услуги', draft.showAbout && 'о проекте', draft.showContact && 'контакты'].filter(Boolean).join(', ')}.`,
    `Цветовая тема: ${draft.theme}.`,
    'Хочу обсудить создание такого сайта.',
  ].join('\n'), [draft, session.sessionId]);
  const telegramHref = `${data.site.telegramUrl}?text=${encodeURIComponent(briefText)}`;

  return (
    <PageTransition>
      <SeoHead title="Конструктор лендинга — SITEVL LAB" description="Интерактивный конструктор лендинга с живым preview, загрузкой фотографии и экспортом результата." canonicalPath="/lab/website-builder" noindex />
      <LabFrame>
        <LabHero
          title="Соберите свой лендинг"
          description="Изменяйте текст, услуги, фотографии и цвет. Скачайте снимок результата или отправьте подробную конфигурацию Александру. Черновик автоматически очищается через 30 минут."
          actions={<button className="lab-button" type="button" onClick={() => setFullscreen(true)}><Maximize2 /> Открыть preview</button>}
        />

        <section className="lab-section builder-section">
          <div className="lab-shell">
            <div className="builder-session-bar">
              <div><span className="builder-session-bar__live" /><strong>Сессия {session.sessionId}</strong><small>Черновик хранится только в этом браузере</small></div>
              <span><Clock3 /> Автоочистка через {formatRemaining(remaining)}</span>
              <button type="button" onClick={reset}><RotateCcw /> Начать заново</button>
            </div>

            <div className="builder-workspace">
              <aside className="builder-sidebar">
                <nav aria-label="Разделы конструктора">
                  {([
                    ['content', 'Текст и фото', LayoutTemplate],
                    ['services', 'Услуги', Plus],
                    ['style', 'Стиль и блоки', Palette],
                    ['export', 'Скачать и отправить', Download],
                  ] as const).map(([id, label, Icon]) => <button className={panel === id ? 'is-active' : ''} type="button" onClick={() => setPanel(id)} key={id}><Icon />{label}</button>)}
                </nav>

                <div className="builder-sidebar__panel">
                  {panel === 'content' ? (
                    <form className="builder-form" onSubmit={(event) => event.preventDefault()}>
                      <h2>Первый экран</h2>
                      <label className="lab-control"><span>Название проекта</span><input value={draft.brand} onChange={(event) => update('brand', event.target.value)} /></label>
                      <label className="lab-control"><span>Короткая подпись</span><input value={draft.eyebrow} onChange={(event) => update('eyebrow', event.target.value)} /></label>
                      <label className="lab-control"><span>Главный заголовок</span><textarea value={draft.title} onChange={(event) => update('title', event.target.value)} /></label>
                      <label className="lab-control"><span>Описание</span><textarea value={draft.description} onChange={(event) => update('description', event.target.value)} /></label>
                      <label className="lab-control"><span>Текст кнопки</span><input value={draft.buttonText} onChange={(event) => update('buttonText', event.target.value)} /></label>
                      <label className="builder-upload"><ImagePlus /> Загрузить свою фотографию<input type="file" accept="image/*" onChange={uploadHero} /></label>
                    </form>
                  ) : null}

                  {panel === 'services' ? (
                    <div className="builder-services-panel">
                      <div className="builder-panel-title"><div><h2>Карточки услуг</h2><p>Добавьте название, цену и короткий результат.</p></div><button type="button" onClick={addService} aria-label="Добавить услугу"><Plus /></button></div>
                      {draft.services.map((service) => (
                        <article key={service.id}>
                          <input aria-label="Название услуги" value={service.title} onChange={(event) => updateService(service.id, { title: event.target.value })} />
                          <input aria-label="Цена услуги" value={service.price} onChange={(event) => updateService(service.id, { price: event.target.value })} />
                          <textarea aria-label="Описание услуги" value={service.text} onChange={(event) => updateService(service.id, { text: event.target.value })} />
                          <button type="button" onClick={() => update('services', draft.services.filter((item) => item.id !== service.id))} aria-label="Удалить услугу"><Trash2 /></button>
                        </article>
                      ))}
                    </div>
                  ) : null}

                  {panel === 'style' ? (
                    <div className="builder-style-panel">
                      <h2>Внешний вид</h2>
                      <fieldset><legend>Акцентный цвет</legend><div className="builder-theme-grid">{(['ink','blue','green','coral'] as const).map((theme) => <button className={draft.theme === theme ? 'is-active' : ''} type="button" onClick={() => update('theme', theme)} key={theme}><span data-theme={theme} />{theme === 'ink' ? 'Графит' : theme === 'blue' ? 'Синий' : theme === 'green' ? 'Зелёный' : 'Коралловый'}</button>)}</div></fieldset>
                      <fieldset><legend>Блоки страницы</legend><div className="builder-toggle-grid">
                        {([
                          ['showServices','Услуги'],
                          ['showAbout','О проекте'],
                          ['showContact','Контакты'],
                        ] as const).map(([key,label]) => <label className={draft[key] ? 'is-active' : ''} key={key}><input type="checkbox" checked={draft[key]} onChange={(event) => update(key, event.target.checked)} /><i>{draft[key] ? <Check /> : null}</i>{label}</label>)}
                      </div></fieldset>
                      {draft.showAbout ? <><label className="lab-control"><span>Заголовок «О проекте»</span><input value={draft.aboutTitle} onChange={(event) => update('aboutTitle', event.target.value)} /></label><label className="lab-control"><span>Текст «О проекте»</span><textarea value={draft.aboutText} onChange={(event) => update('aboutText', event.target.value)} /></label></> : null}
                    </div>
                  ) : null}

                  {panel === 'export' ? (
                    <div className="builder-export-panel">
                      <h2>Заберите результат</h2>
                      <p>PNG подойдёт для просмотра, JSON сохранит точные тексты и настройки. При отправке в Telegram конфигурация останется у Александра по коду сессии.</p>
                      <button type="button" onClick={saveScreenshot} disabled={isCapturing}><Download />{isCapturing ? 'Создаю снимок…' : 'Скачать PNG'}</button>
                      <button type="button" onClick={exportJson}><FileJson />Скачать JSON</button>
                      <a href={telegramHref} target="_blank" rel="noreferrer"><Send />Передать Александру</a>
                      <div><strong>{session.sessionId}</strong><span>Код поможет найти ваш вариант в переписке</span></div>
                    </div>
                  ) : null}
                </div>
              </aside>

              <section className="builder-preview-panel">
                <header><span>LIVE LANDING</span><div><button className={device === 'desktop' ? 'is-active' : ''} type="button" onClick={() => setDevice('desktop')} aria-label="Версия для компьютера"><Monitor /></button><button className={device === 'mobile' ? 'is-active' : ''} type="button" onClick={() => setDevice('mobile')} aria-label="Мобильная версия"><Smartphone /></button><button type="button" onClick={() => setFullscreen(true)} aria-label="Открыть на весь экран"><Maximize2 /></button></div></header>
                <div className="builder-preview-stage" data-device={device}><div className="builder-preview-canvas"><LandingPreview draft={draft} previewRef={previewRef} /></div></div>
              </section>
            </div>
            {notice ? <div className="builder-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Закрыть сообщение"><X /></button></div> : null}
            <HowMade items={[{ label: 'Черновик', value: '30 минут в localStorage' }, { label: 'Снимок', value: 'PNG из DOM' }, { label: 'Передача', value: 'только по действию посетителя' }, { label: 'Данные', value: 'JSON + код сессии' }]} />
          </div>
        </section>

        <AnimatePresence>
          {fullscreen ? (
            <motion.div className="builder-fullscreen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Полноэкранный просмотр лендинга">
              <header><button type="button" onClick={() => setFullscreen(false)}><X /> Закрыть preview</button><span>{session.sessionId} · {formatRemaining(remaining)}</span><button type="button" onClick={saveScreenshot}><Download /> Снимок</button></header>
              <div><LandingPreview draft={draft} previewRef={previewRef} /></div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </LabFrame>
    </PageTransition>
  );
}
