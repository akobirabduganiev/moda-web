"use client";

import { LiveStatsDto } from "@/lib/types";

export default function StatCards({ data, connecting }: { data: LiveStatsDto | null; connecting?: boolean }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
      <Card title="Scope" value={data?.scope ?? "—"} subtle={!!connecting} />
      <Card title="Date" value={data?.date ?? "—"} subtle={!!connecting} />
      <Card title="Total" value={data ? data.totalCount.toLocaleString() : "—"} subtle={!!connecting} />
      <Card title="Status" value={connecting ? "Connecting…" : "Live"} subtle={!!connecting} />
    </div>
  );
}

function Card({ title, value, subtle }: { title: string; value: string; subtle?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white/50 dark:bg-black/20">
      <div className="text-xs text-gray-500">{title}</div>
      <div className={`text-lg font-semibold ${subtle ? "opacity-75" : ""}`}>{value}</div>
    </div>
  );
}
