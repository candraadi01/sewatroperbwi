import Link from "next/link";
import { requireAdmin } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/server";
import { Users, Shield, UserCheck, UserX, Mail, Phone, Calendar } from "lucide-react";

export const metadata = {
  title: "Manajemen Users | Admin Sewa Trooper BWI",
  description: "Kelola akun pengguna, hak akses role buyer/admin/owner, dan status akun.",
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

  return (
    <div className="space-y-7 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e4ebef]">
        <div>
          <span className="text-xs font-bold text-[#327691] tracking-wider uppercase">
            Akses & Keamanan
          </span>
          <h1 className="heading-1 mt-1">Manajemen Pengguna (Users)</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Daftar seluruh akun terdaftar (Pelanggan, Pemilik Armada, dan Administrator).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-neutral-100 text-xs font-bold text-neutral-700">
            Total {userList.length} Pengguna
          </span>
        </div>
      </div>

      {/* Tabel Pengguna */}
      <div className="bg-white rounded-2xl border border-[#e4ebef] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#f8fafc] text-[#53636d] uppercase tracking-wider text-[11px] border-b border-[#e4ebef]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Nama & Email</th>
                <th className="py-3.5 px-4 font-bold">Role Hak Akses</th>
                <th className="py-3.5 px-4 font-bold">Status Akun</th>
                <th className="py-3.5 px-4 font-bold">Terdaftar</th>
                <th className="py-3.5 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4f6]">
              {userList.map((u) => (
                <tr key={u.id} className="hover:bg-[#fbfcfd] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#e9f3f7] text-[#327691] font-bold text-xs flex items-center justify-center shrink-0">
                        {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <strong className="text-[#263b46] block truncate">
                          {u.full_name || "Tanpa Nama"}
                        </strong>
                        <span className="text-xs text-neutral-400 block truncate">{u.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r: string) => (
                        <span
                          key={r}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                            r === "admin"
                              ? "bg-purple-100 text-purple-900 border border-purple-200"
                              : r === "owner"
                              ? "bg-sky-100 text-sky-900 border border-sky-200"
                              : "bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        u.account_status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {u.account_status === "active" ? (
                        <>
                          <UserCheck size={12} />
                          <span>Aktif</span>
                        </>
                      ) : (
                        <>
                          <UserX size={12} />
                          <span>Diblokir</span>
                        </>
                      )}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-xs text-neutral-400">
                    {new Date(u.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#327691] hover:bg-[#e9f3f7] transition"
                    >
                      Kelola Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
