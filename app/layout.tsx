import './globals.css';
import { Metadata } from 'next';

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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
