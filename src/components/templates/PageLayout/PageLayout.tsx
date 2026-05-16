import { Navbar } from '@/components/organisms/Navbar';
import { Footer } from '@/components/organisms/Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

export function PageLayout({ children, hideFooter = false }: PageLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">{children}</main>
      {!hideFooter && <Footer />}
    </>
  );
}
