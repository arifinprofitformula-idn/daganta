import './globals.css';
import { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Daganta - Platform Webstore Instan UMKM & Agen Digital',
  description: 'Daganta membantu UMKM memiliki toko online mandiri yang terhubung dengan WhatsApp secara instan.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${plusJakartaSans.className} antialiased`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
