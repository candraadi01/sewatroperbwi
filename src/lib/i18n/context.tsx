"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, languages, translations, LanguageOption } from "./translations";

interface LanguageContextType {
  language: Language;
  currentLanguage: LanguageOption;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  allLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("id");

  useEffect(() => {
    const saved = localStorage.getItem("app_lang") as Language;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app_lang", lang);
  };

  const currentLanguage =
    languages.find((l) => l.code === language) || languages[languages.length - 1];

  const t = (key: string, fallback?: string): string => {
    const currentDict = (translations as any)[language] || translations.id;
    return currentDict?.[key] || (translations.id as any)?.[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        currentLanguage,
        setLanguage,
        t,
        allLanguages: languages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // fallback if used outside provider
    return {
      language: "id" as Language,
      currentLanguage: languages[languages.length - 1],
      setLanguage: () => {},
      t: (key: string, fallback?: string) => (translations.id as any)?.[key] || fallback || key,
      allLanguages: languages,
    };
  }
  return context;
}
