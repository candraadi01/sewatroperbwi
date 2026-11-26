"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Bell, 
  Check, 
  Trash2, 
  Calendar, 
  CreditCard, 
  Car, 
  Info, 
  CheckCircle2,
  Loader2,
  X
} from "lucide-react";

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
  role?: "admin" | "owner" | "buyer";
  userId?: string;
}

function getLocalIds(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveLocalIds(key: string, set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    const arr = Array.from(set).slice(-150);
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {
    // Abaikan masalah storage quota
  }
}

export function PortalNotification({ role, userId }: PortalNotificationProps) {
  void role;
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeUserId, setActiveUserId] = useState<string | undefined>(userId);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const readKey = activeUserId ? `portal_notif_read_${activeUserId}` : "portal_notif_read";
  const dismissedKey = activeUserId ? `portal_notif_dismissed_${activeUserId}` : "portal_notif_dismissed";

  // Ambil notifikasi dari API backend dan sinkronkan dengan cache persisten lokal
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const effectiveUid = data.userId || userId;
        if (effectiveUid && effectiveUid !== activeUserId) {
          setActiveUserId(effectiveUid);
        }

        const rKey = effectiveUid ? `portal_notif_read_${effectiveUid}` : "portal_notif_read";
        const dKey = effectiveUid ? `portal_notif_dismissed_${effectiveUid}` : "portal_notif_dismissed";
        const localRead = getLocalIds(rKey);
        const localDismissed = getLocalIds(dKey);

        if (Array.isArray(data.notifications)) {
          const merged = data.notifications
            .filter((n: NotificationItem) => !localDismissed.has(n.id))
            .map((n: NotificationItem) => ({
              ...n,
              read: Boolean(n.read || localRead.has(n.id)),
            }));
          setNotifications(merged);
        }
      }
    } catch (err) {
      console.error("[PortalNotification] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, activeUserId]);

  // Mount awal & polling background berkala (tanpa me-reset status baca/hapus pengguna)
  useEffect(() => {
    let isMounted = true;
    async function initFetch() {
      try {
        const res = await fetch("/api/notifications", {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          const effectiveUid = data.userId || userId;
          if (effectiveUid) {
            setActiveUserId(effectiveUid);
          }

          const rKey = effectiveUid ? `portal_notif_read_${effectiveUid}` : "portal_notif_read";
          const dKey = effectiveUid ? `portal_notif_dismissed_${effectiveUid}` : "portal_notif_dismissed";
          const localRead = getLocalIds(rKey);
          const localDismissed = getLocalIds(dKey);

          if (Array.isArray(data.notifications)) {
            const merged = data.notifications
              .filter((n: NotificationItem) => !localDismissed.has(n.id))
              .map((n: NotificationItem) => ({
                ...n,
                read: Boolean(n.read || localRead.has(n.id)),
              }));
            setNotifications(merged);
          }
        }
      } catch (err) {
        console.error("[PortalNotification] init error:", err);
      }
    }

    initFetch();
    const interval = setInterval(initFetch, 45000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userId]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tandai semua notifikasi sudah dibaca (Realtime & Persisten)
  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    // Optimistic UI update seketika
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    // Simpan ke localStorage agar tidak kembali normal saat di-refresh
    const localRead = getLocalIds(readKey);
    notifications.forEach((n) => localRead.add(n.id));
    saveLocalIds(readKey, localRead);

    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true, readIds: notifications.map((n) => n.id) }),
      });
    } catch (err) {
      console.error("[PortalNotification] markAllAsRead error:", err);
    }
  };

  // Tandai satu notifikasi sudah dibaca (Realtime & Persisten)
  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = notifications.find((n) => n.id === id);
    if (!target || target.read) return;

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    // Simpan ke localStorage
    const localRead = getLocalIds(readKey);
    localRead.add(id);
    saveLocalIds(readKey, localRead);

    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error("[PortalNotification] markAsRead error:", err);
    }
  };

  // Hapus satu notifikasi (Realtime & Persisten)
  const deleteNotification = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Optimistic UI update seketika
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    // Simpan ke localStorage dismissed
    const localDismissed = getLocalIds(dismissedKey);
    localDismissed.add(id);
    saveLocalIds(dismissedKey, localDismissed);

    try {
      await fetch(`/api/notifications?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("[PortalNotification] deleteNotification error:", err);
    }
  };

  // Bersihkan semua notifikasi (Realtime & Persisten)
  const clearAll = async () => {
    if (notifications.length === 0) return;
    const allIds = notifications.map((n) => n.id);

    // Optimistic UI update
    setNotifications([]);

    // Simpan ke localStorage
    const localDismissed = getLocalIds(dismissedKey);
    allIds.forEach((id) => localDismissed.add(id));
    saveLocalIds(dismissedKey, localDismissed);

    try {
      await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allIds }),
      });
    } catch (err) {
      console.error("[PortalNotification] clearAll error:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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
      {/* Bell Notification Button (Minimalis & Elegan Persis Foto 2) */}
      <button
        type="button"
        onClick={() => {
          const nextOpen = !open;
          setOpen(nextOpen);
          if (nextOpen) fetchNotifications();
        }}
        className="relative p-1.5 rounded-full text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer flex items-center justify-center"
        aria-label="Buka Notifikasi"
      >
        <Bell size={19} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
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
              {loading && <Loader2 size={13} className="animate-spin text-neutral-400" />}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-[#327691] hover:bg-[#e9f3f7] dark:hover:bg-neutral-800 transition cursor-pointer flex items-center gap-1"
                  title="Tandai semua sudah dibaca"
                >
                  <Check size={13} />
                  <span>Dibaca Semua</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer flex items-center gap-1"
                  title="Bersihkan semua notifikasi"
                >
                  <Trash2 size={13} />
                  <span>Hapus Semua</span>
                </button>
              )}
            </div>
          </div>

          {/* List Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#f0f4f6] dark:divide-neutral-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-400">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500/70 mb-2" />
                <p className="font-semibold text-xs text-neutral-700 dark:text-neutral-200">Semua Beres!</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Tidak ada notifikasi tertunda. Pesan baru akan muncul secara otomatis di sini.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`group relative p-3.5 hover:bg-[#fbfcfd] dark:hover:bg-neutral-800/40 transition flex items-start gap-3 cursor-pointer ${
                    !item.read ? "bg-[#f4f9fb] dark:bg-neutral-800/20" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-neutral-800 border border-[#e4ebef] dark:border-neutral-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
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
                        onClick={() => {
                          markAsRead(item.id);
                          setOpen(false);
                        }}
                        className="inline-block mt-1.5 text-[11px] font-bold text-[#327691] hover:underline"
                      >
                        Lihat Rincian →
                      </Link>
                    )}
                  </div>

                  {/* Action buttons (Tandai Dibaca & Hapus Notifikasi) */}
                  <div className="absolute right-3 top-3 flex items-center gap-1">
                    {!item.read && (
                      <button
                        type="button"
                        onClick={(e) => markAsRead(item.id, e)}
                        className="p-1 rounded-md text-neutral-400 hover:text-[#327691] hover:bg-[#e9f3f7] dark:hover:bg-neutral-700 transition"
                        title="Tandai sudah dibaca"
                      >
                        <Check size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => deleteNotification(item.id, e)}
                      className="p-1 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                      title="Hapus notifikasi ini"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
