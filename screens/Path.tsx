import { Plus, Trophy } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { AppData, PathwayItem, PathwayType, Stage } from "../lib/types";
import { colors } from "../theme/colors";
import { s } from "../theme/styles";

type SetData = React.Dispatch<React.SetStateAction<AppData>>;

const STAGES: Array<[Stage, string, string]> = [
  ["researching", "Researching", colors.muted],
  ["outreach", "Outreach sent", colors.blue],
  ["conversation", "In conversation", colors.hold],
  ["trial", "Trial / showcase", colors.purple],
  ["offer", "Offer", colors.go],
];
const TYPE_OPTS: PathwayType[] = ["team", "agent", "league", "coach"];

type Editing = (PathwayItem & { isNew?: boolean }) | null;

export function Path({ data, setData }: { data: AppData; setData: SetData }) {
  const [editing, setEditing] = useState<Editing>(null);

  const grouped = STAGES.map(([k, lbl, color]) => ({
    k,
    lbl,
    color,
    items: data.pathway.filter((p) => p.stage === k),
  }));

  const save = (item: PathwayItem) => {
    setData((d) => {
      const exists = d.pathway.some((p) => p.id === item.id);
      return {
        ...d,
        pathway: exists ? d.pathway.map((p) => (p.id === item.id ? item : p)) : [...d.pathway, item],
      };
    });
    setEditing(null);
  };
  const del = (id: string) => {
    setData((d) => ({ ...d, pathway: d.pathway.filter((p) => p.id !== id) }));
    setEditing(null);
  };
  const advance = (item: PathwayItem) => {
    const idx = STAGES.findIndex((st) => st[0] === item.stage);
    if (idx < STAGES.length - 1) save({ ...item, stage: STAGES[idx + 1][0] });
  };

  return (
    <View>
      {/* Career context (kept accurate — PRD §8.2) */}
      <View style={s.card}>
        <View style={[s.row, { marginBottom: 8 }]}>
          <Trophy size={17} color={colors.go} />
          <Text style={[s.label, { marginBottom: 0 }]}>How entry works now</Text>
        </View>
        <Text style={[s.tiny, s.muted, { lineHeight: 21 }]}>
          The NWSL scrapped its college draft (2025 onward) — you're not "picked" anymore, you
          negotiate directly as a free agent, so getting on a club's scouting radar and earning a
          trial is the game. Trials are time-capped (up to ~56 days if you're U21, ~21 if older). The
          U-18 mechanism and the USL Super League / W League are real stepping-stone routes too.
          Overseas, the top tiers to research: WSL (England), Liga F (Spain), Frauen-Bundesliga
          (Germany), Première Ligue (France), Serie A (Italy), Damallsvenskan (Sweden). Treat the
          entries below as your live pipeline.
        </Text>
      </View>

      {grouped.map(
        (g) =>
          g.items.length > 0 && (
            <View key={g.k} style={{ marginBottom: 16 }}>
              <View style={[s.row, { marginBottom: 8 }]}>
                <View style={[s.pdot, { backgroundColor: g.color }]} />
                <Text style={[s.label, { marginBottom: 0 }]}>{g.lbl}</Text>
                <Text style={[s.tiny, s.muted]}>· {g.items.length}</Text>
              </View>
              {g.items.map((p) => {
                const nextStage = STAGES[STAGES.findIndex((st) => st[0] === p.stage) + 1];
                return (
                  <Pressable
                    key={p.id}
                    style={[s.card, { marginBottom: 8 }]}
                    onPress={() => setEditing(p)}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${p.name}`}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[s.text, s.semibold]}>{p.name}</Text>
                      <Text style={[s.tiny, s.muted, { textTransform: "capitalize", marginTop: 2 }]}>
                        {p.type}
                        {p.region ? ` · ${p.region}` : ""}
                      </Text>
                      {!!p.notes && (
                        <Text style={[s.tiny, s.muted, { marginTop: 6, lineHeight: 18 }]}>{p.notes}</Text>
                      )}
                    </View>
                    {p.stage !== "offer" && nextStage && (
                      <Pressable
                        style={[s.chip, { marginTop: 10, width: "100%" }]}
                        onPress={() => advance(p)}
                        accessibilityRole="button"
                        accessibilityLabel={`Advance ${p.name} to ${nextStage[1]}`}
                      >
                        <Text style={s.chipTxt}>Advance → {nextStage[1]}</Text>
                      </Pressable>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )
      )}

      <Pressable
        style={[s.btn, s.btnGhost]}
        onPress={() =>
          setEditing({
            id: Date.now().toString(),
            name: "",
            type: "team",
            region: "",
            stage: "researching",
            notes: "",
            isNew: true,
          })
        }
        accessibilityRole="button"
      >
        <Plus size={18} color={colors.chalk} />
        <Text style={[s.btnTxt, s.btnGhostTxt]}>Add a contact / target</Text>
      </Pressable>

      {editing && (
        <PathSheet
          item={editing}
          onSave={save}
          onDel={del}
          onClose={() => setEditing(null)}
        />
      )}
    </View>
  );
}

function PathSheet({
  item,
  onSave,
  onDel,
  onClose,
}: {
  item: PathwayItem & { isNew?: boolean };
  onSave: (it: PathwayItem) => void;
  onDel: (id: string) => void;
  onClose: () => void;
}) {
  const [it, setIt] = useState(item);
  const set = (k: keyof PathwayItem, v: string) => setIt((p) => ({ ...p, [k]: v }));

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: colors.panel,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderTopWidth: 1,
            borderTopColor: colors.line,
            paddingHorizontal: 18,
            paddingTop: 18,
            paddingBottom: 28,
            maxHeight: "88%",
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={{ width: 42, height: 4, backgroundColor: colors.line, borderRadius: 3, alignSelf: "center", marginBottom: 14 }} />
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={s.label}>{item.isNew ? "New target" : "Edit target"}</Text>

            <TextInput
              style={[s.field, { marginBottom: 10 }]}
              placeholder="Name (team, agent, coach…)"
              placeholderTextColor={colors.muted}
              value={it.name}
              onChangeText={(v) => set("name", v)}
            />

            <View style={[s.seg, { marginBottom: 10 }]}>
              {TYPE_OPTS.map((t) => {
                const on = it.type === t;
                return (
                  <Pressable
                    key={t}
                    style={[s.segBtn, on && s.segBtnOn]}
                    onPress={() => setIt((p) => ({ ...p, type: t }))}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                  >
                    <Text style={[s.segTxt, on && s.segTxtOn, { fontSize: 13, textTransform: "capitalize" }]}>{t}</Text>
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              style={[s.field, { marginBottom: 10 }]}
              placeholder="Region (USA, England…)"
              placeholderTextColor={colors.muted}
              value={it.region}
              onChangeText={(v) => set("region", v)}
            />

            <Text style={[s.tiny, s.muted, { marginBottom: 6 }]}>Stage</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {STAGES.map(([k, lbl]) => {
                const on = it.stage === k;
                return (
                  <Pressable
                    key={k}
                    style={[s.segBtn, on && s.segBtnOn, { flexBasis: "31%", flexGrow: 1 }]}
                    onPress={() => setIt((p) => ({ ...p, stage: k }))}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                  >
                    <Text style={[s.segTxt, on && s.segTxtOn, { fontSize: 11 }]}>{lbl}</Text>
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              style={[s.field, { marginBottom: 12, minHeight: 76, textAlignVertical: "top" }]}
              placeholder="Notes — contact, last touch, next step…"
              placeholderTextColor={colors.muted}
              value={it.notes}
              onChangeText={(v) => set("notes", v)}
              multiline
            />

            <Pressable
              style={s.btn}
              onPress={() => {
                const { isNew, ...clean } = it;
                onSave(clean);
              }}
              accessibilityRole="button"
            >
              <Text style={s.btnTxt}>Save</Text>
            </Pressable>
            {!item.isNew && (
              <Pressable
                style={[s.btn, s.btnGhost, { marginTop: 8 }]}
                onPress={() => onDel(it.id)}
                accessibilityRole="button"
              >
                <Text style={[s.btnTxt, { color: colors.stop }]}>Delete</Text>
              </Pressable>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
