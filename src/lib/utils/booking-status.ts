export const bookingStatus: Record<string, string> = {
  pending_review: "Menunggu konfirmasi admin",
  approved: "Disetujui — segera selesaikan pembayaran",
  pending_payment: "Menunggu pembayaran",
  payment_received: "Pembayaran diterima · menunggu konfirmasi kendaraan",
  confirmed: "Kendaraan terkonfirmasi",
  in_progress: "Perjalanan berlangsung",
  completed: "Perjalanan selesai",
  cancelled_by_buyer: "Dibatalkan pemesan",
  cancelled_by_admin: "Dibatalkan admin",
  refund_pending: "Pengembalian dana ditinjau",
  refunded: "Dana dikembalikan",
};
