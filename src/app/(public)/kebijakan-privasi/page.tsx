import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock } from 'lucide-react';

export default function PrivacyPage() {
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3">
              <Lock className="w-3.5 h-3.5" />
              Perlindungan Privasi Pengguna
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-neutral-900">
              Kebijakan Privasi
            </h1>
            <p className="text-neutral-500 text-sm mt-2">
              Berlaku sejak 13 Oktober 2026 — Komitmen kami menjaga kerahasiaan data pelanggan.
            </p>
          </div>

          <div className="space-y-6 text-sm text-neutral-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-heading font-bold text-neutral-900 mb-2">
                1. Data yang Kami Kumpulkan
              </h2>
              <p>
                Saat Anda melakukan pemesanan Jeep Trooper Banyuwangi, kami mengumpulkan informasi yang diperlukan untuk kepentingan penjemputan dan reservasi armada:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 mt-2">
                <li>Nama lengkap pemesan</li>
                <li>Nomor telepon / WhatsApp aktif untuk koordinasi pengemudi</li>
                <li>Alamat email untuk pengiriman voucher dan konfirmasi pembayaran</li>
                <li>Alamat atau nama hotel tempat penjemputan</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-heading font-bold text-neutral-900 mb-2">
                2. Keamanan Transaksi & Pembayaran
              </h2>
              <p>
                Kami <strong>tidak pernah menyimpan</strong> data kartu kredit atau kredensial perbankan Anda di server kami. Semua pemrosesan pembayaran dilakukan secara terenkripsi langsung melalui gateway resmi Midtrans yang berlisensi Bank Indonesia dan bersertifikasi PCI-DSS.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-heading font-bold text-neutral-900 mb-2">
                3. Penggunaan Informasi
              </h2>
              <p>
                Informasi Anda hanya digunakan untuk:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 mt-2">
                <li>Memvalidasi jadwal keberangkatan armada Trooper</li>
                <li>Menghubungkan driver dengan pemesan saat penjemputan</li>
                <li>Mengirimkan invoice dan tanda bukti bayar</li>
                <li>Pemberitahuan perubahan cuaca atau kondisi rute pegunungan</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-heading font-bold text-neutral-900 mb-2">
                4. Pembagian Data kepada Pihak Ketiga
              </h2>
              <p>
                Kami menjamin tidak akan menjual, menyewakan, atau menyebarkan data pribadi Anda kepada pihak luar yang tidak berkepentingan selain mitra pengemudi resmi yang bertugas melayani perjalanan Anda.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
