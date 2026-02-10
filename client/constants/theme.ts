import { Platform } from "react-native";

export const GameColors = {
  // Sandy beach background
  background: "#F5E6D3",
  backgroundGradientStart: "#F5E6D3",
  backgroundGradientEnd: "#E8D4C0",
  surface: "#DEC8B0",
  surfaceLight: "#E8D4C0",
  surfaceGlass: "rgba(255, 255, 255, 0.4)",
  
  // Beach/Shell colors
  sandLight: "#F5E6D3",
  sandDark: "#D4B896",
  shellBlue: "#00BCD4",
  shellTurquoise: "#26C6DA",
  
  arcadeGreenDark: "#2E7D32",
  
  player: "#FFD700",
  playerGlow: "#FFC107",
  playerHighlight: "#FFEB3B",
  
  spike: "#F44336",
  spikeGlow: "#E53935",
  platform: "#4CAF50",
  platformGlow: "#66BB6A",
  
  candy1: "#FF5252",
  candy2: "#FF9800",
  candy3: "#FFEB3B",
  candy4: "#8BC34A",
  candy5: "#2196F3",
  candy6: "#9C27B0",
  candyPink: "#E91E63",
  
  arcadeRed: "#E52521",
  arcadeBlue: "#049CD8",
  arcadeYellow: "#FBD000",
  arcadeGreen: "#4CAF50",
  arcadeBrown: "#8B4513",
  arcadeOrange: "#FF9800",
  
  speedBlue: "#0066CC",
  speedGold: "#FFD700",
  speedRed: "#CC0000",
  speedGreen: "#00CC00",
  coinGold: "#FFCC00",
  
  boldRed: "#C62828",
  boldYellow: "#FFD600",
  boldBlue: "#1565C0",
  boldGreen: "#2E7D32",
  boldPink: "#EC407A",
  
  // UI Colors (bright and cheerful)
  primary: "#FF5722",
  primaryGlow: "#FF7043",
  secondary: "#E91E63",
  secondaryGlow: "#F06292",
  success: "#4CAF50",
  successGlow: "#66BB6A",
  danger: "#F44336",
  dangerGlow: "#EF5350",
  warning: "#FFC107",
  gold: "#FFD700",
  goldGlow: "#FFCA28",
  
  textPrimary: "#1A1A1A",
  textSecondary: "#333333",
  textMuted: "#555555",
  
  // Road colors
  trackTop: "#424242",
  trackBottom: "#424242",
  roadAsphalt: "#37474F",
  roadLine: "#FFEB3B",
  roadEdge: "#FFFFFF",
  grassGreen: "#4CAF50",
  
  star: "#FFD700",
  sparkle: "#FFFFFF",
  
  wheelColor: "#212121",
  eyeWhite: "#FFFFFF",
  eyePupil: "#000000",
  
  // Cloud white
  cloudWhite: "#FFFFFF",
  cloudShadow: "#E0E0E0",
};

export const NightModeColors = {
  background: "#0A0A0F",
  backgroundGradientStart: "#0A0A0F",
  backgroundGradientEnd: "#1A1A25",
  surface: "#1A1A25",
  surfaceLight: "#2A2A35",
};

export const SkinColors: Record<string, [string, string, string]> = {
  default: [GameColors.playerHighlight, GameColors.player, GameColors.playerGlow],
  purple: ["#C4A6FF", GameColors.candy4, GameColors.primaryGlow],
  teal: ["#7EEEE6", GameColors.candy2, GameColors.platformGlow],
  pink: ["#FFD1F5", GameColors.candy5, GameColors.secondaryGlow],
  red: ["#FFA6A6", GameColors.candy1, GameColors.spikeGlow],
  green: ["#8CF07F", GameColors.candy6, GameColors.successGlow],
  gold: ["#FFF4C4", "#FFD700", "#B8860B"],
  shadow_ninja: ["#3D3D5C", "#1a1a2e", "#2d1b69"],
  web_crawler: ["#F0A050", "#e67e22", "#f39c12"],
  forest_spirit: ["#5CAB85", "#2d6a4f", "#40916c"],
  steel_bot: ["#D0D8E0", "#b0bec5", "#ffd60a"],
  frost_fox: ["#C4F5FF", "#90e0ef", "#48cae4"],
  kawaii_cat: ["#FFE4E9", "#ffb6c1", "#ff69b4"],
  star_hamster: ["#4D7CC3", "#002855", "#bf0a30"],
};

export const CharacterThemes: Record<string, { primary: string; secondary: string; accent: string; gradientStart: string; gradientEnd: string }> = {
  shadow_ninja: {
    primary: "#1a1a2e",
    secondary: "#2d1b69",
    accent: "#7c3aed",
    gradientStart: "#0f0f1a",
    gradientEnd: "#1a1a2e",
  },
  web_crawler: {
    primary: "#e67e22",
    secondary: "#f39c12",
    accent: "#f1c40f",
    gradientStart: "#7f4510",
    gradientEnd: "#c0690a",
  },
  forest_spirit: {
    primary: "#2d6a4f",
    secondary: "#40916c",
    accent: "#95d5b2",
    gradientStart: "#1b4332",
    gradientEnd: "#2d6a4f",
  },
  steel_bot: {
    primary: "#b0bec5",
    secondary: "#ffd60a",
    accent: "#78909c",
    gradientStart: "#546e7a",
    gradientEnd: "#78909c",
  },
  frost_fox: {
    primary: "#90e0ef",
    secondary: "#48cae4",
    accent: "#caf0f8",
    gradientStart: "#0077b6",
    gradientEnd: "#023e8a",
  },
  kawaii_cat: {
    primary: "#ffb6c1",
    secondary: "#ff69b4",
    accent: "#ffc0cb",
    gradientStart: "#ff85a2",
    gradientEnd: "#ffa6c1",
  },
  star_hamster: {
    primary: "#002855",
    secondary: "#bf0a30",
    accent: "#f0f0f0",
    gradientStart: "#001a38",
    gradientEnd: "#002855",
  },
};

export const Colors = {
  light: {
    text: "#FFFFFF",
    buttonText: "#1A0A2E",
    tabIconDefault: "#687076",
    tabIconSelected: GameColors.primary,
    link: GameColors.primary,
    backgroundRoot: GameColors.background,
    backgroundDefault: GameColors.surface,
    backgroundSecondary: GameColors.surfaceLight,
    backgroundTertiary: "#4D3B6E",
  },
  dark: {
    text: "#FFFFFF",
    buttonText: "#1A0A2E",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: GameColors.primary,
    link: GameColors.primary,
    backgroundRoot: GameColors.background,
    backgroundDefault: GameColors.surface,
    backgroundSecondary: GameColors.surfaceLight,
    backgroundTertiary: "#4D3B6E",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
