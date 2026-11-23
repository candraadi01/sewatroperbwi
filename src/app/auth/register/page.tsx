"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { TrooperBrand } from "@/components/layout/TrooperBrand";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "mt-1.5 min-h-11 w-full rounded-lg border border-[#cfd6d9] bg-[#f8faf9] px-3 text-base text-[#192127] focus-visible:outline-2 focus-visible:outline-[#946021]";

function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
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
          .update({ phone: phone.trim(), full_name: fullName.trim() })
          .eq("id", data.user.id);
      }

      setSuccess(true);
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#192127]">Pendaftaran Berhasil!</h2>
          <p className="mt-2 text-sm text-[#53606a] leading-relaxed">
            Akun Anda telah berhasil dibuat untuk <strong>{email}</strong>. Silakan periksa email jika diperlukan konfirmasi, atau langsung masuk ke akun Anda.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/auth/login"
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#f4bd42] px-4 text-sm font-extrabold text-[#192127] hover:bg-[#f6cc6c] shadow-xs transition"
          >
            <span>Masuk Sekarang</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <p role="alert" className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <AlertCircle size={17} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <label className="block text-sm font-semibold">
          Nama Lengkap
          <input
            className={inputClass}
            type="text"
            placeholder="Contoh: Budi Santoso"
            required
            disabled={loading}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>

        <label className="block text-sm font-semibold">
          Nomor WhatsApp / Telepon
          <input
            className={inputClass}
            type="tel"
            placeholder="081234567890"
            disabled={loading}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>

        <label className="block text-sm font-semibold">
          Alamat Email
          <input
            className={inputClass}
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="block text-sm font-semibold">
          Kata Sandi (Minimal 6 karakter)
          <span className="relative block">
            <input
              className={`${inputClass} pr-12`}
              type={visible ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              onClick={() => setVisible(!visible)}
              className="absolute bottom-0 right-0 grid size-11 place-items-center text-[#53606a]"
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>

        <label className="block text-sm font-semibold">
          Ulangi Kata Sandi
          <span className="relative block">
            <input
              className={`${inputClass} pr-12`}
              type={confirmVisible ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              required
              disabled={loading}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              aria-label={confirmVisible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              onClick={() => setConfirmVisible(!confirmVisible)}
              className="absolute bottom-0 right-0 grid size-11 place-items-center text-[#53606a]"
            >
              {confirmVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || !email.trim() || !password || !fullName.trim()}
          className="min-h-11 w-full rounded-lg bg-[#f4bd42] px-3 text-sm font-extrabold text-[#192127] hover:bg-[#f6cc6c] disabled:opacity-60 transition cursor-pointer"
        >
          {loading ? "Memproses…" : "Daftar Sekarang"}
        </button>
      </form>

      <p className="mt-4 border-t border-[#e0e3e0] pt-4 text-sm text-[#53606a]">
        Sudah memiliki akun?{" "}
        <Link href="/auth/login" className="font-bold text-[#805211] hover:underline">
          Masuk
        </Link>
      </p>
    </>
  );
}

export default function RegisterPage() {
  return (
    <main className="grid min-h-svh bg-[#f6f6f3] text-[#192127] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <aside className="relative isolate flex min-h-24 flex-col justify-between overflow-hidden bg-[#172026] px-5 py-5 text-white sm:px-9 lg:min-h-svh lg:p-12">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,#12191e,transparent_60%),url('/images/landing/cinematic-banyuwangi.webp')] bg-cover bg-center opacity-75"
        />
        <Link href="/" aria-label="Sewa Trooper Banyuwangi">
          <TrooperBrand />
        </Link>
        <p className="hidden max-w-md text-4xl font-bold tracking-tight lg:block">
          Jelajahi Banyuwangi dengan Jeep Trooper.
        </p>
      </aside>
      <div className="flex justify-center px-5 py-7 sm:px-9 sm:py-12 lg:items-center">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-5 inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-[#805211] hover:underline"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Kembali ke beranda
          </Link>
          <div className="rounded-2xl border border-[#dedfda] bg-white p-5 shadow-sm sm:p-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Daftar Akun Baru</h1>
            <p className="mb-6 mt-2 text-sm leading-relaxed text-[#53606a]">
              Buat akun pelanggan untuk memesan trip Jeep Trooper 4x4 dan kelola pesanan Anda.
            </p>
            <Suspense fallback={<p role="status">Memuat formulir…</p>}>
              <RegisterForm />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
