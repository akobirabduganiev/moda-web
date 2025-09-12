export type AppLocale = "uz" | "ru" | "en";

const SUPPORTED: AppLocale[] = ["uz", "ru", "en"];

export function normalizeLocale(input?: string | null): AppLocale {
  const raw = (input || "en").toLowerCase();
  // direct match
  if (SUPPORTED.includes(raw as AppLocale)) return raw as AppLocale;
  // derive from language subtag like en-US, ru-RU, uz-Cyrl
  const two = raw.split(/[-_]/)[0];
  if (SUPPORTED.includes(two as AppLocale)) return two as AppLocale;
  // map Cyrillic Uzbek or other aliases if any
  if (raw.startsWith("uz")) return "uz";
  if (raw.startsWith("ru")) return "ru";
  return "en";
}

export function buildAcceptLanguage(preferred?: string | null): string {
  const pref = normalizeLocale(preferred);
  // Create a preference order that always contains all supported languages.
  const ordered: AppLocale[] = [pref, ...SUPPORTED.filter((l) => l !== pref)];
  // Compose standard Accept-Language with q-weights in descending order
  return ordered
    .map((code, idx) => (idx === 0 ? code : `${code};q=${(1 - idx * 0.1).toFixed(1)}`))
    .join(", ");
}

export function defaultLocaleFromNavigator(): AppLocale {
  if (typeof navigator === "undefined") return "en";
  return normalizeLocale(navigator.language || (navigator as any).userLanguage || "en");
}
