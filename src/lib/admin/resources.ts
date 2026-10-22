import { z } from "zod";
import { idSchema } from "@/lib/validations/requests";
export interface AdminField {
  key: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "number"
    | "checkbox"
    | "select"
    | "date"
    | "datetime-local"
    | "lines"
    | "content"
    | "json"
    | "image";
  required?: boolean;
  min?: number;
  max?: number;
  options?: string[];
  source?: "products" | "product_categories";
  nullable?: boolean;
  default?: unknown;
}
export interface AdminResource {
  table: string;
  title: string;
  description: string;
  fields: AdminField[];
  readOnly?: boolean;
  columns?: string;
  order?: string;
  single?: boolean;
}
const text = (
  key: string,
  label: string,
  extra: Partial<AdminField> = {},
): AdminField => ({ key, label, ...extra });
const num = (
  key: string,
  label: string,
  min = 0,
  defaultValue = 0,
): AdminField => ({
  key,
  label,
  type: "number",
  min,
  max: 100000000,
  default: defaultValue,
});
const active: AdminField = {
  key: "is_active",
  label: "Aktif",
  type: "checkbox",
  default: true,
};
const status: AdminField = {
  key: "status",
  label: "Publikasi",
  type: "select",
  options: ["draft", "published", "archived"],
  default: "draft",
};
const productId: AdminField = {
  key: "product_id",
  label: "Produk",
  type: "select",
  source: "products",
  required: true,
};
export const resources: Record<string, AdminResource> = {
  site: {
    table: "site_settings",
    title: "Informasi usaha & beranda",
    description:
      "Nama, kontak, foto, dan izin checkout yang digunakan seluruh halaman buyer.",
    single: true,
    fields: [
      text("site_name", "Nama usaha", { required: true }),
      text("site_tagline", "Tagline"),
      text("service_area", "Wilayah layanan"),
      text("contact_whatsapp", "WhatsApp (62…, kosongkan jika belum tersedia)"),
      text("contact_phone", "No. Telepon / Hotline (cth: 62812345678)"),
      text("contact_email", "Email usaha (cth: info@kulinosewatroper.com)"),
      text("bank_bri_account", "No. Rekening BRI (cth: 000000)"),
      text("bank_bca_account", "No. Rekening BCA (cth: 000000)"),
      text("bank_account_holder", "Nama Pemilik Rekening (cth: PT. SEWA JEEP BANYUWANGI)"),
      text("developer_credit", "Developer Credit Footer (cth: candra)"),
      text("contact_address", "Alamat", { type: "textarea" }),
      text("office_hours", "Jam pelayanan"),
      text("hero_title", "Judul utama", { type: "textarea" }),
      text("hero_description", "Deskripsi utama", { type: "textarea" }),
      text("hero_image", "Foto utama", { type: "image" }),
      {
        key: "checkout_enabled",
        label: "Buka pembayaran online (produk tetap wajib disetujui)",
        type: "checkbox",
        default: false,
      },
      text("about_title", "Judul Tentang Kami"),
      text("about_description", "Deskripsi Ringkas Tentang Kami", { type: "textarea" }),
      text("about_story", "Cerita & Profil Usaha (Halaman /tentang)", { type: "textarea" }),
      text("about_fleet_info", "Highlight Armada (cth: 10+ Unit Trooper 4x4)"),
      text("about_experience_years", "Pengalaman (cth: 8+ Tahun Melayani)"),
    ],
  },
  produk: {
    table: "products",
    title: "Produk & tarif",
    description:
      "Perubahan disimpan ke Supabase. Persetujuan harga diperlukan sebelum produk bisa dibayar.",
    fields: [
      text("name", "Nama paket", { required: true }),
      text("slug", "Alamat halaman / slug", { required: true }),
      {
        key: "category_id",
        label: "Kategori",
        type: "select",
        source: "product_categories",
        nullable: true,
      },
      {
        key: "service_type",
        label: "Layanan",
        type: "select",
        options: ["paket_rute", "harian_sopir", "harian_lepas_kunci"],
        default: "paket_rute",
      },
      {
        key: "status",
        label: "Status produk",
        type: "select",
        options: ["draft", "active", "inactive", "archived"],
        default: "draft",
      },
      num("base_price", "Tarif utama per kendaraan (Rp)"),
      num("passenger_capacity", "Kapasitas penumpang", 1, 6),
      num("duration_minutes", "Durasi layanan (menit)", 1, 480),
      text("default_start_time", "Jam mulai (HH:MM)", { default: "08:00" }),
      num("min_booking_hours", "Minimal pemesanan sebelum trip (jam)", 0, 24),
      {
        key: "driver_included",
        label: "Termasuk sopir",
        type: "checkbox",
        default: true,
      },
      text("short_description", "Ringkasan", { type: "textarea" }),
      text("description", "Deskripsi", { type: "textarea" }),
      text("route_name", "Nama rute"),
      text("start_point", "Titik berangkat"),
      text("end_point", "Titik selesai"),
      text("cover_image_url", "Foto produk", { type: "image" }),
      text("included_facilities", "Termasuk (satu per baris)", {
        type: "lines",
      }),
      text("excluded_facilities", "Tidak termasuk (satu per baris)", {
        type: "lines",
      }),
      text("terms_content", "Ketentuan paket", { type: "textarea" }),
      text("terms_version", "Versi ketentuan", { default: "v1" }),
      {
        ...num(
          "dp_override_percentage",
          "DP khusus (basis poin; 3000 = 30%)",
          1,
        ),
        nullable: true,
        default: null,
      },
      num("overtime_rate_per_hour", "Overtime per jam (Rp)"),
      num("sort_order", "Urutan"),
      {
        key: "is_owner_approved",
        label: "Harga dan layanan sudah disetujui owner",
        type: "checkbox",
        default: false,
      },
      {
        key: "is_best_seller",
        label: "Tandai Produk BEST SELLER (Muncul pita merah di foto katalog)",
        type: "checkbox",
        default: false,
      },
    ],
  },
  kategori: {
    table: "product_categories",
    title: "Kategori",
    description: "Kategori yang tampil pada katalog.",
    fields: [
      text("name", "Nama", { required: true }),
      text("slug", "Slug", { required: true }),
      text("description", "Deskripsi", { type: "textarea" }),
      num("sort_order", "Urutan"),
      active,
    ],
  },
  harga: {
    table: "pricing_rules",
    title: "Harga khusus",
    description:
      "Tarif per kendaraan. Prioritas tertinggi yang cocok dengan tanggal dipakai saat menghitung harga.",
    fields: [
      productId,
      text("name", "Nama aturan", { required: true }),
      num("base_price", "Harga per kendaraan (Rp)", 1),
      {
        key: "price_unit",
        label: "Satuan",
        type: "select",
        options: ["per_vehicle"],
        default: "per_vehicle",
      },
      text("date_start", "Tanggal mulai", { type: "date", nullable: true }),
      text("date_end", "Tanggal selesai", { type: "date", nullable: true }),
      num("priority", "Prioritas"),
      active,
      {
        key: "is_sample_data",
        label: "Masih harga contoh",
        type: "checkbox",
        default: true,
      },
    ],
  },
  kalender: {
    table: "blackout_dates",
    title: "Tanggal ditutup",
    description:
      "Tanggal yang tidak menerima booking. Kosongkan produk untuk menutup seluruh layanan.",
    fields: [
      { ...productId, required: false, nullable: true },
      text("date", "Tanggal", { type: "date", required: true }),
      text("reason", "Alasan", { type: "textarea" }),
    ],
  },
  kuota: {
    table: "sales_quotas",
    title: "Kuota penjualan",
    description:
      "Batas permintaan per produk dan tanggal; bukan stok real-time dari mitra.",
    fields: [
      productId,
      text("date", "Tanggal", { type: "date", required: true }),
      num("max_units", "Maksimal unit", 1, 1),
    ],
  },
  penjemputan: {
    table: "pickup_zones",
    title: "Area penjemputan",
    description: "Biaya tambahan dihitung per kendaraan.",
    fields: [
      text("name", "Nama area", { required: true }),
      text("description", "Keterangan", { type: "textarea" }),
      num("additional_cost", "Tambahan per kendaraan (Rp)"),
      num("sort_order", "Urutan"),
      active,
    ],
  },
  promo: {
    table: "promos",
    title: "Kode promo",
    description:
      "Potongan persen memakai basis poin: 1000 = 10%. Kuota diperiksa kembali saat booking disimpan.",
    fields: [
      text("code", "Kode promo", { required: true }),
      text("name", "Nama promo", { required: true }),
      {
        key: "type",
        label: "Jenis potongan",
        type: "select",
        options: ["percent", "nominal"],
        default: "percent",
      },
      num("value", "Nilai (basis poin / Rp)", 1, 1000),
      {
        ...num("max_discount", "Batas potongan (Rp)"),
        nullable: true,
        default: null,
      },
      num("min_order_amount", "Minimal transaksi (Rp)"),
      text("valid_from", "Mulai berlaku", {
        type: "datetime-local",
        required: true,
      }),
      text("valid_until", "Berakhir", {
        type: "datetime-local",
        required: true,
      }),
      {
        ...num("total_quota", "Kuota total", 1),
        nullable: true,
        default: null,
      },
      num("per_buyer_limit", "Batas per buyer", 1, 1),
      active,
    ],
  },
  halaman: {
    table: "pages",
    title: "Halaman informasi",
    description:
      "Halaman tambahan tersedia di /halaman/slug. Kelola halaman tentang dengan slug tentang. Ketentuan, pembatalan, dan privasi dikelola melalui Ketentuan bisnis agar versi pesanan konsisten.",
    fields: [
      text("title", "Judul", { required: true }),
      text("slug", "Slug", { required: true }),
      text("content", "Isi (paragraf dipisahkan baris kosong)", {
        type: "content",
      }),
      status,
      text("meta_description", "Deskripsi pencarian", { type: "textarea" }),
    ],
  },
  artikel: {
    table: "articles",
    title: "Artikel",
    description: "Artikel terbit hanya muncul setelah waktu publikasi.",
    fields: [
      text("title", "Judul", { required: true }),
      text("slug", "Slug", { required: true }),
      text("category_name", "Kategori Artikel", { default: "Destinasi Wisata Banyuwangi" }),
      text("cover_image_url", "Foto Sampul Artikel", { type: "image" }),
      text("excerpt", "Ringkasan", { type: "textarea" }),
      text("content", "Isi artikel (paragraf dipisahkan baris kosong)", {
        type: "content",
      }),
      status,
      text("published_at", "Waktu publikasi", {
        type: "datetime-local",
        nullable: true,
      }),
      text("meta_description", "Deskripsi pencarian", { type: "textarea" }),
    ],
  },
  testimoni: {
    table: "testimonials",
    title: "Testimoni Pelanggan",
    description: "Ulasan nyata wisatawan yang tampil pada slider beranda web.",
    fields: [
      text("name", "Nama Pelanggan / Tamu", { required: true }),
      text("city", "Kota Asal (cth: Jakarta, Surabaya)", { required: true }),
      text("rating_text", "Label Rating (cth: RATING 5/5)", { default: "RATING 5/5" }),
      num("stars", "Bintang Rating (1-5)", 1, 5),
      text("content", "Isi Ulasan", { type: "textarea", required: true }),
      num("sort_order", "Urutan Tampil"),
      active,
    ],
  },
  destinasi: {
    table: "destinations",
    title: "Destinasi Wisata",
    description: "Daftar objek wisata Banyuwangi yang tampil di menu /destinasi dan filter beranda.",
    fields: [
      text("name", "Nama Destinasi", { required: true }),
      text("slug", "Slug URL", { required: true }),
      {
        key: "category",
        label: "Kategori Destinasi",
        type: "select",
        options: ["Gunung", "Taman Nasional", "Hutan & Alam", "Pantai & Bahari", "Air Terjun"],
        default: "Gunung",
      },
      text("district", "Kecamatan / Wilayah (cth: Kecamatan Licin)"),
      text("description", "Deskripsi Objek Wisata", { type: "textarea", required: true }),
      text("highlights", "Highlight Wisata (satu per baris)", { type: "lines" }),
      text("image_url", "Foto Destinasi", { type: "image" }),
      text("query_param", "Kata Kunci Filter (cth: ijen, baluran)"),
      num("sort_order", "Urutan Tampil"),
      active,
    ],
  },
  faq: {
    table: "faqs",
    title: "Pertanyaan umum",
    description: "Jawaban yang tampil di halaman bantuan.",
    fields: [
      text("question", "Pertanyaan", { required: true }),
      text("answer", "Jawaban", { type: "textarea", required: true }),
      text("category", "Kategori", { default: "umum" }),
      num("sort_order", "Urutan"),
      active,
    ],
  },
  tampilan: {
    table: "landing_sections",
    title: "Bagian beranda",
    description:
      'Bagian informasi tambahan di bawah cara pemesanan. Isi JSON: {"text":"Isi bagian"}.',
    fields: [
      {
        key: "section_type",
        label: "Bagian",
        type: "select",
        options: ["information"],
        default: "information",
      },
      text("title", "Judul"),
      text("subtitle", "Subjudul", { type: "textarea" }),
      text("content", "Pengaturan tambahan (JSON)", {
        type: "json",
        default: {},
      }),
      num("sort_order", "Urutan"),
      active,
    ],
  },
  menu: {
    table: "menus",
    order: "updated_at",
    title: "Navigasi",
    description:
      "Gunakan daftar JSON berisi label dan href; hanya tautan relatif atau HTTPS.",
    fields: [
      {
        key: "location",
        label: "Lokasi",
        type: "select",
        options: ["header", "footer"],
        default: "header",
      },
      text("items", "Daftar menu (JSON)", { type: "json", default: [] }),
    ],
  },
  media: {
    table: "media",
    title: "Media",
    description:
      "Unggah foto melalui tombol pada form produk atau pengaturan. Rahasia Cloudinary tidak dikirim ke browser.",
    fields: [
      text("public_id", "Cloudinary public ID", { required: true }),
      text("alt_text", "Deskripsi gambar"),
      text("caption", "Keterangan foto"),
      text("usage_context", "Penggunaan"),
    ],
    readOnly: true,
  },
  buyer: {
    table: "profiles",
    title: "Buyer",
    description:
      "Kontak dan status akses akun. Penetapan admin dilakukan melalui prosedur bootstrap terkontrol.",
    columns: "id,full_name,email,phone,account_status,created_at",
    fields: [],
    readOnly: true,
  },
  pembayaran: {
    table: "payment_attempts",
    title: "Pembayaran",
    description:
      "Status berasal dari Midtrans yang terverifikasi; tidak ada tombol simulasi pembayaran.",
    columns:
      "id,midtrans_order_id,purpose,expected_amount,paid_amount,status,created_at",
    fields: [],
    readOnly: true,
  },
  notifikasi: {
    table: "notification_outbox",
    title: "Notifikasi",
    description:
      "Riwayat notifikasi tersimpan. Kanal eksternal memerlukan provider yang dikonfigurasi.",
    columns: "id,channel,subject,status,created_at",
    fields: [],
    readOnly: true,
  },
  riwayat: {
    table: "audit_logs",
    title: "Riwayat perubahan",
    description:
      "Catatan otomatis setiap perubahan konten dan produk oleh admin.",
    columns: "id,action,entity_type,entity_id,created_at",
    fields: [],
    readOnly: true,
  },
  refund: {
    table: "refunds",
    title: "Pengembalian dana",
    description:
      "Permintaan pengembalian dana. Status pembayaran tidak boleh diubah manual.",
    columns: "id,booking_id,amount,reason,status,created_at",
    fields: [],
    readOnly: true,
  },
  bisnis: {
    table: "business_settings_versions",
    single: true,
    title: "Ketentuan bisnis & DP",
    description:
      "Perubahan membuat versi baru. Ketentuan pesanan lama tetap tersimpan.",
    fields: [
      num(
        "default_dp_percentage",
        "DP standar (basis poin; 3000 = 30%)",
        1,
        3000,
      ),
      {
        key: "dp_mode",
        label: "Cara hitung DP",
        type: "select",
        options: ["percent", "nominal"],
        default: "percent",
      },
      num("default_dp_nominal", "DP nominal (Rp)", 1, 300000),
      {
        key: "dp_basis",
        label: "Dasar DP nominal",
        type: "select",
        options: ["per_order", "per_unit"],
        default: "per_order",
      },
      num(
        "confirmation_deadline_hours",
        "Batas konfirmasi kendaraan (jam)",
        1,
        24,
      ),
      num(
        "balance_payment_deadline_hours",
        "Pelunasan sebelum trip (jam)",
        0,
        24,
      ),
      text("terms_and_conditions", "Syarat sewa", {
        type: "textarea",
        required: true,
      }),
      text("cancellation_policy", "Kebijakan pembatalan", {
        type: "textarea",
        required: true,
      }),
      text("refund_policy", "Kebijakan pengembalian dana", {
        type: "textarea",
        required: true,
      }),
      text("privacy_policy", "Kebijakan privasi", {
        type: "textarea",
        required: true,
      }),
    ],
  },
};

export function resourceSchema(resource: AdminResource) {
  const shape: Record<string, z.ZodType> = {};
  for (const f of resource.fields) {
    let value: z.ZodType;
    if (f.type === "number")
      value = z
        .number()
        .int()
        .min(f.min ?? 0)
        .max(f.key.includes("percentage") ? 10000 : (f.max ?? 100000000));
    else if (f.type === "checkbox") value = z.boolean();
    else if (f.source) value = idSchema;
    else if (f.type === "select")
      value = z.enum(f.options as [string, ...string[]]);
    else if (f.type === "lines")
      value = z.array(z.string().trim().max(500)).max(50);
    else if (f.type === "content")
      value = z
        .array(
          z.object({
            type: z.literal("paragraph"),
            text: z.string().max(10000),
          }),
        )
        .max(100);
    else if (f.type === "json")
      value = z.union([
        z.record(z.string(), z.unknown()),
        z.array(z.record(z.string(), z.unknown())),
      ]);
    else
      value = z
        .string()
        .trim()
        .max(f.type === "textarea" ? 20000 : 500)
        .min(f.required ? 1 : 0);
    if (f.key === "slug")
      value = z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .max(200);
    if (f.key === "default_start_time")
      value = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(?::00)?$/);
    if (f.type === "image")
      value = z
        .string()
        .refine(
          (v) =>
            !v ||
            /^\/images\/[a-zA-Z0-9._/-]+$/.test(v) ||
            /^https:\/\/res\.cloudinary\.com\/[a-zA-Z0-9_/-]+\/.+/.test(v),
          "Gunakan foto Cloudinary atau gambar lokal.",
        );
    shape[f.key] = f.nullable ? value.nullable() : value;
  }
  return z.object(shape).strict();
}
