import { t } from "./i18n";

export type MoodMeta = { code: string; emoji: string; label: string };

// Known moods and emoji mapping
export const MOOD_EMOJI: Record<string, string> = {
  HAPPY: "😊",
  SAD: "😢",
  TIRED: "😴",
  ANGRY: "😠",
  CALM: "😌",
  EXCITED: "🤩",
  NEUTRAL: "😐",
  POSITIVE: "🙂",
  ENERGETIC: "⚡️",
};

export function getMoodMeta(code: string, locale?: string | null): MoodMeta {
  const c = (code || "").toUpperCase();
  const emoji = MOOD_EMOJI[c] || "";
  const label = t(`mood.${c}`, locale);
  return { code: c || code, emoji, label };
}

export const PIE_COLORS = [
  "var(--mood-excited)",
  "var(--mood-angry)",
  "var(--mood-positive)",
  "var(--mood-energetic)",
  "var(--mood-sad)",
  "var(--mood-calm)",
  "var(--mood-neutral)",
];
