"use client";

import { Handshake, CalendarCheck2, Globe2, Heart, Plane, Luggage } from "lucide-react";

export function WhyChooseUs() {
  const features = [
    {
      title: "Travel with Heart",
      desc: "Kami bukan hanya menjual paket, tapi juga merawat setiap momen Anda. Liburan bukan sekadar pergi, tapi bagaimana Anda merasa selama di sana.",
      // Icon Line-Art Komposisi Globe & Heart
      icon: (
        <div className="w-14 h-14 rounded-2xl bg-[#eef7f4] border border-[#d2ede3] flex items-center justify-center text-[#1b806a] group-hover:scale-105 group-hover:bg-[#1b806a] group-hover:text-white transition-all duration-300 shadow-xs">
          <div className="relative">
            <Globe2 size={28} strokeWidth={1.9} />
            <span className="absolute -bottom-1 -right-1 bg-white text-[#1b806a] rounded-full p-0.5 shadow-xs">
              <Heart size={13} fill="currentColor" strokeWidth={0} />
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Smart Itinerary Planning",
      desc: "Bukan hanya sekadar “ke sini lalu ke sana”. Kami susun rencana cerdas yang padat keseruan, minim waktu terbuang.",
      // Icon Line-Art Komposisi Koper & Jadwal Cerdas
      icon: (
        <div className="w-14 h-14 rounded-2xl bg-[#eef7f4] border border-[#d2ede3] flex items-center justify-center text-[#1b806a] group-hover:scale-105 group-hover:bg-[#1b806a] group-hover:text-white transition-all duration-300 shadow-xs">
          <div className="relative">
            <Luggage size={28} strokeWidth={1.9} />
            <span className="absolute -bottom-1 -right-1 bg-white text-[#1b806a] rounded-full p-0.5 shadow-xs">
              <CalendarCheck2 size={13} strokeWidth={2.5} />
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Local Partner",
      desc: "Kami bekerja langsung dengan penduduk lokal di tiap destinasi. Hasilnya? Harga bersahabat, pengalaman autentik, dan dampak positif untuk komunitas.",
      // Icon Line-Art Jabat Tangan Kemitraan Lokal
      icon: (
        <div className="w-14 h-14 rounded-2xl bg-[#eef7f4] border border-[#d2ede3] flex items-center justify-center text-[#1b806a] group-hover:scale-105 group-hover:bg-[#1b806a] group-hover:text-white transition-all duration-300 shadow-xs">
          <Handshake size={30} strokeWidth={1.9} />
        </div>
      ),
    },
  ];

  return (
    <section className="relative bg-[#f8fafc] text-[#1e293b] py-14 sm:py-16 md:py-20 border-b border-[#e2e8f0]">
      <div className="container-app max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header Section: Kenapa Memilih Kami? */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 md:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1b806a] tracking-tight">
            Kenapa Memilih Kami?
          </h2>
          <p className="mt-2.5 text-xs sm:text-sm md:text-base text-slate-600 font-normal leading-relaxed">
            Kami memberikan pengalaman wisata yang nyaman, aman, dan terjangkau dengan layanan lokal terbaik.
          </p>
        </div>

        {/* 3 Kartu Kenapa Memilih Kami (Tata Letak Sesuai Foto Referensi) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-3xl p-7 sm:p-8 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.09)] border border-slate-100 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-start text-left"
            >
              {/* Icon Container yang Rapi & Estetik */}
              <div className="mb-6">
                {item.icon}
              </div>

              {/* Judul Kartu */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-2.5">
                {item.title}
              </h3>

              {/* Deskripsi Kartu */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
