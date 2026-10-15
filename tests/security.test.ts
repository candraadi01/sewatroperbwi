import { assertSameOrigin } from "../src/lib/security/http";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { safeRedirectPath } from "../src/lib/security/redirect";
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
test("redirect allowlist rejects external paths and backslashes", () => {
  for (const value of [
    "//evil.test",
    "/\\evil.test",
    "https://evil.test",
    "/a\nLocation:evil",
  ])
    assert.equal(safeRedirectPath(value), "/");
  assert.equal(
    safeRedirectPath("/checkout?quote_id=abc"),
    "/checkout?quote_id=abc",
  );
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
