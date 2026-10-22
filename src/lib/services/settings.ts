import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const siteDefaults = {
  site_name: "Sewa Trooper Banyuwangi",
  site_tagline: "Perjalanan privat, rute pilihanmu.",
  service_area: "Banyuwangi dan sekitarnya",
  contact_whatsapp: "62812345678",
  contact_phone: "62812345678",
  contact_email: "info@kulinosewatroper.com",
  contact_address: "Banyuwangi, Jawa Timur",
  office_hours: "24 Jam Setiap Hari",
  hero_title: "Banyuwangi,\ndari dekat.",
  hero_description:
    "Pilih rute perjalananmu. Kami bantu menyiapkan Jeep Trooper dan kebutuhan sewanya.",
  hero_image: "/images/trooper-reference.jpg",
  checkout_enabled: true,
  about_title: "Mengenal Lebih Dekat Sewa Jeep Trooper Banyuwangi",
  about_description:
    "Layanan rental Jeep 4x4 terpercaya untuk eksplorasi Kawah Ijen, Baluran, Sukamade, dan destinasi petualangan lainnya.",
  about_story:
    "Berawal dari kecintaan terhadap keindahan alam Banyuwangi yang luar biasa, Sewa Jeep Trooper Banyuwangi hadir untuk memberikan pengalaman petualangan 4x4 terbaik, aman, dan berkesan.",
  about_fleet_info: "10+ Unit Jeep Trooper 4x4 Terawat",
  about_experience_years: "8+ Tahun Melayani Wisatawan",
  bank_bri_account: "000000",
  bank_bca_account: "000000",
  bank_account_holder: "PT. SEWA JEEP BANYUWANGI",
  developer_credit: "candra",
};

export type SiteSettings = typeof siteDefaults;

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured()) return siteDefaults;
  try {
    const { data, error } = await createPublicClient()
      .from("site_settings")
      .select("key,value")
      .in("key", Object.keys(siteDefaults));
    if (error || !data) return siteDefaults;
    const result = { ...siteDefaults };
    for (const row of data) {
      const key = row.key as keyof SiteSettings;
      if (key in siteDefaults) {
        let val = row.value;
        if (typeof val === "string") {
          try {
            val = JSON.parse(val);
          } catch {
            val = val.replace(/^"|"$/g, "");
          }
        }
        if (val !== undefined && val !== null && val !== "") {
          (result as any)[key] = val;
        }
      }
    }
    if (!result.hero_image) result.hero_image = siteDefaults.hero_image;
    return result;
  } catch {
    return siteDefaults;
  }
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
