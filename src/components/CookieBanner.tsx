import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const storageKey = 'ay-digital-cookie-accepted';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(window.localStorage.getItem(storageKey) !== 'true');
  }, []);

  const acceptCookies = () => {
    window.localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 rounded-[24px] border border-line bg-white/92 p-4 shadow-soft backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="max-w-3xl text-sm leading-6 text-muted">
          Мы используем cookie для работы сайта и анализа посещаемости. Продолжая пользоваться сайтом, вы соглашаетесь с
          их использованием.
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <Link className="text-sm font-bold text-accent transition hover:text-ink" to="/privacy">
            Подробнее
          </Link>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-bold text-white shadow-glass transition hover:-translate-y-0.5 hover:bg-graphite"
            type="button"
            onClick={acceptCookies}
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}
