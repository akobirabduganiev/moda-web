"use client";

import { motion } from "framer-motion";
import React from "react";

export type AnimatedBarProps = {
  percent: number; // 0..100
  color?: string;
  title?: string;
  height?: number;
};

export default function AnimatedBar({ percent, color = "#3b82f6", title, height = 12 }: AnimatedBarProps) {
  const width = Math.max(0, Math.min(100, percent));
  return (
    <div className="w-full bg-gray-200/50 rounded" style={{ height }} aria-label={title} title={title}>
      <motion.div
        className="h-full rounded"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
    </div>
  );
}
