"use client";

import { useState, useEffect } from "react";
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
  Search,
  Bell,
} from "lucide-react";
import type { SiteSettings } from "@/lib/services/settings";
import { useLanguage } from "@/lib/i18n/context";

export interface HeaderUser {
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
  isAdmin?: boolean;
  isOwner?: boolean;
  roles?: string[];
}

const artikelCategories = [
  { label: "Destinasi Wisata Banyuwangi", href: "/artikel?kategori=destinasi" },
  { label: "INFORMASI", href: "/artikel?kategori=informasi" },
  { label: "Itinerary & Tips Wisata Banyuwangi", href: "/artikel?kategori=itinerary" },
  { label: "Jeep Kawah Wurung", href: "/artikel?kategori=kawah-wurung" },
  { label: "Jeep Sukamade", href: "/artikel?kategori=sukamade" },
  { label: "Sewa Jeep Banyuwangi", href: "/artikel?kategori=sewa-jeep" },
  { label: "Tips Sewa Jeep", href: "/artikel?kategori=tips" },
  { label: "Wisata Jeep Banyuwangi", href: "/artikel?kategori=wisata" },
];

export function Header({
  settings: _settings,
  user,
}: {
  settings?: SiteSettings;
  links?: { label: string; href: string }[];
  user?: HeaderUser | null;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [artikelDropdownOpen, setArtikelDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const path = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    function close(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setArtikelDropdownOpen(false);
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);

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
              {/* Emblem Badge Lingkaran Petualang Rapi & Presisi */}
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 shrink-0 transition-transform duration-300 group-hover:scale-105">
                <svg
                  viewBox="0 0 120 120"
                  className="w-full h-full drop-shadow-xs"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer & Inner Clean Rings */}
                  <circle cx="60" cy="60" r="57" stroke="#327691" strokeWidth="2.5" fill="#327691" />
                  <circle cx="60" cy="60" r="51" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" />
                  {/* Warm Sun / Sunrise */}
                  <circle cx="60" cy="40" r="14" fill="#f59e0b" />
                  {/* Mountain Slopes (Ijen & Raung) */}
                  <polygon points="16,84 46,38 70,72 88,46 104,84" fill="#254958" />
                  {/* Snowy mountain caps */}
                  <polygon points="46,38 39,49 46,45 53,49" fill="#ffffff" />
                  <polygon points="88,46 82,55 88,52 94,55" fill="#ffffff" />
                  {/* Ground Curve */}
                  <path d="M12 84 Q60 88 108 84 L108 104 Q60 108 12 104 Z" fill="#1f3039" />
                  {/* Jeep Front Body */}
                  <rect x="38" y="68" width="44" height="22" rx="3" fill="#ffffff" />
                  {/* Windshield */}
                  <rect x="42" y="70" width="16" height="7" rx="1.5" fill="#327691" />
                  <rect x="62" y="70" width="16" height="7" rx="1.5" fill="#327691" />
                  {/* Classic Grille slats */}
                  <line x1="52" y1="81" x2="52" y2="87" stroke="#327691" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="56" y1="81" x2="56" y2="87" stroke="#327691" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="60" y1="81" x2="60" y2="87" stroke="#327691" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="64" y1="81" x2="64" y2="87" stroke="#327691" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="68" y1="81" x2="68" y2="87" stroke="#327691" strokeWidth="1.8" strokeLinecap="round" />
                  {/* Headlights */}
                  <circle cx="45" cy="83" r="3.5" fill="#fef08a" stroke="#327691" strokeWidth="1.5" />
                  <circle cx="75" cy="83" r="3.5" fill="#fef08a" stroke="#327691" strokeWidth="1.5" />
                  {/* Front Bumper */}
                  <rect x="34" y="88" width="52" height="4.5" rx="1.5" fill="#263b46" />
                  {/* Off-road Tires */}
                  <rect x="33" y="78" width="6" height="13" rx="2" fill="#1f3039" />
                  <rect x="81" y="78" width="6" height="13" rx="2" fill="#1f3039" />
                </svg>
              </div>

              {/* Brand Typography */}
              <div className="flex flex-col justify-center">
                <span className="text-base sm:text-lg md:text-xl font-black text-[#263b46] tracking-tight leading-tight group-hover:text-[#327691] transition-colors">
                  SEWA JEEP
                </span>
                <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-[#327691] tracking-[0.25em] uppercase leading-none mt-0.5">
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
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white text-[#263b46] rounded-xl shadow-xl py-2 z-50 border border-[#e4ebef] border-t-2 border-t-[#327691]">
                    {artikelCategories.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block px-4 py-2 text-xs text-[#53636d] hover:bg-[#e9f3f7] hover:text-[#327691] transition font-medium"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Top Right Actions (Exact Foto 1): Search + Bell + User Pill */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Search Circle Button */}
              <Link
                href="/sewa"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#dce6eb] bg-white flex items-center justify-center text-[#527484] hover:bg-[#f4f9fb] hover:text-[#263b46] transition cursor-pointer shadow-2xs"
                aria-label="Cari Paket Tour"
              >
                <Search size={17} />
              </Link>

              {user ? (
                <>
                  {/* Bell Notification Circle Button */}
                  <Link
                    href="/pesanan"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#dce6eb] bg-white flex items-center justify-center text-[#527484] hover:bg-[#f4f9fb] hover:text-[#263b46] transition cursor-pointer shadow-2xs relative"
                    aria-label="Notifikasi Pesanan"
                  >
                    <Bell size={17} />
                  </Link>

                  {/* User Pill Button (Matches Foto 1) */}
                  <div className="relative">
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
                        {user.isAdmin ? "Admin" : user.isOwner ? "Owner" : "User"}
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
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <div className="px-4 py-2.5 border-b border-[#e4ebef]">
                          <p className="font-bold text-neutral-900 truncate">{user.fullName}</p>
                          <p className="text-[11px] text-neutral-500 truncate">{user.email || "Pelanggan"}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            href={user.isAdmin ? "/admin" : user.isOwner ? "/owner" : "/akun"}
                            className="flex items-center gap-2.5 px-4 py-2 text-[#53636d] hover:bg-[#e9f3f7] hover:text-[#327691] font-semibold transition"
                          >
                            <LayoutDashboard size={14} />
                            <span>{user.isAdmin ? "Dashboard Admin" : user.isOwner ? "Portal Pemilik" : "Beranda Saya"}</span>
                          </Link>

                          <Link
                            href="/pesanan"
                            className="flex items-center gap-2.5 px-4 py-2 text-[#53636d] hover:bg-[#e9f3f7] hover:text-[#327691] font-semibold transition"
                          >
                            <ShoppingBag size={14} />
                            <span>Pesanan Saya</span>
                          </Link>

                          <Link
                            href="/akun/favorit"
                            className="flex items-center gap-2.5 px-4 py-2 text-[#53636d] hover:bg-[#e9f3f7] hover:text-[#327691] font-semibold transition"
                          >
                            <Heart size={14} />
                            <span>Disukai</span>
                          </Link>

                          <Link
                            href="/akun/profil"
                            className="flex items-center gap-2.5 px-4 py-2 text-[#53636d] hover:bg-[#e9f3f7] hover:text-[#327691] font-semibold transition"
                          >
                            <User size={14} />
                            <span>Profil Akun</span>
                          </Link>
                        </div>

                        <div className="pt-1 border-t border-[#e4ebef]">
                          <form action="/auth/signout" method="POST">
                            <button
                              type="submit"
                              className="flex items-center gap-2.5 w-full px-4 py-2 text-red-600 hover:bg-red-50 font-semibold transition text-left cursor-pointer"
                            >
                              <LogOut size={14} />
                              <span>Keluar</span>
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    href="/login"
                    className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-[#53636d] hover:text-[#263b46] hover:bg-[#f4f9fb] transition flex items-center gap-1"
                  >
                    <LogIn size={14} className="text-[#327691]" />
                    <span>Masuk</span>
                  </Link>
                  <Link
                    href="/daftar"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#327691] hover:bg-[#2c6881] text-white shadow-xs transition"
                  >
                    <UserPlus size={13} />
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
                <div className="pl-9 pr-2 py-1.5 space-y-1 bg-[#f4f9fb] rounded-xl my-1 text-xs">
                  {artikelCategories.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-2 hover:bg-[#e9f3f7] rounded-lg text-[#53636d] hover:text-[#327691]"
                    >
                      {item.label}
                    </Link>
                  ))}
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
                      href={user.isAdmin ? "/admin" : user.isOwner ? "/owner" : "/akun"}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 px-2 bg-white rounded-xl border border-[#e4ebef] text-center text-[#327691] hover:bg-[#e9f3f7] flex items-center justify-center gap-1.5"
                    >
                      <LayoutDashboard size={14} />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/pesanan"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 px-2 bg-white rounded-xl border border-[#e4ebef] text-center text-neutral-700 hover:bg-neutral-100 flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag size={14} />
                      <span>Pesanan</span>
                    </Link>
                    <Link
                      href="/akun/favorit"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 px-2 bg-white rounded-xl border border-[#e4ebef] text-center text-neutral-700 hover:bg-neutral-100 flex items-center justify-center gap-1.5"
                    >
                      <Heart size={14} />
                      <span>Favorit</span>
                    </Link>
                    <Link
                      href="/akun/profil"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 px-2 bg-white rounded-xl border border-[#e4ebef] text-center text-neutral-700 hover:bg-neutral-100 flex items-center justify-center gap-1.5"
                    >
                      <User size={14} />
                      <span>Profil</span>
                    </Link>
                  </div>

                  <form action="/auth/signout" method="POST" className="pt-1">
                    <button
                      type="submit"
                      className="w-full py-1.5 text-center text-xs font-bold text-red-600 hover:text-red-700 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut size={13} />
                      <span>Keluar Akun</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 border border-[#327691] text-[#327691] hover:bg-[#f4f9fb] font-bold text-xs rounded-xl transition"
                  >
                    <LogIn size={15} />
                    <span>Masuk</span>
                  </Link>
                  <Link
                    href="/daftar"
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
