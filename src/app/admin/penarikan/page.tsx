import { requireAdmin } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/server";
import { PayoutAdminClient } from "./PayoutAdminClient";

export const metadata = {
  title: "Penarikan Dana Pemilik | Admin Sewa Trooper BWI",
  description: "Kelola dan verifikasi permohonan pencairan dana saldo pemilik armada Jeep Trooper Banyuwangi.",
};

export default async function AdminPenarikanPage() {
  await requireAdmin();
  const db = await createAdminClient();

  // Fetch payout requests
  const { data: rawRequests } = await db
    .from("payout_requests")
    .select(`
      id,
      owner_id,
      amount,
      bank_name,
      account_number,
      account_holder,
      status,
      admin_notes,
      transfer_proof_url,
      requested_at,
      processed_at
    `)
    .order("requested_at", { ascending: false })
    .limit(100);

  // Fetch owner profiles for display
  const ownerIds = [...new Set((rawRequests ?? []).map((r) => r.owner_id))];
  let ownerMap: Record<string, { full_name: string; email: string; phone?: string }> = {};

  if (ownerIds.length > 0) {
    const { data: profiles } = await db
      .from("profiles")
      .select("id, full_name, email, phone")
      .in("id", ownerIds);

    if (profiles) {
      ownerMap = Object.fromEntries(profiles.map((p) => [p.id, p]));
    }
  }

  const requests = (rawRequests ?? []).map((req) => ({
    ...req,
    owner_name: ownerMap[req.owner_id]?.full_name || "Pemilik Armada",
    owner_email: ownerMap[req.owner_id]?.email || "-",
    owner_phone: ownerMap[req.owner_id]?.phone || "",
  }));

  return <PayoutAdminClient initialRequests={requests} />;
}
