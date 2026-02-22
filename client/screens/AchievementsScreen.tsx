import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { getGameState, Achievement } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useNightMode } from "@/contexts/NightModeContext";

const SPARKLE_COLORS = [GameColors.candy1, GameColors.candy2, GameColors.candy3, GameColors.gold];

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { backgroundGradient, textColor, textSecondaryColor, textMutedColor } = useNightMode();
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [points, setPoints] = useState(0);
  const sparkleOpacity = useSharedValue(0.3);

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
  };

  const loadData = async () => {
    const state = await getGameState();
    setAchievements(state.achievements);
    setPoints(state.points);
  };

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalRewards = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.reward, 0);

  return (
    <View style={styles.container}>
      <LinearGradient colors={backgroundGradient} style={StyleSheet.absoluteFill} />
      
      <View style={styles.sparklesContainer} pointerEvents="none">
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
                backgroundColor: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
              },
            ]}
          />
        ))}
      </View>
      
      <View style={{ height: headerHeight + Spacing.md }} />

      <View style={styles.headerCard}>
        <LinearGradient
          colors={[GameColors.surfaceLight, GameColors.surface]}
          style={styles.headerCardGradient}
        >
          <View style={styles.userStats}>
            <View style={styles.statBox}>
              <LinearGradient
                colors={[GameColors.gold, GameColors.goldGlow]}
                style={styles.statIconBg}
              >
                <Feather name="unlock" size={16} color="#FFF" />
              </LinearGradient>
              <View>
                <ThemedText style={[styles.statBoxLabel, { color: textSecondaryColor }]}>Unlocked</ThemedText>
                <ThemedText style={[styles.statBoxValue, { color: textColor }]}>{unlockedCount}/{achievements.length}</ThemedText>
              </View>
            </View>
            
            <View style={styles.statBox}>
              <LinearGradient
                colors={[GameColors.primary, GameColors.primaryGlow]}
                style={styles.statIconBg}
              >
                <Feather name="star" size={16} color="#FFF" />
              </LinearGradient>
              <View>
                <ThemedText style={[styles.statBoxLabel, { color: textSecondaryColor }]}>Points Earned</ThemedText>
                <ThemedText style={[styles.statBoxValue, { color: textColor }]}>{totalRewards}</ThemedText>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {[...achievements].sort((a, b) => a.reward - b.reward).map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} textColor={textColor} textMutedColor={textMutedColor} />
        ))}
      </ScrollView>
    </View>
  );
}

function AchievementCard({ achievement, textColor, textMutedColor }: { achievement: Achievement; textColor: string; textMutedColor: string }) {
  const scale = useSharedValue(1);
  
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.achievementCard, cardStyle, !achievement.unlocked && styles.achievementLocked]}>
        <LinearGradient
          colors={achievement.unlocked ? [GameColors.gold + "20", GameColors.gold + "10"] : ["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
          style={styles.achievementGradient}
        >
          <View style={[styles.iconContainer, achievement.unlocked && styles.iconUnlocked]}>
            <Feather 
              name={achievement.icon as any} 
              size={24} 
              color={achievement.unlocked ? GameColors.gold : "#666"} 
            />
          </View>
          
          <View style={styles.achievementInfo}>
            <ThemedText style={[styles.achievementTitle, { color: textColor }, !achievement.unlocked && { color: textMutedColor }]}>
              {achievement.title}
            </ThemedText>
            <ThemedText style={[styles.achievementDesc, { color: textColor }, !achievement.unlocked && { color: textMutedColor }]}>
              {achievement.description}
            </ThemedText>
          </View>
          
          <View style={styles.rewardContainer}>
            {achievement.unlocked ? (
              <Feather name="check-circle" size={24} color={GameColors.success} />
            ) : (
              <>
                <Feather name="star" size={14} color="#9C27B0" />
                <ThemedText style={styles.rewardText}>{achievement.reward}</ThemedText>
              </>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
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
  headerCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  headerCardGradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  userStats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
  },
  statBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  statBoxLabel: {
    fontSize: 11,
    color: GameColors.textSecondary,
    textTransform: "uppercase",
  },
  statBoxValue: {
    fontSize: 18,
    fontWeight: "700",
    color: GameColors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  achievementCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconUnlocked: {
    backgroundColor: GameColors.gold + "30",
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 12,
    color: "#000000",
  },
  textLocked: {
    color: "#666666",
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9C27B0",
    lineHeight: 16,
    includeFontPadding: false,
  },
});
