"use client";

import { mapTop } from "@/lib/adapters";

export default function TopList({ items, locale }: { items: string[]; locale?: string | null }) {
  const top = mapTop(items, locale);
  if (!top.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {top.map((it) => (
        <span
          key={it.code}
          className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs border border-gray-200"
        >
          {it.emoji ? `${it.emoji} ${it.label}` : it.label}
        </span>
      ))}
    </div>
  );
}
