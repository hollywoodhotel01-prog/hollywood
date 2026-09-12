"use client";

import { createContext, useContext, ReactNode } from "react";
import { Locale } from "@/dictionaries";

interface LanguageContextType {
  lang: Locale;
  dict: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  lang,
  dict,
}: {
  children: ReactNode;
  lang: Locale;
  dict: any;
}) {
  return (
    <LanguageContext.Provider value={{ lang, dict }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
