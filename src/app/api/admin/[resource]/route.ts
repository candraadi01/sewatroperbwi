import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth/helpers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { resources, resourceSchema } from "@/lib/admin/resources";
import { idSchema } from "@/lib/validations/requests";
import {
  assertSameOrigin,
  readJson,
  RequestError,
  errorResponse,
} from "@/lib/security/http";
import { z } from "zod";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  try {
    assertSameOrigin(request);
    const user = await getAuthUser();
    if (!user) throw new RequestError("Masuk terlebih dahulu.", 401);
    if (!user.roles.includes("admin"))
      throw new RequestError("Akses admin diperlukan.", 403);
    const { resource } = await params;
    const config = resources[resource];
    if (!config || config.readOnly)
      throw new RequestError("Pengaturan tidak tersedia.", 404);
    const payload = z
      .object({
        id: z.string().optional(),
        values: z.record(z.string(), z.unknown()),
      })
      .strict()
      .safeParse(await readJson(request, 100000));
    if (!payload.success) throw new RequestError("Data tidak valid.");
    const parsed = resourceSchema(config).safeParse(payload.data.values);
    if (!parsed.success)
      throw new RequestError(
        parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      );
    const values = parsed.data,
      id = resource === "site" ? undefined : payload.data.id;
    if (id && !idSchema.safeParse(id).success)
      throw new RequestError("ID tidak valid.");
    const db = await createAdminClient();
    if (resource === "site") {
      if (
        values.contact_whatsapp &&
        !/^\+?(?:62|0)8\d{7,12}$/.test(String(values.contact_whatsapp))
      )
        throw new RequestError("Nomor WhatsApp tidak valid.");
      if (
        values.contact_email &&
        !z.string().email().safeParse(values.contact_email).success
      )
        throw new RequestError("Email tidak valid.");
      const rows = Object.entries(values).map(([key, value]) => ({
        key,
        value,
        category: key.startsWith("contact_")
          ? "contact"
          : key.startsWith("hero_")
            ? "appearance"
            : "general",
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }));
      const { error } = await db
        .from("site_settings")
        .upsert(rows, { onConflict: "key" });
      if (error) throw new Error("Settings save failed: " + error.code);
    } else if (resource === "produk") {
      if (
        values.is_owner_approved &&
        (!values.base_price || Number(values.base_price) < 1)
      )
        throw new RequestError("Isi tarif sebelum menyetujui produk.");
      const { error } = await db.rpc("save_admin_product", {
        p: values,
        p_id: id ?? null,
      });
      if (error) throw new Error("Product save failed: " + error.code);
    } else if (resource === "bisnis") {
      const { error } = await db.rpc("save_business_settings", { p: values });
      if (error)
        throw new Error("Business settings save failed: " + error.code);
    } else {
      if (resource === "promo") {
        values.code = String(values.code).toUpperCase();
        if (values.type === "percent" && Number(values.value) > 10000)
          throw new RequestError("Diskon maksimal 100%.");
        if (String(values.valid_from) >= String(values.valid_until))
          throw new RequestError("Tanggal akhir harus setelah tanggal awal.");
      }
      if (
        resource === "harga" &&
        values.date_start &&
        values.date_end &&
        String(values.date_start) > String(values.date_end)
      )
        throw new RequestError("Rentang tanggal tidak valid.");
      if (
        resource === "artikel" &&
        values.status === "published" &&
        !values.published_at
      )
        values.published_at = new Date().toISOString();
      if (resource === "menu") {
        const menu = z
          .array(
            z.object({
              label: z.string().min(1).max(80),
              href: z
                .string()
                .max(500)
                .refine(
                  (v) =>
                    (v.startsWith("/") &&
                      !v.startsWith("//") &&
                      !v.includes("\\")) ||
                    /^https:\/\//.test(v),
                ),
            }),
          )
          .max(20)
          .safeParse(values.items);
        if (!menu.success) throw new RequestError("Daftar menu tidak valid.");
        values.items = menu.data;
      }
      const result = id
        ? await db
            .from(config.table)
            .update(values)
            .eq("id", id)
            .select("id")
            .single()
        : await db.from(config.table).insert(values).select("id").single();
      if (result.error)
        throw new RequestError(
          result.error.code === "23505"
            ? "Data dengan slug/kode yang sama sudah ada."
            : "Data belum tersimpan. Periksa kolom dan migrasi database.",
          409,
        );
    }
    revalidatePath("/", "layout");
    revalidatePath("/sewa");
    revalidatePath("/artikel");
    revalidatePath(`/admin/${resource}`);
    return NextResponse.json({ success: true });
  } catch (e) {
    return errorResponse(e);
  }
}
