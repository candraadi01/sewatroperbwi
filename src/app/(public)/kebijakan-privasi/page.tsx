import { ContentPage } from "@/components/ContentPage";
import { getBusinessSettings } from "@/lib/services/business";
export default async function Page() {
  const b = await getBusinessSettings();
  return (
    <ContentPage
      useCms={false}
      slug="kebijakan-privasi"
      title="Kebijakan privasi"
      fallback={
        b.privacy_policy ||
        "Ketentuan sedang disiapkan pengelola. Hubungi admin sebelum melakukan pembayaran."
      }
    />
  );
}
