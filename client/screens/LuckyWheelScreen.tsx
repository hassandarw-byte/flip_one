import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { canSpinWheel, spinWheel, getGameState } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useNightMode } from "@/contexts/NightModeContext";
import { triggerFlipHaptic } from "@/lib/sounds";

const { width, height } = Dimensions.get("window");

const SPARKLE_COLORS = [GameColors.candy1, GameColors.candy2, GameColors.candy3, GameColors.candy4, GameColors.gold];

const WHEEL_SEGMENTS = [
  { label: "25", color: "#FF6B6B", type: "points" },
  { label: "PWR", color: "#4ECDC4", type: "power" },
  { label: "50", color: "#FFE66D", type: "points" },
  { label: "PWR", color: "#95E1D3", type: "power" },
  { label: "75", color: "#F38181", type: "points" },
  { label: "PWR", color: "#AA96DA", type: "power" },
  { label: "100", color: "#FCBAD3", type: "points" },
  { label: "150", color: "#FFD700", type: "points" },
];

export default function LuckyWheelScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { backgroundGradient } = useNightMode();
  
  const [canSpin, setCanSpin] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState<{ reward: number; type: string } | null>(null);
  const [points, setPoints] = useState(0);
  
  const wheelRotation = useSharedValue(0);
  const rewardScale = useSharedValue(0);
  const rewardOpacity = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0.3);
  const wheelGlow = useSharedValue(0.4);

  useEffect(() => {
    loadData();
    startAnimations();
  }, []);

  const startAnimations = () => {
    sparkleOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    wheelGlow.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  };

  const loadData = async () => {
    const canSpinToday = await canSpinWheel();
    setCanSpin(canSpinToday);
    
    const state = await getGameState();
    setPoints(state.points);
  };

  const handleSpin = async () => {
    if (!canSpin || isSpinning) return;
    
    setIsSpinning(true);
    setReward(null);
    triggerFlipHaptic(true);
    
    const spins = 5 + Math.random() * 3;
    const finalRotation = spins * 360 + Math.random() * 360;
    
    wheelRotation.value = withTiming(finalRotation, {
      duration: 4000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    setTimeout(async () => {
      const result = await spinWheel();
      setReward(result);
      setCanSpin(false);
      setIsSpinning(false);
      
      const state = await getGameState();
      setPoints(state.points);
      
      rewardScale.value = withSpring(1, { damping: 8 });
      rewardOpacity.value = withTiming(1, { duration: 300 });
      
      triggerFlipHaptic(true);
    }, 4000);
  };

  const wheelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wheelRotation.value}deg` }],
  }));

  const rewardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rewardScale.value }],
    opacity: rewardOpacity.value,
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  const wheelGlowStyle = useAnimatedStyle(() => ({
    opacity: wheelGlow.value,
  }));

  const getRewardText = () => {
    if (!reward) return "";
    if (reward.type === "points") return `+${reward.reward} Points!`;
    if (reward.type === "power") return "Free Power!";
    return `+${reward.reward}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={backgroundGradient} style={StyleSheet.absoluteFill} />
      
      <View style={styles.sparklesContainer}>
        {Array.from({ length: 25 }).map((_, i) => (
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
                backgroundColor: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
              },
            ]}
          />
        ))}
      </View>
      
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <ThemedText style={styles.title}>Lucky Wheel</ThemedText>
        <View style={styles.pointsBadge}>
          <Feather name="star" size={16} color={GameColors.gold} />
          <ThemedText style={styles.pointsText}>{points}</ThemedText>
        </View>
      </View>

      <View style={styles.wheelContainer}>
        <Animated.View style={[styles.wheelGlow, wheelGlowStyle]} />
        <Animated.View style={[styles.wheel, wheelAnimatedStyle]}>
          {WHEEL_SEGMENTS.map((segment, index) => {
            const angle = (index * 360) / WHEEL_SEGMENTS.length;
            return (
              <View
                key={index}
                style={[
                  styles.segment,
                  {
                    transform: [
                      { rotate: `${angle}deg` },
                      { translateY: -80 },
                    ],
                  },
                ]}
              >
                <LinearGradient
                  colors={[segment.color, segment.color + "CC"]}
                  style={styles.segmentGradient}
                >
                  <ThemedText style={styles.segmentText}>{segment.label}</ThemedText>
                </LinearGradient>
              </View>
            );
          })}
          <View style={styles.wheelCenter}>
            <LinearGradient
              colors={[GameColors.gold, GameColors.goldGlow]}
              style={styles.wheelCenterGradient}
            />
          </View>
        </Animated.View>
        
        <View style={styles.pointer}>
          <LinearGradient
            colors={["#FF6B6B", "#E63946"]}
            style={styles.pointerGradient}
          />
        </View>
      </View>

      {reward ? (
        <Animated.View style={[styles.rewardContainer, rewardAnimatedStyle]}>
          <LinearGradient
            colors={[GameColors.gold, GameColors.goldGlow]}
            style={styles.rewardBadge}
          >
            <ThemedText style={styles.rewardText}>{getRewardText()}</ThemedText>
          </LinearGradient>
        </Animated.View>
      ) : null}

      <Pressable
        style={[
          styles.spinButton,
          (!canSpin || isSpinning) && styles.spinButtonDisabled,
          { marginBottom: insets.bottom + Spacing.xl },
        ]}
        onPress={handleSpin}
        disabled={!canSpin || isSpinning}
      >
        <LinearGradient
          colors={canSpin && !isSpinning ? [GameColors.success, GameColors.successGlow] : ["#666", "#444"]}
          style={styles.spinButtonGradient}
        >
          <ThemedText style={styles.spinButtonText}>
            {isSpinning ? "Spinning..." : canSpin ? "SPIN!" : "Come Back Tomorrow!"}
          </ThemedText>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: "700",
    color: GameColors.gold,
  },
  wheelContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  wheelGlow: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: GameColors.gold,
    shadowColor: GameColors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
  },
  wheel: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: GameColors.gold,
  },
  segment: {
    position: "absolute",
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  segmentGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  wheelCenter: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
  },
  wheelCenterGradient: {
    width: "100%",
    height: "100%",
  },
  pointer: {
    position: "absolute",
    top: height * 0.25 - 30,
    width: 30,
    height: 40,
    overflow: "hidden",
  },
  pointerGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  rewardContainer: {
    position: "absolute",
    top: height * 0.6,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  rewardBadge: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    shadowColor: GameColors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  rewardText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  spinButton: {
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    shadowColor: GameColors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  spinButtonDisabled: {
    shadowOpacity: 0,
  },
  spinButtonGradient: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
  spinButtonText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
