import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteData } from '../hooks/useSiteData';

export function MobileStickyCta() {
  const { data } = useSiteData();
  const { pathname } = useLocation();
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [hasHomeHeroLeftViewport, setHasHomeHeroLeftViewport] = useState(false);

  useEffect(() => {
    setIsFooterVisible(false);
    setHasHomeHeroLeftViewport(false);
    const footer = document.querySelector('footer');
    const homeHero = document.querySelector('.home-cinematic-hero');
    const observers: IntersectionObserver[] = [];
    const updateHomeHeroVisibility = () => {
      if (!homeHero) return;
      const rect = homeHero.getBoundingClientRect();
      setHasHomeHeroLeftViewport(rect.bottom <= 0);
    };

    if (footer) {
      const footerObserver = new IntersectionObserver(
        ([entry]) => setIsFooterVisible(entry.isIntersecting),
        { threshold: 0.08 },
      );
      footerObserver.observe(footer);
      observers.push(footerObserver);
    }

    if (homeHero) {
      updateHomeHeroVisibility();
      const heroObserver = new IntersectionObserver(
        ([entry]) => setHasHomeHeroLeftViewport(!entry.isIntersecting),
        { threshold: 0 },
      );
      heroObserver.observe(homeHero);
      observers.push(heroObserver);
      window.addEventListener('scroll', updateHomeHeroVisibility, { passive: true });
      window.addEventListener('resize', updateHomeHeroVisibility);
    }

    return () => {
      observers.forEach((observer) => observer.disconnect());
      window.removeEventListener('scroll', updateHomeHeroVisibility);
      window.removeEventListener('resize', updateHomeHeroVisibility);
    };
  }, [pathname]);

  const isHomeHeroVisible = pathname === '/' && !hasHomeHeroLeftViewport;
  if (isFooterVisible || isHomeHeroVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-40 px-4 sm:hidden">
      <a
        className="mx-auto flex min-h-14 max-w-sm items-center justify-center gap-2 rounded-full border border-white/80 bg-ink px-5 text-sm font-extrabold text-white shadow-soft backdrop-blur-xl transition active:scale-[0.98]"
        href={data.site.telegramUrl}
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle className="h-4 w-4" />
        Обсудить задачу
      </a>
    </div>
  );
}
