import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSiteData } from '../hooks/useSiteData';

export function MobileStickyCta() {
  const { data } = useSiteData();
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsFooterVisible(entry.isIntersecting),
      { threshold: 0.08 },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  if (isFooterVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4 sm:hidden">
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
