import React from "react";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

/* Readiness dial (0–100), colored by the recommendation band. */
export function Ring({ score, color }: { score: number | null; color: string }) {
  const R = 66;
  const C = 2 * Math.PI * R;
  const pct = score == null ? 0 : score / 100;
  return (
    <Svg
      width={168}
      height={168}
      viewBox="0 0 168 168"
      accessibilityRole="image"
      accessibilityLabel={
        score == null ? "Readiness not yet available" : `Readiness ${score} out of 100`
      }
    >
      <Circle cx={84} cy={84} r={R} fill="none" stroke={colors.panel2} strokeWidth={13} />
      <Circle
        cx={84}
        cy={84}
        r={R}
        fill="none"
        stroke={color}
        strokeWidth={13}
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - pct)}
        transform="rotate(-90 84 84)"
      />
      <SvgText
        x={84}
        y={98}
        textAnchor="middle"
        fill={colors.chalk}
        fontFamily={fonts.condBold}
        fontSize={46}
      >
        {score == null ? "–" : String(score)}
      </SvgText>
      <SvgText
        x={84}
        y={118}
        textAnchor="middle"
        fill={colors.muted}
        fontFamily={fonts.condSemibold}
        fontSize={13}
      >
        READINESS
      </SvgText>
    </Svg>
  );
}
