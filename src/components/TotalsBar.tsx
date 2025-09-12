"use client";

import { TotalItem } from "@/lib/types";
import { normalizeTotals, percentTitle } from "@/lib/adapters";
import { formatPercentFrom100 } from "@/lib/i18n";

export type TotalsBarProps = {
  totals: TotalItem[];
  locale?: string | null;
};

const palette = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#eab308", // yellow
  "#a78bfa", // purple
  "#f97316", // orange
  "#14b8a6", // teal
  "#f43f5e", // rose
];

export default function TotalsBar({ totals, locale }: TotalsBarProps) {
  const norm = normalizeTotals(totals, locale);
  const max = Math.max(1, ...norm.map((t) => t.count));
  return (
    <div className="flex flex-col gap-2 w-full">
      {norm.map((t, idx) => {
        const width = (t.count / max) * 100;
        const color = palette[idx % palette.length];
        return (
          <div key={`${t.moodType}-${idx}`} className="flex items-center gap-3">
            <div className="w-40 shrink-0 text-sm text-gray-700 flex items-center gap-1">
              <span className="whitespace-nowrap">{t.label}</span>
            </div>
            <div className="h-3 flex-1 bg-gray-200/50 rounded">
              <div
                className="h-3 rounded"
                style={{ width: `${width}%`, backgroundColor: color }}
                title={percentTitle(t.count, t.percent, locale)}
              />
            </div>
            <div className="w-28 text-right text-sm tabular-nums">
              {t.count.toLocaleString()} <span className="text-gray-500">({formatPercentFrom100(t.percent, locale)})</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
