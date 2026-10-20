/**
 * Database Migration Runner for Supabase + Prisma
 * Menjalankan migrasi SQL langsung ke Supabase tanpa perlu copy-paste manual di dashboard web.
 */

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function getDatabaseUrl() {
  const envFiles = [".env.local", ".env"];
  let directUrl = "";
  let databaseUrl = "";

  for (const f of envFiles) {
    if (fs.existsSync(f)) {
      const content = fs.readFileSync(f, "utf8");
      const dMatch = content.match(/DIRECT_URL=["']?([^"'\r\n]+)/);
      const bMatch = content.match(/DATABASE_URL=["']?([^"'\r\n]+)/);
      if (dMatch && !directUrl) directUrl = dMatch[1];
      if (bMatch && !databaseUrl) databaseUrl = bMatch[1];
    }
  }

  // Gunakan DIRECT_URL jika ada (port 5432, bukan pooler pgbouncer 6543) agar mendukung DDL / transactional lock
  let target = directUrl || databaseUrl;
  if (!target) {
    console.error("❌ ERROR: DIRECT_URL atau DATABASE_URL tidak ditemukan di .env.local atau .env!");
    process.exit(1);
  }

  // Jika menggunakan pooler pgbouncer (?pgbouncer=true), migrasi DDL bisa gagal, ubah ke direct jika memungkinkan
  if (target.includes("pgbouncer=true")) {
    target = target.replace(":6543/", ":5432/").replace("?pgbouncer=true", "");
  }

  return target;
}

async function runMigrations() {
  const connectionString = getDatabaseUrl();
  const masked = connectionString.replace(/:[^:@]+@/, ":****@");
  console.log(`\n🚀 Menghubungkan ke Supabase PostgreSQL (${masked})...`);

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✓ Terhubung ke database Supabase!");

    // 1. Buat tabel pelacak migrasi jika belum ada
    await client.query(`
      CREATE TABLE IF NOT EXISTS public._schema_migrations (
        name text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    // Ambil daftar migrasi yang sudah pernah dijalankan
    const appliedRes = await client.query(`SELECT name FROM public._schema_migrations;`);
    const appliedSet = new Set(appliedRes.rows.map((r) => r.name));

    // Jika tabel migrasi baru dibuat tapi tabel public sudah ada (migrasi 001-005 sudah jalan sebelumnya),
    // tandai 001-005 sebagai sudah diterapkan agar tidak crash akibat CREATE TABLE yang sudah ada.
    const hasBookingsTable = (
      await client.query(`SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='bookings';`)
    ).rows.length > 0;

    if (appliedSet.size === 0 && hasBookingsTable) {
      const initialBaselines = [
        "001_core_schema.sql",
        "002_rls_policies.sql",
        "003_seed_data.sql",
        "004_operational_repair.sql",
        "005_admin_actions.sql",
      ];
      for (const base of initialBaselines) {
        await client.query(
          `INSERT INTO public._schema_migrations (name) VALUES ($1) ON CONFLICT DO NOTHING;`,
          [base]
        );
        appliedSet.add(base);
      }
      console.log("ℹ Baseline migrasi sebelumnya (001-005) terdeteksi dan tercatat.");
    }

    // 2. Baca seluruh file migrasi di folder supabase/migrations/
    const migrationsDir = path.resolve(process.cwd(), "supabase/migrations");
    if (!fs.existsSync(migrationsDir)) {
      console.error(`❌ Folder ${migrationsDir} tidak ditemukan!`);
      process.exit(1);
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    let executedCount = 0;

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`• [Sudah ada] ${file}`);
        continue;
      }

      console.log(`▶ Menjalankan migrasi baru: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      await client.query("BEGIN;");
      try {
        await client.query(sql);
        await client.query(
          `INSERT INTO public._schema_migrations (name) VALUES ($1);`,
          [file]
        );
        await client.query("COMMIT;");
        console.log(`✓ [Berhasil] ${file}`);
        executedCount++;
      } catch (err) {
        await client.query("ROLLBACK;");
        console.error(`❌ Gagal mengeksekusi migrasi ${file}:`, err.message);
        throw err;
      }
    }

    if (executedCount === 0) {
      console.log("\n🎉 Database Supabase sudah up-to-date! Tidak ada migrasi baru yang perlu dijalankan.");
    } else {
      console.log(`\n🎉 Sukses! Sebanyak ${executedCount} migrasi baru berhasil diterapkan langsung ke Supabase.`);
    }

    // 3. Jalankan prisma generate agar Prisma Client sinkron
    console.log("\n🔄 Menjalankan 'npx prisma generate' untuk memperbarui Prisma Client...");
    try {
      execSync("npx prisma generate", { stdio: "inherit" });
      console.log("✓ Prisma Client berhasil diperbarui!");
    } catch (err) {
      console.warn("⚠️ Peringatan: Prisma generate tidak selesai:", err.message);
    }
  } catch (err) {
    console.error("\n❌ Terjadi kesalahan saat migrasi database:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
