"use client";

import { useCart } from "@/lib/cart/context";
import { useLanguage } from "@/lib/i18n/context";
import { X, Trash2, Plus, Minus, Car, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CartDrawer() {
  const { items, removeItem, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } =
    useCart();
  const { t } = useLanguage();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsCartOpen(false);
    }
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#0ea5e9]/10 text-[#0ea5e9] flex items-center justify-center">
              <Car size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 text-base">{t("cart_title")}</h3>
              <p className="text-xs text-neutral-500">
                {items.length} {t("cart_item_label")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 rounded-full transition"
            aria-label="Tutup keranjang"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-[#0ea5e9]">
                <Car size={32} strokeWidth={2} />
              </div>
              <h4 className="font-bold text-neutral-800 text-sm">
                {t("nav_cart_empty")}
              </h4>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                {t("cart_empty_desc")}
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-xs font-semibold rounded-lg transition shadow-sm"
              >
                {t("cart_empty_btn")}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3.5 p-3 rounded-xl border border-neutral-200 bg-white hover:border-[#0ea5e9]/40 transition shadow-xs"
              >
                {/* Image */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-neutral-100">
                  <Image
                    src={item.image || "/images/landing/hero-bg.jpg"}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">
                        {item.title}
                      </h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-neutral-400 hover:text-red-500 p-1 transition shrink-0"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {item.duration && (
                      <p className="text-[11px] text-neutral-500 mt-0.5">{item.duration}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
                    <span className="text-xs font-extrabold text-[#0ea5e9]">
                      {formatIDR(item.price * item.quantity)}
                    </span>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1.5 bg-neutral-100 rounded-md p-0.5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center rounded bg-white text-neutral-600 hover:bg-neutral-200 text-xs shadow-xs transition"
                        aria-label="Kurangi"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-xs font-semibold text-neutral-800 w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center rounded bg-white text-neutral-600 hover:bg-neutral-200 text-xs shadow-xs transition"
                        aria-label="Tambah"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-neutral-200 bg-neutral-50/70 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600 font-medium">{t("cart_total")}</span>
              <span className="text-base font-extrabold text-neutral-900">
                {formatIDR(totalPrice)}
              </span>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0ea5e9] hover:bg-[#0284c7] text-white text-sm font-bold rounded-xl transition shadow-md shadow-[#0ea5e9]/20"
            >
              <span>{t("cart_checkout")}</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
