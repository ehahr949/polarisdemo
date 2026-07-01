import { Plus, X } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { BarChart, BarDay } from "../components/BarChart";
import { CheckinForm } from "../components/CheckinForm";
import { Chip } from "../components/Chip";
import { dstr, parseD } from "../lib/dates";
import { loadStats, sessionLoad } from "../lib/engine";
import type { AppData, Session, SessionType } from "../lib/types";
import { colors } from "../theme/colors";
import { s } from "../theme/styles";

type SetData = React.Dispatch<React.SetStateAction<AppData>>;

const TYPES: SessionType[] = ["Training", "Match", "Gym", "Recovery"];
const DOW = ["S", "M", "T", "W", "T", "F", "S"];

export function Train({ data, setData }: { data: AppData; setData: SetData }) {
  const todayC = data.checkins.find((c) => c.date === dstr());
  const [type, setType] = useState<SessionType>("Training");
  const [dur, setDur] = useState(60);
  const [rpe, setRpe] = useState(6);
  const stats = loadStats(data.sessions);

  const addSession = () => {
    const s2: Session = { id: Date.now().toString(), date: dstr(), type, durationMin: Number(dur), rpe };
    setData((d) => ({ ...d, sessions: [s2, ...d.sessions] }));
    setDur(60);
    setRpe(6);
  };
  const delSession = (id: string) =>
    setData((d) => ({ ...d, sessions: d.sessions.filter((x) => x.id !== id) }));

  // 7-day bars
  const days: BarDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const ds = dstr(new Date(Date.now() - i * 86400000));
    const load = data.sessions
      .filter((x) => x.date === ds)
      .reduce((a, x) => a + sessionLoad(x), 0);
    days.push({ load, lbl: DOW[parseD(ds).getDay()] });
  }

  return (
    <View>
      {/* Log a session */}
      <View style={s.card}>
        <Text style={s.label}>Log a session</Text>
        <View style={[s.seg, { marginBottom: 12 }]}>
          {TYPES.map((t) => {
            const on = type === t;
            return (
              <Pressable
                key={t}
                style={[s.segBtn, on && s.segBtnOn]}
                onPress={() => setType(t)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <Text style={[s.segTxt, on && s.segTxtOn, { fontSize: 13 }]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[s.spread, { marginBottom: 6 }]}>
          <Text style={[s.tiny, s.muted]}>Duration</Text>
          <Text style={s.bold}>{dur} min</Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          {[30, 45, 60, 75, 90].map((m) => (
            <Chip key={m} label={m} on={dur === m} onPress={() => setDur(m)} accessibilityLabel={`${m} minutes`} />
          ))}
        </View>

        <View style={[s.spread, { marginBottom: 6 }]}>
          <Text style={[s.tiny, s.muted]}>Effort (RPE 1–10)</Text>
          <Text style={s.bold}>{rpe}</Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, marginBottom: 16 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <Chip
              key={n}
              label={n}
              on={rpe === n}
              onPress={() => setRpe(n)}
              style={{ flexGrow: 1, flexBasis: 26, minWidth: 26, paddingHorizontal: 0, paddingVertical: 9 }}
              accessibilityLabel={`RPE ${n}`}
            />
          ))}
        </View>

        <Pressable style={s.btn} onPress={addSession} accessibilityRole="button">
          <Plus size={18} color={colors.ink} />
          <Text style={s.btnTxt}>Add session · load {rpe * dur}</Text>
        </Pressable>
      </View>

      {/* 7-day load */}
      <View style={s.card}>
        <View style={[s.spread, { marginBottom: 18 }]}>
          <Text style={[s.label, { marginBottom: 0 }]}>Last 7 days</Text>
          <Text style={[s.tiny, s.muted]}>
            ratio {stats.acwr == null ? "building" : stats.acwr.toFixed(2)}
          </Text>
        </View>
        <BarChart days={days} />
        <View style={{ height: 8 }} />
        <Text style={[s.tiny, s.muted, { lineHeight: 19 }]}>
          Load = effort × minutes. The "ratio" compares this week against your 4-week norm. Roughly
          0.8–1.3 is the sweet spot; spiking past ~1.5 is when injury risk climbs. It's a heuristic,
          not a diagnosis — sharp or localized pain means see a sports-med pro.
        </Text>
      </View>

      {/* Morning check-in */}
      <View style={s.card}>
        <Text style={s.label}>
          Morning check-in {todayC && <Text style={{ color: colors.go }}>· logged</Text>}
        </Text>
        <CheckinForm key={todayC?.date ?? "new"} setData={setData} existing={todayC} />
      </View>

      {/* Recent sessions */}
      {data.sessions.length > 0 && (
        <View style={[s.card, { marginBottom: 0 }]}>
          <Text style={s.label}>Recent sessions</Text>
          {data.sessions.slice(0, 8).map((x) => (
            <View
              key={x.id}
              style={[s.spread, { paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.line }]}
            >
              <View>
                <Text style={[s.text, s.semibold]}>{x.type}</Text>
                <Text style={[s.tiny, s.muted]}>
                  {x.date === dstr() ? "Today" : x.date} · {x.durationMin}min · RPE {x.rpe}
                </Text>
              </View>
              <View style={[s.row, { gap: 12 }]}>
                <Text style={[s.big, { fontSize: 20 }]}>{sessionLoad(x)}</Text>
                <Pressable
                  onPress={() => delSession(x.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${x.type} session`}
                  hitSlop={8}
                >
                  <X size={16} color={colors.muted} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
