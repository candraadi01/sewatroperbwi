import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getAuthUser } from "@/lib/auth/helpers";
import { AppProviders } from "@/components/providers/AppProviders";

async function SiteHeader() {
  const u = await getAuthUser().catch(() => null);
  return (
    <Header
      user={
        u
          ? {
              fullName: u.fullName,
              email: u.email,
              isAdmin: u.roles.includes("admin"),
              isOwner: u.roles.includes("owner"),
            }
          : null
      }
    />
  );
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <Suspense fallback={<Header />}>
        <SiteHeader />
      </Suspense>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </AppProviders>
  );
}
