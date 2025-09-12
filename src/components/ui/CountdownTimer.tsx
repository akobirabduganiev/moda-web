"use client";

import React, { useEffect } from "react";
import { useCountdown } from "@/hooks/useCountdown";

export default function CountdownTimer({ seconds, onDone }: { seconds: number; onDone?: () => void }) {
  const { remaining, start } = useCountdown(seconds);
  useEffect(() => {
    start(seconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  useEffect(() => {
    if (remaining === 0) onDone?.();
  }, [remaining, onDone]);

  return <span aria-live="polite" className="tabular-nums">{remaining}s</span>;
}
