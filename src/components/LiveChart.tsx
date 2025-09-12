"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import type { TotalItem } from "@/lib/types";
import { normalizeTotals } from "@/lib/adapters";
import { PIE_COLORS } from "@/lib/moods";
import { formatPercentFrom100 } from "@/lib/i18n";

export default function LiveChart({ totals, locale }: { totals: TotalItem[]; locale?: string | null }) {
  const norm = normalizeTotals(totals, locale);
  const data = norm.map((t) => ({
    name: t.label,
    percent: Number(t.percent.toFixed(2)),
    count: t.count,
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={40} />
          <YAxis tickFormatter={(v) => formatPercentFrom100(Number(v), locale)} />
          <Tooltip formatter={(value: any, name: any, props: any) => {
            return [formatPercentFrom100(Number(value), locale), props.payload.name];
          }} />
          <Bar dataKey="percent" radius={[4, 4, 0, 0]} isAnimationActive>
            {data.map((_, idx) => (
              <Cell key={`c-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
