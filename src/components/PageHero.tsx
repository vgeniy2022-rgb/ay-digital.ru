import { Container } from './Container';
import { Reveal } from './Reveal';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal className="max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.03] tracking-normal text-ink sm:text-6xl">
            {title}
          </h1>
          {description && <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">{description}</p>}
        </Reveal>
      </Container>
    </section>
  );
}
