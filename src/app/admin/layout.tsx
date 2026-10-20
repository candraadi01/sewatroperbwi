export const metadata = { robots: { index: false, follow: false } };
import { requireAdmin } from "@/lib/auth/helpers";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

/**
 * Admin layout.
 * Terlindungi di server — requireAdmin() redirect jika bukan admin.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      <AdminSidebar user={user} />
      <div className="flex-1 min-w-0 pt-14 lg:pt-0 lg:ml-64">
        <main className="p-4 md:p-6 lg:p-8 max-w-[1400px]">{children}</main>
      </div>
    </div>
  );
}
