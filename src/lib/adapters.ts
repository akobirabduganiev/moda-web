import type { TotalItem } from "./types";
import { getMoodMeta } from "./moods";
import { formatPercentFrom100 } from "./i18n";

export type NormalizedTotal = TotalItem & { label: string; emoji: string };
export type TopMood = { code: string; label: string; emoji: string };

export function normalizeTotals(totals: TotalItem[] | null | undefined, locale?: string | null): NormalizedTotal[] {
  if (!Array.isArray(totals)) return [];
  return totals.map((t) => {
    const meta = getMoodMeta(t.moodType, locale);
    return {
      ...t,
      emoji: meta.emoji || t.emoji || "",
      label: `${meta.emoji ? meta.emoji + " " : ""}${meta.label || meta.code}`.trim(),
    };
  });
}

export function mapTop(items: string[] | null | undefined, locale?: string | null): TopMood[] {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 5).map((code) => {
    const meta = getMoodMeta(code, locale);
    return { code: meta.code, emoji: meta.emoji, label: meta.label || meta.code };
  });
}

export function percentTitle(count: number, percent: number, locale?: string | null): string {
  return `${count.toLocaleString?.() ?? count} (${formatPercentFrom100(percent, locale)})`;
}
