'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  X,
  Mountain,
  Phone,
  Search,
  User,
  ChevronDown,
} from 'lucide-react';
import { Button, cn } from '@/components/ui';

interface NavItem {
  label: string;
  href: string;
}

const mainNav: NavItem[] = [
  { label: 'Beranda', href: '/' },
  { label: 'Sewa Trooper', href: '/sewa' },
  { label: 'Artikel', href: '/artikel' },
  { label: 'Tentang Kami', href: '/tentang' },
  { label: 'Kontak', href: '/kontak' },
];

interface HeaderProps {
  user?: {
    fullName: string;
    avatarUrl: string;
    isAdmin: boolean;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
      {/* Top bar - contact info */}
      <div className="hidden md:block bg-primary-700 text-white">
        <div className="container-app flex items-center justify-between py-1.5 text-sm">
          <span className="flex items-center gap-1.5">
            <Phone size={14} />
            Hubungi Kami: WhatsApp
          </span>
          <span>Banyuwangi dan sekitarnya</span>
        </div>
      </div>

      {/* Main nav */}
      <div className="container-app">
        <div className="flex items-center justify-between h-16 md:h-[72px]">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-primary-700 hover:text-primary-800 transition-colors"
          >
            <Mountain size={32} strokeWidth={2.5} />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg tracking-tight">
                Sewa Trooper
              </span>
              <span className="text-xs text-neutral-500 -mt-0.5">
                Banyuwangi
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="Navigasi utama"
          >
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-[15px] font-medium text-neutral-700 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-neutral-600 hover:text-primary-700 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Cari"
            >
              <Search size={20} />
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                    {user.fullName?.[0]?.toUpperCase() || <User size={16} />}
                  </div>
                  <ChevronDown size={16} className="text-neutral-500 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-elevated border border-neutral-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="font-semibold text-sm text-neutral-900 truncate">
                          {user.fullName}
                        </p>
                      </div>
                      <Link
                        href="/akun"
                        className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profil Saya
                      </Link>
                      <Link
                        href="/akun/pesanan"
                        className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Pesanan Saya
                      </Link>
                      {user.isAdmin && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2.5 text-sm text-primary-700 font-medium hover:bg-primary-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Dashboard Admin
                        </Link>
                      )}
                      <div className="border-t border-neutral-100 mt-1 pt-1">
                        <form action="/auth/signout" method="POST">
                          <button
                            type="submit"
                            className="w-full text-left px-4 py-2.5 text-sm text-error hover:bg-red-50 transition-colors"
                          >
                            Keluar
                          </button>
                        </form>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button variant="primary" size="sm">
                  Masuk
                </Button>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 text-neutral-600 hover:text-primary-700 hover:bg-neutral-100 rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <nav
            className="fixed top-0 right-0 z-50 w-[280px] h-full bg-white shadow-modal lg:hidden overflow-y-auto"
            aria-label="Menu mobile"
          >
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <span className="font-bold text-lg text-primary-700">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
                aria-label="Tutup menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className="py-4">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-6 py-3 text-base font-medium text-neutral-700 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="px-6 pt-4 border-t border-neutral-200">
              {!user && (
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" fullWidth>
                    Masuk / Daftar
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
