import {
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_600SemiBold,
  Barlow_700Bold,
} from "@expo-google-fonts/barlow";
import {
  BarlowCondensed_500Medium,
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
  useFonts,
} from "@expo-google-fonts/barlow-condensed";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { BottomNav, TabKey } from "./components/BottomNav";
import { Header } from "./components/Header";
import { dayDiff } from "./lib/dates";
import { seed } from "./lib/seed";
import { loadData, saveData } from "./lib/storage";
import type { AppData } from "./lib/types";
import { Fuel } from "./screens/Fuel";
import { Path } from "./screens/Path";
import { Settings } from "./screens/Settings";
import { Today } from "./screens/Today";
import { Train } from "./screens/Train";
import { colors } from "./theme/colors";
import { s } from "./theme/styles";

type Screen = TabKey | "settings";

function Root() {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    Barlow_700Bold,
    BarlowCondensed_500Medium,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
  });

  const [data, setData] = useState<AppData>(() => seed());
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Screen>("today");

  // Load persisted blob on launch (falls back to the seed already in state).
  useEffect(() => {
    let on = true;
    (async () => {
      const d = await loadData();
      if (on && d) setData(d);
      if (on) setReady(true);
    })();
    return () => {
      on = false;
    };
  }, []);

  // Persist on every change once the initial load has settled.
  useEffect(() => {
    if (ready) saveData(data);
  }, [data, ready]);

  if (!ready || !fontsLoaded) {
    return (
      <View style={[s.screen, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={[s.tiny, s.muted]}>Loading…</Text>
      </View>
    );
  }

  const goalDays = data.profile.goalDate ? dayDiff(data.profile.goalDate) * -1 : null;
  const go = (t: string) => setTab(t as Screen);

  return (
    <View style={[s.screen, { alignItems: "center" }]}>
      <View style={{ flex: 1, width: "100%", maxWidth: 480 }}>
        <View style={{ paddingTop: insets.top, backgroundColor: colors.ink }}>
          <Header
            tab={tab}
            name={data.profile.name}
            goalDays={goalDays}
            onToggleSettings={() => setTab(tab === "settings" ? "today" : "settings")}
          />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.body}
          keyboardShouldPersistTaps="handled"
        >
          {tab === "today" && <Today data={data} setData={setData} go={go} />}
          {tab === "train" && <Train data={data} setData={setData} />}
          {tab === "fuel" && <Fuel data={data} setData={setData} />}
          {tab === "path" && <Path data={data} setData={setData} />}
          {tab === "settings" && <Settings data={data} setData={setData} />}
        </ScrollView>

        {tab !== "settings" && (
          <BottomNav tab={tab} onSelect={(t) => setTab(t)} insetBottom={insets.bottom} />
        )}
      </View>
      <StatusBar style="light" />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  );
}
