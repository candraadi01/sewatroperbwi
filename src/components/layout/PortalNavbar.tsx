"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Mountain, Car, User, LogOut, ChevronDown, ExternalLink, Globe, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { PortalNotification } from "./PortalNotification";
import { useLanguage } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";

interface PortalNavbarUser {
  id?: string;
  fullName?: string;
  email?: string;
  roles?: string[];
}

interface PortalNavbarProps {
  user: PortalNavbarUser;
  portalType: "admin" | "owner" | "buyer";
  badgeLabel: string;
}

export function PortalNavbar({ user, portalType, badgeLabel }: PortalNavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDropdownOpen(false);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[portal signout client error]", err);
    }
    try {
      await fetch("/auth/signout", { method: "POST" });
    } catch (err) {
      console.error("[portal signout server error]", err);
    }
    window.location.assign("/");
  };

  const homeHref = portalType === "admin" ? "/admin" : portalType === "owner" ? "/owner" : "/buyer";

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-neutral-900 border-b border-[#e4ebef] dark:border-neutral-800 shadow-2xs select-none">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* SISI KIRI: Brand Logo & Title & Badge (Matches Homestay Foto) */}
        <div className="flex items-center gap-3">
          <Link href={homeHref} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#e9f3f7] dark:bg-neutral-800 text-[#327691] flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform shrink-0">
              {portalType === "owner" ? (
                <Car size={20} strokeWidth={2.4} />
              ) : (
                <Mountain size={20} strokeWidth={2.4} />
              )}
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#263b46] dark:text-neutral-100">
                Sewa Trooper Banyuwangi
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#8b9ba5] dark:text-neutral-400 mt-0.5">
                {t("portal_sub", "Portal Resmi 4x4")}
              </span>
            </div>
          </Link>

          {/* Role Badge */}
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#e9f3f7] dark:bg-neutral-800 text-[#327691] border border-[#d2e4ec] dark:border-neutral-700">
            {badgeLabel}
          </span>
        </div>

        {/* SISI KANAN: Theme Toggle + Bell Notification + User Pill (Exact Homestay Banyuwangi Foto) */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Dark / Light Mode Toggle */}
          <ThemeToggle />

          {/* Functional Notification Bell with interactive popover */}
          <PortalNotification role={portalType} />

          {/* User Profile Pill & Dropdown (Matches Foto: [C] Candra youtube 1) */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 sm:gap-2.5 pl-1.5 pr-2.5 sm:pr-3 py-1 rounded-full border border-[#dce6eb] dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-[#f4f9fb] dark:hover:bg-neutral-800 text-[#263b46] dark:text-neutral-100 transition cursor-pointer shadow-2xs"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#5d7d8c] text-white flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                {user.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "C"}
              </div>

              <span className="text-xs sm:text-sm font-bold text-[#263b46] dark:text-neutral-100 max-w-[90px] sm:max-w-[140px] truncate text-left">
                {user.fullName || "Pengguna"}
              </span>

              <ChevronDown
                size={14}
                className={`text-[#55717f] dark:text-neutral-400 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* User Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-800 shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95">
                <div className="px-4 py-2.5 border-b border-[#e4ebef] dark:border-neutral-800">
                  <p className="font-bold text-neutral-900 dark:text-neutral-100 truncate">
                    {user.fullName || "Pengguna"}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                    {user.email}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    href="/"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[#53636d] dark:text-neutral-300 hover:bg-[#e9f3f7] dark:hover:bg-neutral-800 hover:text-[#327691] font-semibold transition"
                  >
                    <Globe size={14} />
                    <span>{t("portal_view_web", "Lihat Website Publik")}</span>
                  </Link>

                  {portalType !== "admin" && user.roles?.includes("admin") && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#53636d] dark:text-neutral-300 hover:bg-[#e9f3f7] dark:hover:bg-neutral-800 hover:text-[#327691] font-semibold transition"
                    >
                      <Shield size={14} className="text-[#327691]" />
                      <span>{t("portal_mode_admin", "Portal Admin")}</span>
                    </Link>
                  )}

                  {portalType !== "buyer" && (
                    <Link
                      href="/buyer"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#53636d] dark:text-neutral-300 hover:bg-[#e9f3f7] dark:hover:bg-neutral-800 hover:text-[#327691] font-semibold transition"
                    >
                      <User size={14} />
                      <span>{t("portal_mode_buyer", "Mode Buyer (Pelanggan)")}</span>
                    </Link>
                  )}

                  {portalType !== "owner" && user.roles?.includes("owner") && (
                    <Link
                      href="/owner"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#53636d] dark:text-neutral-300 hover:bg-[#e9f3f7] dark:hover:bg-neutral-800 hover:text-[#327691] font-semibold transition"
                    >
                      <Car size={14} />
                      <span>{t("portal_mode_owner", "Portal Pemilik Armada")}</span>
                    </Link>
                  )}
                </div>

                <div className="pt-1 border-t border-[#e4ebef] dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold transition text-left cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>{t("buyer_menu_keluar", "Keluar Akun")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
