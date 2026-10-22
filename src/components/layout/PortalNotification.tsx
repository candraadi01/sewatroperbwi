"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Check, Trash2, Calendar, CreditCard, Car, Info, CheckCircle2 } from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "booking" | "payment" | "fleet" | "system";
  href?: string;
}

interface PortalNotificationProps {
  role: "admin" | "owner" | "buyer";
}

export function PortalNotification({ role }: PortalNotificationProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Default notifications based on role
  const initialNotifications: Record<"admin" | "owner" | "buyer", NotificationItem[]> = {
    buyer: [
      {
        id: "b-1",
        title: "Pesanan Disetujui Admin",
        message: "Booking Jeep Kawah Ijen #TRP-8820 telah disetujui. Silakan selesaikan pembayaran DP/lunas.",
        time: "10 menit lalu",
        read: false,
        type: "booking",
        href: "/buyer/pesanan",
      },
      {
        id: "b-2",
        title: "Armada & Driver Siap",
        message: "Driver Pak Slamet (Trooper Hitam Plat P 1234 XX) dijadwalkan menjemput Anda tepat waktu.",
        time: "2 jam lalu",
        read: false,
        type: "fleet",
        href: "/buyer/pesanan",
      },
      {
        id: "b-3",
        title: "Voucher Trip Terbit",
        message: "Voucher reservasi Jeep Trooper siap ditunjukkan kepada driver saat penjemputan.",
        time: "1 hari lalu",
        read: true,
        type: "system",
        href: "/buyer/pesanan",
      },
    ],
    admin: [
      {
        id: "a-1",
        title: "Pesanan Baru Menunggu Review",
        message: "Ada 1 reservasi paket Baluran + Fotografer baru yang perlu diverifikasi dan disetujui.",
        time: "5 menit lalu",
        read: false,
        type: "booking",
        href: "/admin/pesanan",
      },
      {
        id: "a-2",
        title: "Pembayaran Berhasil Masuk",
        message: "Pembayaran tagihan invoice #INV-9902 sebesar Rp 1.250.000 sukses diverifikasi Midtrans.",
        time: "1 jam lalu",
        read: false,
        type: "payment",
        href: "/admin/laporan",
      },
      {
        id: "a-3",
        title: "Penugasan Driver Akhir Pekan",
        message: "Pastikan armada Jeep Trooper telah teralokasi untuk seluruh rute trip sabtu-minggu ini.",
        time: "4 jam lalu",
        read: true,
        type: "fleet",
        href: "/admin/tim",
      },
    ],
    owner: [
      {
        id: "o-1",
        title: "Armada Anda Disewa",
        message: "Unit Jeep Trooper #01 telah dipesan pelanggan untuk trip petualangan Sukamade 2D1N.",
        time: "15 menit lalu",
        read: false,
        type: "fleet",
        href: "/owner/transaksi",
      },
      {
        id: "o-2",
        title: "Pencairan Saldo Diproses",
        message: "Permohonan penarikan dana Rp 1.500.000 telah disetujui dan ditransfer ke rekening bank Anda.",
        time: "3 jam lalu",
        read: false,
        type: "payment",
        href: "/owner/tarik-dana",
      },
      {
        id: "o-3",
        title: "Laporan Finansial Siap",
        message: "Rekap pendapatan bagi hasil armada bulan ini dapat diunduh pada halaman riwayat transaksi.",
        time: "1 hari lalu",
        read: true,
        type: "system",
        href: "/owner/transaksi",
      },
    ],
  };

  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications[role]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function clearAll() {
    setNotifications([]);
  }

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function getIcon(type: NotificationItem["type"]) {
    switch (type) {
      case "booking":
        return <Calendar size={15} className="text-[#327691]" />;
      case "payment":
        return <CreditCard size={15} className="text-emerald-600" />;
      case "fleet":
        return <Car size={15} className="text-amber-600" />;
      default:
        return <Info size={15} className="text-sky-600" />;
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Notification Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#dce6eb] dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center text-[#527484] dark:text-neutral-300 hover:bg-[#f4f9fb] dark:hover:bg-neutral-800 hover:text-[#263b46] dark:hover:text-white transition shadow-2xs cursor-pointer"
        aria-label="Buka Notifikasi"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-neutral-900 border border-[#e4ebef] dark:border-neutral-800 shadow-2xl z-50 text-xs overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="p-3.5 border-b border-[#e4ebef] dark:border-neutral-800 flex items-center justify-between bg-[#f8fafc] dark:bg-neutral-800/60">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#263b46] dark:text-neutral-100">
                Notifikasi
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 text-[10px] font-bold">
                  {unreadCount} baru
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="px-2 py-1 text-[11px] font-semibold text-[#327691] hover:underline cursor-pointer flex items-center gap-1"
                  title="Tandai semua sudah dibaca"
                >
                  <Check size={12} />
                  <span>Dibaca</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="p-1 text-neutral-400 hover:text-red-600 transition cursor-pointer"
                  title="Bersihkan notifikasi"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* List Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#f0f4f6] dark:divide-neutral-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-400">
                <CheckCircle2 size={32} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-2" />
                <p className="font-semibold text-xs">Belum ada notifikasi baru</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Semua pesan dan pembaruan sistem akan muncul di sini.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`p-3.5 hover:bg-[#fbfcfd] dark:hover:bg-neutral-800/40 transition flex items-start gap-3 cursor-pointer ${
                    !item.read ? "bg-[#f4f9fb] dark:bg-neutral-800/20" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-neutral-800 border border-[#e4ebef] dark:border-neutral-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`font-bold text-xs truncate ${!item.read ? "text-[#263b46] dark:text-neutral-100" : "text-neutral-600 dark:text-neutral-400"}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-neutral-400 shrink-0">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    {item.href && (
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="inline-block mt-1.5 text-[11px] font-bold text-[#327691] hover:underline"
                      >
                        Lihat Rincian →
                      </Link>
                    )}
                  </div>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-[#327691] shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
