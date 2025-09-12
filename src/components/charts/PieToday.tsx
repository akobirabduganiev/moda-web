"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { TotalItem } from "@/lib/types";

export default function PieToday({ totals }: { totals: TotalItem[] }) {
  const data = totals.map((t) => ({
    name: `${t.emoji ?? ""} ${t.moodType}`.trim(),
    value: Number(t.percent.toFixed(2)),
  }));

  const palette = [
    "var(--mood-excited)",
    "var(--mood-angry)",
    "var(--mood-positive)",
    "var(--mood-energetic)",
    "var(--mood-sad)",
    "var(--mood-calm)",
    "var(--mood-neutral)",
  ];

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie dataKey="value" data={data} innerRadius={60} outerRadius={90} isAnimationActive>
            {data.map((_, idx) => (
              <Cell key={`slice-${idx}`} fill={palette[idx % palette.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any, name: any) => [`${value}%`, name]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
