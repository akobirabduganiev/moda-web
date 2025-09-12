"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LiveStatsDto } from "@/lib/types";
import { fetchLive, sseUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export type UseLiveStatsOptions = {
  country?: string | null;
  locale?: string | null;
  pollIntervalMs?: number; // fallback polling interval
};

type ConnStatus = "idle" | "connecting" | "connected" | "reconnecting" | "polling";

export function useLiveStats({ country, locale, pollIntervalMs = 5000 }: UseLiveStatsOptions) {
  const { accessToken } = useAuth();
  const [data, setData] = useState<LiveStatsDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnStatus>("idle");

  const esRef = useRef<EventSource | null>(null);
  const pollTimerRef = useRef<any>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const hiddenRef = useRef<boolean>(false);
  const unmountedRef = useRef<boolean>(false);

  const url = useMemo(() => {
    const base = sseUrl(accessToken);
    let u: URL;
    try {
      // Absolute URL case
      u = new URL(base);
    } catch {
      // Fallback for relative URLs
      u = new URL(base, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    }
    if (country) u.searchParams.set("country", country);
    if (locale) u.searchParams.set("locale", locale);
    return u.toString();
  }, [country, locale, accessToken]);

  // Always do an initial REST fetch for immediate data and as fallback cache
  useEffect(() => {
    fetchLive(country ?? undefined, locale ?? undefined)
      .then(setData)
      .catch((e) => setError(String(e)));
  }, [country, locale]);

  // Visibility handling
  useEffect(() => {
    const onVis = () => {
      hiddenRef.current = (document.visibilityState === "hidden");
      if (!hiddenRef.current) {
        // resume stream or switch back from polling
        reconnectWithBackoff(0);
      } else {
        // pause SSE when hidden; switch to slower polling
        closeStream();
        startPolling(Math.max(pollIntervalMs, 10000));
      }
    };
    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
      hiddenRef.current = (document.visibilityState === "hidden");
      document.addEventListener("visibilitychange", onVis);
      return () => document.removeEventListener("visibilitychange", onVis);
    }
  }, [url, pollIntervalMs]);

  function closeStream() {
    if (esRef.current) {
      try { esRef.current.close(); } catch {}
      esRef.current = null;
    }
  }

  function startPolling(interval: number = pollIntervalMs) {
    clearTimeout(pollTimerRef.current);
    setStatus("polling");
    const tick = async () => {
      try {
        const res = await fetchLive(country ?? undefined, locale ?? undefined);
        if (!unmountedRef.current) setData(res);
      } catch (e: any) {
        if (!unmountedRef.current) setError(String(e?.message || e));
      } finally {
        if (!unmountedRef.current && status === "polling") {
          pollTimerRef.current = setTimeout(tick, interval);
        }
      }
    };
    pollTimerRef.current = setTimeout(tick, 0);
  }

  function reconnectWithBackoff(attempt: number) {
    if (hiddenRef.current) return; // will switch to polling while hidden
    // Avoid duplicate connections in StrictMode
    if (esRef.current) return;

    setStatus(attempt === 0 ? "connecting" : "reconnecting");
    setError(null);

    // Try to establish EventSource
    try {
      const es = new EventSource(url, { withCredentials: false });
      esRef.current = es;

      es.onopen = () => {
        setStatus("connected");
        // stop polling if any
        clearTimeout(pollTimerRef.current);
      };

      const onMessage = (ev: MessageEvent) => {
        try {
          const incoming: any = JSON.parse(ev.data);
          const id = (ev as any).lastEventId || incoming?.id || undefined;
          if (id) {
            const seen = seenIdsRef.current;
            if (seen.has(id)) return; // dedupe
            seen.add(id);
            if (seen.size > 500) {
              // prevent unbounded growth
              const first = seen.values().next().value;
              seen.delete(first);
            }
          }
          // Merge partial SSE updates safely to avoid wiping existing stats
          setData((prev) => {
            const hasTotals = Array.isArray(incoming?.totals);
            const hasTop = Array.isArray(incoming?.top);
            const hasCount = typeof incoming?.totalCount === "number";
            const hasScope = typeof incoming?.scope === "string";
            const hasDate = typeof incoming?.date === "string";
            const hasCountryField = Object.prototype.hasOwnProperty.call(incoming || {}, "country");

            // If we don't have a baseline yet, only accept full payloads
            if (!prev && !(hasTotals && hasTop && hasCount && hasScope && hasDate)) {
              return prev;
            }

            const next: LiveStatsDto = {
              scope: (hasScope ? incoming.scope : prev?.scope) ?? "GLOBAL",
              country: (hasCountryField ? incoming.country : prev?.country) ?? null,
              date: (hasDate ? incoming.date : prev?.date) ?? "",
              totalCount: (hasCount ? incoming.totalCount : prev?.totalCount) ?? 0,
              top: (hasTop ? incoming.top : prev?.top) ?? [],
              totals: (hasTotals ? incoming.totals : prev?.totals) ?? [],
            };
            return next;
          });
        } catch {}
      };

      es.addEventListener("stats", onMessage);
      es.onmessage = onMessage;

      es.onerror = () => {
        // Switch to polling and schedule reconnect with backoff
        setStatus("reconnecting");
        closeStream();
        startPolling();
        const nextDelay = Math.min(30000, 1000 * Math.pow(2, Math.min(5, attempt)) + Math.random() * 500);
        setTimeout(() => reconnectWithBackoff(attempt + 1), nextDelay);
      };
    } catch (e: any) {
      // If EventSource fails immediately (e.g., not supported), fall back to polling
      startPolling();
    }
  }

  useEffect(() => {
    unmountedRef.current = false;
    seenIdsRef.current.clear();
    closeStream();
    clearTimeout(pollTimerRef.current);
    reconnectWithBackoff(0);

    return () => {
      unmountedRef.current = true;
      closeStream();
      clearTimeout(pollTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const connecting = status === "connecting" || status === "reconnecting";
  return { data, error, connecting, status };
}
