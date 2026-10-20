"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  LayoutDashboard,
  CalendarCheck2,
  ReceiptText,
  Wallet,
  User,
  Globe,
  Menu,
  X,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/components/ui";

interface OwnerUser {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
}

const ownerNavItems = [
  { label: "Dashboard", href: "/owner", icon: LayoutDashboard },
  { label: "Katalog Armada Pemilik", href: "/owner/armada", icon: Car },
  { label: "Penjadwalan Luar Web", href: "/owner/jadwal", icon: CalendarCheck2 },
  { label: "History Transaksi", href: "/owner/transaksi", icon: ReceiptText },
  { label: "Tarik Tunai", href: "/owner/tarik-dana", icon: Wallet },
  { label: "Profil & Rekening", href: "/owner/profil", icon: User },
];

export function OwnerSidebar({ user }: { user: OwnerUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/owner") return pathname === "/owner";
    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <>
      {/* Logo & Header */}
      <div className="p-5 border-b border-neutral-800">
        <Link href="/owner" className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 rounded-xl bg-[#327691] flex items-center justify-center font-bold text-white shadow-xs">
            <Car size={22} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-base tracking-tight">Portal Pemilik</span>
            <span className="text-xs text-neutral-400 font-medium">Mitra Armada Trooper</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5" aria-label="Navigasi Pemilik">
        <p className="px-3 mb-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
          Menu Pemilik Armada
        </p>
        <ul className="space-y-1">
          {ownerNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
                    active
                      ? "bg-[#327691] text-white shadow-xs"
                      : "text-neutral-300 hover:text-white hover:bg-neutral-800",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon size={18} className={cn("shrink-0", active ? "text-white" : "text-[#327691]")} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Actions */}
      <div className="p-4 border-t border-neutral-800 space-y-2">
        {user.roles.includes("admin") && (
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
          >
            <Shield size={15} className="text-amber-400" />
            <span>Ke Portal Admin</span>
          </Link>
        )}
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
        >
          <Globe size={15} />
          <span>Lihat Website</span>
        </Link>

        <div className="pt-2 border-t border-neutral-800/80 flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-[#327691] flex items-center justify-center text-white font-bold text-xs shrink-0">
            {user.fullName?.[0]?.toUpperCase() || "O"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user.fullName || "Pemilik Armada"}</p>
            <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
          </div>
        </div>

        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-2 w-full px-3 py-2 mt-2 text-xs font-semibold text-neutral-400 hover:text-red-400 hover:bg-neutral-800/60 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span>Keluar Akun</span>
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-neutral-900 border-b border-neutral-800 px-4 h-14 flex items-center justify-between">
        <Link href="/owner" className="flex items-center gap-2 text-white">
          <Car size={20} className="text-[#327691]" />
          <span className="font-bold text-sm">Portal Pemilik</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-neutral-300 hover:text-white rounded-lg cursor-pointer"
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-neutral-900 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-neutral-900 flex flex-col lg:hidden overflow-hidden shadow-2xl">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
