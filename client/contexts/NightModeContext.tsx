import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useColorScheme } from "react-native";
import { getThemeMode, saveThemeMode, saveNightModeEnabled, ThemeMode } from "@/lib/storage";

interface NightModeContextType {
  isNightMode: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleNightMode: (enabled: boolean) => Promise<void>;
  backgroundGradient: [string, string];
  textColor: string;
  textSecondaryColor: string;
  textMutedColor: string;
}

const NightModeContext = createContext<NightModeContextType>({
  isNightMode: false,
  themeMode: "light",
  setThemeMode: async () => {},
  toggleNightMode: async () => {},
  backgroundGradient: ["#F5DEB3", "#D2B48C"],
  textColor: "#000000",
  textSecondaryColor: "#333333",
  textMutedColor: "#555555",
});

const DAY_GRADIENT: [string, string] = ["#F5DEB3", "#D2B48C"];
const NIGHT_GRADIENT: [string, string] = ["#0A0A0F", "#1A1A25"];

export function NightModeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");

  useEffect(() => {
    loadThemeMode();
  }, []);

  const loadThemeMode = async () => {
    const mode = await getThemeMode();
    setThemeModeState(mode);
  };

  const setThemeMode = async (mode: ThemeMode) => {
    await saveThemeMode(mode);
    setThemeModeState(mode);
    const isDark = mode === "dark" || (mode === "system" && systemColorScheme === "dark");
    await saveNightModeEnabled(isDark);
  };

  const toggleNightMode = async (enabled: boolean) => {
    const mode = enabled ? "dark" : "light";
    await setThemeMode(mode);
  };

  let isNightMode = false;
  if (themeMode === "dark") {
    isNightMode = true;
  } else if (themeMode === "system") {
    isNightMode = systemColorScheme === "dark";
  }

  const backgroundGradient = isNightMode ? NIGHT_GRADIENT : DAY_GRADIENT;
  const textColor = isNightMode ? "#FFFFFF" : "#000000";
  const textSecondaryColor = isNightMode ? "#CCCCCC" : "#333333";
  const textMutedColor = isNightMode ? "#AAAAAA" : "#555555";

  return (
    <NightModeContext.Provider value={{ isNightMode, themeMode, setThemeMode, toggleNightMode, backgroundGradient, textColor, textSecondaryColor, textMutedColor }}>
      {children}
    </NightModeContext.Provider>
  );
}

export function useNightMode() {
  return useContext(NightModeContext);
}
