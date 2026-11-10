import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getAuthUser } from "@/lib/auth/helpers";
import { getSiteSettings } from "@/lib/services/settings";
import { getHeaderMenu, getContent } from "@/lib/services/content";
import { AppProviders } from "@/components/providers/AppProviders";

async function SiteHeader() {
  const [u, settings, links, articles] = await Promise.all([
    getAuthUser(),
    getSiteSettings(),
    getHeaderMenu(),
    getContent("articles"),
  ]);
  return (
    <Header
      settings={settings}
      links={links}
      articles={articles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        category_name: a.category_name,
      }))}
      user={
        u
          ? {
              fullName: u.fullName,
              email: u.email,
              avatarUrl: u.avatarUrl,
              isAdmin: u.roles.includes("admin"),
              isOwner: u.roles.includes("owner"),
              roles: u.roles,
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
