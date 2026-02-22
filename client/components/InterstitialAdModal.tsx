import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { showInterstitialAd, loadInterstitialAd, isAdMobAvailable } from "@/lib/ads";

const { width } = Dimensions.get("window");

const AD_DURATION = 3;

interface InterstitialAdModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function InterstitialAdModal({ visible, onClose }: InterstitialAdModalProps) {
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [canClose, setCanClose] = useState(false);

  const progressWidth = useSharedValue(0);
  const pulseOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (visible) {
      if (isAdMobAvailable()) {
        showRealAd();
      } else {
        showSimulatedAd();
      }
    }
  }, [visible]);

  const showRealAd = async () => {
    try {
      await loadInterstitialAd();
      const shown = await showInterstitialAd();
      if (shown) {
        onClose();
      } else {
        showSimulatedAd();
      }
    } catch {
      showSimulatedAd();
    }
  };

  const showSimulatedAd = () => {
    setCountdown(AD_DURATION);
    setCanClose(false);
    progressWidth.value = 0;

    progressWidth.value = withTiming(1, { duration: AD_DURATION * 1000 });
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 600 }),
        withTiming(0.2, { duration: 600 })
      ),
      -1,
      true
    );

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={canClose ? onClose : undefined}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={[GameColors.backgroundGradientStart, GameColors.backgroundGradientEnd]}
          style={styles.container}
        >
          <Animated.View style={[styles.pulseBackground, pulseStyle]}>
            <LinearGradient
              colors={["#9C27B0", "#7B1FA2"]}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          <View style={styles.content}>
            <Feather name="tv" size={60} color={GameColors.gold} />

            <ThemedText style={styles.title}>
              {canClose ? "Ad Complete!" : "Advertisement"}
            </ThemedText>

            <ThemedText style={styles.subtitle}>
              {canClose ? "Tap to continue" : "Game continues after ad..."}
            </ThemedText>

            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <Animated.View style={[styles.progressFill, progressStyle]}>
                  <LinearGradient
                    colors={[GameColors.gold, GameColors.goldGlow]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </View>
              <ThemedText style={styles.countdownText}>
                {canClose ? "Ready!" : `${countdown}s`}
              </ThemedText>
            </View>

            {canClose ? (
              <Pressable style={styles.closeButton} onPress={onClose}>
                <LinearGradient
                  colors={[GameColors.success, GameColors.successGlow]}
                  style={styles.closeButtonGradient}
                >
                  <Feather name="play" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.closeButtonText}>Continue</ThemedText>
                </LinearGradient>
              </Pressable>
            ) : null}

            {!isAdMobAvailable() ? (
              <ThemedText style={styles.disclaimerText}>
                Simulated ad. Real ads work in production build.
              </ThemedText>
            ) : null}
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  container: {
    width: "100%",
    maxWidth: width - Spacing.xl * 2,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  pulseBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.xl,
  },
  content: {
    padding: Spacing["2xl"],
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: Spacing.xl,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  progressBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  countdownText: {
    fontSize: 16,
    fontWeight: "700",
    color: GameColors.gold,
    marginTop: Spacing.md,
  },
  closeButton: {
    width: "100%",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginTop: Spacing.md,
  },
  closeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  disclaimerText: {
    fontSize: 11,
    color: GameColors.textMuted,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: Spacing.md,
  },
});
