import { CallToAction } from '../components/CallToAction';
import { Container } from '../components/Container';
import { PageHero } from '../components/PageHero';
import { PageTransition } from '../components/PageTransition';
import { Reveal } from '../components/Reveal';
import { ServiceCard } from '../components/ServiceCard';
import { pageMeta } from '../data/pageMeta';
import { useSiteData } from '../hooks/useSiteData';

export function ServicesPage() {
  const { data, debug, error, isLoading } = useSiteData();
  const { services } = data;
  const cmsApiUrl = import.meta.env.VITE_CMS_API_URL?.trim() || 'не задан';
  const errorText = error instanceof Error ? error.message : error ? String(error) : 'нет';
  const showCmsDebug = import.meta.env.DEV && import.meta.env.VITE_SHOW_CMS_DEBUG === 'true';

  return (
    <PageTransition>
      <PageHero {...pageMeta.services} />
      <section className="pb-16">
        <Container>
          {showCmsDebug ? (
            <div className="mb-6 rounded-[20px] border border-blue-100 bg-blue-50/70 p-5 text-xs leading-6 text-slate-700 shadow-glass">
              <div className="mb-3 text-sm font-extrabold text-ink">CMS debug</div>
              <div className="grid gap-1">
                <div><span className="font-bold">VITE_CMS_API_URL:</span> {cmsApiUrl}</div>
                <div><span className="font-bold">CMS loading:</span> {String(isLoading)}</div>
                <div><span className="font-bold">CMS error:</span> {errorText}</div>
                <div><span className="font-bold">Services до фильтрации:</span> {debug.apiServicesCount}</div>
                <div><span className="font-bold">Services после фильтрации isActive === true:</span> {debug.activeServicesCount}</div>
                <div><span className="font-bold">Названия после фильтрации:</span> {debug.activeServiceTitles.join(', ') || 'нет'}</div>
                <div>
                  <span className="font-bold">Первый service JSON:</span>
                  <pre className="mt-2 max-h-48 overflow-auto rounded-2xl bg-white/80 p-3 text-[11px] leading-5 text-slate-600">
                    {debug.firstService ? JSON.stringify(debug.firstService, null, 2) : 'нет'}
                  </pre>
                </div>
              </div>
            </div>
          ) : null}
          {services.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-busy={isLoading}>
              {services.map((service, index) => (
                <Reveal delay={index * 0.04} key={service.path}>
                  <ServiceCard service={service} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="rounded-premium border border-line bg-white/82 p-8 text-center text-muted shadow-glass">
              Раздел услуг сейчас обновляется.
            </div>
          )}
        </Container>
      </section>
      <CallToAction />
    </PageTransition>
  );
}
