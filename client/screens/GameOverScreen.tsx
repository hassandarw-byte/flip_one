import React, { useEffect, useState, useMemo } from "react";
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
  Easing,
} from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import AdModal from "@/components/AdModal";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { triggerSuccessHaptic } from "@/lib/sounds";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useNightMode } from "@/contexts/NightModeContext";

const { width, height } = Dimensions.get("window");

const CONFETTI_COLORS = [
  GameColors.candy1, GameColors.candy2, GameColors.candy3, 
  GameColors.candy4, GameColors.candy5, GameColors.gold,
  "#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3"
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ConfettiPiece({ delay, startX }: { delay: number; startX: number }) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  
  const color = useMemo(() => CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)], []);
  const size = useMemo(() => Math.random() * 8 + 6, []);
  const horizontalSwing = useMemo(() => (Math.random() - 0.5) * 100, []);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(height + 50, { duration: 3000, easing: Easing.linear })
    );
    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(startX + horizontalSwing, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(startX - horizontalSwing, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      )
    );
    rotate.value = withDelay(
      delay,
      withRepeat(withTiming(360, { duration: 1000, easing: Easing.linear }), -1, false)
    );
    opacity.value = withDelay(
      delay + 2000,
      withTiming(0, { duration: 1000 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size * 1.5,
          backgroundColor: color,
          borderRadius: 2,
          top: 0,
          left: startX,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function GameOverScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "GameOver">>();
  const { backgroundGradient } = useNightMode();
  
  const { score, bestScore, isNewBest } = route.params;
  
  const [adModalVisible, setAdModalVisible] = useState(false);
  
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
    setAdModalVisible(true);
  };

  const handleAdComplete = () => {
    navigation.replace("Game");
  };

  const confettiPieces = useMemo(() => 
    isNewBest ? Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 1000,
      startX: Math.random() * width,
    })) : [],
  [isNewBest]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={backgroundGradient}
        style={StyleSheet.absoluteFill}
      />

      {isNewBest ? (
        <View style={styles.confettiContainer}>
          {confettiPieces.map((piece) => (
            <ConfettiPiece key={piece.id} delay={piece.delay} startX={piece.startX} />
          ))}
        </View>
      ) : null}

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
          colors={["#FFFFFF", "#FFFFFF"]}
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
                colors={["#2196F3", "#1976D2"]}
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

      <AdModal
        visible={adModalVisible}
        onClose={() => setAdModalVisible(false)}
        onComplete={handleAdComplete}
        rewardName="Extra Life"
      />
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
        <Feather name={icon} size={isPrimary ? 24 : 19} color="#FFFFFF" />
        <View style={styles.buttonTextContainer}>
          <ThemedText style={isPrimary ? styles.buttonLabel : styles.buttonLabelSmall}>{label}</ThemedText>
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
  confettiContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    zIndex: 10,
    overflow: "hidden",
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
    elevation: 4,
  },
  modalGradient: {
    padding: Spacing["2xl"],
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000000",
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
    fontSize: 16,
    color: GameColors.textMuted,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  scoreBadge: {
    paddingHorizontal: Spacing["3xl"],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
    minHeight: 60,
  },
  scoreValue: {
    fontSize: 42,
    fontWeight: "900",
    color: "#9C27B0",
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
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
    fontSize: 18,
    color: GameColors.textSecondary,
    fontWeight: "700",
    textAlign: "center",
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
    elevation: 2,
  },
  primaryButton: {
    elevation: 4,
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
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLabel: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  buttonLabelSmall: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  buttonSubtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
});
