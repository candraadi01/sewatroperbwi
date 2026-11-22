"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { ChevronUp, ChevronDown } from "lucide-react";
import { FlagIcon } from "./FlagIcon";

export function LanguageSelector({ inline = false, aboveBookingBar = false }: { inline?: boolean; aboveBookingBar?: boolean }) {
  const { currentLanguage, setLanguage, allLanguages } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${inline ? "relative z-10" : `fixed right-3 z-50 sm:right-5 ${aboveBookingBar ? "bottom-[calc(7rem+env(safe-area-inset-bottom))] lg:bottom-9" : "bottom-[calc(1.85rem+env(safe-area-inset-bottom))]"}`} select-none font-sans`}
    >
      {/* Language Popup Menu (Positioned above button like in Foto 2) */}
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-56 sm:w-60 bg-white rounded-md shadow-2xl border border-neutral-200 py-1 overflow-hidden max-h-80 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
          {allLanguages.map((lang) => {
            const isSelected = lang.code === currentLanguage.code;
            return (
              <button
                type="button"
                key={lang.code}
                lang={lang.code}
                aria-pressed={isSelected}
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-xs transition ${
                  isSelected
                    ? "bg-[#e9f3f7] text-[#327691] font-bold"
                    : "text-[#53636d] hover:bg-[#f4f9fb] font-medium"
                }`}
              >
                <FlagIcon code={lang.code} className="w-6 h-4" />
                <span className="truncate flex-1 text-[13px]">{lang.name}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#327691] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Floating Toggle Button (Foto 2: Indonesian flag + ID + chevron) */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex min-h-11 items-center gap-2 bg-white hover:bg-neutral-50 text-neutral-800 px-3 py-2 rounded-md shadow-lg border border-neutral-300 transition-colors"
        aria-label="Pilih Bahasa / Select Language"
        aria-expanded={open}
      >
        <FlagIcon code={currentLanguage.code} className="w-6 h-4" />
        <span className="text-xs font-bold text-neutral-900 tracking-wide">
          {currentLanguage.shortCode}
        </span>
        {open ? (
          <ChevronUp size={14} className="text-neutral-600" />
        ) : (
          <ChevronDown size={14} className="text-neutral-600" />
        )}
      </button>
    </div>
  );
}
