import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Compass,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  Car,
  HeartHandshake,
} from "lucide-react";

export const metadata = {
  title: "Tentang Kami | Sewa Jeep Trooper Banyuwangi",
  description:
    "Mengenal lebih dekat Sewa Jeep Trooper Banyuwangi. Layanan rental Jeep 4x4 terpercaya untuk eksplorasi Kawah Ijen, Baluran, Sukamade, dan destinasi petualangan lainnya.",
};

const teamMembers = [
  {
    name: "Ilham Kurniawan",
    role: "Founder & Operations Lead",
    bio: "Putra daerah Banyuwangi penggiat wisata alam dan offroad. Berdedikasi menghadirkan pengalaman petualangan aman dan berkesan bagi wisatawan domestik maupun mancanegara.",
    image: "/images/landing/tour-kawah-ijen.jpg",
  },
  {
    name: "Pak Joko Santoso",
    role: "Fleet Safety & Chief Mechanic",
    bio: "Spesialis mekanik Jeep 4x4 dengan pengalaman lebih dari 15 tahun. Memastikan setiap unit Trooper dalam kondisi prima dan siap menaklukkan medan berat Sukamade dan Ijen.",
    image: "/images/landing/tour-baluran.jpg",
  },
  {
    name: "Mas Rudi Hartono",
    role: "Senior Driver & Route Navigator",
    bio: "Pengemudi lokal berlisensi yang menguasai medan ekstrem Banyuwangi. Ramah, sigap, dan siap mengabadikan momen foto petualangan terbaik Anda di setiap spot.",
    image: "/images/landing/tour-djawatan.jpg",
  },
  {
    name: "Siti Nurhaliza",
    role: "Customer Experience & Booking",
    bio: "Memastikan proses reservasi dan konsultasi itinerary Anda berjalan cepat, jelas, dan tanpa kendala teknis sejak booking hingga trip selesai.",
    image: "/images/landing/tour-sukamade.jpg",
  },
];

const values = [
  {
    icon: <ShieldCheck className="w-6 h-6 text-[#327691]" />,
    title: "Armada Prima & Terawat",
    desc: "Seluruh Jeep Trooper 4x4 kami melalui pengecekan mekanis rutin sebelum keberangkatan demi keamanan maksimal di jalur berbatu dan menanjak.",
  },
  {
    icon: <Compass className="w-6 h-6 text-[#327691]" />,
    title: "Driver Lokal Ahli",
    desc: "Didampingi sopir asli Banyuwangi yang berpengalaman menaklukkan rute offroad Ijen, Baluran, hingga pedalaman Sukamade dengan aman.",
  },
  {
    icon: <Award className="w-6 h-6 text-[#327691]" />,
    title: "Harga Transparan & Resmi",
    desc: "Tarif sewa jelas tanpa biaya tersembunyi. Sudah mencakup armada, driver ramah, dan BBM sesuai paket yang dipilih.",
  },
  {
    icon: <HeartHandshake className="w-6 h-6 text-[#327691]" />,
    title: "Pelayanan Sepenuh Hati",
    desc: "Komunikasi responsif, fleksibel mengikuti kebutuhan keluarga atau rombongan, serta siap membantu dokumentasi perjalanan.",
  },
];

import { getSiteSettings, whatsappLink } from "@/lib/services/settings";

export const revalidate = 0; // Pastikan data real-time langsung terambil

export default async function TentangPage() {
  const settings = await getSiteSettings();

  return (
    <div className="bg-[#f7f8f9] min-h-screen font-sans pb-16">
      {/* 1. Header Hero Section */}
      <section className="bg-white border-b border-[#e4ebef] py-12 md:py-16">
        <div className="container-app">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 bg-[#e9f3f7] text-[#327691] rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              Tentang Kami
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#263b46] tracking-tight leading-tight">
              {settings.about_title || "Menghadirkan Petualangan 4x4 Terbaik di Banyuwangi"}
            </h1>
            <p className="mt-4 text-xs sm:text-sm md:text-base text-[#53636d] leading-relaxed">
              {settings.about_description ||
                `${settings.site_name} adalah platform dan paguyuban pengemudi Jeep 4x4 lokal yang berdedikasi mengantarkan Anda menjelajahi keajaiban alam ujung timur Pulau Jawa — mulai dari kawah api biru Ijen, savana liar Baluran, hingga surga penyu Sukamade.`}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-8 border-t border-[#e4ebef]">
            <div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#327691]">1.500+</p>
              <p className="text-xs sm:text-sm text-[#53636d] font-semibold mt-1">Trip Sukses</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#2c6881]">
                {settings.about_fleet_info || "15+ Unit"}
              </p>
              <p className="text-xs sm:text-sm text-[#53636d] font-semibold mt-1">Armada 4x4 Siap Jalan</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#254958]">
                {settings.about_experience_years || "8+ Tahun"}
              </p>
              <p className="text-xs sm:text-sm text-[#53636d] font-semibold mt-1">Pengalaman Layanan</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-amber-500">4.9 / 5</p>
              <p className="text-xs sm:text-sm text-[#53636d] font-semibold mt-1">Rating Kepuasan</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Cerita & Visi Kami */}
      <section className="py-12 md:py-16">
        <div className="container-app">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Visual Image */}
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden shadow-xl border border-[#e4ebef] bg-slate-900 group">
              <Image
                src="/images/landing/hero-bg.jpg"
                alt="Jeep Adventure Banyuwangi"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="inline-block px-2.5 py-1 rounded bg-[#327691] text-white text-[10px] font-extrabold uppercase tracking-wide mb-1.5">
                  Armada Trooper 4x4
                </span>
                <p className="text-sm sm:text-base font-bold drop-shadow-sm">
                  Tangguh di Aspal, Unggul di Jalur Offroad & Bebatuan
                </p>
              </div>
            </div>

            {/* Story Content */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#327691]">
                Cerita Kami
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#263b46] leading-tight">
                Tumbuh Bersama Komunitas Warga & Penggiat Wisata Lokal
              </h2>
              <p className="text-xs sm:text-sm text-[#53636d] leading-relaxed">
                {settings.about_story ||
                  "Bermula dari kecintaan mendalam terhadap alam Banyuwangi dan keinginan memberdayakan ekonomi lokal, kami membentuk jaringan pengemudi dan mekanik Jeep 4x4 yang mengedepankan standar keselamatan tinggi, kenyamanan berkendara, dan etika ramah lingkungan."}
              </p>
              <p className="text-xs sm:text-sm text-[#53636d] leading-relaxed">
                Bagi kami, setiap perjalanan bukan sekadar mengantar dari titik A ke titik B,
                melainkan menyajikan cerita, kehangatan khas masyarakat Osing, serta petualangan
                yang akan Anda kenang seumur hidup.
              </p>

              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#263b46] font-semibold">
                  <CheckCircle2 size={16} className="text-[#327691] shrink-0" />
                  <span>Komitmen zero incident dengan briefing keselamatan sebelum trip</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#263b46] font-semibold">
                  <CheckCircle2 size={16} className="text-[#327691] shrink-0" />
                  <span>Driver memahami spot foto estetik di setiap titik wisata</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#263b46] font-semibold">
                  <CheckCircle2 size={16} className="text-[#327691] shrink-0" />
                  <span>Peralatan recovery darurat siap sedia di setiap kendaraan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Nilai Utama Kami */}
      <section className="bg-white border-y border-[#e4ebef] py-12 md:py-16">
        <div className="container-app">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#327691]">
              Komitmen Kami
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#263b46] mt-1">
              Mengapa Berwisata Bersama Kami?
            </h2>
            <p className="text-xs sm:text-sm text-[#53636d] mt-2">
              Kenyamanan dan kepuasan Anda adalah prioritas utama dalam setiap kilometer perjalanan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#f4f9fb] border border-[#e4ebef] hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#e9f3f7] flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#263b46] mb-1.5">
                  {v.title}
                </h3>
                <p className="text-xs text-[#53636d] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Tim Kami */}
      <section className="py-12 md:py-16">
        <div className="container-app">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#327691]">
              Tim & Kru Lapangan
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#263b46] mt-1">
              Orang-Orang di Balik Kemudi
            </h2>
            <p className="text-xs sm:text-sm text-[#53636d] mt-2">
              Kru profesional yang mendedikasikan tenaga dan pengalamannya demi perjalanan terbaik Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden border border-[#e4ebef] shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="text-sm font-bold leading-tight drop-shadow-sm">
                        {member.name}
                      </h4>
                      <p className="text-[11px] text-[#8abbd0] font-semibold">{member.role}</p>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-[#53636d] leading-relaxed line-clamp-4">
                      {member.bio}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="border-t border-[#e4ebef] pt-2 flex items-center justify-between text-[11px] text-[#327691] font-semibold">
                    <span>Sewa Jeep BWI Team</span>
                    <Car size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Call To Action */}
      <section className="container-app">
        <div className="bg-gradient-to-r from-[#254958] via-[#2c6881] to-[#327691] rounded-2xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black">
              Siap Jelajahi Keindahan Banyuwangi?
            </h2>
            <p className="text-xs sm:text-sm text-slate-100 mt-2">
              Pilih paket rute Jeep Trooper Anda sekarang dan nikmati liburan seru tanpa repot.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/sewa"
              className="w-full sm:w-auto px-6 py-3 bg-white text-[#254958] hover:bg-[#f4f9fb] font-bold text-xs sm:text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 text-center"
            >
              <span>Pilih Paket Jeep</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/destinasi"
              className="w-full sm:w-auto px-6 py-3 bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm rounded-xl transition border border-white/30 text-center"
            >
              <span>Lihat Destinasi</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
