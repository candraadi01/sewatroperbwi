"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export type DemoRole = "admin" | "owner" | "buyer";

interface DemoAccountConfig {
  key: DemoRole;
  label: string;
  badge: string;
  email: string;
  pass: string;
  href: string;
}

const DEMO_ACCOUNTS: DemoAccountConfig[] = [
  {
    key: "admin",
    label: "Super Admin",
    badge: "ADMIN",
    email: "admin@sewatrooperbwi.com",
    pass: "AdminTrooper2026!",
    href: "/admin",
  },
  {
    key: "owner",
    label: "Owner (Mitra Trooper)",
    badge: "OWNER",
    email: "owner@sewatrooperbwi.com",
    pass: "OwnerTrooper2026!",
    href: "/owner",
  },
  {
    key: "buyer",
    label: "Buyer (Pelanggan)",
    badge: "BUYER",
    email: "buyer@sewatrooperbwi.com",
    pass: "BuyerTrooper2026!",
    href: "/buyer",
  },
];

interface DemoAccountSwitcherProps {
  currentRole: DemoRole;
  className?: string;
  compact?: boolean;
  onSwitchStart?: () => void;
}

export function DemoAccountSwitcher({
  currentRole,
  className,
  compact = false,
  onSwitchStart,
}: DemoAccountSwitcherProps) {
  const [loadingRole, setLoadingRole] = useState<DemoRole | null>(null);

  async function handleSwitch(target: DemoAccountConfig) {
    if (loadingRole) return;
    if (target.key === currentRole) {
      if (typeof window !== "undefined" && window.location.pathname !== target.href) {
        window.location.assign(target.href);
      }
      return;
    }

    setLoadingRole(target.key);
    onSwitchStart?.();

    try {
      // 1. Coba login di server (Route Handler) agar cookies SSR langsung terpasang
      let serverSuccess = false;
      try {
        const res = await fetch("/api/auth/switch-demo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: target.key }),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          serverSuccess = true;
        }
      } catch (serverErr) {
        console.warn("[switch-demo server call]", serverErr);
      }

      // 2. Login di client via Supabase client agar browser session & cookies lokal tersinkron
      try {
        const supabase = createClient();
        const { error: clientError } = await supabase.auth.signInWithPassword({
          email: target.email,
          password: target.pass,
        });

        // Jika akun buyer belum ada di Supabase, buat otomatis
        if (clientError && target.key === "buyer") {
          const { data: signUpData } = await supabase.auth.signUp({
            email: target.email,
            password: target.pass,
            options: {
              data: {
                full_name: "Pelanggan Demo Trooper",
                phone: "081234567890",
              },
            },
          });
          if (signUpData?.user) {
            await supabase.auth.signInWithPassword({
              email: target.email,
              password: target.pass,
            });
          }
        }
      } catch (clientErr) {
        console.warn("[switch-demo client call]", clientErr);
      }

      // 3. Arahkan langsung ke dashboard role yang dituju dengan full reload
      window.location.assign(target.href);
    } catch (err: any) {
      console.error("[switch-demo error]", err);
      alert("Gagal beralih akun: " + (err?.message || "Terjadi kendala jaringan"));
      setLoadingRole(null);
    }
  }

  return (
    <div className={cn("w-full select-none", className)}>
      {!compact && (
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-[10px] font-bold text-[#8e9da5] dark:text-neutral-500 uppercase tracking-wider">
            Switch Akun Demo
          </span>
          <span className="text-[9px] font-semibold text-[#8e9da5] dark:text-neutral-500">
            Fast Switch
          </span>
        </div>
      )}

      <div className="rounded-2xl border border-[#e4ebef] dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 p-1.5 space-y-1 shadow-2xs backdrop-blur-xs">
        {DEMO_ACCOUNTS.map((acc) => {
          const isActive = acc.key === currentRole;
          const isLoading = loadingRole === acc.key;

          return (
            <button
              key={acc.key}
              type="button"
              disabled={loadingRole !== null}
              onClick={() => handleSwitch(acc)}
              className={cn(
                "group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer text-left",
                isActive
                  ? "bg-[#e9f3f7] dark:bg-[#327691]/25 text-[#2c6881] dark:text-[#8abbd0] font-bold shadow-2xs border border-[#d2e4ec] dark:border-[#327691]/40"
                  : "text-[#53636d] dark:text-neutral-400 font-medium hover:bg-[#f6fafc] dark:hover:bg-neutral-800/70 hover:text-[#263b46] dark:hover:text-white border border-transparent",
                loadingRole !== null && !isLoading && "opacity-50 cursor-not-allowed",
              )}
              title={`Beralih ke akun ${acc.label}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate">{acc.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {isLoading ? (
                  <Loader2
                    size={13}
                    className="animate-spin text-[#327691] dark:text-[#8abbd0]"
                  />
                ) : (
                  <span
                    className={cn(
                      "text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase",
                      isActive
                        ? "bg-[#d5e7f1] dark:bg-[#327691]/50 text-[#2c6881] dark:text-[#8abbd0]"
                        : "text-[#8e9da5] dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 group-hover:bg-neutral-200/60 dark:group-hover:bg-neutral-700/60",
                    )}
                  >
                    {acc.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

