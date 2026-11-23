import { assertSameOrigin, errorResponse } from "../src/lib/security/http";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { safeRedirectPath } from "../src/lib/security/redirect";
import { loginDestination } from "../src/lib/auth/login-destination";
import { GET as authCallback } from "../src/app/auth/callback/route";
import { POST as switchDemo } from "../src/app/api/auth/switch-demo/route";
import { POST as simulatePayment } from "../src/app/api/payments/[code]/simulate/route";
import { preparePayment, type PaymentAttempt, type StoredBooking } from "../src/lib/services/booking";
import {
  verifyMidtransSignature,
  isMidtransPaymentUrl,
  getMidtransStatus,
} from "../src/lib/midtrans/snap";
import { calculateAmounts } from "../src/lib/pricing/calculation";
import {
  notificationSchema,
  createBookingSchema,
  dateSchema,
} from "../src/lib/validations/requests";
test("legacy demo switch cannot create a session in development or production", (t) => {
  const env = process.env as Record<string, string | undefined>;
  const previous = { NODE_ENV: env.NODE_ENV, NEXT_PUBLIC_LOCAL_DEMO: env.NEXT_PUBLIC_LOCAL_DEMO };
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete env[key];
      else env[key] = value;
    }
  });
  env.NEXT_PUBLIC_LOCAL_DEMO = "true";
  for (const environment of ["development", "production"]) {
    env.NODE_ENV = environment;
    const response = switchDemo();
    assert.equal(response.status, 404);
    assert.equal(response.headers.has("set-cookie"), false);
  }
});

test("legacy payment simulator rejects an unauthenticated POST", async () => {
  const request = new Request("https://example.test/api/payments/test/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentChoice: "full" }),
  });
  const response = await simulatePayment(request);
  assert.equal(response.status, 404);
  assert.equal(await response.text(), "");
});

test("Snap failure returns a safe error before any database write", async (t) => {
  const key = process.env.MIDTRANS_SERVER_KEY;
  process.env.MIDTRANS_SERVER_KEY = "unit-test-key";
  t.after(() => {
    if (key === undefined) delete process.env.MIDTRANS_SERVER_KEY;
    else process.env.MIDTRANS_SERVER_KEY = key;
  });
  const booking: StoredBooking = {
    id: "booking-test", booking_code: "TEST", user_id: "buyer-test",
    product_id: "product-test", product_snapshot: { name: "Paket Test" },
    service_date: "2027-01-01", start_time: "08:00", num_units: 1,
    num_passengers: 1, contact_name: "Test", contact_phone: "081000000000",
    contact_email: "buyer@example.test", pickup_address: "", payment_choice: "dp",
    total_amount: 500000, dp_amount: 150000, outstanding: 500000, amount_paid: 0,
    status: "approved", created_at: "2026-11-22", notes: "",
  };
  const attempt: PaymentAttempt = {
    id: "attempt-test", booking_id: booking.id, midtrans_order_id: "order-test",
    purpose: "dp", expected_amount: 150000, snap_token: null,
    snap_redirect_url: null, status: "pending", paid_amount: 0,
  };
  const originalState = structuredClone({ booking, attempt });
  const fetch = t.mock.method(globalThis, "fetch", async (url: string) => {
    assert.match(url, /^https:\/\/app\.(sandbox\.)?midtrans\.com\/snap\/v1\/transactions$/);
    return new Response("Internal gateway detail", { status: 502 });
  });

  const response = await preparePayment(booking, attempt).then(
    () => assert.fail("A failed Snap request must not return a payment link"),
    errorResponse,
  );
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), {
    error: "Midtrans belum dapat membuka tagihan. Coba lagi atau hubungi admin.",
  });
  assert.equal(fetch.mock.callCount(), 1);
  assert.deepEqual({ booking, attempt }, originalState);
});

test("redirect allowlist rejects external paths and backslashes", () => {
  for (const value of [
    "//evil.test",
    "/\\evil.test",
    "/a/..//evil.test",
    "/a/%2e%2e//evil.test",
    "https://evil.test",
    "/a\nLocation:evil",
  ])
    assert.equal(safeRedirectPath(value), "/");
  assert.equal(
    safeRedirectPath("/checkout?quote_id=abc"),
    "/checkout?quote_id=abc",
  );
});
test("login keeps safe return destinations and chooses the portal by verified roles", () => {
  assert.equal(loginDestination("/", ["buyer", "admin"]), "/admin");
  assert.equal(loginDestination(null, ["owner"]), "/owner");
  assert.equal(loginDestination("/a/..//evil.test", ["buyer"]), "/buyer");
  assert.equal(loginDestination("/checkout?quote_id=abc", ["buyer"]), "/checkout?quote_id=abc");
});
test("OAuth cancellation returns to the login form without using an external redirect", async () => {
  const result = await authCallback(new Request("http://localhost:3000/auth/callback?error=access_denied&next=%2F%2Fevil.test"));
  assert.equal(result.status, 307);
  assert.equal(result.headers.get("location"), "http://localhost:3000/auth/login?error=access_denied&redirectTo=%2F");
});
test("webhook signature is mandatory, bound to amount and exact bytes", () => {
  process.env.MIDTRANS_SERVER_KEY = "unit-test-key";
  const hash = createHash("sha512")
    .update("order200165000.00unit-test-key")
    .digest("hex");
  assert.equal(
    verifyMidtransSignature("order", "200", "165000.00", hash),
    true,
  );
  assert.equal(verifyMidtransSignature("order", "200", "1.00", hash), false);
  assert.equal(verifyMidtransSignature("order", "200", "165000.00", ""), false);
  delete process.env.MIDTRANS_SERVER_KEY;
  assert.equal(
    verifyMidtransSignature("order", "200", "165000.00", hash),
    false,
  );
  assert.equal(
    notificationSchema.safeParse({
      order_id: "order",
      transaction_status: "settlement",
    }).success,
    false,
  );
});
test("only official payment hosts accepted", () => {
  assert.equal(
    isMidtransPaymentUrl("https://app.sandbox.midtrans.com/snap/v2/token"),
    true,
  );
  for (const url of [
    "javascript:alert(1)",
    "https://app.midtrans.com.evil.test",
    "http://app.midtrans.com",
    "https://evil.test",
  ])
    assert.equal(isMidtransPaymentUrl(url), false);
});
test("integer pricing, discount and small-total DP remain bounded", () => {
  assert.deepEqual(calculateAmounts(550000, 2, 50000, 100000, 3000), {
    subtotal: 1100000,
    pickup: 100000,
    total: 1100000,
    dp: 330000,
    remaining: 770000,
  });
  assert.equal(calculateAmounts(1, 1, 0, 0, 3000).dp, 1);
  assert.equal(calculateAmounts(550000, 1, 0, 0, 3000, 900000).dp, 550000);
  assert.throws(() => calculateAmounts(10, 1.5, 0, 0, 3000));
  assert.throws(() => calculateAmounts(-1, 1, 0, 0, 3000));
});
test("strict checkout rejects fabricated price fields and invalid dates", () => {
  assert.equal(dateSchema.safeParse("2026-02-31").success, false);
  assert.equal(
    createBookingSchema.safeParse({ amount_paid: 999999 }).success,
    false,
  );
});

test("canonical provider status is read from fixed endpoint and rejects order mismatch", async () => {
  const original = globalThis.fetch;
  const oldKey = process.env.MIDTRANS_SERVER_KEY;
  process.env.MIDTRANS_SERVER_KEY = "unit-test-key";
  try {
    globalThis.fetch = async (input) => {
      assert.equal(
        String(input),
        "https://api.sandbox.midtrans.com/v2/order%2Ftest/status",
      );
      return new Response(
        JSON.stringify({
          order_id: "order/test",
          status_code: "201",
          gross_amount: "165000.00",
          transaction_status: "pending",
        }),
      );
    };
    const status = await getMidtransStatus("order/test");
    assert.equal(status.transaction_status, "pending");
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          order_id: "other",
          status_code: "200",
          gross_amount: "165000.00",
          transaction_status: "settlement",
        }),
      );
    await assert.rejects(getMidtransStatus("order/test"));
  } finally {
    globalThis.fetch = original;
    if (oldKey === undefined) delete process.env.MIDTRANS_SERVER_KEY;
    else process.env.MIDTRANS_SERVER_KEY = oldKey;
  }
});

test("same-origin writes accept TLS proxy host but reject cross-site and missing origins", () => {
  assert.doesNotThrow(() =>
    assertSameOrigin(
      new Request("http://localhost/api/test", {
        headers: {
          host: "sewatroperbwi.vercel.app",
          origin: "https://sewatroperbwi.vercel.app",
        },
      }),
    ),
  );
  assert.doesNotThrow(() =>
    assertSameOrigin(
      new Request("http://localhost:3000/api/test", {
        headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000" },
      }),
    ),
  );
  for (const origin of [
    "https://evil.test",
    "null",
    "https://sewatroperbwi.vercel.app.evil.test",
  ])
    assert.throws(() =>
      assertSameOrigin(
        new Request("http://localhost/api/test", {
          headers: { host: "sewatroperbwi.vercel.app", origin },
        }),
      ),
    );
  assert.throws(() =>
    assertSameOrigin(new Request("https://sewatroperbwi.vercel.app/api/test")),
  );
});
