import { clamp, dayDiff, dstr, parseD } from "../lib/dates";
import {
  BAND,
  fuelCount,
  fuelingStreak,
  isFueledDay,
  loadStats,
  proteinTarget,
  readinessFor,
  recommendation,
  sessionLoad,
} from "../lib/engine";
import type { Checkin, Fueling, Session } from "../lib/types";

/* Build a local YYYY-MM-DD `n` days before today. */
const dayAgo = (n: number): string => dstr(new Date(Date.now() - n * 86400000));

const mkSession = (date: string, rpe: number, durationMin: number): Session => ({
  id: date + "-" + rpe + "-" + durationMin,
  date,
  type: "Training",
  rpe,
  durationMin,
});

const mkCheckin = (over: Partial<Checkin> = {}): Checkin => ({
  date: dstr(),
  sleepHrs: 8,
  sleepQ: 3,
  soreness: 3,
  fatigue: 3,
  stress: 3,
  mood: 3,
  ...over,
});

/* ---------------------------------------------------------------- */
/*  §5.1 Session load                                                */
/* ---------------------------------------------------------------- */
describe("sessionLoad (§5.1)", () => {
  it("is round(rpe * durationMin)", () => {
    expect(sessionLoad({ rpe: 6, durationMin: 60 })).toBe(360);
    expect(sessionLoad({ rpe: 7, durationMin: 45 })).toBe(315);
  });
  it("treats missing/invalid inputs as 0", () => {
    expect(sessionLoad({ rpe: 0, durationMin: 60 })).toBe(0);
    expect(sessionLoad({} as any)).toBe(0);
  });
});

/* ---------------------------------------------------------------- */
/*  §5.5 Protein target                                              */
/* ---------------------------------------------------------------- */
describe("proteinTarget (§5.5)", () => {
  it("is round(weightKg * 1.8)", () => {
    expect(proteinTarget(65)).toBe(117);
    expect(proteinTarget(70)).toBe(126);
    expect(proteinTarget(0)).toBe(0);
  });
});

/* ---------------------------------------------------------------- */
/*  §5.2 Readiness                                                   */
/* ---------------------------------------------------------------- */
describe("readinessFor (§5.2)", () => {
  it("returns null with no check-in", () => {
    expect(readinessFor(null)).toBeNull();
    expect(readinessFor(undefined)).toBeNull();
  });
  it("all-neutral (3s, 8h sleep) → 59", () => {
    // Weights sum to 8 (1.5×4 + 1×2); the engine divides by the true total,
    // matching the Polaris.jsx reference implementation.
    expect(readinessFor(mkCheckin())).toBe(59);
  });
  it("perfect inputs → 100", () => {
    expect(
      readinessFor(
        mkCheckin({ sleepHrs: 8, sleepQ: 5, soreness: 1, fatigue: 1, stress: 1, mood: 5 })
      )
    ).toBe(100);
  });
  it("worst inputs → 0", () => {
    expect(
      readinessFor(
        mkCheckin({ sleepHrs: 4, sleepQ: 1, soreness: 5, fatigue: 5, stress: 5, mood: 1 })
      )
    ).toBe(0);
  });
  it("clamps sleep hours (4h→0, 8h+→1)", () => {
    const base = { sleepQ: 3, soreness: 3, fatigue: 3, stress: 3, mood: 3 };
    expect(readinessFor(mkCheckin({ ...base, sleepHrs: 10 }))).toBe(
      readinessFor(mkCheckin({ ...base, sleepHrs: 8 }))
    );
    expect(readinessFor(mkCheckin({ ...base, sleepHrs: 2 }))).toBe(
      readinessFor(mkCheckin({ ...base, sleepHrs: 4 }))
    );
  });
});

/* ---------------------------------------------------------------- */
/*  §5.3 Load stats & ACWR + baseline gate                          */
/* ---------------------------------------------------------------- */
describe("loadStats (§5.3)", () => {
  it("returns null acwr with < 4 sessions (baseline gate)", () => {
    const s = [mkSession(dayAgo(0), 6, 60), mkSession(dayAgo(1), 6, 60), mkSession(dayAgo(2), 6, 60)];
    const stats = loadStats(s);
    expect(stats.enough).toBe(false);
    expect(stats.acwr).toBeNull();
  });
  it("returns null acwr when chronicWeekly is 0 even with ≥4 sessions", () => {
    // 4 sessions but all older than 28 days → no load in window.
    const s = [40, 41, 42, 43].map((n) => mkSession(dayAgo(n), 6, 60));
    const stats = loadStats(s);
    expect(stats.enough).toBe(false);
    expect(stats.acwr).toBeNull();
  });
  it("computes acute, chronicWeekly and acwr ≈ 1.0 for evenly spread load", () => {
    const s = [0, 7, 14, 21].map((n) => mkSession(dayAgo(n), 6, 60)); // 360 each
    const stats = loadStats(s);
    expect(stats.acute).toBe(360);
    expect(stats.chronicWeekly).toBe(360);
    expect(stats.acwr).toBeCloseTo(1.0, 5);
    expect(stats.enough).toBe(true);
  });
  it("computes a high acwr when all load is in the last 7 days", () => {
    const s = [0, 1, 2, 3].map((n) => mkSession(dayAgo(n), 6, 60));
    const stats = loadStats(s);
    expect(stats.acute).toBe(1440);
    expect(stats.chronicWeekly).toBe(360);
    expect(stats.acwr).toBeCloseTo(4.0, 5);
  });
});

/* ---------------------------------------------------------------- */
/*  §5.4 Recommendation (traffic light) — all 4 branches            */
/* ---------------------------------------------------------------- */
describe("recommendation (§5.4)", () => {
  const evenLoad = () => loadStats([0, 7, 14, 21].map((n) => mkSession(dayAgo(n), 6, 60)));

  it("BASELINE when not enough data", () => {
    const rec = recommendation(80, loadStats([]), null);
    expect(rec.key).toBe("base");
    expect(rec.reasons).toHaveLength(0);
  });

  it("STOP when acwr > 1.5", () => {
    const spike = loadStats([0, 1, 2, 3].map((n) => mkSession(dayAgo(n), 6, 60))); // acwr 4.0
    const rec = recommendation(80, spike, mkCheckin({ soreness: 2 }));
    expect(rec.key).toBe("stop");
    expect(rec.reasons.some((r) => r.includes("Workload spike"))).toBe(true);
  });

  it("STOP when readiness < 40", () => {
    const rec = recommendation(30, evenLoad(), mkCheckin({ soreness: 2 }));
    expect(rec.key).toBe("stop");
    expect(rec.reasons.some((r) => r.includes("Low readiness"))).toBe(true);
  });

  it("HOLD when acwr in the caution band [1.3, 1.5]", () => {
    // day0=480(8*60), older=300(5*60) → acwr ≈ 1.39
    const s = [mkSession(dayAgo(0), 8, 60), mkSession(dayAgo(10), 5, 60), mkSession(dayAgo(17), 5, 60), mkSession(dayAgo(24), 5, 60)];
    const stats = loadStats(s);
    expect(stats.acwr).toBeCloseTo(1.39, 2);
    const rec = recommendation(80, stats, mkCheckin({ soreness: 2 }));
    expect(rec.key).toBe("hold");
    expect(rec.reasons.some((r) => r.includes("Ramping fast"))).toBe(true);
  });

  it("HOLD when readiness in [40, 60)", () => {
    const rec = recommendation(50, evenLoad(), mkCheckin({ soreness: 2 }));
    expect(rec.key).toBe("hold");
    expect(rec.reasons.some((r) => r.includes("Moderate readiness"))).toBe(true);
  });

  it("HOLD when soreness == 3", () => {
    const rec = recommendation(80, evenLoad(), mkCheckin({ soreness: 3 }));
    expect(rec.key).toBe("hold");
  });

  it("GO when readiness and acwr are both green", () => {
    const rec = recommendation(80, evenLoad(), mkCheckin({ soreness: 2 }));
    expect(rec.key).toBe("go");
    expect(rec.reasons.some((r) => r.includes("both in the green"))).toBe(true);
  });

  it("every band maps to a color key + label", () => {
    (["go", "hold", "stop", "base"] as const).forEach((k) => {
      expect(BAND[k].colorKey).toBeTruthy();
      expect(BAND[k].label).toBeTruthy();
    });
  });
});

/* ---------------------------------------------------------------- */
/*  §5.6 Fueling streak                                              */
/* ---------------------------------------------------------------- */
describe("fueling (§5.6)", () => {
  it("counts checked items and flags a fueled day at ≥3", () => {
    expect(fuelCount({ protein: true, hydration: true, fuel: true, produce: true })).toBe(4);
    expect(fuelCount({ protein: true, hydration: true })).toBe(2);
    expect(isFueledDay({ protein: true, hydration: true, fuel: true })).toBe(true);
    expect(isFueledDay({ protein: true, hydration: true })).toBe(false);
  });

  it("counts consecutive fueled days back from today, stopping at the first gap", () => {
    const fueling: Fueling = {
      [dayAgo(0)]: { protein: true, hydration: true, fuel: true }, // 3 → fueled
      [dayAgo(1)]: { protein: true, hydration: true, fuel: true, produce: true }, // 4 → fueled
      [dayAgo(2)]: { protein: true, hydration: true }, // 2 → NOT fueled
      [dayAgo(3)]: { protein: true, hydration: true, fuel: true }, // would be fueled but blocked
    };
    expect(fuelingStreak(fueling)).toBe(2);
  });

  it("is 0 with no fueling data", () => {
    expect(fuelingStreak({})).toBe(0);
  });
});

/* ---------------------------------------------------------------- */
/*  Date helpers — LOCAL, no UTC drift                              */
/* ---------------------------------------------------------------- */
describe("date helpers", () => {
  it("dstr uses local calendar fields", () => {
    expect(dstr(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(dstr(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
  it("dstr does not drift like toISOString for local midnight", () => {
    // A local midnight can be the previous UTC day; dstr must keep the local date.
    const d = new Date(2026, 0, 1, 0, 0, 0);
    expect(dstr(d)).toBe("2026-01-01");
  });
  it("parseD round-trips with dstr", () => {
    expect(dstr(parseD("2026-03-14"))).toBe("2026-03-14");
  });
  it("dayDiff is from - s in whole days", () => {
    expect(dayDiff("2026-01-01", "2026-01-08")).toBe(7);
    expect(dayDiff("2026-01-08", "2026-01-01")).toBe(-7);
    expect(dayDiff(dstr())).toBe(0);
  });
  it("clamp bounds a value", () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });
});
