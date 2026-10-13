import crypto from 'crypto';

export interface CreateSnapTransactionParams {
  orderId: string;
  grossAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }[];
}

export interface SnapTransactionResult {
  token: string;
  redirect_url: string;
  is_simulated?: boolean;
}

/**
 * Midtrans Snap Service.
 * Mendukung Sandbox Midtrans resmi serta mode fallback simulasi jika kredensial belum diisi.
 */
export async function createSnapTransaction(
  params: CreateSnapTransactionParams
): Promise<SnapTransactionResult> {
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
  const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-placeholder';

  // Jika belum ada server key asli atau masih placeholder, gunakan simulated token untuk sandbox testing
  const isPlaceholderKey =
    !serverKey ||
    serverKey.includes('xxxxx') ||
    serverKey.includes('placeholder') ||
    serverKey === 'SB-Mid-server-xxxxx';

  if (isPlaceholderKey) {
    const mockToken = `snap_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      token: mockToken,
      redirect_url: `/pesanan/${params.orderId}?payment_simulated=true`,
      is_simulated: true,
    };
  }

  const endpoint = isProduction
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

  const authHeader = `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`;

  const payload = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: Math.round(params.grossAmount),
    },
    customer_details: {
      first_name: params.customerName,
      email: params.customerEmail,
      phone: params.customerPhone,
    },
    item_details: params.items.map((item) => ({
      id: item.id.substring(0, 50),
      price: Math.round(item.price),
      quantity: item.quantity,
      name: item.name.substring(0, 50),
    })),
    credit_card: {
      secure: true,
    },
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/pesanan/${params.orderId}`,
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Midtrans API error response:', errorText);
      // Fallback ke token simulasi jika gateway sandbox menolak request
      return {
        token: `snap_sandbox_fallback_${Date.now()}`,
        redirect_url: `/pesanan/${params.orderId}?payment_simulated=true`,
        is_simulated: true,
      };
    }

    const data = await response.json();
    return {
      token: data.token,
      redirect_url: data.redirect_url,
      is_simulated: false,
    };
  } catch (err) {
    console.warn('Gagal menghubungi gateway Midtrans, fallback ke mode simulasi sandbox:', err);
    return {
      token: `snap_sandbox_offline_${Date.now()}`,
      redirect_url: `/pesanan/${params.orderId}?payment_simulated=true`,
      is_simulated: true,
    };
  }
}

/**
 * Verifikasi signature webhook Midtrans
 * signature = SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  if (!serverKey) return false;

  const raw = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const computedHash = crypto.createHash('sha512').update(raw).digest('hex');

  return computedHash.toLowerCase() === signatureKey.toLowerCase();
}
