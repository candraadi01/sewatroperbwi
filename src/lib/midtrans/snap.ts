import crypto from "node:crypto";
export interface CreateSnapTransactionParams {
  orderId: string;
  grossAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: { id: string; price: number; quantity: number; name: string }[];
}
export function midtransConfigured() {
  return Boolean(
    process.env.MIDTRANS_SERVER_KEY &&
    !/placeholder|xxxxx|your-/.test(process.env.MIDTRANS_SERVER_KEY),
  );
}
export async function createSnapTransaction(
  p: CreateSnapTransactionParams,
): Promise<{ token: string; redirect_url: string }> {
  if (!midtransConfigured()) throw new Error("Pembayaran belum dikonfigurasi.");
  const live = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
  const response = await fetch(
    `https://app.${live ? "" : "sandbox."}midtrans.com/snap/v1/transactions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: p.orderId,
          gross_amount: p.grossAmount,
        },
        customer_details: {
          first_name: p.customerName,
          email: p.customerEmail,
          phone: p.customerPhone,
        },
        item_details: p.items.map((i) => ({
          ...i,
          id: i.id.slice(0, 50),
          name: i.name.slice(0, 50),
        })),
        credit_card: { secure: true },
      }),
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    },
  );
  if (!response.ok)
    throw new Error(
      "Gateway belum dapat membuat tagihan. Pesanan tetap tersimpan; jangan membuat pembayaran lain.",
    );
  const data = (await response.json()) as {
    token?: string;
    redirect_url?: string;
  };
  if (
    !data.token ||
    !data.redirect_url ||
    !isMidtransPaymentUrl(data.redirect_url)
  )
    throw new Error("Respons gateway tidak valid.");
  return { token: data.token, redirect_url: data.redirect_url };
}
export function isMidtransPaymentUrl(value: string) {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      ["app.midtrans.com", "app.sandbox.midtrans.com"].includes(u.hostname)
    );
  } catch {
    return false;
  }
}
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string,
) {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!midtransConfigured() || !key || !/^[a-f0-9]{128}$/i.test(signatureKey))
    return false;
  const expected = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + key)
    .digest();
  const received = Buffer.from(signatureKey, "hex");
  return (
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received)
  );
}

/** Fetch canonical provider state: notification signature does not bind transaction_status. */
export async function getMidtransStatus(orderId: string) {
  if (!midtransConfigured()) throw new Error("Gateway belum dikonfigurasi.");
  const live = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
  const response = await fetch(
    `https://api.${live ? "" : "sandbox."}midtrans.com/v2/${encodeURIComponent(orderId)}/status`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
      },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    },
  );
  if (!response.ok) throw new Error("Status gateway belum dapat diverifikasi.");
  const raw: unknown = await response.json();
  const { notificationSchema } = await import("@/lib/validations/requests");
  const parsed = notificationSchema
    .omit({ signature_key: true })
    .safeParse(raw);
  if (!parsed.success || parsed.data.order_id !== orderId)
    throw new Error("Respons status gateway tidak valid.");
  return parsed.data;
}
