"use client";

import React, { useEffect } from "react";

export type ShareModalProps = {
  open: boolean;
  onClose: () => void;
  shareUrl: string | null;
};

export default function ShareModal({ open, onClose, shareUrl }: ShareModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const url = shareUrl || "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied");
    } catch {
      // ignore
    }
  };

  const download = async () => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "mooda-share.svg";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 0);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg card p-4 bg-white dark:bg-black">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold">Share</h3>
          <button onClick={onClose} className="text-sm text-gray-600 hover:text-foreground">Close</button>
        </div>
        <div className="space-y-3">
          <input readOnly value={url} className="w-full border rounded-md px-3 py-2 text-sm" />
          <div className="flex items-center gap-2">
            <button onClick={copy} className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 text-sm">Copy link</button>
            <button onClick={download} className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 text-sm">Download</button>
          </div>
          <div className="rounded-md overflow-hidden border">
            {/* preview */}
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="Share preview" className="w-full" />
            ) : (
              <div className="skeleton h-48" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
