import Link from 'next/link';
import { Mountain, MapPin, Phone, Mail } from 'lucide-react';

const footerLinks = {
  layanan: [
    { label: 'Paket Wisata', href: '/sewa?service=paket_rute' },
    { label: 'Sewa Harian + Sopir', href: '/sewa?service=harian_sopir' },
    { label: 'Sewa Lepas Kunci', href: '/sewa?service=harian_lepas_kunci' },
    { label: 'Semua Kendaraan', href: '/sewa' },
  ],
  informasi: [
    { label: 'Tentang Kami', href: '/tentang' },
    { label: 'Cara Booking', href: '/#cara-booking' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Artikel', href: '/artikel' },
  ],
  kebijakan: [
    { label: 'Syarat & Ketentuan', href: '/syarat-ketentuan' },
    { label: 'Kebijakan Pembatalan', href: '/kebijakan-pembatalan' },
    { label: 'Kebijakan Privasi', href: '/kebijakan-privasi' },
    { label: 'Kontak', href: '/kontak' },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      {/* Main footer */}
      <div className="container-app py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 text-white mb-4">
              <Mountain size={28} strokeWidth={2.5} />
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-lg">Sewa Trooper</span>
                <span className="text-xs text-neutral-400">Banyuwangi</span>
              </div>
            </Link>
            <p className="text-sm text-neutral-400 mb-4 max-w-[280px]">
              Layanan sewa Jeep Trooper untuk wisata Banyuwangi dan sekitarnya. 
              Nikmati petualangan dengan kendaraan yang nyaman dan sopir berpengalaman.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <span className="flex items-center gap-2">
                <MapPin size={16} className="text-primary-400 shrink-0" />
                <span>Banyuwangi, Jawa Timur</span>
              </span>
              <span className="flex items-center gap-2">
                <Phone size={16} className="text-primary-400 shrink-0" />
                <span>Hubungi via WhatsApp</span>
              </span>
              <span className="flex items-center gap-2">
                <Mail size={16} className="text-primary-400 shrink-0" />
                <span>Email tersedia di halaman kontak</span>
              </span>
            </div>
          </div>

          {/* Layanan */}
          <div>
            <h3 className="font-semibold text-white mb-4">Layanan</h3>
            <ul className="space-y-2.5">
              {footerLinks.layanan.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informasi */}
          <div>
            <h3 className="font-semibold text-white mb-4">Informasi</h3>
            <ul className="space-y-2.5">
              {footerLinks.informasi.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kebijakan */}
          <div>
            <h3 className="font-semibold text-white mb-4">Kebijakan</h3>
            <ul className="space-y-2.5">
              {footerLinks.kebijakan.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800">
        <div className="container-app py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-neutral-500">
            © {currentYear} Sewa Trooper Banyuwangi. Hak cipta dilindungi.
          </p>
          <p className="text-xs text-neutral-600">
            Harga dan ketersediaan dapat berubah sewaktu-waktu.
          </p>
        </div>
      </div>
    </footer>
  );
}
