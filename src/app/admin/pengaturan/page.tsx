import { Settings, ShieldCheck, CreditCard, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default function AdminSettingsPage() {
  const isMidtransConfigured = Boolean(
    process.env.MIDTRANS_SERVER_KEY &&
      !process.env.MIDTRANS_SERVER_KEY.includes('xxxxx') &&
      !process.env.MIDTRANS_SERVER_KEY.includes('placeholder')
  );

  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-neutral-900">
          Pengaturan Bisnis & Integrasi
        </h1>
        <p className="text-neutral-600 text-sm mt-1">
          Konfigurasi default DP, batas konfirmasi armada, dan status koneksi API eksternal.
        </p>
      </div>

      {/* Integration Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-900 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary-600" />
              Midtrans Payment Gateway
            </span>
            <Badge variant={isMidtransConfigured ? 'success' : 'warning'} className="text-xs">
              {isMidtransConfigured ? 'Terkoneksi' : 'Sandbox (Simulasi Aktif)'}
            </Badge>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {isMidtransConfigured
              ? 'Kunci server Midtrans valid. Siap memproses transaksi pembayaran Snap.'
              : 'Menggunakan mode simulator sandbox. Checkout dan pembayaran simulasi tetap dapat diuji tanpa hambatan.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary-600" />
              Supabase Auth & Database
            </span>
            <Badge variant={isSupabaseConfigured ? 'success' : 'warning'} className="text-xs">
              {isSupabaseConfigured ? 'Terkoneksi' : 'In-Memory Fixtures Aktif'}
            </Badge>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {isSupabaseConfigured
              ? 'Terkoneksi ke database PostgreSQL Supabase dengan RLS policies aktif.'
              : 'Menggunakan seed fixtures lokal yang aman untuk preview & staging.'}
          </p>
        </div>
      </div>

      {/* Kebijakan Pemesanan */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8 shadow-xs space-y-6">
        <h2 className="text-lg font-heading font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary-600" />
          Parameter Kebijakan Transaksi
        </h2>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
            <div>
              <span className="font-semibold text-neutral-800 block">Persentase Deposit (DP)</span>
              <span className="text-xs text-neutral-500">Nilai default yang ditagihkan saat checkout</span>
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  disabled
                  defaultValue={30}
                  className="w-24 px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-lg text-sm font-bold text-neutral-800"
                />
                <span className="text-xs text-neutral-600">% (30 persen)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center pt-4 border-t border-neutral-100">
            <div>
              <span className="font-semibold text-neutral-800 block">Kapasitas Maksimal Penumpang</span>
              <span className="text-xs text-neutral-500">Per unit armada Jeep Trooper</span>
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  disabled
                  defaultValue={6}
                  className="w-24 px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-lg text-sm font-bold text-neutral-800"
                />
                <span className="text-xs text-neutral-600">Orang / Unit</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center pt-4 border-t border-neutral-100">
            <div>
              <span className="font-semibold text-neutral-800 block">Batas Waktu Reschedule</span>
              <span className="text-xs text-neutral-500">Minimal pengajuan perubahan jadwal</span>
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  disabled
                  defaultValue={48}
                  className="w-24 px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-lg text-sm font-bold text-neutral-800"
                />
                <span className="text-xs text-neutral-600">Jam sebelum trip</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-sand-50 border border-neutral-200 text-neutral-600 text-xs">
          💡 Catatan: Form perubahan nilai setting di atas akan diaktifkan secara interaktif setelah disetujui owner.
        </div>
      </div>
    </div>
  );
}
