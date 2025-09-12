"use client";

import { useEffect, useState } from "react";
import { CountryDto } from "@/lib/types";
import { fetchCountries } from "@/lib/api";

export type CountrySelectProps = {
  value?: string | null;
  onChange?: (code: string | null) => void;
  locale?: string | null;
};

export default function CountrySelect({ value, onChange, locale }: CountrySelectProps) {
  const [countries, setCountries] = useState<CountryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchCountries(locale)
      .then((cs) => setCountries(cs))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [locale]);


  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-500">Country</label>
      <select
        className="border rounded-md px-3 py-2 bg-background text-foreground text-sm"
        value={value ?? ""}
        onChange={(e) => {
          const v = e.target.value || null;
          try { localStorage.setItem("mooda_country", v || ""); } catch {}
          onChange?.(v);
        }}
        disabled={loading}
      >
        <option value="">Global</option>
        {countries.map((c) => (
          <option key={c.code} value={c.code}>
            {c.emoji ? `${c.emoji} ` : ""}{c.name}
          </option>
        ))}
      </select>
      {loading && <span className="text-xs text-gray-400">Loading…</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
