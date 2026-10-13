'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';

export function PaymentSimulator({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSimulateSuccess() {
    setLoading(true);
    try {
      await fetch('/api/webhooks/midtrans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: bookingId,
          status_code: '200',
          gross_amount: '100000',
          transaction_status: 'settlement',
          fraud_status: 'accept',
        }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs">
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="font-bold block text-sm mb-0.5">Sandbox Mode Simulator</span>
          <span>Klik tombol ini untuk mensimulasikan notifikasi sukses pembayaran dari Midtrans:</span>
        </div>
        <Button
          size="sm"
          onClick={handleSimulateSuccess}
          disabled={loading}
          className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 font-semibold gap-1.5"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          Simulasikan Bayar Berhasil
        </Button>
      </div>
    </div>
  );
}
