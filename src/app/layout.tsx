import type { Metadata, Viewport } from "next";
import { Urbanist, Inter } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-scroll-behavior="smooth" className={`${urbanist.variable} ${inter.variable} ${urbanist.className} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${urbanist.className} min-h-full flex flex-col font-sans antialiased`}>
        {/* Skip link for keyboard navigation */}
        <a href="#main-content" className="skip-link">
          Langsung ke konten utama
        </a>
        {children}
      </body>
    </html>
  );
}
