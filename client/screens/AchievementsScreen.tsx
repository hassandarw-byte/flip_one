import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import PointsBadge from "@/components/PointsBadge";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { getGameState, Achievement } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useNightMode } from "@/contexts/NightModeContext";

const SPARKLE_COLORS = [GameColors.candy1, GameColors.candy2, GameColors.candy3, GameColors.gold];

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { backgroundGradient, textColor } = useNightMode();
  
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
          <ThemedText style={styles.title}>Achievements</ThemedText>
        </View>
        <View style={{ width: 40 }} />
      </View>
      <PointsBadge points={points} />

      <View style={styles.statsRow}>
        <View style={styles.statBadge}>
          <ThemedText style={styles.statNumber}>{unlockedCount}/{achievements.length}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: textColor }]}>Unlocked</ThemedText>
        </View>
        <View style={styles.statBadge}>
          <ThemedText style={styles.statNumber}>{totalRewards}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: textColor }]}>Points Earned</ThemedText>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {[...achievements].sort((a, b) => a.reward - b.reward).map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} textColor={textColor} />
        ))}
      </ScrollView>
    </View>
  );
}

function AchievementCard({ achievement, textColor }: { achievement: Achievement; textColor: string }) {
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
            <ThemedText style={[styles.achievementTitle, !achievement.unlocked && styles.textLocked]}>
              {achievement.title}
            </ThemedText>
            <ThemedText style={[styles.achievementDesc, !achievement.unlocked && styles.textLocked]}>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
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
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  statBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#9C27B0",
  },
  statLabel: {
    fontSize: 12,
    color: "#000000",
    marginTop: Spacing.xs,
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
  },
});
