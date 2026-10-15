import { ContentPage } from "@/components/ContentPage";
import { getBusinessSettings } from "@/lib/services/business";
export default async function Page() {
  const b = await getBusinessSettings();
  return (
    <ContentPage
      useCms={false}
      slug="kebijakan-pembatalan"
      title="Pembatalan & pengembalian dana"
      fallback={
        [b.cancellation_policy, b.refund_policy].filter(Boolean).join("\n\n") ||
        "Ketentuan sedang disiapkan pengelola. Hubungi admin sebelum melakukan pembayaran."
      }
    />
  );
}
