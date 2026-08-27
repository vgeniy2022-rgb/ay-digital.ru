import { motion } from 'framer-motion';
import { Eye, EyeOff, Plus, RotateCcw, Save, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { HowMade, LabFrame, LabHero, LabSectionHeading } from '../components/lab/LabPrimitives';
import { PageTransition } from '../components/PageTransition';
import { SeoHead } from '../components/SeoHead';

type DemoProduct = {
  id: string;
  title: string;
  hidden: boolean;
};

type AdminDemoState = {
  serviceTitle: string;
  price: string;
  description: string;
  promoActive: boolean;
  visual: 'ocean' | 'graphite' | 'mint';
  products: DemoProduct[];
};

const storageKey = 'sitevl-admin-demo-v1';
const initialState: AdminDemoState = {
  serviceTitle: 'Сайт для локального бизнеса',
  price: '5000',
  description: 'Понятная структура, адаптация под телефон и быстрые способы связи.',
  promoActive: false,
  visual: 'ocean',
  products: [
    { id: 'service-1', title: 'Сайт-визитка', hidden: false },
    { id: 'service-2', title: 'Лендинг', hidden: false },
  ],
};

function readInitialState() {
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) as AdminDemoState : initialState;
  } catch {
    return initialState;
  }
}

export function AdminDemoPage() {
  const [state, setState] = useState<AdminDemoState>(readInitialState);
  const [saved, setSaved] = useState(false);
  const wowMoment = state.price.replace(/\D/g, '') === '6500';

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
    setSaved(true);
    const timer = window.setTimeout(() => setSaved(false), 700);
    return () => window.clearTimeout(timer);
  }, [state]);

  const update = <Key extends keyof AdminDemoState>(key: Key, value: AdminDemoState[Key]) => {
    setState((current) => ({ ...current, [key]: value }));
  };

  const toggleProduct = (id: string) => {
    update('products', state.products.map((item) => item.id === id ? { ...item, hidden: !item.hidden } : item));
  };

  const addProduct = () => {
    update('products', [...state.products, { id: `service-${Date.now()}`, title: `Новая услуга ${state.products.length + 1}`, hidden: false }]);
  };

  const reset = () => {
    setState(initialState);
    window.localStorage.removeItem(storageKey);
  };

  return (
    <PageTransition>
      <SeoHead title="Demo Admin — SITEVL LAB" description="Интерактивная демонстрация управления содержимым сайта без backend." canonicalPath="/lab/admin-demo" noindex />
      <LabFrame>
        <LabHero title="Попробуйте управлять сайтом" description="Изменения слева сразу появляются на публичной странице справа. Это локальная симуляция на React: она ничего не отправляет на сервер." />

        <section className="lab-section">
          <div className="lab-shell">
            <LabSectionHeading eyebrow="Admin wow moment" title="Измените цену без правки кода" description="Попробуйте заменить 5 000 на 6 500. Preview обновится в тот же момент." />
            <div className="lab-admin-demo">
              <form className="lab-admin-panel" onSubmit={(event) => event.preventDefault()}>
                <div className="lab-admin-panel__bar"><strong>SITEVL / ADMIN DEMO</strong><span><Save /> {saved ? 'сохранено локально' : 'готово'}</span></div>
                <label className="lab-control">
                  <span>Название услуги</span>
                  <input value={state.serviceTitle} onChange={(event) => update('serviceTitle', event.target.value)} />
                </label>
                <label className="lab-control">
                  <span>Цена, ₽</span>
                  <input inputMode="numeric" value={state.price} onChange={(event) => update('price', event.target.value.replace(/\D/g, '').slice(0, 7))} />
                </label>
                <label className="lab-control">
                  <span>Описание</span>
                  <textarea value={state.description} onChange={(event) => update('description', event.target.value)} />
                </label>

                <label className={`lab-choice ${state.promoActive ? 'is-selected' : ''}`}>
                  <input type="checkbox" checked={state.promoActive} onChange={(event) => update('promoActive', event.target.checked)} />
                  <i>{state.promoActive ? <Sparkles /> : null}</i>
                  Показывать акцию
                </label>

                <fieldset className="lab-fieldset">
                  <legend>Безопасный placeholder изображения</legend>
                  <div className="lab-admin-swatches">
                    {(['ocean', 'graphite', 'mint'] as const).map((visual) => (
                      <button className={`lab-admin-swatch lab-admin-swatch--${visual} ${state.visual === visual ? 'is-active' : ''}`} type="button" onClick={() => update('visual', visual)} aria-label={`Выбрать стиль ${visual}`} key={visual} />
                    ))}
                  </div>
                </fieldset>

                <fieldset className="lab-fieldset">
                  <legend>Услуги</legend>
                  <div className="lab-admin-products">
                    {state.products.map((item) => (
                      <div key={item.id}>
                        <input value={item.title} onChange={(event) => update('products', state.products.map((product) => product.id === item.id ? { ...product, title: event.target.value } : product))} />
                        <button type="button" onClick={() => toggleProduct(item.id)} aria-label={item.hidden ? 'Показать услугу' : 'Скрыть услугу'}>{item.hidden ? <EyeOff /> : <Eye />}</button>
                      </div>
                    ))}
                  </div>
                  <button className="lab-button lab-button--secondary mt-3" type="button" onClick={addProduct}><Plus /> Добавить условную услугу</button>
                </fieldset>

                <button className="lab-button lab-button--ghost" type="button" onClick={reset}><RotateCcw /> Сбросить демо</button>
              </form>

              <aside className="lab-admin-public" aria-live="polite">
                <div className="lab-admin-public__bar"><span /><span /><span /><strong>public-site.demo</strong></div>
                <div className={`lab-admin-public__hero lab-admin-public__hero--${state.visual}`}>
                  <div>
                    {state.promoActive ? <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>Акция активна</motion.span> : null}
                    <h2>{state.serviceTitle || 'Название услуги'}</h2>
                    <p>{state.description || 'Описание появится здесь.'}</p>
                    <motion.strong key={state.price} initial={{ opacity: 0.3, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      {state.price ? `${new Intl.NumberFormat('ru-RU').format(Number(state.price))} ₽` : 'Цена уточняется'}
                    </motion.strong>
                  </div>
                  <div className="lab-admin-public__visual" aria-hidden="true"><span /><span /><span /></div>
                </div>
                <div className="lab-admin-public__products">
                  {state.products.filter((item) => !item.hidden).map((item) => (
                    <motion.article layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={item.id}><i /><strong>{item.title || 'Без названия'}</strong><small>Можно изменить или скрыть</small></motion.article>
                  ))}
                </div>
                {wowMoment ? (
                  <motion.div className="lab-admin-wow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Sparkles aria-hidden="true" />
                    <p><strong>Цена обновилась мгновенно.</strong> Так работает сайт с админкой: для изменения цены не нужно редактировать код.</p>
                  </motion.div>
                ) : null}
              </aside>
            </div>
            <HowMade items={[{ label: 'Данные', value: 'локальный React state' }, { label: 'Сессия', value: 'localStorage' }, { label: 'Backend', value: 'не используется' }, { label: 'Preview', value: 'общий state' }]} />
          </div>
        </section>
      </LabFrame>
    </PageTransition>
  );
}
