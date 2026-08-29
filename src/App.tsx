import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SeoHead } from './components/SeoHead';
import { AppLayout } from './layouts/AppLayout';
import { privacyContent, termsContent } from './data/legal';

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then((module) => ({ default: module.ServicesPage })));
const UsefulIndexPage = lazy(() => import('./pages/UsefulIndexPage').then((module) => ({ default: module.UsefulIndexPage })));
const UsefulArticlePage = lazy(() => import('./pages/UsefulArticlePage').then((module) => ({ default: module.UsefulArticlePage })));
const PricesPage = lazy(() => import('./pages/PricesPage').then((module) => ({ default: module.PricesPage })));
const PriceDirectionPage = lazy(() => import('./pages/PriceDirectionPage').then((module) => ({ default: module.PriceDirectionPage })));
const ProcessPage = lazy(() => import('./pages/ProcessPage').then((module) => ({ default: module.ProcessPage })));
const CasesPage = lazy(() => import('./pages/CasesPage').then((module) => ({ default: module.CasesPage })));
const CasePage = lazy(() => import('./pages/CasePage').then((module) => ({ default: module.CasePage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((module) => ({ default: module.AboutPage })));
const ContactsPage = lazy(() => import('./pages/ContactsPage').then((module) => ({ default: module.ContactsPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then((module) => ({ default: module.LegalPage })));
const SeoLandingPage = lazy(() => import('./pages/SeoLandingPage').then((module) => ({ default: module.SeoLandingPage })));
const WebStudioPage = lazy(() => import('./pages/WebStudioPage').then((module) => ({ default: module.WebStudioPage })));
const LabHomePage = lazy(() => import('./features/lab/home/LabHomePage').then((module) => ({ default: module.LabHomePage })));
const LabBuilderPage = lazy(() => import('./features/lab/builder/LabBuilderPage').then((module) => ({ default: module.LabBuilderPage })));
const BreakWebsitePage = lazy(() => import('./features/lab/game2d/BreakWebsitePage').then((module) => ({ default: module.BreakWebsitePage })));
const TheRoomPage = lazy(() => import('./features/lab/game3d/TheRoomPage').then((module) => ({ default: module.TheRoomPage })));
const PhysicsLabPage = lazy(() => import('./features/lab/physics/PhysicsLabPage').then((module) => ({ default: module.PhysicsLabPage })));
const RetroOsPage = lazy(() => import('./features/lab/retro/RetroOsPage').then((module) => ({ default: module.RetroOsPage })));
const ModernOsPage = lazy(() => import('./features/lab/modernOs/ModernOsPage').then((module) => ({ default: module.ModernOsPage })));
const InfiniteCanvasPage = lazy(() => import('./features/lab/infiniteCanvas/InfiniteCanvasPage').then((module) => ({ default: module.InfiniteCanvasPage })));
const WebsiteBuilderPage = lazy(() => import('./pages/WebsiteBuilderPage').then((module) => ({ default: module.WebsiteBuilderPage })));
const BriefPage = lazy(() => import('./pages/BriefPage').then((module) => ({ default: module.BriefPage })));
const ChangelogPage = lazy(() => import('./pages/ChangelogPage').then((module) => ({ default: module.ChangelogPage })));
const LocalSeoPage = lazy(() => import('./pages/LocalSeoPage').then((module) => ({ default: module.LocalSeoPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));
const StudioProjectsPage = lazy(() => import('./features/site-builder/pages/StudioProjectsPage').then((module) => ({ default: module.StudioProjectsPage })));
const StudioEditorPage = lazy(() => import('./features/site-builder/pages/StudioEditorPage').then((module) => ({ default: module.StudioEditorPage })));
const StudioPreviewPage = lazy(() => import('./features/site-builder/pages/StudioPreviewPage').then((module) => ({ default: module.StudioPreviewPage })));

export default function App() {
  const location = useLocation();

  if (location.pathname === '/studio' || location.pathname.startsWith('/studio/')) {
    const isProjectsRoute = location.pathname === '/studio/projects';
    return (
      <>
        <SeoHead
          title={isProjectsRoute ? 'Проекты SITEVL Studio' : 'SITEVL Studio — визуальный конструктор сайтов'}
          description={isProjectsRoute ? 'Локальное рабочее пространство проектов SITEVL Studio.' : 'Техническое рабочее пространство SITEVL Studio для создания, редактирования и локального сохранения проектов.'}
          canonicalPath={isProjectsRoute ? '/studio/projects' : '/studio'}
          noindex
        />
        <Suspense fallback={<div className="min-h-screen bg-[#0f1115]" />}>
          <Routes>
            <Route path="/studio" element={<StudioProjectsPage />} />
            <Route path="/studio/projects" element={<StudioProjectsPage />} />
            <Route path="/studio/project/:projectId" element={<StudioEditorPage />} />
            <Route path="/studio/preview/:projectId" element={<StudioPreviewPage />} />
            <Route path="*" element={<Navigate to="/studio/projects" replace />} />
          </Routes>
        </Suspense>
      </>
    );
  }

  if (location.pathname === '/lab' || location.pathname.startsWith('/lab/')) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#0c0e12]" />}>
        <Routes>
          <Route path="/lab" element={<LabHomePage />} />
          <Route path="/lab/builder" element={<LabBuilderPage />} />
          <Route path="/lab/2d" element={<BreakWebsitePage />} />
          <Route path="/lab/3d" element={<TheRoomPage />} />
          <Route path="/lab/physics" element={<PhysicsLabPage />} />
          <Route path="/lab/os" element={<Navigate to="/lab/modern-os" replace />} />
          <Route path="/lab/retro" element={<RetroOsPage />} />
          <Route path="/lab/modern-os" element={<ModernOsPage />} />
          <Route path="/lab/canvas" element={<InfiniteCanvasPage />} />
          <Route path="/lab/website-builder" element={<Navigate to="/lab/builder" replace />} />
          <Route path="/lab/builder-legacy" element={<WebsiteBuilderPage />} />
          <Route path="/lab/admin-demo" element={<Navigate to="/lab" replace />} />
          <Route path="/lab/architecture" element={<Navigate to="/lab" replace />} />
          <Route path="/lab/web-evolution" element={<Navigate to="/lab" replace />} />
          <Route path="/lab/seo" element={<Navigate to="/lab" replace />} />
          <Route path="*" element={<Navigate to="/lab" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <AppLayout>
      <AnimatePresence mode="wait">
        <Suspense fallback={<div className="min-h-[50vh]" />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:slug" element={<Navigate to="/services" replace />} />
            <Route path="/useful" element={<UsefulIndexPage />} />
            <Route path="/useful/:slug" element={<UsefulArticlePage />} />
            <Route path="/prices" element={<PricesPage />} />
            <Route path="/prices/:slug" element={<PriceDirectionPage />} />
            <Route path="/cart" element={<Navigate to="/services" replace />} />
            <Route path="/checkout" element={<Navigate to="/contacts" replace />} />
            <Route path="/order-success" element={<Navigate to="/contacts" replace />} />
            <Route path="/process" element={<ProcessPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/cases/:slug" element={<CasePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/privacy" element={<LegalPage content={privacyContent} />} />
            <Route path="/terms" element={<LegalPage content={termsContent} />} />
            <Route path="/primorsky-krai" element={<LocalSeoPage />} />
            <Route path="/computer-help-artem" element={<LocalSeoPage />} />
            <Route path="/computer-help-ussuriysk" element={<LocalSeoPage />} />
            <Route path="/computer-help-nakhodka" element={<LocalSeoPage />} />
            <Route path="/website-development-artem" element={<LocalSeoPage />} />
            <Route path="/website-development-ussuriysk" element={<LocalSeoPage />} />
            <Route path="/website-development-nakhodka" element={<LocalSeoPage />} />
            <Route path="/website-development-vladivostok" element={<WebStudioPage />} />
            <Route path="/brief" element={<BriefPage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="/:landingSlug" element={<SeoLandingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </AppLayout>
  );
}
