import Link from "next/link";
export default function AccessDenied() {
  return (
    <section className="container-app py-24 max-w-xl">
      <p className="eyebrow">AKSES AKUN</p>
      <h1 className="heading-1 mt-4">Akun ini belum memiliki akses admin.</h1>
      <p className="my-6 text-neutral-600">
        Gunakan akun yang ditunjuk pengelola. Akses buyer tetap tersedia melalui
        halaman pesanan.
      </p>
      <Link className="action-link" href="/akun/pesanan">
        Buka pesanan saya
      </Link>
    </section>
  );
}
