import { requireAdmin } from '@/lib/auth/helpers';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

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
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar user={user} />
      <div className="flex-1 lg:ml-64">
        <main className="p-4 md:p-6 lg:p-8 max-w-[1400px]">
          {children}
        </main>
      </div>
    </div>
  );
}
