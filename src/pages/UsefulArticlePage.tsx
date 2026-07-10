import { Navigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { ButtonLink } from '../components/ButtonLink';
import { Container } from '../components/Container';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { UsefulHero, UsefulSection, WarningCard } from '../components/UsefulBlocks';
import {
  AppleIdProtectionIllustration,
  AppsIllustration,
  ChecklistIllustration,
  DataTransferIllustration,
  MacSecurityIllustration,
  ScamsIllustration,
} from '../components/UsefulIllustrations';
import { usefulArticles } from '../data/useful';
import { useSiteData } from '../hooks/useSiteData';

function UsefulVisualBreak({ slug, sectionTitle }: { slug: string; sectionTitle: string }) {
  if (slug === 'data-transfer' && (sectionTitle === 'iPhone -> Android' || sectionTitle === 'Android -> iPhone')) {
    return (
      <Container>
        <Reveal>
          <div className="my-4 grid items-center gap-6 rounded-premium border border-line bg-white/72 p-5 shadow-glass lg:grid-cols-[0.9fr_1.1fr]">
            <div className="p-2">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Схема переноса</p>
              <h3 className="mt-3 text-2xl font-extrabold leading-tight">Данные лучше переносить по понятному маршруту</h3>
              <p className="mt-3 text-sm leading-6 text-muted">Сначала резервная копия, затем перенос фото, контактов, чатов и отдельная проверка приложений.</p>
            </div>
            <DataTransferIllustration compact />
          </div>
        </Reveal>
      </Container>
    );
  }

  if (slug === 'digital-hygiene' && sectionTitle === 'MacBook') {
    return (
      <Container>
        <Reveal>
          <div className="my-4 grid items-center gap-6 rounded-premium border border-line bg-white/72 p-5 shadow-glass lg:grid-cols-[1fr_1fr]">
            <MacSecurityIllustration compact />
            <div className="p-2">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">MacBook</p>
              <h3 className="mt-3 text-2xl font-extrabold leading-tight">Защита ноутбука начинается с базовых настроек</h3>
              <p className="mt-3 text-sm leading-6 text-muted">FileVault, пароль входа, iCloud и разрешения программ помогают снизить риск потери данных.</p>
            </div>
          </div>
        </Reveal>
      </Container>
    );
  }

  if (slug === 'scams' && sectionTitle === 'Apple ID') {
    return (
      <Container>
        <Reveal>
          <div className="my-4 grid items-center gap-6 rounded-premium border border-line bg-white/72 p-5 shadow-glass lg:grid-cols-[0.95fr_1.05fr]">
            <div className="p-2">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-600">Аккаунт</p>
              <h3 className="mt-3 text-2xl font-extrabold leading-tight">Код подтверждения и пароль нельзя передавать</h3>
              <p className="mt-3 text-sm leading-6 text-muted">Если кто-то просит войти в чужой аккаунт или назвать код, это повод остановиться и проверить ситуацию.</p>
            </div>
            <AppleIdProtectionIllustration compact />
          </div>
        </Reveal>
      </Container>
    );
  }

  if (slug === 'scams' && sectionTitle === 'Удалённый доступ') {
    return (
      <Container>
        <Reveal>
          <div className="my-4 grid items-center gap-6 rounded-premium border border-rose-100 bg-rose-50/60 p-5 shadow-glass lg:grid-cols-[1fr_1fr]">
            <ScamsIllustration compact />
            <div className="p-2">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-600">Удалённый доступ</p>
              <h3 className="mt-3 text-2xl font-extrabold leading-tight">Не показывайте экран незнакомым людям</h3>
              <p className="mt-3 text-sm leading-6 text-muted">Если человек видит экран, он может подсказать опасные действия или увидеть коды подтверждения.</p>
            </div>
          </div>
        </Reveal>
      </Container>
    );
  }

  if (slug === 'apps-checklists' && sectionTitle === 'Если приложения нет в App Store') {
    return (
      <Container>
        <Reveal>
          <div className="my-4 grid items-center gap-6 rounded-premium border border-line bg-white/72 p-5 shadow-glass lg:grid-cols-[1fr_1fr]">
            <AppsIllustration compact />
            <div className="p-2">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Приложения</p>
              <h3 className="mt-3 text-2xl font-extrabold leading-tight">Ищите официальный источник, а не случайный файл</h3>
              <p className="mt-3 text-sm leading-6 text-muted">Веб-версия, сайт разработчика и поддержка сервиса безопаснее файлов из неизвестных каналов.</p>
            </div>
          </div>
        </Reveal>
      </Container>
    );
  }

  if (slug === 'apps-checklists' && sectionTitle === 'Чек-листы') {
    return (
      <Container>
        <Reveal>
          <div className="my-4 grid items-center gap-6 rounded-premium border border-line bg-white/72 p-5 shadow-glass lg:grid-cols-[0.95fr_1.05fr]">
            <div className="p-2">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Проверка</p>
              <h3 className="mt-3 text-2xl font-extrabold leading-tight">Чек-лист помогает ничего не забыть</h3>
              <p className="mt-3 text-sm leading-6 text-muted">Перед продажей, покупкой или настройкой лучше пройтись по пунктам спокойно и по порядку.</p>
            </div>
            <ChecklistIllustration compact />
          </div>
        </Reveal>
      </Container>
    );
  }

  return null;
}

export function UsefulArticlePage() {
  const { slug } = useParams();
  const { data } = useSiteData();
  const article = usefulArticles.find((item) => item.slug === slug);

  useEffect(() => {
    if (!article) return;
    document.title = `${article.seoTitle} | ${data.site.domain}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', article.seoDescription);
  }, [article, data.site.domain]);

  if (!article) {
    return <Navigate to="/useful" replace />;
  }

  return (
    <PageTransition>
      <UsefulHero title={article.title} description={article.description} variant={article.variant} />
      {article.warning && (
        <section className="pb-8">
          <Container>
            <WarningCard>{article.warning}</WarningCard>
          </Container>
        </section>
      )}
      {article.sections.map((section) => (
        <div key={section.title}>
          <UsefulVisualBreak slug={article.slug} sectionTitle={section.title} />
          <UsefulSection section={section} />
        </div>
      ))}
      <section className="py-12 sm:py-16">
        <Container>
          <Reveal>
            <div className="rounded-premium border border-line bg-ink p-8 text-white shadow-soft sm:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-200">Помощь</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">{article.cta.title}</h2>
              <p className="mt-5 max-w-3xl text-base leading-7 text-blue-50">{article.cta.description}</p>
              <div className="mt-7">
                <ButtonLink href={data.site.telegramUrl} variant="secondary" showArrow={false}>Написать в Telegram</ButtonLink>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </PageTransition>
  );
}
