import React from "react";
import { Pressable, Text, ViewStyle } from "react-native";
import { s } from "../theme/styles";

/* Selectable pill used for duration / RPE / sleep-hours pickers. */
export function Chip({
  label,
  on,
  onPress,
  style,
  accessibilityLabel,
}: {
  label: string | number;
  on: boolean;
  onPress: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      style={[s.chip, on && s.chipOn, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      accessibilityLabel={accessibilityLabel ?? String(label)}
    >
      <Text style={[s.chipTxt, on && s.chipTxtOn]}>{label}</Text>
    </Pressable>
  );
}
