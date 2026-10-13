import Link from 'next/link';
import { ShieldCheck, AlertCircle, ArrowLeft, FileText } from 'lucide-react';
import { Card } from '@/components/ui';

export default function TermsPage() {
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
              <FileText className="w-3.5 h-3.5" />
              SOP & Ketentuan Resmi
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-neutral-900">
              Syarat & Ketentuan Sewa Trooper Banyuwangi
            </h1>
            <p className="text-neutral-500 text-sm mt-2">
              Terakhir diperbarui: 13 Oktober 2026 (Versi Pratinjau Pengembangan v1.0)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs md:text-sm flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Catatan Status Operasional:</strong> Dokumen ini merupakan draft ketentuan operasional
              standar yang dirancang untuk platform pemesanan. Kebijakan final mengenai persentase pengembalian dana,
              batas waktu pembatalan, dan klaim kerusakan kendaraan lepas kunci akan diselaraskan dengan keputusan pemilik usaha.
            </div>
          </div>

          <div className="space-y-6 text-sm text-neutral-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-heading font-bold text-neutral-900 mb-2">
                1. Ketentuan Umum Pemesanan
              </h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>Pemesanan paket wisata Jeep Trooper dilakukan secara daring melalui website resmi kami.</li>
                <li>Setiap pemesanan wajib mengonfirmasi tanggal keberangkatan, titik penjemputan, dan jumlah penumpang.</li>
                <li>Kapasitas maksimal satu unit Jeep Trooper adalah 6 orang penumpang demi kenyamanan dan keselamatan perjalanan medan perbukitan.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-heading font-bold text-neutral-900 mb-2">
                2. Kebijakan Pembayaran & Deposit (DP)
              </h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>Untuk mengunci jadwal armada, penyewa diwajibkan melakukan pembayaran deposit minimal sebesar 30% dari total nilai transaksi.</li>
                <li>Pembayaran deposit diproses secara aman melalui payment gateway Midtrans (metode QRIS, Transfer Bank Virtual Account, atau Kartu).</li>
                <li>Sisa pelunasan (70%) dibayarkan secara langsung kepada driver atau koordinator saat hari keberangkatan sebelum trip dimulai.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-heading font-bold text-neutral-900 mb-2">
                3. Kebijakan Penjemputan & Keterlambatan
              </h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>Driver akan standby di titik penjemputan 15 menit sebelum waktu keberangkatan yang telah ditentukan.</li>
                <li>Penyewa dimohon bersiap tepat waktu, khususnya untuk rute malam menuju Kawah Ijen guna mengejar fenomena Blue Fire sebelum fajar menyingsing.</li>
                <li>Keterlambatan penyewa lebih dari 60 menit tanpa pemberitahuan dapat mempengaruhi durasi kunjungan ke destinasi terkait.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-heading font-bold text-neutral-900 mb-2">
                4. Pembatalan & Perubahan Jadwal (Reschedule)
              </h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>Permintaan perubahan tanggal trip (reschedule) dapat diajukan selambat-lambatnya 48 jam sebelum jadwal keberangkatan, bergantung ketersediaan unit.</li>
                <li>Pembatalan karena force majeure (bencana alam, penutupan kawasan Taman Nasional oleh pihak berwenang) akan diberikan opsi reschedule tanpa biaya tambahan.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-heading font-bold text-neutral-900 mb-2">
                5. Keselamatan & Etika Wisata Alam
              </h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>Penyewa diwajibkan menaati instruksi pengemudi demi keselamatan saat melintasi jalur off-road atau medan terjal.</li>
                <li>Dilarang membuang sampah sembarangan dan dilarang memberi makan satwa liar di Taman Nasional Baluran dan Meru Betiri.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
