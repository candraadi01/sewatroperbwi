export interface BookingRecord {
  id: string; // e.g. BWI-20261013-ABCD
  quote_id: string;
  product_id: string;
  product_name: string;
  service_date: string;
  num_units: number;
  num_passengers: number;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  pickup_zone_name?: string;
  pickup_address: string;
  payment_choice: 'dp' | 'full';
  total_amount: number;
  amount_to_pay: number;
  remaining_amount: number;
  payment_status: 'unpaid' | 'dp_paid' | 'settlement' | 'cancel';
  booking_status: 'pending_payment' | 'confirmed' | 'completed' | 'cancelled';
  snap_token?: string;
  notes?: string;
  created_at: string;
}

// In-memory persistent cache for bookings across serverless requests during runtime
const bookingStore = new Map<string, BookingRecord>();

export async function saveBooking(booking: BookingRecord): Promise<BookingRecord> {
  bookingStore.set(booking.id, booking);
  return booking;
}

export async function getBookingById(id: string): Promise<BookingRecord | null> {
  return bookingStore.get(id) || null;
}

export async function updateBookingPaymentStatus(
  id: string,
  paymentStatus: BookingRecord['payment_status'],
  bookingStatus: BookingRecord['booking_status']
): Promise<BookingRecord | null> {
  const existing = bookingStore.get(id);
  if (!existing) return null;

  const updated: BookingRecord = {
    ...existing,
    payment_status: paymentStatus,
    booking_status: bookingStatus,
  };

  bookingStore.set(id, updated);
  return updated;
}

export async function getAllBookings(): Promise<BookingRecord[]> {
  return Array.from(bookingStore.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
