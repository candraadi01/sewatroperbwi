"use client";

import { useLanguage } from "@/lib/i18n/context";
import { Megaphone } from "lucide-react";

export function NewsTicker() {
  const { t } = useLanguage();

  const items = [
    {
      tag: "PENTING",
      text: t("ticker_item_1"),
    },
    {
      tag: "PROMO",
      text: t("ticker_item_2"),
    },
    {
      tag: "INFO",
      text: t("ticker_item_3"),
    },
  ];

  return (
    <div className="w-full bg-transparent border-b border-white/20 select-none">
      <div className="container-app flex items-center h-8 sm:h-9 md:h-10 gap-1.5 sm:gap-2 md:gap-3 overflow-hidden px-3 sm:px-4">
        {/* Fixed Title Label — Putih Bersih & Ringkas di Mobile (INFO), Lengkap di Desktop */}
        <div className="flex items-center shrink-0 pr-1.5 sm:pr-2.5 z-10 bg-transparent">
          <span className="hidden sm:inline text-xs md:text-[13px] font-black text-white tracking-wider uppercase whitespace-nowrap drop-shadow-md">
            {t("ticker_label")}
          </span>
          <span className="sm:hidden inline-flex items-center gap-1 text-[10.5px] font-black text-white tracking-wider uppercase whitespace-nowrap drop-shadow-md">
            <Megaphone size={11} className="text-white" />
            <span>INFO</span>
          </span>
        </div>

        {/* Ticker Content with Left/Right Soft Fade Mask */}
        <div className="ticker-fade-mask flex-1 overflow-hidden h-full flex items-center">
          <div className="news-ticker-track flex items-center">
            {[...items, ...items, ...items, ...items].map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 text-[11px] sm:text-xs md:text-[13px] text-white font-medium shrink-0 drop-shadow-sm"
              >
                {/* Badge Tag Seragam Warna Merah Tegas & Proporsional di Mobile */}
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] bg-red-600 text-white text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shadow-xs">
                  {item.tag}
                </span>
                <span className="text-white drop-shadow-sm">{item.text}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
