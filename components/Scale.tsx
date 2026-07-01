import React from "react";
import { Pressable, Text, View } from "react-native";
import { s } from "../theme/styles";

/* 1–5 selector (segmented). */
export function Scale({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  label?: string;
}) {
  return (
    <View style={s.seg}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = value === n;
        return (
          <Pressable
            key={n}
            style={[s.segBtn, on && s.segBtnOn]}
            onPress={() => onChange(n)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${label ? label + " " : ""}${n}${on ? ", selected" : ""}`}
          >
            <Text style={[s.segTxt, on && s.segTxtOn]}>{n}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
