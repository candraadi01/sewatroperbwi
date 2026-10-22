"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Compass, 
  ReceiptText, 
  User, 
  Search, 
  LogOut,
  Shield,
  Car,
  ShoppingBag,
  Globe,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/components/ui";
import { PortalThemeProvider } from "@/components/theme/PortalThemeContext";
import { PortalNavbar } from "./PortalNavbar";
import { useLanguage } from "@/lib/i18n/context";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { createClient } from "@/lib/supabase/client";

export interface BuyerPortalUser {
  id?: string;
  fullName: string;
  email: string;
  roles?: string[];
}

interface BuyerPortalLayoutProps {
  user: BuyerPortalUser;
  activeMenu?: "beranda" | "katalog" | "pesanan" | "profil";
  children: React.ReactNode;
}

export function BuyerPortalLayout({
  user,
  activeMenu,
  children,
}: BuyerPortalLayoutProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[buyer signout client error]", err);
    }
    try {
      await fetch("/auth/signout", { method: "POST" });
    } catch (err) {
      console.error("[buyer signout server error]", err);
    }
    window.location.assign("/");
  };

  const menuItems = [
    { id: "beranda", label: t("buyer_menu_beranda", "Beranda"), href: "/buyer", icon: Home },
    { id: "pesanan", label: t("buyer_menu_pesanan", "Pesanan Saya"), href: "/buyer/pesanan", icon: ReceiptText },
    { id: "katalog", label: t("buyer_menu_katalog", "Katalog Tour 4x4"), href: "/sewa", icon: Compass },
    { id: "profil", label: t("buyer_menu_profil", "Profil Akun"), href: "/buyer/profil", icon: User },
  ];

  function isItemActive(item: typeof menuItems[number]) {
    if (activeMenu) return activeMenu === item.id;
    if (item.href === "/buyer") return pathname === "/buyer";
    return pathname.startsWith(item.href);
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 select-none">
      {/* User Profile Card (Samakan dengan Admin & Owner) */}
      <div className="p-4 border-b border-[#e4ebef] dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#327691] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
          {user.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "P"}
        </div>
        <div className="min-w-0 flex-1">
          <span className="font-bold text-sm text-[#263b46] dark:text-neutral-100 block truncate">
            {user.fullName || "Pelanggan"}
          </span>
          <span className="text-[11px] text-[#8e9da5] dark:text-neutral-400 block truncate">
            {user.email}
          </span>
        </div>
      </div>

      {/* Navigation Links (Ukuran Font text-sm font-bold, Proporsional & Jelas) */}
      <nav
        className="flex-1 overflow-y-auto py-5 px-3.5 space-y-1.5 bg-white dark:bg-neutral-900"
        aria-label="Navigasi Pelanggan"
      >
        <p className="px-3 mb-2.5 text-[11px] font-bold text-[#8e9da5] dark:text-neutral-500 uppercase tracking-wider">
          Menu Utama
        </p>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const active = isItemActive(item);
            return (
              <li key={item.id}>
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
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Akses Pengelola jika akun memiliki role Admin atau Owner */}
        {(user.roles?.includes("admin") || user.roles?.includes("owner")) && (
          <div className="pt-4 mt-3 border-t border-[#f0f4f6] dark:border-neutral-800">
            <p className="px-3 mb-2 text-[11px] font-bold text-[#8e9da5] dark:text-neutral-500 uppercase tracking-wider">
              Akses Pengelola
            </p>
            <ul className="space-y-1">
              {user.roles.includes("admin") && (
                <>
                  <li>
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-[#53636d] dark:text-neutral-400 hover:text-[#263b46] dark:hover:text-white hover:bg-[#f8fafc] dark:hover:bg-neutral-800 transition"
                    >
                      <Shield size={16} className="text-[#327691]" />
                      <span>Dashboard Admin</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/pesanan"
                      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-[#53636d] dark:text-neutral-400 hover:text-[#263b46] dark:hover:text-white hover:bg-[#f8fafc] dark:hover:bg-neutral-800 transition"
                    >
                      <ShoppingBag size={16} className="text-[#327691]" />
                      <span>Kelola Pesanan (Admin)</span>
                    </Link>
                  </li>
                </>
              )}
              {user.roles.includes("owner") && (
                <>
                  <li>
                    <Link
                      href="/owner"
                      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-[#53636d] dark:text-neutral-400 hover:text-[#263b46] dark:hover:text-white hover:bg-[#f8fafc] dark:hover:bg-neutral-800 transition"
                    >
                      <Car size={16} className="text-[#327691]" />
                      <span>Portal Pemilik</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/owner/transaksi"
                      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-[#53636d] dark:text-neutral-400 hover:text-[#263b46] dark:hover:text-white hover:bg-[#f8fafc] dark:hover:bg-neutral-800 transition"
                    >
                      <ShoppingBag size={16} className="text-[#327691]" />
                      <span>Transaksi Armada</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </nav>

      {/* Footer Navigasi Cepat & Keluar: 2 Tombol Bersih seperti Konsep Homestay */}
      <div className="p-4 border-t border-[#e4ebef] dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2.5">
        <Link
          href="/sewa"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#327691] hover:bg-[#2c6881] text-white font-bold text-sm rounded-2xl shadow-xs transition cursor-pointer"
        >
          <Search size={16} />
          <span>{t("buyer_menu_jelajahi", "Jelajahi Tour & Sewa")}</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#fff1f2] dark:bg-rose-950/20 hover:bg-[#ffe4e6] dark:hover:bg-rose-950/40 text-[#e11d48] dark:text-rose-400 font-bold text-sm rounded-2xl border border-rose-200 dark:border-rose-900/50 transition cursor-pointer"
        >
          <LogOut size={16} />
          <span>{t("buyer_menu_keluar", "Keluar")}</span>
        </button>
      </div>
    </div>
  );

  return (
    <PortalThemeProvider>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-neutral-950 font-sans flex flex-col">
        {/* Top Navbar seperti contoh Foto Homestay */}
        <PortalNavbar user={user} portalType="buyer" badgeLabel={t("buyer_portal_title", "Portal Pelanggan")} />

        {/* Mobile Sub Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white dark:bg-neutral-900 border-b border-[#e4ebef] dark:border-neutral-800">
          <span className="font-extrabold text-xs uppercase tracking-wider text-[#327691] dark:text-[#8abbd0]">
            Menu Navigasi Pelanggan
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

        {/* Area Kerja: Sidebar Menempel di Sisi Kiri (w-[268px]) & Konten Luas di Kanan */}
        <div className="flex-1 flex flex-col md:flex-row w-full">
          {/* Desktop Persistent Sidebar (Lebar Pas w-[268px], Sticky di bawah Navbar) */}
          <aside className="hidden md:flex flex-col w-[268px] shrink-0 border-r border-[#e4ebef] dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-16 h-[calc(100vh-64px)] z-20">
            {sidebarContent}
          </aside>

          {/* Area Konten Utama Luas & Responsif */}
          <div className="flex-1 min-w-0 flex flex-col">
            <main className="flex-1 p-5 sm:p-7 md:p-8 lg:p-10 max-w-[1440px] w-full">
              {children}
            </main>
          </div>
        </div>
        {/* Floating Language Switcher in Buyer Portal */}
        <LanguageSelector />
      </div>
    </PortalThemeProvider>
  );
}
