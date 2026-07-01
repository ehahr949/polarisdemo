/* ------------------------------------------------------------------ */
/*  DATE + MATH HELPERS                                                */
/*                                                                    */
/*  Pure, framework-agnostic. Dates are LOCAL `YYYY-MM-DD` strings.   */
/*  Never use toISOString — it's UTC and drifts a day in PT.          */
/* ------------------------------------------------------------------ */

/** Local `YYYY-MM-DD` for a Date (defaults to now). */
export const dstr = (d: Date = new Date()): string => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(
    x.getDate()
  ).padStart(2, "0")}`;
};

/** Parse a local `YYYY-MM-DD` string into a local Date at midnight. */
export const parseD = (s: string): Date => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/**
 * Whole-day difference `from - s` (default from = today).
 * Today = 0, yesterday = 1, tomorrow = -1.
 * The optional `from` argument is behavior-preserving (defaults to today)
 * and exists so tests can pin a reference day deterministically.
 */
export const dayDiff = (s: string, from: string = dstr()): number => {
  const a = parseD(from);
  const b = parseD(s);
  return Math.round((a.getTime() - b.getTime()) / 86400000);
};

export const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));
