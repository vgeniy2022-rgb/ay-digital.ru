import { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CookieBanner } from '../components/CookieBanner';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { MobileStickyCta } from '../components/MobileStickyCta';
import { SeoHead } from '../components/SeoHead';
import { CommandPalette } from '../components/lab/CommandPalette';
import { DeveloperOverlay } from '../components/lab/DeveloperOverlay';
import { XRayController } from '../features/xray/XRayController';
import { isPrivateXRayRoute } from '../features/xray/routeRegistry';

export function AppLayout({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  const privateContent = isPrivateXRayRoute(pathname);
  return (
    <>
    <div id="xray-live-site" className="min-h-screen overflow-x-clip">
      <SeoHead />
      <Header />
      <Breadcrumbs />
      <main id="main-content" data-xray-private={privateContent ? '' : undefined} className="pb-20 sm:pb-0">{children}</main>
      <Footer />
      <MobileStickyCta />
      <CookieBanner />
      <CommandPalette />
      <DeveloperOverlay />
    </div>
    <XRayController />
    </>
  );
}
