export const bookingStatus: Record<string, string> = {
  pending_payment: "Menunggu pembayaran",
  payment_received: "Pembayaran diterima · menunggu kendaraan",
  confirmed: "Kendaraan terkonfirmasi",
  in_progress: "Perjalanan berlangsung",
  completed: "Perjalanan selesai",
  cancelled_by_buyer: "Dibatalkan pemesan",
  cancelled_by_admin: "Dibatalkan admin",
  refund_pending: "Pengembalian dana ditinjau",
  refunded: "Dana dikembalikan",
};
