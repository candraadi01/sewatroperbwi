"use client";

import { Car, ShieldCheck, BadgePercent, Clock } from "lucide-react";

export function WhyChooseUs() {
  const features = [
    {
      title: "Armada Trooper Prima",
      desc: "Semua unit Jeep Trooper 4x4 selalu dalam kondisi prima, terawat berkala, dan tangguh melibas medan offroad Kawah Ijen hingga Sukamade.",
      icon: <Car size={28} strokeWidth={2.2} />,
    },
    {
      title: "Driver & BBM Lengkap",
      desc: "Sudah termasuk sopir lokal berpengalaman yang paham medan ekstrem, ramah, serta mengutamakan keselamatan dan kenyamanan perjalanan Anda.",
      icon: <ShieldCheck size={28} strokeWidth={2.2} />,
    },
    {
      title: "Harga Transparan",
      desc: "Tidak ada biaya tersembunyi, semua rincian tarif sudah termasuk dalam paket dengan kemudahan DP online dan pelunasan resmi via website.",
      icon: <BadgePercent size={28} strokeWidth={2.2} />,
    },
    {
      title: "Layanan Siap 24/7",
      desc: "Tim operasional dan customer support siap melayani konsultasi jadwal, penjemputan fleksibel, dan pendampingan wisata kapan saja.",
      icon: <Clock size={28} strokeWidth={2.2} />,
    },
  ];

  return (
    <section className="relative bg-[#f8fafc] dark:bg-neutral-950 py-16 sm:py-20 md:py-22 border-b border-[#e4ebef] dark:border-neutral-800 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="container-app max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Section: Selaras dengan Tema Brand (#327691 & #263b46) */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#263b46] dark:text-neutral-100 tracking-tight leading-snug">
            Mengapa Pilih Sewa Trooper Banyuwangi Kami?
          </h2>
          <p className="mt-3 text-xs sm:text-sm md:text-base text-[#53636d] dark:text-neutral-400 font-normal leading-relaxed max-w-2xl mx-auto">
            Kami adalah penyedia layanan rental Jeep Trooper Banyuwangi terpercaya dengan pengalaman bertahun-tahun
          </p>
        </div>

        {/* 4 Kartu Selaras Konsep Brand (Satu Tema Warna Konsisten Ocean Teal #327691, Tidak Warna-Warni) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-7">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="group bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(38,59,70,0.06)] hover:shadow-[0_16px_35px_-8px_rgba(50,118,145,0.15)] border border-[#e4ebef] dark:border-neutral-800 hover:border-[#327691]/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center text-center"
            >
              {/* Ikon Box Squircle Elegan Selaras Warna Brand (#327691 Ocean Teal) */}
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#38839f] via-[#327691] to-[#24586d] text-white flex items-center justify-center mb-5 shadow-md shadow-[#327691]/25 ring-4 ring-[#eef6f9] dark:ring-neutral-800 transition-all duration-300 group-hover:scale-108 group-hover:shadow-lg group-hover:shadow-[#327691]/35"
              >
                {item.icon}
              </div>

              {/* Judul Kartu */}
              <h3 className="text-base sm:text-lg font-bold text-[#263b46] dark:text-neutral-100 tracking-tight mb-2">
                {item.title}
              </h3>

              {/* Deskripsi Kartu */}
              <p className="text-xs sm:text-sm text-[#53636d] dark:text-neutral-400 leading-relaxed font-normal">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
