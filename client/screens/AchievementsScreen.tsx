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
} from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { GameColors, Spacing, BorderRadius } from "@/constants/theme";
import { getGameState, Achievement } from "@/lib/storage";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useNightMode } from "@/contexts/NightModeContext";

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { backgroundGradient } = useNightMode();
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const state = await getGameState();
    setAchievements(state.achievements);
    setPoints(state.points);
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalRewards = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.reward, 0);

  return (
    <View style={styles.container}>
      <LinearGradient colors={backgroundGradient} style={StyleSheet.absoluteFill} />
      
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
        <ThemedText style={styles.title}>Achievements</ThemedText>
        <View style={styles.pointsBadge}>
          <Feather name="star" size={16} color={GameColors.gold} />
          <ThemedText style={styles.pointsText}>{points}</ThemedText>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBadge}>
          <ThemedText style={styles.statNumber}>{unlockedCount}/{achievements.length}</ThemedText>
          <ThemedText style={styles.statLabel}>Unlocked</ThemedText>
        </View>
        <View style={styles.statBadge}>
          <ThemedText style={styles.statNumber}>{totalRewards}</ThemedText>
          <ThemedText style={styles.statLabel}>Points Earned</ThemedText>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </ScrollView>
    </View>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
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
                <Feather name="star" size={14} color={GameColors.gold} />
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
    color: GameColors.gold,
  },
  statLabel: {
    fontSize: 12,
    color: GameColors.textMuted,
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
    color: "#FFFFFF",
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 12,
    color: GameColors.textMuted,
  },
  textLocked: {
    color: "#666",
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: "700",
    color: GameColors.gold,
  },
});
