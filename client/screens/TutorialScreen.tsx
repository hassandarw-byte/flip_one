import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import Svg, { Rect, Line } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { saveHasSeenTutorial } from "@/lib/storage";

const { width } = Dimensions.get("window");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TutorialScreenProps {
  onComplete: () => void;
}

function MiniPlayer({ y, color = GameColors.gold }: { y: number; color?: string }) {
  return (
    <View style={[styles.miniPlayer, { top: y, backgroundColor: color }]}>
      <View style={[styles.miniPlayerEye, { left: 6, top: 4 }]} />
      <View style={[styles.miniPlayerEye, { right: 6, top: 4 }]} />
    </View>
  );
}

function MiniTrack({ y }: { y: number }) {
  return (
    <View style={[styles.miniTrack, { top: y }]}>
      <Svg width={width * 0.7} height={12}>
        <Rect x={0} y={0} width={width * 0.7} height={12} fill="#37474F" rx={2} />
        <Line x1={0} y1={6} x2={width * 0.7} y2={6} stroke="#FFEB3B" strokeWidth={1.5} strokeDasharray="8,6" />
      </Svg>
    </View>
  );
}

export default function TutorialScreen({ onComplete }: TutorialScreenProps) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  
  const playerY = useSharedValue(0);
  const tapScale = useSharedValue(1);
  const arrowOpacity = useSharedValue(1);
  const handY = useSharedValue(0);

  useEffect(() => {
    arrowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1,
      true
    );

    handY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 500 }),
        withTiming(8, { duration: 500 })
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(arrowOpacity);
      cancelAnimation(handY);
      cancelAnimation(playerY);
      cancelAnimation(tapScale);
    };
  }, []);

  useEffect(() => {
    if (step === 1) {
      playerY.value = withRepeat(
        withSequence(
          withTiming(-50, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(50, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(playerY);
      playerY.value = withTiming(0, { duration: 300 });
    }
  }, [step]);

  const playerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: playerY.value }],
  }));

  const tapAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tapScale.value }],
  }));

  const arrowAnimStyle = useAnimatedStyle(() => ({
    opacity: arrowOpacity.value,
  }));

  const handAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: handY.value }],
  }));

  const handleNext = async () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      await saveHasSeenTutorial();
      onComplete();
    }
  };

  const handleSkip = async () => {
    await saveHasSeenTutorial();
    onComplete();
  };

  return (
    <LinearGradient
      colors={[GameColors.backgroundGradientStart, GameColors.backgroundGradientEnd]}
      style={styles.container}
    >
      <View style={[styles.contentArea, { paddingTop: insets.top + Spacing.xl }]}>
        <View style={styles.topBar}>
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === step ? styles.dotActive : null,
                ]}
              />
            ))}
          </View>
          <Pressable onPress={handleSkip} hitSlop={16} testID="button-skip-tutorial">
            <ThemedText style={styles.skipText}>Skip</ThemedText>
          </Pressable>
        </View>

        <View style={styles.stepArea}>
          {step === 0 ? (
            <Animated.View entering={FadeInDown.springify()} style={styles.stepContainer}>
              <View style={styles.demoArea}>
                <MiniTrack y={40} />
                <MiniTrack y={140} />
                <Animated.View style={[styles.playerContainer, playerAnimStyle]}>
                  <MiniPlayer y={80} />
                </Animated.View>
                <Animated.View style={[styles.obstacleDemo, { top: 45 }]}>
                  <Feather name="zap" size={24} color="#FFEB3B" />
                </Animated.View>
                <Animated.View style={[styles.obstacleDemo, { top: 120, left: width * 0.45 }]}>
                  <Feather name="alert-triangle" size={24} color={GameColors.spike} />
                </Animated.View>
              </View>

              <ThemedText style={styles.stepTitle}>Welcome to Flip One!</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Your car moves automatically along the tracks. Avoid obstacles to survive!
              </ThemedText>
            </Animated.View>
          ) : null}

          {step === 1 ? (
            <Animated.View entering={FadeInDown.springify()} style={styles.stepContainer}>
              <View style={styles.demoArea}>
                <MiniTrack y={40} />
                <MiniTrack y={140} />
                <Animated.View style={[styles.playerContainer, playerAnimStyle]}>
                  <MiniPlayer y={80} />
                </Animated.View>

                <Animated.View style={[styles.handIcon, handAnimStyle]}>
                  <Feather name="smartphone" size={48} color="rgba(0,0,0,0.3)" />
                </Animated.View>

                <Animated.View style={[styles.flipArrows, arrowAnimStyle]}>
                  <Feather name="repeat" size={36} color={GameColors.gold} />
                </Animated.View>
              </View>

              <ThemedText style={styles.stepTitle}>Tap to Flip!</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Tap anywhere on the screen to flip gravity 180 degrees. Your car switches between the top and bottom tracks!
              </ThemedText>
            </Animated.View>
          ) : null}

          {step === 2 ? (
            <Animated.View entering={FadeInDown.springify()} style={styles.stepContainer}>
              <View style={styles.tipsContainer}>
                <Animated.View entering={FadeInUp.delay(100)} style={styles.tipRow}>
                  <View style={[styles.tipIcon, { backgroundColor: "#E91E63" }]}>
                    <Feather name="heart" size={20} color="#FFFFFF" />
                  </View>
                  <ThemedText style={styles.tipText}>Collect hearts for +3 bonus points</ThemedText>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(200)} style={styles.tipRow}>
                  <View style={[styles.tipIcon, { backgroundColor: GameColors.gold }]}>
                    <Feather name="star" size={20} color="#FFFFFF" />
                  </View>
                  <ThemedText style={styles.tipText}>Collect stars for +5 bonus points</ThemedText>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(300)} style={styles.tipRow}>
                  <View style={[styles.tipIcon, { backgroundColor: "#9C27B0" }]}>
                    <Feather name="zap" size={20} color="#FFFFFF" />
                  </View>
                  <ThemedText style={styles.tipText}>Use special powers once per day</ThemedText>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(400)} style={styles.tipRow}>
                  <View style={[styles.tipIcon, { backgroundColor: "#2196F3" }]}>
                    <Feather name="trending-up" size={20} color="#FFFFFF" />
                  </View>
                  <ThemedText style={styles.tipText}>Speed increases every 5 levels</ThemedText>
                </Animated.View>
              </View>

              <ThemedText style={styles.stepTitle}>Tips & Tricks</ThemedText>
              <ThemedText style={styles.stepDescription}>
                Time your flips carefully and collect items for bonus points. Good luck!
              </ThemedText>
            </Animated.View>
          ) : null}
        </View>

        <Animated.View entering={FadeIn.delay(500)} style={[styles.bottomSection, { paddingBottom: insets.bottom + Spacing.xl }]}>
          <AnimatedPressable
            style={[styles.nextButton, tapAnimStyle]}
            onPress={handleNext}
            testID="button-tutorial-next"
          >
            <LinearGradient
              colors={step === 2 ? [GameColors.success, "#27AE60"] : [GameColors.primary, GameColors.primaryGlow]}
              style={styles.nextButtonGradient}
            >
              <ThemedText style={styles.nextButtonText}>
                {step === 2 ? "Start Playing!" : "Next"}
              </ThemedText>
              <Feather
                name={step === 2 ? "play" : "arrow-right"}
                size={20}
                color="#FFFFFF"
              />
            </LinearGradient>
          </AnimatedPressable>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  skipText: {
    fontSize: 16,
    color: "rgba(0,0,0,0.5)",
    fontWeight: "600",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  dotActive: {
    backgroundColor: GameColors.primary,
    width: 24,
  },
  stepArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  stepContainer: {
    alignItems: "center",
    width: "100%",
  },
  demoArea: {
    width: width * 0.7,
    height: 200,
    marginBottom: Spacing["2xl"],
    position: "relative",
  },
  miniTrack: {
    position: "absolute",
    left: 0,
    alignItems: "center",
  },
  playerContainer: {
    position: "absolute",
    left: 30,
    zIndex: 5,
  },
  miniPlayer: {
    position: "absolute",
    width: 28,
    height: 20,
    borderRadius: 6,
    left: 0,
  },
  miniPlayerEye: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#1A1A1A",
  },
  obstacleDemo: {
    position: "absolute",
    left: width * 0.3,
  },
  handIcon: {
    position: "absolute",
    bottom: 10,
    right: 20,
    alignItems: "center",
  },
  flipArrows: {
    position: "absolute",
    top: 85,
    right: 30,
  },
  tipsContainer: {
    width: "100%",
    marginBottom: Spacing["2xl"],
    gap: Spacing.md,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  stepDescription: {
    fontSize: 16,
    color: "rgba(0,0,0,0.6)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
  },
  bottomSection: {
    paddingHorizontal: Spacing.sm,
  },
  nextButton: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
