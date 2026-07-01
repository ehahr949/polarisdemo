import React from "react";
import { Text, View } from "react-native";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

export interface BarDay {
  load: number;
  lbl: string;
}

/* 7-day training-load bars (plain flex Views — no SVG needed). */
export function BarChart({ days }: { days: BarDay[] }) {
  const maxLoad = Math.max(...days.map((d) => d.load), 1);
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 7, height: 96 }}>
      {days.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
          <View
            accessibilityLabel={`${d.lbl}: load ${d.load}`}
            style={{
              width: "100%",
              height: `${Math.max((d.load / maxLoad) * 100, 3)}%`,
              minHeight: 3,
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5,
              backgroundColor: d.load ? colors.go : colors.panel2,
            }}
          />
          <Text
            style={{
              marginTop: 5,
              fontSize: 10,
              color: colors.muted,
              fontFamily: fonts.regular,
            }}
          >
            {d.lbl}
          </Text>
        </View>
      ))}
    </View>
  );
}
