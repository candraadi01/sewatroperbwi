import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/helpers";
import { createSnapTransaction } from "@/lib/midtrans/snap";
export interface BookingRecord {
  id: string;
  database_id: string;
  product_id: string;
  product_name: string;
  service_date: string;
  start_time: string;
  num_units: number;
  num_passengers: number;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  pickup_address: string;
  payment_choice: string;
  total_amount: number;
  amount_to_pay: number;
  remaining_amount: number;
  amount_paid: number;
  payment_status: string;
  booking_status: string;
  created_at: string;
  confirmation_deadline?: string;
  balance_deadline?: string;
  payment_url?: string;
  notes: string;
}
export interface StoredBooking {
  id: string;
  booking_code: string;
  user_id: string;
  product_id: string;
  product_snapshot: { name?: string; product_name?: string };
  service_date: string;
  start_time: string;
  num_units: number;
  num_passengers: number;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  pickup_address: string;
  payment_choice: string;
  total_amount: number;
  dp_amount: number;
  outstanding: number;
  amount_paid: number;
  status: string;
  created_at: string;
  notes: string;
  confirmation_deadline?: string;
  terms_snapshot?: { balance_deadline_hours?: number };
  payment_attempts?: PaymentAttempt[];
}
export interface PaymentAttempt {
  id: string;
  booking_id: string;
  midtrans_order_id: string;
  purpose: string;
  expected_amount: number;
  snap_token: string | null;
  snap_redirect_url: string | null;
  status: string;
  paid_amount: number;
}
const columns =
  "id,booking_code,user_id,product_id,product_snapshot,service_date,start_time,num_units,num_passengers,contact_name,contact_phone,contact_email,pickup_address,payment_choice,total_amount,dp_amount,outstanding,amount_paid,status,created_at,notes,confirmation_deadline,terms_snapshot,payment_attempts(id,booking_id,midtrans_order_id,purpose,expected_amount,snap_token,snap_redirect_url,status,paid_amount)";
export function mapBooking(b: StoredBooking): BookingRecord {
  return {
    id: b.booking_code,
    database_id: b.id,
    product_id: b.product_id,
    product_name:
      b.product_snapshot?.name ??
      b.product_snapshot?.product_name ??
      "Jeep Trooper",
    service_date: b.service_date,
    start_time: b.start_time,
    num_units: b.num_units,
    num_passengers: b.num_passengers,
    contact_name: b.contact_name,
    contact_phone: b.contact_phone,
    contact_email: b.contact_email,
    pickup_address: b.pickup_address,
    payment_choice: b.payment_choice,
    total_amount: b.total_amount,
    amount_to_pay: b.payment_choice === "dp" ? b.dp_amount : b.total_amount,
    remaining_amount: b.outstanding,
    amount_paid: b.amount_paid,
    payment_status:
      b.amount_paid >= b.total_amount
        ? "settlement"
        : b.amount_paid > 0
          ? "dp_paid"
          : "unpaid",
    booking_status: b.status,
    created_at: b.created_at,
    notes: b.notes,
    confirmation_deadline: b.confirmation_deadline,
    balance_deadline:
      typeof b.terms_snapshot?.balance_deadline_hours === "number"
        ? new Date(
            Date.parse(`${b.service_date}T${b.start_time}+07:00`) -
              b.terms_snapshot.balance_deadline_hours * 3600000,
          ).toISOString()
        : undefined,
    payment_url:
      b.payment_attempts?.find(
        (a) => a.status === "pending" && a.snap_redirect_url,
      )?.snap_redirect_url ?? undefined,
  };
}
export async function getBookingById(
  code: string,
): Promise<BookingRecord | null> {
  const user = await getAuthUser();
  if (!user) return null;
  const db = await createClient();
  let query = db.from("bookings").select(columns).eq("booking_code", code);
  if (!user.roles.includes("admin")) query = query.eq("user_id", user.id);
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error("Pesanan belum dapat dimuat.");
  return data ? mapBooking(data as unknown as StoredBooking) : null;
}
export async function getAllBookings(): Promise<BookingRecord[]> {
  const user = await getAuthUser();
  if (!user) return [];
  const db = await createClient();
  let query = db
    .from("bookings")
    .select(columns)
    .order("created_at", { ascending: false })
    .limit(100);
  if (!user.roles.includes("admin")) query = query.eq("user_id", user.id);
  const { data, error } = await query;
  if (error) throw new Error("Pesanan belum dapat dimuat.");
  return (data as unknown as StoredBooking[]).map(mapBooking);
}
export async function preparePayment(
  booking: StoredBooking,
  attempt: PaymentAttempt,
) {
  if (attempt.snap_redirect_url && attempt.snap_token)
    return {
      token: attempt.snap_token,
      redirect_url: attempt.snap_redirect_url,
    };
  if (attempt.paid_amount > 0) throw new Error("Tagihan ini sudah dibayar.");
  const result = await createSnapTransaction({
    orderId: attempt.midtrans_order_id,
    grossAmount: attempt.expected_amount,
    customerName: booking.contact_name,
    customerEmail: booking.contact_email,
    customerPhone: booking.contact_phone,
    items: [
      {
        id: booking.product_id,
        name: `${attempt.purpose === "dp" ? "DP" : "Sewa"} ${booking.product_snapshot?.name ?? "Trooper"}`,
        price: attempt.expected_amount,
        quantity: 1,
      },
    ],
  });
  const db = await createAdminClient();
  const { error } = await db
    .from("payment_attempts")
    .update({
      snap_token: result.token,
      snap_redirect_url: result.redirect_url,
    })
    .eq("id", attempt.id)
    .eq("status", "pending");
  if (error)
    throw new Error(
      "Tagihan dibuat tetapi belum dapat disimpan. Hubungi admin dengan kode pesanan.",
    );
  return result;
}

export async function getOwnBookings(): Promise<BookingRecord[]> {
  const user = await getAuthUser();
  if (!user) return [];
  const db = await createClient();
  const { data, error } = await db
    .from("bookings")
    .select(columns)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("Pesanan belum dapat dimuat.");
  return (data as unknown as StoredBooking[]).map(mapBooking);
}

export async function getBookingHistory(
  id: string,
): Promise<{ new_status: string; reason: string; created_at: string }[]> {
  const user = await getAuthUser();
  if (!user) return [];
  const db = await createClient();
  const { data, error } = await db
    .from("booking_status_history")
    .select("new_status,reason,created_at")
    .eq("booking_id", id)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw new Error("Riwayat pesanan belum dapat dimuat.");
  return data ?? [];
}
