"use client";

import React from "react";
import { CartProvider } from "@/lib/cart/context";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { LanguageSelector } from "@/components/common/LanguageSelector";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
      <LanguageSelector />
    </CartProvider>
  );
}
