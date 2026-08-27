import { ArrowDown } from 'lucide-react';
import { studioChapterLinks } from '../../data/webStudio';

type ChapterNavigationProps = {
  activeChapter: string;
};

export function ChapterNavigation({ activeChapter }: ChapterNavigationProps) {
  return (
    <nav className="studio-chapter-nav" aria-label="Навигация по странице">
      <div className="studio-shell studio-chapter-nav__inner">
        <span className="studio-chapter-nav__title"><ArrowDown aria-hidden="true" /> Перейти к разделу</span>
        <div className="studio-chapter-nav__links">
          {studioChapterLinks.map((item) => (
            <a
              className={activeChapter === item.id ? 'is-active' : ''}
              href={`#${item.id}`}
              aria-current={activeChapter === item.id ? 'location' : undefined}
              key={item.id}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
