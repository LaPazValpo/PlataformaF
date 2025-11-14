import type { Metadata } from 'next';
import './globals.css';
import { RootLayoutInner } from './layout-inner';
import FirebaseClientProvider from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'La Paz de Cristo - Servicios Funerarios',
  description:
    'Ofrecemos un acompañamiento respetuoso y digno en los momentos más difíciles. Servicios funerarios completos con transparencia y calidez humana.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <RootLayoutInner>{children}</RootLayoutInner>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
