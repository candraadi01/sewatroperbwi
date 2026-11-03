import { requireAdmin } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/server";
import { PayoutAdminClient, type PayoutItem } from "./PayoutAdminClient";

export const metadata = {
  title: "Pencairan Saldo Mitra | Admin Sewa Trooper BWI",
  description: "Daftar permohonan penarikan saldo pendapatan pemilik armada Jeep Trooper.",
};

export const dynamic = "force-dynamic";

export default async function AdminPenarikanPage() {
  await requireAdmin();
  const db = await createAdminClient();

  const { data: requests } = await db
    .from("payout_requests")
    .select("*")
    .order("requested_at", { ascending: false });

  // Ambil profil pemilik armada untuk melengkapi data request
  const ownerIds = Array.from(new Set((requests || []).map((r) => r.owner_id)));
  let profilesMap: Record<string, { full_name?: string; email?: string; phone?: string }> = {};

  if (ownerIds.length > 0) {
    const { data: profiles } = await db
      .from("profiles")
      .select("id, full_name, email, phone")
      .in("id", ownerIds);

    if (profiles) {
      profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
    }
  }

  const items: PayoutItem[] = (requests || []).map((r) => {
    const owner = profilesMap[r.owner_id] || {};
    return {
      id: r.id,
      owner_id: r.owner_id,
      amount: r.amount,
      bank_name: r.bank_name,
      account_number: r.account_number,
      account_holder: r.account_holder,
      status: r.status,
      admin_notes: r.admin_notes,
      transfer_proof_url: r.transfer_proof_url,
      requested_at: r.requested_at,
      processed_at: r.processed_at,
      owner_name: owner.full_name || r.account_holder || "Mitra Trooper",
      owner_email: owner.email || "-",
      owner_phone: owner.phone || "-",
    };
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#e4ebef] dark:border-neutral-800">
        <span className="text-xs font-bold text-[#327691] uppercase tracking-wider">
          Keuangan & Payout Mitra
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e293b] dark:text-neutral-100 mt-1">
          Penarikan Dana Pemilik Armada
        </h1>
        <p className="text-sm text-[#64748b] dark:text-neutral-400 mt-1">
          Verifikasi dan konfirmasi transfer pencairan saldo dompet pemilik armada Jeep Trooper.
        </p>
      </div>

      <PayoutAdminClient initialRequests={items} />
    </div>
  );
}
