"use client";

import { useLanguage } from "@/lib/i18n/context";

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
    <div className="bg-white border-b border-[#e4ebef] select-none">
      <div className="container-app flex items-center h-10 md:h-11 gap-2 md:gap-3 overflow-hidden">
        {/* Fixed Title Label */}
        <div className="flex items-center shrink-0 pr-2 md:pr-3 z-10 bg-white">
          <span className="text-[11px] sm:text-xs md:text-[13px] font-black text-[#327691] tracking-wider uppercase whitespace-nowrap">
            {t("ticker_label")}
          </span>
        </div>

        {/* Ticker Content with Left/Right Soft Fade Mask */}
        <div className="ticker-fade-mask flex-1 overflow-hidden h-full flex items-center">
          <div className="news-ticker-track flex items-center">
            {[...items, ...items, ...items, ...items].map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2.5 px-6 text-xs md:text-[13px] text-[#263b46] font-medium shrink-0"
              >
                <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] bg-[#327691] text-white text-[10.5px] font-bold tracking-wider uppercase shadow-2xs">
                  {item.tag}
                </span>
                <span className="text-[#263b46]">{item.text}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
