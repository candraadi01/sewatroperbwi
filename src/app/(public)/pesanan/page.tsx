import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/helpers";

export const metadata = {
  title: "Mengarahkan Pesanan... | Sewa Trooper Banyuwangi",
  robots: { index: false, follow: false },
};

/**
 * Endpoint redirect cerdas untuk /pesanan.
 * Mengarahkan user sesuai role agar tidak terjadi layout stacking/glitch:
 * - Admin -> /admin/pesanan
 * - Owner -> /owner/transaksi
 * - Buyer / User -> /buyer/pesanan
 * - Tamu -> /auth/login?redirectTo=/buyer/pesanan
 */
export default async function PesananRedirectPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/auth/login?redirectTo=%2Fbuyer%2Fpesanan");
  }

  if (user.roles.includes("admin")) {
    redirect("/admin/pesanan");
  }

  if (user.roles.includes("owner")) {
    redirect("/owner/transaksi");
  }

  redirect("/buyer/pesanan");
}
