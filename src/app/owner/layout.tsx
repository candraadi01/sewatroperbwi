export const metadata = { robots: { index: false, follow: false } };
import { requireOwner } from "@/lib/auth/helpers";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";
import { PortalNavbar } from "@/components/layout/PortalNavbar";
import { PortalThemeProvider } from "@/components/theme/PortalThemeContext";

/**
 * Owner layout.
 * Terlindungi di server — requireOwner() redirect jika bukan owner.
 * Dilengkapi PortalNavbar dengan notifikasi dan PortalThemeProvider untuk mode gelap/terang.
 */
export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOwner("/owner");

  return (
    <PortalThemeProvider>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-neutral-950 font-sans flex flex-col">
        {/* Top Navbar seperti contoh Foto Homestay */}
        <PortalNavbar user={user} portalType="owner" badgeLabel="Portal Pemilik" />

        {/* Area Kerja: Sidebar di Kiri & Konten di Kanan */}
        <div className="flex-1 flex flex-col md:flex-row w-full">
          <OwnerSidebar user={user} />
          <div className="flex-1 min-w-0 flex flex-col">
            <main className="flex-1 p-5 sm:p-7 md:p-8 lg:p-10 max-w-[1440px] w-full">
              {children}
            </main>
          </div>
        </div>
      </div>
    </PortalThemeProvider>
  );
}
