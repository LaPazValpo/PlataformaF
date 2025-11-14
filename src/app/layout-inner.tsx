'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import WhatsappFab from '@/components/whatsapp-fab';
import { Toaster } from '@/components/ui/toaster';
import React from 'react';

export function RootLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isIntranet = pathname.startsWith('/intranet');
  const isLoginPage = pathname === '/login';

  // Define routes that should have a minimal layout (no header/footer)
  const isStandalonePage = isLoginPage;

  if (isStandalonePage) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  // Intranet has its own layout, so we just pass children
  if (isIntranet) {
     return (
        <>
            {children}
            <Toaster />
        </>
     )
  }

  // Default layout for public pages
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <WhatsappFab />
      <Footer />
      <Toaster />
    </div>
  );
}
