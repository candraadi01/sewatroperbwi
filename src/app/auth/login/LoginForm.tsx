"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Mail } from "lucide-react";
import { loginDestination } from "@/lib/auth/login-destination";
import { safeRedirectPath } from "@/lib/security/redirect";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const inputClass = "mt-1.5 min-h-11 w-full rounded-lg border border-[#cfd6d9] bg-[#f8faf9] px-3 text-base text-[#192127] focus-visible:outline-2 focus-visible:outline-[#946021]";
const messages = new Map([
  ["access_denied", "Permintaan masuk dibatalkan atau ditolak. Silakan coba lagi."],
  ["auth_callback_failed", "Tautan masuk tidak dapat digunakan. Buka proses masuk baru dari browser ini."],
]);
type TestAccount = { label: string; email: string; password?: string };

export function LoginForm({ testAccounts }: { testAccounts: TestAccount[] }) {
  const params = useSearchParams();
  const destination = safeRedirectPath(params.get("redirectTo"));
  const [method, setMethod] = useState<"password" | "link">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState(messages.get(params.get("error") ?? "") ?? "");
  const [notice, setNotice] = useState("");
  const passwordInput = useRef<HTMLInputElement>(null);

  function fillTestAccount(account: TestAccount) {
    const pwd = account.password || "Password123!";
    setEmail(account.email);
    setPassword(pwd);
    setVisible(false);
    setMethod("password");
    setError("");
    setNotice("");
    window.requestAnimationFrame(() => passwordInput.current?.focus());
  }

  function callbackUrl() {
    const callback = new URL("/auth/callback", window.location.origin);
    if (destination !== "/") callback.searchParams.set("next", destination);
    return callback.href;
  }

  async function signIn(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (pending) return;
    setPending(event ? "email" : "google");
    setError("");
    setNotice("");
    try {
      if (!isSupabaseConfigured()) throw new Error("Layanan masuk belum dikonfigurasi.");
      const supabase = createClient();
      if (!event) {
        const endpoint = new URL("/auth/v1/settings", process.env.NEXT_PUBLIC_SUPABASE_URL);
        const settings = await fetch(endpoint, {
          headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "" },
          signal: AbortSignal.timeout(8000),
        }).catch(() => null);
        const providers = settings?.ok ? await settings.json().catch(() => null) : null;
        if (providers?.external?.google === false) {
          throw new Error("Masuk dengan Google belum diaktifkan oleh pengelola. Gunakan email untuk masuk.");
        }
        const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callbackUrl(), skipBrowserRedirect: true } });
        if (error || !data.url) throw new Error("Tidak dapat membuka login Google. Silakan coba lagi.");
        window.location.assign(data.url);
        return;
      }
      if (method === "link") {
        const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: callbackUrl(), shouldCreateUser: false } });
        if (error) throw new Error("Link masuk belum dapat dikirim. Periksa email akun dan coba lagi.");
        setNotice("Link masuk telah dikirim. Buka tautan dari browser yang sama.");
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error || !data.user) throw new Error("Gagal masuk. Periksa email dan kata sandi, lalu coba lagi.");
      const { data: roles, error: rolesError } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      if (rolesError) {
        await supabase.auth.signOut({ scope: "local" });
        throw new Error("Akses akun belum dapat diverifikasi. Silakan coba lagi.");
      }
      window.location.assign(loginDestination(destination, (roles ?? []).map(({ role }: { role: string }) => role)));
    } catch (reason) {
      setError(reason instanceof Error && !(reason instanceof TypeError) ? reason.message : "Koneksi bermasalah. Silakan coba lagi.");
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      {error && <p role="alert" className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertCircle size={17} className="shrink-0" />{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
      {testAccounts.length > 0 && <section aria-labelledby="test-login-title" className="mb-5 rounded-xl border border-[#e3cf9f] bg-[#fff9ec] p-3">
        <h2 id="test-login-title" className="text-sm font-bold">Masuk Cepat</h2>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {testAccounts.map((account) => (
            <button
              key={account.label}
              type="button"
              disabled={!!pending}
              onClick={() => fillTestAccount(account)}
              className={`min-h-11 rounded-md border px-1.5 text-xs font-semibold transition-colors ${
                email === account.email
                  ? "border-[#805211] bg-[#faefd9] text-[#805211] font-bold ring-1 ring-[#805211]"
                  : "border-[#d8c49d] bg-white text-[#192127] hover:bg-[#faefd9]"
              }`}
            >
              {account.label}
            </button>
          ))}
        </div>
      </section>}
      <button type="button" disabled={!!pending} onClick={() => void signIn()} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#cfd6d9] px-3 text-sm font-bold hover:bg-[#f3f4f2] disabled:opacity-60">
        <span aria-hidden="true" className="text-base font-black text-[#3469cd]">G</span> {pending === "google" ? "Membuka Google…" : "Masuk dengan Google"}
      </button>
      <p className="my-4 text-center text-xs text-[#53606a]">atau masuk dengan email</p>
      <form onSubmit={signIn} className="space-y-4">
        <label className="block text-sm font-semibold">Email
          <input className={inputClass} type="email" name="username" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        {method === "password" && <label className="block text-sm font-semibold">Kata sandi
          <span className="relative block">
            <input ref={passwordInput} className={`${inputClass} pr-12`} type={visible ? "text" : "password"} name="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            <button type="button" aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} onClick={() => setVisible(!visible)} className="absolute bottom-0 right-0 grid size-11 place-items-center text-[#53606a]">{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </span>
        </label>}
        <button disabled={!!pending} className="min-h-11 w-full rounded-lg bg-[#f4bd42] px-3 text-sm font-extrabold text-[#192127] hover:bg-[#f6cc6c] disabled:opacity-60">{pending === "email" ? "Memproses…" : method === "password" ? "Masuk" : "Kirim link masuk"}</button>
        <button type="button" disabled={!!pending} onClick={() => { setMethod(method === "password" ? "link" : "password"); setError(""); setNotice(""); }} className="flex min-h-9 items-center gap-1.5 text-sm font-semibold text-[#805211] hover:underline"><Mail size={15} />{method === "password" ? "Masuk lewat link email" : "Gunakan kata sandi"}</button>
      </form>
      <p className="mt-4 border-t border-[#e0e3e0] pt-4 text-sm text-[#53606a]">Belum punya akun? <Link href="/auth/register" className="font-bold text-[#805211] hover:underline">Daftar</Link></p>
    </>
  );
}
