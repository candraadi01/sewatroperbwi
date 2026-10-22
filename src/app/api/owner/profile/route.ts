import { z } from "zod";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/helpers";
import { createAdminClient } from "@/lib/supabase/server";
import {
  assertSameOrigin,
  readJson,
  errorResponse,
  RequestError,
} from "@/lib/security/http";
import { getSiteSettings } from "@/lib/services/settings";

const updateProfileSchema = z
  .object({
    fullName: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
    phone: z.string().trim().min(8, "Nomor WhatsApp minimal 8 digit").max(20),
    poName: z.string().trim().max(100).optional(),
    bankName: z.string().trim().min(2, "Nama bank diperlukan").max(50),
    accountNumber: z.string().trim().min(1, "Nomor rekening diperlukan").max(35),
    accountHolder: z.string().trim().min(2, "Nama pemilik rekening diperlukan").max(100),
    briAccount: z.string().trim().max(35).optional(),
    bcaAccount: z.string().trim().max(35).optional(),
    businessEmail: z.string().trim().max(100).optional(),
    developerCredit: z.string().trim().max(50).optional(),
  })
  .strict();

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || (!user.roles.includes("owner") && !user.roles.includes("admin"))) {
      throw new RequestError("Akses pemilik armada diperlukan.", 403);
    }

    const db = await createAdminClient();
    const settings = await getSiteSettings();

    // Ambil data profile & auth user metadata
    const [{ data: profile }, { data: authUser }] = await Promise.all([
      db.from("profiles").select("full_name, phone, email").eq("id", user.id).single(),
      db.auth.admin.getUserById(user.id),
    ]);

    const metadata = authUser?.user?.user_metadata || {};

    return NextResponse.json({
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
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getAuthUser();
    if (!user || (!user.roles.includes("owner") && !user.roles.includes("admin"))) {
      throw new RequestError("Akses pemilik armada diperlukan.", 403);
    }

    const body = await readJson(request);
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join(", ");
      throw new RequestError(msg || "Data profil tidak valid.", 400);
    }

    const {
      fullName,
      phone,
      poName,
      bankName,
      accountNumber,
      accountHolder,
      briAccount,
      bcaAccount,
      businessEmail,
      developerCredit,
    } = parsed.data;

    const db = await createAdminClient();

    // 1. Update tabel profiles
    const { error: profileError } = await db
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("[owner-profile] profile update error:", profileError);
    }

    // 2. Update auth user metadata
    const { data: currentUser } = await db.auth.admin.getUserById(user.id);
    const existingMeta = currentUser?.user?.user_metadata || {};

    await db.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...existingMeta,
        full_name: fullName,
        phone,
        po_name: poName || "",
        bank_name: bankName,
        account_number: accountNumber,
        account_holder: accountHolder,
      },
    });

    // 3. Update site_settings agar footer langsung berubah secara realtime
    const settingsRows = [
      { key: "contact_whatsapp", value: phone, category: "contact" },
      { key: "contact_phone", value: phone, category: "contact" },
      { key: "contact_email", value: businessEmail || "info@kulinosewatroper.com", category: "contact" },
      { key: "bank_bri_account", value: briAccount || "000000", category: "finance" },
      { key: "bank_bca_account", value: bcaAccount || accountNumber || "000000", category: "finance" },
      { key: "bank_account_holder", value: accountHolder || "PT. SEWA JEEP BANYUWANGI", category: "finance" },
      { key: "developer_credit", value: developerCredit || "candra", category: "general" },
    ].map((r) => ({
      ...r,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    }));

    await db.from("site_settings").upsert(settingsRows, { onConflict: "key" });

    revalidatePath("/", "layout");
    revalidatePath("/owner/profil");
    revalidatePath("/owner/tarik-dana");
    revalidatePath("/owner");

    return NextResponse.json({
      success: true,
      message: "Profil pemilik dan informasi rekening website berhasil diperbarui secara realtime.",
    });
  } catch (e) {
    return errorResponse(e);
  }
}
