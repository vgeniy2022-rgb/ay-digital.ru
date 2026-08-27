import { useLocation } from 'react-router-dom';
import { getRouteHeroMedia } from '../data/editorialMedia';
import { Container } from './Container';
import { EditorialPhoto } from './EditorialPhoto';
import { Reveal } from './Reveal';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  const { pathname } = useLocation();
  const media = getRouteHeroMedia(pathname);

  return (
    <section className={`page-hero ${media ? 'page-hero--with-media' : ''}`}>
      <Container>
        <div className={media ? 'grid items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]' : ''}>
          <Reveal className="max-w-4xl">
            <p className="editorial-eyebrow">{eyebrow}</p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.02] tracking-normal text-ink sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            {description && <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{description}</p>}
          </Reveal>
          {media ? (
            <Reveal delay={0.08}>
              <EditorialPhoto media={media} aspect="hero" priority />
            </Reveal>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
