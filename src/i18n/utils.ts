import sr from "./locales/sr.json";
import en from "./locales/en.json";

const translations = { sr, en } as const;

export type Lang = keyof typeof translations;
export const defaultLang: Lang = "sr";
export const languages = { sr: "Srpski", en: "English" } as const;

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split("/");
  if (lang in translations) return lang as Lang;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: string): string {
    const keys = key.split(".");
    let value: any = translations[lang];
    for (const k of keys) {
      value = value?.[k];
    }
    if (typeof value === "string") return value;
    // Fallback to default language
    value = translations[defaultLang];
    for (const k of keys) {
      value = value?.[k];
    }
    return typeof value === "string" ? value : key;
  };
}

export function getLocalizedPath(path: string, lang: Lang): string {
  // Remove any existing locale prefix
  const cleanPath = path.replace(/^\/(sr|en)/, "");
  return `/${lang}${cleanPath}`;
}

export function getAlternateLang(lang: Lang): Lang {
  return lang === "sr" ? "en" : "sr";
}

/** Map Serbian area slugs to English and vice versa */
export const areaSlugMap: Record<string, string> = {
  // sr -> en
  anksioznost: "anxiety",
  stres: "stress",
  samopouzdanje: "self-confidence",
  "tuga-depresija": "sadness-depression",
  gubici: "grief-loss",
  asertivnost: "assertiveness",
  produktivnost: "productivity",
  "medjuljudski-odnosi": "interpersonal-relationships",
  "partnerski-odnosi": "partner-relationships",
  "bracne-porodicne-krize": "marriage-family-crises",
  roditeljstvo: "parenting",
  "rad-sa-adolescentima": "adolescents",
  lgbtqai: "lgbtqai",
  // en -> sr
  anxiety: "anksioznost",
  stress: "stres",
  "self-confidence": "samopouzdanje",
  "sadness-depression": "tuga-depresija",
  "grief-loss": "gubici",
  assertiveness: "asertivnost",
  productivity: "produktivnost",
  "interpersonal-relationships": "medjuljudski-odnosi",
  "partner-relationships": "partnerski-odnosi",
  "marriage-family-crises": "bracne-porodicne-krize",
  parenting: "roditeljstvo",
  adolescents: "rad-sa-adolescentima",
};
