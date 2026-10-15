import { ContentPage } from "@/components/ContentPage";
import { getBusinessSettings } from "@/lib/services/business";
export default async function Page() {
  const b = await getBusinessSettings();
  return (
    <ContentPage
      useCms={false}
      slug="syarat-ketentuan"
      title="Syarat & ketentuan"
      fallback={
        b.terms_and_conditions ||
        "Ketentuan sedang disiapkan pengelola. Hubungi admin sebelum melakukan pembayaran."
      }
    />
  );
}
