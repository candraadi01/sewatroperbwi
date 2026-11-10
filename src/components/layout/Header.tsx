"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  ChevronDown,
  Compass,
  Car,
  Star,
  Info,
  BookOpen,
  User,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  Heart,
  Bell,
} from "lucide-react";
import type { SiteSettings } from "@/lib/services/settings";
import { useLanguage } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";

export interface HeaderUser {
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
  isAdmin?: boolean;
  isOwner?: boolean;
  roles?: string[];
}

export interface HeaderArticleItem {
  id: string;
  title: string;
  slug: string;
  category_name?: string;
}

export function Header({
  settings: _settings,
  user,
  articles = [],
}: {
  settings?: SiteSettings;
  links?: { label: string; href: string }[];
  user?: HeaderUser | null;
  articles?: HeaderArticleItem[];
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [artikelDropdownOpen, setArtikelDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const { t } = useLanguage();

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const a of articles) {
      if (a.category_name) set.add(a.category_name);
    }
    return Array.from(set);
  }, [articles]);

  const latestArticles = useMemo(() => {
    return articles.slice(0, 4);
  }, [articles]);

  useEffect(() => {
    function close(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setArtikelDropdownOpen(false);
        setUserDropdownOpen(false);
      }
    }
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", close);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[signout client error]", err);
    }
    try {
      await fetch("/auth/signout", { method: "POST" });
    } catch (err) {
      console.error("[signout server error]", err);
    }
    window.location.assign("/");
  };

  return (
    <header className="sticky top-0 z-40 shadow-xs font-sans">
      {/* UNIFIED NAVBAR: Homestay Banyuwangi Clean Palette */}
      <div className="bg-white/95 backdrop-blur-md border-b border-[#e4ebef] text-[#263b46] transition-colors duration-200">
        <div className="container-app flex items-center justify-between h-14 md:h-16 gap-3">
          {/* SISI KIRI: Mobile Menu Button + Logo Sewa Jeep 4x4 Banyuwangi */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-[#263b46] hover:bg-[#f4f9fb] transition"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
              {/* Emblem Badge Ikonik Jeep Trooper 4x4 Banyuwangi Proper & Presisi */}
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 shrink-0 transition-transform duration-300 group-hover:scale-105">
                <svg
                  viewBox="0 0 120 120"
                  className="w-full h-full drop-shadow-md"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Lingkaran Luar & Ring Presisi */}
                  <circle cx="60" cy="60" r="58" fill="#1e3a47" />
                  <circle cx="60" cy="60" r="54" stroke="#327691" strokeWidth="2.5" />
                  <circle cx="60" cy="60" r="50" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />

                  {/* Siluet Matahari Terbit Keemasan */}
                  <circle cx="60" cy="38" r="16" fill="#f59e0b" opacity="0.9" />

                  {/* Siluet Megah Puncak Gunung Ijen & Raung */}
                  <polygon points="12,82 42,32 68,68 88,40 108,82" fill="#2d5263" />
                  <polygon points="42,32 35,43 42,40 49,43" fill="#ffffff" opacity="0.8" />
                  <polygon points="88,40 82,49 88,47 94,49" fill="#ffffff" opacity="0.8" />

                  {/* Kontur Alam Tanah Savana */}
                  <path d="M10 82 Q60 87 110 82 L110 110 L10 110 Z" fill="#162730" />

                  {/* === ANATOMI OTENTIK JEEP TROOPER 4x4 === */}
                  {/* Safari Roof Rack di Atas Atap Kotak Trooper */}
                  <rect x="36" y="52" width="48" height="3" rx="1" fill="#0f172a" />
                  <line x1="42" y1="49" x2="78" y2="49" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
                  <line x1="44" y1="49" x2="44" y2="52" stroke="#0f172a" strokeWidth="1.5" />
                  <line x1="52" y1="49" x2="52" y2="52" stroke="#0f172a" strokeWidth="1.5" />
                  <line x1="60" y1="49" x2="60" y2="52" stroke="#0f172a" strokeWidth="1.5" />
                  <line x1="68" y1="49" x2="68" y2="52" stroke="#0f172a" strokeWidth="1.5" />
                  <line x1="76" y1="49" x2="76" y2="52" stroke="#0f172a" strokeWidth="1.5" />

                  {/* Bodi Kotak Khas Trooper (Warna Kuning Explorer) */}
                  <path d="M34 68 L36 55 L84 55 L86 68 Z" fill="#f59e0b" />
                  {/* Kaca Depan Trooper Kembar */}
                  <rect x="38" y="56.5" width="20" height="9.5" rx="1.5" fill="#e0f2fe" opacity="0.9" />
                  <rect x="62" y="56.5" width="20" height="9.5" rx="1.5" fill="#e0f2fe" opacity="0.9" />

                  {/* Kap Mesin & Grille Depan Kotak Trooper */}
                  <rect x="30" y="68" width="60" height="24" rx="3" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
                  <rect x="36" y="72" width="48" height="15" rx="2" fill="#1e293b" />

                  {/* Kisi-kisi Grille Horisontal Trooper */}
                  <line x1="46" y1="75" x2="74" y2="75" stroke="#64748b" strokeWidth="1.2" />
                  <line x1="46" y1="78" x2="74" y2="78" stroke="#64748b" strokeWidth="1.2" />
                  <line x1="46" y1="81" x2="74" y2="81" stroke="#64748b" strokeWidth="1.2" />
                  <line x1="46" y1="84" x2="74" y2="84" stroke="#64748b" strokeWidth="1.2" />

                  {/* Lampu Utama Bulat Khas Trooper */}
                  <circle cx="41" cy="79.5" r="4.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
                  <circle cx="79" cy="79.5" r="4.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
                  <circle cx="41" cy="79.5" r="2.5" fill="#fef08a" />
                  <circle cx="79" cy="79.5" r="2.5" fill="#fef08a" />

                  {/* Lampu Sein Sudut Oranye Khas Trooper */}
                  <rect x="32" y="76" width="3" height="7" rx="1" fill="#f97316" />
                  <rect x="85" y="76" width="3" height="7" rx="1" fill="#f97316" />

                  {/* Bumper Bull-Bar Pipa Offroad Baja Hitam */}
                  <rect x="26" y="90" width="68" height="5" rx="2" fill="#0f172a" />
                  <path d="M42 90 L45 84 L75 84 L78 90" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Foglamp Sorot Kuning di Bumper */}
                  <circle cx="53" cy="87" r="2" fill="#facc15" />
                  <circle cx="67" cy="87" r="2" fill="#facc15" />

                  {/* Ban Pacul Offroad MT Lebar di Kiri & Kanan Bawah */}
                  <rect x="25" y="78" width="6" height="20" rx="2" fill="#0f172a" />
                  <rect x="89" y="78" width="6" height="20" rx="2" fill="#0f172a" />
                </svg>
              </div>

              {/* Brand Typography — Proporsional di Mobile & Desktop */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-lg md:text-xl font-black text-[#263b46] tracking-tight leading-tight group-hover:text-[#327691] transition-colors whitespace-nowrap">
                    SEWA JEEP
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-[#f59e0b] text-white text-[9px] font-black uppercase tracking-wider">
                    4X4
                  </span>
                </div>
                <span className="text-[8.5px] sm:text-[10px] md:text-[11px] font-bold text-[#327691] tracking-[0.22em] uppercase leading-none mt-0.5 whitespace-nowrap">
                  BANYUWANGI
                </span>
              </div>
            </Link>
          </div>

          {/* SISI KANAN: Navigasi Desktop & Keranjang */}
          <div className="flex items-center gap-2 sm:gap-3">
            <nav
              aria-label="Navigasi Utama"
              className="hidden lg:flex items-center space-x-1 text-[13px] font-semibold"
            >
              <Link
                href="/"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  path === "/"
                    ? "bg-[#e9f3f7] text-[#327691] font-bold"
                    : "text-[#53636d] hover:bg-[#f4f9fb] hover:text-[#263b46]"
                }`}
              >
                <Home size={14} />
                <span>{t("nav_home")}</span>
              </Link>

              <Link
                href="/sewa"
                className={`px-3 py-1.5 rounded-lg transition ${
                  path === "/sewa"
                    ? "bg-[#e9f3f7] text-[#327691] font-bold"
                    : "text-[#53636d] hover:bg-[#f4f9fb] hover:text-[#263b46]"
                }`}
              >
                {t("nav_tour")}
              </Link>

              {/* Destinasi */}
              <Link
                href="/destinasi"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${
                  path === "/destinasi"
                    ? "bg-[#e9f3f7] text-[#327691] font-bold"
                    : "text-[#53636d] hover:bg-[#f4f9fb] hover:text-[#263b46]"
                }`}
              >
                <Compass size={14} />
                <span>{t("nav_destinations")}</span>
              </Link>

              <Link
                href="/#testimonial"
                className="px-3 py-1.5 rounded-lg transition text-[#53636d] hover:bg-[#f4f9fb] hover:text-[#263b46]"
              >
                {t("nav_testimonial")}
              </Link>

              <Link
                href="/tentang"
                className={`px-3 py-1.5 rounded-lg transition ${
                  path === "/tentang"
                    ? "bg-[#e9f3f7] text-[#327691] font-bold"
                    : "text-[#53636d] hover:bg-[#f4f9fb] hover:text-[#263b46]"
                }`}
              >
                {t("nav_about")}
              </Link>

              {/* Dropdown Artikel Wisata */}
              <div
                className="relative"
                onMouseEnter={() => setArtikelDropdownOpen(true)}
                onMouseLeave={() => setArtikelDropdownOpen(false)}
              >
                <Link
                  href="/artikel"
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition ${
                    path?.startsWith("/artikel")
                      ? "bg-[#e9f3f7] text-[#327691] font-bold"
                      : "text-[#53636d] hover:bg-[#f4f9fb] hover:text-[#263b46]"
                  }`}
                >
                  <span>{t("nav_articles")}</span>
                  <ChevronDown size={13} className="opacity-80" />
                </Link>

                {artikelDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-72 bg-white text-[#263b46] rounded-2xl shadow-xl py-2 z-50 border border-[#e4ebef] border-t-2 border-t-[#327691] animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* Kategori dari Database */}
                    {categories.length > 0 && (
                      <div className="px-3 py-1.5 border-b border-[#f0f4f6]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e9da5]">
                          Kategori Artikel
                        </span>
                        <div className="mt-1 space-y-0.5">
                          {categories.map((cat) => (
                            <Link
                              key={cat}
                              href={`/artikel?kategori=${encodeURIComponent(cat)}`}
                              className="block px-2.5 py-1.5 text-xs text-[#263b46] hover:bg-[#e9f3f7] hover:text-[#327691] rounded-lg transition font-semibold"
                            >
                              {cat}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Artikel dari Database */}
                    <div className="px-3 py-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e9da5]">
                        Artikel Wisata
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {latestArticles.length > 0 ? (
                          latestArticles.map((a) => (
                            <Link
                              key={a.id}
                              href={`/artikel/${a.slug}`}
                              className="block px-2.5 py-1.5 text-xs text-[#53636d] hover:bg-[#e9f3f7] hover:text-[#327691] rounded-lg transition font-medium line-clamp-1"
                              title={a.title}
                            >
                              {a.title}
                            </Link>
                          ))
                        ) : (
                          <span className="block px-2.5 py-1.5 text-xs text-neutral-400">
                            Belum ada artikel.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-1.5 mt-1 border-t border-[#f0f4f6] px-3">
                      <Link
                        href="/artikel"
                        className="block px-2.5 py-1.5 text-xs text-center font-bold text-[#327691] hover:bg-[#e9f3f7] rounded-lg transition"
                      >
                        Lihat Semua Artikel →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Subtle Divider between Nav Links & User Actions on Desktop */}
            <div className="hidden lg:block h-5 w-px bg-[#e4ebef] mx-1" aria-hidden="true" />

            {/* Top Right Actions: User Account & Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-2.5">

              {user ? (
                <>
                  {/* User Pill Button (Matches Foto 1) */}
                  <div className="relative" ref={userDropdownRef}>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 sm:gap-2.5 pl-1.5 pr-3 py-1 rounded-full border border-[#dce6eb] bg-white hover:bg-[#f4f9fb] text-[#263b46] transition cursor-pointer shadow-2xs"
                    >
                      {/* Avatar Circle C */}
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#5d7d8c] text-white flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                        {user.fullName?.[0]?.toUpperCase() || "C"}
                      </div>
                      
                      {/* User Name */}
                      <span className="text-xs sm:text-sm font-bold text-[#263b46] max-w-[85px] sm:max-w-[120px] truncate">
                        {user.fullName?.split(" ")[0] || "User"}
                      </span>

                      {/* Role Tag 'User' */}
                      <span className="border border-[#cddae1] bg-white text-[#55717f] text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md leading-tight">
                        {user.isAdmin ? "Admin" : user.isOwner ? "Owner" : "Buyer"}
                      </span>

                      {/* Chevron Down */}
                      <ChevronDown
                        size={14}
                        className={`text-[#55717f] transition-transform duration-200 ${
                          userDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {userDropdownOpen && (
                      <div 
                        className="absolute right-0 top-full mt-2 w-56 bg-white text-[#263b46] rounded-2xl shadow-xl py-2 z-50 border border-[#e4ebef] text-xs animate-in fade-in zoom-in-95"
                      >
                        <div className="px-4 py-2.5 border-b border-[#e4ebef]">
                          <p className="font-bold text-neutral-900 truncate">{user.fullName}</p>
                          <p className="text-[11px] text-neutral-500 truncate">{user.email || "Pelanggan"}</p>
                        </div>

                        <div className="py-1">
                          {user.isAdmin && (
                            <>
                              <Link
                                href="/admin"
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-[#53636d] hover:bg-[#e9f3f7] hover:text-[#327691] font-semibold transition"
                              >
                                <LayoutDashboard size={14} className="text-[#327691]" />
                                <span>Dashboard Admin</span>
                              </Link>
                              <Link
                                href="/admin/pesanan"
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-[#53636d] hover:bg-[#e9f3f7] hover:text-[#327691] font-semibold transition"
                              >
                                <ShoppingBag size={14} className="text-[#327691]" />
                                <span>Kelola Pesanan (Admin)</span>
                              </Link>
                            </>
                          )}

                          {user.isOwner && (
                            <>
                              <Link
                                href="/owner"
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-[#53636d] hover:bg-[#e9f3f7] hover:text-[#327691] font-semibold transition"
                              >
                                <Car size={14} className="text-[#327691]" />
                                <span>Portal Pemilik</span>
                              </Link>
                              <Link
                                href="/owner/transaksi"
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-[#53636d] hover:bg-[#e9f3f7] hover:text-[#327691] font-semibold transition"
                              >
                                <ShoppingBag size={14} className="text-[#327691]" />
                                <span>Transaksi Armada</span>
                              </Link>
                            </>
                          )}

                          {(user.isAdmin || user.isOwner) && (
                            <div className="my-1 border-t border-[#f0f4f6]" />
                          )}

                          <Link
                            href="/buyer"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-[#53636d] hover:bg-[#e9f3f7] hover:text-[#327691] font-semibold transition"
                          >
                            <User size={14} />
                            <span>{user.isAdmin || user.isOwner ? "Mode Buyer (Pelanggan)" : "Menu Pelanggan (Buyer)"}</span>
                          </Link>

                          <Link
                            href="/buyer/pesanan"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-[#53636d] hover:bg-[#e9f3f7] hover:text-[#327691] font-semibold transition"
                          >
                            <ShoppingBag size={14} />
                            <span>Riwayat Booking Saya</span>
                          </Link>

                          <Link
                            href="/buyer/profil"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-[#53636d] hover:bg-[#e9f3f7] hover:text-[#327691] font-semibold transition"
                          >
                            <User size={14} />
                            <span>Profil Akun</span>
                          </Link>
                        </div>

                        <div className="pt-1 border-t border-[#e4ebef]">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 w-full px-4 py-2 text-red-600 hover:bg-red-50 font-semibold transition text-left cursor-pointer"
                          >
                            <LogOut size={14} />
                            <span>{t("buyer_menu_keluar", "Keluar")}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <Link
                    href="/auth/login"
                    className="px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-[#53636d] hover:text-[#263b46] hover:bg-[#f4f9fb] transition flex items-center gap-1 whitespace-nowrap"
                  >
                    <LogIn size={13} className="text-[#327691]" />
                    <span>Masuk</span>
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#327691] hover:bg-[#2c6881] text-white shadow-xs transition whitespace-nowrap"
                  >
                    <UserPlus size={12} />
                    <span>Daftar</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="relative z-40 lg:hidden bg-white text-[#263b46] border-t border-[#e4ebef] px-4 py-3 space-y-1 shadow-2xl">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 py-2.5 px-3.5 text-sm font-semibold rounded-xl transition ${
                path === "/" ? "bg-[#e9f3f7] text-[#327691]" : "text-[#53636d] hover:bg-[#f4f9fb]"
              }`}
            >
              <Home size={18} />
              <span>{t("nav_home")}</span>
            </Link>

            <Link
              href="/sewa"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 py-2.5 px-3.5 text-sm font-semibold rounded-xl transition ${
                path === "/sewa" ? "bg-[#e9f3f7] text-[#327691]" : "text-[#53636d] hover:bg-[#f4f9fb]"
              }`}
            >
              <Car size={18} />
              <span>{t("nav_tour")}</span>
            </Link>

            <Link
              href="/destinasi"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 py-2.5 px-3.5 text-sm font-semibold rounded-xl transition ${
                path === "/destinasi" ? "bg-[#e9f3f7] text-[#327691]" : "text-[#53636d] hover:bg-[#f4f9fb]"
              }`}
            >
              <Compass size={18} />
              <span>{t("nav_destinations")}</span>
            </Link>

            <Link
              href="/#testimonial"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 py-2.5 px-3.5 text-sm font-semibold rounded-xl text-[#53636d] hover:bg-[#f4f9fb] transition"
            >
              <Star size={18} />
              <span>{t("nav_testimonial")}</span>
            </Link>

            <Link
              href="/tentang"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 py-2.5 px-3.5 text-sm font-semibold rounded-xl transition ${
                path === "/tentang" ? "bg-[#e9f3f7] text-[#327691]" : "text-[#53636d] hover:bg-[#f4f9fb]"
              }`}
            >
              <Info size={18} />
              <span>{t("nav_about")}</span>
            </Link>

            {/* Artikel Wisata Submenu */}
            <div>
              <button
                onClick={() => setArtikelDropdownOpen(!artikelDropdownOpen)}
                className="w-full flex items-center justify-between py-2.5 px-3.5 text-sm font-semibold text-[#53636d] hover:bg-[#f4f9fb] rounded-xl transition text-left"
              >
                <div className="flex items-center gap-3">
                  <BookOpen size={18} />
                  <span>{t("nav_articles")}</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${artikelDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {artikelDropdownOpen && (
                <div className="pl-6 pr-2 py-2 space-y-2 bg-[#f4f9fb] rounded-xl my-1 text-xs">
                  {categories.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e9da5] px-2">
                        Kategori Artikel
                      </span>
                      {categories.map((cat) => (
                        <Link
                          key={cat}
                          href={`/artikel?kategori=${encodeURIComponent(cat)}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-1.5 px-2.5 hover:bg-[#e9f3f7] rounded-lg text-[#263b46] font-semibold hover:text-[#327691]"
                        >
                          {cat}
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1 pt-1 border-t border-[#e4ebef]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e9da5] px-2">
                      Artikel Wisata
                    </span>
                    {latestArticles.length > 0 ? (
                      latestArticles.map((a) => (
                        <Link
                          key={a.id}
                          href={`/artikel/${a.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-1.5 px-2.5 hover:bg-[#e9f3f7] rounded-lg text-[#53636d] hover:text-[#327691] truncate"
                          title={a.title}
                        >
                          {a.title}
                        </Link>
                      ))
                    ) : (
                      <span className="block py-1.5 px-2.5 text-neutral-400">
                        Belum ada artikel.
                      </span>
                    )}
                  </div>

                  <div className="pt-1 border-t border-[#e4ebef]">
                    <Link
                      href="/artikel"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1.5 px-2.5 text-center font-bold text-[#327691]"
                    >
                      Lihat Semua Artikel →
                    </Link>
                  </div>
                </div>
              )}
            </div>


            {/* Mobile User Section / Login & Register */}
            <div className="pt-2">
              {user ? (
                <div className="p-3 bg-[#f8fafc] rounded-2xl border border-[#e4ebef] space-y-2">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-[#e4ebef]">
                    <div className="w-8 h-8 rounded-full bg-[#327691] text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {user.fullName?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-neutral-900 truncate">{user.fullName || "Akun Saya"}</p>
                      <p className="text-[10px] text-neutral-500 truncate">{user.email || (user.isAdmin ? "Admin" : user.isOwner ? "Owner" : "Buyer")}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                    <Link
                      href={user.isAdmin ? "/admin" : user.isOwner ? "/owner" : "/buyer"}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 px-2 bg-white rounded-xl border border-[#e4ebef] text-center text-[#327691] hover:bg-[#e9f3f7] flex items-center justify-center gap-1.5"
                    >
                      <LayoutDashboard size={14} />
                      <span>{user.isAdmin ? "Dashboard Admin" : user.isOwner ? "Portal Owner" : "Beranda Buyer"}</span>
                    </Link>
                    <Link
                      href={user.isAdmin ? "/admin/pesanan" : user.isOwner ? "/owner/transaksi" : "/buyer/pesanan"}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 px-2 bg-white rounded-xl border border-[#e4ebef] text-center text-[#327691] hover:bg-[#e9f3f7] flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag size={14} />
                      <span>{user.isAdmin ? "Pesanan Admin" : user.isOwner ? "Transaksi" : "Pesanan Saya"}</span>
                    </Link>
                    <Link
                      href="/buyer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 px-2 bg-white rounded-xl border border-[#e4ebef] text-center text-neutral-700 hover:bg-neutral-100 flex items-center justify-center gap-1.5"
                    >
                      <User size={14} />
                      <span>Mode Buyer</span>
                    </Link>
                    <Link
                      href="/buyer/profil"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 px-2 bg-white rounded-xl border border-[#e4ebef] text-center text-neutral-700 hover:bg-neutral-100 flex items-center justify-center gap-1.5"
                    >
                      <User size={14} />
                      <span>Profil</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-[#e4ebef]">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full py-2 text-center text-xs font-bold text-red-600 hover:text-red-700 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-red-50 rounded-xl transition"
                    >
                      <LogOut size={13} />
                      <span>{t("buyer_menu_keluar", "Keluar Akun")}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 border border-[#327691] text-[#327691] hover:bg-[#f4f9fb] font-bold text-xs rounded-xl transition"
                  >
                    <LogIn size={15} />
                    <span>Masuk</span>
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#327691] hover:bg-[#2c6881] text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    <UserPlus size={15} />
                    <span>Daftar</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
