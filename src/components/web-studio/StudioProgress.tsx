import { studioChapters } from '../../data/webStudio';

type StudioProgressProps = {
  activeChapter: string;
};

export function StudioProgress({ activeChapter }: StudioProgressProps) {
  return (
    <nav className="studio-progress" aria-label="Разделы истории страницы">
      <ol>
        {studioChapters.map((chapter) => {
          const isActive = chapter.id === activeChapter;

          return (
            <li key={chapter.id}>
              <a
                className={isActive ? 'is-active' : ''}
                href={`#${chapter.id}`}
                aria-current={isActive ? 'location' : undefined}
              >
                <span className="studio-progress__dot" aria-hidden="true" />
                <span className="studio-progress__index">{chapter.index}</span>
                <span className="studio-progress__label">{chapter.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
