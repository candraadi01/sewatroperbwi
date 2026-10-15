import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("PostgreSQL migration, RLS, durable booking and idempotent payment", async (t) => {
  const db = new PGlite();
  try {
    await db.exec(
      `CREATE SCHEMA auth;CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role BYPASSRLS;CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,raw_user_meta_data jsonb DEFAULT '{}');CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;GRANT USAGE ON SCHEMA auth,public TO anon,authenticated,service_role;GRANT EXECUTE ON FUNCTION auth.uid() TO anon,authenticated,service_role;`,
    );
    for (const f of [
      "001_core_schema.sql",
      "002_rls_policies.sql",
      "003_seed_data.sql",
      "004_operational_repair.sql",
      "005_admin_actions.sql",
    ]) {
      const sql = (
        await readFile(
          new URL("../supabase/migrations/" + f, import.meta.url),
          "utf8",
        )
      )
        .replace(
          /CREATE EXTENSION IF NOT EXISTS "(?:uuid-ossp|pgcrypto)";/g,
          "",
        )
        .replaceAll("uuid_generate_v4()", "gen_random_uuid()");
      await db.exec(sql);
    }
    await db.exec(
      "GRANT ALL ON ALL TABLES IN SCHEMA public TO anon,authenticated,service_role;GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon,authenticated,service_role;",
    );
    const a = "11111111-1111-4111-8111-111111111111",
      b = "22222222-2222-4222-8222-222222222222",
      admin = "33333333-3333-4333-8333-333333333333",
      product = "b1000000-0000-0000-0000-000000000002";
    await db.query(
      "INSERT INTO auth.users(id,email) VALUES($1,$2),($3,$4),($5,$6)",
      [a, "a@example.test", b, "b@example.test", admin, "admin@example.test"],
    );
    await db.query("INSERT INTO user_roles(user_id,role) VALUES($1,'admin')", [
      admin,
    ]);
    await db.query(
      "UPDATE products SET is_sample_data=false,is_owner_approved=true,status='active' WHERE id=$1",
      [product],
    );
    async function actor(role: string, id = "") {
      await db.exec("RESET ROLE");
      await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)", [
        id,
      ]);
      await db.exec("SET ROLE " + role);
    }
    await t.test(
      "anonymous cannot read customer contact profiles",
      async () => {
        await actor("anon");
        assert.equal(
          (await db.query("SELECT email FROM profiles")).rows.length,
          0,
        );
      },
    );
    await t.test(
      "buyer sees only own profile and cannot self-promote/unblock",
      async () => {
        await actor("authenticated", a);
        assert.equal(
          (await db.query("SELECT id FROM profiles")).rows.length,
          1,
        );
        await assert.rejects(
          db.query("INSERT INTO user_roles(user_id,role) VALUES($1,'admin')", [
            a,
          ]),
        );
        await assert.rejects(
          db.query("UPDATE profiles SET account_status='blocked' WHERE id=$1", [
            a,
          ]),
        );
      },
    );
    await t.test(
      "buyer cannot create forged quotes or call privileged RPCs",
      async () => {
        await actor("authenticated", a);
        await assert.rejects(
          db.query(
            "INSERT INTO quotes(user_id,product_id,service_date,base_price,subtotal,total_amount,expires_at) VALUES($1,$2,'2026-11-01',1,1,1,now())",
            [a, product],
          ),
        );
        await assert.rejects(db.query("SELECT reserve_booking('{}'::jsonb)"));
      },
    );
    const payload = {
      user_id: a,
      product_id: product,
      service_date: "2026-11-01",
      start_time: "08:00",
      num_units: 1,
      num_passengers: 4,
      pickup_zone_id: "",
      pickup_address: "Lokasi pengujian",
      promo_id: "",
      promo_code: "",
      base_price: 550000,
      pickup_cost: 0,
      subtotal: 550000,
      discount_amount: 0,
      total_amount: 550000,
      dp_amount: 165000,
      dp_percentage: 3000,
      contact_name: "Buyer Test",
      contact_phone: "081000000000",
      contact_email: "a@example.test",
      payment_choice: "dp",
      notes: "",
      price_snapshot: { total_amount: 550000 },
      product_snapshot: { name: "Paket Ijen" },
      terms_snapshot: { version: 1 },
      confirmation_hours: 24,
      idempotency_key: "44444444-4444-4444-8444-444444444444",
      request_hash: "same-payload",
    };
    let result: {
      booking: { id: string; booking_code: string };
      attempt: { id: string; midtrans_order_id: string };
    };
    await t.test(
      "buyer cannot use admin product or business RPCs",
      async () => {
        await actor("authenticated", a);
        await assert.rejects(
          db.query("SELECT save_admin_product('{}'::jsonb)"),
        );
        await assert.rejects(
          db.query("SELECT save_business_settings('{}'::jsonb)"),
        );
      },
    );
    await t.test("admin persists product and tariff atomically", async () => {
      await actor("authenticated", admin);
      const p = {
        name: "Paket test",
        slug: "paket-test",
        category_id: "",
        service_type: "paket_rute",
        status: "active",
        passenger_capacity: 6,
        driver_included: true,
        duration_minutes: 480,
        route_name: "Ijen",
        start_point: "Kota",
        end_point: "Kota",
        short_description: "Uji",
        description: "Uji produk",
        cover_image_url: "",
        included_facilities: ["BBM"],
        excluded_facilities: ["Tiket"],
        terms_version: "v1",
        terms_content: "Sesuai rute",
        min_booking_hours: 24,
        overtime_rate_per_hour: 50000,
        is_owner_approved: true,
        sort_order: 1,
        dp_override_percentage: null,
        default_start_time: "08:00",
        base_price: 550000,
      };
      const saved = await db.query<{ id: string }>(
        "SELECT save_admin_product($1::jsonb) AS id",
        [JSON.stringify(p)],
      );
      const id = saved.rows[0].id;
      await db.query("SELECT save_admin_product($1::jsonb,$2)", [
        JSON.stringify({ ...p, base_price: 600000 }),
        id,
      ]);
      const prices = await db.query<{ base_price: number }>(
        "SELECT base_price FROM pricing_rules WHERE product_id=$1",
        [id],
      );
      assert.equal(prices.rows.length, 1);
      assert.equal(prices.rows[0].base_price, 600000);
      assert.ok(
        (await db.query("SELECT id FROM audit_logs WHERE entity_id=$1", [id]))
          .rows.length > 0,
      );
    });
    await t.test(
      "business changes version terms without overwriting previous policy",
      async () => {
        await actor("authenticated", admin);
        const old = (
          await db.query<{ version: number; terms_and_conditions: string }>(
            "SELECT version,terms_and_conditions FROM business_settings_versions WHERE is_current",
          )
        ).rows[0];
        const p = {
          default_dp_percentage: 3000,
          default_dp_nominal: 300000,
          dp_mode: "percent",
          dp_basis: "per_order",
          confirmation_deadline_hours: 24,
          balance_payment_deadline_hours: 24,
          daily_duration_hours: 12,
          default_pickup_included: false,
          terms_and_conditions: "Ketentuan baru",
          cancellation_policy: "Pembatalan baru",
          refund_policy: "Refund baru",
          privacy_policy: "Privasi baru",
        };
        await db.query("SELECT save_business_settings($1::jsonb)", [
          JSON.stringify(p),
        ]);
        const versions = await db.query<{
          version: number;
          is_current: boolean;
          terms_and_conditions: string;
        }>(
          "SELECT version,is_current,terms_and_conditions FROM business_settings_versions ORDER BY version",
        );
        assert.equal(versions.rows.filter((v) => v.is_current).length, 1);
        assert.equal(versions.rows.at(-1)?.version, old.version + 1);
        assert.equal(
          versions.rows[0].terms_and_conditions,
          old.terms_and_conditions,
        );
      },
    );
    await t.test("server stores one durable booking for retry", async () => {
      await actor("service_role");
      const first = await db.query<{ data: typeof result }>(
        "SELECT reserve_booking($1::jsonb) AS data",
        [JSON.stringify(payload)],
      );
      result = first.rows[0].data;
      const second = await db.query<{ data: typeof result }>(
        "SELECT reserve_booking($1::jsonb) AS data",
        [JSON.stringify(payload)],
      );
      assert.equal(second.rows[0].data.booking.id, result.booking.id);
      assert.equal((await db.query("SELECT id FROM bookings")).rows.length, 1);
      await assert.rejects(
        db.query("SELECT reserve_booking($1::jsonb)", [
          JSON.stringify({ ...payload, request_hash: "different" }),
        ]),
      );
    });
    await t.test(
      "other buyer cannot read order/payment or request changes",
      async () => {
        await actor("authenticated", b);
        assert.equal(
          (await db.query("SELECT id FROM bookings")).rows.length,
          0,
        );
        assert.equal(
          (await db.query("SELECT id FROM payment_attempts")).rows.length,
          0,
        );
        await assert.rejects(
          db.query(
            "INSERT INTO change_requests(booking_id,requested_by,request_type) VALUES($1,$2,'cancel')",
            [result.booking.id, b],
          ),
        );
      },
    );
    await t.test(
      "verified credit is idempotent and does not confirm vehicle",
      async () => {
        await actor("service_role");
        const event = {
          order_id: result.attempt.midtrans_order_id,
          gross_amount: "165000.00",
          transaction_status: "settlement",
          event_id: "event-one",
          transaction_id: "txn-test",
        };
        await db.query("SELECT apply_midtrans_event($1::jsonb)", [
          JSON.stringify(event),
        ]);
        await db.query("SELECT apply_midtrans_event($1::jsonb)", [
          JSON.stringify(event),
        ]);
        await db.query("SELECT apply_midtrans_event($1::jsonb)", [
          JSON.stringify({
            ...event,
            event_id: "event-duplicate-different-id",
          }),
        ]);
        await db.query("SELECT apply_midtrans_event($1::jsonb)", [
          JSON.stringify({
            ...event,
            transaction_status: "pending",
            event_id: "event-late-pending",
          }),
        ]);
        const row = (
          await db.query<{ amount_paid: number; status: string }>(
            "SELECT amount_paid,status FROM bookings",
          )
        ).rows[0];
        assert.equal(row.amount_paid, 165000);
        assert.equal(row.status, "payment_received");
        assert.equal(
          (await db.query("SELECT id FROM payment_ledger")).rows.length,
          1,
        );
        await assert.rejects(
          db.query("SELECT apply_midtrans_event($1::jsonb)", [
            JSON.stringify({
              ...event,
              event_id: "wrong-amount",
              gross_amount: "1.00",
            }),
          ]),
        );
      },
    );
    await t.test(
      "admin confirms separately and internal notes stay private",
      async () => {
        await actor("authenticated", admin);
        await db.query(
          "SELECT set_booking_status($1,'confirmed','Kendaraan tersedia')",
          [result.booking.id],
        );
        await db.query(
          "INSERT INTO booking_admin_notes(booking_id,note,updated_by) VALUES($1,$2,$3)",
          [result.booking.id, "INTERNAL SUPPLIER NOTE", admin],
        );
        assert.equal(
          (
            await db.query(
              "UPDATE bookings SET amount_paid=550000 WHERE id=$1 RETURNING id",
              [result.booking.id],
            )
          ).rows.length,
          0,
        );
        assert.equal(
          (
            await db.query(
              "UPDATE bookings SET status='completed' WHERE id=$1 RETURNING id",
              [result.booking.id],
            )
          ).rows.length,
          0,
        );
        await actor("authenticated", a);
        assert.equal(
          (await db.query("SELECT id FROM booking_admin_notes")).rows.length,
          0,
        );
        assert.equal(
          (
            await db.query<{ admin_notes: string }>(
              "SELECT admin_notes FROM bookings",
            )
          ).rows[0].admin_notes,
          "",
        );
      },
    );
    await t.test(
      "one balance invoice is reused and cannot overcharge outstanding",
      async () => {
        await actor("service_role");
        const key = "66666666-6666-4666-8666-666666666666";
        const first = await db.query<{
          data: {
            attempt: {
              id: string;
              expected_amount: number;
              midtrans_order_id: string;
            };
          };
        }>("SELECT prepare_balance_payment($1,$2,$3) AS data", [
          result.booking.id,
          a,
          key,
        ]);
        const invoice = first.rows[0].data.attempt;
        assert.equal(invoice.expected_amount, 385000);
        const second = await db.query<{ data: { attempt: { id: string } } }>(
          "SELECT prepare_balance_payment($1,$2,$3) AS data",
          [result.booking.id, a, "77777777-7777-4777-8777-777777777777"],
        );
        assert.equal(second.rows[0].data.attempt.id, invoice.id);
        await db.query("SELECT apply_midtrans_event($1::jsonb)", [
          JSON.stringify({
            order_id: invoice.midtrans_order_id,
            gross_amount: "385000.00",
            transaction_status: "settlement",
            event_id: "balance-paid",
          }),
        ]);
        const paid = (
          await db.query<{
            amount_paid: number;
            outstanding: number;
            status: string;
          }>(
            "SELECT amount_paid,outstanding,status FROM bookings WHERE id=$1",
            [result.booking.id],
          )
        ).rows[0];
        assert.equal(paid.amount_paid, 550000);
        assert.equal(paid.outstanding, 0);
        assert.equal(paid.status, "confirmed");
        await assert.rejects(
          db.query("SELECT prepare_balance_payment($1,$2,$3)", [
            result.booking.id,
            a,
            key,
          ]),
        );
      },
    );
    await t.test(
      "quota rejects excess units and admin cancellation releases held quota",
      async () => {
        await actor("service_role");
        await db.query(
          "INSERT INTO sales_quotas(product_id,date,max_units) VALUES($1,'2026-11-02',1)",
          [product],
        );
        const next = {
          ...payload,
          service_date: "2026-11-02",
          idempotency_key: "88888888-8888-4888-8888-888888888888",
        };
        const q = await db.query<{
          data: {
            booking: { id: string };
            attempt: { midtrans_order_id: string };
          };
        }>("SELECT reserve_booking($1::jsonb) AS data", [JSON.stringify(next)]);
        await assert.rejects(
          db.query("SELECT reserve_booking($1::jsonb)", [
            JSON.stringify({
              ...next,
              idempotency_key: "99999999-9999-4999-8999-999999999999",
            }),
          ]),
        );
        await actor("authenticated", admin);
        await db.query(
          "SELECT set_booking_status($1,'cancelled_by_admin','Batas pembayaran lewat')",
          [q.rows[0].data.booking.id],
        );
        await actor("service_role");
        assert.equal(
          (
            await db.query<{ booked_units: number }>(
              "SELECT booked_units FROM sales_quotas WHERE product_id=$1 AND date='2026-11-02'",
              [product],
            )
          ).rows[0].booked_units,
          0,
        );
        await db.query("SELECT apply_midtrans_event($1::jsonb)", [
          JSON.stringify({
            order_id: q.rows[0].data.attempt.midtrans_order_id,
            gross_amount: "165000.00",
            transaction_status: "settlement",
            event_id: "late-paid-cancelled",
          }),
        ]);
        assert.equal(
          (
            await db.query<{ status: string }>(
              "SELECT status FROM bookings WHERE id=$1",
              [q.rows[0].data.booking.id],
            )
          ).rows[0].status,
          "refund_pending",
        );
      },
    );
    await t.test("blocked admin loses RLS and RPC privileges", async () => {
      await actor("service_role");
      await db.query(
        "UPDATE profiles SET account_status='blocked' WHERE id=$1",
        [admin],
      );
      await actor("authenticated", admin);
      assert.equal(
        (await db.query("SELECT id FROM site_settings")).rows.length > 0,
        true,
      );
      assert.equal(
        (
          await db.query(
            "UPDATE site_settings SET value='false'::jsonb WHERE key='checkout_enabled' RETURNING id",
          )
        ).rows.length,
        0,
      );
      await assert.rejects(
        db.query("SELECT set_booking_status($1,'in_progress','test')", [
          result.booking.id,
        ]),
      );
    });
  } finally {
    await db.close();
  }
});
