import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Switch,
  Pressable,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [gameState, setGameState] = useState<GameState | null>(null);

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

  return (
    <ScrollView
      style={[
        styles.container,
        { paddingTop: headerHeight + Spacing.lg },
      ]}
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
          >
            <Switch
              value={gameState?.soundEnabled ?? true}
              onValueChange={handleSoundToggle}
              trackColor={{
                false: GameColors.surface,
                true: GameColors.primary + "80",
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
          >
            <Switch
              value={gameState?.hapticsEnabled ?? true}
              onValueChange={handleHapticsToggle}
              trackColor={{
                false: GameColors.surface,
                true: GameColors.primary + "80",
              }}
              thumbColor={
                gameState?.hapticsEnabled ? GameColors.primary : GameColors.textMuted
              }
              testID="switch-haptics"
            />
          </SettingRow>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).springify()}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Premium</ThemedText>

          <PurchaseRow
            icon="moon"
            title="Night Mode"
            description="Darker theme for night gaming"
            price="$0.99"
            isPurchased={gameState?.nightMode}
            onPress={() => {}}
          />

          <PurchaseRow
            icon="slash"
            title="Remove Ads"
            description="No more interruptions"
            price="$0.99"
            isPurchased={gameState?.adsRemoved}
            onPress={() => {}}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account</ThemedText>

          <SettingButton
            icon="refresh-cw"
            title="Restore Purchases"
            onPress={() => {}}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>About</ThemedText>

          <View style={styles.aboutCard}>
            <ThemedText style={styles.appName}>Flip One</ThemedText>
            <ThemedText style={styles.appVersion}>Version 1.0.0</ThemedText>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

interface SettingRowProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingRow({ icon, title, description, children }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Feather name={icon} size={20} color={GameColors.primary} />
      </View>
      <View style={styles.settingInfo}>
        <ThemedText style={styles.settingTitle}>{title}</ThemedText>
        <ThemedText style={styles.settingDescription}>{description}</ThemedText>
      </View>
      {children}
    </View>
  );
}

interface PurchaseRowProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  price: string;
  isPurchased?: boolean;
  onPress: () => void;
}

function PurchaseRow({
  icon,
  title,
  description,
  price,
  isPurchased,
  onPress,
}: PurchaseRowProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.settingRow, animatedStyle]}
      onPress={isPurchased ? undefined : onPress}
      onPressIn={() => {
        if (!isPurchased) {
          scale.value = withSpring(0.98, { damping: 15 });
        }
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 });
      }}
    >
      <View style={[styles.settingIcon, { backgroundColor: GameColors.gold + "20" }]}>
        <Feather name={icon} size={20} color={GameColors.gold} />
      </View>
      <View style={styles.settingInfo}>
        <ThemedText style={styles.settingTitle}>{title}</ThemedText>
        <ThemedText style={styles.settingDescription}>{description}</ThemedText>
      </View>
      {isPurchased ? (
        <View style={styles.purchasedBadge}>
          <Feather name="check" size={16} color={GameColors.success} />
        </View>
      ) : (
        <View style={styles.priceButton}>
          <ThemedText style={styles.priceText}>{price}</ThemedText>
        </View>
      )}
    </AnimatedPressable>
  );
}

interface SettingButtonProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  onPress: () => void;
}

function SettingButton({ icon, title, onPress }: SettingButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.settingButton, animatedStyle]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 });
      }}
    >
      <Feather name={icon} size={20} color={GameColors.primary} />
      <ThemedText style={styles.settingButtonText}>{title}</ThemedText>
      <Feather name="chevron-right" size={20} color={GameColors.textMuted} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.background,
  },
  section: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: GameColors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: GameColors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: GameColors.textPrimary,
  },
  settingDescription: {
    fontSize: 12,
    color: GameColors.textMuted,
    marginTop: 2,
  },
  purchasedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GameColors.success + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  priceButton: {
    backgroundColor: GameColors.player,
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
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  settingButtonText: {
    flex: 1,
    fontSize: 16,
    color: GameColors.textPrimary,
  },
  aboutCard: {
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    color: GameColors.player,
  },
  appVersion: {
    fontSize: 14,
    color: GameColors.textMuted,
    marginTop: Spacing.xs,
  },
});
