import { PropsWithChildren } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CookieBanner } from '../components/CookieBanner';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { MobileStickyCta } from '../components/MobileStickyCta';
import { SeoHead } from '../components/SeoHead';
import { CommandPalette } from '../components/lab/CommandPalette';
import { DeveloperOverlay } from '../components/lab/DeveloperOverlay';
import { XRayController } from '../features/xray/XRayController';

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen overflow-x-clip">
      <SeoHead />
      <Header />
      <Breadcrumbs />
      <main id="main-content" className="pb-20 sm:pb-0">{children}</main>
      <Footer />
      <MobileStickyCta />
      <CookieBanner />
      <CommandPalette />
      <DeveloperOverlay />
      <XRayController />
    </div>
  );
}
