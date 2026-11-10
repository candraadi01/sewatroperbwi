"use client";

import { ShieldCheck, Users, Sparkles, Compass } from "lucide-react";

export function WhyChooseUs() {
  const highlights = [
    {
      stat: "4x4",
      label: "TANGGUH SEGALA MEDAN",
      desc: "Armada Jeep Trooper 4WD prima, siap menjelajahi rute pegunungan, hutan, hingga pesisir pantai.",
      icon: Compass,
    },
    {
      stat: "6 SEAT",
      label: "KAPASITAS LEGA",
      desc: "Ruang kabin lapang dan bersih dengan suspensi nyaman, pas untuk keluarga hingga 6 penumpang.",
      icon: Users,
    },
    {
      stat: "100%",
      label: "PERJALANAN PRIVAT",
      desc: "Eksklusif untuk rombongan Anda tanpa digabung tamu lain. Jadwal dan ritme liburan sepenuhnya fleksibel.",
      icon: ShieldCheck,
    },
    {
      stat: "ALL-IN",
      label: "TARIF TRANSPARAN",
      desc: "Biaya sewa sudah mencakup unit Jeep Trooper, jasa sopir berpengalaman, dan bahan bakar selama perjalanan.",
      icon: Sparkles,
    },
  ];

  return (
    <section className="relative bg-[#fafcfd] text-[#263b46] py-9 sm:py-11 overflow-hidden border-y border-[#e4ebef] select-none">
      {/* Background Blueprint Grid Arsitektural Halus */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="clean-spec-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#263b46" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#clean-spec-grid)" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#263b46" strokeWidth="0.75" strokeDasharray="6 6" />
        </svg>
      </div>

      <div className="container-app max-w-6xl mx-auto px-4 relative z-10">
        {/* Header Elegan & Proporsional */}
        <div className="text-center max-w-2xl mx-auto mb-7 sm:mb-8">
          <span className="inline-block text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] text-[#327691] mb-1.5">
            Standar Kenyamanan Petualangan
          </span>
          <h2 className="font-extrabold text-lg sm:text-xl md:text-2xl text-[#263b46] tracking-tight uppercase">
            Jelajahi Banyuwangi Bersama Jeep Trooper
          </h2>
        </div>

        {/* 4 Pilar Pengalaman Wisata Universal (4x4, 6 Seat, 100% Privat, All-In) */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#e2e8f0]">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group flex flex-col items-center justify-start py-4 sm:py-3 px-3 sm:px-4 text-center hover:bg-white/60 transition-colors"
              >
                {/* Ikon Garis Halus */}
                <div className="w-8 h-8 rounded-lg bg-[#e9f3f7] text-[#327691] flex items-center justify-center mb-2 group-hover:bg-[#327691] group-hover:text-white transition-colors">
                  <Icon size={16} strokeWidth={2} />
                </div>

                {/* Angka / Stat Besar & Tegas */}
                <div className="font-sans font-black text-2xl sm:text-3xl lg:text-4xl text-[#263b46] tracking-tight leading-none my-1">
                  {item.stat}
                </div>

                {/* Label Kapital Spaced */}
                <h3 className="font-sans text-[11px] sm:text-xs font-extrabold tracking-[0.14em] text-[#327691] uppercase mt-1">
                  {item.label}
                </h3>

                {/* Deskripsi Universal yang Berlaku untuk Seluruh Destinasi */}
                <p className="text-[11px] text-[#64748b] leading-relaxed mt-1.5 max-w-[220px]">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
