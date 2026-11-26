import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { AuthUser } from "@/lib/auth/helpers";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "booking" | "payment" | "fleet" | "system";
  href?: string;
  createdAt: string;
}

export interface NotificationStateOverride {
  readIds?: string[];
  dismissedIds?: string[];
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 0 || diffSec < 60) return "Baru saja";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "Kemarin";
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

/**
 * Algoritma pengumpulan dan evaluasi notifikasi real-time berdasarkan peran pengguna:
 * 1. Mengambil notifikasi langsung dari tabel database `notification_outbox`.
 * 2. Mengagregasi status transaksi terkini dari tabel `bookings` & `payout_requests`.
 * 3. Menerapkan filter status baca dan hapus agar persisten antar reload.
 * 4. Mengurutkan berdasarkan waktu terbaru dan menghitung unreadCount secara presisi.
 */
export async function getNotificationsForUser(
  user: AuthUser,
  stateOverride?: NotificationStateOverride
): Promise<{
  notifications: NotificationItem[];
  unreadCount: number;
}> {
  const db = await createClient();
  const adminDb = await createAdminClient().catch(() => null);
  const items: NotificationItem[] = [];

  const dismissedSet = new Set(stateOverride?.dismissedIds || []);
  const readSet = new Set(stateOverride?.readIds || []);

  // 1. Ambil pesan resmi dari notification_outbox milik user
  try {
    const { data: outboxRows } = await db
      .from("notification_outbox")
      .select("id, subject, body, is_read, created_at, channel")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (outboxRows && outboxRows.length > 0) {
      for (const row of outboxRows) {
        let type: NotificationItem["type"] = "system";
        const subj = (row.subject || "").toLowerCase();
        if (subj.includes("booking") || subj.includes("pesanan")) type = "booking";
        else if (subj.includes("bayar") || subj.includes("pembayaran")) type = "payment";
        else if (subj.includes("armada") || subj.includes("driver")) type = "fleet";

        items.push({
          id: row.id,
          title: row.subject || "Pemberitahuan Sistem",
          message: row.body,
          time: formatRelativeTime(row.created_at),
          read: Boolean(row.is_read),
          type,
          href: user.roles.includes("admin") ? "/admin/pesanan" : "/buyer/pesanan",
          createdAt: row.created_at,
        });
      }
    }
  } catch (err) {
    console.error("[notifications service] failed to fetch notification_outbox:", err);
  }

  // 2. Evaluasi Algoritma Real-Time berdasarkan Peran (Buyer, Admin, Owner)

  // A. BUYER: Status pesanan & instruksi trip terkini
  if (user.roles.includes("buyer")) {
    try {
      const { data: bookings } = await db
        .from("bookings")
        .select("id, booking_code, status, total_amount, amount_paid, service_date, start_time, pickup_address, approval_expires_at, product_snapshot, rejection_reason, created_at, approved_at, assigned_driver_name, assigned_vehicle_plate")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (bookings && bookings.length > 0) {
        for (const b of bookings) {
          const prodName = (b.product_snapshot as { name?: string })?.name || "Jeep Trooper";

          // Skenario 1: Pesanan Disetujui & Siap Bayar
          if (b.status === "approved") {
            const expTime = b.approval_expires_at
              ? new Date(b.approval_expires_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB"
              : "segera";
            items.push({
              id: `dyn-appr-${b.id}`,
              title: `Pesanan #${b.booking_code} Disetujui`,
              message: `Booking ${prodName} telah disetujui admin. Silakan selesaikan pembayaran sebelum ${expTime}.`,
              time: formatRelativeTime(b.approved_at || b.created_at),
              read: false,
              type: "payment",
              href: `/buyer/pesanan`,
              createdAt: b.approved_at || b.created_at,
            });
          }

          // Skenario 2: Pesanan Baru Menunggu Verifikasi
          else if (b.status === "pending_review") {
            items.push({
              id: `dyn-pend-${b.id}`,
              title: `Reservasi #${b.booking_code} Sedang Ditinjau`,
              message: `Admin sedang memverifikasi ketersediaan unit Jeep Trooper untuk tanggal ${b.service_date}.`,
              time: formatRelativeTime(b.created_at),
              read: true,
              type: "booking",
              href: `/buyer/pesanan`,
              createdAt: b.created_at,
            });
          }

          // Skenario 3: Pembayaran Diterima / Driver Siap
          else if (["confirmed", "payment_received", "in_progress"].includes(b.status)) {
            const driverInfo = b.assigned_driver_name
              ? `Driver: ${b.assigned_driver_name} (${b.assigned_vehicle_plate || "Jeep 4x4"})`
              : "Driver & armada telah siap melayani Anda.";
            items.push({
              id: `dyn-conf-${b.id}`,
              title: `Pembayaran Berhasil & Driver Siap`,
              message: `Booking #${b.booking_code} siap jalan pada ${b.service_date}. ${driverInfo}`,
              time: formatRelativeTime(b.created_at),
              read: false,
              type: "fleet",
              href: `/buyer/pesanan`,
              createdAt: b.created_at,
            });
          }

          // Skenario 4: Dibatalkan atau Ditolak
          else if (["cancelled_by_admin", "cancelled_by_user"].includes(b.status)) {
            items.push({
              id: `dyn-canc-${b.id}`,
              title: `Pesanan #${b.booking_code} Dibatalkan`,
              message: b.rejection_reason || "Reservasi tidak dapat dilanjutkan.",
              time: formatRelativeTime(b.created_at),
              read: true,
              type: "system",
              href: `/buyer/pesanan`,
              createdAt: b.created_at,
            });
          }
        }
      }
    } catch (err) {
      console.error("[notifications service] failed to evaluate buyer bookings:", err);
    }
  }

  // B. ADMIN: Peringatan operasional, pesanan butuh aksi & pembayaran masuk
  if (user.roles.includes("admin") && adminDb) {
    try {
      // 1. Cek pesanan baru yang butuh persetujuan
      const { count: pendingCount } = await adminDb
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending_review");

      if (pendingCount && pendingCount > 0) {
        items.push({
          id: "dyn-admin-pending",
          title: `${pendingCount} Pesanan Baru Menunggu Verifikasi`,
          message: `Ada ${pendingCount} reservasi tamu yang memerlukan persetujuan dan alokasi armada.`,
          time: "Tindakan Diperlukan",
          read: false,
          type: "booking",
          href: "/admin/pesanan",
          createdAt: new Date().toISOString(),
        });
      }

      // 2. Cek pengajuan penarikan dana pemilik armada
      const { count: payoutCount } = await adminDb
        .from("payout_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      if (payoutCount && payoutCount > 0) {
        items.push({
          id: "dyn-admin-payouts",
          title: `${payoutCount} Pengajuan Payout Pemilik`,
          message: `Permintaan pencairan dana pemilik armada menunggu verifikasi Administrator.`,
          time: "Tindakan Diperlukan",
          read: false,
          type: "payment",
          href: "/admin/payouts",
          createdAt: new Date().toISOString(),
        });
      }

      // 3. Cek pembayaran terbaru yang sukses
      const { data: recentPayments } = await adminDb
        .from("bookings")
        .select("id, booking_code, amount_paid, created_at")
        .gt("amount_paid", 0)
        .order("created_at", { ascending: false })
        .limit(3);

      if (recentPayments && recentPayments.length > 0) {
        for (const p of recentPayments) {
          items.push({
            id: `dyn-admin-paid-${p.id}`,
            title: `Pembayaran Masuk #${p.booking_code}`,
            message: `Pembayaran sebesar Rp ${Number(p.amount_paid).toLocaleString("id-ID")} berhasil diverifikasi.`,
            time: formatRelativeTime(p.created_at),
            read: true,
            type: "payment",
            href: "/admin/pesanan",
            createdAt: p.created_at,
          });
        }
      }
    } catch (err) {
      console.error("[notifications service] failed to evaluate admin notifications:", err);
    }
  }

  // C. OWNER: Notifikasi armada disewa & status penarikan dana
  if (user.roles.includes("owner")) {
    try {
      const { data: ownerPayouts } = await db
        .from("payout_requests")
        .select("id, amount, status, bank_name, requested_at, processed_at")
        .eq("owner_id", user.id)
        .order("requested_at", { ascending: false })
        .limit(5);

      if (ownerPayouts && ownerPayouts.length > 0) {
        for (const p of ownerPayouts) {
          items.push({
            id: `dyn-owner-pay-${p.id}`,
            title: `Pencairan Saldo: ${p.status.toUpperCase()}`,
            message: `Penarikan dana Rp ${Number(p.amount).toLocaleString("id-ID")} ke ${p.bank_name} berstatus ${p.status}.`,
            time: formatRelativeTime(p.processed_at || p.requested_at),
            read: p.status !== "approved",
            type: "payment",
            href: "/owner/tarik-dana",
            createdAt: p.processed_at || p.requested_at,
          });
        }
      }
    } catch (err) {
      console.error("[notifications service] failed to evaluate owner notifications:", err);
    }
  }

  // 3. Filter notifikasi yang telah dihapus / didismiss pengguna
  const activeItems = items.filter((item) => !dismissedSet.has(item.id));

  // 4. Urutkan seluruh notifikasi dari yang terbaru
  activeItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // 5. Terapkan status baca yang telah dipersist
  for (const item of activeItems) {
    if (readSet.has(item.id)) {
      item.read = true;
    }
  }

  // 6. Hitung jumlah unread secara akurat
  const unreadCount = activeItems.filter((n) => !n.read).length;

  return {
    notifications: activeItems,
    unreadCount,
  };
}

/**
 * Tandai notifikasi sebagai sudah dibaca
 */
export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  const adminDb = await createAdminClient().catch(() => null);
  if (adminDb && !notificationId.startsWith("dyn-")) {
    await adminDb
      .from("notification_outbox")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("recipient_id", userId);
  }
}

/**
 * Tandai seluruh notifikasi milik user sebagai sudah dibaca
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const adminDb = await createAdminClient().catch(() => null);
  if (adminDb) {
    await adminDb
      .from("notification_outbox")
      .update({ is_read: true })
      .eq("recipient_id", userId);
  }
}

/**
 * Bersihkan notifikasi milik user (individual atau semua)
 */
export async function clearNotifications(userId: string, notificationId?: string): Promise<void> {
  const adminDb = await createAdminClient().catch(() => null);
  if (adminDb) {
    let query = adminDb.from("notification_outbox").delete().eq("recipient_id", userId);
    if (notificationId && !notificationId.startsWith("dyn-")) {
      query = query.eq("id", notificationId);
    }
    await query;
  }
}
