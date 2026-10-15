import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { formatIDR } from "@/lib/utils/currency";
export default async function Page() {
  await requireAdmin();
  const db = await createClient();
  const { data, error } = await db
    .from("payment_ledger")
    .select("id,entry_type,amount,created_at,booking_id")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error)
    return (
      <p className="notice-error">Laporan belum dapat dimuat dari database.</p>
    );
  const paid = (data ?? [])
      .filter((r) => r.entry_type === "payment")
      .reduce((n, r) => n + r.amount, 0),
    refund = (data ?? [])
      .filter((r) => r.entry_type === "refund")
      .reduce((n, r) => n - r.amount, 0);
  return (
    <div className="space-y-7">
      <header>
        <p className="eyebrow">Catatan keuangan</p>
        <h1 className="heading-1 mt-3">Laporan pembayaran</h1>
        <p className="mt-3 text-neutral-500">
          Ringkasan maksimal 500 entri ledger terbaru. Angka ini bukan laporan
          laba atau saldo rekening.
        </p>
      </header>
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          ["Pembayaran tercatat", paid],
          ["Refund tercatat", refund],
          ["Selisih", paid - refund],
        ].map(([l, n]) => (
          <div className="admin-panel" key={l}>
            <p className="text-sm text-neutral-500">{l}</p>
            <p className="text-2xl font-semibold mt-3">
              {formatIDR(Number(n))}
            </p>
          </div>
        ))}
      </div>
      <section className="admin-panel overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr>
              <th className="p-3">Waktu</th>
              <th className="p-3">Jenis</th>
              <th className="p-3">Nominal</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((r) => (
              <tr key={r.id} className="border-t border-neutral-200">
                <td className="p-3">
                  {new Date(r.created_at).toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                  })}
                </td>
                <td className="p-3">{r.entry_type}</td>
                <td className="p-3 whitespace-nowrap">{formatIDR(r.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.length && (
          <p className="text-neutral-500 py-5">
            Belum ada pembayaran terverifikasi.
          </p>
        )}
      </section>
    </div>
  );
}
