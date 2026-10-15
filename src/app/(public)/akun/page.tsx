import Link from "next/link";
import { requireBuyer } from "@/lib/auth/helpers";
export default async function Account() {
  const u = await requireBuyer("/akun");
  return (
    <div className="container-app py-12 max-w-3xl">
      <p className="eyebrow">Akun pemesan</p>
      <h1 className="section-heading mt-3">
        Halo, {u.fullName || "teman perjalanan"}.
      </h1>
      <div className="admin-panel mt-7">
        <p className="text-sm text-neutral-500">Email akun</p>
        <p className="mt-2 break-words">{u.email}</p>
        <Link href="/akun/pesanan" className="action-link mt-6">
          Lihat Pesanan Saya →
        </Link>
        {u.roles.includes("admin") && (
          <Link href="/admin" className="action-link-secondary ml-3 mt-3">
            Buka admin
          </Link>
        )}
      </div>
    </div>
  );
}
