import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { gallerySectionType } from "../src/lib/gallery";

test("least privilege for payouts, offline schedules, favorites and content", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(`CREATE SCHEMA auth;
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE TABLE auth.users(id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb DEFAULT '{}');
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
      SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid
    $$;
    CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT '{}'::jsonb $$;
    GRANT USAGE ON SCHEMA auth, public TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;`);

  const migrations = new URL("../supabase/migrations/", import.meta.url);
  const files = (await readdir(migrations)).filter((name) => name.endsWith(".sql")).sort();
  async function apply(name: string) {
    const sql = (await readFile(new URL(name, migrations), "utf8"))
      .replace(/CREATE EXTENSION IF NOT EXISTS "(?:uuid-ossp|pgcrypto)";/g, "")
      .replaceAll("uuid_generate_v4()", "gen_random_uuid()");
    await db.exec(sql);
  }
  for (const name of files.filter((name) => name < "015")) await apply(name);

  await t.test("reconcile an existing 014 and verify 015 before upgrading to 020", async () => {
    const migration = (prefix: string) => files.find((name) => name.startsWith(prefix))!;
    const check015 = await readFile(new URL("../scripts/check-migration-015.sql", import.meta.url), "utf8");
    const inspect015 = async () => (await db.exec(check015)).flatMap((result) => result.rows);
    const before015 = await inspect015();
    assert.equal(before015.length, 2);
    assert.ok(before015.some((row) => (row as { status: string }).status === "differs_from_015"));
    await apply(migration("015"));
    const matches = ["harian-sopir", "lepas-kunci"].map((slug) => ({
      slug, status: "matches_015", route_matches: true, description_matches: true,
    }));
    assert.deepEqual(await inspect015(), matches);

    const snapshot = async () => (await db.query(`
      SELECT
        (SELECT jsonb_agg(to_jsonb(p) - 'default_start_time' ORDER BY p.id) FROM products p) AS products,
        (SELECT jsonb_agg(to_jsonb(p) ORDER BY p.id) FROM pricing_rules p) AS prices,
        (SELECT count(*) FROM bookings) AS bookings,
        (SELECT count(*) FROM payment_attempts) AS attempts,
        (SELECT count(*) FROM payment_ledger) AS credits
    `)).rows;
    const before = await snapshot();
    const reconcile = await readFile(new URL("../scripts/reconcile-migrations-016-020.sql", import.meta.url), "utf8");
    const audit = await readFile(new URL("../scripts/check-migrations-014-016-020.sql", import.meta.url), "utf8");
    const inspect = async () => (await db.exec(audit)).flatMap((result) => result.rows);
    await db.exec("BEGIN");
    for (const name of files.filter((name) => name >= "016")) await apply(name);
    // The audit opens its own transaction and ends with ROLLBACK.
    const expected = await inspect();
    await db.exec(`ALTER TABLE products ALTER COLUMN default_start_time SET DEFAULT '08:00:00'::time;
      CREATE POLICY cloud_legacy_open ON offline_schedules FOR ALL TO authenticated USING (true);`);
    const departureTimes = async () => (await db.query(
      "SELECT id, default_start_time::text AS departure FROM products ORDER BY id",
    )).rows;
    const timesBefore = await departureTimes();
    await assert.rejects(db.exec(reconcile), /Review unexpected RLS policies.*cloud_legacy_open/);
    await db.exec("ROLLBACK");
    assert.deepEqual(await departureTimes(), timesBefore);
    await db.exec("DROP POLICY cloud_legacy_open ON offline_schedules");
    await db.exec(reconcile);
    assert.deepEqual(await inspect(), expected);
    await db.exec(reconcile);
    assert.deepEqual(await inspect(), expected);
    assert.deepEqual(await departureTimes(), timesBefore);
    assert.deepEqual((await db.query(`SELECT column_default FROM information_schema.columns
      WHERE table_schema='public' AND table_name='products' AND column_name='default_start_time'`)).rows,
      [{ column_default: "'08:00:00'::text" }]);
    assert.deepEqual(await snapshot(), before);
    assert.deepEqual(await inspect015(), matches);
    assert.deepEqual((await db.query(`SELECT data_type FROM information_schema.columns
      WHERE table_schema='public' AND table_name='products' AND column_name='default_start_time'`)).rows,
      [{ data_type: "text" }]);
    assert.deepEqual((await db.query(`SELECT policyname FROM pg_policies
      WHERE schemaname='public' AND tablename IN ('blackout_dates','sales_quotas') AND cmd='ALL'
      ORDER BY policyname`)).rows,
      [{ policyname: "blackout_admin_write" }, { policyname: "quotas_admin_write" }]);
  });

  const [buyer, otherBuyer, owner, otherOwner, admin] = Array.from({ length: 5 }, () => randomUUID());
  for (const [index, id] of [buyer, otherBuyer, owner, otherOwner, admin].entries()) {
    await db.query("INSERT INTO auth.users(id,email) VALUES($1,$2)", [id, `${index}@example.test`]);
  }
  // Give dedicated Owner/Admin accounts no Buyer role for the isolation checks.
  await db.query("DELETE FROM user_roles WHERE user_id IN ($1,$2,$3)", [owner, otherOwner, admin]);
  await db.query("INSERT INTO user_roles(user_id,role) VALUES($1,'owner'),($2,'owner'),($3,'admin')", [owner, otherOwner, admin]);
  const product = "b1000000-0000-0000-0000-000000000002";
  const denied = /permission denied|row-level security/i;

  await t.test("final client grants block anonymous writes and keep session roles and payment RPCs", async () => {
    const patch = await readFile(new URL("../scripts/final-supabase-client-grants.sql", import.meta.url), "utf8");
    await db.exec(patch);
    await db.exec(patch);
    const sql = `SELECT
      has_table_privilege('anon','bookings','INSERT') AS anon_booking,
      has_table_privilege('authenticated','bookings','UPDATE') AS session_booking,
      has_column_privilege('authenticated','profiles','updated_at','UPDATE') AS profile_edit,
      has_column_privilege('anon','blackout_dates','reason','SELECT') AS public_calendar,
      has_function_privilege('authenticated','apply_midtrans_event(jsonb)','EXECUTE') AS session_webhook,
      has_function_privilege('service_role','apply_midtrans_event(jsonb)','EXECUTE') AS service_webhook,
      has_function_privilege('authenticated','approve_booking(uuid,text,integer)','EXECUTE') AS session_approval`;
    assert.deepEqual((await db.query(sql)).rows, [{anon_booking:false, session_booking:false,
      profile_edit:true, public_calendar:true, session_webhook:false, service_webhook:true, session_approval:true}]);
  });

  await t.test("table hardening revokes effective TRUNCATE, including PUBLIC grants", async () => {
    const harden = await readFile(new URL("../scripts/harden-supabase-table-grants.sql", import.meta.url), "utf8");
    await db.exec(`CREATE TABLE public.grant_probe (id integer);
      INSERT INTO public.grant_probe VALUES (1);
      GRANT TRUNCATE ON public.grant_probe TO PUBLIC;
      CREATE ROLE fixture_acl_parent;
      GRANT fixture_acl_parent TO authenticated;
      GRANT TRUNCATE ON public.grant_probe TO fixture_acl_parent;`);
    await assert.rejects(db.exec(harden), /Effective TRUNCATE.*grant_probe/);
    await db.exec("ROLLBACK");
    await db.exec("REVOKE fixture_acl_parent FROM authenticated");
    await db.exec(harden);
    await db.exec(harden);
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`SET ROLE ${role}`);
      await assert.rejects(db.exec("TRUNCATE public.grant_probe"), denied);
      await db.exec("RESET ROLE");
    }
    assert.deepEqual((await db.query("SELECT id FROM public.grant_probe")).rows, [{ id: 1 }]);
    assert.deepEqual((await db.query("SELECT has_table_privilege('service_role','public.grant_probe','TRUNCATE') AS allowed")).rows, [{ allowed: true }]);
  });

  async function actor(id?: string) {
    await db.exec("RESET ROLE");
    await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)", [id ?? ""]);
    await db.exec(id ? "SET ROLE authenticated" : "SET ROLE anon");
  }

  await t.test("Owners submit and read only their payouts, Admin processes but cannot process their own", async () => {
    const submit = (id: string) => db.query<{ id: string; status: string }>(
      `INSERT INTO payout_requests(owner_id,amount,bank_name,account_number,account_holder)
       VALUES($1,100000,'Test','1234','Test Owner') RETURNING id,status`, [id],
    );
    await actor(owner);
    const { rows: [payout] } = await submit(owner);
    assert.equal(payout.status, "pending");
    assert.equal((await db.query("SELECT * FROM payout_requests")).rows.length, 1);
    await assert.rejects(submit(otherOwner), denied);
    await assert.rejects(db.query("INSERT INTO payout_requests(owner_id,status) VALUES($1,'approved')", [owner]), denied);
    assert.equal((await db.query("UPDATE payout_requests SET status='approved' WHERE id=$1 RETURNING id", [payout.id])).rows.length, 0);
    await assert.rejects(db.query("UPDATE payout_requests SET account_number='9999' WHERE id=$1", [payout.id]), denied);
    await assert.rejects(db.query("DELETE FROM payout_requests WHERE id=$1", [payout.id]), denied);

    await actor(otherOwner);
    await submit(otherOwner);
    assert.equal((await db.query("SELECT id FROM payout_requests WHERE id=$1", [payout.id])).rows.length, 0);
    assert.equal((await db.query("UPDATE payout_requests SET status='approved' WHERE id=$1 RETURNING id", [payout.id])).rows.length, 0);
    await actor(buyer);
    assert.equal((await db.query("SELECT id FROM payout_requests")).rows.length, 0);
    await assert.rejects(submit(buyer), denied);
    await actor();
    await assert.rejects(db.query("SELECT * FROM payout_requests"), denied);

    await actor(admin);
    assert.equal((await db.query("SELECT * FROM payout_requests")).rows.length, 2);
    assert.deepEqual((await db.query("UPDATE payout_requests SET status='approved',processed_at=now() WHERE id=$1 RETURNING id", [payout.id])).rows, [{ id: payout.id }]);
    await assert.rejects(db.query("UPDATE payout_requests SET status='invalid' WHERE id=$1", [payout.id]), denied);
    const { rows: [own] } = await submit(admin);
    assert.equal((await db.query("UPDATE payout_requests SET status='approved' WHERE id=$1 RETURNING id", [own.id])).rows.length, 0);
  });

  await t.test("offline schedules allow scoped CRUD, without access to another Owner's rows", async () => {
    const add = (id: string) => db.query<{ id: string }>(
      `INSERT INTO offline_schedules(owner_id,renter_name,start_date,end_date)
       VALUES($1,'Test renter','2027-01-10','2027-01-10') RETURNING id`, [id],
    );
    await actor(owner);
    const { rows: [mine] } = await add(owner);
    assert.equal((await db.query("UPDATE offline_schedules SET notes='Updated' WHERE id=$1 RETURNING id", [mine.id])).rows.length, 1);
    await assert.rejects(add(otherOwner), denied);
    await assert.rejects(db.query("UPDATE offline_schedules SET owner_id=$1 WHERE id=$2", [otherOwner, mine.id]), denied);
    await assert.rejects(db.query("UPDATE offline_schedules SET created_at=now() WHERE id=$1", [mine.id]), denied);
    await actor(otherOwner);
    const { rows: [theirs] } = await add(otherOwner);
    for (const query of ["SELECT id FROM offline_schedules", "UPDATE offline_schedules SET notes='No'", "DELETE FROM offline_schedules"]) {
      assert.equal((await db.query(`${query} WHERE id=$1${query.startsWith("SELECT") ? "" : " RETURNING id"}`, [mine.id])).rows.length, 0);
    }
    await actor(buyer);
    assert.equal((await db.query("SELECT id FROM offline_schedules")).rows.length, 0);
    await assert.rejects(add(buyer), denied);
    await actor();
    await assert.rejects(db.query("SELECT id FROM offline_schedules"), denied);
    await actor(admin);
    assert.equal((await db.query("SELECT id FROM offline_schedules")).rows.length, 2);
    assert.equal((await db.query("DELETE FROM offline_schedules WHERE id=$1 RETURNING id", [theirs.id])).rows.length, 1);
    await actor(owner);
    assert.equal((await db.query("DELETE FROM offline_schedules WHERE id=$1 RETURNING id", [mine.id])).rows.length, 1);
  });

  await t.test("Buyer favorites can be read, added and removed only by the Buyer who owns them", async () => {
    await actor(buyer);
    const add = (id: string) => db.query("INSERT INTO user_favorites(user_id,product_id) VALUES($1,$2)", [id, product]);
    await add(buyer);
    await assert.rejects(add(otherBuyer), denied);
    assert.equal((await db.query("SELECT id FROM user_favorites")).rows.length, 1);
    await assert.rejects(db.query("UPDATE user_favorites SET created_at=now()"), denied);
    for (const user of [otherBuyer, owner, admin]) {
      await actor(user);
      assert.equal((await db.query("SELECT id FROM user_favorites")).rows.length, 0);
      assert.equal((await db.query("DELETE FROM user_favorites RETURNING id")).rows.length, 0);
      if (user !== otherBuyer) await assert.rejects(add(user), denied);
    }
    await actor();
    await assert.rejects(db.query("SELECT id FROM user_favorites"), denied);
    await actor(buyer);
    assert.equal((await db.query("DELETE FROM user_favorites RETURNING id")).rows.length, 1);
  });

  await t.test("public sees active content; only Admin can write or see inactive content", async () => {
    for (const [table, field] of [["testimonials", "content"], ["destinations", "slug"]]) {
      await actor(admin);
      const insert = `INSERT INTO ${table}(name,${field},is_active) VALUES('Test',$1,false)`;
      const hidden = randomUUID();
      await db.query(insert, [hidden]);
      assert.equal((await db.query(`SELECT id FROM ${table} WHERE ${field}=$1`, [hidden])).rows.length, 1);
      for (const user of [buyer, owner, undefined]) {
        await actor(user);
        assert.ok((await db.query(`SELECT id FROM ${table} WHERE is_active`)).rows.length > 0);
        assert.equal((await db.query(`SELECT id FROM ${table} WHERE NOT is_active`)).rows.length, 0);
        await assert.rejects(db.query(insert, [randomUUID()]), denied);
        for (const sql of [`UPDATE ${table} SET name='No' WHERE is_active`, `DELETE FROM ${table} WHERE is_active`]) {
          if (user && sql.startsWith("UPDATE")) assert.equal((await db.query(`${sql} RETURNING id`)).rows.length, 0);
          else await assert.rejects(db.query(sql), denied);
        }
        await assert.rejects(db.query(`TRUNCATE ${table}`), denied);
      }
      await actor(admin);
      assert.equal((await db.query(`UPDATE ${table} SET is_active=true WHERE ${field}=$1 RETURNING id`, [hidden])).rows.length, 1);
      await assert.rejects(db.query(`DELETE FROM ${table} WHERE ${field}=$1 RETURNING id`, [hidden]), denied);
    }
    await actor(owner);
    assert.equal((await db.query("UPDATE site_settings SET category='contact' WHERE key='contact_whatsapp' RETURNING id")).rows.length, 0);
    await actor(admin);
    assert.equal((await db.query("UPDATE site_settings SET category='contact' WHERE key='contact_whatsapp' RETURNING id")).rows.length, 1);
  });

  await t.test("Admin can publish, edit and archive gallery photos while visitors see only published photos", async () => {
    const addPhoto = `INSERT INTO landing_sections(section_type, title, content, is_active)
      VALUES ($1, 'Foto perjalanan', '{"image":"/images/landing/tour-sukamade.jpg"}', true) RETURNING id`;
    await actor(admin);
    const { rows: [photo] } = await db.query<{ id: string }>(addPhoto, [gallerySectionType]);
    const photoRead = "SELECT title, content FROM landing_sections WHERE section_type = $1 AND id = $2";
    const edit = "UPDATE landing_sections SET title = 'Jelajah Sukamade' WHERE section_type = $1 AND id = $2 RETURNING id";
    const args = [gallerySectionType, photo.id];
    assert.equal((await db.query(edit, args)).rows.length, 1);
    for (const user of [buyer, owner, undefined]) {
      await actor(user);
      assert.deepEqual((await db.query(photoRead, args)).rows, [
        { title: "Jelajah Sukamade", content: { image: "/images/landing/tour-sukamade.jpg" } },
      ]);
      await assert.rejects(db.query(addPhoto, [gallerySectionType]), denied);
      if (user) assert.equal((await db.query(edit, args)).rows.length, 0);
      else await assert.rejects(db.query(edit, args), denied);
    }
    await actor(admin);
    const setActive = "UPDATE landing_sections SET is_active = $3 WHERE section_type = $1 AND id = $2 RETURNING id";
    assert.equal((await db.query(setActive, [...args, false])).rows.length, 1);
    await actor();
    assert.equal((await db.query(photoRead, args)).rows.length, 0);
    await actor(admin);
    assert.equal((await db.query(photoRead, args)).rows.length, 1);
    assert.equal((await db.query(setActive, [...args, true])).rows.length, 1);
    await actor();
    assert.equal((await db.query(photoRead, args)).rows.length, 1);
  });
});
