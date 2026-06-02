import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";

export const supportedLocales = ["en"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

type TranslationKey = "common.appName" | "common.signIn" | "common.signingIn" | "common.dashboard";

const translations: Record<SupportedLocale, Record<TranslationKey, string>> = {
  en: {
    "common.appName": "Myra AI",
    "common.signIn": "Sign in",
    "common.signingIn": "Signing in...",
    "common.dashboard": "Dashboard"
  }
};

type I18nContextValue = {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function detectLocale(): SupportedLocale {
  const stored = localStorage.getItem("myra-locale");
  if (supportedLocales.includes(stored as SupportedLocale)) return stored as SupportedLocale;

  const browserLocale = navigator.language.split("-")[0];
  if (supportedLocales.includes(browserLocale as SupportedLocale)) return browserLocale as SupportedLocale;

  return "en";
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => detectLocale());

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: (nextLocale) => {
        localStorage.setItem("myra-locale", nextLocale);
        setLocaleState(nextLocale);
      },
      t: (key) => translations[locale][key] ?? translations.en[key] ?? key
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
