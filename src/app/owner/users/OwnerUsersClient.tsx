"use client";

import { useState } from "react";
import { Users, Shield, UserCheck, UserX, Search, Mail, Phone, Calendar } from "lucide-react";

interface UserItem {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  account_status: string;
  created_at: string;
  roles: string[];
}

export function OwnerUsersClient({ initialUsers }: { initialUsers: UserItem[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "buyer" | "owner" | "admin">("all");

  const filteredUsers = initialUsers.filter((u) => {
    const matchSearch =
      (u.full_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (u.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (u.phone?.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchRole =
      roleFilter === "all" ? true : u.roles.includes(roleFilter);

    return matchSearch && matchRole;
  });

  const totalBuyers = initialUsers.filter((u) => u.roles.includes("buyer")).length;
  const totalOwners = initialUsers.filter((u) => u.roles.includes("owner")).length;
  const totalAdmins = initialUsers.filter((u) => u.roles.includes("admin")).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e4ebef] dark:border-neutral-800">
        <div>
          <span className="text-xs font-bold text-[#327691] tracking-wider uppercase">
            Akses & Keamanan Hak Pengguna
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#263b46] dark:text-neutral-100 tracking-tight mt-1">
            Manajemen Pengguna (Users)
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Pantau dan kelola akun seluruh pengguna terdaftar (Pelanggan, Mitra Armada, dan Administrator).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-200">
            Total {initialUsers.length} Terdaftar
          </span>
        </div>
      </div>

      {/* Ringkasan Role */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-800 shadow-2xs">
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Total Pelanggan (Buyer)</p>
          <p className="text-2xl font-black text-[#263b46] dark:text-neutral-100 mt-1">{totalBuyers}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-800 shadow-2xs">
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Mitra Pemilik (Owner)</p>
          <p className="text-2xl font-black text-[#327691] mt-1">{totalOwners}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-800 shadow-2xs">
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Administrator</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{totalAdmins}</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari nama, email, nomor HP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-800 text-xs sm:text-sm text-[#263b46] dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#327691]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["all", "buyer", "owner", "admin"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                roleFilter === r
                  ? "bg-[#327691] text-white"
                  : "bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-[#263b46] dark:hover:text-neutral-200"
              }`}
            >
              {r === "all" ? "Semua" : r === "buyer" ? "Buyer" : r === "owner" ? "Owner" : "Admin"}
            </button>
          ))}
        </div>
      </div>

      {/* Tabel Pengguna */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-[#e4ebef] dark:border-neutral-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#f8fafc] dark:bg-neutral-800/60 text-[#53636d] dark:text-neutral-400 uppercase tracking-wider text-[11px] border-b border-[#e4ebef] dark:border-neutral-800">
              <tr>
                <th className="py-3.5 px-4 font-bold">Nama & Email</th>
                <th className="py-3.5 px-4 font-bold">Role Hak Akses</th>
                <th className="py-3.5 px-4 font-bold">Status Akun</th>
                <th className="py-3.5 px-4 font-bold">Terdaftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4f6] dark:divide-neutral-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-neutral-400">
                    Tidak ditemukan pengguna yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#fbfcfd] dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#e9f3f7] dark:bg-neutral-800 text-[#327691] font-bold text-xs flex items-center justify-center shrink-0">
                          {u.full_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <strong className="text-[#263b46] dark:text-neutral-100 block truncate">
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
                                ? "bg-purple-100 text-purple-900 border border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800"
                                : r === "owner"
                                ? "bg-sky-100 text-sky-900 border border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800"
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
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
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
