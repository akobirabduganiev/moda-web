"use client";

import React from "react";

export type MoodChipProps = {
  active?: boolean;
  label: string;
  emoji?: string;
  onClick?: () => void;
};

export default function MoodChip({ active, label, emoji, onClick }: MoodChipProps) {
  return (
    <button
      type="button"
      role="button"
      aria-pressed={!!active}
      className={`chip px-3 py-2 text-sm ${active ? "ring-2 ring-blue-300" : "hover:bg-gray-50"}`}
      onClick={onClick}
    >
      {emoji && <span className="mr-1" aria-hidden>{emoji}</span>}
      <span>{label}</span>
    </button>
  );
}
