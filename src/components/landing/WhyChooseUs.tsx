"use client";

import { Car, ShieldCheck, Star, Clock } from "lucide-react";

export function WhyChooseUs() {
  const features = [
    {
      title: "Armada Trooper Prima",
      desc: "Semua unit Jeep Trooper 4x4 selalu dalam kondisi prima, terawat berkala, dan tangguh melibas medan offroad Kawah Ijen hingga Sukamade.",
      icon: <Car size={30} strokeWidth={2.2} />,
      gradient: "from-blue-500 to-blue-600 shadow-blue-500/25",
    },
    {
      title: "Driver & BBM Lengkap",
      desc: "Sudah termasuk sopir lokal berpengalaman yang paham medan ekstrem, ramah, serta mengutamakan keselamatan dan kenyamanan perjalanan Anda.",
      icon: <ShieldCheck size={30} strokeWidth={2.2} />,
      gradient: "from-emerald-500 to-emerald-600 shadow-emerald-500/25",
    },
    {
      title: "Harga Transparan",
      desc: "Tidak ada biaya tersembunyi, semua rincian tarif sudah termasuk dalam paket dengan kemudahan DP online dan pelunasan resmi via website.",
      icon: <Star size={30} strokeWidth={2.2} />,
      gradient: "from-amber-400 to-orange-500 shadow-orange-500/25",
    },
    {
      title: "Layanan Siap 24/7",
      desc: "Tim operasional dan customer support siap melayani konsultasi jadwal, penjemputan fleksibel, dan pendampingan wisata kapan saja.",
      icon: <Clock size={30} strokeWidth={2.2} />,
      gradient: "from-purple-500 to-violet-600 shadow-purple-500/25",
    },
  ];

  return (
    <section className="relative bg-[#fcfdfd] dark:bg-neutral-950 py-16 sm:py-20 md:py-24 border-b border-[#e5edf2] dark:border-neutral-800 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="container-app max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header Section: Mengapa Pilih Kami (Gaya Bersih, Font & Warna Sesuai Foto Referensi) */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-neutral-100 tracking-tight leading-snug">
            Mengapa Pilih Sewa Trooper Banyuwangi Kami?
          </h2>
          <p className="mt-3 text-xs sm:text-sm md:text-base text-slate-500 dark:text-neutral-400 font-normal leading-relaxed max-w-2xl mx-auto">
            Kami adalah penyedia layanan rental Jeep Trooper Banyuwangi terpercaya dengan pengalaman bertahun-tahun
          </p>
        </div>

        {/* 4 Kartu Menarik (Grid 4 Kolom, Ikon Squircle Berwarna Cerah, Center-Aligned Sesuai Foto Referensi) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-7">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="group bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_35px_-8px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-neutral-800/80 transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center text-center"
            >
              {/* Ikon Box Squircle Berwarna Cerah + Gradient & Shadow Menarik */}
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white mb-5 shadow-lg transition-transform duration-300 group-hover:scale-110`}
              >
                {item.icon}
              </div>

              {/* Judul Kartu */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-neutral-100 tracking-tight mb-2">
                {item.title}
              </h3>

              {/* Deskripsi Kartu */}
              <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 leading-relaxed font-normal">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
