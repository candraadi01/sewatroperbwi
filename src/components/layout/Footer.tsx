import Link from "next/link";
import { Phone, MapPin, Mail, Clock, ShieldCheck, ChevronRight, MessageCircle } from "lucide-react";
import { getSiteSettings } from "@/lib/services/settings";
import { getVisitorStats } from "@/lib/services/visitor-counter";
import { VisitorCounterWidget } from "./VisitorCounterWidget";

export async function Footer() {
  const settings = await getSiteSettings();
  const visitorStats = getVisitorStats();

  const email = settings.contact_email || "info@sewatrooperbwi.com";
  const phone = settings.contact_phone || settings.contact_whatsapp || "08123456789";
  const waLink = `https://wa.me/${phone.replace(/[^0-9]/g, "")}`;
  const address =
    settings.contact_address ||
    "Jl. Raya Jember - Banyuwangi, Dusun Krajan, Dadapan, Kec. Kabat, Kabupaten Banyuwangi, Jawa Timur 68461";

  const popularTours = [
    { label: "Sewa Jeep Kawah Ijen (Blue Fire)", href: "/sewa/kawah-ijen-kawah-wurung" },
    { label: "Sewa Jeep Baluran & Savana Bekol", href: "/sewa/jeep-baluran" },
    { label: "Sewa Jeep Hutan De Djawatan", href: "/sewa/jeep-djawatan" },
    { label: "Sewa Jeep Pantai Sukamade 2D1N", href: "/sewa/jeep-sukamade" },
    { label: "Sewa Jeep Kawah Wurung Highland", href: "/sewa/kawah-wurung-djawatan" },
    { label: "Rental Trooper Harian + Driver Kota", href: "/sewa/sewa-trooper-harian-kota" },
  ];

  return (
    <footer className="relative bg-white font-sans text-white overflow-hidden">
      {/* 1. Transisi Gelombang SVG Halus ke Footer */}
      <div className="w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 120"
          className="w-full h-12 sm:h-16 md:h-20 text-[#192b35] fill-current preserve-3d"
          preserveAspectRatio="none"
        >
          <path d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,48C840,43,960,53,1080,64C1200,75,1320,85,1380,90.7L1440,96L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z" />
        </svg>
      </div>

      {/* 2. Badan Utama Footer (#192b35 — Deep Oceanic Slate) */}
      <div className="bg-[#192b35] pt-4 pb-12">
        <div className="container-app">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pb-12 border-b border-white/10">
            {/* Kolom 1: Profil & Brand (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#327691] flex items-center justify-center text-white font-black text-lg shadow-md border border-white/20">
                  4x4
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                    SEWA JEEP <span className="text-[#38bdf8]">BWI</span>
                  </h3>
                  <p className="text-[10px] font-bold text-[#8abbd0] tracking-[0.2em] uppercase">
                    Trooper 4x4 Adventure Banyuwangi
                  </p>
                </div>
              </div>

              <p className="text-xs text-[#cbd5e1] leading-relaxed pr-2">
                Penyedia layanan resmi rental dan paket wisata Jeep Trooper 4x4 Banyuwangi. Kami menghadirkan armada offroad tangguh, bersih, ber-AC dengan driver lokal profesional untuk memastikan petualangan Anda aman, nyaman, dan berkesan.
              </p>

              {/* Garansi & Keamanan */}
              <div className="pt-2 flex items-center gap-2 text-xs text-[#94a3b8]">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <span>Unit Terawat • Driver Bersertifikasi • Layanan 24 Jam</span>
              </div>

              {/* Social Media Links */}
              <div className="pt-2 flex items-center gap-2.5">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/15 hover:bg-[#25D366] hover:border-[#25D366] text-white flex items-center justify-center transition"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={16} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/15 hover:bg-[#E4405F] hover:border-[#E4405F] text-white flex items-center justify-center transition"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href={`mailto:${email}`}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/15 hover:bg-[#327691] hover:border-[#327691] text-white flex items-center justify-center transition"
                  aria-label="Email"
                >
                  <Mail size={16} />
                </a>
              </div>
            </div>

            {/* Kolom 2: Destinasi Populer (3 Cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-white border-l-2 border-[#38bdf8] pl-2.5">
                Paket Wisata Populer
              </h4>
              <ul className="space-y-2 text-xs text-[#cbd5e1] pt-1">
                {popularTours.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-1.5 hover:text-white transition-colors"
                    >
                      <ChevronRight size={13} className="text-[#38bdf8] group-hover:translate-x-0.5 transition-transform" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kolom 3: Kontak & Alamat Kantor (3 Cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-white border-l-2 border-[#38bdf8] pl-2.5">
                Kontak & Lokasi
              </h4>
              <div className="text-xs text-[#cbd5e1] space-y-2.5 pt-1 leading-relaxed">
                <div className="flex items-start gap-2">
                  <MapPin size={15} className="text-[#38bdf8] shrink-0 mt-0.5" />
                  <p className="text-[11.5px]">{address}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-[#38bdf8] shrink-0" />
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-white transition font-semibold text-[#f8fafc]">
                    {phone} (WhatsApp/Call)
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-[#38bdf8] shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-white transition text-[#93c5fd]">
                    {email}
                  </a>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-[#94a3b8]">
                  <Clock size={14} className="text-emerald-400 shrink-0" />
                  <span>Pelayanan 24 Jam Setiap Hari</span>
                </div>
              </div>
            </div>

            {/* Kolom 4: VISITOR WEB Real-Time (2 Cols) — Persis Referensi Foto */}
            <div className="lg:col-span-2">
              <VisitorCounterWidget initialStats={visitorStats} />
            </div>
          </div>

          {/* 3. Bottom Copyright Bar & Kebijakan */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#94a3b8] gap-4 text-center sm:text-left">
            <p>
              © {new Date().getFullYear()} <strong className="text-white">PT. Sewa Jeep Banyuwangi</strong>. Hak cipta dilindungi undang-undang.
            </p>
            <div className="flex items-center gap-4 text-xs text-[#94a3b8]">
              <Link href="/syarat-ketentuan" className="hover:text-white transition">
                Syarat & Ketentuan
              </Link>
              <span>•</span>
              <Link href="/kebijakan-privasi" className="hover:text-white transition">
                Kebijakan Privasi
              </Link>
              <span>•</span>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-white transition text-[#38bdf8]">
                Bantuan & FAQ
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
