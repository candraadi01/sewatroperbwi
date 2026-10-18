"use client";

import React from "react";
import { LanguageProvider } from "@/lib/i18n/context";
import { CartProvider } from "@/lib/cart/context";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { LanguageSelector } from "@/components/common/LanguageSelector";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <CartProvider>
        {children}
        <CartDrawer />
        <LanguageSelector />
      </CartProvider>
    </LanguageProvider>
  );
}
