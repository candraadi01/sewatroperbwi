import Link from "next/link";
import { requireOwner } from "@/lib/auth/helpers";
import { getAllBookings } from "@/lib/services/booking";
import { formatIDR } from "@/lib/utils/currency";
import { bookingStatus } from "@/lib/utils/booking-status";
import { ReceiptText, Calendar, Users, Car, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Riwayat Transaksi Armada | Sewa Trooper Banyuwangi",
  description: "Histori pesanan dan rincian bagi hasil armada pemilik.",
};

export default async function OwnerTransaksiPage() {
  await requireOwner("/owner/transaksi");
  const bookings = await getAllBookings();

  return (
    <div className="space-y-7 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e4ebef]">
        <div>
          <span className="text-xs font-bold text-[#327691] tracking-wider uppercase">
            Laporan Finansial
          </span>
          <h1 className="heading-1 mt-1">History Transaksi Armada</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Daftar seluruh pesanan sewa yang menggunakan armada Trooper Anda beserta kalkulasi pendapatan.
          </p>
        </div>
      </div>

      {/* Tabel / Kartu Transaksi */}
      <div className="space-y-4">
        {bookings.map((b) => {
          const ownerShare = Math.round(b.total_amount * 0.85);
          return (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-white border border-[#e4ebef] hover:border-[#327691] transition shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#f0f4f6]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md">
                      {b.id}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {new Date(b.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[#263b46] mt-2">
                    {b.product_name}
                  </h3>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e9f3f7] text-[#327691] border border-[#327691]/20">
                  <CheckCircle2 size={13} />
                  <span>{bookingStatus[b.booking_status] || b.booking_status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs text-[#53636d]">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-[#327691] shrink-0" />
                  <span>{b.service_date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car size={14} className="text-[#327691] shrink-0" />
                  <span>{b.num_units} Unit Trooper</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-[#327691] shrink-0" />
                  <span>{b.num_passengers} Penumpang</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#697780]">Penyewa:</span>
                  <strong className="text-[#263b46] truncate">{b.contact_name}</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-[#f0f4f6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f8fafc] -mx-5 -mb-5 p-4 rounded-b-2xl">
                <div>
                  <span className="text-[11px] text-[#697780]">Total Tarif Sewa:</span>
                  <span className="font-bold text-sm text-[#263b46] ml-1.5">
                    {formatIDR(b.total_amount)}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-emerald-800 font-bold">Pendapatan Bersih Pemilik (85%):</span>
                  <span className="text-base font-black text-emerald-700">
                    {formatIDR(ownerShare)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {!bookings.length && (
          <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200 text-sm text-neutral-400">
            Belum ada riwayat transaksi.
          </div>
        )}
      </div>
    </div>
  );
}
