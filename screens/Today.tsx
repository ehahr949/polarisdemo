import { ArrowRight, ChevronRight, Flame, Target } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ring } from "../components/Ring";
import { dayDiff, dstr } from "../lib/dates";
import { BAND, fuelCount, loadStats, readinessFor, recommendation } from "../lib/engine";
import type { AppData } from "../lib/types";
import { bandColor, colors } from "../theme/colors";
import { s } from "../theme/styles";

type SetData = React.Dispatch<React.SetStateAction<AppData>>;

export function Today({
  data,
  go,
}: {
  data: AppData;
  setData: SetData;
  go: (t: string) => void;
}) {
  const todayC = data.checkins.find((c) => c.date === dstr());
  const readiness = readinessFor(todayC);
  const stats = loadStats(data.sessions);
  const rec = recommendation(readiness, stats, todayC);
  const band = BAND[rec.key];
  const color = bandColor(band.colorKey);
  const fuelDone = fuelCount(data.fueling[dstr()]);
  const nextPath = data.pathway.find((p) => p.stage !== "offer");
  const daysToGoal = data.profile.goalDate ? dayDiff(data.profile.goalDate) * -1 : null;

  return (
    <View>
      {!data.profile.name && (
        <View style={[s.card, { borderColor: colors.go }]}>
          <Text style={[s.label, { color: colors.go }]}>Set up your file</Text>
          <Text style={[s.tiny, s.muted, { marginBottom: 12, lineHeight: 18 }]}>
            Two things and you're running: your name and your goal date (when you want to be signed).
          </Text>
          <Pressable style={s.btn} onPress={() => go("settings")} accessibilityRole="button">
            <Text style={s.btnTxt}>Set it up</Text>
            <ArrowRight size={17} color={colors.ink} />
          </Pressable>
        </View>
      )}

      {/* Readiness + recommendation */}
      <View style={[s.card, { alignItems: "center", paddingBottom: 20 }]}>
        <Ring score={readiness} color={color} />
        <View style={{ marginTop: 6 }}>
          <Text style={[s.stage, { backgroundColor: color, color: colors.ink }]}>
            {band.label} · {rec.title}
          </Text>
        </View>
        <Text style={[s.tiny, s.chalk, { marginHorizontal: 4, marginTop: 14, lineHeight: 21, textAlign: "center" }]}>
          {rec.msg}
        </Text>
        {rec.reasons.length > 0 && (
          <View style={{ alignSelf: "stretch", marginTop: 12 }}>
            {rec.reasons.map((r, i) => (
              <View key={i} style={{ flexDirection: "row", marginTop: 5, gap: 6 }}>
                <Text style={{ color, lineHeight: 17 }}>—</Text>
                <Text style={[s.tiny, s.muted, { flex: 1, lineHeight: 17 }]}>{r}</Text>
              </View>
            ))}
          </View>
        )}
        {!todayC && (
          <Pressable
            style={[s.btn, s.btnGhost, { marginTop: 14 }]}
            onPress={() => go("train")}
            accessibilityRole="button"
          >
            <Text style={[s.btnTxt, s.btnGhostTxt]}>Log this morning's check-in</Text>
          </Pressable>
        )}
      </View>

      {/* Stat tiles */}
      <View style={{ flexDirection: "row", gap: 14, marginBottom: 14 }}>
        <View style={[s.card, { flex: 1, marginBottom: 0 }]}>
          <Text style={[s.label, { marginBottom: 6 }]}>7-Day Load</Text>
          <Text style={[s.big, { fontSize: 34 }]}>{stats.acute}</Text>
          <Text style={[s.tiny, s.muted]}>vs {stats.chronicWeekly} typical</Text>
        </View>
        <View style={[s.card, { flex: 1, marginBottom: 0 }]}>
          <Text style={[s.label, { marginBottom: 6 }]}>Injury Risk</Text>
          <Text style={[s.big, { fontSize: 34, color }]}>
            {stats.acwr == null ? "–" : stats.acwr.toFixed(2)}
          </Text>
          <Text style={[s.tiny, s.muted]}>workload ratio</Text>
        </View>
      </View>

      {/* Fueling teaser */}
      <Pressable style={s.card} onPress={() => go("fuel")} accessibilityRole="button">
        <View style={s.spread}>
          <View style={s.row}>
            <Flame size={17} color={colors.hold} />
            <Text style={[s.label, { marginBottom: 0 }]}>Fueling today</Text>
          </View>
          <ChevronRight size={18} color={colors.muted} />
        </View>
        <View style={[s.spread, { marginTop: 10 }]}>
          <Text style={[s.big, { fontSize: 26 }]}>
            {fuelDone}
            <Text style={[s.muted, { fontSize: 18 }]}>/4</Text>
          </Text>
          <Text style={[s.tiny, s.muted]}>{fuelDone === 4 ? "Dialed in" : "Tap to log"}</Text>
        </View>
      </Pressable>

      {/* Next pathway step */}
      {nextPath && (
        <Pressable
          style={[s.card, { marginBottom: 0 }]}
          onPress={() => go("path")}
          accessibilityRole="button"
        >
          <View style={s.spread}>
            <View style={s.row}>
              <Target size={17} color={colors.go} />
              <Text style={[s.label, { marginBottom: 0 }]}>Next on the path</Text>
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </View>
          <Text style={[s.text, s.semibold, { marginTop: 8 }]}>{nextPath.name}</Text>
          <Text style={[s.tiny, s.muted, { marginTop: 2, textTransform: "capitalize" }]}>
            {nextPath.stage.replace("_", " ")}
            {daysToGoal != null ? ` · ${daysToGoal} days to your goal` : ""}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
