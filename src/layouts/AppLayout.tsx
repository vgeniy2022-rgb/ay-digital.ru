import { PropsWithChildren } from 'react';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
