"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { CartProvider } from "@/lib/cart/context";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { LanguageSelector } from "@/components/common/LanguageSelector";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPackageDetail = pathname.startsWith("/sewa/");
  const isPortal = pathname.startsWith("/buyer") || pathname.startsWith("/admin") || pathname.startsWith("/owner");

  return (
    <CartProvider>
      {children}
      <CartDrawer />
      {!isPortal && <LanguageSelector aboveBookingBar={isPackageDetail} />}
    </CartProvider>
  );
}
