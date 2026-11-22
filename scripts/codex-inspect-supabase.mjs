import { readFileSync } from "node:fs";
import pg from "pg";

const { CODEX_INSPECT_HOST: host, CODEX_INSPECT_USER: user,
  CODEX_INSPECT_PASSWORD: password, CODEX_INSPECT_CA_FILE: caFile,
  CODEX_INSPECT_PROJECT_REF: projectRef } = process.env;

if (!/^aws-[0-9]+-[a-z0-9-]+\.pooler\.supabase\.com$/.test(host ?? "") ||
    !/^[a-z0-9]+$/.test(projectRef ?? "") ||
    user !== `codex_inspect.${projectRef}` || !password || !caFile) {
  console.error("INSPECT: konfigurasi Session Pooler atau login khusus belum lengkap.");
  process.exit(1);
}

let client;
let phase = "TLS configuration";
try {
  client = new pg.Client({ host, port: 5432, database: "postgres", user, password,
    ssl: { ca: readFileSync(caFile, "utf8"), rejectUnauthorized: true, servername: host },
    connectionTimeoutMillis: 7000, application_name: "codex-inspect",
    options: "-c default_transaction_read_only=on -c statement_timeout=5000" });
  phase = "connection";
  await client.connect();
  phase = "permission verification";
  await client.query("BEGIN READ ONLY");
  const { rows: [check] } = await client.query(`
    SELECT session_user = 'codex_inspect' AND current_user = session_user
      AND current_setting('transaction_read_only') = 'on'
      AND NOT (r.rolsuper OR r.rolcreaterole OR r.rolcreatedb OR r.rolreplication OR r.rolbypassrls)
      AND NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles parent
        WHERE parent.oid <> r.oid AND pg_catalog.pg_has_role(r.oid,parent.oid,'MEMBER'))
      AND NOT pg_catalog.has_database_privilege(current_database(),'CREATE')
      AND NOT EXISTS (SELECT 1 FROM pg_catalog.pg_namespace n WHERE pg_catalog.has_schema_privilege(n.oid,'CREATE'))
      AND NOT EXISTS (SELECT 1 FROM pg_catalog.pg_class c
        WHERE c.relkind IN ('r','p','v','f') AND
        (pg_catalog.has_table_privilege(c.oid,'INSERT,UPDATE,DELETE,TRUNCATE,TRIGGER')
         OR pg_catalog.has_any_column_privilege(c.oid,'INSERT,UPDATE')))
      AS allowed
    FROM pg_catalog.pg_roles r WHERE r.rolname = current_user
  `);
  if (!check?.allowed) throw new Error("Permission check failed");
  phase = "metadata";
  const { rows } = await client.query(`
    SELECT c.relname AS name, c.relkind AS kind, c.relrowsecurity AS rls_enabled
    FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m','f')
    ORDER BY c.relname
  `);
  await client.query("ROLLBACK");
  console.table(rows);
} catch (error) {
  const code = /^[A-Z0-9_]{3,60}$/.test(error?.code ?? "") ? ` (${error.code})` : "";
  console.error(`INSPECT gagal pada tahap ${phase}${code}.`);
  process.exitCode = 1;
} finally {
  if (client) await client.end();
}
