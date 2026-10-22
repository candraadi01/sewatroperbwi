import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/helpers";

export const metadata = {
  title: "Mengarahkan Profil... | Sewa Trooper Banyuwangi",
  robots: { index: false, follow: false },
};

/**
 * Endpoint redirect cerdas untuk /akun/profil.
 * Mengarahkan user sesuai role agar tidak terjadi layout stacking/glitch:
 * - Admin -> /admin/pengaturan
 * - Owner -> /owner/profil
 * - Buyer / User -> /buyer/profil
 * - Tamu -> /auth/login?redirectTo=/buyer/profil
 */
export default async function ProfilRedirectPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/auth/login?redirectTo=%2Fbuyer%2Fprofil");
  }

  if (user.roles.includes("admin")) {
    redirect("/admin/pengaturan");
  }

  if (user.roles.includes("owner")) {
    redirect("/owner/profil");
  }

  redirect("/buyer/profil");
}
