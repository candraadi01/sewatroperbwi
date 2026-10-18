import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
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
    <html lang="id" data-scroll-behavior="smooth" className={`${poppins.variable} ${poppins.className} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${poppins.className} min-h-full flex flex-col font-sans antialiased`}>
        {/* Skip link for keyboard navigation */}
        <a href="#main-content" className="skip-link">
          Langsung ke konten utama
        </a>
        {children}
      </body>
    </html>
  );
}
