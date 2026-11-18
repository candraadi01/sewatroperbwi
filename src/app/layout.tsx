import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Urbanist, Inter } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-urbanist",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Sewa Trooper Banyuwangi — Jelajahi Wisata dengan Jeep Trooper",
    template: "%s | Sewa Trooper Banyuwangi",
  },
  description:
    "Layanan sewa Jeep Trooper untuk wisata Banyuwangi dan sekitarnya. Paket wisata Kawah Ijen, Baluran, De Djawatan, dan lainnya. Booking mudah, sopir berpengalaman.",
  keywords: [
    "sewa trooper banyuwangi",
    "jeep trooper banyuwangi",
    "sewa mobil banyuwangi",
    "wisata banyuwangi",
    "kawah ijen",
    "baluran",
    "de djawatan",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Sewa Trooper Banyuwangi",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#15673e",
};

import { LanguageProvider } from "@/lib/i18n/context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className={`${plusJakartaSans.variable} ${urbanist.variable} ${inter.variable} ${plusJakartaSans.className} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600;1,700&family=Balsamiq+Sans:ital,wght@0,700;1,700&family=Fredoka:wght@700;800;900&family=Mali:wght@700;800&family=Shantell+Sans:ital,wght@0,700;0,800&family=Sniglet:wght@800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${plusJakartaSans.className} min-h-full flex flex-col font-sans antialiased`}>
        <LanguageProvider>
          {/* Skip link for keyboard navigation */}
          <a href="#main-content" className="skip-link">
            Langsung ke konten utama
          </a>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
