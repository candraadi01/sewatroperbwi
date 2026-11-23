import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { ArrowLeft } from "lucide-react";
import { TrooperBrand } from "@/components/layout/TrooperBrand";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const requestHeaders = process.env.NODE_ENV === "development" ? await headers() : null;
  const local = requestHeaders && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestHeaders.get("host") ?? "") && requestHeaders.get("sec-fetch-site") !== "cross-site";
  const testAccounts = local ? [
    { label: "Admin", email: process.env.DEV_TEST_ADMIN_EMAIL?.trim() || "admin@sewatrooperbwi.com", password: process.env.DEV_TEST_ADMIN_PASSWORD || "Password123!" },
    { label: "Owner", email: process.env.DEV_TEST_OWNER_EMAIL?.trim() || "owner@sewatrooperbwi.com", password: process.env.DEV_TEST_OWNER_PASSWORD || "Password123!" },
    { label: "Buyer", email: process.env.DEV_TEST_BUYER_EMAIL?.trim() || "buyer@sewatrooperbwi.com", password: process.env.DEV_TEST_BUYER_PASSWORD || "Password123!" },
  ] : [];

  return (
    <main className="grid min-h-svh bg-[#f6f6f3] text-[#192127] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <aside className="relative isolate flex min-h-24 flex-col justify-between overflow-hidden bg-[#172026] px-5 py-5 text-white sm:px-9 lg:min-h-svh lg:p-12">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,#12191e,transparent_60%),url('/images/landing/cinematic-banyuwangi.webp')] bg-cover bg-center opacity-75" />
        <Link href="/" aria-label="Sewa Trooper Banyuwangi"><TrooperBrand /></Link>
        <p className="hidden max-w-md text-4xl font-bold tracking-tight lg:block">Jelajahi Banyuwangi dengan Jeep Trooper.</p>
      </aside>
      <div className="flex justify-center px-5 py-7 sm:px-9 sm:py-12 lg:items-center">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-5 inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-[#805211] hover:underline">
            <ArrowLeft size={16} aria-hidden="true" /> Kembali ke beranda
          </Link>
          <div className="rounded-2xl border border-[#dedfda] bg-white p-5 shadow-sm sm:p-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Masuk</h1>
            <p className="mb-6 mt-2 text-sm leading-relaxed text-[#53606a]">Akses akun untuk mengelola atau melanjutkan pesanan Jeep Trooper Anda.</p>
            <Suspense fallback={<p role="status">Memuat formulir?</p>}>
              <LoginForm testAccounts={testAccounts} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
