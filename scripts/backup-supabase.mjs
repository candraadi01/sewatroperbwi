import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, realpath, rename, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

let phase = "configuration";
try {
  const url = new URL(process.env.DIRECT_URL ?? "");
  const ca = process.env.SUPABASE_BACKUP_CA_FILE;
  const appData = process.env.LOCALAPPDATA;
  if (process.platform !== "win32" || !appData || !ca || !isAbsolute(ca) ||
      !["postgresql:", "postgres:"].includes(url.protocol) ||
      !/^aws-\d+-[a-z0-9-]+\.pooler\.supabase\.com$/.test(url.hostname) ||
      url.port !== "5432" || url.pathname !== "/postgres" || !url.username || !url.password) {
    throw new Error("Expected Windows Session Pooler and an absolute CA path");
  }
  if (!(await stat(ca)).isFile()) throw new Error("CA file not available");
  const root = await realpath(join(dirname(fileURLToPath(import.meta.url)), ".."));
  const privateRoot = await realpath(appData);
  const output = join(privateRoot, "SewaTrooperBackups");
  await mkdir(output, { recursive: true });
  const folder = await realpath(output);
  const fromRepository = relative(root, folder);
  if (!fromRepository || (!isAbsolute(fromRepository) && !fromRepository.startsWith(".." + sep))) {
    throw new Error("Backup directory is inside repository");
  }
  const bin = join(privateRoot, "SewaTrooperTools", "postgresql-17.12");
  const cleanEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) =>
    !/^(PG|DIRECT_URL$|DATABASE_URL$|.*(?:KEY|TOKEN|PASSWORD|SECRET)$)/i.test(key)));
  const connectionEnv = {
    ...cleanEnv, PGHOST: url.hostname, PGPORT: "5432", PGDATABASE: "postgres",
    PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password),
    PGSSLMODE: "verify-full", PGSSLROOTCERT: ca, PGCONNECT_TIMEOUT: "10",
    PGAPPNAME: "sewa-trooper-backup",
  };
  const id = new Date().toISOString().replace(/[:.]/g, "-") + "-" + randomUUID();
  const archive = join(folder, `supabase-${id}.dump`);
  const partial = archive + ".partial";

  function run(program, args, env) {
    const result = spawnSync(join(bin, program + ".exe"), args, {
      env, stdio: "ignore", windowsHide: true,
    });
    if (result.error || result.status !== 0) throw new Error("PostgreSQL tool failed");
  }

  phase = "TLS and read-only preflight";
  const probe = spawnSync(join(bin, "psql.exe"), [
    "-X", "-w", "-q", "-A", "-t", "-v", "ON_ERROR_STOP=1",
    "-c", "BEGIN READ ONLY; SHOW transaction_read_only; ROLLBACK",
  ], { env: connectionEnv, encoding: "utf8", windowsHide: true });
  if (probe.error || probe.status !== 0 || probe.stdout.trim() !== "on") {
    const diagnostic = /certificate|ssl|tls/i.test(probe.stderr ?? "") ? "TLS verification failed" :
      "Connection or read-only verification failed";
    console.error(diagnostic);
    throw new Error("Preflight failed");
  }
  console.log("TLS verify-full and PostgreSQL read-only verified.");
  // pg_dump 17 sets REPEATABLE READ, READ ONLY in its own dump transaction.
  phase = "pg_dump";
  run("pg_dump", ["--no-password", "--format=custom", "--file", partial], connectionEnv);
  phase = "archive verification";
  if ((await stat(partial)).size === 0) throw new Error("Empty archive");
  run("pg_restore", ["--list", partial], cleanEnv);
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(partial)) hash.update(chunk);
  const sha256 = hash.digest("hex");
  phase = "archive finalization";
  await writeFile(archive + ".sha256", sha256 + "\n", { flag: "wx" });
  await rename(partial, archive);
  console.log("Backup verified (archive listing and SHA-256):", archive);
} catch {
  console.error(`Backup failed during ${phase}. No credentials or tool output were logged. Check the private backup folder for a partial archive.`);
  process.exitCode = 1;
}
