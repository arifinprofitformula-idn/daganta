import './globals.css';
import type { Metadata } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  metadataBase: new URL('https://daganta.store'),
  title: {
    default: 'Daganta - Platform Webstore Instan UMKM & Agen Digital',
    template: '%s | Daganta',
  },
  description: 'Daganta membantu UMKM memiliki toko online mandiri yang terhubung dengan WhatsApp secara instan.',
  openGraph: {
    title: 'Daganta - Webstore Instan untuk UMKM dan Agen Digital',
    description:
      'Buat toko online mandiri, kelola produk dan pesanan, lalu arahkan closing ke WhatsApp bersama Daganta.',
    url: 'https://daganta.store',
    siteName: 'Daganta',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Logo Daganta',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'Daganta - Webstore Instan untuk UMKM dan Agen Digital',
    description:
      'Buat toko online mandiri, kelola produk dan pesanan, lalu arahkan closing ke WhatsApp bersama Daganta.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="font-sans" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
