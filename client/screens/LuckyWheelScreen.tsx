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
import PointsBadge from "@/components/PointsBadge";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { canSpinWheel, spinWheel, getGameState } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useNightMode } from "@/contexts/NightModeContext";
import { triggerFlipHaptic, playWheelSpinSound } from "@/lib/sounds";
import AdModal from "@/components/AdModal";

const { width, height } = Dimensions.get("window");

const SPARKLE_COLORS = [GameColors.candy1, GameColors.candy2, GameColors.candy3, GameColors.candy4, GameColors.gold];

const WHEEL_SEGMENTS = [
  { label: "25", color: "#FF6B9D", gradient: ["#FF6B9D", "#FF4777"], type: "points" },
  { label: "PWR", color: "#00D4FF", gradient: ["#00D4FF", "#0099CC"], type: "power" },
  { label: "50", color: "#FFD700", gradient: ["#FFD700", "#FFA500"], type: "points" },
  { label: "PWR", color: "#9B59B6", gradient: ["#9B59B6", "#8E44AD"], type: "power" },
  { label: "75", color: "#2ECC71", gradient: ["#2ECC71", "#27AE60"], type: "points" },
  { label: "PWR", color: "#E74C3C", gradient: ["#E74C3C", "#C0392B"], type: "power" },
  { label: "100", color: "#3498DB", gradient: ["#3498DB", "#2980B9"], type: "points" },
  { label: "150", color: "#F39C12", gradient: ["#F39C12", "#E67E22"], type: "points" },
];

export default function LuckyWheelScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { backgroundGradient, textColor } = useNightMode();
  
  const [canSpin, setCanSpin] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState<{ reward: number; type: string } | null>(null);
  const [points, setPoints] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasSpun, setHasSpun] = useState(false);
  const [adModalVisible, setAdModalVisible] = useState(false);
  
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
    setSoundEnabled(state.soundEnabled);
  };

  const handleSpin = async () => {
    if (!canSpin || isSpinning) return;
    
    setIsSpinning(true);
    setReward(null);
    triggerFlipHaptic(true);
    playWheelSpinSound(soundEnabled);
    
    // Pick a random segment first
    const segmentCount = WHEEL_SEGMENTS.length;
    const selectedSegment = Math.floor(Math.random() * segmentCount);
    
    // Calculate rotation to land on that segment (pointer at top)
    const segmentAngle = 360 / segmentCount;
    const targetAngle = selectedSegment * segmentAngle + segmentAngle / 2;
    const spins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = spins * 360 + (360 - targetAngle);
    
    wheelRotation.value = withTiming(finalRotation, {
      duration: 4000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    setTimeout(async () => {
      const result = await spinWheel(selectedSegment);
      setReward(result);
      setCanSpin(false);
      setIsSpinning(false);
      setHasSpun(true);
      
      const state = await getGameState();
      setPoints(state.points);
      
      rewardScale.value = withSpring(1, { damping: 8 });
      rewardOpacity.value = withTiming(1, { duration: 300 });
      
      triggerFlipHaptic(true);
    }, 4000);
  };

  const handleWatchAd = () => {
    setAdModalVisible(true);
  };

  const handleAdComplete = () => {
    setAdModalVisible(false);
    setCanSpin(true);
    setHasSpun(false);
    setReward(null);
    wheelRotation.value = 0;
    rewardScale.value = 0;
    rewardOpacity.value = 0;
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
          <Feather name="arrow-left" size={24} color="#000000" />
        </Pressable>
        <View style={styles.headerCenter}>
          <ThemedText style={styles.title}>Wheel</ThemedText>
        </View>
        <View style={{ width: 40 }} />
      </View>
      <PointsBadge points={points} />

      <View style={styles.wheelContainer}>
        <Animated.View style={[styles.wheelGlow, wheelGlowStyle]} />
        <View style={styles.wheelOuterRing} />
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
                  colors={segment.gradient as [string, string]}
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

      <View style={[styles.buttonsContainer, { marginBottom: insets.bottom + Spacing.xl }]}>
        <Pressable
          style={[
            styles.spinButton,
            (!canSpin || isSpinning) && styles.spinButtonDisabled,
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

        {hasSpun && !canSpin ? (
          <Pressable style={styles.watchAdButton} onPress={handleWatchAd}>
            <LinearGradient
              colors={["#9C27B0", "#7B1FA2"]}
              style={styles.watchAdButtonGradient}
            >
              <Feather name="play-circle" size={20} color="#FFFFFF" />
              <ThemedText style={styles.watchAdButtonText}>Watch Ad for Extra Spin</ThemedText>
            </LinearGradient>
          </Pressable>
        ) : null}
      </View>

      <AdModal
        visible={adModalVisible}
        onClose={() => setAdModalVisible(false)}
        onComplete={handleAdComplete}
        rewardName="Extra Spin"
      />
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
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "400",
    color: "#9C27B0",
    textAlign: "center",
  },
  wheelContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  wheelGlow: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "#9C27B0",
    shadowColor: "#7B1FA2",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
  },
  wheelOuterRing: {
    position: "absolute",
    width: 310,
    height: 310,
    borderRadius: 155,
    borderWidth: 8,
    borderColor: "#9C27B0",
    backgroundColor: "transparent",
    shadowColor: "#7B1FA2",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  wheel: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(20,10,40,0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 6,
    borderColor: "#FFA500",
  },
  segment: {
    position: "absolute",
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  segmentGradient: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  segmentText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1A1A1A",
    textAlign: "center",
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
    color: "#1A1A1A",
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
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  spinButtonText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },
  buttonsContainer: {
    gap: Spacing.md,
  },
  watchAdButton: {
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    shadowColor: "#9C27B0",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  watchAdButtonGradient: {
    flexDirection: "row",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  watchAdButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
