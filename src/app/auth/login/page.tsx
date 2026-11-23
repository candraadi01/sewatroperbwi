"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mountain, Mail, AlertCircle, ShieldCheck, FlaskConical, Shield, Briefcase, User, Zap } from "lucide-react";
import { Button, Input, Card } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { safeRedirectPath } from "@/lib/security/redirect";
import { createClient } from "@/lib/supabase/client";

const TEST_ACCOUNTS = [
  {
    id: "admin",
    name: "Admin",
    roleLabel: "Super Admin",
    email: "admin@sewatrooperbwi.com",
    password: "AdminTrooper2026!",
    badge: "ADMIN",
    theme: {
      border: "border-purple-200 hover:border-purple-300",
      activeBorder: "border-purple-600 ring-2 ring-purple-200 bg-purple-50/70",
      badgeBg: "bg-purple-100 text-purple-700",
      text: "text-purple-700",
    },
    dest: "/admin",
  },
  {
    id: "owner",
    name: "Owner",
    roleLabel: "Mitra Trooper",
    email: "owner@sewatrooperbwi.com",
    password: "OwnerTrooper2026!",
    badge: "OWNER",
    theme: {
      border: "border-blue-200 hover:border-blue-300",
      activeBorder: "border-blue-600 ring-2 ring-blue-200 bg-blue-50/70",
      badgeBg: "bg-blue-100 text-blue-700",
      text: "text-blue-700",
    },
    dest: "/owner",
  },
  {
    id: "buyer",
    name: "Buyer",
    roleLabel: "Pelanggan",
    email: "buyer@sewatrooperbwi.com",
    password: "BuyerTrooper2026!",
    badge: "BUYER",
    theme: {
      border: "border-emerald-200 hover:border-emerald-300",
      activeBorder: "border-emerald-600 ring-2 ring-emerald-200 bg-emerald-50/70",
      badgeBg: "bg-emerald-100 text-emerald-700",
      text: "text-emerald-700",
    },
    dest: "/buyer",
  },
] as const;

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get("redirectTo") ?? "/");
  const errorParam = searchParams.get("error");

  const [method, setMethod] = useState<"password" | "magic_link">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(
    errorParam === "auth_callback_failed"
      ? "Gagal masuk. Silakan coba lagi."
      : "",
  );

  const supabase = createClient();
  const selectedAccount = TEST_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase()
  );

  async function handleGoogleLogin() {
    if (!isSupabaseConfigured()) {
      setError("Login belum dikonfigurasi pengelola.");
      return;
    }
    setGoogleLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setError("Gagal masuk dengan Google. Silakan coba lagi.");
      setGoogleLoading(false);
    }
  }

  async function performLogin(targetEmail: string, targetPass: string) {
    if (!targetEmail.trim() || !targetPass) return;
    if (!isSupabaseConfigured()) {
      setError("Login belum dikonfigurasi pengelola.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    let { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: targetEmail.trim(),
      password: targetPass,
    });

    // Otomatis daftarkan akun buyer jika belum ada di database Supabase
    if (signInError && targetEmail === "buyer@sewatrooperbwi.com") {
      try {
        const { data: signUpData } = await supabase.auth.signUp({
          email: targetEmail.trim(),
          password: targetPass,
          options: {
            data: {
              full_name: "Pelanggan Demo Trooper",
              phone: "081234567890",
            },
          },
        });
        if (signUpData?.user) {
          const retry = await supabase.auth.signInWithPassword({
            email: targetEmail.trim(),
            password: targetPass,
          });
          data = retry.data;
          signInError = retry.error;
        }
      } catch {
        // Abaikan dan gunakan error awal jika signup gagal
      }
    }

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "Email atau kata sandi tidak cocok. Silakan periksa kembali."
          : signInError.message
      );
      setLoading(false);
      return;
    }

    if (data?.user) {
      // Periksa role user: admin, owner, atau buyer
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);

      const roles = (rolesData ?? []).map((r: { role: string }) => r.role);
      const isAdmin = roles.includes("admin");
      const isOwner = roles.includes("owner");
      
      // Jika diarahkan dari halaman tertentu, ikuti redirect. Jika tidak, redirect sesuai role
      let target = redirectTo;
      if (!redirectTo || redirectTo === "/") {
        if (isAdmin) target = "/admin";
        else if (isOwner) target = "/owner";
        else target = "/buyer";
      }

      window.location.assign(target);
    }
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    await performLogin(email, password);
  }

  async function handleMagicLinkLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    if (!isSupabaseConfigured()) {
      setError("Login belum dikonfigurasi pengelola.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setError(
        "Gagal mengirim link masuk. Periksa alamat email dan coba lagi.",
      );
    } else {
      setMessage(
        "Link masuk telah dikirim ke email Anda. Periksa kotak masuk (dan folder spam) Anda.",
      );
    }
    setLoading(false);
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-primary-700"
          >
            <Mountain size={36} strokeWidth={2.5} />
            <div className="flex flex-col leading-tight text-left">
              <span className="font-bold text-xl">Sewa Trooper</span>
              <span className="text-xs text-neutral-500">Banyuwangi</span>
            </div>
          </Link>
        </div>

        <Card variant="elevated" padding="lg">
          <div className="text-center mb-6">
            <h1 className="heading-2 text-neutral-900">Masuk</h1>
            <p className="text-neutral-600 mt-1 text-sm">
              Masuk untuk mengelola sistem atau melanjutkan pesanan Anda
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="flex items-start gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
              role="alert"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success message */}
          {message && (
            <div
              className="flex items-start gap-3 p-4 mb-6 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700"
              role="alert"
            >
              <Mail size={18} className="shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {/* Reassurance banner if redirected from checkout */}
          {redirectTo.includes("/checkout") && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#e9f3f7] border border-[#327691]/40 text-[#254958] text-xs flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-[#327691] shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-[#263b46]">
                  Pilihan Paket & Unit Sewa Anda Tersimpan Aman
                </p>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  Silakan masuk untuk melanjutkan pengajuan booking. Anda akan langsung diarahkan kembali ke formulir checkout.
                </p>
              </div>
            </div>
          )}

          {/* Panel Akun Testing untuk Tahap Pengembangan */}
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs">
                <FlaskConical size={15} className="text-amber-600 shrink-0" />
                <span>Akun Testing (Tahap Pengembangan)</span>
              </div>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/90 border border-amber-200/80 px-2 py-0.5 rounded-full">
                Mode Uji Coba
              </span>
            </div>

            <p className="text-[11px] text-amber-900/80 mb-2.5 leading-snug">
              Pilih akun di bawah untuk mengisi form login secara otomatis:
            </p>

            <div className="grid grid-cols-3 gap-2">
              {TEST_ACCOUNTS.map((acc) => {
                const isSelected = email.trim().toLowerCase() === acc.email.toLowerCase();
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      setEmail(acc.email);
                      setPassword(acc.password);
                      setMethod("password");
                      setError("");
                      setMessage("");
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? acc.theme.activeBorder
                        : `bg-white/95 ${acc.theme.border}`
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {acc.id === "admin" && <Shield size={12} className={acc.theme.text} />}
                      {acc.id === "owner" && <Briefcase size={12} className={acc.theme.text} />}
                      {acc.id === "buyer" && <User size={12} className={acc.theme.text} />}
                      <span className="text-xs font-bold text-neutral-800">{acc.name}</span>
                    </div>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${acc.theme.badgeBg}`}>
                      {acc.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Info Akun Terpilih & Tombol Masuk Cepat */}
            {selectedAccount && (
              <div className="mt-3 pt-2.5 border-t border-amber-200/70 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-neutral-800">
                      {selectedAccount.roleLabel}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-600 font-mono truncate">
                    {selectedAccount.email}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono">
                    Sandi: {selectedAccount.password}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={loading || googleLoading}
                  onClick={() => performLogin(selectedAccount.email, selectedAccount.password)}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2c6881] hover:bg-[#235367] text-white font-semibold text-[11px] shadow-xs transition disabled:opacity-50 cursor-pointer"
                  title={`Langsung masuk sebagai ${selectedAccount.name}`}
                >
                  <Zap size={12} />
                  Masuk Cepat
                </button>
              </div>
            )}
          </div>

          {/* Method Tabs */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMethod("password");
                setError("");
              }}
              className={`py-2 rounded-lg transition ${
                method === "password"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Kata Sandi
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod("magic_link");
                setError("");
              }}
              className={`py-2 rounded-lg transition ${
                method === "magic_link"
                  ? "bg-white text-neutral-900 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Link Email (OTP)
            </button>
          </div>

          {/* Form Password Login */}
          {method === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <Input
                label="Alamat Email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || googleLoading}
                autoComplete="email"
              />
              <Input
                label="Kata Sandi"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || googleLoading}
                autoComplete="current-password"
              />
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={googleLoading || !email.trim() || !password}
                className="mt-2"
              >
                Masuk ke Akun
              </Button>
            </form>
          )}

          {/* Form Magic Link Login */}
          {method === "magic_link" && (
            <form onSubmit={handleMagicLinkLogin} className="space-y-4">
              <Input
                label="Alamat Email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || googleLoading}
                autoComplete="email"
              />
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={googleLoading || !email.trim()}
                className="mt-2"
              >
                <Mail size={18} />
                Kirim Link Masuk
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-neutral-200" />
            <span className="text-xs text-neutral-400">atau</span>
            <div className="flex-1 border-t border-neutral-200" />
          </div>

          {/* Google Login */}
          <Button
            variant="outline"
            fullWidth
            onClick={handleGoogleLogin}
            loading={googleLoading}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Masuk dengan Google
          </Button>

          {/* Switch to Register */}
          <div className="mt-6 text-center text-xs text-neutral-500 pt-4 border-t border-neutral-100">
            Belum memiliki akun?{" "}
            <Link
              href="/daftar"
              className="font-bold text-[#327691] hover:underline"
            >
              Daftar akun di sini
            </Link>
          </div>

          <p className="text-xs text-neutral-400 text-center mt-6">
            Dengan masuk, Anda menyetujui{" "}
            <Link
              href="/syarat-ketentuan"
              className="text-primary-600 hover:underline"
            >
              Syarat & Ketentuan
            </Link>{" "}
            dan{" "}
            <Link
              href="/kebijakan-privasi"
              className="text-primary-600 hover:underline"
            >
              Kebijakan Privasi
            </Link>{" "}
            kami.
          </p>
        </Card>

        <p className="text-center mt-6 text-sm text-neutral-500">
          <Link
            href="/"
            className="text-primary-600 hover:underline font-medium"
          >
            ← Kembali ke Beranda
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
