"use client";

import React from "react";

export type ErrorNoticeProps = {
  title?: string;
  message?: string;
  code?: string;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
};

export default function ErrorNotice({ title, message, code, actionLabel, onAction, href }: ErrorNoticeProps) {
  const content = (
    <div className="w-full rounded-lg border border-red-200 bg-red-50 text-red-800 p-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-start gap-3">
        <div className="text-xl leading-none">⚠️</div>
        <div className="flex-1">
          {title && <div className="font-semibold mb-0.5">{title}</div>}
          {message && <div className="text-sm leading-relaxed">{message}</div>}
          {code && <div className="text-[11px] uppercase tracking-wide mt-1 opacity-70">{code}</div>}
        </div>
        {actionLabel && (href ? (
          <a href={href} onClick={onAction} className="shrink-0 inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold border border-red-200 bg-white/70 hover:bg-white transition">
            {actionLabel}
          </a>
        ) : (
          <button onClick={onAction} className="shrink-0 inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold border border-red-200 bg-white/70 hover:bg-white transition">
            {actionLabel}
          </button>
        ))}
      </div>
    </div>
  );
  return content;
}
