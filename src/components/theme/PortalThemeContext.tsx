"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const PortalThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function PortalThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<Theme>("light");

  useEffect(() => {
    try {
      localStorage.removeItem("portal_theme");
    } catch {
      // ignore
    }
    document.documentElement.classList.remove("dark");

    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  const setTheme = () => {};
  const toggleTheme = () => {};

  return (
    <PortalThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <div className={theme === "dark" ? "dark flex flex-col min-h-screen" : "flex flex-col min-h-screen"}>
        {children}
      </div>
    </PortalThemeContext.Provider>
  );
}

export function usePortalTheme() {
  return useContext(PortalThemeContext);
}
