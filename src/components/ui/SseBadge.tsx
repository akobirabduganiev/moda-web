"use client";

import React from "react";

export type SseBadgeProps = {
  status: "idle" | "connecting" | "connected" | "reconnecting" | "polling";
  lastUpdated?: string | null;
};

export default function SseBadge({ status, lastUpdated }: SseBadgeProps) {
  let text = "";
  let color = "#dbeafe"; // blue-100
  switch (status) {
    case "connected":
      text = "Connected";
      color = "#dcfce7"; // green-100
      break;
    case "polling":
      text = "Polling";
      color = "#fef9c3"; // yellow-100
      break;
    case "connecting":
      text = "Connecting…";
      color = "#e0f2fe"; // sky-100
      break;
    case "reconnecting":
      text = "Reconnecting…";
      color = "#e0f2fe";
      break;
    default:
      text = "Idle";
  }
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: color }}
      aria-live="polite"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{text}</span>
      {lastUpdated && (
        <span className="text-gray-600">{lastUpdated}</span>
      )}
    </span>
  );
}
