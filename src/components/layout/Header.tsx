"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Car, ChevronDown, Compass, Home, LogIn, LogOut, Menu, Star, User, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";
import { TrooperBrand } from "./TrooperBrand";
import styles from "@/components/landing/cinematic.module.css";

export interface HeaderUser {
  fullName?: string;
  email?: string;
  isAdmin?: boolean;
  isOwner?: boolean;
}

const menu = [
  { href: "/", label: "nav_home", Icon: Home },
  { href: "/sewa", label: "nav_tour", Icon: Car },
  { href: "/destinasi", label: "nav_destinations", Icon: Compass },
  { href: "/testimonial", label: "nav_testimonial", Icon: Star },
  { href: "/artikel", label: "nav_articles", Icon: BookOpen },
];

export function Header({ user }: { user?: HeaderUser | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { t } = useLanguage();

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setAccountOpen(false);
      }
    }
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !accountRef.current?.contains(event.target)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, []);

  async function logout() {
    setAccountOpen(false);
    setMobileOpen(false);
    try {
      await createClient().auth.signOut();
    } catch {
      // The server signout below also clears the session cookies.
    }
    await fetch("/auth/signout", { method: "POST" }).catch(() => undefined);
    window.location.replace("/");
  }

  const accountLinks = [
    ...(user?.isAdmin ? [
      { href: "/admin", label: "Dashboard Admin" },
      { href: "/admin/pesanan", label: "Pesanan Admin" },
    ] : []),
    ...(user?.isOwner ? [
      { href: "/owner", label: "Portal Owner" },
      { href: "/owner/transaksi", label: "Transaksi Owner" },
    ] : []),
    { href: "/buyer", label: user?.isAdmin || user?.isOwner ? "Mode Buyer" : "Beranda Buyer" },
    { href: "/buyer/pesanan", label: t("nav_my_orders", "Pesanan Saya") },
    { href: "/buyer/profil", label: "Profil" },
  ];

  function links(withIcons = false) {
    return menu.map(({ href, label, Icon }) => {
      const current = href === "/" ? pathname === "/" : (pathname === href || pathname.startsWith(href + "/"));
      return (
        <Link key={href} href={href} aria-current={current ? "page" : undefined}
          className={styles.navLink} onClick={() => setMobileOpen(false)}>
          {withIcons && <Icon size={17} aria-hidden="true" />}{t(label)}
        </Link>
      );
    });
  }

  return (
    <header className={styles.publicHeader}>
      <div className={styles.headerRow}>
        <button type="button" className={styles.menuToggle} onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"} aria-expanded={mobileOpen}
          aria-controls="public-mobile-menu">
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <Link href="/" className={styles.brandLink} onClick={() => setMobileOpen(false)}><TrooperBrand /></Link>
        <nav className={styles.desktopNav} aria-label="Navigasi utama">{links()}</nav>
        {user ? (
          <div className={styles.account} ref={accountRef}>
            <button type="button" className={styles.loginLink} onClick={() => setAccountOpen(!accountOpen)}
              aria-expanded={accountOpen} aria-controls="public-account-menu">
              <User size={17} /> <span>{user.fullName?.split(" ")[0] || "Akun"}</span> <ChevronDown size={14} />
            </button>
            {accountOpen && (
              <div id="public-account-menu" className={styles.accountMenu}>
                <p className={styles.accountName}>{user.fullName || user.email || "Akun saya"}</p>
                {accountLinks.map(({ href, label }) => (
                  <Link key={href} href={href} className={styles.navLink} onClick={() => setAccountOpen(false)}>{label}</Link>
                ))}
                <button type="button" className={styles.navLink} onClick={logout}><LogOut size={16} /> Keluar</button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/auth/login" className={styles.loginLink} onClick={() => setMobileOpen(false)}>
            <LogIn size={17} aria-hidden="true" /> {t("nav_login", "Masuk")}
          </Link>
        )}
      </div>
      {mobileOpen && <nav id="public-mobile-menu" className={styles.mobileNav} aria-label="Navigasi ponsel">{links(true)}</nav>}
    </header>
  );
}
