"use client";

import React, { createContext, useContext, useSyncExternalStore, useEffect } from "react";
import { Language, languages, translations, LanguageOption } from "./translations";

interface LanguageContextType {
  language: Language;
  currentLanguage: LanguageOption;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  allLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
const defaultLanguage = () => "id" as const;
const dictionaries: Record<Language, Record<string, string>> = translations;

function savedLanguage(): Language {
  const saved = localStorage.getItem("app_lang");
  return languages.find(({ code }) => code === saved)?.code ?? "id";
}

function subscribeLanguage(update: () => void) {
  window.addEventListener("storage", update);
  window.addEventListener("app-language-change", update);
  return () => {
    window.removeEventListener("storage", update);
    window.removeEventListener("app-language-change", update);
  };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribeLanguage, savedLanguage, defaultLanguage);
  useEffect(() => { document.documentElement.lang = language; }, [language]);

  const setLanguage = (lang: Language) => {
    localStorage.setItem("app_lang", lang);
    window.dispatchEvent(new Event("app-language-change"));
  };

  const currentLanguage =
    languages.find((l) => l.code === language) || languages[languages.length - 1];

  const t = (key: string, fallback?: string): string => {
    return dictionaries[language][key] || dictionaries.id[key] || fallback || key;
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
      t: (key: string, fallback?: string) => dictionaries.id[key] || fallback || key,
      allLanguages: languages,
    };
  }
  return context;
}
