"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { TotalItem } from "@/lib/types";
import { normalizeTotals } from "@/lib/adapters";
import { PIE_COLORS } from "@/lib/moods";
import { formatPercentFrom100 } from "@/lib/i18n";

export default function PieToday({ totals, locale }: { totals: TotalItem[]; locale?: string | null }) {
  const norm = normalizeTotals(totals, locale);
  const data = norm.map((t) => ({
    label: t.label,
    value: Number(t.percent.toFixed(2)),
  }));

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie dataKey="value" nameKey="label" data={data} innerRadius={60} outerRadius={90} isAnimationActive>
            {data.map((_, idx) => (
              <Cell key={`slice-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any, name: any) => [formatPercentFrom100(Number(value), locale), name]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
