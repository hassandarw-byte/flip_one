import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  FadeIn,
  SlideInDown,
} from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { triggerSuccessHaptic } from "@/lib/sounds";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width } = Dimensions.get("window");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function GameOverScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "GameOver">>();
  
  const { score, bestScore, isNewBest } = route.params;
  
  const scoreScale = useSharedValue(0);
  const newBestScale = useSharedValue(0);

  useEffect(() => {
    scoreScale.value = withDelay(
      300,
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    if (isNewBest) {
      newBestScale.value = withDelay(
        600,
        withSequence(
          withSpring(1.2, { damping: 5 }),
          withSpring(1, { damping: 10 })
        )
      );
      triggerSuccessHaptic(true);
    }
  }, []);

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const newBestAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: newBestScale.value }],
    opacity: newBestScale.value,
  }));

  const handleRetry = () => {
    navigation.replace("Game");
  };

  const handleHome = () => {
    navigation.replace("Home");
  };

  const handleWatchAd = () => {
    // In a real app, this would show an ad
    // For MVP, we just retry
    navigation.replace("Game");
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {Array.from({ length: 30 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.2,
                width: Math.random() * 2 + 1,
                height: Math.random() * 2 + 1,
              },
            ]}
          />
        ))}
      </View>

      <Animated.View
        entering={SlideInDown.duration(500).springify()}
        style={styles.modal}
      >
        <ThemedText style={styles.gameOverText}>GAME OVER</ThemedText>

        <Animated.View style={[styles.scoreContainer, scoreAnimatedStyle]}>
          <ThemedText style={styles.scoreLabel}>SCORE</ThemedText>
          <ThemedText style={styles.scoreValue}>{score}</ThemedText>
        </Animated.View>

        {isNewBest ? (
          <Animated.View style={[styles.newBestBadge, newBestAnimatedStyle]}>
            <Feather name="star" size={16} color={GameColors.gold} />
            <ThemedText style={styles.newBestText}>NEW BEST!</ThemedText>
            <Feather name="star" size={16} color={GameColors.gold} />
          </Animated.View>
        ) : null}

        <View style={styles.bestScoreRow}>
          <Feather name="award" size={20} color={GameColors.gold} />
          <ThemedText style={styles.bestScoreText}>
            Best: {isNewBest ? score : bestScore}
          </ThemedText>
        </View>

        <View style={styles.buttonsContainer}>
          <GameButton
            icon="play"
            label="+1 Life"
            subtitle="Watch Ad"
            onPress={handleWatchAd}
            color={GameColors.success}
            isPrimary
          />

          <View style={styles.buttonRow}>
            <GameButton
              icon="rotate-ccw"
              label="Retry"
              onPress={handleRetry}
              color={GameColors.gold}
            />
            <GameButton
              icon="home"
              label="Home"
              onPress={handleHome}
              color={GameColors.textSecondary}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

interface GameButtonProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  color: string;
  isPrimary?: boolean;
}

function GameButton({
  icon,
  label,
  subtitle,
  onPress,
  color,
  isPrimary,
}: GameButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        styles.gameButton,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        isPrimary ? { backgroundColor: color } : { borderColor: color },
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 });
      }}
      testID={`button-${label.toLowerCase().replace(" ", "-")}`}
    >
      <Feather
        name={icon}
        size={isPrimary ? 24 : 20}
        color={isPrimary ? GameColors.background : color}
      />
      <View style={styles.buttonTextContainer}>
        <ThemedText
          style={[
            styles.buttonLabel,
            isPrimary
              ? { color: GameColors.background }
              : { color: GameColors.textPrimary },
          ]}
        >
          {label}
        </ThemedText>
        {subtitle ? (
          <ThemedText
            style={[
              styles.buttonSubtitle,
              isPrimary
                ? { color: GameColors.background + "CC" }
                : { color: GameColors.textMuted },
            ]}
          >
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  starsContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  star: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  modal: {
    width: width * 0.85,
    backgroundColor: GameColors.surface,
    borderRadius: BorderRadius["2xl"],
    padding: Spacing["3xl"],
    alignItems: "center",
  },
  gameOverText: {
    fontSize: 36,
    fontWeight: "800",
    color: GameColors.danger,
    letterSpacing: 4,
    marginBottom: Spacing.xl,
    textShadowColor: GameColors.danger,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  scoreLabel: {
    fontSize: 14,
    color: GameColors.textMuted,
    letterSpacing: 2,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: "800",
    color: GameColors.textPrimary,
    marginTop: Spacing.xs,
  },
  newBestBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.gold + "20",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  newBestText: {
    fontSize: 14,
    fontWeight: "700",
    color: GameColors.gold,
    letterSpacing: 2,
  },
  bestScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  bestScoreText: {
    fontSize: 18,
    color: GameColors.textSecondary,
  },
  buttonsContainer: {
    width: "100%",
    gap: Spacing.md,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  gameButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  primaryButton: {
    shadowColor: GameColors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  buttonTextContainer: {
    alignItems: "flex-start",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  buttonSubtitle: {
    fontSize: 12,
  },
});
