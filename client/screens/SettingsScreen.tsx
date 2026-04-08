import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Switch,
  Pressable,
  ScrollView,
  Image,
  Modal,
} from "react-native";

import appIcon from "../../assets/images/icon.png";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import {
  getGameState,
  saveSoundEnabled,
  saveHapticsEnabled,
  GameState,
} from "@/lib/storage";
import { useNightMode } from "@/contexts/NightModeContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRIVACY_POLICY = `Privacy Policy

Last updated: April 2026

HHD Apps ("we", "our", or "us") built Flip One as a free game. This Privacy Policy explains how we handle information when you use our app.

1. Information We Collect
Flip One does not collect any personally identifiable information. We do not require registration or login.

The app uses:
• Advertising (Google AdMob): AdMob may collect device identifiers and usage data to serve relevant ads. See Google's Privacy Policy for details.
• In-App Purchases (RevenueCat): Purchase transactions are handled securely. RevenueCat may collect transaction data.
• Local Storage: Game progress, scores, and settings are stored locally on your device only.
• Leaderboard: If you submit a score, a username and anonymous device ID are stored on our server.

2. How We Use Information
• To display relevant advertisements
• To process in-app purchases
• To maintain the global leaderboard

3. Third-Party Services
• Google AdMob: https://policies.google.com/privacy
• RevenueCat: https://www.revenuecat.com/privacy

4. Children's Privacy
Flip One is not directed to children under 13. We do not knowingly collect data from children under 13.

5. Data Security
We take reasonable steps to protect any data stored on our servers. Local device data is managed by your device's security.

6. Changes to This Policy
We may update this policy. Changes will be posted within the app.

7. Contact Us
If you have questions about this Privacy Policy, please contact us at:
hhdapps.team@gmail.com`;

const TERMS_OF_USE = `Terms of Use

Last updated: April 2026

By downloading or using Flip One, you agree to the following terms.

1. Use of the App
Flip One is provided for personal, non-commercial entertainment. You agree not to:
• Reverse engineer, decompile, or hack the app
• Use cheats, bots, or automation tools
• Attempt to manipulate the leaderboard fraudulently

2. In-App Purchases
• Purchases are processed through Google Play and RevenueCat
• All purchases are final unless required by law
• Purchased items (like Remove Ads) are tied to your Google account
• Use "Restore Purchases" if you reinstall the app

3. Advertisements
The free version of Flip One displays advertisements provided by Google AdMob. Purchasing "Remove Ads" disables all ads permanently.

4. Intellectual Property
All game content, graphics, sounds, and code are the property of HHD Apps. You may not reproduce or distribute any part of the app without written permission.

5. Leaderboard
• The leaderboard is a global feature open to all players
• We reserve the right to remove offensive usernames
• We are not responsible for inaccurate scores caused by technical issues

6. Disclaimer
Flip One is provided "as is" without warranty of any kind. We are not liable for any damages arising from the use of the app.

7. Changes to Terms
We reserve the right to update these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.

8. Contact Us
For questions or concerns, contact us at:
hhdapps.team@gmail.com`;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const { isNightMode, themeMode, setThemeMode, backgroundGradient, textColor, textSecondaryColor, textMutedColor } = useNightMode();
  const [legalModal, setLegalModal] = useState<null | "privacy" | "terms">(null);

  useEffect(() => {
    loadGameState();
  }, []);

  const loadGameState = async () => {
    const state = await getGameState();
    setGameState(state);
  };

  const handleSoundToggle = async (value: boolean) => {
    await saveSoundEnabled(value);
    setGameState((prev) => (prev ? { ...prev, soundEnabled: value } : null));
  };

  const handleHapticsToggle = async (value: boolean) => {
    await saveHapticsEnabled(value);
    setGameState((prev) => (prev ? { ...prev, hapticsEnabled: value } : null));
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleThemeModeChange = async (mode: "system" | "light" | "dark") => {
    await setThemeMode(mode);
    setGameState((prev) => (prev ? { ...prev, nightMode: mode === "dark" } : null));
  };

  return (
    <LinearGradient
      colors={backgroundGradient}
      style={[styles.container, { paddingTop: headerHeight + Spacing.lg }]}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(0).springify()}>
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textMutedColor }]}>Gameplay</ThemedText>

            <SettingRow
              icon="volume-2"
              title="Sound Effects"
              description="Play sounds during gameplay"
              colors={[GameColors.primary, GameColors.primaryGlow]}
              textColor={textColor}
              textMutedColor={textMutedColor}
            >
              <Switch
                value={gameState?.soundEnabled ?? true}
                onValueChange={handleSoundToggle}
                trackColor={{
                  false: GameColors.surface,
                  true: GameColors.primary + "60",
                }}
                thumbColor={
                  gameState?.soundEnabled ? GameColors.primary : GameColors.textMuted
                }
                testID="switch-sound"
              />
            </SettingRow>

            <SettingRow
              icon="smartphone"
              title="Haptic Feedback"
              description="Vibrate on flips and actions"
              colors={[GameColors.secondary, GameColors.secondaryGlow]}
              textColor={textColor}
              textMutedColor={textMutedColor}
            >
              <Switch
                value={gameState?.hapticsEnabled ?? true}
                onValueChange={handleHapticsToggle}
                trackColor={{
                  false: GameColors.surface,
                  true: GameColors.secondary + "60",
                }}
                thumbColor={
                  gameState?.hapticsEnabled ? GameColors.secondary : GameColors.textMuted
                }
                testID="switch-haptics"
              />
            </SettingRow>

            <View style={styles.themeSection}>
              <View style={styles.themeLabelRow}>
                <LinearGradient
                  colors={[GameColors.candy4, GameColors.primaryGlow]}
                  style={styles.settingIcon}
                >
                  <Feather name="moon" size={18} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.settingInfo}>
                  <ThemedText style={[styles.settingTitle, { color: textColor }]}>Theme</ThemedText>
                  <ThemedText style={[styles.settingDescription, { color: textMutedColor }]}>Choose your display mode</ThemedText>
                </View>
              </View>
              <View style={styles.themeOptions}>
                <ThemeOption
                  icon="smartphone"
                  label="System"
                  isActive={themeMode === "system"}
                  onPress={() => handleThemeModeChange("system")}
                  textColor={textColor}
                  textMutedColor={textMutedColor}
                />
                <ThemeOption
                  icon="sun"
                  label="Light"
                  isActive={themeMode === "light"}
                  onPress={() => handleThemeModeChange("light")}
                  textColor={textColor}
                  textMutedColor={textMutedColor}
                />
                <ThemeOption
                  icon="moon"
                  label="Dark"
                  isActive={themeMode === "dark"}
                  onPress={() => handleThemeModeChange("dark")}
                  textColor={textColor}
                  textMutedColor={textMutedColor}
                />
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textMutedColor }]}>Legal</ThemedText>

            <SettingButton
              icon="shield"
              title="Privacy Policy"
              colors={[GameColors.candy4, GameColors.primaryGlow]}
              onPress={() => setLegalModal("privacy")}
              textColor={textColor}
            />
            <SettingButton
              icon="file-text"
              title="Terms of Use"
              colors={[GameColors.candy5, GameColors.secondaryGlow]}
              onPress={() => setLegalModal("terms")}
              textColor={textColor}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textMutedColor }]}>About</ThemedText>

            <LinearGradient
              colors={isNightMode ? ["#2A2A35", "#1A1A25"] : [GameColors.surfaceLight, GameColors.surface]}
              style={styles.aboutCard}
            >
              <Image source={appIcon} style={styles.aboutLogo} />
              <ThemedText style={[styles.appName, { color: textColor }]}>Flip One</ThemedText>
              <ThemedText style={[styles.appVersion, { color: textMutedColor }]}>Version 1.0.9</ThemedText>
              <ThemedText style={[styles.developerText, { color: textSecondaryColor }]}>© 2026 HHD Apps</ThemedText>
              <ThemedText style={[styles.contactText, { color: textMutedColor }]}>hhdapps.team@gmail.com</ThemedText>
            </LinearGradient>
          </View>
        </Animated.View>
      </ScrollView>

      <LegalModal
        visible={legalModal !== null}
        title={legalModal === "privacy" ? "Privacy Policy" : "Terms of Use"}
        content={legalModal === "privacy" ? PRIVACY_POLICY : TERMS_OF_USE}
        onClose={() => setLegalModal(null)}
        isNightMode={isNightMode}
        textColor={textColor}
        textMutedColor={textMutedColor}
      />
    </LinearGradient>
  );
}

interface LegalModalProps {
  visible: boolean;
  title: string;
  content: string;
  onClose: () => void;
  isNightMode: boolean;
  textColor: string;
  textMutedColor: string;
}

function LegalModal({ visible, title, content, onClose, isNightMode, textColor, textMutedColor }: LegalModalProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: isNightMode ? "#1A1A25" : "#F5F0E8" }]}>
        <View style={[styles.modalHeader, { borderBottomColor: isNightMode ? "#2A2A35" : "#E0D8CC" }]}>
          <ThemedText style={[styles.modalTitle, { color: textColor }]}>{title}</ThemedText>
          <Pressable onPress={onClose} style={styles.modalCloseBtn} testID="button-close-legal">
            <Feather name="x" size={22} color={textMutedColor} />
          </Pressable>
        </View>
        <ScrollView
          contentContainerStyle={[styles.modalContent, { paddingBottom: insets.bottom + Spacing.xl }]}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText style={[styles.modalText, { color: textColor }]}>{content}</ThemedText>
        </ScrollView>
      </View>
    </Modal>
  );
}

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  colors: readonly [string, string, ...string[]];
  children: React.ReactNode;
  textColor: string;
  textMutedColor: string;
}

function SettingRow({ icon, title, description, colors, children, textColor, textMutedColor }: SettingRowProps) {
  return (
    <LinearGradient
      colors={[GameColors.surfaceLight, GameColors.surface]}
      style={styles.settingRow}
    >
      <LinearGradient
        colors={colors}
        style={styles.settingIcon}
      >
        <Feather name={icon} size={18} color="#FFFFFF" />
      </LinearGradient>
      <View style={styles.settingInfo}>
        <ThemedText style={[styles.settingTitle, { color: textColor }]}>{title}</ThemedText>
        <ThemedText style={[styles.settingDescription, { color: textMutedColor }]}>{description}</ThemedText>
      </View>
      {children}
    </LinearGradient>
  );
}

interface SettingButtonProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  colors: readonly [string, string, ...string[]];
  onPress: () => void;
  textColor?: string;
}

function SettingButton({ icon, title, colors, onPress, textColor }: SettingButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10 });
      }}
    >
      <LinearGradient
        colors={[GameColors.surfaceLight, GameColors.surface]}
        style={styles.settingButton}
      >
        <LinearGradient
          colors={colors}
          style={styles.settingIcon}
        >
          <Feather name={icon} size={18} color="#FFFFFF" />
        </LinearGradient>
        <ThemedText style={[styles.settingButtonText, textColor ? { color: textColor } : undefined]}>{title}</ThemedText>
        <Feather name="chevron-right" size={20} color={GameColors.textMuted} />
      </LinearGradient>
    </AnimatedPressable>
  );
}

interface ThemeOptionProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  isActive: boolean;
  onPress: () => void;
  textColor: string;
  textMutedColor: string;
}

function ThemeOption({ icon, label, isActive, onPress, textColor, textMutedColor }: ThemeOptionProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.themeOptionButton, animatedStyle]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10 });
      }}
      testID={`button-theme-${label.toLowerCase()}`}
    >
      <LinearGradient
        colors={isActive ? [GameColors.candy4, GameColors.primaryGlow] : [GameColors.surfaceLight, GameColors.surface]}
        style={styles.themeOptionGradient}
      >
        <Feather name={icon} size={18} color={isActive ? "#FFFFFF" : textMutedColor} />
        <ThemedText style={[styles.themeOptionText, { color: isActive ? "#FFFFFF" : textColor }]}>
          {label}
        </ThemedText>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: GameColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: GameColors.textPrimary,
  },
  settingDescription: {
    fontSize: 12,
    color: GameColors.textMuted,
    marginTop: 2,
  },
  settingButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: Spacing.sm,
  },
  settingButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: GameColors.textPrimary,
  },
  themeSection: {
    backgroundColor: GameColors.surfaceLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  themeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  themeOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  themeOptionButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  themeOptionGradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: 4,
    borderRadius: BorderRadius.md,
  },
  themeOptionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  aboutCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  aboutLogo: {
    width: 60,
    height: 60,
    borderRadius: 15,
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: 22,
    fontWeight: "800",
  },
  appVersion: {
    fontSize: 13,
    color: GameColors.textMuted,
    marginTop: 0,
  },
  developerText: {
    fontSize: 12,
    color: GameColors.textSecondary,
    marginTop: 0,
    fontWeight: "600",
  },
  contactText: {
    fontSize: 11,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
  },
  modalCloseBtn: {
    padding: Spacing.sm,
  },
  modalContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  modalText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
