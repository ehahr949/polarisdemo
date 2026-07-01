import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { dstr } from "../lib/dates";
import type { AppData, Checkin } from "../lib/types";
import { s } from "../theme/styles";
import { Chip } from "./Chip";
import { Scale } from "./Scale";

type SetData = React.Dispatch<React.SetStateAction<AppData>>;

type Draft = Omit<Checkin, "date">;

const DEFAULT: Draft = { sleepHrs: 8, sleepQ: 3, soreness: 3, fatigue: 3, stress: 3, mood: 3 };

const ROWS: Array<[string, keyof Draft]> = [
  ["Sleep quality", "sleepQ"],
  ["Soreness", "soreness"],
  ["Fatigue", "fatigue"],
  ["Stress", "stress"],
  ["Mood", "mood"],
];

export function CheckinForm({
  setData,
  existing,
}: {
  setData: SetData;
  existing?: Checkin;
}) {
  const [c, setC] = useState<Draft>(existing ?? DEFAULT);
  const set = (k: keyof Draft, v: number) => setC((p) => ({ ...p, [k]: v }));

  const save = () => {
    const entry: Checkin = { ...c, date: dstr() };
    setData((d) => ({
      ...d,
      checkins: [entry, ...d.checkins.filter((x) => x.date !== dstr())],
    }));
  };

  return (
    <View>
      <View style={[s.spread, { marginBottom: 6 }]}>
        <Text style={[s.tiny, s.muted]}>Hours slept</Text>
        <Text style={s.bold}>{c.sleepHrs}h</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {[5, 6, 7, 8, 9, 10].map((h) => (
          <Chip
            key={h}
            label={h}
            on={c.sleepHrs === h}
            onPress={() => set("sleepHrs", h)}
            accessibilityLabel={`${h} hours slept`}
          />
        ))}
      </View>

      {ROWS.map(([lbl, k]) => (
        <View key={k} style={{ marginBottom: 12 }}>
          <Text style={[s.tiny, s.muted, { marginBottom: 6 }]}>
            {lbl}{" "}
            <Text style={{ opacity: 0.6 }}>
              {k === "sleepQ" || k === "mood" ? "(5 = great)" : "(5 = high)"}
            </Text>
          </Text>
          <Scale value={c[k]} onChange={(v) => set(k, v)} label={lbl} />
        </View>
      ))}

      <Pressable style={[s.btn, { marginTop: 4 }]} onPress={save} accessibilityRole="button">
        <Text style={s.btnTxt}>{existing ? "Update check-in" : "Save check-in"}</Text>
      </Pressable>
    </View>
  );
}
