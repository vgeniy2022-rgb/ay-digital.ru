import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { privacyContent, termsContent } from './data/legal';
import { seoLandingPages } from './data/seoLandingPages';

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then((module) => ({ default: module.ServicesPage })));
const UsefulIndexPage = lazy(() => import('./pages/UsefulIndexPage').then((module) => ({ default: module.UsefulIndexPage })));
const UsefulArticlePage = lazy(() => import('./pages/UsefulArticlePage').then((module) => ({ default: module.UsefulArticlePage })));
const PricesPage = lazy(() => import('./pages/PricesPage').then((module) => ({ default: module.PricesPage })));
const PriceDirectionPage = lazy(() => import('./pages/PriceDirectionPage').then((module) => ({ default: module.PriceDirectionPage })));
const CartPage = lazy(() => import('./pages/CartPage').then((module) => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage })));
const ProcessPage = lazy(() => import('./pages/ProcessPage').then((module) => ({ default: module.ProcessPage })));
const CasesPage = lazy(() => import('./pages/CasesPage').then((module) => ({ default: module.CasesPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((module) => ({ default: module.AboutPage })));
const ContactsPage = lazy(() => import('./pages/ContactsPage').then((module) => ({ default: module.ContactsPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then((module) => ({ default: module.LegalPage })));
const SeoLandingPage = lazy(() => import('./pages/SeoLandingPage').then((module) => ({ default: module.SeoLandingPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));

export default function App() {
  const location = useLocation();

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
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<Navigate to="/contacts" replace />} />
            <Route path="/process" element={<ProcessPage />} />
            <Route path="/cases" element={<CasesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/privacy" element={<LegalPage content={privacyContent} />} />
            <Route path="/terms" element={<LegalPage content={termsContent} />} />
            {seoLandingPages.map((page) => (
              <Route path={page.path} element={<SeoLandingPage page={page} />} key={page.path} />
            ))}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </AppLayout>
  );
}
