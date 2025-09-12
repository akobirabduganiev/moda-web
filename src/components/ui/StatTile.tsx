"use client";

import React from "react";

export type StatTileProps = {
  label: string;
  value?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: { text: string; color?: string } | null;
  subtle?: boolean;
};

export default function StatTile({ label, value = "—", subtitle, badge, subtle }: StatTileProps) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div className={`text-lg font-semibold ${subtle ? "opacity-75" : ""}`}>{value}</div>
          {subtitle && <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>}
        </div>
        {badge && (
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ background: `${badge.color || "#dbeafe"}` }}
            aria-live="polite"
          >
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
}
