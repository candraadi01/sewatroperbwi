import { requireOwner } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/server";
import { Users, Shield, UserCheck, UserX, Mail, Phone, Calendar, Search } from "lucide-react";
import { OwnerUsersClient } from "./OwnerUsersClient";

export const metadata = {
  title: "Manajemen Users | Portal Pemilik Sewa Trooper BWI",
  description: "Kelola akun pengguna, hak akses role buyer/admin/owner, dan status akun pengguna.",
};

export default async function OwnerUsersPage() {
  await requireOwner("/owner/users");
  const db = await createAdminClient();

  // Query profiles + roles
  const { data: profiles } = await db
    .from("profiles")
    .select("id, full_name, email, phone, account_status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: roles } = await db.from("user_roles").select("user_id, role");

  const userList = (profiles ?? []).map((p) => {
    const userRoles = (roles ?? [])
      .filter((r) => r.user_id === p.id)
      .map((r) => r.role);
    return {
      ...p,
      roles: userRoles.length ? userRoles : ["buyer"],
    };
  });

  return <OwnerUsersClient initialUsers={userList} />;
}
