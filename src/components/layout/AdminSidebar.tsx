"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Mountain,
  LayoutDashboard,
  ShoppingBag,
  Package,
  CreditCard,
  Users,
  Settings,
  BarChart3,
  Globe,
  Menu,
  X,
  LogOut,
  Newspaper,
  Shield,
  Compass,
  Calendar,
  Search,
} from "lucide-react";
import { cn } from "@/components/ui";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

// 7 Menu Inti Operasional Admin — Ukuran Font Jelas (text-sm), Proporsional & Rapi
const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Transaksi & Pesanan", href: "/admin/pesanan", icon: ShoppingBag },
  { label: "Jadwal & Kuota", href: "/admin/jadwal", icon: Calendar },
  { label: "Tour & Armada", href: "/admin/produk", icon: Package },
  { label: "Tim Driver", href: "/admin/tim", icon: Users },
  { label: "Kelola Artikel", href: "/admin/artikel", icon: Newspaper },
  { label: "Laporan Finansial", href: "/admin/laporan", icon: BarChart3 },
  { label: "Pengaturan Sistem", href: "/admin/pengaturan", icon: Settings },
];

export function AdminSidebar({ user }: { user: AdminUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/admin/pengaturan") {
      return (
        pathname.startsWith("/admin/pengaturan") ||
        pathname.startsWith("/admin/bisnis") ||
        pathname.startsWith("/admin/promo") ||
        pathname.startsWith("/admin/penjemputan") ||
        pathname.startsWith("/admin/kalender") ||
        pathname.startsWith("/admin/kategori") ||
        pathname.startsWith("/admin/tampilan") ||
        pathname.startsWith("/admin/menu") ||
        pathname.startsWith("/admin/faq") ||
        pathname.startsWith("/admin/testimoni") ||
        pathname.startsWith("/admin/destinasi")
      );
    }
    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 select-none">
      {/* User Profile Card (Matches Homestay Concept) */}
      <div className="p-4 border-b border-[#e4ebef] dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#5d7d8c] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
          {user.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "A"}
        </div>
        <div className="min-w-0 flex-1">
          <span className="font-bold text-sm text-[#263b46] dark:text-neutral-100 block truncate">
            {user.fullName || "Administrator"}
          </span>
          <span className="text-[11px] text-[#8e9da5] dark:text-neutral-400 block truncate">
            {user.email}
          </span>
        </div>
      </div>

      {/* Navigation Links — Ukuran Font Nyaman & Mudah Dibaca */}
      <nav
        className="flex-1 overflow-y-auto py-5 px-3.5 space-y-1.5 bg-white dark:bg-neutral-900"
        aria-label="Navigasi Admin"
      >
        <p className="px-3 mb-2.5 text-[11px] font-bold text-[#8e9da5] dark:text-neutral-500 uppercase tracking-wider">
          Menu Operasional
        </p>
        <ul className="space-y-1">
          {adminNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all",
                    active
                      ? "bg-[#e9f3f7] dark:bg-neutral-800 text-[#2c6881] dark:text-[#8abbd0] shadow-2xs"
                      : "text-[#53636d] dark:text-neutral-400 hover:text-[#263b46] dark:hover:text-white hover:bg-[#f8fafc] dark:hover:bg-neutral-800/60",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon
                    size={19}
                    strokeWidth={2.2}
                    className={cn(
                      "shrink-0",
                      active ? "text-[#327691] dark:text-[#8abbd0]" : "text-[#7b8a94]",
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-[#327691] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Navigasi Cepat & Keluar: 2 Tombol Bersih seperti Konsep Homestay */}
      <div className="p-4 border-t border-[#e4ebef] dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2.5">
        <Link
          href="/sewa"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#327691] hover:bg-[#2c6881] text-white font-bold text-sm rounded-2xl shadow-xs transition cursor-pointer"
        >
          <Search size={16} />
          <span>Jelajahi Tour & Sewa</span>
        </Link>

        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#fff1f2] dark:bg-rose-950/20 hover:bg-[#ffe4e6] dark:hover:bg-rose-950/40 text-[#e11d48] dark:text-rose-400 font-bold text-sm rounded-2xl border border-rose-200 dark:border-rose-900/50 transition cursor-pointer"
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sub Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white dark:bg-neutral-900 border-b border-[#e4ebef] dark:border-neutral-800">
        <span className="font-extrabold text-xs uppercase tracking-wider text-[#327691] dark:text-[#8abbd0]">
          Menu Navigasi Admin
        </span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#e9f3f7] dark:bg-neutral-800 text-[#327691] dark:text-[#8abbd0] font-bold text-xs transition cursor-pointer"
          aria-label="Buka menu navigasi"
        >
          {mobileOpen ? <X size={15} /> : <Menu size={15} />}
          <span>{mobileOpen ? "Tutup" : "Daftar Menu"}</span>
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden animate-in fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          "fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-neutral-900 z-50 shadow-2xl transition-transform duration-200 md:hidden flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white z-10"
          aria-label="Tutup menu"
        >
          <X size={20} />
        </button>
        {sidebarContent}
      </div>

      {/* Desktop Persistent Sidebar (Lebar Pas w-[268px], Sticky di bawah Navbar) */}
      <aside className="hidden md:flex flex-col w-[268px] shrink-0 border-r border-[#e4ebef] dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-16 h-[calc(100vh-64px)] z-20">
        {sidebarContent}
      </aside>
    </>
  );
}
