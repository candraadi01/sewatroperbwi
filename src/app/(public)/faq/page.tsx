import Link from 'next/link';
import { HelpCircle, ArrowLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui';

const FAQS = [
  {
    q: 'Berapa kapasitas penumpang satu armada Jeep Trooper?',
    a: 'Satu unit Jeep Trooper berkapasitas maksimal 6 orang dewasa demi kenyamanan dan keamanan berkendara saat menanjak jalur pegunungan Ijen atau melintasi savana Baluran.',
  },
  {
    q: 'Apakah harga paket sudah termasuk sopir dan bahan bakar (BBM)?',
    a: 'Ya, seluruh paket rute wisata kami sudah termasuk armada Jeep Trooper 4x4, driver handal berpengalaman, dan BBM penuh selama rute perjalanan pulang-pergi.',
  },
  {
    q: 'Kapan waktu penjemputan untuk trip Blue Fire Kawah Ijen?',
    a: 'Penjemputan area Banyuwangi Kota umumnya dimulai pukul 00:00 hingga 00:30 WIB dini hari. Hal ini agar rombongan tiba di Pos Paltuding sebelum gerbang pendakian dibuka pukul 02:00 WIB untuk menyaksikan fenomena Api Biru.',
  },
  {
    q: 'Berapa minimal DP untuk mengamankan pesanan?',
    a: 'Deposit (DP) minimal adalah 30% dari total tagihan paket. Sisa pelunasan (70%) dibayarkan secara langsung saat hari keberangkatan sebelum perjalanan dimulai.',
  },
  {
    q: 'Apakah saya bisa mengubah jadwal keberangkatan (reschedule)?',
    a: 'Bisa, permintaan perubahan tanggal trip dapat diajukan kepada admin selambat-lambatnya 48 jam sebelum jadwal penjemputan, selama unit armada pada tanggal baru masih tersedia.',
  },
  {
    q: 'Bagaimana jika cuaca buruk atau Kawah Ijen ditutup oleh BKSDA?',
    a: 'Jika terjadi penutupan resmi kawasan oleh otoritas pengelola karena gas beracun atau erupsi (force majeure), kami akan menawarkan pilihan pengalihan rute alternatif atau reschedule tanpa biaya penalti.',
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-sand-50 py-10 md:py-16">
      <div className="container-custom max-w-4xl">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-primary-700 font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-200 p-8 md:p-12 shadow-xs space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-800 text-xs font-semibold mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              Pusat Bantuan & Tanya Jawab
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-neutral-900">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h1>
            <p className="text-neutral-600 text-sm mt-2">
              Jawaban seputar pemesanan armada Jeep Trooper, fasilitas paket rute, dan prosedur sewa di Banyuwangi.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-neutral-50/70 border border-neutral-200 hover:border-primary-200 transition"
              >
                <h2 className="text-base font-bold text-neutral-900 mb-2 flex items-start gap-2">
                  <span className="text-primary-700 font-extrabold">Q:</span>
                  <span>{faq.q}</span>
                </h2>
                <p className="text-sm text-neutral-600 pl-6 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-primary-50/60 border border-primary-200 text-center">
            <h3 className="font-bold text-neutral-900 text-base mb-1">
              Masih memiliki pertanyaan lain?
            </h3>
            <p className="text-neutral-600 text-xs mb-4">
              Tim admin operasional kami siap melayani dan memberikan rekomendasi rute terbaik untuk Anda.
            </p>
            <Link
              href="https://wa.me/6281234567890"
              target="_blank"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white text-sm font-semibold rounded-xl shadow-xs transition"
            >
              Hubungi WhatsApp Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
