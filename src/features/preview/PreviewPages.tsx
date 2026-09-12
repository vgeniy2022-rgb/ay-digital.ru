import { ArrowLeft, ArrowUpRight, Expand, Monitor, Smartphone } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Container } from '../../components/Container';
import { concepts } from './grocery/model';
import './preview.css';
const GroceryShop = lazy(() => import('./grocery/GroceryShop').then(m => ({ default: m.GroceryShop })));
export function PreviewIndexPage() { return <Container><section className="pv-index"><span className="pv-eyebrow">SITEVL / До начала разработки</span><h1>Предревью</h1><p>Не угадывать по описанию, а попробовать. Интерактивные направления дизайна для будущих проектов: выбирайте настроение, проверяйте сценарии, обсуждайте детали.</p><Link to="/preview/grocery" className="pv-project"><div><span>01 / E-commerce · Владивосток</span><h2>Интернет-магазин<br />продуктов</h2><p>Весовые товары, сезонные коллекции и вечерняя доставка. Пять разных взглядов на один магазин.</p><b>Смотреть 5 концепций <ArrowUpRight /></b></div><img src="/preview-grocery/photos/market.webp" alt="Овощи на продуктовом рынке" width="900" height="700"/></Link><p className="pv-disclaimer">Все проекты в этом разделе — демонстрационные концепции, не действующие магазины. Заказы и контакты не отправляются.</p></section></Container>; }
export function GroceryProjectPage() { return <Container><section className="pv-index"><Link className="pv-back" to="/preview"><ArrowLeft size={18}/>Предревью</Link><span className="pv-eyebrow">Одна задача. Пять направлений.</span><h1>Продукты.<br />Доставка. Владивосток.</h1><p>Выберите не просто цвет, а способ покупать: спокойно рассматривать, быстро собирать список или исследовать сезон. Во всех вариантах можно пройти путь до демо-заказа.</p><div className="pv-project-facts"><span>2 точки комплектации</span><span>17:00–20:00</span><span>Оплата при получении</span><span>Цена уточняется после взвешивания</span></div><div className="pv-concepts">{concepts.map(c => <article key={c.id}><Link to={`/preview/grocery/${c.id}`} className="pv-cover"><img src={`/preview-grocery/covers/${c.id}.webp`} alt={`Предпросмотр варианта ${c.id}: ${c.tag}`} width="1200" height="800" loading="lazy"/><span>0{c.id}</span></Link><div><span className="pv-eyebrow">Вариант {c.id} / {c.tag}</span><h2>{c.name}</h2><p>{c.description}</p><Link to={`/preview/grocery/${c.id}`}>Открыть концепцию<ArrowUpRight size={20}/></Link></div></article>)}</div></section></Container>; }
export function GroceryPreviewPage() {
    const { variant = '1' } = useParams();
    const [params] = useSearchParams();
    const id = Number(variant);
    const [mobile, setMobile] = useState(false);
    const [message, setMessage] = useState('');
    if (!/^[1-5]$/.test(variant))
        return <div className="pv-invalid"><h1>Вариант не найден</h1><Link to="/preview/grocery">К пяти концепциям</Link></div>;
    if (params.get('canvas') === '1')
        return <Suspense fallback={<p role="status">Загружаем концепцию…</p>}><GroceryShop key={id} variant={id}/></Suspense>;
    async function fullscreen() { try {
        if (document.fullscreenElement)
            await document.exitFullscreen();
        else
            await document.documentElement.requestFullscreen();
    }
    catch {
        setMessage('Полноэкранный режим недоступен в этом браузере. Можно открыть концепцию отдельно.');
    } }
    return <div className="pv-workspace"><header className="pv-toolbar"><Link className="pv-back" to="/preview/grocery"><ArrowLeft size={17}/><span>Предревью</span></Link><span className="pv-current">Вариант {id}</span><nav aria-label="Варианты дизайна">{concepts.map(c => <Link key={c.id} to={`/preview/grocery/${c.id}`} aria-label={`Вариант ${c.id}`} aria-current={c.id === id ? 'page' : undefined}>{c.id}</Link>)}</nav><div className="pv-viewport"><button onClick={() => setMobile(false)} aria-pressed={!mobile}><Monitor size={17}/><span>Desktop</span></button><button onClick={() => setMobile(true)} aria-pressed={mobile}><Smartphone size={17}/><span>Mobile</span></button></div><button className="pv-full" aria-label="На весь экран" onClick={() => void fullscreen()}><Expand size={17}/><span>На весь экран</span></button><a href={`/preview/grocery/${id}?canvas=1`} target="_blank" rel="noopener noreferrer" aria-label="Открыть концепцию отдельно"><ArrowUpRight size={19}/></a></header>{message && <p role="status">{message}</p>}<div className={`pv-canvas ${mobile ? 'pv-canvas-mobile' : ''}`}><iframe key={id} src={`/preview/grocery/${id}?canvas=1`} title={`Интерактивный продуктовый магазин — вариант ${id}`} referrerPolicy="no-referrer"/></div></div>;
}
