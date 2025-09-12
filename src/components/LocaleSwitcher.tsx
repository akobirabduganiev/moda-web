"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { normalizeLocale } from "@/lib/locale";
import { readStoredLocale, storeLocale } from "@/lib/i18n";

const LOCALES = [
  { code: "uz", label: "UZ" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
];

export default function LocaleSwitcher() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlLocale = search.get("locale");
  const [value, setValue] = useState<string>(normalizeLocale(urlLocale || readStoredLocale() || "en"));

  useEffect(() => {
    // Sync to URL if different
    const current = urlLocale ? normalizeLocale(urlLocale) : null;
    if (!current || current !== value) {
      const params = new URLSearchParams(search?.toString());
      params.set("locale", value);
      router.replace(`${pathname}?${params.toString()}`);
    }
    // Persist
    storeLocale(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <select
      aria-label="Locale switcher"
      className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white hover:bg-gray-50"
      value={value}
      onChange={(e) => setValue(normalizeLocale(e.target.value))}
    >
      {LOCALES.map((l) => (
        <option key={l.code} value={l.code}>{l.label}</option>
      ))}
    </select>
  );
}
