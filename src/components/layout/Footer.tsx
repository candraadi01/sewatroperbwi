import Link from "next/link";
import { Phone, MapPin, Mail } from "lucide-react";
import { getSiteSettings } from "@/lib/services/settings";

export async function Footer() {
  const settings = await getSiteSettings();
  const email = settings.contact_email || "info@sewajeepbanyuwangi.com";
  const address =
    settings.contact_address ||
    "Jl. Raya Jember - Banyuwangi, Dusun Krajan, Dadapan, Kec. Kabat, Kabupaten Banyuwangi, Jawa Timur 68461";

  return (
    <footer className="relative bg-white font-sans text-white overflow-hidden">
      {/* 1. Elegant Wavy SVG Top Transition (Foto 5) */}
      <div className="w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 180"
          className="w-full h-16 sm:h-24 md:h-28 text-[#0048ba] fill-current preserve-3d"
          preserveAspectRatio="none"
        >
          <path d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,122.7C960,139,1056,149,1152,138.7C1248,128,1344,96,1392,80L1440,64L1440,180L1392,180C1344,180,1248,180,1152,180C1056,180,960,180,864,180C768,180,672,180,576,180C480,180,384,180,288,180C192,180,96,180,48,180L0,180Z" />
        </svg>
      </div>

      {/* 2. Main Footer Body (Deep Royal / Ocean Blue matching Foto 5) */}
      <div className="bg-gradient-to-b from-[#0048ba] via-[#003893] to-[#00286b] pt-4 pb-10">
        <div className="container-app">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-12">
            {/* Kolom 1: Brand Typography & Deskripsi (Foto 5) */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl md:text-3xl font-black italic tracking-tight text-white leading-none">
                  SEWA JEEP
                </h3>
                <span className="block text-xl md:text-2xl font-black italic tracking-wider text-sky-200 leading-tight">
                  TROOPER BWI
                </span>
              </div>

              <p className="text-xs text-sky-100 leading-relaxed font-normal pr-2">
                Sewa Jeep Banyuwangi adalah penyedia layanan wisata dan transportasi Jeep Trooper 4x4 di Banyuwangi yang siap memberikan perjalanan aman, nyaman, dan terpercaya.
              </p>
            </div>

            {/* Kolom 2: Kontak Kami (Foto 5 — Tanpa Tombol WhatsApp) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                <Phone size={18} className="text-sky-300 shrink-0" />
                <h4 className="font-extrabold text-sm uppercase tracking-wide">
                  Kontak Kami
                </h4>
              </div>

              <div className="text-xs text-sky-100 space-y-2 pt-1">
                <div>
                  <span className="font-semibold text-white block">Hotline Kantor:</span>
                  <p className="mt-0.5">0851-8681-5863</p>
                  <p>0822-1000-7144</p>
                </div>

                <div>
                  <span className="font-semibold text-white block">Email :</span>
                  <a href={`mailto:${email}`} className="text-sky-200 hover:text-white transition">
                    {email}
                  </a>
                </div>

                <div>
                  <span className="font-semibold text-white block">Jam Layanan :</span>
                  <p>24 Jam Setiap Hari</p>
                </div>
              </div>
            </div>

            {/* Kolom 3: Alamat (Foto 5) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                <MapPin size={18} className="text-sky-300 shrink-0" />
                <h4 className="font-extrabold text-sm uppercase tracking-wide">
                  Alamat
                </h4>
              </div>

              <div className="text-xs text-sky-100 space-y-1 pt-1 leading-relaxed">
                <p className="font-bold text-white uppercase">
                  PT. SEWA JEEP BANYUWANGI
                </p>
                <p className="text-sky-100">
                  {address}
                </p>
              </div>
            </div>

            {/* Kolom 4: Social Media Kami & Rekening Bank (Foto 5) */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-white mb-2.5">
                  <Mail size={18} className="text-sky-300 shrink-0" />
                  <h4 className="font-extrabold text-sm uppercase tracking-wide">
                    Social Media Kami
                  </h4>
                </div>

                {/* Social media circle button icons */}
                <div className="flex items-center gap-2.5">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-sky-300/40 bg-white/10 hover:bg-white hover:text-[#0048ba] text-white flex items-center justify-center transition text-xs font-bold"
                    aria-label="Facebook"
                  >
                    f
                  </a>
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-sky-300/40 bg-white/10 hover:bg-white hover:text-[#0048ba] text-white flex items-center justify-center transition text-xs font-bold"
                    aria-label="TikTok"
                  >
                    ♪
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-sky-300/40 bg-white/10 hover:bg-white hover:text-[#0048ba] text-white flex items-center justify-center transition text-xs font-bold"
                    aria-label="YouTube"
                  >
                    ▶
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-sky-300/40 bg-white/10 hover:bg-white hover:text-[#0048ba] text-white flex items-center justify-center transition text-xs font-bold"
                    aria-label="Instagram"
                  >
                    📷
                  </a>
                </div>
              </div>

              {/* Rekening Bank (Foto 5) */}
              <div className="pt-2 border-t border-sky-300/20 text-xs text-sky-100">
                <p className="font-bold text-white mb-1">Rekening Bank Resmi</p>
                <p className="text-[11px] text-sky-200">
                  BRI: 0553 – 01 – 000769 – 30 – 6
                </p>
                <p className="text-[11px] font-semibold text-white">
                  PT. SEWA JEEP BANYUWANGI
                </p>
                <p className="text-[11px] text-sky-200 mt-1">
                  BCA: 1800 – 9988 – 77
                </p>
              </div>
            </div>
          </div>

          {/* 3. Bottom Copyright Bar (Foto 5) */}
          <div className="pt-6 border-t border-sky-200/20 flex flex-col sm:flex-row items-center justify-between text-xs text-sky-200 gap-3 text-center sm:text-left">
            <p>
              Copyright © 2026 Sewa Jeep Banyuwangi. All rights reserved. Developed with ❤️ by JMW
            </p>
            <div className="flex items-center gap-4 text-xs text-sky-200">
              <Link href="/syarat-ketentuan" className="hover:text-white transition">
                Syarat & Ketentuan
              </Link>
              <span>•</span>
              <Link href="/kebijakan-privasi" className="hover:text-white transition">
                Kebijakan Privasi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
