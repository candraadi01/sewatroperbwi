"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  ChevronDown,
  ShoppingCart,
  Compass,
  Car,
  Star,
  Info,
  BookOpen,
} from "lucide-react";
import type { SiteSettings } from "@/lib/services/settings";
import { useLanguage } from "@/lib/i18n/context";
import { useCart } from "@/lib/cart/context";

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
}: {
  settings?: SiteSettings;
  links?: { label: string; href: string }[];
  user?: unknown;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [artikelDropdownOpen, setArtikelDropdownOpen] = useState(false);
  const path = usePathname();
  const { t } = useLanguage();
  const { totalItems, setIsCartOpen } = useCart();

  useEffect(() => {
    function close(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setArtikelDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);

  return (
    <header className="sticky top-0 z-40 shadow-md font-sans">
      {/* UNIFIED NAVBAR: Logo di Navbar Sisi Kiri + Navigasi & Keranjang di Sisi Kanan */}
      <div className="bg-[#0ea5e9] text-white">
        <div className="container-app flex items-center justify-between h-14 md:h-16 gap-3">
          {/* SISI KIRI: Mobile Menu Button + Logo Sewa Jeep 4x4 Banyuwangi */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-white hover:bg-white/15 transition"
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
                  className="w-full h-full drop-shadow-sm"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer & Inner Clean Rings */}
                  <circle cx="60" cy="60" r="57" stroke="#ffffff" strokeWidth="3" fill="#0284c7" />
                  <circle cx="60" cy="60" r="51" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.5" />
                  {/* Red Sun / Sunrise */}
                  <circle cx="60" cy="40" r="14" fill="#f43f5e" />
                  {/* Mountain Slopes (Ijen & Raung) */}
                  <polygon points="16,84 46,38 70,72 88,46 104,84" fill="#0369a1" />
                  {/* Snowy mountain caps */}
                  <polygon points="46,38 39,49 46,45 53,49" fill="#ffffff" />
                  <polygon points="88,46 82,55 88,52 94,55" fill="#ffffff" />
                  {/* Ground Curve */}
                  <path d="M12 84 Q60 88 108 84 L108 104 Q60 108 12 104 Z" fill="#0f172a" />
                  {/* Jeep Front Body */}
                  <rect x="38" y="68" width="44" height="22" rx="3" fill="#ffffff" />
                  {/* Windshield */}
                  <rect x="42" y="70" width="16" height="7" rx="1.5" fill="#0284c7" />
                  <rect x="62" y="70" width="16" height="7" rx="1.5" fill="#0284c7" />
                  {/* Classic Grille slats */}
                  <line x1="52" y1="81" x2="52" y2="87" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="56" y1="81" x2="56" y2="87" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="60" y1="81" x2="60" y2="87" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="64" y1="81" x2="64" y2="87" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="68" y1="81" x2="68" y2="87" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" />
                  {/* Headlights */}
                  <circle cx="45" cy="83" r="3.5" fill="#fef08a" stroke="#0284c7" strokeWidth="1.5" />
                  <circle cx="75" cy="83" r="3.5" fill="#fef08a" stroke="#0284c7" strokeWidth="1.5" />
                  {/* Front Bumper */}
                  <rect x="34" y="88" width="52" height="4.5" rx="1.5" fill="#1e293b" />
                  {/* Off-road Tires */}
                  <rect x="33" y="78" width="6" height="13" rx="2" fill="#0f172a" />
                  <rect x="81" y="78" width="6" height="13" rx="2" fill="#0f172a" />
                </svg>
              </div>

              {/* Brand Typography — Rapi, Elegan, Tanpa Badge 4x4 */}
              <div className="flex flex-col justify-center">
                <span className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight leading-tight">
                  SEWA JEEP
                </span>
                <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-sky-100 tracking-[0.25em] uppercase leading-none mt-0.5">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                  path === "/"
                    ? "bg-black/20 text-white font-bold"
                    : "text-white/95 hover:bg-white/15 hover:text-white"
                }`}
              >
                <Home size={14} />
                <span>{t("nav_home")}</span>
              </Link>

              <Link
                href="/sewa"
                className={`px-3 py-1.5 rounded-md transition ${
                  path === "/sewa"
                    ? "bg-black/20 text-white font-bold"
                    : "text-white/95 hover:bg-white/15 hover:text-white"
                }`}
              >
                {t("nav_tour")}
              </Link>

              {/* Destinasi (Menggantikan Konfirmasi, mengarah ke /destinasi) */}
              <Link
                href="/destinasi"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition ${
                  path === "/destinasi"
                    ? "bg-black/20 text-white font-bold"
                    : "text-white/95 hover:bg-white/15 hover:text-white"
                }`}
              >
                <Compass size={14} />
                <span>{t("nav_destinations")}</span>
              </Link>

              <Link
                href="/#testimonial"
                className="px-3 py-1.5 rounded-md transition text-white/95 hover:bg-white/15 hover:text-white"
              >
                {t("nav_testimonial")}
              </Link>

              <Link
                href="/tentang"
                className={`px-3 py-1.5 rounded-md transition ${
                  path === "/tentang"
                    ? "bg-black/20 text-white font-bold"
                    : "text-white/95 hover:bg-white/15 hover:text-white"
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
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition ${
                    path?.startsWith("/artikel")
                      ? "bg-black/20 text-white font-bold"
                      : "text-white/95 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  <span>{t("nav_articles")}</span>
                  <ChevronDown size={13} className="opacity-80" />
                </Link>

                {artikelDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white text-neutral-800 rounded-lg shadow-xl py-2 z-50 border-t-2 border-[#0ea5e9]">
                    {artikelCategories.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block px-4 py-2 text-xs text-neutral-700 hover:bg-[#0ea5e9] hover:text-white transition font-normal"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Cart Button — Bersandingan rapi di sebelah kanan */}
            <div className="flex items-center pl-2 lg:pl-3 border-l border-white/25">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-white hover:bg-white/15 rounded-lg transition flex items-center justify-center shrink-0"
                aria-label="Keranjang Booking Jeep"
              >
                <ShoppingCart size={20} strokeWidth={2.2} />
                <span className="absolute -top-1 -right-1 bg-[#ff2357] text-white text-[10px] font-extrabold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-sm border border-white">
                  {totalItems}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DRAWER (Mobile Friendly Touch UI & Backdrop) */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="relative z-40 lg:hidden bg-[#0284c7] text-white border-t border-white/20 px-4 py-3 space-y-1 shadow-2xl">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 py-2.5 px-3.5 text-sm font-semibold rounded-xl transition ${
                path === "/" ? "bg-black/25 text-white" : "hover:bg-white/10"
              }`}
            >
              <Home size={18} />
              <span>{t("nav_home")}</span>
            </Link>

            <Link
              href="/sewa"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 py-2.5 px-3.5 text-sm font-semibold rounded-xl transition ${
                path === "/sewa" ? "bg-black/25 text-white" : "hover:bg-white/10"
              }`}
            >
              <Car size={18} />
              <span>{t("nav_tour")}</span>
            </Link>

            <Link
              href="/destinasi"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 py-2.5 px-3.5 text-sm font-semibold rounded-xl transition ${
                path === "/destinasi" ? "bg-black/25 text-white" : "hover:bg-white/10"
              }`}
            >
              <Compass size={18} />
              <span>{t("nav_destinations")}</span>
            </Link>

            <Link
              href="/#testimonial"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 py-2.5 px-3.5 text-sm font-semibold rounded-xl hover:bg-white/10 transition"
            >
              <Star size={18} />
              <span>{t("nav_testimonial")}</span>
            </Link>

            <Link
              href="/tentang"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 py-2.5 px-3.5 text-sm font-semibold rounded-xl transition ${
                path === "/tentang" ? "bg-black/25 text-white" : "hover:bg-white/10"
              }`}
            >
              <Info size={18} />
              <span>{t("nav_about")}</span>
            </Link>

            {/* Artikel Wisata Submenu */}
            <div>
              <button
                onClick={() => setArtikelDropdownOpen(!artikelDropdownOpen)}
                className="w-full flex items-center justify-between py-2.5 px-3.5 text-sm font-semibold hover:bg-white/10 rounded-xl transition text-left"
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
                <div className="pl-9 pr-2 py-1.5 space-y-1 bg-black/15 rounded-xl my-1 text-xs">
                  {artikelCategories.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-2 hover:bg-white/10 rounded-lg text-white/95"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Cart Quick Access Button */}
            <div className="pt-2 border-t border-white/20 mt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#ff2357] text-white font-bold text-sm rounded-xl shadow-sm active:scale-98 transition"
              >
                <ShoppingCart size={18} />
                <span>Keranjang Booking ({totalItems})</span>
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
