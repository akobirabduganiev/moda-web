import { fetchShareToday } from "@/lib/api";
import { ShareTodayResponse } from "@/lib/types";
import { normalizeLocale } from "@/lib/locale";

async function getData(searchParams: Record<string, string | string[] | undefined>): Promise<ShareTodayResponse> {
  const country = typeof searchParams.country === 'string' ? searchParams.country : undefined;
  const localeParam = typeof searchParams.locale === 'string' ? searchParams.locale : undefined;
  const locale = localeParam ? normalizeLocale(localeParam) : undefined;
  return await fetchShareToday(country, locale);
}

export default async function SharePage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const data = await getData(searchParams);
  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Share Today</h1>
      <div className="rounded-2xl border shadow-sm p-6 bg-white/90 dark:bg-black/30">
        <div className="text-sm text-gray-500 mb-2">{data.date} · {data.scope}{data.country ? ` · ${data.country}` : ''}</div>
        <div className="text-3xl font-bold mb-4">{data.countryEmoji ? `${data.countryEmoji} ` : ''}{data.countryName ?? 'Global mood'}</div>
        <div className="mb-4 text-sm text-gray-600">Top: {data.top.slice(0,3).join(' · ')}</div>
        <ul className="space-y-2">
          {data.totals.map((t) => (
            <li key={t.moodType} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{t.emoji}</span>
                <span className="font-medium">{t.label}</span>
              </div>
              <div className="text-sm tabular-nums">{t.count.toLocaleString()} · {t.percent.toFixed(1)}%</div>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-gray-500 mt-3">Use URL params country=US&locale=en to customize.</p>
    </div>
  );
}
