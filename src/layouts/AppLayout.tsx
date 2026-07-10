import { PropsWithChildren } from 'react';
import { CookieBanner } from '../components/CookieBanner';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { MobileStickyCta } from '../components/MobileStickyCta';

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <main className="pb-20 sm:pb-0">{children}</main>
      <Footer />
      <MobileStickyCta />
      <CookieBanner />
    </div>
  );
}
