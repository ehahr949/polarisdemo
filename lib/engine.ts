/* ------------------------------------------------------------------ */
/*  SCORING ENGINE  (the core IP — PRD §5, transparent & heuristic)    */
/*                                                                    */
/*  Pure, framework-agnostic. The UI imports from here and never       */
/*  recomputes inline. Ported verbatim from the Polaris.jsx prototype. */
/* ------------------------------------------------------------------ */
import { clamp, dayDiff, dstr } from "./dates";
import type { Checkin, Fueling, FuelDay, Session } from "./types";

/* ---- §5.1 Session load (sRPE) ------------------------------------ */
export const sessionLoad = (s: Pick<Session, "rpe" | "durationMin">): number =>
  Math.round((Number(s.rpe) || 0) * (Number(s.durationMin) || 0));

/* ---- §5.5 Protein target default --------------------------------- */
export const proteinTarget = (weightKg: number): number =>
  Math.round((Number(weightKg) || 0) * 1.8);

/* ---- §5.2 Readiness score (0–100) -------------------------------- */
export function readinessFor(c: Checkin | null | undefined): number | null {
  if (!c) return null;
  const hb = (x: number) => clamp((x - 1) / 4, 0, 1); // higher = better (1-5)
  const lb = (x: number) => clamp((5 - x) / 4, 0, 1); // higher = worse (1-5)
  const sleepHrsScore = clamp((Number(c.sleepHrs) - 4) / 4, 0, 1); // 4h->0, 8h+->1
  const parts: Array<[number, number]> = [
    [hb(c.sleepQ), 1.5],
    [sleepHrsScore, 1.5],
    [lb(c.soreness), 1.5],
    [lb(c.fatigue), 1.5],
    [lb(c.stress), 1],
    [hb(c.mood), 1],
  ];
  const totW = parts.reduce((a, [, w]) => a + w, 0);
  const sum = parts.reduce((a, [v, w]) => a + v * w, 0);
  return Math.round((sum / totW) * 100);
}

/* ---- §5.3 Training load & injury-risk ratio (ACWR) --------------- */
export interface LoadStats {
  acute: number;
  chronicWeekly: number;
  acwr: number | null;
  enough: boolean;
}

export function loadStats(sessions: Session[]): LoadStats {
  const within = (n: number) =>
    sessions.filter((s) => {
      const d = dayDiff(s.date);
      return d >= 0 && d < n;
    });
  const acute = within(7).reduce((a, s) => a + sessionLoad(s), 0);
  const chronicSum = within(28).reduce((a, s) => a + sessionLoad(s), 0);
  const chronicWeekly = chronicSum / 4;
  // Baseline gate: need ≥4 sessions AND a positive chronic average.
  const enough = sessions.length >= 4 && chronicWeekly > 0;
  const acwr = enough ? acute / chronicWeekly : null;
  return { acute, chronicWeekly: Math.round(chronicWeekly), acwr, enough };
}

/* ---- §5.4 Daily recommendation (traffic light) ------------------- */
export type RecKey = "base" | "stop" | "hold" | "go";

export interface Recommendation {
  key: RecKey;
  title: string;
  msg: string;
  reasons: string[];
}

export function recommendation(
  readiness: number | null,
  stats: LoadStats,
  lastCheckin: Checkin | null | undefined
): Recommendation {
  if (!stats.enough) {
    return {
      key: "base",
      title: "Building your baseline",
      msg: "Log roughly two weeks of sessions and a few daily check-ins. Once there's a baseline, you'll get a real readiness + injury-risk read.",
      reasons: [],
    };
  }
  const reasons: string[] = [];
  const acwr = stats.acwr as number;
  const sore = lastCheckin ? Number(lastCheckin.soreness) : 3;

  if (acwr > 1.5)
    reasons.push(
      `Workload spike — acute:chronic ratio ${acwr.toFixed(2)} (>1.5 is the high-risk zone)`
    );
  if (readiness != null && readiness < 40)
    reasons.push(
      `Low readiness (${readiness}) — your body's telling you it's not recovered`
    );
  if (sore >= 4) reasons.push("High soreness reported this morning");

  if (acwr > 1.5 || (readiness != null && readiness < 40)) {
    return {
      key: "stop",
      title: "Pull back today",
      msg: "Strain signals are high. Make today easy — light movement, sleep, fuel well. If soreness is sharp or localized (not just general fatigue), get it looked at before training on it.",
      reasons,
    };
  }
  if (
    (acwr >= 1.3 && acwr <= 1.5) ||
    (readiness != null && readiness >= 40 && readiness < 60) ||
    sore === 3
  ) {
    if (acwr >= 1.3)
      reasons.push(`Ramping fast — ratio ${acwr.toFixed(2)} (1.3–1.5 = caution band)`);
    if (readiness != null && readiness < 60)
      reasons.push(`Moderate readiness (${readiness})`);
    return {
      key: "hold",
      title: "Train — but cap it",
      msg: "Quality over volume today. Keep the session short and hold perceived effort around 6 or below. Don't add a second hard block.",
      reasons,
    };
  }
  reasons.push(
    `Readiness ${readiness} and workload ratio ${acwr ? acwr.toFixed(2) : "—"} both in the green`
  );
  return {
    key: "go",
    title: "Green light",
    msg: "Body and workload both look good. This is a day you can push — add intensity or a hard session if it fits the plan.",
    reasons,
  };
}

/* ---- Band → color key + label (UI resolves colorKey via theme) --- */
export type BandColorKey = "go" | "hold" | "stop" | "muted";

export const BAND: Record<RecKey, { colorKey: BandColorKey; label: string }> = {
  go: { colorKey: "go", label: "GO" },
  hold: { colorKey: "hold", label: "HOLD" },
  stop: { colorKey: "stop", label: "STOP" },
  base: { colorKey: "muted", label: "—" },
};

/* ---- §5.6 Fueling ------------------------------------------------ */
export const FUEL_KEYS = ["protein", "hydration", "fuel", "produce"] as const;

/** Count of checked items for a day (0–4). */
export const fuelCount = (f: FuelDay | undefined): number =>
  FUEL_KEYS.filter((k) => (f || {})[k]).length;

/** A day is "fueled" if ≥3 of the 4 items are checked. */
export const isFueledDay = (f: FuelDay | undefined): boolean => fuelCount(f) >= 3;

/**
 * Consecutive "fueled" days counting back from `from` (default today).
 * Stops at the first day that isn't fueled.
 */
export function fuelingStreak(fueling: Fueling, from: Date = new Date()): number {
  let streak = 0;
  for (let i = 0; ; i++) {
    const ds = dstr(new Date(from.getTime() - i * 86400000));
    if (isFueledDay(fueling[ds])) streak++;
    else break;
  }
  return streak;
}
