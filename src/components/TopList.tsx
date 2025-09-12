"use client";

export default function TopList({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s, idx) => (
        <span
          key={idx}
          className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs border border-gray-200"
        >
          {s}
        </span>
      ))}
    </div>
  );
}
