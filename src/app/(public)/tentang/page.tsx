import { ContentPage } from "@/components/ContentPage";
import { getSiteSettings } from "@/lib/services/settings";
export default async function Page() {
  const s = await getSiteSettings();
  return (
    <ContentPage
      slug="tentang"
      title="Perjalananmu, kami bantu siapkan."
      fallback={`${s.site_name} membantu pemesanan Jeep Trooper untuk perjalanan di ${s.service_area}.

Pilih layanan dan lakukan pembayaran melalui website. Admin kemudian menghubungi penyedia kendaraan di luar sistem dan mengonfirmasi ketersediaan unit kepada pemesan.`}
    />
  );
}
