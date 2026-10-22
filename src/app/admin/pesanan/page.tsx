import Link from "next/link";
import { getAllBookings } from "@/lib/services/booking";
import { formatIDR } from "@/lib/utils/currency";
import { bookingStatus } from "@/lib/utils/booking-status";
import { OrderActions } from "@/components/admin/OrderActions";
export default async function Orders({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const q = await searchParams;
  const bookings = await getAllBookings();
  const pendingCount = bookings.filter((b) => b.booking_status === "pending_review").length;
  const approvedCount = bookings.filter((b) => b.booking_status === "approved").length;
  const confirmedCount = bookings.filter((b) => ["payment_received", "confirmed"].includes(b.booking_status)).length;

  const rows = bookings.filter(
    (b) =>
      (!q.status || b.booking_status === q.status) &&
      (!q.q ||
        `${b.id} ${b.contact_name} ${b.contact_phone} ${b.product_name}`
          .toLowerCase()
          .includes(q.q.toLowerCase())),
  );
  return (
    <div className="space-y-7 font-sans">
      <header>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Operasional & Konfirmasi Armada</p>
            <h1 className="heading-1 mt-2">Daftar Pesanan (Admin & Pemilik)</h1>
            <p className="mt-2 text-neutral-500 text-sm">
              Kelola konfirmasi ketersediaan armada Jeep Trooper dan pantau pembayaran buyer secara real-time.
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>{pendingCount} Pesanan Baru Menunggu Konfirmasi!</span>
            </div>
          )}
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex flex-wrap gap-2 mt-6">
          <Link
            href="/admin/pesanan"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              !q.status
                ? "bg-[#327691] text-white shadow-xs"
                : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            Semua ({bookings.length})
          </Link>
          <Link
            href="/admin/pesanan?status=pending_review"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              q.status === "pending_review"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/60"
            }`}
          >
            <span>⏳ Menunggu Persetujuan ({pendingCount})</span>
          </Link>
          <Link
            href="/admin/pesanan?status=approved"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              q.status === "approved"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60"
            }`}
          >
            ✓ Disetujui ({approvedCount})
          </Link>
          <Link
            href="/admin/pesanan?status=confirmed"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              q.status === "confirmed"
                ? "bg-sky-600 text-white shadow-xs"
                : "bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-950/60"
            }`}
          >
            🚗 Terkonfirmasi ({confirmedCount})
          </Link>
        </div>
      </header>

      <form className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <label className="admin-field">
          Cari kode, paket, pemesan, atau telepon
          <input
            type="search"
            name="q"
            defaultValue={q.q || ""}
            maxLength={100}
            placeholder="Ketik kata kunci pencarian…"
          />
        </label>
        <label className="admin-field">
          Filter Status
          <select name="status" defaultValue={q.status || ""}>
            <option value="">Semua status</option>
            {Object.entries(bookingStatus).map(([v, l]) => (
              <option value={v} key={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <button className="action-link">Cari</button>
      </form>

      <div className="space-y-5">
        {rows.map((b) => {
          const isPending = b.booking_status === "pending_review";
          const isApproved = b.booking_status === "approved";

          return (
            <article
              key={b.id}
              className={`admin-panel transition-all duration-200 ${
                isPending
                  ? "border-2 border-amber-400 bg-amber-50/20 shadow-xs"
                  : isApproved
                  ? "border-emerald-300 bg-emerald-50/10"
                  : ""
              }`}
            >
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-mono font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                      {b.id}
                    </p>
                    <span className="text-xs text-neutral-400">
                      {new Date(b.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })} WIB
                    </span>
                  </div>
                  <h2 className="heading-3 mt-2">{b.product_name}</h2>
                <p className="mt-2 text-sm text-neutral-600">
                  {b.service_date} · {b.start_time?.slice(0, 5)} WIB ·{" "}
                  {b.num_units} unit · {b.num_passengers} peserta
                </p>
              </div>
              <span className="text-sm font-semibold text-primary-700">
                {bookingStatus[b.booking_status] || b.booking_status}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-7 mt-6">
              <div className="space-y-2 text-sm">
                <p className="font-semibold">{b.contact_name}</p>
                <p>
                  {b.contact_phone} · {b.contact_email}
                </p>
                <p className="text-neutral-600">
                  {b.pickup_address || "Titik awal layanan"}
                </p>
                <p>
                  Total: <strong>{formatIDR(b.total_amount)}</strong>
                </p>
                <p>
                  Terverifikasi: {formatIDR(b.amount_paid)} · Sisa:{" "}
                  {formatIDR(b.remaining_amount)}
                </p>
                <Link
                  className="inline-block pt-2 text-primary-700 underline"
                  href={"/pesanan/" + b.id}
                >
                  Lihat rincian buyer
                </Link>
              </div>
              <OrderActions id={b.database_id} status={b.booking_status} />
            </div>
          </article>
        );
      })}
        {!rows.length && (
          <div className="admin-panel text-neutral-500">
            Tidak ada pesanan yang sesuai.
          </div>
        )}
      </div>
    </div>
  );
}
