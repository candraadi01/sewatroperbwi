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
  Tag,
  Calendar,
  Users,
  FileText,
  Image,
  Settings,
  BarChart3,
  Bell,
  History,
  Globe,
  Menu,
  X,
  LogOut,
  Newspaper,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/components/ui";

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navGroups: NavGroup[] = [
  {
    label: "Menu Utama Admin",
    items: [
      { label: "1. Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "2. Manajemen Users", href: "/admin/users", icon: Users },
      { label: "3. Manajemen Tour & Armada", href: "/admin/produk", icon: Package },
      { label: "4. History Transaksi", href: "/admin/pesanan", icon: ShoppingBag },
      { label: "5. Kelola Artikel", href: "/admin/artikel", icon: Newspaper },
      { label: "6. Kelola Tim Driver", href: "/admin/tim", icon: Users },
      { label: "7. Kelola FAQ", href: "/admin/faq", icon: HelpCircle },
      { label: "8. Penarikan Dana", href: "/admin/penarikan", icon: CreditCard },
      { label: "9. Pengaturan Aplikasi", href: "/admin/pengaturan", icon: Settings },
    ],
  },
  {
    label: "Konfigurasi Lain",
    items: [
      { label: "Kategori Layanan", href: "/admin/kategori", icon: Tag },
      { label: "Area Penjemputan", href: "/admin/penjemputan", icon: Calendar },
      { label: "Kalender & Kuota", href: "/admin/kalender", icon: Calendar },
      { label: "Kode Promo", href: "/admin/promo", icon: Tag },
      { label: "Laporan Finansial", href: "/admin/laporan", icon: BarChart3 },
      { label: "Ketentuan Bisnis", href: "/admin/bisnis", icon: FileText },
    ],
  },
];

export function AdminSidebar({ user }: { user: AdminUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-[#e4ebef] bg-white">
        <Link href="/admin" className="flex items-center gap-2.5 text-[#263b46]">
          <div className="w-9 h-9 rounded-xl bg-[#e9f3f7] text-[#327691] flex items-center justify-center shrink-0">
            <Mountain size={20} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-base tracking-tight text-[#263b46]">Admin Panel</span>
            <span className="text-[11px] font-semibold text-[#327691] tracking-wider uppercase">Sewa Trooper</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto py-4 px-3 bg-white"
        aria-label="Admin navigation"
      >
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-3 mb-2 text-[10px] font-bold text-[#8b9ba5] uppercase tracking-wider">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                      isActive(item.href)
                        ? "bg-[#e8f3f7] text-[#327691]"
                        : "text-[#53636d] hover:text-[#263b46] hover:bg-[#f8fafc]",
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon size={16} className={cn("shrink-0", isActive(item.href) ? "text-[#327691]" : "text-[#7b8a94]")} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-[#327691] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User info + links */}
      <div className="p-4 border-t border-[#e4ebef] bg-[#fafbfc]">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 mb-2 text-xs font-semibold text-[#53636d] hover:text-[#263b46] hover:bg-white rounded-xl border border-transparent hover:border-[#e4ebef] transition-colors"
        >
          <Globe size={15} className="text-[#327691]" />
          <span>Lihat Website</span>
        </Link>
        <div className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-[#e4ebef]">
          <div className="w-8 h-8 rounded-full bg-[#5d7d8c] flex items-center justify-center text-white font-bold text-xs shrink-0">
            {user.fullName?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#263b46] truncate">
              {user.fullName}
            </p>
            <p className="text-[10px] text-[#8b9ba5] truncate">{user.email}</p>
          </div>
        </div>
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 mt-2 bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#e11d48] font-bold text-xs rounded-xl border border-rose-100 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Keluar Akun</span>
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e4ebef] px-4 h-14 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2 text-[#263b46]">
          <Mountain size={20} className="text-[#327691]" />
          <span className="font-bold text-sm">Admin Panel</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-[#263b46] hover:bg-[#f8fafc] rounded-lg"
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-white border-r border-[#e4ebef] z-40">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#e4ebef] flex flex-col lg:hidden overflow-hidden shadow-2xl">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
