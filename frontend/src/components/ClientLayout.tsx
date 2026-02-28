"use client";

import { usePathname } from '@/i18n/routing';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if we are in dashboard (considering the locale prefix)
  // Pathname will be like /fr/dashboard or /mg/dashboard
  const isDashboard = pathname?.split('/').includes('dashboard');

  return (
    <>
      {!isDashboard && <Header />}
      <main className={`flex-1 ${!isDashboard ? 'pt-16' : ''}`}>
        {children}
      </main>
      {!isDashboard && <Footer />}
    </>
  );
}
