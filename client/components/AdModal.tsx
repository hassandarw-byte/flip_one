import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  ActivityIndicator,
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
import { showRewardedAd, loadRewardedAd, isAdMobAvailable } from "@/lib/ads";

const { width } = Dimensions.get("window");

interface AdModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
  rewardName: string;
}

const AD_DURATION = 5;

export default function AdModal({ visible, onClose, onComplete, rewardName }: AdModalProps) {
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [adFinished, setAdFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adFailed, setAdFailed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const progressWidth = useSharedValue(0);
  const pulseOpacity = useSharedValue(0.3);
  
  useEffect(() => {
    if (visible) {
      setAdFinished(false);
      setCountdown(AD_DURATION);
      if (isAdMobAvailable()) {
        showRealAd();
      } else {
        showSimulatedAd();
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [visible]);

  const showRealAd = async () => {
    setIsLoading(true);
    setAdFailed(false);
    
    try {
      const loaded = await loadRewardedAd();
      if (!loaded) {
        setAdFailed(true);
        setIsLoading(false);
        return;
      }

      const rewarded = await showRewardedAd();
      setIsLoading(false);
      
      if (rewarded) {
        setAdFinished(true);
      } else {
        setAdFailed(true);
      }
    } catch (error) {
      console.log("Ad error:", error);
      setIsLoading(false);
      setAdFailed(true);
    }
  };

  const showSimulatedAd = () => {
    setCountdown(AD_DURATION);
    setAdFinished(false);
    setAdFailed(false);
    progressWidth.value = 0;
    
    progressWidth.value = withTiming(1, { duration: AD_DURATION * 1000 });
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 500 }),
        withTiming(0.3, { duration: 500 })
      ),
      -1,
      true
    );
    
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setAdFinished(true);
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
  
  const handleClaimReward = () => {
    if (!adFinished) return;
    onComplete();
    onClose();
  };

  const handleRetry = () => {
    if (isAdMobAvailable()) {
      showRealAd();
    } else {
      showSimulatedAd();
    }
  };

  const handleCloseWithoutReward = () => {
    onClose();
  };

  if (isAdMobAvailable() && isLoading) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <LinearGradient
            colors={[GameColors.backgroundGradientStart, GameColors.backgroundGradientEnd]}
            style={styles.container}
          >
            <View style={styles.content}>
              <ActivityIndicator size="large" color={GameColors.gold} />
              <ThemedText style={styles.title}>Loading Ad...</ThemedText>
              <ThemedText style={styles.rewardText}>Please wait</ThemedText>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    );
  }

  if (adFailed) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <LinearGradient
            colors={[GameColors.backgroundGradientStart, GameColors.backgroundGradientEnd]}
            style={styles.container}
          >
            <View style={styles.content}>
              <Feather name="alert-circle" size={80} color={GameColors.spike} />
              <ThemedText style={styles.title}>Ad Not Available</ThemedText>
              <ThemedText style={styles.rewardText}>Please try again later</ThemedText>
              
              <Pressable style={styles.claimButton} onPress={handleRetry}>
                <LinearGradient
                  colors={[GameColors.primary, GameColors.primaryGlow]}
                  style={styles.claimButtonGradient}
                >
                  <Feather name="refresh-cw" size={24} color="#FFFFFF" />
                  <ThemedText style={styles.claimButtonText}>Try Again</ThemedText>
                </LinearGradient>
              </Pressable>
              
              <Pressable onPress={onClose}>
                <ThemedText style={styles.closeText}>Close</ThemedText>
              </Pressable>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    );
  }
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={adFinished ? handleClaimReward : undefined}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={[GameColors.backgroundGradientStart, GameColors.backgroundGradientEnd]}
          style={styles.container}
        >
          <Animated.View style={[styles.pulseBackground, pulseStyle]}>
            <LinearGradient
              colors={[GameColors.primary, GameColors.secondary]}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          
          <View style={styles.content}>
            <Feather 
              name={adFinished ? "check-circle" : "play-circle"} 
              size={80} 
              color={adFinished ? GameColors.success : GameColors.gold} 
            />
            
            <ThemedText style={styles.title}>
              {adFinished ? "Ad Complete!" : "Watching Ad..."}
            </ThemedText>
            
            <ThemedText style={styles.rewardText}>
              {adFinished ? `Claim your ${rewardName}!` : `Reward: ${rewardName}`}
            </ThemedText>

            {!adFinished ? (
              <ThemedText style={styles.watchMessage}>
                Watch the full ad to earn your reward
              </ThemedText>
            ) : null}
            
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
                {adFinished ? "Complete!" : `${countdown}s remaining`}
              </ThemedText>
            </View>

            {adFinished ? (
              <Pressable style={styles.claimButton} onPress={handleClaimReward} testID="button-claim-reward">
                <LinearGradient
                  colors={[GameColors.success, "#27AE60"]}
                  style={styles.claimButtonGradient}
                >
                  <Feather name="gift" size={24} color="#FFFFFF" />
                  <ThemedText style={styles.claimButtonText}>Claim {rewardName}</ThemedText>
                </LinearGradient>
              </Pressable>
            ) : (
              <View style={styles.lockedButton}>
                <Feather name="lock" size={18} color="rgba(255,255,255,0.4)" />
                <ThemedText style={styles.lockedText}>
                  Watch to unlock reward
                </ThemedText>
              </View>
            )}

            {!adFinished ? (
              <Pressable onPress={handleCloseWithoutReward}>
                <ThemedText style={styles.closeText}>Close (no reward)</ThemedText>
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
    backgroundColor: "rgba(0,0,0,0.8)",
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
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  rewardText: {
    fontSize: 16,
    color: GameColors.gold,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  watchMessage: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginBottom: Spacing.lg,
    textAlign: "center",
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
  claimButton: {
    width: "100%",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  claimButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  claimButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  lockedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  lockedText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "600",
  },
  disclaimerText: {
    fontSize: 11,
    color: GameColors.textMuted,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: Spacing.sm,
  },
  closeText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    marginTop: Spacing.sm,
    textAlign: "center",
  },
});
