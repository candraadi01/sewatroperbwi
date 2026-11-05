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


/**
 * Konversi angka ke kalimat terbilang bahasa Indonesia.
 * Contoh: 14700000 -> "Empat Belas Juta Tujuh Ratus Ribu"
 */
export function terbilang(n: number): string {
  const bilangan = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];
  n = Math.floor(Math.abs(n));
  if (n === 0) return "Nol";
  if (n < 12) return bilangan[n];
  if (n < 20) return terbilang(n - 10) + " Belas";
  if (n < 100)
    return (
      terbilang(Math.floor(n / 10)) +
      " Puluh" +
      (n % 10 !== 0 ? " " + terbilang(n % 10) : "")
    );
  if (n < 200)
    return "Seratus" + (n % 100 !== 0 ? " " + terbilang(n % 100) : "");
  if (n < 1000)
    return (
      terbilang(Math.floor(n / 100)) +
      " Ratus" +
      (n % 100 !== 0 ? " " + terbilang(n % 100) : "")
    );
  if (n < 2000)
    return "Seribu" + (n % 1000 !== 0 ? " " + terbilang(n % 1000) : "");
  if (n < 1000000)
    return (
      terbilang(Math.floor(n / 1000)) +
      " Ribu" +
      (n % 1000 !== 0 ? " " + terbilang(n % 1000) : "")
    );
  if (n < 1000000000)
    return (
      terbilang(Math.floor(n / 1000000)) +
      " Juta" +
      (n % 1000000 !== 0 ? " " + terbilang(n % 1000000) : "")
    );
  if (n < 1000000000000)
    return (
      terbilang(Math.floor(n / 1000000000)) +
      " Miliar" +
      (n % 1000000000 !== 0 ? " " + terbilang(n % 1000000000) : "")
    );
  return (
    terbilang(Math.floor(n / 1000000000000)) +
    " Triliun" +
    (n % 1000000000000 !== 0 ? " " + terbilang(n % 1000000000000) : "")
  );
}
