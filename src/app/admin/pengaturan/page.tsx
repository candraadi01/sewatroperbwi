import Link from "next/link";
import { ResourcePage } from "@/components/admin/ResourcePage";
export default function SettingsPage() {
  return (
    <>
      <nav className="flex flex-wrap gap-4 mb-8 text-sm underline">
        <Link href="/admin/bisnis">Atur DP & ketentuan bisnis</Link>
        <Link href="/admin/tampilan">Bagian beranda</Link>
        <Link href="/admin/menu">Navigasi</Link>
      </nav>
      <ResourcePage name="site" />
    </>
  );
}
