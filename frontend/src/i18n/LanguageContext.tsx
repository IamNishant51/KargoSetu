"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

type Language = "en" | "hi" | "bn" | "mr" | "ta" | "te" | "gu";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LANG_KEY = "kargosetu_lang";
const SUPPORTED: Language[] = ["en", "hi", "bn", "mr", "ta", "te", "gu"];

function isLanguage(v: unknown): v is Language {
  return typeof v === "string" && (SUPPORTED as string[]).includes(v);
}

/**
 * Read once, synchronously, during the very first render.
 * There is no separate "restore" effect, so no later effect can ever
 * clobber the stored value with a stale default — the race that used to
 * reset the desk to English on every reload is structurally impossible.
 */
function readStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  try {
    const saved = window.localStorage.getItem(LANG_KEY);
    return isLanguage(saved) ? saved : "en";
  } catch {
    return "en";
  }
}

const defaultContext: LanguageContextType = {
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // Single effect per language: persist choice, tag <html lang> for
  // screen readers, then load the dictionary. One writer, no races.
  useEffect(() => {
    let alive = true;
    try {
      window.localStorage.setItem(LANG_KEY, language);
    } catch {
      // storage blocked — in-memory language still applies this session
    }
    try {
      document.documentElement.lang = language;
    } catch {
      // non-DOM environment — harmless
    }
    import(`./translations/${language}.json`)
      .then((module) => {
        if (alive) setTranslations(module.default ?? {});
      })
      .catch(() => {
        if (alive) setTranslations({});
      });
    return () => {
      alive = false;
    };
  }, [language]);

  // A language switch in one tab follows you to every other open tab.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LANG_KEY && isLanguage(e.newValue)) {
        setLanguageState(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    if (isLanguage(lang)) setLanguageState(lang);
  }, []);

  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
