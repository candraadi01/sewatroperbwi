import { z } from 'zod';

/**
 * Environment variables schema.
 * Validasi di server boundary — gagal startup jika variable kritis tidak ada.
 * Public variables (NEXT_PUBLIC_*) boleh diakses client.
 * Private variables HANYA di server.
 */

const serverSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL harus berupa URL valid'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY wajib diisi'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY wajib diisi'),

  // Midtrans
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z.string().min(1, 'NEXT_PUBLIC_MIDTRANS_CLIENT_KEY wajib diisi'),
  NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION: z.string().default('false'),
  MIDTRANS_SERVER_KEY: z.string().min(1, 'MIDTRANS_SERVER_KEY wajib diisi'),

  // Cloudinary
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1, 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME wajib diisi'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY wajib diisi'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET wajib diisi'),

  // Cron
  CRON_SECRET: z.string().min(32, 'CRON_SECRET minimal 32 karakter'),

  // Site
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SITE_NAME: z.string().default('Sewa Trooper Banyuwangi'),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: z.string().min(1),
  NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION: z.string().default('false'),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SITE_NAME: z.string().default('Sewa Trooper Banyuwangi'),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

/**
 * Validasi server env. Panggil di startup/server boundary.
 * Di development, error ditampilkan sebagai warning.
 */
export function validateServerEnv(): ServerEnv {
  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map(
      (i) => `  - ${i.path.join('.')}: ${i.message}`
    );
    const msg = `❌ Environment variables tidak lengkap:\n${missing.join('\n')}`;

    if (process.env.NODE_ENV === 'production') {
      throw new Error(msg);
    }
    console.warn(`⚠️ [DEV] ${msg}\nBeberapa fitur mungkin tidak berfungsi.`);
    // Return partial in dev so app can start
    return process.env as unknown as ServerEnv;
  }
  return result.data;
}

/**
 * Client env — hanya NEXT_PUBLIC_* variables.
 */
export function getClientEnv(): ClientEnv {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '',
    NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION ?? 'false',
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Sewa Trooper Banyuwangi',
  };
}
