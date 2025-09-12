import { AppLocale, normalizeLocale } from "./locale";

// Static message bundles
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import uz from "@/messages/uz.json";

export type Messages = Record<string, string>;

const BUNDLES: Record<AppLocale, Messages> = {
  en,
  ru,
  uz,
};

const LS_LOCALE_KEY = "mooda.locale";

export function getMessages(locale?: string | null): Messages {
  const l = normalizeLocale(locale);
  return BUNDLES[l] || BUNDLES.en;
}

export function t(key: string, locale?: string | null): string {
  const l = normalizeLocale(locale);
  const bundles: Messages[] = [BUNDLES[l], BUNDLES.en];
  for (const m of bundles) {
    if (m && key in m) return m[key];
  }
  // mood fallback: if key is mood.X, return X
  const moodMatch = key.match(/^mood\.(.+)$/);
  if (moodMatch) return moodMatch[1];
  return key;
}

export function storeLocale(locale: string) {
  try {
    localStorage.setItem(LS_LOCALE_KEY, normalizeLocale(locale));
  } catch {}
}

export function readStoredLocale(): AppLocale | null {
  try {
    const v = localStorage.getItem(LS_LOCALE_KEY);
    return v ? normalizeLocale(v) : null;
  } catch {
    return null;
  }
}

export function percentFormatter(locale?: string | null, opts?: Intl.NumberFormatOptions) {
  const l = normalizeLocale(locale);
  return new Intl.NumberFormat(l, { style: "percent", maximumFractionDigits: 1, ...opts });
}

export function formatPercentFrom100(value: number, locale?: string | null, opts?: Intl.NumberFormatOptions) {
  const fmt = percentFormatter(locale, opts);
  // Incoming value is 0..100; Intl percent expects 0..1
  return fmt.format((Number.isFinite(value) ? value : 0) / 100);
}
