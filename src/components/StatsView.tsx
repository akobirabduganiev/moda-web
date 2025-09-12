"use client";

import { useLiveStats } from "@/hooks/useLiveStats";
import CountrySelect from "@/components/CountrySelect";
import TopList from "@/components/TopList";
import { useEffect, useMemo, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { normalizeLocale, defaultLocaleFromNavigator } from "@/lib/locale";
import StatTile from "@/components/ui/StatTile";
import SseBadge from "@/components/ui/SseBadge";
import MoodChip from "@/components/ui/MoodChip";
import PieToday from "@/components/charts/PieToday";
import Line7Days from "@/components/charts/Line7Days";
import ShareModal from "@/components/ShareModal";
import { fetchMoodTypes, submitMood, ApiError, fetchMoodStatus, buildShareSvgUrl } from "@/lib/api";
import type { MoodTypeDto, TotalItem } from "@/lib/types";
import { t } from "@/lib/i18n";
import { getMoodMeta } from "@/lib/moods";

const LiveChart = dynamic(() => import("@/components/LiveChart"), { ssr: false, loading: () => <div className="skeleton h-[300px] rounded" /> });

const LS_SUB_PREFIX = "mooda.submitted.";

export default function StatsView() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [country, setCountry] = useState<string | null>(search.get("country"));
  const localeParam = search.get("locale");
  const locale = useMemo(() => normalizeLocale(localeParam || (typeof navigator !== 'undefined' ? navigator.language : defaultLocaleFromNavigator())), [localeParam]);

  const { data, error, connecting, status } = useLiveStats({ country, locale });

  const [moodTypes, setMoodTypes] = useState<MoodTypeDto[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [submittedToday, setSubmittedToday] = useState(false);
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null); // mood code when submitting
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [optimistic, setOptimistic] = useState<{ totals: TotalItem[]; totalCount: number } | null>(null);

  const todayKey = (() => {
    const date = data?.date || new Date().toISOString().slice(0,10);
    return `${LS_SUB_PREFIX}${date}`;
  })();

  // keep query in URL in sync
  useEffect(() => {
    const params = new URLSearchParams(search?.toString());
    if (country) params.set("country", country); else params.delete("country");
    if (localeParam) params.set("locale", localeParam);
    router.replace(`${pathname}?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  // Load mood types
  useEffect(() => {
    setLoadingTypes(true);
    fetchMoodTypes(locale)
      .then(setMoodTypes)
      .catch(() => {})
      .finally(() => setLoadingTypes(false));
  }, [locale]);

  // Check submitted status
  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const st = await fetchMoodStatus(locale);
        if (cancelled) return;
        if (st.submittedToday) {
          setSubmittedToday(true);
          setTodayMood(st.moodType || null);
          try { localStorage.setItem(todayKey, st.moodType || "1"); } catch {}
        } else {
          // localStorage fallback
          try {
            const flag = localStorage.getItem(todayKey);
            if (flag) {
              setSubmittedToday(true);
              setTodayMood(flag);
            }
          } catch {}
        }
      } catch {
        // fallback to LS only
        try {
          const flag = localStorage.getItem(todayKey);
          if (flag) {
            setSubmittedToday(true);
            setTodayMood(flag);
          }
        } catch {}
      }
    }
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayKey]);

  function displayedTotals(): TotalItem[] | null {
    const base = data?.totals || null;
    if (!base) return base;
    if (!optimistic) return base;
    // merge optimistic bump by moodType
    const map = new Map<string, TotalItem>();
    base.forEach((t) => map.set(t.moodType, { ...t }));
    optimistic.totals.forEach((t) => map.set(t.moodType, { ...t }));
    // recompute percents based on optimistic totalCount
    const totalCount = optimistic.totalCount;
    const arr = Array.from(map.values()).map((t) => ({ ...t, percent: totalCount > 0 ? (t.count / totalCount) * 100 : 0 }));
    return arr;
  }

  async function onChooseMood(code: string) {
    if (!country) {
      setInlineError("Davlatni tanlang (country_required)");
      return;
    }
    setInlineError(null);
    setSubmitting(code);
    // optimistic bump
    if (data?.totals) {
      const bumpTotals = data.totals.map((t) => (t.moodType === code ? { ...t, count: t.count + 1 } : t));
      const found = bumpTotals.find((t) => t.moodType === code);
      if (!found) bumpTotals.push({ moodType: code, count: 1, percent: 0 });
      setOptimistic({ totals: bumpTotals, totalCount: (data.totalCount || 0) + 1 });
    }

    try {
      const res = await submitMood({ moodType: code, country });
      setSubmittedToday(true);
      setTodayMood(code);
      try { localStorage.setItem(todayKey, code); } catch {}
      const url = res?.shareCardUrl || buildShareSvgUrl(country, locale);
      setShareUrl(url);
      setShareOpen(true);
    } catch (e: any) {
      // rollback optimistic
      setOptimistic(null);
      if (e instanceof ApiError) {
        if (e.code === "already_submitted_today" || e.status === 409) {
          setSubmittedToday(true);
          setTodayMood(code);
          try { localStorage.setItem(todayKey, code); } catch {}
        } else if (e.code === "rate_limited" || e.status === 429) {
          setInlineError("Juda tez. Biroz kuting (429)");
        } else if (e.code === "country_required" || e.status === 400) {
          setInlineError("Davlatni tanlang (country_required)");
        } else {
          setInlineError(e.detail || e.message || "Xatolik yuz berdi");
        }
      } else {
        setInlineError("Xatolik yuz berdi, qayta urinib ko'ring");
      }
    } finally {
      setSubmitting(null);
    }
  }

  const totalsForDisplay = displayedTotals();

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-6">
      {/* Control row under navbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="chip px-2 py-1 text-xs">{t('controls.byCountry', locale)}</div>
          <div className="chip px-2 py-1 text-xs">{t('controls.todayMood', locale)}</div>
        </div>
        <div className="flex items-center gap-3">
          <CountrySelect value={country} onChange={(c) => { setInlineError(null); setCountry(c); }} locale={locale} />
        </div>
      </div>

      {/* Mood strip or Today pill */}
      {!submittedToday ? (
        <section aria-label="Mood selector" className="mb-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {loadingTypes ? (
              Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-9 w-24 rounded-full" />)
            ) : (
              moodTypes.map((t) => {
                const meta = getMoodMeta(t.code, locale);
                return (
                  <MoodChip key={t.code} label={meta.label} emoji={t.emoji || meta.emoji} active={submitting === t.code} onClick={() => onChooseMood(t.code)} />
                );
              })
            )}
          </div>
          {inlineError && <div className="text-sm text-red-600 mt-1">{inlineError}</div>}
        </section>
      ) : (
        <div className="mb-3">
          <span className="inline-flex items-center gap-2 chip px-3 py-1.5 text-sm">
            <span className="text-xs text-gray-500">Bugun:</span>
            <span className="font-medium">{(() => { const mt = moodTypes.find(m => m.code === todayMood); return mt ? `${mt.emoji ?? ''} ${mt.label}` : (todayMood || '—'); })()}</span>
            <span className="text-xs text-gray-500">o'zgartirish – ertaga</span>
          </span>
        </div>
      )}

      {/* Stat tiles + SSE badge */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
        <StatTile label={t('scope', locale)} value={data?.scope ?? "—"} subtle={connecting} />
        <StatTile label={t('date', locale)} value={data?.date ?? "—"} subtle={connecting} />
        <StatTile label={t('total', locale)} value={(optimistic?.totalCount || data?.totalCount)?.toLocaleString?.() || "—"} subtle={connecting} />
        <StatTile label={t('status', locale)} value={<SseBadge status={status} />} />
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-600">{String(error)}</div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="card p-4">
          <h3 className="font-medium mb-2">{t('title.live', locale)}</h3>
          {totalsForDisplay ? <PieToday totals={totalsForDisplay} /> : <div className="skeleton h-[280px] rounded" />}
        </div>
        <div className="card p-4">
          <h3 className="font-medium mb-2">{country || "Global"} top kayfiyatlar</h3>
          {data?.top ? (
            <TopList items={data.top} />
          ) : (
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-6 w-20 rounded-full" />
              ))}
            </div>
          )}
        </div>
        <div className="card p-4">
          <h3 className="font-medium mb-2">Oxirgi 7 kun</h3>
          <Line7Days series={[]} />
          <div className="text-xs text-gray-500 mt-2">Tez orada…</div>
        </div>
        <div className="card p-4">
          <h3 className="font-medium mb-2">Bugun dunyo</h3>
          {totalsForDisplay ? (
            <Suspense fallback={<div className="skeleton h-[150px] rounded" />}>
              <LiveChart totals={totalsForDisplay} />
            </Suspense>
          ) : (
            <div className="skeleton h-[150px] rounded" />
          )}
          <div className="mt-3">
            <button onClick={() => setShareOpen(true)} className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 text-sm">Ulashish</button>
          </div>
        </div>
      </div>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} shareUrl={shareUrl || (buildShareSvgUrl(country, locale))} />
    </div>
  );
}
