import { requireAdmin } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminUsersClient } from "./AdminUsersClient";

export const metadata = {
  title: "Manajemen Users | Admin Sewa Trooper BWI",
  description: "Kelola akun pengguna, hak akses role buyer/admin/owner, dan status akun pengguna.",
};

export default async function AdminUsersPage() {
  await requireAdmin();
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

  return <AdminUsersClient initialUsers={userList} />;
}
