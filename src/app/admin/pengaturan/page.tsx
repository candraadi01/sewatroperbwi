import Link from "next/link";
import { ResourcePage } from "@/components/admin/ResourcePage";
import {
  Settings,
  FileText,
  Tag,
  MapPin,
  Calendar,
  Layers,
  HelpCircle,
  Layout,
  Menu as MenuIcon,
  MessageSquare,
  Compass,
  Newspaper,
} from "lucide-react";

export default function SettingsPage() {
  const settingsCategories = [
    {
      label: "Usaha & Tentang",
      href: "/admin/pengaturan",
      icon: Settings,
      active: true,
      description: "Nama usaha, profil tentang kami, WhatsApp & kontak",
    },
    {
      label: "Testimoni Pelanggan",
      href: "/admin/testimoni",
      icon: MessageSquare,
      active: false,
      description: "Ulasan dan rating pelanggan di beranda",
    },
    {
      label: "Destinasi Wisata",
      href: "/admin/destinasi",
      icon: Compass,
      active: false,
      description: "Objek wisata Ijen, Baluran, Sukamade, dll",
    },
    {
      label: "Artikel Wisata",
      href: "/admin/artikel",
      icon: Newspaper,
      active: false,
      description: "Tips, cerita & panduan liburan Banyuwangi",
    },
    {
      label: "Ketentuan Bisnis & DP",
      href: "/admin/bisnis",
      icon: FileText,
      active: false,
      description: "Persentase DP, pelunasan & aturan sewa",
    },
    {
      label: "Kode Promo",
      href: "/admin/promo",
      icon: Tag,
      active: false,
      description: "Voucher diskon dan kuota pemakaian",
    },
    {
      label: "Area Penjemputan",
      href: "/admin/penjemputan",
      icon: MapPin,
      active: false,
      description: "Zona pickup & biaya tambahan trip",
    },
    {
      label: "Kalender & Kuota",
      href: "/admin/kalender",
      icon: Calendar,
      active: false,
      description: "Tanggal ditutup & batas kuota harian",
    },
    {
      label: "Kategori Layanan",
      href: "/admin/kategori",
      icon: Layers,
      active: false,
      description: "Kategori katalog paket wisata",
    },
    {
      label: "Kelola FAQ",
      href: "/admin/faq",
      icon: HelpCircle,
      active: false,
      description: "Tanya jawab bantuan pelanggan",
    },
    {
      label: "Seksi Beranda",
      href: "/admin/tampilan",
      icon: Layout,
      active: false,
      description: "Tata letak konten tambahan landing page",
    },
    {
      label: "Navigasi Menu",
      href: "/admin/menu",
      icon: MenuIcon,
      active: false,
      description: "Tautan header dan footer web",
    },
  ];

  return (
    <div className="space-y-7 font-sans">
      {/* Header Hub Pengaturan Terpusat */}
      <div className="pb-4 border-b border-[#e4ebef]">
        <span className="text-xs font-bold text-[#327691] tracking-wider uppercase">
          Pusat Konfigurasi Sistem
        </span>
        <h1 className="heading-1 mt-1">Pengaturan Aplikasi & Usaha</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Kelola seluruh konfigurasi usaha, aturan finansial, promo, area, dan navigasi dalam satu halaman terpusat.
        </p>
      </div>

      {/* Grid Tabs Kategori Pengaturan */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
        {settingsCategories.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className={`p-3 rounded-2xl border transition flex flex-col justify-between ${
              cat.active
                ? "bg-[#327691] text-white border-[#327691] shadow-xs"
                : "bg-white text-[#263b46] border-[#e4ebef] hover:border-[#327691]/50 hover:bg-[#f8fafc]"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  cat.active ? "bg-white/20 text-white" : "bg-[#e9f3f7] text-[#327691]"
                }`}
              >
                <cat.icon size={15} />
              </div>
              <span className="text-xs font-bold leading-tight truncate">
                {cat.label}
              </span>
            </div>
            <p
              className={`text-[10px] leading-tight line-clamp-1 ${
                cat.active ? "text-white/80" : "text-[#7b8a94]"
              }`}
            >
              {cat.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Resource Editor Form */}
      <div className="pt-2">
        <ResourcePage name="site" />
      </div>
    </div>
  );
}
