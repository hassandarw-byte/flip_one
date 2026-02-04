import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getGameState, saveNightModeEnabled } from "@/lib/storage";

interface NightModeContextType {
  isNightMode: boolean;
  toggleNightMode: (enabled: boolean) => Promise<void>;
  backgroundGradient: [string, string];
}

const NightModeContext = createContext<NightModeContextType>({
  isNightMode: false,
  toggleNightMode: async () => {},
  backgroundGradient: ["#29B6F6", "#81D4FA"],
});

const DAY_GRADIENT: [string, string] = ["#29B6F6", "#81D4FA"];
const NIGHT_GRADIENT: [string, string] = ["#0A0A0F", "#1A1A25"];

export function NightModeProvider({ children }: { children: ReactNode }) {
  const [isNightMode, setIsNightMode] = useState(false);

  useEffect(() => {
    loadNightModeState();
  }, []);

  const loadNightModeState = async () => {
    const state = await getGameState();
    setIsNightMode(state.nightMode);
  };

  const toggleNightMode = async (enabled: boolean) => {
    await saveNightModeEnabled(enabled);
    setIsNightMode(enabled);
  };

  const backgroundGradient = isNightMode ? NIGHT_GRADIENT : DAY_GRADIENT;

  return (
    <NightModeContext.Provider value={{ isNightMode, toggleNightMode, backgroundGradient }}>
      {children}
    </NightModeContext.Provider>
  );
}

export function useNightMode() {
  return useContext(NightModeContext);
}
