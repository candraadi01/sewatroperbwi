"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { ChevronUp, ChevronDown } from "lucide-react";
import { FlagIcon } from "./FlagIcon";

export function LanguageSelector() {
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-50 select-none font-sans"
    >
      {/* Language Popup Menu (Positioned above button like in Foto 2) */}
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-56 sm:w-60 bg-white rounded-md shadow-2xl border border-neutral-200 py-1 overflow-hidden max-h-80 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
          {allLanguages.map((lang) => {
            const isSelected = lang.code === currentLanguage.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-xs transition ${
                  isSelected
                    ? "bg-[#0ea5e9]/10 text-[#0284c7] font-bold"
                    : "text-neutral-700 hover:bg-neutral-100 font-medium"
                }`}
              >
                <FlagIcon code={lang.code} className="w-6 h-4" />
                <span className="truncate flex-1 text-[13px]">{lang.name}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Floating Toggle Button (Foto 2: Indonesian flag + ID + chevron) */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white hover:bg-neutral-50 text-neutral-800 px-3.5 py-2 rounded-md shadow-lg border border-neutral-300 transition-all hover:scale-105 active:scale-95"
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
