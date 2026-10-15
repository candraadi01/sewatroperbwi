"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Mountain, Search } from "lucide-react";
import type { SiteSettings } from "@/lib/services/settings";
const nav = [
  ["Beranda", "/"],
  ["Sewa Trooper", "/sewa"],
  ["Artikel", "/artikel"],
  ["Tentang", "/tentang"],
  ["Kontak", "/kontak"],
];
type User = { fullName: string; avatarUrl: string; isAdmin: boolean };
export function Header({
  user,
  settings,
  links,
}: {
  user?: User | null;
  settings?: SiteSettings;
  links?: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => {
    function close(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);
  const items = links?.length
    ? links
    : nav.map(([label, href]) => ({ label, href }));
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="container-app flex items-center justify-between h-[76px] gap-3">
        <Link href="/" className="flex gap-2.5 items-center text-primary-800">
          <Mountain size={29} strokeWidth={1.8} />
          <span className="text-sm font-semibold leading-tight max-w-44">
            {settings?.site_name || "Sewa Trooper Banyuwangi"}
          </span>
        </Link>
        <nav
          aria-label="Navigasi utama"
          className="hidden lg:flex items-center gap-6"
        >
          {items.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? "page" : undefined}
              className={
                "text-sm transition hover:text-primary-700 " +
                (path === href
                  ? "text-primary-800 font-semibold"
                  : "text-neutral-600")
              }
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex gap-2 items-center">
          <Link
            href="/sewa#cari"
            className="p-3 hover:bg-neutral-100 rounded-full"
            aria-label="Cari layanan"
          >
            <Search size={19} />
          </Link>
          <Link
            href={user ? "/akun/pesanan" : "/login"}
            className="text-sm font-semibold border border-neutral-300 rounded-full px-4 py-2.5"
          >
            {user ? "Pesanan" : "Masuk"}
          </Link>
          <button
            className="lg:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Navigasi seluler"
          className="lg:hidden border-t border-neutral-200 bg-white px-5 py-4 max-h-[70dvh] overflow-y-auto"
        >
          {items.map(({ label, href }) => (
            <Link
              className="block py-3 text-sm"
              key={href}
              href={href}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          {user && (
            <>
              <Link
                href="/akun"
                className="block py-3 text-sm"
                onClick={() => setOpen(false)}
              >
                Akun saya
              </Link>
              {user.isAdmin && (
                <Link
                  href="/admin"
                  className="block py-3 text-sm"
                  onClick={() => setOpen(false)}
                >
                  Panel admin
                </Link>
              )}
              <form action="/auth/signout" method="POST">
                <button className="text-sm py-3 text-red-700">Keluar</button>
              </form>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
