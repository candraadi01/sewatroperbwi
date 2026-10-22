"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Mountain, Mail, Lock, User, Phone, CheckCircle2, ArrowRight } from "lucide-react";
import { Button, Input, Card } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }
    if (!email.trim()) {
      setError("Alamat email wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setError("Layanan pendaftaran belum dikonfigurasi.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Update phone in profiles if session created
      if (data?.user && phone.trim()) {
        await supabase
          .from("profiles")
          .update({ phone: phone.trim() })
          .eq("id", data.user.id);
      }

      // Check if user is immediately logged in or requires email verification
      if (data?.session) {
        // Logged in immediately -> redirect to buyer dashboard
        window.location.assign("/akun");
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat pendaftaran.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="p-8 text-center shadow-lg border border-[#e4ebef]">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Pendaftaran Berhasil!</h2>
            <p className="text-sm text-neutral-600 mt-2">
              Akun Anda telah berhasil dibuat. Silakan periksa email <strong>{email}</strong> jika diperlukan konfirmasi, atau langsung masuk ke akun Anda.
            </p>
            <div className="mt-6">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#327691] hover:bg-[#2c6881] text-white font-bold text-sm rounded-xl shadow-xs transition"
              >
                <span>Masuk Sekarang</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo Brand */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-[#327691]"
          >
            <Mountain size={36} strokeWidth={2.5} />
            <div className="flex flex-col leading-tight text-left">
              <span className="font-bold text-xl text-[#263b46]">Sewa Trooper</span>
              <span className="text-xs text-[#327691] font-semibold tracking-wider">BANYUWANGI</span>
            </div>
          </Link>
        </div>

        <Card className="p-6 sm:p-8 shadow-lg border border-[#e4ebef]">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-neutral-900">Daftar Akun Baru</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Buat akun pelanggan untuk memesan trip Jeep Trooper 4x4 dan kelola pesanan Anda.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
              <span className="font-bold">Error:</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#327691]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Nomor WhatsApp / Telepon
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#327691]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#327691]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Kata Sandi (Minimal 6 karakter)
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#327691]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Ulangi Kata Sandi
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#327691]"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={loading || !email.trim() || !password || !fullName.trim()}
              className="mt-3 bg-[#327691] hover:bg-[#2c6881] py-3 text-sm font-bold"
            >
              Daftar Sekarang
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center text-xs text-neutral-500 pt-4 border-t border-neutral-100">
            Sudah memiliki akun?{" "}
            <Link
              href="/login"
              className="font-bold text-[#327691] hover:underline"
            >
              Masuk di sini
            </Link>
          </div>
        </Card>

        <p className="text-center mt-6 text-xs text-neutral-500">
          <Link
            href="/"
            className="text-[#327691] hover:underline font-medium"
          >
            ← Kembali ke Beranda
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="w-8 h-8 border-4 border-[#327691] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
