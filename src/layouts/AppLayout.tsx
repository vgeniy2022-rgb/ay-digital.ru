import { PropsWithChildren } from 'react';
import { CookieBanner } from '../components/CookieBanner';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <main>{children}</main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
