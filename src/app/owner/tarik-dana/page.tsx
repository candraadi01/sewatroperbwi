import Link from "next/link";
import { requireOwner } from "@/lib/auth/helpers";
import { getAllBookings } from "@/lib/services/booking";
import { createAdminClient } from "@/lib/supabase/server";
import { OwnerPayoutClient } from "./OwnerPayoutClient";

export const metadata = {
  title: "Tarik Tunai / Pencairan Saldo | Sewa Trooper Banyuwangi",
  description: "Formulir pencairan saldo pendapatan pemilik armada Trooper.",
};

export default async function OwnerTarikDanaPage() {
  const user = await requireOwner("/owner/tarik-dana");
  const db = await createAdminClient();

  // Hitung saldo dari booking
  const bookings = await getAllBookings();
  const totalRevenue = bookings
    .filter((b) => ["settlement", "dp_paid"].includes(b.payment_status))
    .reduce((sum, b) => sum + b.amount_paid, 0);

  const availableBalance = Math.round(totalRevenue * 0.85);

  // Ambil riwayat penarikan dana owner dari database
  const { data: rawRequests } = await db
    .from("payout_requests")
    .select("*")
    .eq("owner_id", user.id)
    .order("requested_at", { ascending: false });

  // Ambil data rekening default dari user metadata
  const { data: authUser } = await db.auth.admin.getUserById(user.id);
  const metadata = authUser?.user?.user_metadata || {};

  const prefill = {
    bankName: metadata.bank_name || "BCA (Bank Central Asia)",
    accountNumber: metadata.account_number || "",
    accountHolder: metadata.account_holder || user.fullName || "",
  };

  return (
    <div className="space-y-7 font-sans max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-[#e4ebef]">
        <Link href="/owner" className="text-xs font-bold text-[#327691] hover:underline">
          ← Kembali ke Dashboard Pemilik
        </Link>
        <h1 className="heading-1 mt-2">Tarik Tunai / Pencairan Saldo</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Cairkan saldo pendapatan sewa armada Trooper Anda ke rekening bank yang terdaftar.
        </p>
      </div>

      <OwnerPayoutClient
        availableBalance={availableBalance}
        initialRequests={rawRequests || []}
        prefill={prefill}
      />
    </div>
  );
}
