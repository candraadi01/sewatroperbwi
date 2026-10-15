import { format, formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

/**
 * Format tanggal ke format Indonesia: "13 Oktober 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMMM yyyy", { locale: idLocale });
}

/**
 * Format tanggal singkat: "13 Okt 2026"
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMM yyyy", { locale: idLocale });
}

/**
 * Format tanggal + waktu: "13 Oktober 2026, 08:00 WIB"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMMM yyyy, HH:mm 'WIB'", { locale: idLocale });
}

/**
 * Format waktu saja: "08:00"
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "HH:mm", { locale: idLocale });
}

/**
 * Format relatif: "2 jam yang lalu"
 */
export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: idLocale });
}

/**
 * Format durasi dari menit ke teks: "5 jam" / "8 jam 30 menit"
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins} menit`;
  if (mins === 0) return `${hours} jam`;
  return `${hours} jam ${mins} menit`;
}

/**
 * Dapatkan timezone offset string untuk display.
 */
export function getTimezoneLabel(): string {
  return "WIB";
}

/**
 * Konversi tanggal ke format ISO untuk database (UTC).
 */
export function toUTC(date: Date): string {
  return date.toISOString();
}

/** Booking dates follow the operator timezone, irrespective of browser/server timezone. */
export function getBookingDates(minimumHours: number) {
  const now = new Date();
  return {
    today: now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }),
    initialDate: new Date(
      now.getTime() + Math.max(minimumHours + 12, 36) * 3600000,
    ).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }),
  };
}
