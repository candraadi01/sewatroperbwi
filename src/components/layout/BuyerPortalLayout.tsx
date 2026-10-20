"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  LayoutGrid, 
  ReceiptText, 
  Heart, 
  User, 
  Search, 
  LogOut,
  Shield,
  Briefcase
} from "lucide-react";

export interface BuyerPortalUser {
  id?: string;
  fullName: string;
  email: string;
  roles?: string[];
}

export function BuyerPortalLayout({
  user,
  activeMenu,
  children,
}: {
  user: BuyerPortalUser;
  activeMenu: "beranda" | "katalog" | "pesanan" | "disukai" | "profil";
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { id: "beranda", label: "Beranda", href: "/akun", icon: Home },
    { id: "katalog", label: "Katalog Tour Trooper", href: "/sewa", icon: LayoutGrid },
    { id: "pesanan", label: "Pesanan Saya", href: "/pesanan", icon: ReceiptText },
    { id: "disukai", label: "Disukai", href: "/akun/favorit", icon: Heart },
    { id: "profil", label: "Profil Akun", href: "/akun/profil", icon: User },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen py-6 md:py-8 font-sans">
      <div className="container-app max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Sidebar (Exact Concept from Homestay Banyuwangi Foto 2) */}
          <aside className="w-full lg:w-64 bg-white rounded-2xl border border-[#e4ebef] p-4 shrink-0 shadow-xs">
            {/* User Profile Card */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#f0f4f6]">
              <div className="w-11 h-11 rounded-full bg-[#5d7d8c] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                {user.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "C"}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-[#263b46] truncate">
                  {user.fullName || "Pelanggan"}
                </h2>
                <p className="text-[11px] text-[#8b9ba5] truncate">{user.email}</p>
              </div>
            </div>

            {/* Menu Label */}
            <div className="mt-4 mb-2 px-2 text-[10px] font-bold text-[#8b9ba5] uppercase tracking-wider">
              MENU UTAMA
            </div>

            {/* Nav Links */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = activeMenu === item.id;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? "bg-[#e8f3f7] text-[#327691]"
                        : "text-[#53636d] hover:bg-[#f8fafc] hover:text-[#263b46]"
                    }`}
                  >
                    <Icon size={17} className={isActive ? "text-[#327691]" : "text-[#7b8a94]"} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Switch Role shortcut if user has admin/owner */}
            {(user.roles?.includes("admin") || user.roles?.includes("owner")) && (
              <div className="mt-4 pt-3 border-t border-[#f0f4f6] space-y-1">
                <div className="px-2 mb-1 text-[10px] font-bold text-[#8b9ba5] uppercase tracking-wider">
                  AKSES PENGELOLA
                </div>
                {user.roles.includes("admin") && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition"
                  >
                    <Shield size={14} className="text-[#327691]" />
                    <span>Portal Admin</span>
                  </Link>
                )}
                {user.roles.includes("owner") && (
                  <Link
                    href="/owner"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition"
                  >
                    <Briefcase size={14} className="text-[#327691]" />
                    <span>Portal Pemilik</span>
                  </Link>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-[#f0f4f6] space-y-2">
              <Link
                href="/sewa"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-[#327691] hover:bg-[#2c6881] text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                <Search size={14} />
                <span>Jelajahi Tour Trooper</span>
              </Link>

              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#e11d48] font-bold text-xs rounded-xl border border-rose-100 transition cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Keluar</span>
                </button>
              </form>
            </div>
          </aside>

          {/* Main Dashboard Content Area */}
          <main className="flex-1 w-full min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
