import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
export interface BusinessSettings {
  default_dp_percentage: number;
  dp_mode: string;
  dp_basis: string;
  default_dp_nominal: number;
  confirmation_deadline_hours: number;
  balance_payment_deadline_hours: number;
  terms_and_conditions: string;
  cancellation_policy: string;
  refund_policy: string;
  privacy_policy: string;
  version: number;
}
export async function getBusinessSettings(): Promise<BusinessSettings> {
  const defaults = {
    default_dp_percentage: 3000,
    dp_mode: "percent",
    dp_basis: "per_order",
    default_dp_nominal: 300000,
    confirmation_deadline_hours: 24,
    balance_payment_deadline_hours: 24,
    terms_and_conditions: "",
    cancellation_policy: "",
    refund_policy: "",
    privacy_policy: "",
    version: 0,
  };
  if (!isSupabaseConfigured()) return defaults;
  const { data, error } = await createPublicClient()
    .from("business_settings_versions")
    .select("*")
    .eq("is_current", true)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) throw new Error("Ketentuan bisnis belum tersedia.");
  return { ...defaults, ...data };
}
