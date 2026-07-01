import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { proteinTarget as calcProtein } from "../lib/engine";
import type { AppData, Profile } from "../lib/types";
import { colors } from "../theme/colors";
import { s } from "../theme/styles";

type SetData = React.Dispatch<React.SetStateAction<AppData>>;

export function Settings({ data, setData }: { data: AppData; setData: SetData }) {
  const [p, setP] = useState<Profile>(data.profile);
  const [saved, setSaved] = useState(false);
  const set = (k: keyof Profile, v: string | number) => {
    setP((x) => ({ ...x, [k]: v }));
    setSaved(false);
  };

  const save = () => {
    const clean: Profile = {
      ...p,
      weightKg: Number(p.weightKg) || 0,
      proteinTarget: Number(p.proteinTarget) || 0,
    };
    setData((d) => ({ ...d, profile: clean }));
    setSaved(true);
  };

  return (
    <View>
      <View style={s.card}>
        <Text style={s.label}>Your file</Text>

        <Text style={[s.tiny, s.muted, { marginBottom: 6 }]}>Name</Text>
        <TextInput
          style={[s.field, { marginBottom: 12 }]}
          value={p.name}
          onChangeText={(v) => set("name", v)}
          placeholder="First name"
          placeholderTextColor={colors.muted}
        />

        <Text style={[s.tiny, s.muted, { marginBottom: 6 }]}>Position</Text>
        <TextInput
          style={[s.field, { marginBottom: 12 }]}
          value={p.position}
          onChangeText={(v) => set("position", v)}
          placeholder="e.g. Winger"
          placeholderTextColor={colors.muted}
        />

        <Text style={[s.tiny, s.muted, { marginBottom: 6 }]}>
          Goal date — when you want to be signed
        </Text>
        <TextInput
          style={[s.field, { marginBottom: 12 }]}
          value={p.goalDate}
          onChangeText={(v) => set("goalDate", v)}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          keyboardType="numbers-and-punctuation"
        />

        <View style={[s.row, { gap: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.tiny, s.muted, { marginBottom: 6 }]}>Weight (kg)</Text>
            <TextInput
              style={s.field}
              value={String(p.weightKg)}
              onChangeText={(v) => {
                setP((x) => ({
                  ...x,
                  weightKg: v as unknown as number,
                  proteinTarget: calcProtein(Number(v) || 0),
                }));
                setSaved(false);
              }}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.tiny, s.muted, { marginBottom: 6 }]}>Protein target (g)</Text>
            <TextInput
              style={s.field}
              value={String(p.proteinTarget)}
              onChangeText={(v) => set("proteinTarget", v as unknown as number)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={[s.tiny, s.muted, { marginTop: 8, marginBottom: 14, lineHeight: 18 }]}>
          Default ≈ 1.8 g/kg, a common range for athletes. Adjust with your own staff.
        </Text>

        <Pressable style={s.btn} onPress={save} accessibilityRole="button">
          <Text style={s.btnTxt}>{saved ? "Saved ✓" : "Save"}</Text>
        </Pressable>
      </View>

      <View style={[s.card, { marginBottom: 0 }]}>
        <Text style={s.label}>About the numbers</Text>
        <Text style={[s.tiny, s.muted, { lineHeight: 21 }]}>
          This is a personal tracking tool, not medical advice. Readiness and the workload ratio are
          well-known sports-science heuristics for managing training load — useful for spotting when
          you're ramping too fast, but no app prevents injury on its own. Anything sharp, localized,
          or persistent: see a doctor or sports-medicine professional.
        </Text>
      </View>
    </View>
  );
}
