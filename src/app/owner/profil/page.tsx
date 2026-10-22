import Link from "next/link";
import { requireOwner } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/services/settings";
import { OwnerProfileClient } from "./OwnerProfileClient";

export const metadata = {
  title: "Profil Pemilik & Rekening | Sewa Trooper Banyuwangi",
  description: "Kelola profil pemilik armada Trooper dan data rekening bank.",
};

export default async function OwnerProfilPage() {
  const user = await requireOwner("/owner/profil");
  const db = await createAdminClient();
  const settings = await getSiteSettings();

  // Ambil profil dan metadata
  const [{ data: profile }, { data: authUser }] = await Promise.all([
    db.from("profiles").select("full_name, phone, email").eq("id", user.id).single(),
    db.auth.admin.getUserById(user.id),
  ]);

  const metadata = authUser?.user?.user_metadata || {};

  const initialData = {
    fullName: profile?.full_name || user.fullName || "",
    email: profile?.email || user.email || "",
    phone: profile?.phone || metadata.phone || settings.contact_phone || "62812345678",
    poName: metadata.po_name || "",
    bankName: metadata.bank_name || "BCA (Bank Central Asia)",
    accountNumber: metadata.account_number || (settings as any).bank_bca_account || "000000",
    accountHolder: metadata.account_holder || (settings as any).bank_account_holder || "PT. SEWA JEEP BANYUWANGI",
    briAccount: (settings as any).bank_bri_account || "000000",
    bcaAccount: (settings as any).bank_bca_account || "000000",
    businessEmail: settings.contact_email || "info@kulinosewatroper.com",
    developerCredit: (settings as any).developer_credit || "candra",
  };

  return (
    <div className="space-y-7 font-sans max-w-3xl">
      {/* Header */}
      <div className="pb-4 border-b border-[#e4ebef]">
        <Link href="/owner" className="text-xs font-bold text-[#327691] hover:underline">
          ← Kembali ke Dashboard Pemilik
        </Link>
        <h1 className="heading-1 mt-2">Profil Pemilik, Kontak Usaha & Rekening Bank</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Informasi pemilik armada, data kontak hotline, nomor rekening resmi BRI & BCA, serta credit footer website.
        </p>
      </div>

      <OwnerProfileClient initialData={initialData} />
    </div>
  );
}
