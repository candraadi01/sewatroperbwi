export const metadata = { robots: { index: false, follow: false } };
import { requireOwner } from "@/lib/auth/helpers";
import { OwnerSidebar } from "@/components/layout/OwnerSidebar";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOwner("/owner");

  return (
    <div className="flex min-h-screen bg-neutral-50 font-sans">
      <OwnerSidebar user={user} />
      <div className="flex-1 min-w-0 pt-14 lg:pt-0 lg:ml-64">
        <main className="p-4 md:p-6 lg:p-8 max-w-[1400px]">{children}</main>
      </div>
    </div>
  );
}
