# Catatan perbaikan 15 Oktober 2026

Kode berasal dari `candraadi01/sewatroperbwi`, basis commit `e7a49a9`, branch lokal `fix/admin-security-and-buyer-experience`.

## Masalah yang ditemukan

- Katalog memakai array contoh; produk dan pengaturan admin belum menyimpan perubahan.
- Dashboard menampilkan angka placeholder dan banyak menu menuju halaman yang belum dibuat.
- Pesanan disimpan pada Map dalam memori proses; tidak dapat diandalkan setelah restart atau pada instance serverless lain.
- Checkout tidak mewajibkan login. Simulasi pembayaran dan webhook tanpa signature membuka kemungkinan pembayaran palsu; pembayaran juga mencampur status kendaraan.
- Detail pesanan belum membatasi akses pemilik akun. RLS profil dan beberapa operasi buyer terlalu longgar.
- Beberapa halaman informasi 404, pencarian header tidak bekerja, dan utility layout yang digunakan belum didefinisikan.

## Hasil perubahan

Admin menggunakan Supabase untuk produk/tarif, promo, jadwal/kuota, penjemputan, konten, navigasi, serta pengaturan. Dashboard membaca hitungan aktual. Pesanan memiliki tindakan konfirmasi kendaraan, mulai/selesai trip, dan pembatalan dengan aturan transisi database.

Booking dan tagihan disimpan secara atomik dengan idempotency key. Harga dihitung server, DP/lunas dan pelunasan menggunakan invoice Midtrans nyata. Jika gateway gagal, tidak ada fallback pembayaran simulasi. Webhook wajib memakai signature dan status provider yang diperiksa ulang; ledger mencegah kredit berulang. Status pembayaran diterima tidak mengonfirmasi kendaraan.

Akses pesanan dibatasi akun/RLS. Admin tidak dapat mengubah nominal terbayar melalui form atau update langsung booking. Catatan internal dipisahkan dari baris pesanan buyer. Role admin harus ditetapkan melalui prosedur pemilik database.

Beranda, katalog, detail, checkout, dan detail pesanan dirapikan untuk mobile. Foto dioptimalkan dengan Next Image dan memiliki label/lisensi ilustrasi. Kontak contoh dihapus; admin harus memasukkan kontak usaha sendiri. Artikel, tentang, kebijakan pembatalan, dan akun/pesanan mempunyai halaman yang tersedia.

## Verifikasi yang selesai

- `npm test`: 21 pemeriksaan lulus, termasuk migrasi 001–005 pada PGlite, RLS, penyimpanan admin, versi kebijakan, booking retry, DP/pelunasan, pembayaran duplikat, kuota, dan pembayaran setelah pembatalan.
- `npm run lint`, `npm run typecheck`, `npm run build`: lulus.
- Chromium lokal pada viewport 1440×1000 dan 390×844: beranda, pencarian katalog, serta detail paket tidak mengalami overflow horizontal; menu mobile dan perhitungan harga berjalan; tidak ada JavaScript page error pada skenario yang dijalankan.
- Rute artikel/tentang/pembatalan/FAQ/kontak/ketentuan/privasi tersedia; akses admin, checkout, akun pesanan dan detail pesanan tanpa sesi diarahkan ke login.
- API checkout/admin/pembayaran menolak permintaan tanpa login. Webhook tanpa konfigurasi mengembalikan kegagalan layanan, bukan sukses simulasi. Quote contoh dua unit dengan jemput tambahan dihitung Rp1.250.000 dan tetap tidak boleh dibayar.
- `npm audit --omit=dev`: tidak melaporkan kerentanan dependency produksi pada waktu pemeriksaan. Ini bukan jaminan keamanan seluruh aplikasi.

## Yang belum diverifikasi/diimplementasikan

Belum ada akses terautentikasi ke project Supabase/Vercel/Midtrans/Cloudinary pemilik. Login admin aktual, operasi lewat UI dengan sesi nyata, upload provider, callback publik, pembayaran sandbox dan transaksi produksi belum diverifikasi. Tes provider memakai respons tiruan; tes browser publik memakai mode tanpa environment Supabase.

Eksekusi refund, reschedule, PDF invoice, worker notifikasi eksternal, cron kedaluwarsa, serta integrasi homestay/open trip belum diimplementasikan. Pembayaran yang terlambat masuk setelah pembatalan perlu peninjauan/refund; jangan menganggap penutupan booking membatalkan invoice provider. Daftar pesanan/admin resource/laporan memiliki batas pengambilan yang dijelaskan pada UI dan README.

Belum ada deployment atau migrasi ke produksi. Push ke GitHub belum berhasil karena sesi tidak mempunyai kredensial tulis. Paket kode tidak berisi kunci provider, node_modules, atau .next. Ikuti README untuk migrasi 004–005, bootstrap admin, konfigurasi, dan pengujian preview sebelum produksi.
