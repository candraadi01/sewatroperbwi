import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getAuthUser } from "@/lib/auth/helpers";
import { getSiteSettings } from "@/lib/services/settings";
import { getHeaderMenu } from "@/lib/services/content";
import { AppProviders } from "@/components/providers/AppProviders";

async function SiteHeader() {
  const [u, settings, links] = await Promise.all([
    getAuthUser(),
    getSiteSettings(),
    getHeaderMenu(),
  ]);
  return (
    <Header
      settings={settings}
      links={links}
      user={
        u
          ? {
              fullName: u.fullName,
              avatarUrl: u.avatarUrl,
              isAdmin: u.roles.includes("admin"),
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
