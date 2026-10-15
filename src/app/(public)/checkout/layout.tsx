export const metadata = { robots: { index: false, follow: false } };
import { requireBuyer } from "@/lib/auth/helpers";
export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireBuyer("/checkout");
  return children;
}
