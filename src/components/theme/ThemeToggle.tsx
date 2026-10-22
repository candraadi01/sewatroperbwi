"use client";

import { usePortalTheme } from "./PortalThemeContext";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = usePortalTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`flex items-center justify-between gap-3 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs ${
        isDark
          ? "bg-[#1f2d36] text-sky-200 hover:bg-[#283b46] border border-[#2e4350]"
          : "bg-white text-[#53636d] hover:text-[#263b46] hover:bg-[#f4f9fb] border border-[#dce6eb]"
      } ${className}`}
      title={isDark ? "Klik untuk mengaktifkan Mode Terang" : "Klik untuk mengaktifkan Mode Gelap"}
      aria-label="Toggle tema gelap atau terang"
    >
      <div className="flex items-center gap-1.5">
        {isDark ? (
          <Moon size={15} className="text-sky-300 shrink-0" />
        ) : (
          <Sun size={15} className="text-amber-500 shrink-0" />
        )}
        <span className="select-none">{isDark ? "Mode Gelap" : "Mode Terang"}</span>
      </div>

      <span
        className={`w-7 h-4 rounded-full p-0.5 transition-colors flex items-center ${
          isDark ? "bg-[#327691] justify-end" : "bg-neutral-300 justify-start"
        }`}
      >
        <span className="w-3 h-3 rounded-full bg-white shadow-xs" />
      </span>
    </button>
  );
}
