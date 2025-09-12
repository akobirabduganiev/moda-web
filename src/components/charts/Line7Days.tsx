"use client";

import React from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, CartesianGrid } from "recharts";
import { formatPercentFrom100 } from "@/lib/i18n";

export type LineSeries = { name: string; color?: string; data: { date: string; value: number }[] };

export default function Line7Days({ series, locale }: { series: LineSeries[]; locale?: string | null }) {
  if (!series || series.length === 0) {
    return <div className="h-[280px] flex items-center justify-center text-sm text-gray-500">{formatPercentFrom100(0, locale) && ""}No data yet</div>;
  }
  // Normalize to recharts format (one row per day)
  const dates = Array.from(new Set(series.flatMap((s) => s.data.map((d) => d.date)))).sort();
  const rows = dates.map((date) => {
    const row: any = { date };
    for (const s of series) {
      const found = s.data.find((d) => d.date === date);
      row[s.name] = found ? Number(found.value.toFixed(2)) : 0;
    }
    return row;
  });

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <LineChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => formatPercentFrom100(Number(v), locale)} />
          <Tooltip formatter={(value: any) => formatPercentFrom100(Number(value), locale)} />
          <Legend />
          {series.map((s, idx) => (
            <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.color || `hsl(${(idx * 70) % 360} 70% 45%)`} dot={false} strokeWidth={2} isAnimationActive />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
