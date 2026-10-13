import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, MessageSquare, ArrowLeft } from 'lucide-react';
import { Button, Card } from '@/components/ui';

export default function ContactPage() {
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
              <MessageSquare className="w-3.5 h-3.5" />
              Layanan Pelanggan
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-neutral-900">
              Hubungi Kami
            </h1>
            <p className="text-neutral-600 text-sm mt-2">
              Konsultasikan kebutuhan armada sewa Jeep Trooper, paket rute kustom, atau kerjasama wisata di Banyuwangi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-neutral-500 block">WhatsApp / Telepon</span>
                  <span className="font-bold text-neutral-900 text-base">+62 812-3456-7890</span>
                  <span className="text-xs text-neutral-500 block mt-0.5">Respon cepat 24/7</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-neutral-500 block">Email Layanan</span>
                  <span className="font-bold text-neutral-900 text-base">info@sewatrooperbanyuwangi.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-neutral-500 block">Jam Operasional Kantor</span>
                  <span className="font-semibold text-neutral-800 text-sm">Setiap Hari: 06:00 - 22:00 WIB</span>
                  <span className="text-xs text-neutral-500 block">Trip malam Ijen tetap dilayani 24 jam</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-neutral-500 block">Basecamp Operasional</span>
                  <span className="font-semibold text-neutral-800 text-sm">
                    Jl. Banyuwangi Kota, Kabupaten Banyuwangi, Jawa Timur
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Box */}
            <div className="p-6 rounded-2xl bg-sand-50 border border-neutral-200 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-heading font-bold text-neutral-900 mb-2">
                  Pemesanan Cepat via WhatsApp
                </h3>
                <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                  Ingin bertanya langsung mengenai rute gabungan, sewa harian khusus, atau ketersediaan unit untuk rombongan keluarga besar?
                </p>
              </div>

              <Link
                href="https://wa.me/6281234567890?text=Halo%20Admin%20Sewa%20Trooper%20Banyuwangi,%20saya%20ingin%20tanya%20sewa%20jeep"
                target="_blank"
                className="w-full"
              >
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 gap-2">
                  <Phone className="w-4 h-4" />
                  Chat WhatsApp Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
