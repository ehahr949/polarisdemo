import { Settings, X } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { s } from "../theme/styles";

export function Header({
  tab,
  name,
  goalDays,
  onToggleSettings,
}: {
  tab: string;
  name: string;
  goalDays: number | null;
  onToggleSettings: () => void;
}) {
  const settingsOpen = tab === "settings";
  const kicker = settingsOpen ? "Setup" : name ? `${name}'s file` : "Pro pathway";
  return (
    <View style={s.head}>
      <View>
        <Text style={s.kicker}>{kicker}</Text>
        <Text style={s.brand}>
          POL<Text style={{ color: colors.go }}>★</Text>RIS
        </Text>
      </View>
      <View style={[s.row, { gap: 10 }]}>
        {goalDays != null && !settingsOpen && (
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[s.big, { fontSize: 22, color: colors.go }]}>{goalDays}</Text>
            <Text style={[s.kicker, { fontSize: 10 }]}>days to goal</Text>
          </View>
        )}
        <Pressable
          style={s.iconbtn}
          onPress={onToggleSettings}
          accessibilityRole="button"
          accessibilityLabel={settingsOpen ? "Close settings" : "Open settings"}
        >
          {settingsOpen ? (
            <X size={18} color={colors.muted} />
          ) : (
            <Settings size={18} color={colors.muted} />
          )}
        </Pressable>
      </View>
    </View>
  );
}
