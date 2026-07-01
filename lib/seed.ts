import { proteinTarget } from "./engine";
import type { AppData } from "./types";

/* ------------------------------------------------------------------ */
/*  SEED  (first-run data; example pathway entries + career context)   */
/* ------------------------------------------------------------------ */
export function seed(): AppData {
  const wk = 65;
  return {
    profile: {
      name: "",
      weightKg: wk,
      position: "",
      goalDate: "",
      proteinTarget: proteinTarget(wk),
    },
    checkins: [],
    sessions: [],
    fueling: {},
    pathway: [
      {
        id: "ex1",
        name: "Example: Local NWSL club — scouting dept",
        type: "team",
        region: "USA",
        stage: "researching",
        notes:
          "Tap to edit. The draft is gone — entry is direct negotiation now. Goal: get on their scouting radar via film + an invite to a trial.",
      },
      {
        id: "ex2",
        name: "Example: Agent intro (referral)",
        type: "agent",
        region: "USA",
        stage: "outreach",
        notes:
          "Example pipeline entry. Advance the stage as the relationship moves.",
      },
    ],
  };
}
