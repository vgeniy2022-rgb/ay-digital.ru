import { ButtonLink } from '../components/ButtonLink';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { SeoHead } from '../components/SeoHead';

export function NotFoundPage() {
  return (
    <PageTransition>
      <SeoHead
        title="Страница не найдена — AY Digital"
        description="Такой страницы на сайте AY Digital нет."
        canonicalPath="/404"
        noindex
      />
      <section className="py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl rounded-premium border border-line bg-white/84 p-8 text-center shadow-glass sm:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">404</p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-6xl">Страница не найдена</h1>
            <p className="mx-auto mt-5 max-w-md text-base leading-7 text-muted">
              Возможно, адрес изменился или ссылка устарела. Можно вернуться на главную или посмотреть услуги.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink to="/" showArrow={false}>На главную</ButtonLink>
              <ButtonLink to="/services" variant="secondary" showArrow={false}>Посмотреть услуги</ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </PageTransition>
  );
}
