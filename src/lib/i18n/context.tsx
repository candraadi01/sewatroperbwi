"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, languages, translations, LanguageOption } from "./translations";

interface LanguageContextType {
  language: Language;
  currentLanguage: LanguageOption;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.id) => string;
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

  const t = (key: keyof typeof translations.id): string => {
    const currentDict = translations[language] || translations.id;
    return (currentDict as Record<string, string>)[key] || translations.id[key] || key;
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
      t: (key: keyof typeof translations.id) => translations.id[key] || key,
      allLanguages: languages,
    };
  }
  return context;
}
