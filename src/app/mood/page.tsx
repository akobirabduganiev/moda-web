"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchMoodTypes, submitMood, ApiError } from "@/lib/api";
import type { MoodTypeDto } from "@/lib/types";
import CountrySelect from "@/components/CountrySelect";
import { useSearchParams } from "next/navigation";
import ErrorNotice from "@/components/ErrorNotice";
import { useAuth } from "@/lib/auth";
import { normalizeLocale, defaultLocaleFromNavigator } from "@/lib/locale";

const LS_COUNTRY = "mooda_country";

function decodeJwt<T = any>(token: string): T | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function geolocateCountryCode(): Promise<string | null> {
  if (typeof window === "undefined" || !("geolocation" in navigator)) return null;
  const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 });
  }).catch(() => null as any);
  if (!pos) return null;
  const lat = pos.coords.latitude;
  const lon = pos.coords.longitude;
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    if (!res.ok) return null;
    const data = await res.json();
    const code = (data?.countryCode || data?.country_code || data?.principalSubdivisionCode || "").toString().slice(-2).toUpperCase();
    return code || null;
  } catch {
    return null;
  }
}

export default function MoodPage() {
  const search = useSearchParams();
  const localeParam = search.get("locale");
  const locale = useMemo(() => normalizeLocale(localeParam || (typeof navigator !== 'undefined' ? navigator.language : defaultLocaleFromNavigator())), [localeParam]);
  const { accessToken } = useAuth();

  const [types, setTypes] = useState<MoodTypeDto[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  const [country, setCountry] = useState<string | null>(search.get("country"));
  const [moodType, setMoodType] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{ title?: string; message?: string; code?: string } | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // Initialize country: URL param → localStorage → JWT claim
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (country) {
      localStorage.setItem(LS_COUNTRY, country);
      return;
    }
    const saved = localStorage.getItem(LS_COUNTRY);
    if (saved) {
      setCountry(saved);
      return;
    }
    if (accessToken) {
      const payload: any = decodeJwt(accessToken);
      const claim = payload?.country || payload?.countryCode || payload?.country_code || payload?.cnt || null;
      if (claim && typeof claim === "string") {
        const code = claim.toUpperCase();
        setCountry(code);
        localStorage.setItem(LS_COUNTRY, code);
      }
    }
  // run when access token changes or search param changes
  }, [accessToken]);

  useEffect(() => {
    setLoadingTypes(true);
    fetchMoodTypes(locale)
      .then(setTypes)
      .catch((e) => console.error(e))
      .finally(() => setLoadingTypes(false));
  }, [locale]);

  // Persist selected country for next visits
  useEffect(() => {
    if (country) {
      try { localStorage.setItem(LS_COUNTRY, country); } catch {}
    }
  }, [country]);

  async function onSubmit() {
    setError(null);
    setShareUrl(null);
    if (!moodType) {
      setError({ title: "Missing info", message: "Please select a mood" });
      return;
    }

    let chosenCountry = country;
    if (!chosenCountry) {
      // Try to detect country for guests
      const detected = await geolocateCountryCode();
      if (detected) {
        chosenCountry = detected;
        setCountry(detected);
        try { localStorage.setItem(LS_COUNTRY, detected); } catch {}
      } else {
        setError({ title: "Country required", message: "Please allow location access or choose your country manually." });
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await submitMood({ moodType, country: chosenCountry, comment: comment || undefined });
      setShareUrl(res.shareCardUrl);
      // soft animated reset state
      setTimeout(() => {
        setComment("");
      }, 200);
    } catch (e: any) {
      if (e instanceof ApiError) {
        setError({ title: e.title || "Failed to submit", message: e.detail || e.message, code: e.code });
      } else {
        setError({ title: "Failed to submit", message: e?.message || "Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2">Submit Mood</h1>
      <p className="text-sm text-gray-500 mb-6">Share how you feel. Logged in users get enhanced features.</p>

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <CountrySelect value={country} onChange={setCountry} locale={locale} />
        </div>

        <section>
          <h2 className="text-lg font-medium mb-3">Choose mood</h2>
          {loadingTypes ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {types.map((t) => {
                const active = moodType === t.code;
                return (
                  <button
                    key={t.code}
                    onClick={() => setMoodType(t.code)}
                    className={`px-3 py-2 rounded-full border transition transform ${active ? "border-blue-600 bg-blue-50 text-blue-700 scale-[1.02]" : "border-gray-300 hover:bg-gray-50"}`}
                    title={t.label}
                  >
                    <span className="mr-1">{t.emoji}</span>
                    <span className="text-sm">{t.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2">Comment (optional)</h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border rounded-md px-3 py-2 min-h-24 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            maxLength={500}
            placeholder="Add a short note…"
          />
          <div className="text-xs text-gray-500 mt-1">{comment.length}/500</div>
        </section>

        {error && <ErrorNotice title={error.title} message={error.message} code={error.code} />}
        {shareUrl && (
          <div className="p-4 border rounded-md bg-green-50 text-green-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
            Submitted! Share link: <a className="underline" href={shareUrl} target="_blank" rel="noreferrer">Open card</a>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onSubmit}
            disabled={submitting}
            className={`rounded-md px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 transition-transform ${submitting ? "opacity-70" : "active:scale-[0.98]"}`}
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
          <button
            onClick={() => { setMoodType(null); setComment(""); }}
            className="rounded-md px-4 py-2 border border-gray-300 hover:bg-gray-50 transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
