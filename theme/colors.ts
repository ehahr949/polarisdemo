/* ------------------------------------------------------------------ */
/*  COLOR TOKENS  (ported from the prototype's CSS variables)          */
/* ------------------------------------------------------------------ */

export const colors = {
  ink: "#0C0F14",
  panel: "#151A22",
  panel2: "#1D2530",
  line: "#2A323E",
  chalk: "#F1F4F0",
  muted: "#8C96A3",
  go: "#36E27C",
  hold: "#F6B23D",
  stop: "#FF5A52",
  // pathway-stage accents
  blue: "#5B8DEF",
  purple: "#B07CF0",
} as const;

export type ColorKey = keyof typeof colors;

/** Resolve an engine BAND colorKey ("go" | "hold" | "stop" | "muted") to a hex. */
export const bandColor = (key: "go" | "hold" | "stop" | "muted"): string => colors[key];
