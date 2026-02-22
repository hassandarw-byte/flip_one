import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { isAdMobAvailable } from "@/lib/ads";

interface BannerAdProps {
  style?: any;
}

export default function BannerAd({ style }: BannerAdProps) {
  const shimmerX = useSharedValue(-1);

  useEffect(() => {
    shimmerX.value = withRepeat(
      withTiming(1, { duration: 3000 }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value * 200 }],
  }));

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={["#FFFFFF", "#F5F5F5"]}
        style={styles.bannerGradient}
      >
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
        <View style={styles.bannerContent}>
          <View style={styles.adLabelContainer}>
            <ThemedText style={styles.adLabel}>AD</ThemedText>
          </View>
          <View style={styles.adTextContainer}>
            <ThemedText style={styles.adTitle}>Flip One Premium</ThemedText>
            <ThemedText style={styles.adSubtitle}>Remove all ads for $0.99</ThemedText>
          </View>
          <View style={styles.adAction}>
            <LinearGradient
              colors={[GameColors.success, GameColors.successGlow]}
              style={styles.adButton}
            >
              <Feather name="zap" size={14} color="#FFF" />
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  bannerGradient: {
    overflow: "hidden",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: "rgba(255,255,255,0.4)",
    transform: [{ skewX: "-20deg" }],
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  adLabelContainer: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: "#1A1A1A",
    letterSpacing: 1,
  },
  adTextContainer: {
    flex: 1,
  },
  adTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  adSubtitle: {
    fontSize: 10,
    color: "#666",
  },
  adAction: {
    alignItems: "center",
  },
  adButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
