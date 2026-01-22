import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  withTiming,
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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "GameOver">>();
  
  const { score, bestScore, isNewBest } = route.params;
  
  const scoreScale = useSharedValue(0);
  const newBestScale = useSharedValue(0);
  const starRotation = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0.3);

  useEffect(() => {
    scoreScale.value = withDelay(
      300,
      withSpring(1, { damping: 8, stiffness: 100 })
    );

    if (isNewBest) {
      newBestScale.value = withDelay(
        600,
        withSequence(
          withSpring(1.3, { damping: 5 }),
          withSpring(1, { damping: 8 })
        )
      );
      starRotation.value = withRepeat(
        withTiming(360, { duration: 3000 }),
        -1,
        false
      );
      triggerSuccessHaptic(true);
    }

    sparkleOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const newBestAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: newBestScale.value }],
    opacity: newBestScale.value,
  }));

  const starAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${starRotation.value}deg` }],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  const handleRetry = () => {
    navigation.replace("Game");
  };

  const handleHome = () => {
    navigation.replace("Home");
  };

  const handleWatchAd = () => {
    navigation.replace("Game");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(26, 10, 46, 0.95)", "rgba(45, 27, 78, 0.98)"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.sparklesContainer}>
        {Array.from({ length: 20 }).map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.sparkle,
              sparkleStyle,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                backgroundColor: [GameColors.candy1, GameColors.candy2, GameColors.candy3, GameColors.candy4, GameColors.candy5][Math.floor(Math.random() * 5)],
              },
            ]}
          />
        ))}
      </View>

      <Animated.View
        entering={SlideInDown.duration(500).springify()}
        style={styles.modal}
      >
        <LinearGradient
          colors={[GameColors.surfaceLight, GameColors.surface]}
          style={styles.modalGradient}
        >
          <View style={styles.gameOverHeader}>
            <ThemedText style={styles.gameOverText}>GAME OVER</ThemedText>
            <View style={styles.gameOverLine} />
          </View>

          <Animated.View style={[styles.scoreContainer, scoreAnimatedStyle]}>
            <ThemedText style={styles.scoreLabel}>SCORE</ThemedText>
            <LinearGradient
              colors={[GameColors.gold, GameColors.goldGlow]}
              style={styles.scoreBadge}
            >
              <ThemedText style={styles.scoreValue}>{score}</ThemedText>
            </LinearGradient>
          </Animated.View>

          {isNewBest ? (
            <Animated.View style={[styles.newBestBadge, newBestAnimatedStyle]}>
              <Animated.View style={starAnimatedStyle}>
                <Feather name="star" size={18} color={GameColors.gold} />
              </Animated.View>
              <ThemedText style={styles.newBestText}>NEW BEST!</ThemedText>
              <Animated.View style={starAnimatedStyle}>
                <Feather name="star" size={18} color={GameColors.gold} />
              </Animated.View>
            </Animated.View>
          ) : null}

          <View style={styles.bestScoreRow}>
            <Feather name="award" size={22} color={GameColors.gold} />
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
              colors={[GameColors.success, GameColors.successGlow]}
              isPrimary
            />

            <View style={styles.buttonRow}>
              <GameButton
                icon="rotate-ccw"
                label="Retry"
                onPress={handleRetry}
                colors={[GameColors.player, GameColors.playerGlow]}
              />
              <GameButton
                icon="home"
                label="Home"
                onPress={handleHome}
                colors={[GameColors.primary, GameColors.primaryGlow]}
              />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

interface GameButtonProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  colors: readonly [string, string, ...string[]];
  isPrimary?: boolean;
}

function GameButton({
  icon,
  label,
  subtitle,
  onPress,
  colors,
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
        isPrimary && styles.primaryButton,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 10 });
      }}
      testID={`button-${label.toLowerCase().replace(" ", "-")}`}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.buttonGradient}
      >
        <Feather name={icon} size={isPrimary ? 24 : 20} color="#FFFFFF" />
        <View style={styles.buttonTextContainer}>
          <ThemedText style={styles.buttonLabel}>{label}</ThemedText>
          {subtitle ? (
            <ThemedText style={styles.buttonSubtitle}>{subtitle}</ThemedText>
          ) : null}
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GameColors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  sparklesContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  sparkle: {
    position: "absolute",
    borderRadius: 10,
  },
  modal: {
    width: width * 0.88,
    borderRadius: BorderRadius["2xl"],
    overflow: "hidden",
    shadowColor: GameColors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  modalGradient: {
    padding: Spacing["2xl"],
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: BorderRadius["2xl"],
  },
  gameOverHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  gameOverText: {
    fontSize: 32,
    fontWeight: "900",
    color: GameColors.danger,
    letterSpacing: 4,
    textShadowColor: GameColors.danger,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  gameOverLine: {
    width: 80,
    height: 4,
    backgroundColor: GameColors.danger,
    borderRadius: 2,
    marginTop: Spacing.sm,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  scoreLabel: {
    fontSize: 12,
    color: GameColors.textMuted,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  scoreBadge: {
    paddingHorizontal: Spacing["3xl"],
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: "900",
    color: GameColors.background,
  },
  newBestBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GameColors.gold + "25",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: GameColors.gold + "40",
  },
  newBestText: {
    fontSize: 16,
    fontWeight: "800",
    color: GameColors.gold,
    letterSpacing: 2,
  },
  bestScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  bestScoreText: {
    fontSize: 16,
    color: GameColors.textSecondary,
    fontWeight: "600",
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
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButton: {
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  buttonTextContainer: {
    alignItems: "flex-start",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  buttonSubtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },
});
