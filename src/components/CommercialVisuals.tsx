import { Bell, CalendarDays, ChevronRight, Heart, LayoutGrid, Search, ShoppingBag, UserRound } from 'lucide-react';
import '../styles/commercial.css';

type VisualProps = {
  compact?: boolean;
};

function AppScreen({ variant }: { variant: 'home' | 'catalog' | 'profile' }) {
  if (variant === 'catalog') {
    return (
      <div className="commercial-phone commercial-phone--catalog">
        <div className="commercial-phone__bar"><span>9:41</span><i /></div>
        <div className="commercial-phone__header"><strong>Каталог</strong><Search /></div>
        <div className="commercial-phone__search">Найти услугу</div>
        <div className="commercial-phone__chips"><span>Все</span><span>Новое</span><span>Для бизнеса</span></div>
        <div className="commercial-phone__products">
          <article><i className="is-blue" /><div><b>Городской сервис</b><small>Запись и управление</small></div><ChevronRight /></article>
          <article><i className="is-green" /><div><b>Каталог компании</b><small>Товары и заявки</small></div><ChevronRight /></article>
          <article><i className="is-violet" /><div><b>Личный кабинет</b><small>История и документы</small></div><ChevronRight /></article>
        </div>
        <div className="commercial-phone__nav"><LayoutGrid /><Search /><Heart /><UserRound /></div>
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className="commercial-phone commercial-phone--profile">
        <div className="commercial-phone__bar"><span>9:41</span><i /></div>
        <div className="commercial-phone__header"><strong>Профиль</strong><Bell /></div>
        <div className="commercial-phone__person"><span>AS</span><div><b>Александр</b><small>Профиль подтверждён</small></div></div>
        <div className="commercial-phone__stat"><span><b>12</b><small>заявок</small></span><span><b>4</b><small>проекта</small></span><span><b>8</b><small>документов</small></span></div>
        <div className="commercial-phone__menu">
          <span><CalendarDays />Мои записи<ChevronRight /></span>
          <span><ShoppingBag />Заказы<ChevronRight /></span>
          <span><Bell />Уведомления<ChevronRight /></span>
        </div>
        <div className="commercial-phone__nav"><LayoutGrid /><Search /><Heart /><UserRound /></div>
      </div>
    );
  }

  return (
    <div className="commercial-phone commercial-phone--home">
      <div className="commercial-phone__bar"><span>9:41</span><i /></div>
      <div className="commercial-phone__welcome"><small>Добрый день</small><strong>Ваш бизнес<br />в одном приложении</strong></div>
      <div className="commercial-phone__hero-card"><span>Новая заявка</span><b>+12 сегодня</b><i /></div>
      <div className="commercial-phone__section"><b>Быстрые действия</b><span>Все</span></div>
      <div className="commercial-phone__actions"><span><LayoutGrid />Каталог</span><span><CalendarDays />Запись</span><span><ShoppingBag />Заказы</span></div>
      <div className="commercial-phone__activity"><b>Последняя активность</b><span><i />Заявка подтверждена<small>2 мин назад</small></span></div>
      <div className="commercial-phone__nav"><LayoutGrid /><Search /><Heart /><UserRound /></div>
    </div>
  );
}

export function MobileAppVisual({ compact = false }: VisualProps) {
  return (
    <div className={`commercial-app-visual ${compact ? 'is-compact' : ''}`} role="img" aria-label="Три оригинальных интерфейса мобильного приложения SITEVL: главный экран, каталог и профиль">
      <div className="commercial-app-visual__glow" />
      <div className="commercial-app-visual__phone commercial-app-visual__phone--left"><AppScreen variant="catalog" /></div>
      <div className="commercial-app-visual__phone commercial-app-visual__phone--center"><AppScreen variant="home" /></div>
      <div className="commercial-app-visual__phone commercial-app-visual__phone--right"><AppScreen variant="profile" /></div>
      <div className="commercial-app-visual__badge"><span>iOS</span><i /><span>Android</span></div>
    </div>
  );
}

export function WebsiteProductVisual({ compact = false }: VisualProps) {
  return (
    <div className={`commercial-web-visual ${compact ? 'is-compact' : ''}`} role="img" aria-label="Оригинальный интерфейс сайта SITEVL на экране ноутбука и мобильном устройстве">
      <div className="commercial-web-visual__glow" />
      <div className="commercial-web-visual__browser">
        <header><span><i /><i /><i /></span><b>sitevl.ru</b><em /></header>
        <div className="commercial-web-visual__page">
          <nav><strong>SITEVL</strong><span>Услуги&nbsp;&nbsp; Кейсы&nbsp;&nbsp; Контакты</span></nav>
          <div className="commercial-web-visual__hero"><small>ЦИФРОВОЙ ПРОДУКТ</small><b>Сайт, который<br />решает задачу</b><span>Понятная структура, адаптация и путь до обращения.</span><i>Обсудить проект</i></div>
          <div className="commercial-web-visual__cards"><span /><span /><span /></div>
        </div>
      </div>
      <div className="commercial-web-visual__mobile">
        <div><strong>S</strong><i /></div><b>Ваш продукт<br />на любом экране</b><span /><span /><em>Открыть</em>
      </div>
      <div className="commercial-web-visual__metric"><small>Готово к запуску</small><b>Desktop + Mobile</b></div>
    </div>
  );
}
