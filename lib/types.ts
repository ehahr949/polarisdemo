/* ------------------------------------------------------------------ */
/*  DATA MODEL  (PRD §7 — persisted on-device as one blob, one key)    */
/* ------------------------------------------------------------------ */

export type SessionType = "Training" | "Match" | "Gym" | "Recovery";

export type Stage =
  | "researching"
  | "outreach"
  | "conversation"
  | "trial"
  | "offer";

export type PathwayType = "team" | "agent" | "league" | "coach";

export interface Profile {
  name: string;
  position: string;
  /** Local `YYYY-MM-DD`, or "" when unset. */
  goalDate: string;
  weightKg: number;
  proteinTarget: number;
}

export interface Checkin {
  /** Local `YYYY-MM-DD`. One per day. */
  date: string;
  sleepHrs: number;
  sleepQ: number; // 1-5, higher = better
  soreness: number; // 1-5, higher = worse
  fatigue: number; // 1-5, higher = worse
  stress: number; // 1-5, higher = worse
  mood: number; // 1-5, higher = better
}

export interface Session {
  id: string;
  /** Local `YYYY-MM-DD`. */
  date: string;
  type: SessionType;
  durationMin: number;
  rpe: number; // 1-10
}

export interface FuelDay {
  protein?: boolean;
  hydration?: boolean;
  fuel?: boolean;
  produce?: boolean;
}

/** Keyed by local `YYYY-MM-DD`. */
export type Fueling = Record<string, FuelDay>;

export interface PathwayItem {
  id: string;
  name: string;
  type: PathwayType;
  region: string;
  stage: Stage;
  notes: string;
}

export interface AppData {
  profile: Profile;
  checkins: Checkin[];
  sessions: Session[];
  fueling: Fueling;
  pathway: PathwayItem[];
}
