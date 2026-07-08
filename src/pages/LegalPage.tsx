import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';

type LegalContent = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: { title: string; paragraphs: string[] }[];
};

export function LegalPage({ content }: { content: LegalContent }) {
  return (
    <PageTransition>
      <section className="py-16 sm:py-20">
        <Container>
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">{content.eyebrow}</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-tight sm:text-6xl">{content.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{content.intro}</p>
          </Reveal>
          <div className="mt-10 grid gap-5">
            {content.sections.map((section, index) => (
              <Reveal delay={index * 0.05} key={section.title}>
                <article className="rounded-premium border border-line bg-white/84 p-6 shadow-glass sm:p-8">
                  <h2 className="text-2xl font-extrabold">{section.title}</h2>
                  <div className="mt-4 grid gap-3 text-base leading-7 text-muted">
                    {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </PageTransition>
  );
}
