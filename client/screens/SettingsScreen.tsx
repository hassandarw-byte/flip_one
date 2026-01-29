import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Switch,
  Pressable,
  ScrollView,
  Image,
} from "react-native";

import appIcon from "../../assets/store/app-icon-512.png";
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
  saveAdsRemoved,
  GameState,
} from "@/lib/storage";
import { purchaseProduct, PRODUCT_IDS } from "@/lib/purchases";
import { useNightMode } from "@/contexts/NightModeContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const { isNightMode, toggleNightMode, backgroundGradient } = useNightMode();

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

  const handleNightModeToggle = async (value: boolean) => {
    await toggleNightMode(value);
    setGameState((prev) => (prev ? { ...prev, nightMode: value } : null));
  };

  const handleRemoveAdsPurchase = async () => {
    if (gameState?.adsRemoved) return;
    
    const result = await purchaseProduct(PRODUCT_IDS.REMOVE_ADS);
    if (result.success) {
      await saveAdsRemoved(true);
      setGameState((prev) => (prev ? { ...prev, adsRemoved: true } : null));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
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
            <ThemedText style={styles.sectionTitle}>Gameplay</ThemedText>

            <SettingRow
              icon="volume-2"
              title="Sound Effects"
              description="Play sounds during gameplay"
              colors={[GameColors.primary, GameColors.primaryGlow]}
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

            <SettingRow
              icon="moon"
              title="Night Mode"
              description="Darker theme for night gaming"
              colors={[GameColors.candy4, GameColors.primaryGlow]}
            >
              <Switch
                value={isNightMode}
                onValueChange={handleNightModeToggle}
                trackColor={{
                  false: GameColors.surface,
                  true: GameColors.candy4 + "60",
                }}
                thumbColor={
                  isNightMode ? GameColors.candy4 : GameColors.textMuted
                }
                testID="switch-night-mode"
              />
            </SettingRow>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Premium</ThemedText>

            <PurchaseRow
              icon="slash"
              title="Remove Ads"
              description="No more interruptions"
              price="$0.99"
              isPurchased={gameState?.adsRemoved}
              colors={[GameColors.candy5, GameColors.secondaryGlow]}
              onPress={handleRemoveAdsPurchase}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>About</ThemedText>

            <LinearGradient
              colors={[GameColors.surfaceLight, GameColors.surface]}
              style={styles.aboutCard}
            >
              <Image source={appIcon} style={styles.aboutLogo} />
              <ThemedText style={styles.appName}>Flip One</ThemedText>
              <ThemedText style={styles.appVersion}>Version 1.0.0</ThemedText>
              <ThemedText style={styles.developerText}>© 2026 HHD Apps</ThemedText>
            </LinearGradient>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  colors: readonly [string, string, ...string[]];
  children: React.ReactNode;
}

function SettingRow({ icon, title, description, colors, children }: SettingRowProps) {
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
        <ThemedText style={styles.settingTitle}>{title}</ThemedText>
        <ThemedText style={styles.settingDescription}>{description}</ThemedText>
      </View>
      {children}
    </LinearGradient>
  );
}

interface PurchaseRowProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  price: string;
  isPurchased?: boolean;
  colors: readonly [string, string, ...string[]];
  onPress: () => void;
}

function PurchaseRow({
  icon,
  title,
  description,
  price,
  isPurchased,
  colors,
  onPress,
}: PurchaseRowProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPress={isPurchased ? undefined : onPress}
      onPressIn={() => {
        if (!isPurchased) {
          scale.value = withSpring(0.98, { damping: 15 });
        }
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10 });
      }}
    >
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
          <ThemedText style={styles.settingTitle}>{title}</ThemedText>
          <ThemedText style={styles.settingDescription}>{description}</ThemedText>
        </View>
        {isPurchased ? (
          <View style={styles.purchasedBadge}>
            <Feather name="check" size={16} color={GameColors.success} />
          </View>
        ) : (
          <LinearGradient
            colors={[GameColors.player, GameColors.playerGlow]}
            style={styles.priceButton}
          >
            <ThemedText style={styles.priceText}>{price}</ThemedText>
          </LinearGradient>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

interface SettingButtonProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  colors: readonly [string, string, ...string[]];
  onPress: () => void;
}

function SettingButton({ icon, title, colors, onPress }: SettingButtonProps) {
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
        <ThemedText style={styles.settingButtonText}>{title}</ThemedText>
        <Feather name="chevron-right" size={20} color={GameColors.textMuted} />
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
  purchasedBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GameColors.success + "25",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: GameColors.success + "40",
  },
  priceButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "700",
    color: GameColors.background,
  },
  settingButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  settingButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: GameColors.textPrimary,
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
    color: GameColors.player,
  },
  appVersion: {
    fontSize: 13,
    color: GameColors.textMuted,
    marginTop: Spacing.xs,
  },
  developerText: {
    fontSize: 12,
    color: GameColors.textSecondary,
    marginTop: Spacing.sm,
    fontWeight: "600",
  },
});
