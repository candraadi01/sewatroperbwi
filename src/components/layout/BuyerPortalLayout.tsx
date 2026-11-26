/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ReceiptText,
  User,
  LogOut,
  Shield,
  Car,
  ShoppingBag,
  Globe,
  Menu,
  X,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/components/ui";
import { PortalThemeProvider } from "@/components/theme/PortalThemeContext";
import { PortalNavbar } from "./PortalNavbar";
import { useLanguage } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";

export interface BuyerPortalUser {
  id?: string;
  fullName: string;
  email: string;
  roles?: string[];
  avatarUrl?: string;
  phone?: string;
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
  const router = useRouter();
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
    router.push("/");
  };

  const menuItems = [
    { id: "beranda", label: t("buyer_menu_beranda", "Beranda"), href: "/buyer", icon: Home },
    { id: "katalog", label: t("buyer_menu_katalog", "Katalog Jeep Trooper"), href: "/buyer/katalog", icon: LayoutGrid },
    { id: "pesanan", label: t("buyer_menu_pesanan", "Pesanan Saya"), href: "/buyer/pesanan", icon: ReceiptText },
    { id: "profil", label: t("buyer_menu_profil", "Profil Akun"), href: "/buyer/profil", icon: User },
  ];

  // 4 Item Bottom Navigation Bar untuk Mobile (Label ringkas agar tidak mepet / nrecel)
  const bottomNavItems = [
    { id: "beranda", label: t("bottom_nav_beranda", "Beranda"), href: "/buyer", icon: Home },
    { id: "katalog", label: t("bottom_nav_katalog", "Katalog"), href: "/buyer/katalog", icon: LayoutGrid },
    { id: "pesanan", label: t("bottom_nav_pesanan", "Pesanan"), href: "/buyer/pesanan", icon: ReceiptText },
    { id: "profil", label: t("bottom_nav_profil", "Profil"), href: "/buyer/profil", icon: User },
  ];

  function isItemActive(item: { id: string; href: string }) {
    if (activeMenu) return activeMenu === item.id;
    if (item.href === "/buyer") return pathname === "/buyer";
    return pathname.startsWith(item.href);
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 select-none overflow-y-auto">
      {/* User Profile Card Header */}
      <div className="p-4 border-b border-[#e4ebef] dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName || "Avatar"}
              className="aspect-square rounded-full object-cover shrink-0 shadow-2xs border border-slate-200 dark:border-neutral-700 block"
              style={{ width: "40px", height: "40px", minWidth: "40px", minHeight: "40px", aspectRatio: "1 / 1" }}
            />
          ) : (
            <div
              className="aspect-square rounded-full bg-[#327691] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs"
              style={{ width: "40px", height: "40px", minWidth: "40px", minHeight: "40px", aspectRatio: "1 / 1" }}
            >
              {user.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "P"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="font-bold text-sm text-[#263b46] dark:text-neutral-100 block truncate">
              {user.fullName || "Pelanggan"}
            </span>
            <span className="text-[11px] text-[#8e9da5] dark:text-neutral-400 block truncate">
              {user.email}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav
        className="flex-1 overflow-y-auto py-4 px-3.5 space-y-1 bg-white dark:bg-neutral-900"
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
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer",
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
                      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-[#53636d] dark:text-neutral-400 hover:text-[#263b46] dark:hover:text-white hover:bg-[#f8fafc] dark:hover:bg-neutral-800 transition cursor-pointer"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Shield size={16} className="text-[#327691]" />
                      <span>Dashboard Admin</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/pesanan"
                      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-[#53636d] dark:text-neutral-400 hover:text-[#263b46] dark:hover:text-white hover:bg-[#f8fafc] dark:hover:bg-neutral-800 transition cursor-pointer"
                      onClick={() => setMobileOpen(false)}
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
                      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-[#53636d] dark:text-neutral-400 hover:text-[#263b46] dark:hover:text-white hover:bg-[#f8fafc] dark:hover:bg-neutral-800 transition cursor-pointer"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Car size={16} className="text-[#327691]" />
                      <span>Portal Pemilik</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/owner/transaksi"
                      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-[#53636d] dark:text-neutral-400 hover:text-[#263b46] dark:hover:text-white hover:bg-[#f8fafc] dark:hover:bg-neutral-800 transition cursor-pointer"
                      onClick={() => setMobileOpen(false)}
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

      {/* Footer Navigasi Cepat & Keluar */}
      <div className="p-4 border-t border-[#e4ebef] dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2.5">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#327691] hover:bg-[#2c6881] text-white font-bold text-xs rounded-xl shadow-2xs transition cursor-pointer"
          onClick={() => setMobileOpen(false)}
        >
          <Globe size={15} />
          <span>Ke Beranda Website</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#fff1f2] dark:bg-rose-950/20 hover:bg-[#ffe4e6] dark:hover:bg-rose-950/40 text-[#e11d48] dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-900/50 transition cursor-pointer"
        >
          <LogOut size={15} />
          <span>{t("buyer_menu_keluar", "Keluar")}</span>
        </button>
      </div>
    </div>
  );

  return (
    <PortalThemeProvider>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-neutral-950 font-sans flex flex-col">
        {/* Top Navbar */}
        <PortalNavbar
          user={user}
          portalType="buyer"
          badgeLabel={t("buyer_portal_title", "Portal Pelanggan")}
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
        />

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
            "fixed top-0 bottom-0 left-0 w-72 sm:w-80 max-w-[85vw] bg-white dark:bg-neutral-900 z-50 shadow-2xl transition-transform duration-200 md:hidden flex flex-col",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white z-10 cursor-pointer"
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
          {sidebarContent}
        </div>

        {/* Area Kerja: Sidebar Desktop di Sisi Kiri & Konten di Kanan */}
        <div className="flex-1 flex flex-col md:flex-row w-full">
          {/* Desktop Persistent Sidebar */}
          <aside className="hidden md:flex flex-col w-[268px] shrink-0 border-r border-[#e4ebef] dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-12 sm:top-13 h-[calc(100vh-48px)] sm:h-[calc(100vh-52px)] z-20">
            {sidebarContent}
          </aside>

          {/* Area Konten Utama (diberi pb-24 di mobile agar tidak tertutup bottom bar) */}
          <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
            <main className="flex-1 p-3.5 sm:p-6 md:p-8 lg:p-10 max-w-[1440px] w-full min-w-0 pb-24 md:pb-8">
              {children}
            </main>
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar (5 Kolom Proporsional, Tidak Mepet / Nrecel) */}
        <nav
          className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-[#e4ebef] dark:border-neutral-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-1.5 py-1"
          aria-label="Navigasi Bawah Mobile"
        >
          <div className="grid grid-cols-5 items-center w-full max-w-md mx-auto">
            {bottomNavItems.map((item) => {
              const active = isItemActive(item);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 w-full",
                    active
                      ? "text-[#2c6881] dark:text-[#8abbd0] font-bold"
                      : "text-[#7b8a94] dark:text-neutral-400 hover:text-[#263b46] dark:hover:text-neutral-200",
                  )}
                >
                  <div
                    className={cn(
                      "p-1 rounded-xl transition-colors",
                      active && "bg-[#e9f3f7] dark:bg-neutral-800",
                    )}
                  >
                    <item.icon size={19} strokeWidth={active ? 2.4 : 1.9} />
                  </div>
                  <span className="text-[10px] leading-tight mt-0.5 tracking-tight truncate text-center w-full block">
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Item ke-5 di Pojok Kanan Bawah: Tombol Lainnya (Menu Drawer Hamburger Persis Foto 2 & Foto 3) */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer min-w-0 w-full",
                mobileOpen
                  ? "text-[#2c6881] dark:text-[#8abbd0] font-bold"
                  : "text-[#7b8a94] dark:text-neutral-400 hover:text-[#263b46] dark:hover:text-neutral-200",
              )}
              aria-label="Buka menu lainnya"
            >
              <div
                className={cn(
                  "p-1 rounded-xl transition-colors",
                  mobileOpen && "bg-[#e9f3f7] dark:bg-neutral-800",
                )}
              >
                <Menu size={19} strokeWidth={mobileOpen ? 2.4 : 1.9} />
              </div>
              <span className="text-[10px] leading-tight mt-0.5 tracking-tight truncate text-center w-full block">
                {t("bottom_nav_lainnya", "Lainnya")}
              </span>
            </button>
          </div>
        </nav>
      </div>
    </PortalThemeProvider>
  );
}
