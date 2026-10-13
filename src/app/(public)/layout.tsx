import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getAuthUser } from '@/lib/auth/helpers';

async function HeaderWithAuth() {
  const user = await getAuthUser();
  return (
    <Header
      user={
        user
          ? {
              fullName: user.fullName,
              avatarUrl: user.avatarUrl,
              isAdmin: user.roles.includes('admin'),
            }
          : null
      }
    />
  );
}

/**
 * Layout untuk halaman publik (buyer-facing).
 * Header (streaming user session) + main content + Footer.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<Header user={null} />}>
        <HeaderWithAuth />
      </Suspense>
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
