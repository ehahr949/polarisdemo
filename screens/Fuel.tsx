import { Check } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { dstr } from "../lib/dates";
import { fuelCount, fuelingStreak, FUEL_KEYS } from "../lib/engine";
import type { AppData, FuelDay } from "../lib/types";
import { colors } from "../theme/colors";
import { s } from "../theme/styles";

type SetData = React.Dispatch<React.SetStateAction<AppData>>;
type FuelKey = (typeof FUEL_KEYS)[number];

export function Fuel({ data, setData }: { data: AppData; setData: SetData }) {
  const today = dstr();
  const f: FuelDay = data.fueling[today] || {};

  const toggle = (k: FuelKey) =>
    setData((d) => ({
      ...d,
      fueling: {
        ...d.fueling,
        [today]: { ...(d.fueling[today] || {}), [k]: !(d.fueling[today] || {})[k] },
      },
    }));

  const items: Array<[FuelKey, string, string]> = [
    ["protein", `Hit protein (~${data.profile.proteinTarget || 117}g)`, "Spread across the day; anchor each meal with a protein source."],
    ["hydration", "Hydrated well", "Pale-yellow urine is the simplest gauge; more on training days."],
    ["fuel", "Fueled around training", "Carbs before, protein + carbs within ~an hour after."],
    ["produce", "5+ servings fruit/veg", "Color variety covers most micronutrient bases."],
  ];

  // 7-day grid
  const days: Array<{ n: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const ds = dstr(new Date(Date.now() - i * 86400000));
    days.push({ n: fuelCount(data.fueling[ds]) });
  }
  const streak = fuelingStreak(data.fueling);

  return (
    <View>
      <View style={s.card}>
        <View style={s.spread}>
          <Text style={[s.label, { marginBottom: 0 }]}>Today's fueling</Text>
          <Text style={[s.tiny, { color: colors.go }]}>{streak > 0 ? `${streak}-day streak` : ""}</Text>
        </View>

        <View style={{ marginTop: 14 }}>
          {items.map(([k, lbl, hint]) => {
            const on = !!f[k];
            return (
              <Pressable
                key={k}
                onPress={() => toggle(k)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={lbl}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 10,
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.line,
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    marginTop: 1,
                    borderWidth: 1,
                    borderColor: on ? colors.go : colors.line,
                    backgroundColor: on ? colors.go : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {on && <Check size={16} color={colors.ink} strokeWidth={3} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.text, s.semibold]}>{lbl}</Text>
                  <Text style={[s.tiny, s.muted, { marginTop: 2, lineHeight: 18 }]}>{hint}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={[s.tiny, s.muted, { marginTop: 12, lineHeight: 19 }]}>
          Built around fueling <Text style={{ fontStyle: "italic" }}>enough</Text> to train and
          recover — not restriction. For a performance athlete, consistently hitting protein and
          fueling around sessions matters more than chasing a calorie number.
        </Text>
      </View>

      <View style={[s.card, { marginBottom: 0 }]}>
        <Text style={s.label}>This week</Text>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {days.map((d, i) => {
            const full = d.n >= 4;
            const partial = d.n >= 2;
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  borderRadius: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: d.n ? "transparent" : colors.line,
                  backgroundColor: full ? colors.go : partial ? "rgba(54,226,124,0.3)" : colors.panel2,
                }}
              >
                <Text style={[s.tiny, { color: full ? colors.ink : colors.muted }]}>
                  {d.n || ""}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
