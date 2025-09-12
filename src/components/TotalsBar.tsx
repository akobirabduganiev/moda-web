"use client";

import { TotalItem } from "@/lib/types";

export type TotalsBarProps = {
  totals: TotalItem[];
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

export default function TotalsBar({ totals }: TotalsBarProps) {
  const max = Math.max(1, ...totals.map((t) => t.count));
  return (
    <div className="flex flex-col gap-2 w-full">
      {totals.map((t, idx) => {
        const width = (t.count / max) * 100;
        const color = palette[idx % palette.length];
        return (
          <div key={`${t.moodType}-${idx}`} className="flex items-center gap-3">
            <div className="w-28 shrink-0 text-sm text-gray-500 flex items-center gap-1">
              <span>{t.emoji ?? ''}</span>
              <span className="uppercase tracking-wide text-[11px]">{t.moodType}</span>
            </div>
            <div className="h-3 flex-1 bg-gray-200/50 rounded">
              <div
                className="h-3 rounded"
                style={{ width: `${width}%`, backgroundColor: color }}
                title={`${t.count} (${t.percent.toFixed(1)}%)`}
              />
            </div>
            <div className="w-24 text-right text-sm tabular-nums">
              {t.count.toLocaleString()} <span className="text-gray-500">({t.percent.toFixed(1)}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
