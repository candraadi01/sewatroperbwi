import Link from "next/link";
import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { midtransConfigured } from "@/lib/midtrans/snap";
import { bookingStatus } from "@/lib/utils/booking-status";
export default async function Dashboard() {
  await requireAdmin();
  const db = await createClient();
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });
  const results = await Promise.all([
    db
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "payment_received"),
    db
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed")
      .gte("service_date", today),
    db
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending_payment"),
    db
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "refund_pending"),
    db
      .from("bookings")
      .select("booking_code,contact_name,service_date,status")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);
  const failed = results.some((r) => r.error);
  const labels = [
    "Menunggu kendaraan",
    "Perjalanan mendatang",
    "Menunggu pembayaran",
    "Refund perlu ditinjau",
  ];
  return (
    <div className="space-y-7">
      <header>
        <p className="eyebrow">Operasional penyewaan</p>
        <h1 className="heading-1 mt-3">Dashboard</h1>
        <p className="mt-3 text-neutral-500">
          Pembayaran diterima lebih dulu. Konfirmasikan kendaraan setelah
          menghubungi penyedia.
        </p>
      </header>
      {failed ? (
        <p className="notice-error">
          Ringkasan belum dapat dimuat. Periksa migrasi dan akses database.
        </p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {labels.map((l, i) => (
              <Link href="/admin/pesanan" className="admin-panel" key={l}>
                <p className="text-sm text-neutral-500">{l}</p>
                <p className="text-3xl font-semibold mt-3">
                  {results[i].count ?? 0}
                </p>
              </Link>
            ))}
          </div>
          <section className="admin-panel">
            <div className="flex flex-wrap justify-between gap-3">
              <h2 className="heading-3">Pesanan terbaru</h2>
              <Link
                href="/admin/pesanan"
                className="text-sm text-primary-700 underline"
              >
                Kelola pesanan
              </Link>
            </div>
            <div className="divide-y divide-neutral-200 mt-5">
              {results[4].data?.map((b) => (
                <Link
                  className="block py-4 hover:bg-neutral-50 px-2 rounded-lg transition"
                  key={b.booking_code}
                  href={"/admin/pesanan?q=" + encodeURIComponent(b.booking_code)}
                >
                  <p className="text-sm font-semibold">
                    {b.booking_code} · {b.contact_name}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {b.service_date} · {bookingStatus[b.status] || b.status}
                  </p>
                </Link>
              ))}
              {!results[4].data?.length && (
                <p className="text-neutral-500 text-sm py-5">
                  Belum ada pesanan.
                </p>
              )}
            </div>
          </section>
        </>
      )}
      <section className="admin-panel">
        <h2 className="heading-3">Kesiapan operasional</h2>
        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          <p className="text-sm">
            Midtrans:{" "}
            {midtransConfigured()
              ? process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
                ? "kunci produksi terisi"
                : "kunci sandbox terisi"
              : "belum dikonfigurasi"}
          </p>
          <p className="text-sm">
            Cloudinary:{" "}
            {process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_KEY
              ? "kunci terisi"
              : "belum dikonfigurasi"}
          </p>
        </div>
        <p className="text-xs text-neutral-500 mt-4">
          Status ini memeriksa konfigurasi, bukan keberhasilan koneksi provider.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/admin/produk" className="action-link">
            Kelola produk
          </Link>
          <Link href="/admin/bisnis" className="action-link-secondary">
            Atur DP & ketentuan
          </Link>
          <Link href="/admin/pengaturan" className="action-link-secondary">
            Kontak & beranda
          </Link>
        </div>
      </section>
    </div>
  );
}
