/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Globe } from "lucide-react";
import { PortalNotification } from "./PortalNotification";
import { useLanguage } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";

interface PortalNavbarUser {
  id?: string;
  fullName?: string;
  email?: string;
  roles?: string[];
  avatarUrl?: string;
}

interface PortalNavbarProps {
  user: PortalNavbarUser;
  portalType: "admin" | "owner" | "buyer";
  badgeLabel?: string;
}

export function PortalNavbar({ user, portalType }: PortalNavbarProps) {
  const router = useRouter();
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
    router.push("/");
    router.refresh();
  };

  const homeHref = portalType === "admin" ? "/admin" : portalType === "owner" ? "/owner" : "/buyer";

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-neutral-900 border-b border-[#e4ebef] dark:border-neutral-800 shadow-2xs select-none">
      <div className="w-full px-3.5 sm:px-5 lg:px-6 h-12 sm:h-13 flex items-center justify-between">
        {/* SISI KIRI: Logo Jeep Trooper + Nama Brand (Ramping & Proporsional Persis Foto 2) */}
        <Link href={homeHref} className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
          <svg
            aria-hidden="true"
            viewBox="0 0 74 43"
            className="w-8 sm:w-9 h-auto text-[#d99b26] dark:text-[#f4bd42] shrink-0 group-hover:scale-105 transition-transform"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 29h4l2-6 15-3 6-12h27l7 4 3 15 4 2v6h-9m-15 0H23m-14 0H3v-6Z" />
            <path d="M27 20 33 11h21l6 4 2 6H27Zm18-9v10m10-10 2 10M10 26l13-2m1-4 1 9m6-5h31M65 25l2 2m-37-19 1-3h24l3 3M5 31h6m52 1h8" />
            <path d="M29 26h11m5 0h11M34 29v3m10-5v6m18-11v5" />
            <circle cx="16" cy="34" r="7" />
            <circle cx="16" cy="34" r="3.5" />
            <circle cx="55" cy="34" r="7" />
            <circle cx="55" cy="34" r="3.5" />
          </svg>
          <span className="font-bold text-xs sm:text-sm tracking-tight text-[#263b46] dark:text-neutral-100 truncate">
            Sewa Trooper Banyuwangi
          </span>
        </Link>

        {/* SISI KANAN: Lonceng Notifikasi + Avatar Bulat Profil Akun (Persis Foto 2) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Functional Notification Bell (Minimalis & Ringkas) */}
          <PortalNotification role={portalType} userId={user.id} />

          {/* User Profile Avatar Circle (Foto 2: Bulat Biru [P] / [A] 30px) */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-center rounded-full hover:opacity-90 transition cursor-pointer shadow-2xs focus:outline-none"
              aria-label="Menu Pengguna"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName || "Avatar"}
                  className="rounded-full object-cover shrink-0 border border-slate-200 dark:border-neutral-700 block"
                  style={{ width: "30px", height: "30px", minWidth: "30px", minHeight: "30px", aspectRatio: "1 / 1" }}
                />
              ) : (
                <div
                  className="rounded-full bg-[#0284c7] text-white flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 shadow-xs"
                  style={{ width: "30px", height: "30px", minWidth: "30px", minHeight: "30px", aspectRatio: "1 / 1" }}
                >
                  {user.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "A"}
                </div>
              )}
            </button>

            {/* User Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 max-w-[90vw] rounded-2xl bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-800 shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95">
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
