import { Platform } from "react-native";

export const GameColors = {
  background: "#1A0A2E",
  backgroundGradientStart: "#1A0A2E",
  backgroundGradientEnd: "#2D1B4E",
  surface: "#2D1B4E",
  surfaceLight: "#3D2B5E",
  surfaceGlass: "rgba(255, 255, 255, 0.1)",
  
  player: "#FFD93D",
  playerGlow: "#FFC107",
  playerHighlight: "#FFEB99",
  
  spike: "#FF6B6B",
  spikeGlow: "#FF4757",
  platform: "#4ECDC4",
  platformGlow: "#26D0CE",
  
  candy1: "#FF6B6B",
  candy2: "#4ECDC4",
  candy3: "#FFD93D",
  candy4: "#A66CFF",
  candy5: "#FF9FF3",
  candy6: "#54E346",
  
  marioRed: "#E52521",
  marioBlue: "#049CD8",
  marioYellow: "#FBD000",
  marioGreen: "#43B047",
  marioBrown: "#8B4513",
  
  sonicBlue: "#0066CC",
  sonicGold: "#FFD700",
  sonicRed: "#CC0000",
  sonicGreen: "#00CC00",
  
  primary: "#A66CFF",
  primaryGlow: "#8B5CF6",
  secondary: "#FF9FF3",
  secondaryGlow: "#F472B6",
  success: "#54E346",
  successGlow: "#22C55E",
  danger: "#FF6B6B",
  dangerGlow: "#EF4444",
  warning: "#FFD93D",
  gold: "#FFD700",
  goldGlow: "#F59E0B",
  
  textPrimary: "#FFFFFF",
  textSecondary: "#E8D5FF",
  textMuted: "#B794F6",
  
  trackTop: "#FF6B6B",
  trackBottom: "#4ECDC4",
  
  star: "#FFD700",
  sparkle: "#FFFFFF",
  
  wheelColor: "#333333",
  eyeWhite: "#FFFFFF",
  eyePupil: "#000000",
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
  dark_knight: ["#3D3D5C", "#1a1a2e", "#16213e"],
  web_hero: ["#FF7A85", "#e63946", "#1d3557"],
  green_giant: ["#5CAB85", "#2d6a4f", "#40916c"],
  iron_armor: ["#FF6B6B", "#c1121f", "#ffd60a"],
  ice_queen: ["#C4F5FF", "#90e0ef", "#48cae4"],
  kawaii_cat: ["#FFE4E9", "#ffb6c1", "#ff69b4"],
  captain_star: ["#4D7CC3", "#002855", "#bf0a30"],
};

export const CharacterThemes: Record<string, { primary: string; secondary: string; accent: string; gradientStart: string; gradientEnd: string }> = {
  dark_knight: {
    primary: "#1a1a2e",
    secondary: "#16213e",
    accent: "#e94560",
    gradientStart: "#0f0f1a",
    gradientEnd: "#1a1a2e",
  },
  web_hero: {
    primary: "#e63946",
    secondary: "#1d3557",
    accent: "#457b9d",
    gradientStart: "#1d3557",
    gradientEnd: "#2a4a6d",
  },
  green_giant: {
    primary: "#2d6a4f",
    secondary: "#40916c",
    accent: "#95d5b2",
    gradientStart: "#1b4332",
    gradientEnd: "#2d6a4f",
  },
  iron_armor: {
    primary: "#c1121f",
    secondary: "#ffd60a",
    accent: "#780000",
    gradientStart: "#3d0000",
    gradientEnd: "#780000",
  },
  ice_queen: {
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
  captain_star: {
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
