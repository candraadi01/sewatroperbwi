import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { POST } from "../src/app/api/webhooks/midtrans/route";

test("Midtrans webhook verifies and applies payment transitions", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  const env = {
    MIDTRANS_SERVER_KEY: "test-midtrans-key",
    MIDTRANS_MERCHANT_ID: "test-merchant",
    NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION: "false",
    NEXT_PUBLIC_SUPABASE_URL: "https://supabase.example.test",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "test-service-key",
  };
  for (const [key, value] of Object.entries(env)) {
    const previous = process.env[key];
    process.env[key] = value;
    t.after(() => {
      if (previous === undefined) delete process.env[key];
      else process.env[key] = previous;
    });
  }

  await db.exec(`CREATE SCHEMA auth;
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE TABLE auth.users(id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb DEFAULT '{}');
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
      SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid
    $$;
    CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT '{}'::jsonb $$;
    GRANT USAGE ON SCHEMA auth,public TO anon,authenticated,service_role;`);
  const migrations = new URL("../supabase/migrations/", import.meta.url);
  for (const file of (await readdir(migrations)).filter((file) => file.endsWith(".sql") && file < "016").sort()) {
    const sql = (await readFile(new URL(file, migrations), "utf8"))
      .replace(/CREATE EXTENSION IF NOT EXISTS "(?:uuid-ossp|pgcrypto)";/g, "")
      .replaceAll("uuid_generate_v4()", "gen_random_uuid()");
    await db.exec(sql);
  }

  const buyer = randomUUID();
  const admin = randomUUID();
  const owner = randomUUID();
  const product = "b1000000-0000-0000-0000-000000000002";
  await db.query("INSERT INTO auth.users(id,email) VALUES($1,'buyer@example.test'),($2,'admin@example.test')", [buyer, admin]);
  await db.query("INSERT INTO user_roles(user_id,role) VALUES($1,'admin')", [admin]);
  await db.query("INSERT INTO auth.users(id,email) VALUES($1,'owner@example.test')", [owner]);
  await db.query("INSERT INTO user_roles(user_id,role) VALUES($1,'owner')", [owner]);
  await db.query("UPDATE products SET is_sample_data=false,is_owner_approved=true,status='active' WHERE id=$1", [product]);

  async function reserve(choice: "dp" | "full", serviceDate = "2027-01-01") {
    const payload = {
      user_id: buyer, product_id: product, service_date: serviceDate, start_time: "08:00",
      num_units: 1, num_passengers: 1, pickup_zone_id: "", pickup_address: "Test",
      promo_id: "", promo_code: "", base_price: 500000, pickup_cost: 0, subtotal: 500000,
      discount_amount: 0, total_amount: 500000, dp_amount: 150000, dp_percentage: 3000,
      contact_name: "Buyer Test", contact_phone: "081000000000", contact_email: "buyer@example.test",
      payment_choice: choice, notes: "", price_snapshot: {}, product_snapshot: {}, terms_snapshot: {},
      confirmation_hours: 24, idempotency_key: randomUUID(), request_hash: "test",
    };
    await db.exec("SET ROLE service_role");
    try {
    const { rows: [reserved] } = await db.query<{ id: string; code: string }>(
      `SELECT booking->>'id' AS id, booking->>'booking_code' AS code
        FROM (SELECT reserve_booking($1::jsonb)->'booking' AS booking) AS result`,
      [JSON.stringify(payload)],
    );
    return { ...reserved, order: reserved.code + "-1" };
    } finally {
      await db.exec("RESET ROLE");
    }
  }

  async function asAuthenticated<T>(user: string, action: () => Promise<T>) {
    await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)", [user]);
    await db.exec("SET ROLE authenticated");
    try {
      return await action();
    } finally {
      await db.exec("RESET ROLE; RESET request.jwt.claim.sub");
    }
  }

  await t.test("isolated staging applies the complete package and enforces effective privileges", async () => {
    const grantCsv = await readFile(new URL("../scripts/cloud_grants_audit.csv", import.meta.url), "utf8");
    for (const line of grantCsv.split(/\r?\n/)) {
      const grant = /^table,public\.([a-z_]+),(anon|authenticated|service_role),(SELECT|INSERT|UPDATE|DELETE|REFERENCES|TRIGGER|TRUNCATE|MAINTAIN),/.exec(line);
      if (!grant) continue;
      const [, table, role, privilege] = grant;
      const { rows: [existing] } = await db.query<{ present: boolean }>("SELECT to_regclass($1) IS NOT NULL AS present", [`public.${table}`]);
      if (existing.present) await db.exec(`GRANT ${privilege} ON public.${table} TO ${role}`);
    }
    const pending = await reserve("dp", "2027-01-02");
    const snapshot = async () => (await db.query(`SELECT
      (SELECT jsonb_agg(to_jsonb(b) ORDER BY id) FROM bookings b) AS bookings,
      (SELECT jsonb_agg(to_jsonb(a)-'choice_locked_at' ORDER BY id) FROM payment_attempts a) AS attempts,
      (SELECT jsonb_agg(to_jsonb(l) ORDER BY id) FROM payment_ledger l) AS ledger,
      (SELECT jsonb_agg(to_jsonb(p)-'default_start_time' ORDER BY id) FROM products p) AS products,
      (SELECT jsonb_agg(to_jsonb(r) ORDER BY id) FROM pricing_rules r) AS prices`)).rows;
    const before = await snapshot();
    const atomic = await readFile(new URL("../scripts/apply-supabase-stage2-atomic.sql", import.meta.url), "utf8");
    const parts = await Promise.all([
      "reconcile-migrations-016-020.sql", "harden-supabase-table-grants.sql", "final-supabase-client-grants.sql",
    ].map(file => readFile(new URL(`../scripts/${file}`, import.meta.url), "utf8")));
    const body = (sql: string) => sql.replace(/\r\n/g, "\n").trim()
      .replace(/^BEGIN;$/m, "").replace(/\nCOMMIT;$/, "").replace(/^[ \t]*--.*\n/gm, "").trim();
    assert.equal(body(atomic).replace(/\n{3,}/g, "\n\n"), parts.map(body).join("\n\n").replace(/\n{3,}/g, "\n\n"));
    const catalog = async () => (await db.query(`SELECT
      (SELECT data_type FROM information_schema.columns WHERE table_schema='public'
        AND table_name='products' AND column_name='default_start_time') AS departure_type,
      (SELECT prosrc FROM pg_proc WHERE oid='public.approve_booking(uuid,text,integer)'::regprocedure) AS approve,
      EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND policyname='blackout_admin_and_owner_all') AS legacy_policy,
      has_table_privilege('anon','public.bookings','TRUNCATE') AS truncate_grant,
      has_table_privilege('authenticated','public.bookings','UPDATE') AS update_grant`)).rows;
    const beforeCatalog = await catalog();
    const lateFailure = atomic.replace(/COMMIT;\s*$/, "DO $test$ BEGIN RAISE EXCEPTION 'staging late failure'; END $test$;\nCOMMIT;");
    await assert.rejects(db.exec(lateFailure), /staging late failure/);
    await db.exec("ROLLBACK");
    assert.deepEqual(await catalog(), beforeCatalog);
    assert.deepEqual(await snapshot(), before);
    await db.exec(atomic);
    assert.deepEqual(await snapshot(), before);

    const blocked = randomUUID();
    await db.query("INSERT INTO auth.users(id,email) VALUES($1,'blocked@example.test')", [blocked]);
    await db.query("INSERT INTO user_roles(user_id,role) VALUES($1,'admin')", [blocked]);
    await db.query("UPDATE profiles SET account_status='blocked' WHERE id=$1", [blocked]);
    const calls = [
      "approve_booking($1)", "reject_booking($1,'test')", "set_booking_status($1,'confirmed')",
      "admin_approve_with_time($1,'',48,'08:00')", "admin_update_trip($1,NULL,'','08:00')",
    ];
    for (const user of [buyer, owner, blocked]) {
      await asAuthenticated(user, async () => {
        for (const call of calls) {
          await assert.rejects(db.query(`SELECT ${call}`, [pending.id]), /admin required/i);
        }
      });
    }
    await asAuthenticated(admin, () => db.query("SELECT admin_approve_with_time($1,'',48,'08:00')", [pending.id]));
    assert.deepEqual((await db.query("SELECT status FROM bookings WHERE id=$1", [pending.id])).rows, [{status:"approved"}]);

  });

  const transactions = new Map<string, Record<string, string>>();
  let rpcCalls = 0;
  let providerCalls = 0;
  t.mock.method(globalThis, "fetch", async (input: string | URL, init: RequestInit) => {
    const url = new URL(input);
    if (url.hostname === "api.sandbox.midtrans.com") {
      providerCalls++;
      const order = decodeURIComponent(url.pathname.split("/")[2]);
      return Response.json(transactions.get(order));
    }
    assert.equal(url.href, "https://supabase.example.test/rest/v1/rpc/apply_midtrans_event");
    rpcCalls++;
    const { p } = JSON.parse(String(init.body));
    try {
      await db.exec("SET ROLE service_role");
      const result = await db.query<{ result: object }>("SELECT apply_midtrans_event($1::jsonb) AS result", [JSON.stringify(p)]);
      return Response.json(result.rows[0].result);
    } catch (error) {
      if (!(error instanceof Error) || error.message !== "Amount mismatch") throw error;
      return Response.json({ code: "P0001", message: "Test RPC declined" }, { status: 400 });
    } finally {
      await db.exec("RESET ROLE");
    }
  });

  function publish(order: string, amount: number, status = "settlement", statusCode = "200", fraudStatus = "accept") {
    const data = {
      order_id: order, transaction_id: `txn-${order}`, status_code: statusCode,
      gross_amount: `${amount}.00`, transaction_status: status,
      merchant_id: env.MIDTRANS_MERCHANT_ID, fraud_status: fraudStatus,
    };
    transactions.set(order, data);
    return data;
  }

  function notify(data: ReturnType<typeof publish>, validSignature = true) {
    const signature = createHash("sha512")
      .update(data.order_id + data.status_code + data.gross_amount + env.MIDTRANS_SERVER_KEY).digest("hex");
    return POST(new Request("https://app.example.test/api/webhooks/midtrans", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, signature_key: validSignature ? signature : "0".repeat(128) }),
    }));
  }

  async function state(booking: { id: string }) {
    const { rows: [row] } = await db.query(
      `SELECT status, amount_paid, outstanding,
        (SELECT count(*)::int FROM payment_ledger WHERE booking_id=$1 AND entry_type='payment') AS credits
        FROM bookings WHERE id=$1`, [booking.id],
    );
    return row;
  }

  const dp = await reserve("dp");
  const full = await reserve("full");

  await t.test("Admin approves pending bookings without a unit and prepares DP or full invoices with the same WIB deadline", async () => {
    await db.exec("SET TIME ZONE 'America/New_York'");
    for (const [booking, choice, amount, hours] of [
      [dp, "dp", 150000, 48],
      [full, "full", 500000, 3],
    ] as const) {
      assert.deepEqual(await state(booking), { status: "pending_review", amount_paid: 0, outstanding: 500000, credits: 0 });
      assert.equal((await db.query("SELECT id FROM payment_attempts WHERE booking_id=$1", [booking.id])).rows.length, 0);
      for (const user of [owner, buyer]) {
        await asAuthenticated(user, async () => {
          await assert.rejects(db.query("SELECT approve_booking($1)", [booking.id]), /Active admin required/);
          await assert.rejects(db.query("SELECT admin_approve_with_time($1,'Test',48,NULL)", [booking.id]), /Active admin required/);
          await assert.rejects(db.query("SELECT reject_booking($1,'Test')", [booking.id]), /Active admin required/);
        });
      }
      await asAuthenticated(admin, async () => {
        if (choice === "dp") await db.query("SELECT approve_booking($1)", [booking.id]);
        else await db.query("SELECT admin_approve_with_time($1,'Test',$2,NULL)", [booking.id, hours]);
        await assert.rejects(db.query("SELECT approve_booking($1)", [booking.id]), /not awaiting review/);
      });

      const { rows: [invoice] } = await db.query(
        `SELECT b.status::text, b.approved_by, a.purpose::text, a.expected_amount, a.midtrans_order_id,
                a.status::text AS invoice_status, a.expires_at=b.approval_expires_at AS deadlines_match,
                (extract(epoch FROM b.approval_expires_at-b.approved_at)/3600)::int AS hours,
                EXISTS (SELECT 1 FROM booking_status_history h WHERE h.booking_id=b.id
                        AND h.old_status='pending_review' AND h.new_status='approved' AND h.changed_by=b.approved_by) AS history_recorded,
                EXISTS (SELECT 1 FROM notification_outbox n WHERE n.recipient_id=b.user_id
                        AND n.body='Booking '||b.booking_code||' disetujui. Silakan bayar sebelum '||
                        to_char((b.approval_expires_at AT TIME ZONE 'UTC') + interval '7 hours','DD/MM/YYYY HH24:MI')||' WIB.') AS wib_notice
          FROM bookings b JOIN payment_attempts a ON a.booking_id=b.id WHERE b.id=$1`, [booking.id],
      );
      assert.deepEqual(invoice, {
        status: "approved", approved_by: admin, purpose: choice, expected_amount: amount,
        midtrans_order_id: booking.order, invoice_status: "pending", deadlines_match: true,
        hours, history_recorded: true, wib_notice: true,
      });

      await db.exec("SET ROLE service_role");
      try {
        const { rows } = await db.query(
          `SELECT attempt->>'midtrans_order_id' AS order_id, (attempt->>'expected_amount')::int AS amount
            FROM (SELECT prepare_initial_payment($1,$2,$3)->'attempt' AS attempt) AS result`,
          [booking.id, buyer, choice],
        );
        assert.deepEqual(rows, [{ order_id: booking.order, amount }]);
      } finally {
        await db.exec("RESET ROLE");
      }
    }

    const rejected = await reserve("dp");
    await asAuthenticated(admin, () => db.query("SELECT reject_booking($1,'Armada tidak tersedia')", [rejected.id]));
    const { rows } = await db.query("SELECT status, rejection_reason FROM bookings WHERE id=$1", [rejected.id]);
    assert.deepEqual(rows, [{ status: "cancelled_by_admin", rejection_reason: "Armada tidak tersedia" }]);
  });

  await t.test("invalid signature, mismatched identifiers or amounts and unaccepted provider status cannot credit", async () => {
    const payment = publish(dp.order, 150000);
    assert.equal((await notify(payment, false)).status, 403);
    assert.equal(providerCalls, 0);
    assert.equal((await notify({ ...payment, transaction_id: "different" })).status, 403);
    assert.equal((await notify({ ...payment, gross_amount: "149999.99" })).status, 403);
    assert.equal(rpcCalls, 0);
    assert.equal((await notify(publish(dp.order, 150001))).status, 503);
    assert.equal((await notify(publish(dp.order, 150000, "settlement", "201"))).status, 200);
    assert.equal((await notify(publish(dp.order, 150000, "capture", "200", "challenge"))).status, 200);
    publish(dp.order, 150000, "pending", "201");
    assert.equal((await notify(payment)).status, 200);
    assert.deepEqual(await state(dp), { status: "approved", amount_paid: 0, outstanding: 500000, credits: 0 });
  });

  await t.test("approved DP is partial and capture, settlement and retries credit once", async () => {
    const capture = publish(dp.order, 150000, "capture");
    assert.equal((await notify(capture)).status, 200);
    const settlement = publish(dp.order, 150000);
    assert.equal((await notify(settlement)).status, 200);
    const duplicate = await notify(settlement);
    assert.equal(duplicate.status, 200);
    assert.deepEqual((await duplicate.json()).result, { duplicate: true });
    assert.equal((await notify(publish(dp.order, 150000, "cancel", "202"))).status, 200);
    assert.deepEqual(await state(dp), { status: "payment_received", amount_paid: 150000, outstanding: 350000, credits: 1 });
    const { rows: [attempt] } = await db.query<{ status: string }>("SELECT status FROM payment_attempts WHERE midtrans_order_id=$1", [dp.order]);
    assert.equal(attempt.status, "settlement");
  });

  await t.test("approved full payment clears outstanding and keeps vehicle confirmation separate", async () => {
    const settlement = publish(full.order, 500000);
    assert.equal((await notify(settlement)).status, 200);
    assert.deepEqual(await state(full), { status: "payment_received", amount_paid: 500000, outstanding: 0, credits: 1 });
    await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)", [admin]);
    try {
      await db.query("SELECT set_booking_status($1,'confirmed','Test')", [full.id]);
    } finally {
      await db.exec("RESET request.jwt.claim.sub");
    }
    assert.equal((await notify(settlement)).status, 200);
    assert.deepEqual(await state(full), { status: "confirmed", amount_paid: 500000, outstanding: 0, credits: 1 });
  });

  await t.test("failed balance attempts preserve DP and a verified balance completes payment", async () => {
    for (const status of ["failure", "expire", "cancel", "settlement"]) {
      const { rows: [row] } = await db.query<{ order_id: string }>(
        "SELECT prepare_balance_payment($1,$2,$3)->'attempt'->>'midtrans_order_id' AS order_id",
        [dp.id, buyer, randomUUID()],
      );
      assert.equal((await notify(publish(row.order_id, 350000, status))).status, 200);
      if (status !== "settlement") {
        assert.equal((await notify(publish(row.order_id, 350000, "pending", "201"))).status, 200);
        const { rows: [attempt] } = await db.query<{ status: string }>("SELECT status FROM payment_attempts WHERE midtrans_order_id=$1", [row.order_id]);
        assert.equal(attempt.status, status);
        assert.deepEqual(await state(dp), { status: "payment_received", amount_paid: 150000, outstanding: 350000, credits: 1 });
      }
    }
    assert.deepEqual(await state(dp), { status: "payment_received", amount_paid: 500000, outstanding: 0, credits: 2 });
  });
  await t.test("client session identities cannot escalate or execute backend RPCs", async () => {
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`BEGIN; SET LOCAL SESSION AUTHORIZATION ${role}; SAVEPOINT role_probe`);
      try {
        await assert.rejects(db.exec("SET ROLE service_role"), /permission denied/i);
        for (const query of ["TRUNCATE bookings", "SELECT apply_midtrans_event('{}')",
          "SELECT prepare_initial_payment(NULL,NULL,NULL)", "SELECT prepare_balance_payment(NULL,NULL,NULL)"]) {
          await db.exec("ROLLBACK TO role_probe");
          await assert.rejects(db.exec(query), /permission denied/i);
        }
      } finally {
        await db.exec("ROLLBACK");
      }
    }
  });
});
