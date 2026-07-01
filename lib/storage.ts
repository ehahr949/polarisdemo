import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AppData } from "./types";

/* ------------------------------------------------------------------ */
/*  PERSISTENCE  (one JSON blob, single key — PRD §7, §11 MVP)         */
/* ------------------------------------------------------------------ */
const KEY = "polaris_v1";

export async function loadData(): Promise<AppData | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as AppData;
  } catch (e) {
    // Corrupt/unreadable blob → fall back to a fresh seed upstream.
  }
  return null;
}

export async function saveData(d: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(d));
  } catch (e) {
    // Best-effort; nothing actionable for a single-user local app.
  }
}
