# Sewa Trooper Banyuwangi

Website penyewaan Jeep Trooper dengan Next.js 16, Supabase, Midtrans, Cloudinary, dan Vercel. Buyer membayar DP/lunas; admin mencari kendaraan melalui penyedia eksternal dan mengonfirmasi unit secara terpisah.

## Menjalankan

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Tanpa konfigurasi Supabase, halaman publik menampilkan katalog ilustrasi. Login, admin, serta pembayaran tetap tertutup. Jika database telah dikonfigurasi tetapi gagal diakses, aplikasi tidak menggantinya dengan data transaksi palsu.

## Database dan akses admin

- Database baru: terapkan `supabase/migrations/001_core_schema.sql` sampai `005_admin_actions.sql` secara berurutan.
- Database existing yang telah memakai 001–003: backup dan uji di staging, kemudian terapkan **hanya 004 dan 005**. Jangan menjalankan ulang seed pada database produksi.
- Migrasi harus dijalankan sebagai pemilik database melalui Supabase SQL Editor atau proses migrasi Supabase. Aplikasi tidak menjalankan migrasi secara otomatis.
- Masuk sekali menggunakan Google/email, lalu tetapkan role admin melalui SQL Editor dengan `supabase/admin-bootstrap.sql` setelah mengganti email contoh. Tidak ada password admin bawaan atau bypass admin.
- Seed paket masih berstatus draft/harga contoh. Admin wajib mengisi tarif, fasilitas, ketentuan, foto, dan menyetujui layanan sebelum mengaktifkannya.

## Konfigurasi Vercel

Masukkan environment melalui pengaturan project Vercel, bukan ke source atau chat:

| Variabel | Penggunaan |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project dan public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Operasi booking dan pembayaran di server saja |
| `MIDTRANS_SERVER_KEY` | Snap dan verifikasi transaksi server |
| `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION` | `false` untuk sandbox, `true` setelah integrasi produksi disetujui |
| `MIDTRANS_MERCHANT_ID` | Opsional, pengikatan merchant tambahan |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Nama cloud untuk delivery gambar |
| `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Upload gambar dari server |
| `NEXT_PUBLIC_SITE_URL` | Origin website yang digunakan |

Rahasia tidak boleh memakai prefix `NEXT_PUBLIC_`. Snap menggunakan halaman redirect resmi sehingga client key/Snap.js tidak dibutuhkan oleh alur pembayaran ini.

Di Supabase Authentication, aktifkan Google/email dan daftarkan URL callback `https://DOMAIN/auth/callback` beserta URL preview yang memang digunakan. Konfigurasi OAuth Google mengikuti project Supabase yang dipakai.

Pada Midtrans, daftarkan:

- Payment Notification URL: `https://DOMAIN/api/webhooks/midtrans`
- Finish/Unfinish Redirect URL: `https://DOMAIN/akun/pesanan`

Terapkan migrasi sebelum mengarahkan traffic ke kode baru, lalu deploy branch ini ke preview Vercel untuk pengujian. Jangan mencampur kunci sandbox dengan mode produksi.

## Mengoperasikan admin

| Menu | Fungsi |
| --- | --- |
| Produk & tarif | Tambah/edit paket, foto, layanan, kapasitas, tarif utama, DP khusus, persetujuan owner, status draft/aktif/arsip |
| Harga khusus | Harga tanggal tertentu dan prioritas aturan; prioritas lebih tinggi dari tarif utama (10) akan mengunggulinya |
| Kalender & kuota | Tutup tanggal atau batasi jumlah unit permintaan; bukan stok kendaraan mitra secara real-time |
| Penjemputan | Zona dan biaya tambahan per kendaraan |
| Promo | Potongan nominal/persen, periode, kuota, batas per buyer |
| Pesanan | Pantau pembayaran, konfirmasi unit, mulai/selesaikan perjalanan, tutup/batalkan pesanan |
| Ketentuan bisnis | DP persen/nominal, tenggat konfirmasi/pelunasan, kebijakan; perubahan membuat versi baru |
| Pengaturan | Nama usaha, kontak, beranda, foto utama, buka/tutup checkout |
| Artikel, FAQ, halaman | Publikasi konten teks; halaman tambahan di `/halaman/slug`, halaman tentang memakai slug `tentang` |
| Tampilan | Bagian informasi tambahan di beranda; pilih `information`, isi JSON `{"text":"Isi bagian"}` |
| Menu | Navigasi header/footer, JSON daftar `label` dan `href` |
| Media, buyer, pembayaran, notifikasi, riwayat, refund | Pembacaan data; status keuangan tidak diedit melalui form biasa |
| Laporan | Ringkasan maksimal 500 entri ledger terakhir; bukan laba atau saldo rekening |

Persen pada database/form memakai basis poin: `3000 = 30%`, `1500 = 15%`. Override DP produk mengungguli default usaha. Untuk peak season, buat harga khusus dengan periode dan prioritas lebih tinggi. Foto JPEG/PNG/WebP maksimal 3 MB diunggah melalui form produk/pengaturan.

Kontak dan legalitas usaha wajib diisi pemilik. Foto bawaan berlabel ilustrasi model, bukan foto armada yang dijamin tersedia.

## Alur pesanan

1. Buyer memilih tanggal, jam WIB, unit, peserta, area jemput, dan promo.
2. Server menghitung ulang harga. Checkout memerlukan akun aktif dan persetujuan ketentuan.
3. Database menyimpan quote, snapshot ketentuan/harga, booking, dan payment attempt dalam transaksi atomik. Kunci idempotensi mencegah booking ganda saat retry.
4. Server membuat tagihan Midtrans. Kegagalan gateway tidak berubah menjadi pembayaran simulasi; pesanan tersimpan untuk tindak lanjut.
5. Webhook memerlukan signature, memeriksa ulang status ke Midtrans, mencocokkan nominal, lalu mengkredit ledger satu kali. Booking menjadi `payment_received`, bukan `confirmed`.
6. Admin menghubungi penyedia di luar website dan mengonfirmasi unit. Buyer dapat melihat status/riwayat atau membayar sisa tagihan melalui Pesanan Saya.

Kuota ditahan ketika booking dibuat, termasuk saat belum dibayar. Pembatalan oleh admin melepas kuota; penutupan pesanan tidak otomatis membatalkan invoice Midtrans yang telah diterbitkan. Pembayaran terlambat pada pesanan yang dibatalkan masuk `refund_pending` untuk ditinjau, bukan mengonfirmasi kendaraan.

## Batas implementasi dan pemeriksaan sebelum produksi

Perbaikan ini belum mengimplementasikan eksekusi refund, reschedule, invoice PDF, worker email/WhatsApp, pelepasan booking lewat cron, atau integrasi homestay/open trip. Menu refund/notifikasi menampilkan data yang ada dan tidak menjalankan provider secara otomatis. Refund yang dilakukan melalui dashboard Midtrans perlu rekonsiliasi; webhook refund tidak menebak nilai refund dari gross amount transaksi awal. DP bukan deposit jaminan kendaraan lepas kunci.

Sesi pengembangan tidak mempunyai kredensial project Supabase, Midtrans, Cloudinary, atau Vercel milik pemilik. Login nyata, role admin aktual, upload Cloudinary, webhook dari internet, dan pembayaran sandbox/produksi **harus diuji di preview dengan konfigurasi pemilik**. Tidak ada perubahan database atau deployment produksi yang dilakukan oleh tes lokal.

Periksa minimal: login buyer/admin, simpan produk dan muat ulang, pastikan perubahan tampil pada buyer, checkout DP dan lunas di sandbox, notifikasi berulang, pelunasan, pembatalan dengan pembayaran terlambat, serta upload foto. Jangan membuka checkout produksi sebelum pemeriksaan ini selesai.

## Verifikasi lokal

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Tes memakai PostgreSQL WebAssembly (PGlite) dengan role/auth fixture untuk menerapkan semua migrasi dan menguji RLS, fungsi admin, versi kebijakan, persistensi booking, idempotensi pembayaran, pelunasan, serta kuota. Pengujian provider memakai respons tiruan terkontrol; tidak memindahkan uang dan tidak membuktikan konfigurasi provider milik owner.

## Referensi dan lisensi foto

- [Midtrans webhook dan signature](https://docs.midtrans.com/docs/https-notification-webhooks)
- [Midtrans Get Transaction Status](https://docs.midtrans.com/reference/get-transaction-status)
- Foto model Trooper: [Sabung.hamster / Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Isuzu_Trooper_3_Pintu,_Denpasar.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). File asli disimpan tanpa pengeditan; browser memotong tampilan sesuai rasio layout.
