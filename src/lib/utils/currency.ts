/**
 * Format angka sebagai mata uang IDR.
 * Menggunakan integer rupiah (tanpa desimal).
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format angka dengan separator ribuan Indonesia.
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Parse string angka Indonesia ke integer.
 * Menghapus titik separator dan prefix Rp.
 */
export function parseIDR(value: string): number {
  const cleaned = value.replace(/[^\d-]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}
