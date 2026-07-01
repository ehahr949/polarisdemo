import { Activity, Dumbbell, Flame, LucideIcon, Target } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { s } from "../theme/styles";

export type TabKey = "today" | "train" | "fuel" | "path";

const TABS: Array<{ key: TabKey; label: string; Icon: LucideIcon }> = [
  { key: "today", label: "Today", Icon: Activity },
  { key: "train", label: "Train", Icon: Dumbbell },
  { key: "fuel", label: "Fuel", Icon: Flame },
  { key: "path", label: "Path", Icon: Target },
];

export function BottomNav({
  tab,
  onSelect,
  insetBottom,
}: {
  tab: TabKey;
  onSelect: (t: TabKey) => void;
  insetBottom: number;
}) {
  return (
    <View style={[s.nav, { paddingBottom: 8 + insetBottom }]}>
      {TABS.map(({ key, label, Icon }) => {
        const on = tab === key;
        return (
          <Pressable
            key={key}
            style={s.tab}
            onPress={() => onSelect(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={label}
          >
            <Icon size={21} color={on ? colors.go : colors.muted} />
            <Text style={[s.tabTxt, on && { color: colors.go }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
