import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AboutPage } from './pages/AboutPage';
import { CasesPage } from './pages/CasesPage';
import { ContactsPage } from './pages/ContactsPage';
import { HomePage } from './pages/HomePage';
import { LegalPage } from './pages/LegalPage';
import { PricesPage } from './pages/PricesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { privacyContent, termsContent } from './data/legal';

export default function App() {
  const location = useLocation();

  return (
    <AppLayout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/prices" element={<PricesPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/privacy" element={<LegalPage content={privacyContent} />} />
          <Route path="/terms" element={<LegalPage content={termsContent} />} />
        </Routes>
      </AnimatePresence>
    </AppLayout>
  );
}
