import Link from 'next/link';
import {
  Mountain,
  MapPin,
  Clock,
  Users,
  Shield,
  Star,
  ChevronRight,
  ArrowRight,
  CalendarCheck,
  CreditCard,
  Truck,
  CheckCircle,
  HelpCircle,
  Compass,
  TreePine,
  Sunrise,
} from 'lucide-react';
import { Button, Card, SectionHeading, Badge } from '@/components/ui';
import { formatIDR } from '@/lib/utils/currency';
import { formatDuration } from '@/lib/utils/date';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sewa Trooper Banyuwangi — Jelajahi Wisata dengan Jeep Trooper',
  description:
    'Layanan sewa Jeep Trooper untuk wisata Banyuwangi dan sekitarnya. Paket Kawah Ijen, Baluran, De Djawatan, Kawah Wurung. Booking mudah, sopir berpengalaman.',
};

/**
 * Data paket unggulan — seed/contoh, bukan tarif resmi.
 * Nantinya diambil dari database.
 */
const featuredPackages = [
  {
    slug: 'kawah-ijen',
    name: 'Kawah Ijen',
    description: 'Saksikan keindahan blue fire dan panorama kawah terbesar di Pulau Jawa.',
    price: 550000,
    duration: 480,
    capacity: 6,
    icon: Sunrise,
    gradient: 'from-blue-600 to-cyan-500',
  },
  {
    slug: 'baluran',
    name: 'Taman Nasional Baluran',
    description: 'Jelajahi "Afrika-nya Jawa" dengan savana luas dan satwa liar yang menakjubkan.',
    price: 550000,
    duration: 300,
    capacity: 6,
    icon: TreePine,
    gradient: 'from-emerald-600 to-green-500',
  },
  {
    slug: 'de-djawatan',
    name: 'De Djawatan',
    description: 'Hutan trembesi ikonik dengan suasana magis bak negeri dongeng.',
    price: 550000,
    duration: 300,
    capacity: 6,
    icon: TreePine,
    gradient: 'from-amber-600 to-yellow-500',
  },
  {
    slug: 'ijen-kawah-wurung',
    name: 'Ijen & Kawah Wurung',
    description: 'Paket lengkap dua kawah spektakuler dalam satu perjalanan epik.',
    price: 950000,
    duration: 720,
    capacity: 6,
    icon: Mountain,
    gradient: 'from-purple-600 to-pink-500',
  },
];

const howToSteps = [
  {
    step: 1,
    icon: Compass,
    title: 'Pilih Paket atau Layanan',
    description: 'Jelajahi katalog dan pilih paket wisata atau layanan sewa yang sesuai kebutuhan Anda.',
  },
  {
    step: 2,
    icon: CalendarCheck,
    title: 'Tentukan Tanggal & Detail',
    description: 'Pilih tanggal, jumlah peserta, penjemputan, dan layanan tambahan yang Anda butuhkan.',
  },
  {
    step: 3,
    icon: CreditCard,
    title: 'Bayar DP atau Lunas',
    description: 'Lakukan pembayaran DP atau lunas melalui berbagai metode pembayaran yang tersedia.',
  },
  {
    step: 4,
    icon: Truck,
    title: 'Siap Berpetualang!',
    description: 'Setelah dikonfirmasi, kendaraan dan sopir siap menjemput Anda di lokasi yang disepakati.',
  },
];

const serviceCategories = [
  {
    icon: MapPin,
    title: 'Paket Rute Wisata',
    description: 'Pilih destinasi, nikmati perjalanan. Harga per kendaraan termasuk sopir.',
    href: '/sewa?service=paket_rute',
    color: 'bg-emerald-50 text-emerald-700',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Clock,
    title: 'Sewa Harian + Sopir',
    description: 'Fleksibel jelajahi Banyuwangi dengan sopir berpengalaman seharian penuh.',
    href: '/sewa?service=harian_sopir',
    color: 'bg-blue-50 text-blue-700',
    iconColor: 'text-blue-600',
  },
  {
    icon: Shield,
    title: 'Sewa Lepas Kunci',
    description: 'Kebebasan penuh menjelajah dengan kendaraan tanpa sopir. Syarat berlaku.',
    href: '/sewa?service=harian_lepas_kunci',
    color: 'bg-amber-50 text-amber-700',
    iconColor: 'text-amber-600',
  },
];

const faqs = [
  {
    question: 'Apa saja yang termasuk dalam paket wisata?',
    answer:
      'Setiap paket mencakup kendaraan Jeep Trooper dan sopir berpengalaman. Tiket masuk destinasi, pemandu wisata, dan makanan umumnya tidak termasuk kecuali disebutkan secara khusus pada detail produk.',
  },
  {
    question: 'Berapa kapasitas Jeep Trooper?',
    answer:
      'Kapasitas penumpang tertera pada setiap produk. Jumlah pasti dan apakah sopir dihitung dalam kapasitas akan dijelaskan di detail layanan.',
  },
  {
    question: 'Bagaimana sistem pembayaran?',
    answer:
      'Anda dapat membayar DP (uang muka) atau langsung lunas saat booking. Pelunasan dilakukan sebelum hari keberangkatan sesuai batas waktu yang berlaku.',
  },
  {
    question: 'Apakah kendaraan pasti tersedia setelah pembayaran?',
    answer:
      'Pembayaran yang berhasil akan kami proses untuk konfirmasi ketersediaan kendaraan. Jika kendaraan tidak tersedia, kami akan menawarkan alternatif atau pengembalian dana sesuai kebijakan yang berlaku.',
  },
  {
    question: 'Bagaimana kebijakan pembatalan?',
    answer:
      'Kebijakan pembatalan dan pengembalian dana tertera di halaman Syarat & Ketentuan. Silakan baca sebelum melakukan pemesanan.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-5" />

        {/* Decorative shapes */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />

        <div className="container-app relative z-10 py-20">
          <div className="max-w-3xl">
            <Badge variant="warning" className="mb-6 text-sm px-4 py-1.5">
              🌋 Banyuwangi & Sekitarnya
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Jelajahi{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">
                Banyuwangi
              </span>{' '}
              dengan Jeep Trooper
            </h1>

            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl leading-relaxed">
              Kawah Ijen, Baluran, De Djawatan, dan destinasi spektakuler lainnya. 
              Booking mudah, sopir berpengalaman, petualangan tak terlupakan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/sewa">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Lihat Semua Paket
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <Link href="#cara-booking">
                <Button size="lg" variant="outline" className="text-lg px-8 border-white/30 text-white hover:bg-white/10">
                  Cara Booking
                </Button>
              </Link>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <MapPin size={22} className="text-accent-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-xl">8+</p>
                  <p className="text-white/60 text-sm">Rute Wisata</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Users size={22} className="text-accent-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-xl">6</p>
                  <p className="text-white/60 text-sm">Penumpang/Unit</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Shield size={22} className="text-accent-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-xl">3</p>
                  <p className="text-white/60 text-sm">Jenis Layanan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          KATEGORI LAYANAN
          ============================================================ */}
      <section className="py-16 md:py-20 bg-neutral-50">
        <div className="container-app">
          <SectionHeading
            title="Pilih Layanan Sesuai Kebutuhan"
            subtitle="Tiga jenis layanan untuk berbagai kebutuhan wisata dan perjalanan Anda di Banyuwangi."
            centered
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {serviceCategories.map((category) => (
              <Link key={category.href} href={category.href}>
                <Card
                  variant="bordered"
                  padding="lg"
                  className="h-full group hover:shadow-elevated hover:border-primary-200 transition-all duration-300"
                >
                  <div
                    className={`w-14 h-14 rounded-xl ${category.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <category.icon size={28} className={category.iconColor} />
                  </div>
                  <h3 className="heading-3 text-neutral-900 mb-2">
                    {category.title}
                  </h3>
                  <p className="text-neutral-600 mb-4">{category.description}</p>
                  <span className="inline-flex items-center gap-1 text-primary-600 font-semibold text-sm group-hover:gap-2 transition-all">
                    Lihat pilihan <ChevronRight size={16} />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          PAKET UNGGULAN
          ============================================================ */}
      <section className="py-16 md:py-20">
        <div className="container-app">
          <div className="flex items-end justify-between mb-8">
            <SectionHeading
              title="Paket Wisata Populer"
              subtitle="Destinasi favorit wisatawan dengan rute terencana dan sopir berpengalaman."
              className="mb-0"
            />
            <Link
              href="/sewa"
              className="hidden md:flex items-center gap-1 text-primary-600 font-semibold hover:gap-2 transition-all whitespace-nowrap"
            >
              Lihat Semua <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPackages.map((pkg) => (
              <Link key={pkg.slug} href={`/sewa/${pkg.slug}`}>
                <Card
                  variant="default"
                  padding="none"
                  className="group h-full hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image placeholder — will use Cloudinary */}
                  <div
                    className={`h-48 bg-gradient-to-br ${pkg.gradient} flex items-center justify-center relative overflow-hidden`}
                  >
                    <pkg.icon
                      size={64}
                      className="text-white/30 group-hover:scale-110 transition-transform duration-500"
                    />
                    <Badge
                      variant="sample"
                      className="absolute top-3 left-3 text-xs"
                    >
                      Harga Contoh
                    </Badge>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-lg text-neutral-900 mb-1 group-hover:text-primary-700 transition-colors">
                      {pkg.name}
                    </h3>
                    <p className="text-sm text-neutral-500 mb-4 line-clamp-2">
                      {pkg.description}
                    </p>

                    <div className="flex items-center gap-3 text-sm text-neutral-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDuration(pkg.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {pkg.capacity} orang
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                      <div>
                        <p className="text-xs text-neutral-400">Mulai dari</p>
                        <p className="price-large text-xl">
                          {formatIDR(pkg.price)}
                        </p>
                      </div>
                      <span className="text-xs text-neutral-400">
                        /kendaraan
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/sewa">
              <Button variant="outline" fullWidth>
                Lihat Semua Paket <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          CARA BOOKING
          ============================================================ */}
      <section id="cara-booking" className="py-16 md:py-20 bg-primary-50/50">
        <div className="container-app">
          <SectionHeading
            title="Cara Booking"
            subtitle="Empat langkah mudah untuk memesan Jeep Trooper Anda."
            centered
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howToSteps.map((step) => (
              <div
                key={step.step}
                className="relative bg-white rounded-xl p-6 border border-primary-100 hover:shadow-card transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                    {step.step}
                  </div>
                  <step.icon size={24} className="text-primary-600" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-600">{step.description}</p>

                {/* Connector line (desktop) */}
                {step.step < 4 && (
                  <div className="hidden lg:block absolute top-10 -right-3 w-6 border-t-2 border-dashed border-primary-300" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/sewa">
              <Button size="lg" variant="primary">
                Mulai Booking Sekarang
                <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          KEUNGGULAN
          ============================================================ */}
      <section className="py-16 md:py-20">
        <div className="container-app">
          <SectionHeading
            title="Mengapa Memilih Kami?"
            subtitle="Komitmen kami untuk pengalaman wisata terbaik di Banyuwangi."
            centered
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Booking Aman & Transparan',
                description:
                  'Pembayaran online aman, harga jelas di awal, dan rincian biaya lengkap sebelum checkout.',
              },
              {
                icon: Users,
                title: 'Sopir Berpengalaman',
                description:
                  'Sopir yang mengenal jalur wisata Banyuwangi dan siap memastikan perjalanan nyaman dan aman.',
              },
              {
                icon: Star,
                title: 'Kendaraan Terawat',
                description:
                  'Jeep Trooper yang nyaman untuk medan wisata Banyuwangi, dari savana hingga pegunungan.',
              },
              {
                icon: Clock,
                title: 'Fleksibel & Mudah',
                description:
                  'Pilihan paket rute, sewa harian, atau lepas kunci. Sesuaikan dengan kebutuhan perjalanan Anda.',
              },
              {
                icon: CreditCard,
                title: 'Opsi Pembayaran Lengkap',
                description:
                  'Bayar DP atau langsung lunas. Berbagai metode pembayaran tersedia melalui Midtrans.',
              },
              {
                icon: CheckCircle,
                title: 'Proses Jelas',
                description:
                  'Status booking real-time, konfirmasi ketersediaan, dan bantuan admin untuk setiap pesanan.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex gap-4 p-5 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <feature.icon size={24} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-neutral-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FAQ
          ============================================================ */}
      <section className="py-16 md:py-20 bg-neutral-50">
        <div className="container-app max-w-3xl">
          <SectionHeading
            title="Pertanyaan Umum"
            subtitle="Jawaban untuk pertanyaan yang sering diajukan."
            centered
          />

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-white rounded-xl border border-neutral-200 overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors">
                  <span className="flex items-center gap-3">
                    <HelpCircle
                      size={20}
                      className="text-primary-500 shrink-0"
                    />
                    {faq.question}
                  </span>
                  <ChevronRight
                    size={18}
                    className="text-neutral-400 shrink-0 transition-transform duration-200 group-open:rotate-90"
                  />
                </summary>
                <div className="px-5 pb-5 pt-0 text-neutral-600 leading-relaxed border-t border-neutral-100 mt-0 pt-4">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/faq">
              <Button variant="ghost">
                Lihat Semua FAQ <ChevronRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA BOTTOM
          ============================================================ */}
      <section className="py-16 md:py-20">
        <div className="container-app">
          <div className="gradient-hero rounded-2xl p-8 md:p-12 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                Siap Berpetualang di Banyuwangi?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Booking Jeep Trooper sekarang dan nikmati destinasi wisata terbaik 
                Banyuwangi dengan perjalanan yang nyaman.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/sewa">
                  <Button size="lg" variant="secondary" className="text-lg px-8">
                    Lihat Paket Wisata
                    <ArrowRight size={20} />
                  </Button>
                </Link>
                <Link href="/kontak">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 border-white/30 text-white hover:bg-white/10"
                  >
                    Hubungi Kami
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
