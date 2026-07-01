import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { fonts } from "./fonts";

/* Shared styles ported from the prototype's CSS classes. Screen-specific
   tweaks are applied inline (matching the prototype's inline style usage). */
export const s = StyleSheet.create({
  // layout
  screen: { flex: 1, backgroundColor: colors.ink },
  body: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 112 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  spread: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  // surfaces
  card: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  // text
  label: {
    fontFamily: fonts.condSemibold,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 10,
  },
  big: { fontFamily: fonts.condBold, color: colors.chalk },
  text: { fontFamily: fonts.regular, color: colors.chalk, fontSize: 15 },
  tiny: { fontFamily: fonts.regular, fontSize: 12.5 },
  muted: { color: colors.muted },
  chalk: { color: colors.chalk },
  semibold: { fontFamily: fonts.semibold },
  bold: { fontFamily: fonts.bold },

  // header
  head: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  kicker: {
    fontFamily: fonts.condBold,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    fontSize: 13,
    color: colors.muted,
  },
  brand: { fontFamily: fonts.condBold, fontSize: 26, letterSpacing: 1, color: colors.chalk },
  iconbtn: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  // segmented control
  seg: { flexDirection: "row", gap: 6 },
  segBtn: {
    flex: 1,
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  segBtnOn: { backgroundColor: colors.chalk, borderColor: colors.chalk },
  segTxt: { color: colors.muted, fontSize: 15, fontFamily: fonts.semibold },
  segTxtOn: { color: colors.ink },

  // chip
  chip: {
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  chipOn: { backgroundColor: colors.go, borderColor: colors.go },
  chipTxt: { color: colors.chalk, fontSize: 14, fontFamily: fonts.medium },
  chipTxtOn: { color: colors.ink, fontFamily: fonts.bold },

  // input field
  field: {
    width: "100%",
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.chalk,
    borderRadius: 11,
    paddingVertical: 12,
    paddingHorizontal: 13,
    fontSize: 16,
    fontFamily: fonts.regular,
  },

  // buttons
  btn: {
    width: "100%",
    backgroundColor: colors.go,
    borderRadius: 13,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnTxt: { color: colors.ink, fontSize: 16, fontFamily: fonts.bold },
  btnGhost: { backgroundColor: colors.panel2, borderWidth: 1, borderColor: colors.line },
  btnGhostTxt: { color: colors.chalk },

  // divider
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 12 },

  // bottom nav
  nav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(12,15,20,0.96)",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: "row",
    paddingTop: 8,
    paddingHorizontal: 6,
  },
  tab: { flex: 1, alignItems: "center", gap: 3, paddingVertical: 6 },
  tabTxt: {
    color: colors.muted,
    fontSize: 10.5,
    fontFamily: fonts.semibold,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // stage pill
  stage: {
    fontFamily: fonts.condSemibold,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 20,
    overflow: "hidden",
  },

  // pathway dot
  pdot: { width: 9, height: 9, borderRadius: 5 },
});
