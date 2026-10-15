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
    label: "Utama",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Pesanan", href: "/admin/pesanan", icon: ShoppingBag },
    ],
  },
  {
    label: "Katalog",
    items: [
      { label: "Produk", href: "/admin/produk", icon: Package },
      { label: "Kategori", href: "/admin/kategori", icon: Package },
      { label: "Penjemputan", href: "/admin/penjemputan", icon: Calendar },
      { label: "Kuota", href: "/admin/kuota", icon: Calendar },
      { label: "Harga", href: "/admin/harga", icon: CreditCard },
      { label: "Kalender", href: "/admin/kalender", icon: Calendar },
      { label: "Promo", href: "/admin/promo", icon: Tag },
    ],
  },
  {
    label: "Konten",
    items: [
      { label: "Halaman", href: "/admin/halaman", icon: FileText },
      { label: "Artikel", href: "/admin/artikel", icon: Newspaper },
      { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
      { label: "Media", href: "/admin/media", icon: Image },
      { label: "Tampilan", href: "/admin/tampilan", icon: Globe },
    ],
  },
  {
    label: "Manajemen",
    items: [
      { label: "Buyer", href: "/admin/buyer", icon: Users },
      { label: "Pembayaran", href: "/admin/pembayaran", icon: CreditCard },
      { label: "Notifikasi", href: "/admin/notifikasi", icon: Bell },
      { label: "Laporan", href: "/admin/laporan", icon: BarChart3 },
    ],
  },
  {
    label: "Sistem",
    items: [
      { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
      { label: "Ketentuan bisnis", href: "/admin/bisnis", icon: FileText },
      { label: "Menu", href: "/admin/menu", icon: Globe },
      { label: "Refund", href: "/admin/refund", icon: CreditCard },
      { label: "Riwayat", href: "/admin/riwayat", icon: History },
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
      <div className="p-5 border-b border-neutral-800">
        <Link href="/admin" className="flex items-center gap-2.5 text-white">
          <Mountain size={26} strokeWidth={2.5} />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-base">Admin Panel</span>
            <span className="text-xs text-neutral-400">Sewa Trooper</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto py-4 px-3"
        aria-label="Admin navigation"
      >
        {navGroups.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="px-3 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-primary-600 text-white"
                        : "text-neutral-300 hover:text-white hover:bg-neutral-800",
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon size={18} className="shrink-0" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-accent-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
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
      <div className="p-4 border-t border-neutral-800">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 mb-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <Globe size={16} />
          Lihat Website
        </Link>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {user.fullName?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.fullName}
            </p>
            <p className="text-xs text-neutral-500 truncate">{user.email}</p>
          </div>
        </div>
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-2 w-full px-3 py-2 mt-1 text-sm text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-neutral-900 border-b border-neutral-800 px-4 h-14 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2 text-white">
          <Mountain size={22} strokeWidth={2.5} />
          <span className="font-bold text-sm">Admin</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-neutral-300 hover:text-white rounded-lg"
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile spacer */}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-neutral-900 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-neutral-900 flex flex-col lg:hidden overflow-hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
