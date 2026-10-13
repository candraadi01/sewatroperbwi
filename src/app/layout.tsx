import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Sewa Trooper Banyuwangi — Jelajahi Wisata dengan Jeep Trooper',
    template: '%s | Sewa Trooper Banyuwangi',
  },
  description:
    'Layanan sewa Jeep Trooper untuk wisata Banyuwangi dan sekitarnya. Paket wisata Kawah Ijen, Baluran, De Djawatan, dan lainnya. Booking mudah, sopir berpengalaman.',
  keywords: [
    'sewa trooper banyuwangi',
    'jeep trooper banyuwangi',
    'sewa mobil banyuwangi',
    'wisata banyuwangi',
    'kawah ijen',
    'baluran',
    'de djawatan',
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Sewa Trooper Banyuwangi',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#15673e',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans">
        {/* Skip link for keyboard navigation */}
        <a href="#main-content" className="skip-link">
          Langsung ke konten utama
        </a>
        {children}
      </body>
    </html>
  );
}
