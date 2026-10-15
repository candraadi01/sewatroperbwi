import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
export const siteDefaults = {
  site_name: "Sewa Trooper Banyuwangi",
  site_tagline: "Perjalanan privat, rute pilihanmu.",
  service_area: "Banyuwangi dan sekitarnya",
  contact_whatsapp: "",
  contact_email: "",
  contact_address: "Banyuwangi, Jawa Timur",
  office_hours: "Hubungi admin untuk jadwal layanan.",
  hero_title: "Banyuwangi,\ndari dekat.",
  hero_description:
    "Pilih rute perjalananmu. Kami bantu menyiapkan Jeep Trooper dan kebutuhan sewanya.",
  hero_image: "/images/trooper-reference.jpg",
  checkout_enabled: false,
};
export type SiteSettings = typeof siteDefaults;
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured()) return siteDefaults;
  const { data, error } = await createPublicClient()
    .from("site_settings")
    .select("key,value")
    .in("key", Object.keys(siteDefaults));
  if (error) throw new Error("Pengaturan usaha belum dapat dimuat.");
  const result = { ...siteDefaults };
  for (const row of data ?? []) {
    const key = row.key as keyof SiteSettings;
    if (key in siteDefaults && typeof row.value === typeof siteDefaults[key])
      Object.assign(result, { [key]: row.value });
  }
  if (!result.hero_image) result.hero_image = siteDefaults.hero_image;
  return result;
});
export function whatsappLink(
  phone: string,
  message = "Halo, saya ingin bertanya tentang sewa Trooper.",
) {
  const cleaned = phone.replace(/\D/g, "").replace(/^0/, "62");
  return /^62\d{8,13}$/.test(cleaned)
    ? `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`
    : null;
}
