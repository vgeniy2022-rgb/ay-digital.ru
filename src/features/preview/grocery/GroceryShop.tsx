import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowRight, Check, Clock, Heart, Leaf, MapPin, Minus, Plus, Search, ShoppingBag, SlidersHorizontal, Trash2, UserRound, X } from 'lucide-react';
import { categories, changeQuantity, concepts, estimate, fulfillment, intervals, kg, products, range, rub, total, weightNotice, zones, type Amount, type Cart, type Product } from './model';
import './grocery.css';
export function GroceryShop({ variant }: {
    variant: number;
}) {
    const concept = concepts[variant - 1];
    const [cart, setCart] = useState<Cart>({});
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [favorites, setFavorites] = useState<string[]>([]);
    const [favoritesOnly, setFavoritesOnly] = useState(false);
    const [open, setOpen] = useState(false);
    const [checkout, setCheckout] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const [notice, setNotice] = useState('');
    const [zone, setZone] = useState('second');
    const [manualPoint, setManualPoint] = useState('');
    const [address, setAddress] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [comment, setComment] = useState('');
    const [delivery, setDelivery] = useState('tomorrow');
    const [slot, setSlot] = useState<string>(intervals[0].id);
    const [actualWeight, setActualWeight] = useState('1.08');
    const dialog = useRef<HTMLDialogElement>(null);
    const totals = total(cart);
    const count = Object.keys(cart).length;
    const point = fulfillment(zone) || manualPoint;
    useEffect(() => { if (!open)
        return; const previous = document.activeElement as HTMLElement | null; const el = dialog.current; el?.showModal(); return () => { el?.close(); previous?.focus(); }; }, [open]);
    useEffect(() => { if (!notice)
        return; const timeout = setTimeout(() => setNotice(''), 2500); return () => clearTimeout(timeout); }, [notice]);
    function setAmount(p: Product, amount: Amount) { setCart(old => { const next = { ...old }; if (amount.quantity <= 0)
        delete next[p.id];
    else
        next[p.id] = amount; return next; }); }
    function add(p: Product, amount: Amount) { setAmount(p, amount); setNotice(`${p.name} — в корзине`); }
    function browse(value: string) { setCategory(value); setFavoritesOnly(false); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }); }
    function cartOpen() { setConfirmed(false); setCheckout(false); setOpen(true); }
    function submit(e: FormEvent) { e.preventDefault(); if (!count || !point)
        return; setConfirmed(true); setNotice('Демонстрационный заказ оформлен. Данные никуда не отправлены.'); }
    const visible = products.filter(p => (!category || p.category === category) && (!favoritesOnly || favorites.includes(p.id)) && `${p.name} ${p.category}`.toLowerCase().includes(query.trim().toLowerCase()));
    const iconCart = <><ShoppingBag size={20}/><span>Корзина{count ? ` · ${count}` : ''}</span></>;
    const search = <label className="gp-search"><Search size={21}/><span className="gp-sr">Поиск продуктов</span><input type="search" placeholder={variant === 3 ? 'Что положим в корзину? Например, яблоки' : 'Найти что-нибудь вкусное'} value={query} onChange={e => { setQuery(e.target.value); document.getElementById('catalog')?.scrollIntoView({ block: 'start' }); }} maxLength={100}/>{query && <button onClick={() => setQuery('')} aria-label="Очистить поиск"><X size={18}/></button>}</label>;
    const categoryList = <div className="gp-category-list" aria-label="Категории"><button onClick={() => browse('')} aria-pressed={!category}>Всё</button>{categories.map(c => <button key={c} onClick={() => browse(c)} aria-pressed={category === c}>{c}</button>)}</div>;
    function card(p: Product) { return <ProductCard key={p.id} product={p} amount={cart[p.id]} variant={variant} favorite={favorites.includes(p.id)} onFavorite={() => setFavorites(old => old.includes(p.id) ? old.filter(id => id !== p.id) : [...old, p.id])} onAdd={a => add(p, a)} onChange={a => setAmount(p, a)}/>; }
    const seasonal = <section id="season" className="gp-season"><div className="gp-section-title"><div><span className="gp-kicker">Сезонная подборка</span><h2>{variant === 2 ? 'Сейчас самое время' : variant === 4 ? 'Что сейчас в сезоне' : 'Сейчас сезон'}</h2></div><span>Яркие вкусы, которые хочется поймать</span></div>{variant === 4 && <div className="gp-calendar"><span>09 / Сентябрь</span><p>Яблоки · груши · виноград · арбузы · сезонные овощи</p><small>Иллюстрация календаря. Доступность урожая в демо не проверяется.</small></div>}<div className="gp-season-grid">{products.filter(p => p.seasonal).slice(0, variant === 3 || variant === 5 ? 6 : 3).map(card)}</div><p className="gp-fine">Демонстрационная коллекция: сезонность и наличие нужно подтвердить перед запуском магазина.</p></section>;
    const summary = <><span className="gp-kicker">Предварительный итог</span><strong className="gp-total">≈ {range(totals.min, totals.max)}</strong><p className="gp-fine">Без стоимости доставки: тариф согласует менеджер. Весовые товары будут взвешены при сборке. После сборки менеджер сообщит точную стоимость заказа.</p></>;
    return <div className={`grocery gp-v${variant}`}>
  <div className="gp-demo">Интерактивная концепция · не действующий магазин · заказы не отправляются</div>
  <header className="gp-header"><a href="#top" className="gp-brand"><Leaf size={26}/>{concept.name}</a>
   {variant !== 3 && <nav aria-label="Магазин"><a href="#catalog">Каталог</a><a href="#season">Сезонное</a><a href="#delivery">Доставка</a><a href="#about">О нас</a></nav>}
   <div className="gp-header-actions"><button aria-label="Демо-профиль" onClick={() => setNotice('В демонстрации можно оформить заказ без регистрации. Профиль не подключён.')}><UserRound size={20}/></button><button aria-label="Избранное" aria-pressed={favoritesOnly} onClick={() => { setFavoritesOnly(v => !v); setCategory(''); document.getElementById('catalog')?.scrollIntoView(); }}><Heart size={20}/><span className="gp-sr">Избранное</span></button><button className="gp-cart-trigger" aria-label="Открыть корзину" onClick={cartOpen}>{iconCart}</button></div>
  </header>
  <main id="top" className="gp-main">
   {variant === 3 ? <section className="gp-fast-start"><div><span className="gp-kicker">Продукты с доставкой по Владивостоку</span><h1>Закупиться на неделю?<br />Давайте по списку.</h1></div>{search}<div className="gp-delivery-tag"><MapPin size={17}/> Две точки сборки <span><Clock size={17}/>17:00–20:00</span></div></section> : <>
    <section className="gp-hero"><div className="gp-hero-copy"><span className="gp-kicker">{concept.tone}</span><h1>{concept.title.split('\n').map((s, i) => <span key={i}>{s}<br /></span>)}</h1><p>Свежие продукты с доставкой по Владивостоку. Вы выбираете вкус, мы показываем, как может выглядеть удобный заказ.</p><a className="gp-primary" href="#catalog">{variant === 4 ? 'Прогуляться по рынку' : 'Собрать корзину'}<ArrowRight size={20}/></a><div className="gp-hero-foot"><Clock size={18}/>Вечером, 17:00–20:00 <span>Оплата при получении</span></div></div><figure><img src={`/preview-grocery/photos/${concept.hero}.webp`} alt={variant === 2 ? 'Красные яблоки на тёмном фоне' : variant === 5 ? 'Цитрусовые для фруктовой подборки' : 'Овощи и фрукты на рынке'} fetchPriority="high"/><figcaption>{variant === 4 ? 'Собрать простое. Приготовить любимое.' : 'Вкус начинается с выбора'}<ArrowDown size={22}/></figcaption></figure>{variant === 4 && <div className="gp-paper-note">Сентябрь<br /><b>собираем<br />лучшее</b></div>}</section>
    {variant === 5 ? <div className="gp-app-search">{search}<p>Ваш маршрут: кухня → свежий ужин</p></div> : null}
   </>}
   {(variant === 2 || variant === 4) && <section className="gp-photo-categories" aria-label="Выбрать категорию">{['Овощи', 'Фрукты', 'Орехи'].map((c, i) => <button key={c} onClick={() => browse(c)}><img src={products[[0, 2, 8][i]].image} alt="" loading="lazy"/><span><small>0{i + 1} / Коллекция</small>{c}<ArrowRight size={20}/></span></button>)}</section>}
   {variant !== 3 && variant !== 2 && variant !== 4 && categoryList}
   {seasonal}
   <div className="gp-shopping-layout">
    {variant === 3 && <aside className="gp-sidebar"><span className="gp-kicker">Всё под рукой</span><h2>Категории</h2>{categoryList}<p><Leaf size={20}/> Сезонное — в отдельной подборке выше</p></aside>}
    <section id="catalog" className="gp-catalog"><div className="gp-section-title"><div><span className="gp-kicker">Соберите своё</span><h2>{favoritesOnly ? 'Избранное' : category || 'Каталог продуктов'}</h2></div><span>{visible.length} товаров</span></div>{variant !== 3 && variant !== 5 && search}{variant !== 3 && categoryList}
      <p className="gp-weight-notice"><SlidersHorizontal size={18}/>{weightNotice}</p>
      {visible.length ? <div className="gp-product-grid">{visible.map(card)}</div> : <div className="gp-empty"><Search size={30}/><h3>Пока ничего не найдено</h3><p>Попробуйте другое название или добавьте товары в избранное.</p><button className="gp-primary" onClick={() => { setCategory(''); setQuery(''); setFavoritesOnly(false); }}>Все продукты</button></div>}
    </section>
    {variant === 3 && <aside className="gp-sticky-order"><ShoppingBag size={25}/><h2>Ваш заказ</h2><p>{count ? `${count} позиций в корзине` : 'Добавьте любимые продукты'}</p>{summary}<button className="gp-primary" onClick={cartOpen}>Открыть корзину<ArrowRight size={20}/></button></aside>}
   </div>
   {variant === 1 && <><section className="gp-popular"><h2>Популярное для вашей кухни</h2><div className="gp-season-grid">{products.slice(0, 3).map(card)}</div></section><div className="gp-departments">{['Овощи', 'Фрукты', 'Орехи и сухофрукты'].map((c, i) => <button key={c} onClick={() => browse(i === 2 ? 'Орехи' : c)}><span>Каждый день на вашем столе</span><h2>{c}</h2><ArrowRight /></button>)}</div></>}
   <section id="delivery" className="gp-delivery"><div><span className="gp-kicker">От рынка до вашей двери</span><h2>Один вечерний интервал.<br />Две точки комплектации.</h2><p>Укажите район — покажем подходящую точку. Распределение зон сейчас демонстрационное, не реальная карта доставки.</p><div className="gp-points"><span><MapPin />Бородинская, 26</span><span><MapPin />Шоссейная, 41</span></div></div><ol><li><b>01</b><span>Выбираете продукты<small>По весу или в штуках</small></span></li><li><b>02</b><span>Уточняем после сборки<small>Точный вес и итог сообщит менеджер</small></span></li><li><b>03</b><span>Встречаете курьера<small>17:00–20:00 · терминал при получении</small></span></li></ol></section>
   <section id="about" className="gp-about"><span className="gp-kicker">Прозрачно, до грамма</span><h2>Не обещаем точный вес на глаз.</h2><p>Пять яблок бывают разными. В корзине — оценка, в собранном заказе — фактический вес. Так вы понимаете, за что платите.</p><details><summary>Как пересчитывается стоимость? Интерактивный пример</summary><p>Заказано 5 яблок Гала · 250 ₽/кг. Ожидаемый вес 0,8–1,1 кг, предварительно ≈ 200–275 ₽.</p><label>Фактический вес в примере, кг<input type="number" min="0.01" max="20" step="0.01" value={actualWeight} onChange={e => setActualWeight(e.target.value)}/></label><p>Итог примера: <b>{Number(actualWeight) > 0 && Number(actualWeight) <= 20 ? rub(Math.round(Number(actualWeight) * 250)) : 'Введите вес от 0,01 до 20 кг'}</b>. Это иллюстрация, корзину она не изменяет.</p></details></section>
  </main>
  <footer className="gp-footer"><a href="#top" className="gp-brand"><Leaf />{concept.name}</a><p>Продукты для хорошего дня.<br />Владивосток и ближайший пригород.</p><div><a href="#delivery">Доставка и сборка</a><a href="#catalog">Вернуться к каталогу</a></div><small>Демонстрационный дизайн SITEVL. Фотографии иллюстративные, наличие и цены — демо-данные. Это не оферта.</small></footer>
  <nav className="gp-mobile-nav" aria-label="Быстрые действия"><a href="#catalog"><Search size={20}/>Каталог</a><a href="#season"><Leaf size={20}/>Сезонное</a><button onClick={cartOpen}>{iconCart}</button></nav>
  {variant === 5 && <button className="gp-floating-cart" onClick={cartOpen}><ShoppingBag size={21}/>{count} позиций · ≈ {range(totals.min, totals.max)}<ArrowRight size={22}/></button>}
  <div className={`gp-toast ${notice ? 'is-visible' : ''}`} role="status" aria-live="polite">{notice}</div>
  <dialog aria-label="Корзина и оформление демо-заказа" ref={dialog} className={`gp-dialog gp-cart-${variant}`} onCancel={() => setOpen(false)} onClick={e => { if (e.target === dialog.current)
        setOpen(false); }}>
   <div className="gp-dialog-content"><div className="gp-dialog-heading"><span className="gp-kicker">{confirmed ? 'Демонстрация' : checkout ? 'Оформление без оплаты' : 'Ваш выбор'}</span><button aria-label="Закрыть корзину" onClick={() => setOpen(false)}><X /></button></div>
    {confirmed ? <section className="gp-confirm" role="status"><Check size={44}/><h2>Заказ принят</h2><b>Только в демонстрации — ничего не отправлено.</b><p>Мы соберём продукты, взвесим весовые товары и сообщим вам точную стоимость заказа.</p><p>{point}<br />{delivery === 'today' ? 'Сегодня' : 'Завтра'}, {intervals.find(i => i.id === slot)?.label}</p>{summary}<button className="gp-primary" onClick={() => { setCart({}); setName(''); setPhone(''); setAddress(''); setComment(''); setConfirmed(false); setOpen(false); }}>Завершить демо</button></section> : <>
     <h2>{checkout ? 'Осталось выбрать адрес' : variant === 4 ? 'Ваша корзина с рынка' : 'Ваша корзина'}</h2>
     {!count ? <div className="gp-empty"><ShoppingBag size={42}/><p>Пока пусто. Начните с того, что любите.</p><button className="gp-primary" onClick={() => setOpen(false)}>К продуктам</button></div> : <>
      {!checkout && <div className="gp-cart-lines">{products.filter(p => cart[p.id]).map(p => { const a = cart[p.id], e = estimate(p, a); return <article key={p.id}><img src={p.image} alt=""/><div><h3>{p.name}</h3><small>{rub(p.price)}/кг · {a.mode === 'pieces' ? `${a.quantity} шт · ≈ ${kg(e.minGrams)}–${kg(e.maxGrams)} кг` : `${a.quantity} кг`}</small><Stepper label={p.name} amount={a} change={delta => setAmount(p, changeQuantity(a, delta))}/><b>≈ {range(e.min, e.max)}</b></div><button aria-label={`Удалить ${p.name}`} onClick={() => setAmount(p, { ...a, quantity: 0 })}><Trash2 size={18}/></button></article>; })}</div>}
      <div className="gp-summary">{summary}</div>
      {!checkout ? <button className="gp-primary gp-wide" onClick={() => setCheckout(true)}>Перейти к оформлению<ArrowRight size={20}/></button> : <form onSubmit={submit} className="gp-checkout">
       <p className="gp-demo-form">Демо: используйте вымышленные контакты. Данные остаются только в памяти этой вкладки.</p>
       <fieldset><legend>01 / Контактные данные</legend><label>Ваше имя<input required maxLength={80} autoComplete="off" value={name} onChange={e => setName(e.target.value)}/></label><label>Телефон<input type="tel" required minLength={7} maxLength={24} autoComplete="off" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Демонстрационный номер"/></label></fieldset>
       <fieldset><legend>02 / Куда привезти</legend><label>Адрес<input required maxLength={180} autoComplete="off" placeholder="Например, ул. Русская, 65" value={address} onChange={e => setAddress(e.target.value)}/></label><label>Район<select aria-label="Район" value={zone} onChange={e => { setZone(e.target.value); setManualPoint(''); }}>{zones.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}</select></label><div className="gp-routing" aria-live="polite"><MapPin size={22}/><div><small>Точка комплектации · демо-распределение</small><strong>{fulfillment(zone) || 'Зона требует уточнения'}</strong></div></div>{!fulfillment(zone) && <label>Предполагаемая точка (нужна проверка менеджером)<select aria-label="Предполагаемая точка" value={manualPoint} onChange={e => setManualPoint(e.target.value)} required><option value="">Выберите точку для демонстрации</option><option>Бородинская, 26</option><option>Шоссейная, 41</option></select></label>}</fieldset>
       <fieldset><legend>03 / Время доставки</legend><label>День<select aria-label="День" value={delivery} onChange={e => setDelivery(e.target.value)}><option value="tomorrow">Завтра · демо</option><option value="today">Сегодня · доступность уточняется</option></select></label><label>Интервал<select aria-label="Интервал" value={slot} onChange={e => setSlot(e.target.value)}>{intervals.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}</select></label><label>Комментарий<textarea maxLength={500} value={comment} onChange={e => setComment(e.target.value)} placeholder="Этаж, домофон, пожелания к сборке"/></label></fieldset>
       <p><b>Оплата при получении</b><br />Через терминал. Оплаты на сайте нет.</p><label className="gp-consent"><input type="checkbox" required/>Понимаю, что сумма предварительная, а заказ демонстрационный.</label>
       <button className="gp-primary gp-wide" type="submit">Оформить заказ<ArrowRight size={20}/></button><button type="button" className="gp-back" onClick={() => setCheckout(false)}>Вернуться к корзине</button>
      </form>}
     </>}
    </>}
   </div>
  </dialog>
 </div>;
}
function Stepper({ amount, change, label }: {
    amount: Amount;
    change: (delta: number) => void;
    label: string;
}) {
    const step = amount.mode === 'pieces' ? 1 : 0.25;
    return <div className="gp-stepper"><button type="button" aria-label={`Уменьшить ${label}`} disabled={amount.quantity <= 0} onClick={() => change(-step)}><Minus size={16}/></button><output>{new Intl.NumberFormat('ru-RU').format(amount.quantity)} {amount.mode === 'pieces' ? 'шт' : 'кг'}</output><button type="button" aria-label={`Увеличить ${label}`} disabled={amount.quantity >= (amount.mode === 'pieces' ? 50 : 20)} onClick={() => change(step)}><Plus size={16}/></button></div>;
}
function ProductCard({ product: p, amount, variant, favorite, onFavorite, onAdd, onChange }: {
    product: Product;
    amount?: Amount;
    variant: number;
    favorite: boolean;
    onFavorite: () => void;
    onAdd: (a: Amount) => void;
    onChange: (a: Amount) => void;
}) {
    const [draft, setDraft] = useState<Amount>({ mode: p.pieceGrams ? 'pieces' : 'kg', quantity: p.pieceGrams ? 1 : 0.5 });
    const value = amount || draft, e = estimate(p, value);
    const change = (a: Amount) => { setDraft(a); if (amount)
        onChange(a); };
    return <article className="gp-product" data-product={p.id}>
  <div className="gp-product-photo"><img src={p.image} alt={p.name} loading="lazy" decoding="async" width="480" height="360"/>{p.seasonal && <span className="gp-season-badge"><Leaf size={13}/>Сезонный</span>}<button className="gp-favorite" aria-label={`Избранное: ${p.name}`} aria-pressed={favorite} onClick={onFavorite}><Heart size={17} fill={favorite ? 'currentColor' : 'none'}/></button></div>
  <div className="gp-product-body"><small>{p.category}</small><h3>{p.name}</h3><p className="gp-product-note">{p.note}</p><strong className="gp-unit-price">{rub(p.price)}<small>/кг</small></strong>
   {p.pieceGrams ? <div className="gp-unit-toggle" aria-label={`Способ заказа: ${p.name}`}><button aria-pressed={value.mode === 'pieces'} onClick={() => change({ mode: 'pieces', quantity: 1 })}>В штуках</button><button aria-pressed={value.mode === 'kg'} onClick={() => change({ mode: 'kg', quantity: 0.5 })}>По весу</button></div> : <span className="gp-only-weight">На развес</span>}
   <Stepper label={p.name} amount={value} change={delta => change(changeQuantity(value, delta))}/>
   <span className="gp-estimate-weight">{value.mode === 'pieces' ? `≈ ${kg(e.minGrams)}–${kg(e.maxGrams)} кг` : `Ориентир: ${kg(e.minGrams)} кг`}</span>
   <div className="gp-product-buy"><div><small>Предварительно</small><b>≈ {range(e.min, e.max)}</b></div><button className="gp-add" disabled={value.quantity <= 0} aria-label={`Добавить ${p.name} в корзину`} onClick={() => onAdd(value)}>{amount ? <Check size={20}/> : <Plus size={20}/>}{variant !== 2 && variant !== 3 && <span>{amount ? 'В корзине' : 'В корзину'}</span>}</button></div>
  </div>
 </article>;
}
