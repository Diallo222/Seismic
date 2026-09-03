import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import ar from "./locales/ar.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", short: "EN", label: "English", dir: "ltr" },
  { code: "fr", short: "FR", label: "Français", dir: "ltr" },
  { code: "es", short: "ES", label: "Español", dir: "ltr" },
  { code: "ar", short: "AR", label: "العربية", dir: "rtl" },
] as const;

function baseLng(lng: string): string {
  return lng.split("-")[0]?.toLowerCase() ?? lng;
}

function dirFor(lng: string): "ltr" | "rtl" {
  return SUPPORTED_LANGUAGES.find((l) => l.code === baseLng(lng))?.dir ?? "ltr";
}

function applyDocumentDirection(lng: string) {
  if (typeof document === "undefined") return;
  const base = baseLng(lng);
  document.documentElement.lang = base;
  document.documentElement.dir = dirFor(base);
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: en },
      fr: { common: fr },
      es: { common: es },
      ar: { common: ar },
    },
    ns: ["common"],
    defaultNS: "common",
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "seismic-lang",
    },
    interpolation: { escapeValue: false },
  })
  .then(() => applyDocumentDirection(i18n.resolvedLanguage ?? i18n.language));

i18n.on("languageChanged", applyDocumentDirection);

export default i18n;
