"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import type { TotalItem } from "@/lib/types";

export default function LiveChart({ totals }: { totals: TotalItem[] }) {
  const data = totals.map((t) => ({
    name: `${t.emoji ?? ""} ${t.moodType}`.trim(),
    percent: Number(t.percent.toFixed(2)),
    count: t.count,
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
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={40} />
          <YAxis unit="%" tickFormatter={(v) => `${v}%`} />
          <Tooltip formatter={(value: any, name: any, props: any) => {
            const v = typeof value === 'number' ? value.toFixed(1) : value;
            return [`${v}%`, props.payload.name];
          }} />
          <Bar dataKey="percent" radius={[4, 4, 0, 0]} isAnimationActive>
            {data.map((_, idx) => (
              <Cell key={`c-${idx}`} fill={palette[idx % palette.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
